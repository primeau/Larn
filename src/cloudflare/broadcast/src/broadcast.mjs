const TESTING_CLOUDFLARE_WORKERS = false;
const WATCHERS_TTL = TESTING_CLOUDFLARE_WORKERS ? 60 : 300;
const GAME_TTL = TESTING_CLOUDFLARE_WORKERS ? 60 : 600;
const DEAD_TTL = TESTING_CLOUDFLARE_WORKERS ? 10 : 60;
let dbInitialized = false;



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
    // keep the recent games table tidy
    let result = await env.DB.prepare(`DELETE FROM recent 
      WHERE 
      (lastmove < unixepoch() * 1000 - ${GAME_TTL * 1000})
      OR
      (gameover = 1 AND lastmove < unixepoch() * 1000 - ${DEAD_TTL * 1000})`
    ).run();

    // keep the watchers table tidy
    result = await env.DB.prepare(`DELETE FROM watchers 
      WHERE lastupdate < unixepoch() * 1000 - ${WATCHERS_TTL * 1000}`
    ).run();
  },
}



async function handleApiRequest(path, request, env) {
  // We've received at API request. Route the request based on the path.

  // my local dev environment wipes out the DB every time i save
  if (TESTING_CLOUDFLARE_WORKERS && !dbInitialized) {
    await initDatabase(env);
    dbInitialized = true;
  }

  switch (path[0]) {

    case "clean": {


      // convert id to a string
      let idstring = `03edfed93bfbce1c88ed69f516d1a18731734f9ea113d212f5af993eb0105e01`;
      // convert that string back to an id
      let idfromstring = env.games.idFromString(idstring);

      // Get the Durable Object stub for this game
      let gameObject = await env.games.get(idfromstring);
      // console.log(await gameObject);
      // console.log(gameObject.fetch("foooooo"));

      console.log(env.watchlist);

      console.log(`done`);
      // let objectid = await env.games.idFromString(idstring);
      // console.log(`objectid`, objectid);

      // let gameObject = await env.games.get(objectid);
      // console.log(gameObject);
      // console.log(gameObject.sessions.length);

      // // get namespaces
      // let namespace = ``;
      // const options = {
      //   method: 'GET',

      // TODO: DELETE TOKEN
      //   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer 9zGWlYMS-pT5bpfi9mxUPCN9r-uvGWjeCRblaiWF' },
      //   limit: 1
      // };
      // await fetch(`https://api.cloudflare.com/client/v4/accounts/0f4bb06b0a6b85fa5c6f14d6173a250e/workers/durable_objects/namespaces`, options)
      //   .then(response => response.json())
      //   .then(response => namespace = response.result[0].id)
      //   .catch(err => console.error(err));
      // console.log(`namespace`, namespace);
      // let idstring = ``;
      // await fetch(`https://api.cloudflare.com/client/v4/accounts/0f4bb06b0a6b85fa5c6f14d6173a250e/workers/durable_objects/namespaces/${namespace}/objects`, options)
      //   .then(response => response.json())
      //   .then(response => idstring = response.result[0].id)
      //   .catch(err => console.error(err));
      // console.log(`idstring`, idstring);

      // let objectid = env.games.idFromString(idstring);
      // let gameObject = await env.games.get(objectid);
      // console.log(gameObject);
      // console.log(gameObject.sessions.length);

      return new Response(`clean?`, { headers: { "Access-Control-Allow-Origin": "*" } });
    }



    case "gamelist": {

      let gameID = path[1];

      // request to /api/gamelist
      // send a list of active games
      if (!gameID) {
        let liveGamesList = await getListOfActiveGames(env);
        return new Response(JSON.stringify(liveGamesList), {
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
            console.error(`/gamelist: oops`, error);
          }
        }

      }
    }

    case "game": {
      // Request for `/api/game/...`.
      if (!path[1]) {
        // The request is for just "/api/game", with no ID.
        return new Response("/game: Method not allowed", { status: 405 });
      }

      // OK, the request is for `/api/game/<gameID>/...`. It's time to route to the Durable Object
      // for the specific game.
      let gameID = path[1];

      if (!env.games) {
        return new Response("/game: durable object error", { status: 503 });
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
      return new Response("/game: Not found", { status: 404 });
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
      console.log(`handleErrors`, err);
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
  constructor(state, env) {
    // `env` is our environment bindings (discussed earlier).
    this.env = env;

    // We will put the WebSocket objects for each client, and some metadata, into `sessions`.
    this.sessions = [];

    // this.state = state;
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

          // To accept the WebSocket request, we create a WebSocketPair (which is like a socketpair,
          // i.e. two WebSockets that talk to each other), we return one end of the pair in the
          // response, and we operate on the other end. Note that this API is not part of the
          // Fetch API standard; unfortunately, the Fetch API / Service Workers specs do not define
          // any way to act as a WebSocket server today.
          let pair = new WebSocketPair();

          // We're going to take pair[1] as our end, and return pair[0] to the client.
          await this.handleSession(pair[1]);

          // // if we want to consider Hibernateable websockets
          // let webSocket = pair[1];
          // try {
          //   console.log(`state`, this.state.id);
          //   await this.state.acceptWebSocket(webSocket);
          // } catch (error) {
          //   console.error(`handle`, error);
          // }

          // Now we return the other end of the pair to the client.
          return new Response(null, { status: 101, webSocket: pair[0] });
        }

        default:
          return new Response("Not found", { status: 404 });
      }
    });
  }

  // handleSession() implements our WebSocket-based game broadcast protocol.
  async handleSession(webSocket) {
    // Accept our end of the WebSocket. This tells the runtime that we'll be terminating the
    // WebSocket in JavaScript, not sending it elsewhere.
    webSocket.accept();

    // Create our session and add it to the sessions list.
    let session = { webSocket };
    this.sessions.push(session);

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

          // Broadcast to all other connections that this user has joined.
          this.broadcast({ joined: session.name });

          // Note that we've now received the user info message.
          receivedUserInfo = true;

          // let larn know the watch list has changed
          updateWatchList(this.env, session.gameID, this.sessions);

          return;
        }

        if (!data.message) return;

        // Construct sanitized message for broadcast.
        data = { name: session.name, gameID: session.gameID, message: "" + data.message };

        // Block overly long messages
        if (data.message.length > 131072) {
          webSocket.send(JSON.stringify({ error: `Message too long (${data.message.length})` }));
          return;
        }

        data.timestamp = Date.now();

        // Broadcast the message to all other WebSockets.
        this.broadcast(data);

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
      this.sessions = this.sessions.filter(member => member !== session);
      quitSession(this, session);
    };
    webSocket.addEventListener("close", closeOrErrorHandler);
    webSocket.addEventListener("error", closeOrErrorHandler);
  }




  // broadcast() broadcasts a message to all clients.
  broadcast(message) {
    let from = message.name; // keep track of who is sending the message

    // Apply JSON if we weren't given a string to start with.
    if (typeof message !== "string") {
      message = JSON.stringify(message);
    }

    // Iterate over all the sessions sending them messages.
    this.sessions = this.sessions.filter(session => {
      try {
        // don't send messages back to the sender (generally, larn->larn)
        if (session.name && from != session.name) {
          session.webSocket.send(message);
        }
        return true;
      } catch (err) {
        // connection is dead. Remove it from the list and arrange to notify everyone below.
        console.log(`quit during broadcast:`, session.name, session.gameID);
        quitSession(this, session);
        return false;
      }
    });

  }
} // END GameSession



async function updateWatchList(env, gameID, sessions) {
  // console.log(`updatewatchlist`, env, gameID, sessions.length);

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
  const { results, success } = await env.DB.prepare("SELECT * FROM recent").all();
  // console.log(`getListOfActiveGames() D1: `, success, results);
  return results;
}



async function insertActiveGame(env, game) {
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
}



async function insertWatcher(env, gameID, watchlist) {
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
}



async function getNumWatchers(env, gameID) {
  let numWatchers = 0;
  let stmt = env.DB.prepare(`SELECT watchlist FROM watchers WHERE gameID = ?1 LIMIT 1`).bind(gameID);
  let row = await stmt.first();
  let watchers = row ? JSON.parse(row.watchlist) : [];
  numWatchers = watchers.length;
  // console.log(`numwatchers:`, numWatchers);
  return numWatchers;
}



function quitSession(gameSession, session) {
  console.log(`quitSession`, session.name, session.gameID);
  if (session.name) {
    session.quit = true;
    gameSession.broadcast({ quit: session.name });
    deleteSession(gameSession, session);
    // let larn know the watch list has changed
    // updateWatchList(gameSession.env, session.gameID, gameSession.sessions);
    updateWatchList(gameSession.env, session.gameID, gameSession.sessions);
  }
}



async function deleteSession(gameSession, session) {
  if (!session) return;

  console.log(`deleteSession:`, session.name, session.gameID, session.webSocket);

  // if it's a larn session, delete entry from recent game list
  if (session.name === session.gameID) {
    let result = await gameSession.env.DB.prepare(`DELETE FROM recent WHERE gameID = ?1`).bind(session.gameID).run();
    console.log(`D1 delete game`, result.success);
  }

  if (session.webSocket) session.webSocket.close();

  session.webSocket = null;
  session = null;
  gameSession = null;
}