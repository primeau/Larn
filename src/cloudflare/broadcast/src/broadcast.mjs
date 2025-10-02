'use strict';

import { CF_LOCAL, CF_HIGHSCORES_TABLE, CF_GOTW_TABLE } from './cf_config.mjs';

import { ALLOW_ORIGIN_HEADERS, SUCCESS_RESPONSE, getGotwLabel } from './cf_tools.mjs';
import { getPlayerIP, permissionCheck, initIpTrackerTable } from './cf_tools.mjs';

import { handleScoreRequest, initScoresTable, dropScoresTables } from './endpoint_score.mjs';
import { handleCompletedRequest, initCompletedGamesTable, pruneCompletedGamesTable } from './endpoint_completed.mjs';
import { handleHighscoreRequest, initHighscoresTable } from './endpoint_highscores.mjs';
import { handleActiveRequest, pruneActiveTable, initActiveTable } from './endpoint_active.mjs';
import { handleGotwRequest, initGotwStartedTable, pruneGotwStartedTable } from './endpoint_gotw.mjs';
import { handleGameSessionRequest, updateWatchList, quitSession, pruneWatchersTable, initWatchersTable } from './endpoint_session.mjs';
import { handleAdminRequest } from './endpoint_admin.mjs';

let dbInitialized = false;

export default {
  async fetch(request, env) {
    // my local dev environment wipes out the DB every time i save
    if (CF_LOCAL && !dbInitialized) {
      console.log(`handleApiRequest(): initializing databases`);
      await initDatabase(env);
      dbInitialized = true;
    }

    return await handleErrors(request, async () => {
      // test the IP to see if it's a scraper
      let isAllowed = await permissionCheck(env, getPlayerIP(request));
      if (!isAllowed) {
        return new Response(`Forbidden`, { status: 403, statusText: `Forbidden`, headers: ALLOW_ORIGIN_HEADERS });
      }

      const url = new URL(request.url);
      const path = url.pathname.slice(1).split('/');
      switch (path[0]) {
        case 'api':
          return handleApiRequest(env, request, path.slice(1));
        case 'admin':
          return handleAdminRequest(env, request, path.slice(1));
        default:
          return new Response(`not found`, { status: 404, statusText: `not found`, headers: ALLOW_ORIGIN_HEADERS });
      }
    });
  },

  //
  //
  //
  // SCHEDULED
  //
  //
  //
  async scheduled(event, env, ctx) {
    console.log(`scheduled(): event:`, event);

    let success;
    // keep the active games table tidy
    success = await pruneActiveTable(env);
    console.log(`scheduled(): cleaned up active games table`, success);

    // keep the watchers table tidy
    success = await pruneWatchersTable(env);
    console.log(`scheduled(): cleaned up watchers table`, success);

    // keep the completed games table tidy
    // if (event.cron === '0 * * * *') { --> hourly cloudflare cron was using 1000+seconds of wall time to execute!
    if (new Date(event.scheduledTime).getMinutes() === 27) {
      success = await pruneCompletedGamesTable(env);
      console.log(`scheduled(): cleaned up completed games table`, success);
    }

    // sunday at midnight
    if (event.cron === '0 0 * * sun') {
      // clean up the GOTW started table
      success = await pruneGotwStartedTable(env);
      console.log(`scheduled(): cleaned up GOTW started table`, success);
      // create new GOTW table for the week
      const gotwTable = `${CF_GOTW_TABLE}_${getGotwLabel(new Date())}`;
      success = await initHighscoresTable(env, gotwTable);
      console.log(`scheduled(): created ${gotwTable}`, success);
    }
  },
};

//
//
//
// HANDLE_API_REQUEST
//
//
//
async function handleApiRequest(env, request, path) {
  // We've received at API request. Route the request based on the path.

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    console.log(`handleApiRequest(): OPTIONS`, path);
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // console.log(`handleApiRequest(): `, path, request.url);

  switch (path[0]) {
    // larntv: manage the list of active games
    case 'active':
    case 'gamelist': {
      // console.log(`handleApiRequest(): /active`);
      const response = await handleActiveRequest(env, request, path);
      return response;
    }

    // larntv: manage the request for watching a game
    case 'session':
    case 'game': {
      console.log(`handleApiRequest(): /game`);
      const response = await handleGameSessionRequest(env, request, path);
      return response;
    }

    // larn: get or put a score that is recorded at the end of a game
    case `score`: {
      // console.log(`handleApiRequest(): /score`);
      const response = handleScoreRequest(env, request, path);
      return response;
    }

    // larn: get the scoreboard, or add a score into the high scores table
    case `highscore`: {
      console.log(`handleApiRequest(): /highscore`, path);
      const response = handleHighscoreRequest(env, request, path);
      return response;
    }

    // larnTV: get the completed games list
    case `completed`: {
      console.log(`handleApiRequest(): /completed`, path);
      const response = handleCompletedRequest(env, request, path);
      return response;
    }

    // larn: manage the game of the week
    case `gotw`: {
      console.log(`handleApiRequest(): /gotw`);
      const response = handleGotwRequest(env, request, path);
      return response;
    }

    default:
      console.error(`handleApiRequest(): unknown method`, path);
      return new Response(`Method not allowed`, { status: 405, statusText: `Method not allowed`, headers: ALLOW_ORIGIN_HEADERS });
  }
}

// `handleErrors()` is a little utility function that can wrap an HTTP request handler in a
// try/catch and return errors to the client. You probably wouldn't want to use this in production
// code but it is convenient when debugging and iterating.
async function handleErrors(request, func) {
  try {
    return await func();
  } catch (err) {
    if (request.headers.get('Upgrade') == 'websocket') {
      // Annoyingly, if we return an HTTP error in response to a WebSocket request, Chrome devtools
      // won't show us the response body! So... let's send a WebSocket response with an error
      // frame instead.
      console.error(`handleErrors`, err);
      const pair = new WebSocketPair();
      pair[1].accept();
      pair[1].send(JSON.stringify({ error: err.stack }));
      pair[1].close(1011, 'Uncaught exception during session setup');
      return new Response(null, { status: 101, webSocket: pair[0], headers: ALLOW_ORIGIN_HEADERS });
    } else {
      return new Response(err.stack, { status: 500, statusText: err.message, headers: ALLOW_ORIGIN_HEADERS });
    }
  }
}

async function initDatabase(env) {
  // await env.DB.prepare(`DROP TABLE IF EXISTS ${CF_HIGHSCORES_TABLE};`).run();
  // await env.DB.prepare("DROP TABLE IF EXISTS ${CF_ACTIVE_TABLE};").run();
  // await dropScoresTables(env);
  await initHighscoresTable(env, CF_HIGHSCORES_TABLE);
  await initActiveTable(env);
  await initGotwStartedTable(env);
  await initWatchersTable(env);
  await initScoresTable(env);
  await initCompletedGamesTable(env);
  await initIpTrackerTable(env);
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
        case '/websocket': {
          // The request is to `/api/game/<gameID>/websocket`. A client is trying to establish a new
          // WebSocket session.
          if (request.headers.get('Upgrade') != 'websocket') {
            return new Response(`expected websocket`, { status: 400, statusText: `expected websocket`, headers: ALLOW_ORIGIN_HEADERS });
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
          return new Response(null, { status: 101, webSocket: pair[0], headers: ALLOW_ORIGIN_HEADERS });
        }

        default:
          return new Response(`not found`, { status: 404, statusText: `not found`, headers: ALLOW_ORIGIN_HEADERS });
      }
    });
  }

  // handleSession() implements our WebSocket-based game broadcast protocol.
  async handleSession(webSocket) {
    // Accept our end of the WebSocket. This tells the runtime that we'll be terminating the
    // WebSocket in JavaScript, not sending it elsewhere.
    try {
      webSocket.accept();
    } catch (err) {
      console.error('WebSocket accept failed:', err);
      return;
    }

    // Create our session and add it to the sessions list.
    const session = { webSocket };
    this.sessions.push(session);

    // Set event handlers to receive messages.
    let receivedUserInfo = false;
    webSocket.addEventListener('message', async (msg) => {
      try {
        if (session.quit) {
          // Whoops, when trying to send to this WebSocket in the past, it threw an exception and
          // we marked it broken. But somehow we got another message? I guess try sending a
          // close(), which might throw, in which case we'll try to send an error, which will also
          // throw, and whatever, at least we won't accept the message. (This probably can't
          // actually happen. This is defensive coding.)
          webSocket.close(1011, 'WebSocket broken.');
          return;
        }

        let data;
        try {
          data = JSON.parse(msg.data);
        } catch (err) {
          webSocket.send(JSON.stringify({ error: 'Invalid JSON' }));
          return;
        }

        if (!receivedUserInfo) {
          // The first message the client sends is the user info message with their gameID. Save it
          // into their session object.
          session.name = '' + (data.name || 'anonymous');
          session.gameID = '' + (data.gameID || 'no gameID');

          console.log(`join`, session.name, session.gameID);

          // Broadcast to all other connections that this user has joined.
          this.broadcast({ joined: session.name });

          // Note that we've now received the user info message.
          receivedUserInfo = true;

          // let larn know the watch list has changed
          try {
            await updateWatchList(this.env, session.gameID, this.sessions);
          } catch (err) {
            console.error('updateWatchList failed:', err);
          }

          return;
        }

        if (!data.message || typeof data.message !== 'string') return;

        // Construct sanitized message for broadcast.
        data = { name: session.name, gameID: session.gameID, message: '' + data.message };

        // Block overly long messages
        if (data.message.length > 131072) {
          webSocket.send(JSON.stringify({ error: `Message too long (${data.message.length})` }));
          return;
        }

        data.timestamp = Date.now(); // unused?

        // Broadcast the message to all other WebSockets.
        this.broadcast(data);

        // let larn know the watch list has changed
        try {
          await updateWatchList(this.env, session.gameID, this.sessions);
        } catch (err) {
          console.error('updateWatchList failed:', err);
        }
      } catch (err) {
        // Report any exceptions directly back to the client. As with our handleErrors() this
        // probably isn't what you'd want to do in production, but it's convenient when testing.
        webSocket.send(JSON.stringify({ error: err.stack }));
      }
    });

    // On "close" and "error" events, remove the WebSocket from the sessions list and broadcast
    // a quit message.
    const closeOrErrorHandler = (evt) => {
      console.log(`closeOrErrorHandler`, session.name, session.gameID);
      this.sessions = this.sessions.filter((member) => member !== session);
      quitSession(this, session);
    };
    webSocket.addEventListener('close', closeOrErrorHandler);
    webSocket.addEventListener('error', closeOrErrorHandler);
  }

  // broadcast() broadcasts a message to all clients.
  broadcast(message) {
    const from = message.name; // keep track of who is sending the message

    // Apply JSON if we weren't given a string to start with.
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }

    // Iterate over all the sessions sending them messages.
    this.sessions = this.sessions.filter((session) => {
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
