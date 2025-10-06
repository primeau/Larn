'use strict';

import { CF_SCORES_TABLE } from './cf_config.mjs';

import { ALLOW_ORIGIN_HEADERS, SUCCESS_RESPONSE } from './cf_tools.mjs';

import { handleHighscorePUT } from './endpoint_highscores.mjs';
import { insertCompletedGame } from './endpoint_completed.mjs';

const MIN_FRAMES_FOR_COMPLETED_GAMES_TABLE = 2500;

//
//
// HANDLE_SCORE_REQUEST
//
//
export async function handleScoreRequest(env, request, path) {
  const gameID = path[1];

  if (request.method === 'GET') {
    return await handleScoreGET(env, gameID);
  }

  if (request.method === 'PUT') {
    const score = await request.json();
    return await handleScorePUT(env, score);
  }

  console.error(`handleScoreRequest(): not a PUT or GET request`);
  return new Response(`Method not allowed`, { status: 405, statusText: `Method not allowed`, headers: ALLOW_ORIGIN_HEADERS });
}

//
//
// HANDLE_SCORE_GET
//
//
export async function handleScoreGET(env, gameID) {
  try {
    const { results } = await env.DB.prepare(`SELECT * FROM ${getScoresTableName(gameID)} WHERE gameID=?1`)
      .bind(gameID)
      .all();
    // success case
    if (results && results.length === 1) {
      // console.log(`handleScoreGET(): gameID found`, gameID);
      return new Response(JSON.stringify(results[0]), SUCCESS_RESPONSE);
    }
    // no results found
    else {
      console.log(`handleScoreGET(): gameID not found`, gameID);
      return new Response(`gameID not found`, { status: 404, statusText: `gameID ${gameID} not found`, headers: ALLOW_ORIGIN_HEADERS });
    }
  } catch (error) {
    console.error(`handleScoreGET(): `, error);
    return new Response(error.message, { status: 500, statusText: error.message, headers: ALLOW_ORIGIN_HEADERS });
  }
}

//
//
// HANDLE_SCORE_PUT
//
//
export async function handleScorePUT(env, larnScore) {
  try {
    // console.log(`handleScorePUT():`, score.gameID);

    if (larnScore.gotw) larnScore.createdAt = Date.now(); // GOTW needs server time

    // TODO: add a function to check current week for GOTW and change "what" to "finished too late" if needed
    // it should still be inserted into the scores table, just not the GOTW high score table

    const cfScore = getScoreTableObject(larnScore);

    console.log(`handleScorePUT(): adding ${cfScore.gameID} ${cfScore.playerID}, ${cfScore.who}, ${cfScore.hardlev}, ${cfScore.score} U:${cfScore.ularn}: W:${cfScore.winner}`);
    const success = await insertScore(env, cfScore);

    let highscoreResponse;
    if (success) {
      // no filters for trying to add a high score - we want to add all gotw games
      highscoreResponse = await handleHighscorePUT(env, larnScore); // pass in unconverted score, highscores have a different schema
    }

    // also update the completed games table for larnTV
    const frames = larnScore.frames || cfScore.moves;
    const type = larnScore.frames ? `frames` : `moves`;
    if (cfScore.winner || frames > MIN_FRAMES_FOR_COMPLETED_GAMES_TABLE) {
      console.log(`handleScorePUT(): adding ${cfScore.gameID} to completed games table with ${frames} ${type}`);
      await insertCompletedGame(env, cfScore);
    } else {
      console.log(`handleScorePUT(): not adding ${cfScore.gameID} to completed games table: only ${frames} ${type}`);
    }

    if (highscoreResponse) {
      return highscoreResponse;
    } else {
      return new Response(null, SUCCESS_RESPONSE);
    }
  } catch (error) {
    console.error(`handleScorePUT(): error`, error.message);
    return new Response(error.message, { status: 500, statusText: error.message, headers: ALLOW_ORIGIN_HEADERS });
  }
}

//
//
// GET_SCORE_TABLE_OBJECT
//
//
function getScoreTableObject(score) {
  return {
    gameID: score.gameID.toLowerCase(),
    ularn: score.ularn ? 1 : 0,
    winner: score.winner ? 1 : 0,
    hardlev: score.hardlev,
    score: score.score,
    who: score.who,
    character: score.character || `Adventurer`,
    timeused: score.timeused,
    what: score.what,
    level: score.level,
    moves: JSON.parse(score.player).MOVESMADE,
    explored: score.explored || ``,
    gamelog: score.gamelog ? JSON.stringify(score.gamelog) : `[]`,
    stats: score.player,
    gender: score.gender || `Male`,
    gotw: score.gotw || ``,
    version: score.extra ? score.extra[0] : 0,
    build: score.extra ? score.extra[1] : 0,
    rmst: score.extra ? score.extra[2] : 0,
    gtime: score.extra ? score.extra[3] : 0,
    debug: score.debug || false,
    playerID: score.playerID || ``,
    playerIP: score.playerIP || `0`,
    browser: score.browser || ``,
    createdAt: score.createdAt || Date.now(),
  };
}

//
//
// INSERT_SCORE
//
//
async function insertScore(env, score) {
  // console.log(`insertScore()`, score.gameID);
  const { success } = await env.DB.prepare(
    `INSERT OR REPLACE INTO ${getScoresTableName(score.gameID)}
    (gameID, ularn, winner, hardlev, score, who, character, timeused, what, level, moves, explored, gamelog, stats, gender, gotw, version, build, rmst, gtime, debug, playerID, playerIP, browser, createdAt) 
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25)`
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
      score.explored || ``,
      score.gamelog || ``,
      score.stats || ``,
      score.gender || `Male`,
      score.gotw || ``,
      score.version || ``, // score.extra[0]
      score.build || 0, // score.extra[1]
      score.rmst || 0, // score.extra[2]
      score.gtime || 0, // score.extra[3]
      score.debug ? 1 : 0,
      score.playerID || ``,
      score.playerIP || `0`,
      score.browser || ``,
      score.gotw ? Date.now() : score.createdAt || Date.now()
    )
    .run();
  return success;
  // console.log(`D1 inserting score:`, score.gameID, results);
}

//
//
// generate scores table name
//
//
function getScoresTableName(gameID) {
  if (!gameID) return null;
  return `${CF_SCORES_TABLE}_${gameID[0]}`; // shard by first character
}

//
//
// DROP_SCORES_TABLES - 36 tables for 0-9, a-z
//
//
export async function dropScoresTables(env) {
  console.log(`dropScoresTables(): dropping ${CF_SCORES_TABLE} tables`);
  const PREFIXES = `0123456789abcdefghijklmnopqrstuvwxyz`;
  for (const prefix of PREFIXES) {
    const tableName = getScoresTableName(prefix);
    console.log(`dropScoresTables(): dropping table ${tableName}`);
    await env.DB.prepare(`DROP TABLE IF EXISTS ${tableName}`).run();
  }
}

//
//
// INIT_SCORES_TABLES - 36 tables for 0-9, a-z
//
//
export async function initScoresTable(env) {
  console.log(`initScoresTable(): creating scores tables`);
  const PREFIXES = `0123456789abcdefghijklmnopqrstuvwxyz`;

  for (const prefix of PREFIXES) {
    let tableName = getScoresTableName(prefix);
    console.log(`initScoresTable(): creating table ${tableName}`);

    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS ${tableName} (\
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
        explored TEXT, \
        gamelog TEXT, \
        stats TEXT, \
        gender TEXT, \
        gotw TEXT, \
        version TEXT, \
        build TEXT, \
        rmst INTEGER, \
        gtime INTEGER, \
        debug INTEGER, \
        playerID TEXT, \
        playerIP TEXT, \
        browser TEXT, \
        createdAt INTEGER);`
    ).run();
  }
}
