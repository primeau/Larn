'use strict';

import { CF_ACTIVE_TABLE, CF_WATCHERS_TABLE, WATCHERS_TTL } from './cf_config.mjs';

import { ALLOW_ORIGIN_HEADERS, compareArrays } from './cf_tools.mjs';

export async function handleGameSessionRequest(env, request, path) {
  if (!path[1]) {
    return new Response(`Method not allowed`, { status: 405, statusText: `Method not allowed`, headers: ALLOW_ORIGIN_HEADERS });
  }

  // OK, the request is for `/api/game/<gameID>/...`. It's time to route to the Durable Object
  // for the specific game.
  const gameID = path[1];

  if (!env.games) {
    return new Response(`durable object error`, { status: 503, statusText: `/game: durable object error`, headers: ALLOW_ORIGIN_HEADERS });
  }

  // Each Durable Object has a 256-bit unique ID.
  const id = env.games.idFromName(gameID);

  // keep track of durable objects
  // TODO clean up old DOs somehow?
  await env.larn_tv_watchers.put(id.toString(), gameID);

  // Get the Durable Object stub for this game
  const gameObject = env.games.get(id);

  // Compute a new URL with `/api/game/<gameID>` removed. We'll forward the rest of the path
  // to the Durable Object.
  const newUrl = new URL(request.url);
  newUrl.pathname = '/' + path.slice(2).join('/');

  // Send the request to the object. The `fetch()` method of a Durable Object stub has the
  // same signature as the global `fetch()` function, but the request is always sent to the
  // object, regardless of the request's URL.
  return gameObject.fetch(newUrl, request);
}

export async function updateWatchList(env, gameID, sessions) {
  // console.log(`updatewatchlist`, env, gameID, sessions.length);

  try {
    // make a list of open sessions
    const newWatchList = [];
    sessions.forEach((session) => {
      if (session.name) {
        if (session.name !== session.gameID) {
          newWatchList.push(session.name);
        }
      }
    });

    if (!env.lastExpiryTime[gameID]) env.lastExpiryTime[gameID] = 0;
    let listsNotEqual = !compareArrays(env.watchlist[gameID], newWatchList); // if this list has changed, notify the player
    let nearExpiryTime = (Date.now() - env.lastExpiryTime[gameID]) / 1000 > WATCHERS_TTL - 30; // seconds from expiry
    if (listsNotEqual || nearExpiryTime) {
      env.watchlist[gameID] = newWatchList;
      env.lastExpiryTime[gameID] = Date.now();
      console.log(`pushing watchlist`, `newinfo:${listsNotEqual}`, `expired:${nearExpiryTime}`, JSON.stringify(env.watchlist[gameID]));
      const success = await insertWatcher(env, gameID, JSON.stringify(env.watchlist[gameID]));
      console.log(`updateWatchList(): success`, success);
    }
  } catch (error) {
    console.error(`updateWatchList(): error`, error);
  }
}

async function insertWatcher(env, gameID, watchlist) {
  const { success } = await env.DB.prepare(
    `INSERT OR REPLACE INTO ${CF_WATCHERS_TABLE} 
    (gameID, watchlist, lastupdate) 
    VALUES (?1, ?2, ?3)`
  )
    .bind(gameID.toLowerCase() || ``, watchlist || ``, Date.now())
    .run();
  return success;
}

export function quitSession(gameSession, session) {
  console.log(`quitSession`, session.name, session.gameID);
  if (session.name) {
    session.quit = true;
    gameSession.broadcast({ quit: session.name });
    deleteSession(gameSession, session);
    // let larn know the watch list has changed
    updateWatchList(gameSession.env, session.gameID, gameSession.sessions);
  }
}

async function deleteSession(gameSession, session) {
  if (!session) return;

  console.log(`deleteSession:`, session.name, session.gameID, session.webSocket);

  // if it's a larn session, delete entry from recent game list
  if (session.name === session.gameID) {
    const { success } = await gameSession.env.DB.prepare(`DELETE FROM ${CF_ACTIVE_TABLE} WHERE gameID = ?1`).bind(session.gameID).run();
    console.log(`D1 delete game`, success);
  }

  // close connecting or open websockets
  if (session.webSocket && (session.webSocket.readyState === 1 || session.webSocket.readyState === 0)) {
    session.webSocket.close();
  }
  session.webSocket = null;
  session = null;
  gameSession = null;
}

// scheduled task
// for cleaning up old entries
export async function pruneWatchersTable(env) {
  const { success } = await env.DB.prepare(
    `DELETE FROM ${CF_WATCHERS_TABLE} 
      WHERE lastupdate < unixepoch() * 1000 - ${WATCHERS_TTL * 1000}`
  ).run();
  return success;
}

export async function initWatchersTable(env) {
  console.log(`initdb(): creating ${CF_WATCHERS_TABLE} table`);
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS ${CF_WATCHERS_TABLE} (\
      gameID TEXT PRIMARY KEY, \
      watchlist TEXT, \
      lastupdate INTEGER);`
  ).run();
}
