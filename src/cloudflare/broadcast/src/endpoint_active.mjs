'use strict';

import { CF_ACTIVE_TABLE, CF_WATCHERS_TABLE, SCHEDULE_GAME_TTL, SCHEDULE_DEAD_TTL } from './cf_config.mjs';

import { ALLOW_ORIGIN_HEADERS, SUCCESS_RESPONSE, getPlayerIP } from './cf_tools.mjs';

//
//
// HANDLE_ACTIVE_REQUEST
//
//
export async function handleActiveRequest(env, request, path) {
  const gameID = path[1];

  // get a list of active games
  if (request.method === `GET`) {
    if (!gameID) {
      const activeGames = await getActiveGames(env);
      return new Response(JSON.stringify(activeGames), SUCCESS_RESPONSE);
    }
  }

  // request to /api/active/<gameid>
  // store the most recent game data for this gameID
  if (request.method === `PUT` || request.method === `POST`) {
    try {
      // first check to see if someone is watching this game
      const numWatchers = await getNumWatchers(env, gameID);

      const data = JSON.parse(await request.text()) || `no data`;
      if (data.metadata) {
        data.metadata.watchers = numWatchers;
        await insertActiveGame(env, data.metadata);
      }

      // Get the client's IP address
      const ip = getPlayerIP(request);
      const somoneIsWatchingYou = {
        watchers: numWatchers,
        ip: ip,
      };
      // console.log(`watching`, JSON.stringify(somoneIsWatchingYou));
      return new Response(JSON.stringify(somoneIsWatchingYou), SUCCESS_RESPONSE);
    } catch (error) {
      console.error(`/active: error`, error);
      return new Response(error.message, { status: 500, statusText: error.message, headers: ALLOW_ORIGIN_HEADERS });
    }
  }
}

//
//
// GET_ACTIVE_GAMES
//
//
async function getActiveGames(env) {
  let { results } = await env.DB.prepare(`SELECT * FROM ${CF_ACTIVE_TABLE} LIMIT 100`).all(); // assume we're never going to have more than 100 games underway
  // console.log(`getActiveGames() D1: `, success, results);
  results = results.map((game) => getLarnActiveGameObject(game));
  return results;
}

function getLarnActiveGameObject(game) {
  return {
    gameID: game.gameID.toLowerCase(),
    ularn: game.ularn === 1,
    build: game.build,
    hardlev: game.difficulty,
    timeused: game.mobuls,
    who: game.who,
    level: game.level,
    createdAt: game.lastmove,
    explored: game.explored,
    gameover: game.gameover === 1,
    watchers: game.watchers,
    fontFamily: game.fontFamily,
  };
}

//
//
// GET_NUM_WATCHERS
//
//
async function getNumWatchers(env, gameID) {
  const result = await env.DB.prepare(`SELECT watchlist FROM ${CF_WATCHERS_TABLE} WHERE gameID = ?1 LIMIT 1`).bind(gameID).first();
  const watchers = result ? JSON.parse(result.watchlist) : [];
  const numWatchers = watchers.length;
  // console.log(`numwatchers:`, numWatchers);
  return numWatchers;
}

//
//
// INSERT_ACTIVE_GAME
//
//
async function insertActiveGame(env, game) {
  // console.log(`D1 inserting game`, game.gameID, game);
  let { success } = await env.DB.prepare(
    `INSERT OR REPLACE INTO ${CF_ACTIVE_TABLE} 
    (gameID, ularn, build, difficulty, mobuls, who, level, lastmove, explored, gameover, watchers, font) 
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`
  )
    .bind(
      game.gameID.toLowerCase() || ``,
      game.ularn ? 1 : 0,
      game.build || 0,
      game.difficulty,
      game.mobuls,
      game.who || ``,
      game.level || ``,
      Date.now(), // game.lastmove || 0, <-- lastmove doesn't work when the client clock is wrong
      game.explored || ``,
      game.gameover ? 1 : 0,
      game.watchers || 0,
      game.fontFamily || ``
    )
    .run();
  return success;
  // console.log(`D1 inserting game`, success);
}

//
//
// PRUNE_ACTIVE_TABLE
//
// scheduled task for cleaning up old entries
//
//
export async function pruneActiveTable(env) {
  const { success } = await env.DB.prepare(
    `DELETE FROM ${CF_ACTIVE_TABLE} 
      WHERE 
      (lastmove < unixepoch() * 1000 - ${SCHEDULE_GAME_TTL * 1000})
      OR
      (gameover = 1 AND lastmove < unixepoch() * 1000 - ${SCHEDULE_DEAD_TTL * 1000})`
  ).run();
  return success;
}

//
//
// INIT_ACTIVE_TABLE
//
//
export async function initActiveTable(env) {
  console.log(`initdb(): creating ${CF_ACTIVE_TABLE} table`);
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS ${CF_ACTIVE_TABLE} (\
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
      font TEXT);`
  ).run();
}
