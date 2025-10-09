'use strict';

import { CF_LARN, CF_ULARN, CF_GOTW_TABLE } from './cf_config.mjs';

import { ALLOW_ORIGIN_HEADERS, SUCCESS_RESPONSE, getGotwLabel, getGotwFilename, getPlayerIP } from './cf_tools.mjs';

import { initHighscoresTable } from './endpoint_highscores.mjs';

//
//
// HANDLE_GOTW_REQUEST
//
//
export async function handleGotwRequest(env, request, path) {
  // let gameID = path[1];
  if (request.method === 'GET') {
    return await handleGotwGET(env, request, path);
  }
  if (request.method === 'PUT') {
    // no put
  }

  console.error(`handleGotwRequest(): not a GET request`);
  return new Response(`Method not allowed`, { status: 405, statusText: `Method not allowed`, headers: ALLOW_ORIGIN_HEADERS });
}

//
//
// HANDLE_GOTW_GET
//
//
async function handleGotwGET(env, request, path) {
  try {
    const vars = path[1].split(`,`);
    const gameType = vars[0];
    const who = decodeURIComponent(vars[1]);
    const playerID = vars[2];
    const filename = getGotwFilename(gameType);
    let playerIP = getPlayerIP(request);

    console.log(`handleGotwGET(): ${filename} download request from ${gameType}, ${who}, ${playerID}, ${playerIP}`);

    // allow localhost games for now
    if (playerIP === `0` || playerIP === `::1` || playerIP.startsWith(`192.168.`) || playerIP.startsWith(`10.`) || playerIP.startsWith(`172.`)) {
      playerIP = ``;
    }

    // get the GOTW-yyyy-ww.json file
    const file = await env.BUCKET_GOTW.get(filename);
    if (file) {
      console.log(`handleGotwGET(): found file ${filename} (${file.size} bytes)`);
    } else {
      return new Response('File not found', { status: 404, headers: ALLOW_ORIGIN_HEADERS });
    }

    // (0) setup for dupe checking
    let numScores = 0;
    const gameWhere = gameType === CF_ULARN ? `ularn=1` : `ularn=0`;
    const dbquery = `WHERE ${gameWhere} 
                     AND (who = ?1 OR playerID = ?2 OR playerIP = ?3)`;

    // (1) look at the current gotw scoreboard to see if this player has already played
    const gotwScoreTable = `${CF_GOTW_TABLE}_${getGotwLabel(new Date())}`;
    await initHighscoresTable(env, gotwScoreTable); // always try to create the table, which is harmless if it already exists
    const rawResults = await env.DB.prepare(`SELECT count (*) FROM ${gotwScoreTable} ${dbquery}`).bind(who, playerID, playerIP).raw();
    numScores = rawResults[0][0];
    console.log(`handleGotwGET(): ${gotwScoreTable} found ${numScores} previous games for ${gameType}, ${who}, ${playerID}, ${playerIP}`);

    // (2) check if the player has started a game
    if (numScores === 0) {
      const gotwStarted = `${CF_GOTW_TABLE}_started`;
      const startedResults = await env.DB.prepare(`SELECT count (*) FROM ${gotwStarted} ${dbquery}`).bind(who, playerID, playerIP).raw();
      numScores = startedResults[0][0];
      console.log(`handleGotwGET(): ${gotwStarted} found ${numScores} started games for ${gameType}, ${who}, ${playerID}, ${playerIP}`);
    }

    // (3) push this attempt into the gotw_started table
    if (playerIP === ``) playerIP = `0`; // to prevent (2) from picking up localhost
    const success = await insertGotwStarted(env, gameType, who, playerID, playerIP);
    console.log(`handleGotwGET(): insert into gotw_started:`, success);

    if (numScores === 0) {
      return new Response(file.body, SUCCESS_RESPONSE);
    } else {
      return new Response(file.body, { status: 451, headers: ALLOW_ORIGIN_HEADERS });
    }
  } catch (error) {
    console.error('handleGotwGET(): Error fetching file:', error);
    return new Response('Internal server error', { status: 500, headers: ALLOW_ORIGIN_HEADERS });
  }
}

//
//
// INSERT_GOTW_STARTED
//
//
async function insertGotwStarted(env, gameType, who, playerID, playerIP) {
  const week = getGotwLabel(new Date());
  const ularn = gameType === CF_ULARN ? 1 : 0;
  const { success } = await env.DB.prepare(
    `INSERT OR REPLACE INTO ${CF_GOTW_TABLE}_started (week, ularn, who, playerID, playerIP, createdAt)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
  )
    .bind(week, ularn, who, playerID, playerIP, Date.now())
    .run();
  return success;
}

//
//
// scheduled task for cleaning up old entries each week
//
// PRUNE_GOTW_STARTED_TABLE
//
//
export async function pruneGotwStartedTable(env) {
  const { success } = await env.DB.prepare(`DELETE FROM ${CF_GOTW_TABLE}_started`).run();
  return success;
}

//
//
// INIT_GOTW_STARTED_TABLE
//
//
export async function initGotwStartedTable(env) {
  console.log(`initGotwStartedTable(): creating ${CF_GOTW_TABLE}_started table`);
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS ${CF_GOTW_TABLE}_started (\
        week TEXT, \
        ularn INTEGER, \
        who TEXT, \
        playerID TEXT, \
        playerIP TEXT, \
        createdAt INTEGER);`
  ).run();
}
