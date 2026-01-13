//TODO: break into multiple files (endgame, scoreboard (new class), scores)

'use strict';

let scoreBoard = [];
const EXTRA_VERSION = 0;
const EXTRA_BUILD = 1;
const EXTRA_RMST = 2;
const EXTRA_GTIME = 3;


let LocalScore = function () {
  this.createdAt = Date.now();
  this.ularn = ULARN;
  this.winner = lastmonst == DIED_WINNER;
  let winBonus = this.winner ? 100000 * getDifficulty() : 0;
  this.who = logname; /* the name of the character */
  this.gender = player ? player.gender : `Male`; /* ularn gender */
  this.character = player ? player.char_picked : `Adventurer`; /* ularn character class */
  this.hardlev = getDifficulty(); /* the level of difficulty player played at */
  this.score = player ? (player.GOLD + player.BANKACCOUNT + winBonus) : 0; /* the score of the player */
  this.timeused = Math.floor(gtime / 100); /* the time used in mobuls to win the game */
  this.what = getWhyDead(lastmonst); /* the number of the monster that killed player */
  this.level = LEVELNAMES[level]; /* the level player was on when he died */
  this.playerID = playerID; /* nothing nefarious, just a simple way to differentiate players in the game database */
  this.playerIP = playerIP; /* nothing nefarious, just a simple way to differentiate players in the game database */
  this.gameID = gameID + (dofs ? '+' : ''); /* unique game ID */
  this.debug = debug_used; /* did the player use debug mode? */
  this.gamelog = LOG; /* the last few lines of what happened */
  this.extra = [];
  this.extra[EXTRA_VERSION] = VERSION;
  this.extra[EXTRA_BUILD] = BUILD;
  this.extra[EXTRA_RMST] = rmst;
  this.extra[EXTRA_GTIME] = gtime;
  this.gotw = GOTW ? getGotwLabel(new Date()) : null;

  this.frames = -1;
  if (canRecord() && video) {
    const currentRoll = video.getCurrentRoll();
    const lastPatch = currentRoll.patches[currentRoll.patches.length - 1];
    this.frames = lastPatch ? lastPatch.id : 0;
  }

  this.explored = getExploredLevels();

  if (player) {
    this.player = JSON.stringify(player);
  }

  this.browser = `${navigator.vendor} (${navigator.userAgent})`;
}

LocalScore.prototype.toString = function () {
  return getStatString(this);
}



// dots:    + + + + @! + . . . . ~ . . . 
// default: H 1 2 3 4 5 6 7 8 9 10 V1 V2 V3
function getExploredLevels(dots) {
  let explored = ``;
  for (let i = 0; i < LEVELS.length; i++) {
    if (i === level) {
      explored += dots && amiga_mode ? `▓` : `@`;
      if (dots && isCarrying(createObject(OPOTION, 21))) explored += `!`;
    // } else if (LEVELS[i]) { // always true for GOTW games
    } else if (isLevelVisited(i)) {
      if (dots)
        explored += (i === DBOTTOM && player.hasPickedUpEye) ? `~` : `+`;
      else
        explored += LEVELNAMES[i];
    } else {
      explored += `·`;
    }
    explored += ` `;
  }
  return explored;
}



function getStatString(score, addDate) {

  if (!score) return `no info`;

  let stats = ``;
  let linkText = ``;
  let scoreGameID = score.gameID.split(`+`)[0];

  if (addDate) {
    try {
      let build = score.extra[EXTRA_BUILD];
      if (build) {
        build = build.substr(0, 3);
        if (Number(build) >= 481) {
          linkText = `https://larn.org/larn/tv/?gameid=${scoreGameID}`;
          stats += `<b><a href='${linkText}'>Watch this game</a></b>\n\n`;
        }
      }
    } catch (error) {
      // do nothing
    }
    stats += `Date: ${new Date(score.createdAt)}\n`;
  }

  let tempPlayer;
  if (score.player.inventory) {
    tempPlayer = loadPlayer(score.player);
  } else {
    tempPlayer = loadPlayer(JSON.parse(score.player));
  }

  stats += `Player: ${score.who}\n`;
  if (ULARN && score.character) stats += `Class:  ${score.character}\n`;
  stats += `Diff:   ${score.hardlev}\n`;
  stats += `Score:  ${score.score}\n`;
  stats += `Mobuls: ${score.timeused}\n`;
  stats += `Winner: ${score.winner ? 'Yes' : 'No'}\n`;
  if (!score.winner) {
    stats += `Fate: ${score.what} on ${score.level}\n`;
  }
  stats += `\n${debug_stats(tempPlayer, score)}\n`;
  if (score.explored) {
    stats += `Levels Visited:\n${score.explored}\n\n`;
  }

  if (score.gamelog) {
    let logString = score.gamelog.join('\n').trim();
    stats += `Final Moments: \n${logString}\n\n`;
  }

  stats += `Bottom Line:\n${tempPlayer.getBottomLine(score.level)}\n\n`;

  stats += `Conducts observed:\n${tempPlayer.getConductString()}\n\n`;

  if (score.debug) {
    stats += `Debug mode used!\n\n`;
  }

    // filter out tv urls for current gotw games
  if (GOTW) {
    stats = stats.replaceAll(scoreGameID, 'dQw4w9WgXcQ');
  }
  
  return stats;
}



function sortScore(a, b) {
  //console.log(`a: ${a.hardlev}, ${a.score}, ${a.winner?a.winner:a.level}, ${a.timeused}`);
  //console.log(`b: ${b.hardlev}, ${b.score}, ${b.winner?b.winner:b.level}, ${b.timeused}`);

  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;

  if (a.hardlev != b.hardlev) {
    return b.hardlev - a.hardlev; // higher difficulty
  }

  if (a.winner) {
    if (a.timeused != b.timeused) {
      return a.timeused - b.timeused // won in less time
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





/* function for reading / displaying the scoreboard */





let winners = [];
let losers = [];
let scoreIndex = 0;


const MAX_SCORES_PER_PAGE = 18;
const MAX_SCORES_TO_READ = 18 * 4;
const MIN_TIME_PLAYED = 50;


let A, R, O; // saved state for exiting scoreboard

function loadScores(newScore, showWinners, showLosers) {

  A = amiga_mode;
  R = retro_mode;
  O = original_objects;
  mazeMode = false;
  amiga_mode = false;
  clear();
  lprcat(`Loading Scoreboard...\n`);

  if (GAMEOVER) detachDisplay(); // stop using 80x24 grid, this is a pretty weird hack

  dbQueryHighScores(newScore, showWinners, showLosers);

}



async function dbQueryHighScores(newScore, showWinners, showLosers) {

  if (!navigator.onLine) {
    const msg = `Offline: showing local scoreboard`;
    showLocalScoreBoard(newScore, showWinners, showLosers, 0, msg);
    return;
  }

  try {
    const cfhighscores = await getHighscores();
    if (cfhighscores) {
      winners = cfhighscores.winners;
      if (winners) console.log(`loaded winners: ${winners.length}`);
      losers = cfhighscores.visitors;
      if (losers) console.log(`loaded losers: ${losers.length}`);
      showScores(newScore, false, showWinners, showLosers, 0);
    } else {
      throw new Error('Error loading highscores');
    }
  } catch (error) {
    console.error('Failed to get highscores from Cloudflare:', error);
    const msg = `Error loading global scoreboard, showing local scoreboard`;
    showLocalScoreBoard(newScore, showWinners, showLosers, 0, msg);
  }
}



function showLocalScoreBoard(newScore, showWinners, showLosers, offset, message) {
  showScores(newScore, true, showWinners, showLosers, offset);
  setDiv(`STATS`, message);
}



const WINNER_HEADER_LARN = `     <b>Score   Difficulty   Winner                    Time Needed</b>                      `;
const WINNER_HEADER_ULARN = `     <b>Score  Diff  Winner                    Class        Time Needed</b>                         `;
const VISITOR_HEADER_LARN = `     <b>Score   Difficulty   Visitor                   Fate</b>                             `;
const VISITOR_HEADER_ULARN = `     <b>Score  Diff  Visitor                   Class       Fate</b>                                 `;


let bound_exitscores; // for button callback comparison
function exitscores(newScore, local, key) {
  if (key == ESC || key == ENTER) {
    scoreIndex = 0;
    setMode(A, R, O);
    nomove = 1;
    return exitbuilding();
  }
  if (key == ' ') {
    if (scoreIndex < winners.length) {
      showScores(newScore, local, true, false, 0);
    } else {
      showScores(newScore, local, false, true, winners.length);
      if (scoreIndex >= winners.length + losers.length) {
        scoreIndex = 0;
      }
    }
  }
}

function showScores(newScore, local, showWinners, showLosers, offset) {
  mazeMode = false;

  const gotwLabel = GOTW ? ` Weekly ` : ` `;
  const movesLabel = GOTW ? ` ` : ` (Games > ${MIN_TIME_PLAYED} mobuls)`;

  if (!GAMEOVER) clear();

  if (local) {
    lprcat(`                    <b>${GAMENAME} Scoreboard</b> (Global scoreboard not available)\n\n`);
    winners = localStorageGetObject('winners', []).sort(sortScore);
    losers = localStorageGetObject('losers', []).sort(sortScore);
  } else {
    if (showWinners && !showLosers)
      lprcat(`                  <b>${GAMENAME}${gotwLabel}Winners Scoreboard</b>\n\n`);
    else if (showLosers && !showWinners)
      lprcat(`                  <b>${GAMENAME}${gotwLabel}Visitors Scoreboard</b>${movesLabel}\n\n`);
    else
      lprcat(`                  <b>${GAMENAME}${gotwLabel}Scoreboard</b>${movesLabel}\n\n`);
  }

  if (GAMEOVER) {
    lprc(`<b>This game</b> (Click score for more info)`);
    lprc(`<hr>`);
    if (newScore.winner) {
      lprcat(ULARN ? WINNER_HEADER_ULARN : WINNER_HEADER_LARN);
    } else {
      lprcat(ULARN ? VISITOR_HEADER_ULARN : VISITOR_HEADER_LARN);
    }
    lprc(`\n`);
    printScore(newScore);
    lprc(`<hr>\n`);
  }

  if (winners.length != 0 || losers.length != 0) {
    if (showWinners) {
      printScoreBoard(winners, ULARN ? WINNER_HEADER_ULARN : WINNER_HEADER_LARN, offset);
      lprc(`\n`);
    }
    if (showLosers) {
      printScoreBoard(losers, ULARN ? VISITOR_HEADER_ULARN : VISITOR_HEADER_LARN, offset);
    }
  } else {
    lprcat(`\n  The scoreboard is empty`);
  }

  cursor(1, 23);
  if (GAMEOVER) lprc(`\n`);

  lprcat(`                     Click on a score for more information\n`);
  if (!GAMEOVER) {
    lprcat(`             ----  Press <b>space</b> for next page, <b>escape</b> to exit  ----`);
    bound_exitscores = exitscores.bind(null, newScore, local);
    setCharCallback(bound_exitscores);
  } else {
    lprcat(`                 ----  Reload your browser to play again  ----`);
  }
  blt();
}



function printScore(p) {
  let score;
  if (p.winner) {
    if (ULARN) {
      score = `${padString(Number(p.score).toLocaleString(), 10)}  ${padString(`` + p.hardlev, 4)}  ${padString(p.who, -24)}  ${padString(p.character, -10)}  ${padString(`` + p.timeused, 5)} Mobuls`;
    } else {
      score = `${padString(Number(p.score).toLocaleString(), 10)}   ${padString(`` + p.hardlev, 10)}   ${padString(p.who, -25)}${padString(`` + p.timeused, 5)} Mobuls`;
    }
  } else {
    if (ULARN) {
      score = `${padString(Number(p.score).toLocaleString(), 10)}  ${padString(`` + p.hardlev, 4)}  ${padString(p.who, -24)}  ${padString(p.character, -10)}  ${p.what} on ${p.level}`;
    } else {
      score = `${padString(Number(p.score).toLocaleString(), 10)}   ${padString(`` + p.hardlev, 10)}   ${padString(p.who, -25)} ${p.what} on ${p.level}`;
    }
  }
  const endcode = GAMEOVER ? `<br>` : ``;

  const isNewScore = gameID ? p.gameID.split(`+`)[0] == gameID.split(`+`)[0] : false;
  const addplus = isNewScore && dofs ? `+` : ``;

  if (isNewScore) {
    score = `<b>${score}</b>`;
  }

  // console.log(`score.js`, dofs, gameID, p.gameID, isNewScore, addplus, `${p.gameID}${addplus}`);
  lprcat(`<a href='javascript:dbQueryLoadGame("${p.gameID}${addplus}", ${!navigator.onLine}, ${p.winner})'>${score}</a>${endcode}`);
  if (!GAMEOVER) lprc(`\n`);
}



function printScoreBoard(board, header, offset) {

  lprcat(header);
  lprc(`\n`);

  let i = GAMEOVER ? 0 : scoreIndex - offset;
  for (let count = 0; i < board.length; i++, scoreIndex++) {

    if (!GAMEOVER && ++count > MAX_SCORES_PER_PAGE) {
      break;
    }

    const p = board[i];
    //console.log(i + ` ` + p.gameID + ` ` + p.who + `, ` + p.score);
    printScore(p);

  } // end for

}



async function dbQueryLoadGame(gameID, local, winner) {
  const endGameScore = new LocalScore();
  let stats = ``;

  // clicked on current game
  if (endGameScore.gameID === gameID) {
    stats = getStatString(endGameScore, true);
  } else {
    if (local) {
      // read from local scoreboard
      const board = winner ? localStorageGetObject('winners', []) : localStorageGetObject('losers', []);
      const scoreInfo = getHighScore(board, gameID);
      stats = getStatString(scoreInfo, true);
    } else {
      // read from cloudflare
      stats = await cloudflareLoadGame(gameID); // loadgame calls getStatString()
    }
  }
  setDiv(`STATS`, stats);
}





/* function for writing to the scoreboard */





function localWriteHighScore(newScore) {
  try {
    const boardname = newScore.winner ? 'winners' : 'losers';
    let board = localStorageGetObject(boardname, []);
    board.push(newScore);
    board = consolidateScoreboard(board);
    localStorageSetObject(boardname, board);
  } catch (error) {
    console.error('localWriteHighScore():', error);    
  }
}



// this is overkill, but there was a bug where there were multiple entries 
// for the same player, so this will clean that up
function consolidateScoreboard(scores) {
  const bestScores = {};
  for (const score of scores) {
    const key = score.who;
    if (!bestScores[key] || sortScore(score, bestScores[key]) < 0) {
      bestScores[key] = score;
    }
  }
  return Object.values(bestScores);
}



function getHighScore(scoreboard, gameID) {
  for (let i = 0; i < scoreboard.length; i++) {
    if (scoreboard[i].gameID === gameID) {
      return scoreboard[i];
    }
  }
  return null;
}



function isHighestScoreForPlayer(scoreboard, score) {
  for (let i = 0; i < scoreboard.length; i++) {
    const tmp = scoreboard[i];
    if (tmp.who == score.who && tmp.winner == score.winner) {
      if (sortScore(tmp, score) < 0) return false;
    }
  }
  return true;
}





/* functions for ending the game */





/*
 *  int paytaxes(x)         Function to pay taxes if any are due
 *
 *  Enter with the amount (in gp) to pay on the taxes.
 *  Returns amount actually paid.
 */
// TODO, maybe
function paytaxes(x) {
  return 0;
  // int i;
  // int amt;
  //
  // if (x<0) return(0);
  // if (readboard()<0) return(0L);
  // for (i=0; i<SCORESIZE; i++)
  // 	if (strcmp(winr[i].who, logname) == 0) /* look for players winning entry */
  // 		if (winr[i].score>0) /* search for a winning entry for the player */
  // 		{
  // 			amt = winr[i].taxes;
  // 			if (x < amt) amt=x;     /* don't overpay taxes (Ughhhhh) */
  // 			winr[i].taxes -= amt;
  // 			outstanding_taxes -= amt;
  // 			if (writeboard()<0)
  // 				return(0);
  // 			return(amt);
  // 		}
  // 		return(0L); /* couldn't find user on winning scoreboard */
}



function getWhyDead(reason) {
  let cause = ``;
  if (typeof reason === `number`) {
    cause += DEATH_REASONS.get(reason);
  } else {
    const n = (/^[aeiouAEIOU]/.test(lastmonst)) ? `n` : ``;
    cause += `killed by a${n} ${lastmonst}`;
  }
  return cause;
}



function canProtect(reason) {
  let protect = true;
  if (typeof reason === `number`) {
    // do nothing
  } else {
    // reason is a monster object
    reason = 0; // TODO check for unseen attacker?
  }
  switch (reason) {
    case DIED_WINNER:
    case DIED_SAVED_GAME:
    case DIED_FAILED:
    case DIED_QUITTER:
    case DIED_BOTTOMLESS_PIT:
    case DIED_BOTTOMLESS_TRAPDOOR:
    case DIED_BOTTOMLESS_ELEVATOR:
    case DIED_GENIE:
    case DIED_CHEATER:
    case DIED_RETRIED_GOTW:
      protect = false;
  }
  return protect;
}



/*
 * Subroutine to record who played larn, and what the score was
 */
async function died(reason, slain) {

  if (player.LIFEPROT > 0) {
    if (canProtect(reason)) {
      --player.LIFEPROT;
      player.setConstitution(player.CONSTITUTION - 1);
      player.setHP(1);
      updateLog(`You feel wiiieeeeerrrrrd all over!`);
      //nap(2000);
      return;
    }
  }

  const winner = reason === DIED_WINNER;
  player.winner = winner;
  player.reason = reason;
  GAMEOVER = true;

  if (ULARN) {
    let failGender = `their`;
    if (player.gender == `Male`) failGender = `his`;
    if (player.gender == `Female`) failGender = `her`;
    DEATH_REASONS.set(DIED_FAILED, `killed ${failGender} family and committed suicide`);
  }

  if (!winner && slain) {
    updateLog(`You have been slain!`);
  }

  // paint(); // removed
  nomove = 1;
  dropflag = 1;

  /* delete the checkpoint file */
  localStorageRemoveItem('checkpoint');

  let endGameScore = null; // will stay null if saved game

  // show scoreboard unless they saved the game
  if (reason != DIED_SAVED_GAME) {
    const printFunc = mazeMode ? updateLog : lprcat;
    lastmonst = reason; // for scoreboard

    const extraNL = (printFunc == lprcat) ? `\n` : ``;
    try {
      if (navigator.onLine && ENABLE_RECORDING && reason != DIED_RETRIED_GOTW) {
        const linkText = `https://larn.org/larn/tv/?gameid=${gameID}`;
        if (amiga_mode) {
          printFunc(`Replay Link: <a href='${linkText}'>${linkText}</a>${extraNL}${extraNL}`);
        } else {
          printFunc(`Replay Link: <a href='${linkText}'><b>${linkText}</b></a>${extraNL}${extraNL}`);
        }
      }
    } catch (error) {
      // do nothing
    }

    printFunc(`Press <b>enter</b> to view the scoreboard ${extraNL}`);
    if (wizard) printFunc(`(sorry, wizard scores are not recorded) `);
    if (cheat) printFunc(`(sorry, cheater scores are not recorded) `);

    endGameScore = new LocalScore();

    if (winner) {
      // trigger to show mail next time
      localStorageSetObject(logname, endGameScore);
    }

    writeScoreToDatabase(endGameScore);
    setCharCallback(endgame);

    paint();
  } else {
    // game saved
    updateLog(`----  Reload your browser to play again  ----`);
    setCharCallback(dead);
    paint(); // last live frame will get sent here

    processRecordedFrame(video?.createEmptyFrame()); // record fade to blank screen so we can easily refresh on reload

    side_inventory = true;
    game_started = false;
    napping = true;
    mazeMode = false;
  }

  // wait for the final patch to be added to the final roll of the video
  // this is a terrible hack, but after using web workers to speed up the game 30x in some places
  // i've spent 2 days trying to get the final frame to show up on a recording and i give up
  await nap(100);

  endRecording(endGameScore, ULARN);

}



async function writeScoreToDatabase(endGameScore) {
  const survived = endGameScore.timeused > 5; // surviving > 5 mobuls with 0 score should be recorded
  const scored = endGameScore.score > 0;
  const retriedGOTW = GOTW && endGameScore.what === DEATH_REASONS.get(DIED_RETRIED_GOTW);
  console.log(`score ==`, endGameScore.score);
  console.log(`wizard ==`, wizard);
  console.log(`cheater ==`, cheat);
  console.log(`debug ==`, debug_used);
  console.log(`survived ==`, survived);
  console.log(`scored ==`, scored);
  console.log(`retried ==`, retriedGOTW);

  if (!wizard && // no wizards
      !cheat && // no cheaters
      (endGameScore.winner || scored || survived || GOTW) && // winners, scorers, lived > 5 mobuls
      !retriedGOTW // on first GOTW attempt
    ) {
    localWriteHighScore(endGameScore);

    if (!navigator.onLine) {
      console.error(`writeScoreToDatabase(): offline`);
      return;
    }

    try {
      await cloudflareWriteHighScore(endGameScore);
    } catch (error) {
      console.error(`cloudflareWriteHighScore():`, error);
    }
  }

  try {
    const newScore = endGameScore;
    if (newScore.gotw) {
      doRollbar(ROLLBAR_INFO, `GOTW`, `gotw:${newScore.gotw}`, `U=${newScore.ularn}, ${newScore.who}, diff=${newScore.hardlev}, time=${newScore.timeused}, score=${newScore.score}, ${newScore.what} on ${newScore.level}, ${newScore.playerID}, ${newScore.gameID}`);
    } else {
      if (newScore.winner) {
        doRollbar(ROLLBAR_INFO, `winner`, `${newScore.who}, diff=${newScore.hardlev}, time=${newScore.timeused}, score=${newScore.score}, ${newScore.playerID}, ${newScore.gameID}`);
      } else if (rnd(100) < 11) {
        doRollbar(ROLLBAR_INFO, `visitor`, `${newScore.who}, diff=${newScore.hardlev}, time=${newScore.timeused}, score=${newScore.score}, ${newScore.what} on ${newScore.level}, ${newScore.playerID}, ${newScore.gameID}`);
      }
    }
  } catch (error) {
  }

}



function endgame(key) {
  if (key != ENTER) {
    return 0;
  }

  setCharCallback(dead);
  GAMEOVER = true;
  if (!side_inventory) {
    side_inventory = true;
    onResize();
  }
  game_started = false;
  napping = true;
  mazeMode = false;

  const endGameScore = new LocalScore();
  loadScores(endGameScore, true, true);
}



function dead(key) {
  return 0;
}