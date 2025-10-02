'use strict';

import { CF_COMPLETED_GAMES_TABLE } from './cf_config.mjs';

import { ALLOW_ORIGIN_HEADERS, SUCCESS_RESPONSE } from './cf_tools.mjs';

//
//
// HANDLE_COMPLETED_REQUEST
//
//
export async function handleCompletedRequest(env, request, path) {
  // get all completed games
  if (request.method === 'GET') {
    return await handleCompletedGET(env);
  }

  if (request.method === 'PUT') {
    // NO PUT -- completed games are inserted via the /api/score endpoint
  }

  return new Response(`Method not allowed`, { status: 405, statusText: `Method not allowed`, headers: ALLOW_ORIGIN_HEADERS });
}

//
//
// HANDLE_COMPLETED_GET
//
//
export async function handleCompletedGET(env) {
  try {
    const { results } = await env.DB.prepare(`SELECT * FROM ${CF_COMPLETED_GAMES_TABLE} LIMIT 500`).all(); // never more than 500 just in case
    // success case
    if (results && results.length > 0) {
      console.log(`handleCompletedGET(): got ${results.length} completed games`);
      return new Response(JSON.stringify(results), SUCCESS_RESPONSE);
    }
    // no results found
    else {
      return new Response(`empty table`, { status: 404, statusText: `empty table`, headers: ALLOW_ORIGIN_HEADERS });
    }
  } catch (error) {
    console.error(`handleCompletedGET(): `, error);
    return new Response(error.message, { status: 500, statusText: error.message, headers: ALLOW_ORIGIN_HEADERS });
  }
}

//
//
// INSERT_COMPLETED_GAME
//
//
export async function insertCompletedGame(env, score) {
  // remove trailing '+'
  if (score.gameID.endsWith('+')) {
    score.gameID = score.gameID.slice(0, -1);
  }

  // console.log(`insertCompletedGame()`, score.gameID);
  const { success } = await env.DB.prepare(
    `INSERT OR REPLACE INTO ${CF_COMPLETED_GAMES_TABLE}
    (gameID, ularn, winner, hardlev, score, who, character, timeused, what, level, moves, createdAt) 
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`
  )
    .bind(
      score.gameID.toLowerCase() || ``,
      score.ularn ? 1 : 0,
      score.winner ? 1 : 0,
      score.hardlev || 0,
      score.score || 0,
      score.who || ``,
      score.character || `Adventurer`,
      score.timeused || 0,
      score.what || ``,
      score.level || ``,
      score.moves || 0,
      score.createdAt || Date.now()
    )
    .run();
  return success;
  // console.log(`D1 inserting completed game:`, score.gameID, results);
}

export async function pruneCompletedGamesTable(env) {
  const conditions = [
    `ularn=1 and winner=1`, //
    `ularn=1 and winner=0`, //
    `ularn=0 and winner=1`, //
    `ularn=0 and winner=0`,
  ];
  try {
    for (const condition of conditions) {
      const { success } = await env.DB.prepare(
        `DELETE FROM ${CF_COMPLETED_GAMES_TABLE}
            WHERE ${condition} AND gameID NOT IN (
                SELECT gameID FROM ${CF_COMPLETED_GAMES_TABLE}
                WHERE ${condition}
                ORDER BY createdAt DESC
                LIMIT 100
            )`
      ).run();
      console.log(`pruneCompletedGamesTable(): cleaned up completed games table ${condition}`, success);
    }
    return true;
  } catch (error) {
    console.error(`pruneCompletedGamesTable(): `, error);
    return false;
  }
}

//
//
// INIT_COMPLETED_GAMES_TABLE
//
//
export async function initCompletedGamesTable(env) {
  console.log(`initCompletedGamesTable(): creating completed games table`);
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS ${CF_COMPLETED_GAMES_TABLE} (\
      gameID TEXT PRIMARY KEY, \
      ularn INTEGER, \
      winner INTEGER, \
      hardlev INTEGER, \
      score INTEGER, \
      who TEXT, \
      character TEXT, \
      timeused INTEGER, \
      what TEXT, \
      level TEXT, \
      moves INTEGER, \
      createdAt INTEGER);`
  ).run();
}
