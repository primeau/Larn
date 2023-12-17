const TESTING_CLOUDFLARE_WORKERS = false;
const WATCHERS_TTL = TESTING_CLOUDFLARE_WORKERS ? 30 : 300;
const GAME_TTL = TESTING_CLOUDFLARE_WORKERS ? 60 : 600;
const DEAD_TTL = TESTING_CLOUDFLARE_WORKERS ? 10 : 60;
const USE_D1 = true; // use D1 or KV



export default {
  async fetch(request, env) {
    return await handleErrors(request, async () => {
      let url = new URL(request.url);
      let path = url.pathname.slice(1).split('/');
      switch (path[0]) {
        case "api":
          return handleApiRequest(path.slice(1), request, env);
        default:
          return new Response("Not found", { status: 404 });
      }
    });
  },

  async scheduled(event, env, ctx) {
    if (USE_D1) {
      // keep the recent games table tidy
      let result = await env.DB.prepare(`DELETE FROM recent 
      WHERE 
      (lastmove < unixepoch() * 1000 - ${GAME_TTL * 1000})
      OR
      (gameover = 1 AND lastmove < unixepoch() * 1000 - ${DEAD_TTL * 1000})`
      ).run();

      // keep the watchers table tidy
      result = await env.DB.prepare(`DELETE FROM watchers WHERE lastupdate < unixepoch() * 1000 - ${WATCHERS_TTL * 1000}`).run();
    }
  },
}



async function handleApiRequest(path, request, env) {
  // We've received at API request. Route the request based on the path.

  // my local dev environment wipes out the DB every time i save
  if (TESTING_CLOUDFLARE_WORKERS && USE_D1) {
    await initDatabase(env);
  }

  switch (path[0]) {

    case "gamelist": {

      let gameID = path[1];

      // request to /api/gamelist
      // send a list of active games
      if (!gameID) {
        let liveGamesList = await getListOfActiveGames(env);
        const json = JSON.stringify(liveGamesList);
        // console.log(`list:`, json);
        return new Response(json, {
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } else {

        // request to /api/gamelist/<gameid>
        // store the most recent game data
        if (request.method === `POST` || request.method === `OPTIONS`) {

          try {
            // first check to see if someone is watching this game
            let numWatchers = await getNumWatchers(env, gameID);

            let data = JSON.parse(await request.text()) || `no data`;
            if (data.metadata) {
              data.metadata.watchers = numWatchers;
              await insertActiveGame(env, data.metadata);
            }

            // Get the client's IP address
            let ip = request.headers.get("CF-Connecting-IP") || `0`;

            let somoneIsWatchingYou = {
              watchers: numWatchers,
              ip: ip,
            };

            // console.log(`watching`, JSON.stringify(somoneIsWatchingYou));

            return new Response(JSON.stringify(somoneIsWatchingYou), {
              headers: { "Access-Control-Allow-Origin": "*", },
            });
          } catch (error) {
            console.error(`oops`, error);
          }
        }

      }
    }

    case "game": {
      // Request for `/api/game/...`.
      if (!path[1]) {
        // The request is for just "/api/game", with no ID.
        if (request.method == "POST") {
          // POST to /api/game creates a game instance
          let id = env.games.newUniqueId();
          return new Response(id.toString(), { headers: { "Access-Control-Allow-Origin": "*" } });
        } else {
          return new Response("Method not allowed", { status: 405 });
        }
      }

      // OK, the request is for `/api/game/<gameID>/...`. It's time to route to the Durable Object
      // for the specific game.
      let gameID = path[1];

      if (!env.games) {
        return new Response("durable object error", { status: 503 });
      }

      // Each Durable Object has a 256-bit unique ID. 
      let id = env.games.idFromName(gameID);

      // keep track of durable objects
      // TODO clean up old DOs somehow?
      await env.larn_tv_watchers.put(id.toString(), gameID);

      // Get the Durable Object stub for this game
      let gameObject = env.games.get(id);

      // Compute a new URL with `/api/game/<gameID>` removed. We'll forward the rest of the path
      // to the Durable Object.
      let newUrl = new URL(request.url);
      newUrl.pathname = "/" + path.slice(2).join("/");

      // Send the request to the object. The `fetch()` method of a Durable Object stub has the
      // same signature as the global `fetch()` function, but the request is always sent to the
      // object, regardless of the request's URL.
      return gameObject.fetch(newUrl, request);
    }

    default:
      return new Response("Not found", { status: 404 });
  }
}



// `handleErrors()` is a little utility function that can wrap an HTTP request handler in a
// try/catch and return errors to the client. You probably wouldn't want to use this in production
// code but it is convenient when debugging and iterating.
async function handleErrors(request, func) {
  try {
    return await func();
  } catch (err) {
    if (request.headers.get("Upgrade") == "websocket") {
      // Annoyingly, if we return an HTTP error in response to a WebSocket request, Chrome devtools
      // won't show us the response body! So... let's send a WebSocket response with an error
      // frame instead.
      let pair = new WebSocketPair();
      pair[1].accept();
      pair[1].send(JSON.stringify({ error: err.stack }));
      pair[1].close(1011, "Uncaught exception during session setup");
      return new Response(null, { status: 101, webSocket: pair[0] });
    } else {
      return new Response(err.stack, { status: 500 });
    }
  }
}



// GameSession implements a Durable Object that coordinates an individual game broadcast. 
// Participants connect to the session using WebSockets, and it broadcasts messages from 
// each participant to all others.
export class GameSession {
  constructor(controller, env) {
    // `controller.storage` provides a simple KV get()/put() interface to our durable storage.
    this.storage = controller.storage;

    // `env` is our environment bindings (discussed earlier).
    this.env = env;

    // We will put the WebSocket objects for each client, and some metadata, into `sessions`.
    this.sessions = [];

    this.lastFrame; // rather than use storage, we can put the last frame in a variable
    // this.ip = ``; // save to send back to larn
    this.env.watchlist = []; // list of larntv sessions watching
    this.env.lastExpiryTime = []; // for making sure watchlist doesn't expire from kv
  }

  // The system will call fetch() whenever an HTTP request is sent to this Object. Such requests
  // can only be sent from other Worker code, such as the code above; these requests don't come
  // directly from the internet. 
  async fetch(request) {
    return await handleErrors(request, async () => {
      let url = new URL(request.url);

      switch (url.pathname) {
        case "/websocket": {
          // The request is to `/api/game/<gameID>/websocket`. A client is trying to establish a new
          // WebSocket session.
          if (request.headers.get("Upgrade") != "websocket") {
            return new Response("expected websocket", { status: 400 });
          }

          // // Get the client's IP address
          // this.ip = request.headers.get("CF-Connecting-IP");

          // To accept the WebSocket request, we create a WebSocketPair (which is like a socketpair,
          // i.e. two WebSockets that talk to each other), we return one end of the pair in the
          // response, and we operate on the other end. Note that this API is not part of the
          // Fetch API standard; unfortunately, the Fetch API / Service Workers specs do not define
          // any way to act as a WebSocket server today.
          let pair = new WebSocketPair();

          // We're going to take pair[1] as our end, and return pair[0] to the client.
          // await this.handleSession(pair[1], this.ip);
          await this.handleSession(pair[1]);

          // Now we return the other end of the pair to the client.
          return new Response(null, { status: 101, webSocket: pair[0] });
        }

        default:
          return new Response("Not found", { status: 404 });
      }
    });
  }

  // handleSession() implements our WebSocket-based game broadcast protocol.
  async handleSession(webSocket, ip) {
    // Accept our end of the WebSocket. This tells the runtime that we'll be terminating the
    // WebSocket in JavaScript, not sending it elsewhere.
    webSocket.accept();

    // Create our session and add it to the sessions list.
    // We don't send any messages to the client until it has sent us the initial user info
    // message. Until then, we will queue messages in `session.blockedMessages`.
    let session = { webSocket, blockedMessages: [] };
    this.sessions.push(session);

    // session.ip = ip;

    // let frameToPush;

    // Queue "join" messages for all online users, to populate the client's roster.
    this.sessions.forEach(otherSession => {
      if (otherSession.name) { // this session doesn't have a name yet
        // if (otherSession.lastFrame) frameToPush = otherSession.lastFrame; // only the game session will have a frame
        session.blockedMessages.push(JSON.stringify({ joined: otherSession.name }));
      }
    });

    // // send the last frame to the client if there is one
    // if (frameToPush) {
    //   session.blockedMessages.push(frameToPush);
    //   console.log(`pushing last frame`);
    // }

    // Set event handlers to receive messages.
    let receivedUserInfo = false;
    webSocket.addEventListener("message", async msg => {
      try {
        if (session.quit) {
          // Whoops, when trying to send to this WebSocket in the past, it threw an exception and
          // we marked it broken. But somehow we got another message? I guess try sending a
          // close(), which might throw, in which case we'll try to send an error, which will also
          // throw, and whatever, at least we won't accept the message. (This probably can't
          // actually happen. This is defensive coding.)
          webSocket.close(1011, "WebSocket broken.");
          return;
        }

        let data = JSON.parse(msg.data);

        if (!receivedUserInfo) {
          // The first message the client sends is the user info message with their gameID. Save it
          // into their session object.
          session.name = "" + (data.name || "anonymous");
          session.gameID = "" + (data.gameID || "no gameID");

          console.log(`join`, session.name, session.gameID);

          // Deliver all the messages we queued up since the user connected.
          session.blockedMessages.forEach(queued => {
            webSocket.send(queued);
          });
          delete session.blockedMessages;

          // Broadcast to all other connections that this user has joined.
          this.broadcast({ joined: session.name });

          // webSocket.send(JSON.stringify({ ready: true, ip: session.ip }));
          webSocket.send(JSON.stringify({ ready: true }));

          // Note that we've now received the user info message.
          receivedUserInfo = true;

          // let larn know the watch list has changed
          updateWatchList(this.env, session.gameID, this.sessions);

          return;
        }

        // Construct sanitized message for storage and broadcast.
        data = { name: session.name, message: "" + data.message };

        // Block overly long messages
        if (data.message.length > 131072) {
          webSocket.send(JSON.stringify({ error: `Message too long (${data.message.length})` }));
          return;
        }

        data.timestamp = Date.now();

        // Broadcast the message to all other WebSockets.
        let dataStr = JSON.stringify(data);
        this.broadcast(dataStr);

        //
        //
        //
        //
        // 
        // save last frame
        session.lastFrame = dataStr;
        //
        //
        //
        //
        //

        // let larn know the watch list has changed
        updateWatchList(this.env, session.gameID, this.sessions);

      } catch (err) {
        // Report any exceptions directly back to the client. As with our handleErrors() this
        // probably isn't what you'd want to do in production, but it's convenient when testing.
        webSocket.send(JSON.stringify({ error: err.stack }));
      }
    });

    // On "close" and "error" events, remove the WebSocket from the sessions list and broadcast
    // a quit message.
    let closeOrErrorHandler = evt => {
      console.log(`close`, session.name, session.gameID);
      session.quit = true;
      this.sessions = this.sessions.filter(member => member !== session);
      if (session.name) {
        this.broadcast({ quit: session.name });
        // delete session from kv, if it's not a larntv session
        if (session.name === session.gameID) {
          // this.env.realtime_larn.delete(session.gameID);
          this.env.realtime_larn.put(session.gameID, session.gameID, { expirationTtl: 60 });
        }
        // let larn know the watch list has changed
        updateWatchList(this.env, session.gameID, this.sessions);
      }
    };
    webSocket.addEventListener("close", closeOrErrorHandler);
    webSocket.addEventListener("error", closeOrErrorHandler);
  }

  // broadcast() broadcasts a message to all clients.
  broadcast(message) {
    // Apply JSON if we weren't given a string to start with.
    if (typeof message !== "string") {
      message = JSON.stringify(message);
    }

    // Iterate over all the sessions sending them messages.
    let quitters = [];
    this.sessions = this.sessions.filter(session => {
      if (session.name) {
        try {
          session.webSocket.send(message);
          return true;
        } catch (err) {
          // connection is dead. Remove it from the list and arrange to notify everyone below.
          session.quit = true;
          quitters.push(session);
          return false;
        }
      } else {
        // This session hasn't sent the initial user info message yet so queue the message to be sent later.
        session.blockedMessages.push(message);
        return true;
      }
    });

    quitters.forEach(quitter => {
      console.log(`quit`, quitter.name, quitter.gameID);
      if (quitter.name) {
        this.broadcast({ quit: quitter.name });
        // delete session from kv, if it's not a larntv session
        if (quitter.name == quitter.gameID) {
          // this.env.realtime_larn.delete(quitter.gameID);
          this.env.realtime_larn.put(quitter.gameID, quitter.gameID, { expirationTtl: 60 });
        }
      }
    });
  }
} // END GameSession



async function updateWatchList(env, gameID, sessions) {
  try {

    // make a list of open sessions
    let newWatchList = [];
    sessions.forEach(session => {
      if (session.name) {
        if (session.name !== session.gameID) {
          newWatchList.push(session.name);
        }
      }
    });

    if (!env.lastExpiryTime[gameID]) env.lastExpiryTime[gameID] = 0;
    let listsNotEqual = !compareArrays(env.watchlist[gameID], newWatchList); // if this list has changed, notify the player
    let nearExpiryTime = (Date.now() - env.lastExpiryTime[gameID]) / 1000 > (WATCHERS_TTL - 30); // seconds from expiry
    if (listsNotEqual || nearExpiryTime) {
      env.watchlist[gameID] = newWatchList;
      env.lastExpiryTime[gameID] = Date.now();
      console.log(`pushing watchlist`, `newinfo:${listsNotEqual}`, `expired:${nearExpiryTime}`, JSON.stringify(env.watchlist[gameID]));
      await insertWatcher(env, gameID, JSON.stringify(env.watchlist[gameID]));
    }
  } catch (error) {
    console.error(`updatewatchlist():`, error);
  }
}


function compareArrays(a1, a2) {
  if (!a1 && !a2) return true;
  return a1 && a2 && a1.length == a2.length && a1.every((v, i) => v === a2[i]);
}




async function initDatabase(env) {
  // console.log(`initdb(): dropping table`);
  // await env.DB.prepare(
  //   "DROP TABLE IF EXISTS recent;"
  // ).all();

  console.log(`initdb(): creating recent table`);
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS recent (\
      gameID TEXT PRIMARY KEY, \
      ularn INTEGER, \
      build INTEGER, \
      difficulty INTEGER, \
      mobuls INTEGER, \
      who TEXT, \
      level TEXT, \
      lastmove INTEGER, \
      explored TEXT, \
      gameover INTEGER, \
      watchers INTEGER, \
      font TEXT);"
  ).all();

  console.log(`initdb(): creating watchers table`);
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS watchers (\
      gameID TEXT PRIMARY KEY, \
      watchlist TEXT, \
      lastupdate INTEGER);"
  ).all();
}



async function getListOfActiveGames(env) {
  if (USE_D1) {
    const { results, success } = await env.DB.prepare("SELECT * FROM recent").all();
    // console.log(`getListOfActiveGames() D1: `, success, results);
    return results;
  } else {
    let rawlist = await env.realtime_larn.list();
    let results = [];
    rawlist.keys.forEach(game => results.push(game.metadata));
    // console.log(`getListOfActiveGames() KV: `, results);
    return results;
  }
}



async function insertActiveGame(env, game) {
  if (USE_D1) {
    // console.log(`D1 inserting game`, game.gameID);
    let { success } = await env.DB
      .prepare(`INSERT OR REPLACE INTO recent 
    (gameID, ularn, build, difficulty, mobuls, who, level, lastmove, explored, gameover, watchers, font) 
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`)
      .bind(
        game.gameID || ``,
        game.ularn ? 1 : 0,
        game.build || 0,
        game.difficulty || 0,
        game.mobuls || 0,
        game.who || ``,
        game.level || ``,
        Date.now(), // game.lastmove || 0, <-- lastmove doesn't work when the client clock is wrong
        game.explored || ``,
        game.gameover ? 1 : 0,
        game.watchers || 0,
        game.fontFamily || ``,
      )
      .run();
    // console.log(`D1 inserting game`, success);
  } else {
    // console.log(`KV inserting game`, game.gameID);
    await env.realtime_larn.put(game.gameID, game.gameID,
      {
        expirationTtl: game.gameover ? DEAD_TTL : GAME_TTL /* seconds */,
        metadata: game
      }
    );
  }
}



async function insertWatcher(env, gameID, watchlist) {
  if (USE_D1) {
    return await env.DB
      .prepare(`INSERT OR REPLACE INTO watchers 
    (gameID, watchlist, lastupdate) 
    VALUES (?1, ?2, ?3)`)
      .bind(
        gameID || ``,
        watchlist || ``,
        Date.now(),
      )
      .run();
  } else {
    return await env.larn_tv_watchers.put(
      gameID,
      JSON.stringify(env.watchlist[gameID]),
      { expirationTtl: WATCHERS_TTL }
    );
  }
}



async function getNumWatchers(env, gameID) {
  let numWatchers = 0;
  if (USE_D1) {
    let stmt = env.DB.prepare(`SELECT watchlist FROM watchers WHERE gameID = ?1 LIMIT 1`).bind(gameID);
    let row = await stmt.first();
    let watchers = row ? JSON.parse(row.watchlist) : [];
    numWatchers = watchers.length;
  } else {
    let watchers = await env.larn_tv_watchers.get(gameID) || JSON.stringify([]);
    watchers = JSON.parse(watchers);
    numWatchers = watchers.length;
  }
  // console.log(`numwatchers:`, numWatchers);
  return numWatchers;
}