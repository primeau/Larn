'use strict';

import { CF_LARN, CF_ULARN, CF_WINNERS, CF_VISITORS, CF_HIGHSCORES_TABLE, CF_GOTW_TABLE } from './cf_config.mjs';

import { ALLOW_ORIGIN_HEADERS, SUCCESS_RESPONSE, getGotwLabel } from './cf_tools.mjs';

const CF_MAX_SCOREBOARD_SIZE = 100; // only 72 shown on scoreboard, but keep some extras

const allOrder = `winner DESC, hardlev DESC, score DESC`; // visitors will be sorted properly, but not winners
const winOrder = `hardlev DESC, timeused ASC, score DESC`; // sort winners by difficulty, then time (shorter is better), then score
const visOrder = `hardlev DESC, score DESC, timeused DESC`; // sort visitors by difficulty, then score, then time (longer is better)

//
//
// HANDLE_HIGHSCORE_REQUEST /api/highscore/<larn|ularn>,[winners|visitors]
//
//
export async function handleHighscoreRequest(env, request, path) {
  // get all high scores
  if (request.method === 'GET') {
    console.log(`handleHighscoreRequest() path: ${path}`);

    let tablename = path[1] || CF_HIGHSCORES_TABLE;

    if (tablename === CF_GOTW_TABLE) {
      tablename = CF_GOTW_TABLE + `_` + getGotwLabel(new Date());
    }

    const args = path.length > 2 ? path[2].split(',') : null; // <larn|ularn>,[winners|visitors]
    const gameType = args ? args[0] : null;
    const endgameType = args ? args[1] : null;

    if (gameType && gameType !== CF_LARN && gameType !== CF_ULARN) {
      return new Response(`Bad Request: invalid game type`, { status: 500, statusText: `Bad Request: invalid game type`, headers: ALLOW_ORIGIN_HEADERS });
    }

    if (endgameType && endgameType !== CF_WINNERS && endgameType !== CF_VISITORS) {
      return new Response(`Bad Request: invalid endgame condition`, { status: 500, statusText: `Bad Request: invalid endgame condition`, headers: ALLOW_ORIGIN_HEADERS });
    }
    return await handleHighscoreGET(env, tablename, gameType, endgameType);
  }

  if (request.method === 'PUT') {
    // NO PUT -- high scores need to be submitted via the /api/score endpoint
  }

  return new Response(`Method not allowed`, { status: 405, statusText: `Method not allowed`, headers: ALLOW_ORIGIN_HEADERS });
}

//
//
// HANDLE_HIGHSCORE_GET
//
// all -> unused, but possible
// winners -> unused, not possible
// visitors -> unused, not possible
// larn -> larn scoreboard    / where ularn = false
// ularn -> ularn scoreboard  / where ularn = true
// larn winners -> scoreput   / where larn = true, winners = true
// larn visitors -> scoreput  / where larn = true, winners = false
// ularn winners -> scoreput  / where ularn = true, winners = true
// ularn visitors -> scoreput / where ularn = true, winners = false
//
//
export async function handleHighscoreGET(env, tablename, gameType, endgameType) {
  console.log(`handleHighscoreGET(): tablename=${tablename}, gameType=${gameType}, endgameType=${endgameType}`);

  let gameWhere = ``;
  if (gameType === CF_LARN) gameWhere = `WHERE ularn=0`;
  if (gameType === CF_ULARN) gameWhere = `WHERE ularn=1`;
  let endgameWhere = ``; // if endgame is null return all
  if (endgameType === CF_WINNERS) endgameWhere = ` AND winner=1`;
  if (endgameType === CF_VISITORS) endgameWhere = ` AND winner=0`;

  let order = allOrder;
  if (endgameType) order = endgameType === CF_WINNERS ? winOrder : visOrder;

  try {
    // console.log(`handleHighscoreGET(): SELECT * FROM ${tablename} ${gameWhere}${endgameWhere} ORDER BY ${order}`);
    let tableLimit = 4 * CF_MAX_SCOREBOARD_SIZE; // 4 different types of scoreboards
    let { results } = await env.DB.prepare(`SELECT * FROM ${tablename} ${gameWhere}${endgameWhere} ORDER BY ${order} LIMIT ${tableLimit}`).all();
    // success case
    if (results && results.length >= 0) {
      console.log(`handleHighscoreGET(): ${tablename} got ${results.length} high scores`);
      results = results.map((score) => getLarnHighscoreObject(score));
      return new Response(JSON.stringify(results), SUCCESS_RESPONSE);
    }
    // // no results found
    // else {
    //   console.log(`handleHighscoreGET(): ${tablename} empty scoreboard`);
    //   return new Response(`empty scoreboard`, { status: 404, statusText: `empty scoreboard`, headers: ALLOW_ORIGIN_HEADERS });
    // }
  } catch (error) {
    console.error(`handleHighscoreGET(): ${tablename}`, error);
    return new Response(error.message, { status: 500, statusText: error.message, headers: ALLOW_ORIGIN_HEADERS });
  }
}

//
//
// HANDLE_HIGHSCORE_PUT
//
// high scores are split into a master table and yearly tables
//
//
export async function handleHighscorePUT(env, score) {
  // 201: is a high score
  // 204: not a high score
  // 404: table doesn't exist
  // 500: error writing to table
  let tablename;
  let response;
  try {
    // game-of-the-week high score table, not eligible for regular scoreboards
    if (score.gotw) {
      tablename = `${CF_GOTW_TABLE}_${score.gotw}`;
      response = await scorePutHelper(env, score, tablename);
    } else {
      // first write to the yearly high score table
      const year = new Date(score.createdAt).getUTCFullYear();
      tablename = `${CF_HIGHSCORES_TABLE}_${year}`;
      response = await scorePutHelper(env, score, tablename, year);

      // next write to the all-time high score table
      if (response === 201) {
        tablename = CF_HIGHSCORES_TABLE;
        response = await scorePutHelper(env, score, tablename);
      }
    }
  } catch (error) {
    console.error(`handleHighscorePUT(): error writing to`, tablename, error.message);
    return new Response(`error writing to ${tablename}`, { status: 500, statusText: error.message, headers: ALLOW_ORIGIN_HEADERS });
  }

  return new Response(null, { status: response, statusText: `OK`, headers: ALLOW_ORIGIN_HEADERS });
}

async function scorePutHelper(env, score, tablename, year) {
  // 201: is a high score
  // 204: not a high score
  // 404: table doesn't exist
  // 500: error writing to table
  let response = await highscorePUT(env, score, tablename, year);
  if (response === 404) {
    // it's possible table doesn't exist yet - create it and try again
    console.log(`scorePutHelper(): creating ${tablename}`);
    await initHighscoresTable(env, tablename);
    console.log(`scorePutHelper(): checking ${tablename} again`);
    response = await highscorePUT(env, score, tablename, year);
  }
  return response;
}

//
//
// HIGHSCORE_PUT
//
//
async function highscorePUT(env, larnScore, tablename, year) {
  // 201: is a high score
  // 204: not a high score
  // 404: table doesn't exist
  // 500: error writing to table
  const score = getHighscoreTableObject(larnScore);

  // quick check to see if this score is even eligible for the scoreboard
  const potentialHighscore = isPotentialHighscore(score, tablename, year);
  if (!potentialHighscore) {
    console.log(`highScorePUT(): ${tablename} ${score.gameID} NOT a high score (quick check)`);
    return 204;
  }

  let insertScore = null; // if we decide to insert this score, why
  let scoresToDelete = []; // we may end up with more than one score to delete

  const totalScores = await getTotalScores(env, tablename, score);
  if (totalScores === -1) return 404; // table probably doesn't exist yet, calling function will create it and try again

  // if we have a full scoreboard, get the lowest score to compare against
  let lowestScore;
  if (totalScores >= CF_MAX_SCOREBOARD_SIZE) {
    lowestScore = await getLowestScore(env, tablename, score);
    const scoreDiff = compareScore(lowestScore, score);
    if (scoreDiff <= 0) {
      console.log(`highScorePUT(): ${tablename}:${score.gameID} NOT a high score (scoreDiff=${scoreDiff})`);
      return 204;
    }
  }

  // // don't do this -- players could have multiple names/ids/ips on the board already
  // // scoreboard is not full, this is a high score
  // if (highscores.length < CF_MAX_SCOREBOARD_SIZE) {
  //   insertScore = `scoreboard not full`;
  // }

  // this is a high score, but the player might already have score(s) on the board
  const previousScores = await getPreviousScores(env, tablename, score);

  // this player does not have a previous score on the board, so we want to add it
  if (previousScores.length === 0) {
    insertScore = `new player`;
    // mark lowest score for deletion
    if (lowestScore) scoresToDelete.push(lowestScore);
  } else {
    // gotw means only one try, so immediately return
    if (score.gotw) {
      console.log(`highScorePUT(): ${tablename}:${score.gameID} NOT a high score (GOTW prev score)`);
      return 204;
    }
  }

  // Add the current score to previousScores and sort to find highest
  previousScores.push(score);
  previousScores.sort(compareScore);
  if (previousScores[0].gameID === score.gameID) {
    if (previousScores.length > 1) {
      insertScore = `existing player`;
    }
  } else {
    console.log(`highScorePUT(): ${tablename}:${score.gameID} NOT a high score (not best for player)`);
    // return 204; // don't return yet, we still need to delete old scores
  }

  // Remove all previous scores except the top score (and the current score since it's not in the table yet)
  console.log(`highScorePUT(): ${tablename}:(0)`, scoreToString(previousScores[0]));
  for (let i = 1; i < previousScores.length; i++) {
    console.log(`highScorePUT(): ${tablename}:(${i})`, scoreToString(previousScores[i]));
    if (previousScores[i].gameID !== score.gameID) {
      scoresToDelete.push(previousScores[i]);
    }
  }

  // do deletes first so we can can return
  if (scoresToDelete.length > 0) {
    const gameIDsToDelete = scoresToDelete.map((score) => {
      return score.gameID;
    });
    const deleteResponse = await deleteHighscores(env, tablename, gameIDsToDelete);
  }

  // now we can insert the new high score
  if (insertScore) {
    console.log(`highScorePUT(): ${tablename} ${score.gameID} IS a high score (${insertScore})`);
    console.log(`highScorePUT(): ${tablename} writing high score:`, score.gameID);
    const insertResponse = await insertHighscore(env, tablename, score);
    return 201; // is a high score
  }

  return 204; // for the case we skipped above
}

//
//
// CONVERT_TO_CLOUDFLARE_SCORE
//
//
function getHighscoreTableObject(score) {
  return {
    gameID: score.gameID.toLowerCase(),
    ularn: score.ularn ? 1 : 0,
    winner: score.winner ? 1 : 0,
    hardlev: score.hardlev,
    score: score.score,
    who: score.who,
    character: score.character,
    timeused: score.timeused,
    moves: JSON.parse(score.player).MOVESMADE,
    what: score.what,
    level: score.level,
    playerID: score.playerID || ``,
    playerIP: score.playerIP || `0`,
    createdAt: score.createdAt || Date.now(),
    gotw: score.gotw || ``, // not stored in high score table, but used when evaluating high scores
  };
}

//
//
// GET_LARN_HIGHSCORE_OBJECT
//
//
function getLarnHighscoreObject(score) {
  return {
    gameID: score.gameID.toLowerCase(),
    ularn: score.ularn === 1,
    winner: score.winner === 1,
    hardlev: score.hardlev,
    score: score.score,
    who: score.who,
    character: score.character,
    timeused: score.timeused,
    moves: score.moves,
    what: score.what,
    level: score.level,
    playerID: score.playerID,
    playerIP: score.playerIP,
    createdAt: score.createdAt,
  };
}

//
//
// INSERT_HIGHSCORE
//
//
export async function insertHighscore(env, tablename, score) {
  // console.log(`insertHighscore()`, score.gameID);
  let { success } = await env.DB.prepare(
    `INSERT OR REPLACE INTO ${tablename}
    (gameID, ularn, winner, score, hardlev, who, character, timeused, moves, what, level, playerID, playerIP, createdAt) 
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)`
  )
    .bind(
      score.gameID.toLowerCase() || ``,
      score.ularn ? 1 : 0,
      score.winner ? 1 : 0,
      score.score || 0,
      score.hardlev || 0,
      score.who || ``,
      score.character || ``,
      score.timeused || 0,
      score.moves || 0,
      score.what || ``,
      score.level || ``,
      score.playerID || ``,
      score.playerIP || `0`,
      score.createdAt || Date.now()
    )
    .run();
  return success;
}

//
//
// IS_POTENTIAL_HIGHSCORE
//
//
function isPotentialHighscore(score, tablename, year) {
  // quick checks -- don't bother with debug and old games
  if (score.debug === 1) {
    // console.log(`isPotentialHighscore: debug == 1`);
    return false;
  }
  if (score.hardlev > 128) {
    // console.log(`isPotentialHighscore: hardlev > 128`);
    return false;
  }
  if (score.version && score.version == 1244) {
    // console.log(`isPotentialHighscore: game.version == 1244`);
    return false;
  }
  if (score.extra && score.extra[1] && score.extra[1] < 493) {
    // console.log(`isPotentialHighscore: build < 493`);
    return false;
  }

  // table possibilities: highscores | highscore_2025 | gotw_20yy-ww
  const yearly = tablename.startsWith(CF_HIGHSCORES_TABLE) && tablename.length > CF_HIGHSCORES_TABLE.length;
  const gotw = tablename.startsWith(CF_GOTW_TABLE);
  // more quick checks, we know there are scores better than these
  // yearly tables have lower high scores, so remove checks for those for now
  // we are writing all gotw games, so remove checks for those as well
  const minWinDiff = yearly || gotw ? 0 : score.ularn ? 8 : 8;
  const minLoseDiff = yearly || gotw ? 0 : score.ularn ? 15 : 15;
  const minTime = gotw ? 0 : 50;
  const minMoves = gotw ? 0 : 1000;

  if (score.winner) {
    if (score.hardlev < minWinDiff) {
      // console.log(`getLowestScore: min win diff ${score.hardlev} < ${minWinDiff}`);
      return false;
    }
  } else {
    if (score.timeused < minTime) {
      // console.log(`getLowestScore: min lose time ${score.timeused} < ${minTime}`);
      return false;
    }
    if (score.moves != 0 && score.moves < minMoves) {
      // console.log(`getLowestScore: min lose moves ${score.moves} < ${minMoves}`);
      return false;
    }
    if (score.hardlev < minLoseDiff) {
      // console.log(`getLowestScore: min lose diff ${score.hardlev} < ${minLoseDiff}`);
      return false;
    }
  }
  // passed quick checks, might be a high score
  return true;
}

//
//
// GET_TOTAL_SCORES
//
//
async function getTotalScores(env, tablename, score) {
  try {
    const query = `SELECT count(*) as total FROM ${tablename} WHERE ularn = ?1 AND winner = ?2`;
    const { results } = await env.DB.prepare(query)
      .bind(score.ularn ? 1 : 0, score.winner ? 1 : 0)
      .all();
    console.log(`getTotalScores(): ${tablename}`, results[0].total);
    return results[0].total;
  } catch (error) {
    if (error.message && error.message.includes('no such table')) {
      console.error(`getTotalScores(): ${tablename} doesn't exist`);
      return -1;
    } else {
      console.error(`getTotalScores(): ${tablename} error:`, error.message);
      throw error;
    }
  }
}

//
//
// GET_LOWEST_SCORE
//
//
async function getLowestScore(env, tablename, score) {
  let order = score.winner ? winOrder : visOrder;

  const query = `SELECT * FROM ${tablename} WHERE ularn = ?1 AND winner = ?2 ORDER BY ${order} LIMIT 1 OFFSET ${CF_MAX_SCOREBOARD_SIZE - 1}`;
  // console.log(`getLowestScore(): ${query}`);
  const { results } = await env.DB.prepare(query)
    .bind(score.ularn ? 1 : 0, score.winner ? 1 : 0)
    .all();
  console.log(`getLowestScore(): ${tablename}: `, scoreToString(results[0]));
  return results[0];
}

//
//
// GET_PREVIOUS_SCORES
//
//
async function getPreviousScores(env, tablename, score) {
  // most people will use the same name
  // some people will use different names but we can match on playerID
  // or sometimes the ip address is the same
  // old games may not have playerID or playerIP, so set to -1 in query to ensure no match

  // if (score.playerID === ``) score.playerID = `-1`;
  // if (score.playerIP === `0`) score.playerIP = `-1`;

  const dbquery = `
        SELECT gameID, hardlev, timeused, who, score, ularn, winner, playerID, playerIP, createdAt
        FROM ${tablename}
        WHERE (LOWER(who) = LOWER(?1) OR (playerID = ?2 AND playerID != '') OR (playerIP = ?3 AND playerIP != '0'))
        AND ularn = ?4
        AND winner = ?5
      `;
  const { results } = await env.DB.prepare(dbquery)
    // .bind(score.who, score.playerID === `` ? `-1` : score.playerID, score.playerIP === 0 ? `-1` : score.playerIP, score.ularn ? 1 : 0, score.winner ? 1 : 0)
    .bind(score.who, score.playerID, score.playerIP, score.ularn ? 1 : 0, score.winner ? 1 : 0)
    .all();
  if (results && results.length >= 0) {
    console.log(`getPreviousScores(): ${tablename} got ${results.length} previous scores`);
  } else {
    console.log(`getPreviousScores(): ${tablename} empty previous scores`);
  }
  return results || [];
}

// TODO this is duplicated in scores.js
export function compareScore(a, b) {
  //console.log(`a: ${a.hardlev}, ${a.score}, ${a.winner?a.winner:a.level}, ${a.timeused}`);
  //console.log(`b: ${b.hardlev}, ${b.score}, ${b.winner?b.winner:b.level}, ${b.timeused}`);

  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;

  // if (a.winner && !b.winner) {
  //   return 1;
  // }
  // if (!a.winner && b.winner) {
  //   return -1;
  // }
  // if (a.winner != b.winner) {
  // console.log(`a: ${a.winner}, b:${b.winner}`);
  //   return a.winner ? -1 : 1;
  // }

  if (a.hardlev != b.hardlev) {
    return b.hardlev - a.hardlev; // higher difficulty
  }

  if (a.winner) {
    if (a.timeused != b.timeused) {
      return a.timeused - b.timeused; // won in less time
    } else {
      return b.score - a.score; // won with higher score
    }
  } else {
    if (a.score != b.score) {
      return b.score - a.score; // died with higher score
    } else {
      return b.timeused - a.timeused; // alive longer
    }
  }
}

//
//
// DELETE_HIGHSCORES
//
//
async function deleteHighscores(env, tablename, gameIDs) {
  try {
    console.log(`deleteHighscores(): ${tablename} deleting high scores:`, gameIDs);
    const placeholders = gameIDs.map(() => '?').join(',');
    const { success } = await env.DB.prepare(`DELETE FROM ${tablename} WHERE gameID IN (${placeholders})`)
      .bind(...gameIDs)
      .run();
    return success;
  } catch (error) {
    console.error(`deleteHighscores(): error`, error.message);
    return false;
  }
}

//
//
// INIT_HIGHSCORES_TABLE
//
// NOTE: who is no longer unique because the high score table
//       now combines ularn/larn and winners/visitors
//
export async function initHighscoresTable(env, tablename) {
  console.log(`initHighscoresTable(): creating ${tablename} table`);
  const { success } = await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS ${tablename} (\
    gameID TEXT PRIMARY KEY, \
    ularn INTEGER, \
    winner INTEGER, \
    score INTEGER, \
    hardlev INTEGER, \
    who TEXT, \
    character TEXT, \
    timeused INTEGER, \
    moves INTEGER, \
    what TEXT, \
    level TEXT, \
    playerID TEXT, \
    playerIP TEXT, \
    createdAt INTEGER);`
  ).run();
  return success;
}

export function printHighScores(highscores) {
  console.log(`printHighScores() numhighscores`, highscores.length);
  for (const score of highscores) {
    printScore(score);
  }
}
function scoreToString(score) {
  return `${score.gameID.padEnd(12)} ${String(score.hardlev).padStart(3)} ${String(score.timeused).padStart(5)} ${score.who.padEnd(25)} \
  ${String(score.score).padStart(9)} U:${score.ularn}: W:${score.winner} ${score.playerID.padStart(5)} ${score.playerIP.padStart(40)} \
  ${new Date(score.createdAt).getUTCFullYear()}`;
}
function printScore(score) {
  console.log(scoreToString(score));
}
