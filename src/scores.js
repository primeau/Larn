//TODO: break into multiple files (endgame, scoreboard (new class), scores)

'use strict';

var scoreBoard = [];
const EXTRA_VERSION = 0;
const EXTRA_BUILD = 1;
const EXTRA_RMST = 2;
const EXTRA_GTIME = 3;


var LocalScore = function () {
  this.createdAt = Date.now();
  this.winner = lastmonst == DIED_WINNER;
  var winBonus = this.winner ? 100000 * getDifficulty() : 0;
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

  this.explored = ``;
  for (var i = 0; i < LEVELS.length; i++) {
    this.explored += LEVELS[i] ? `${LEVELNAMES[i]}` : `.`;
    this.explored += (i == level) ? 'x' : ' ';
  }

  // START HACK -- we don't want to save the level
  if (player) {
    var x = player.level;
    player.level = null;
    this.player = JSON.stringify(player);
    player.level = x;
  }
  // END HACK -- we don't want to save the level

  this.browser = `${navigator.vendor} (${navigator.userAgent})`;
}

LocalScore.prototype.toString = function () {
  var stats = getStatString(this);
  return stats;
}



function createLocalScore() {
  let ls = new LocalScore();
  ls.gamelog = null;
  ls.player = null;
  ls.extra = null;
  ls.browser = null;
  ls.ularn = ULARN;
  return ls;
}



function getStatString(score, addDate) {

  if (!score) return `no info`;

  var stats = ``;

  if (addDate) {
    try {
      let build = score.extra[EXTRA_BUILD];
      if (build) {
        build = build.substr(0, 3);
        if (Number(build) >= 481) {
          let linkText = window.location.href.split(`?`)[0];
          linkText = linkText.split('/larn.html')[0] + `/tv/?gameid=${score.gameID.split(`+`)[0]}`;
          linkText = `<b><a href='${linkText}'>Watch this game</a></b>`;
          stats += `${linkText}\n\n`;
        }
      }
    } catch (error) {
      // do nothing
    }
    stats += `Date: ${new Date(score.createdAt)}\n`;
  }

  var tempPlayer;
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
    var logString = score.gamelog.join('\n').trim();
    if (logString.includes(`Replay`) && !logString.endsWith(`>`)) logString += `>`; // bugfix for missing > in some games
    stats += `Final Moments: \n${logString}\n\n`;
  }

  stats += `Bottom Line:\n${tempPlayer.getStatString(score.level)}\n\n`;

  stats += `Conducts observed:\n${tempPlayer.getConductString()}\n\n`;

  if (score.debug) {
    stats += `Debug mode used!\n\n`;
  }

  return stats;
}



function isEqual(a, b) {
  var equal = true;
  equal &= (a.gameID == b.gameID);
  equal &= (a.who == b.who);
  equal &= (a.hardlev == b.hardlev);
  equal &= (a.winner == b.winner);
  equal &= (a.score == b.score);
  equal &= (a.timeused == b.timeused);
  equal &= (a.what == b.what);
  equal &= (a.level == b.level);
  equal &= (a.explored == b.explored);
  equal &= (a.debug == b.debug);
  equal &= compareArrays(a.gamelog, b.gamelog);
  equal &= (JSON.stringify(a.player) == JSON.stringify(b.player));
  return equal;
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
    } else if (a.level != b.level) {
      return b.level - a.level; // survived deeper
    } else {
      return b.timeused - a.timeused; // alive longer
    }
  }

}





/* function for reading / displaying the scoreboard */





var winners = [];
var losers = [];
var scoreIndex = 0;


const MAX_SCORES_PER_PAGE = 18;
const MAX_SCORES_TO_READ = 18 * 4;
const MIN_TIME_PLAYED = 50;
const ENDPOINT = 'score';
var ONLINE = true;


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



function dbQueryHighScores(newScore, showWinners, showLosers) {

  if (!navigator.onLine) {
    ONLINE = false;
    let msg = `Offline: showing local scoreboard`;
    showLocalScoreBoard(newScore, showWinners, showLosers, 0, msg);
    return;
  }

  var params = {
    FunctionName: ENDPOINT,
    Payload: `{ "gamename" : "${GAMENAME}", "gameID" : "board" }`,
    InvocationType: 'RequestResponse',
    LogType: 'None' // 'Tail' // 'None' // 
  };

  lambda.invoke(params, function (error, data) {
    var payload = data ? JSON.parse(data.Payload) : null;
    var status = payload ? payload.statusCode : 444;
    if (status == 200) {
      var newData = JSON.parse(payload.body);

      // only return top 72 so the end game scoreboard
      // doesn't overflow above 80 
      winners = newData[0].slice(0, MAX_SCORES_TO_READ);
      console.log(`loaded winners: ${winners.length}`);

      losers = newData[1].slice(0, MAX_SCORES_TO_READ);
      console.log(`loaded visitors: ${losers.length}`);

      ONLINE = true;
      showScores(newScore, false, showWinners, showLosers, 0);
    } else if (status == 404) {
      let stats = `Couldn't find global scoreboard, showing local scoreboard`;
      ONLINE = false;
      showLocalScoreBoard(newScore, showWinners, showLosers, 0, stats);
    } else {
      var statuscode = data ? data.StatusCode : 555;
      console.log(`lambda error: lambda status=${statuscode} larn status=${status}`);
      if (error) console.log(error, error.stack);
      let stats = `Error loading global scoreboard, showing local scoreboard`;
      ONLINE = false;
      showLocalScoreBoard(newScore, showWinners, showLosers, 0, stats);
    }
  });

}



function showLocalScoreBoard(newScore, showWinners, showLosers, offset, message) {
  showScores(newScore, true, showWinners, showLosers, offset);
  setDiv(`STATS`, message);
}



const WINNER_HEADER_LARN = `     <b>Score   Difficulty   Winner                    Time Needed</b>                      `;
const WINNER_HEADER_ULARN = `     <b>Score  Diff  Winner                   Class        Time Needed</b>                         `;
const VISITOR_HEADER_LARN = `     <b>Score   Difficulty   Visitor                   Fate</b>                             `;
const VISITOR_HEADER_ULARN = `     <b>Score  Diff  Visitor                  Class       Fate</b>                                 `;


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
  if (!GAMEOVER) clear();

  if (local) {
    lprcat(`                    <b>${GAMENAME} Scoreboard</b> (Global scoreboard not available)\n\n`);
    winners = localStorageGetObject('winners', []);
    losers = localStorageGetObject('losers', []);
  } else {
    if (showWinners && !showLosers)
      lprcat(`                  <b>${GAMENAME} Winners Scoreboard</b>\n\n`);
    else if (showLosers && !showWinners)
      lprcat(`                  <b>${GAMENAME} Visitors Scoreboard</b> (Games > ${MIN_TIME_PLAYED} mobuls)\n\n`);
    else
      lprcat(`                  <b>${GAMENAME} Scoreboard</b> (Games > ${MIN_TIME_PLAYED} mobuls)\n\n`);
  }

  if (GAMEOVER) {
    lprc(`<b>This game</b> (Click score for more info)`);
    lprc(`<hr>`);
    if (newScore.winner) {
      printWithoutSpacesAtTheEnd(ULARN ? WINNER_HEADER_ULARN : WINNER_HEADER_LARN);
    } else {
      printWithoutSpacesAtTheEnd(ULARN ? VISITOR_HEADER_ULARN : VISITOR_HEADER_LARN);
    }
    lprc(`\n`);
    printScore(newScore);
    lprc(`<hr>\n`);
  }

  if (winners.length != 0 || losers.length != 0) {
    if (showWinners) {
      printScoreBoard(winners, newScore, ULARN ? WINNER_HEADER_ULARN : WINNER_HEADER_LARN, printScore, offset);
      lprc(`\n`);
    }
    if (showLosers) {
      printScoreBoard(losers, newScore, ULARN ? VISITOR_HEADER_ULARN : VISITOR_HEADER_LARN, printScore, offset);
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
  var endcode = GAMEOVER ? `<br>` : ``;

  var isNewScore = gameID ? p.gameID == gameID : false;
  var addplus = isNewScore && dofs ? `+` : ``;
  // console.log(`score.js`, dofs, gameID, p.gameID, isNewScore, addplus, `${p.gameID}${addplus}`);
  lprc(`<a href='javascript:dbQueryLoadGame("${p.gameID}${addplus}", ${!ONLINE}, ${p.winner})'>`);
  printWithoutSpacesAtTheEnd(`${score}</a>${endcode}`);
  if (!GAMEOVER) lprc(`\n`);
}



function printWithoutSpacesAtTheEnd(inputString) {
  for (let index = 0; index < Math.min(78, inputString.length); index++) {
    const c = inputString[index];
    lprc(c);
  }
  lprc(inputString.substr(78));
}



function printScoreBoard(board, newScore, header, printout, offset) {

  printWithoutSpacesAtTheEnd(header);
  lprc(`\n`);

  var i = GAMEOVER ? 0 : scoreIndex - offset;
  for (var count = 0; i < board.length; i++, scoreIndex++) {

    if (!GAMEOVER && ++count > MAX_SCORES_PER_PAGE) {
      break;
    }

    var p = board[i];
    //console.log(i + ` ` + p.gameID + ` ` + p.who + `, ` + p.score);

    var isNewScore = newScore ? p.gameID == newScore.gameID : false;

    if (isNewScore) {
      lprc(START_BOLD);
    }

    printout(p);

    if (isNewScore) {
      lprc(END_BOLD);
    }

  } // end for

}



function dbQueryLoadGame(gameId, local, winner) {

  if (local) {
    var board = winner ? localStorageGetObject('winners', []) : localStorageGetObject('losers', []);
    var stats = getHighScore(board, gameId);
    setDiv(`STATS`, getStatString(stats));
    return;
  }

  console.log(`loading game: ${gameId}`);

  var params = {
    FunctionName: ENDPOINT,
    Payload: `{ "gamename" : "${GAMENAME}", "gameID" : "${gameId}" }`,
    InvocationType: 'RequestResponse',
    LogType: 'None' // 'Tail'
  };
  lambda.invoke(params, function (error, data) {
    var payload = data ? JSON.parse(data.Payload) : null;
    var status = payload ? payload.statusCode : 666;
    var stats = ``;
    if (status == 200) {
      ONLINE = true;
      var newData = JSON.parse(payload.body);
      stats = getStatString(newData, true);
    } else if (status == 404) {
      stats = `Couldn't load game ${gameId}`;
      console.log(`larn status=${status}`);
    } else {
      var statuscode = data ? data.StatusCode : 777;
      console.log(`lambda error: lambda status=${statuscode} larn status=${status}`);
      if (error) console.log(error, error.stack);
      stats = `Couldn't load game ${gameId}`;
    }
    setDiv(`STATS`, stats);
  });

}





/* function for writing to the scoreboard */





function localWriteHighScore(newScore) {
  // console.log(`localWriteHighScore: ` + newScore);

  // write high score to board
  // TODO there is lots of duplication here...
  if (newScore.winner) {
    let winners = localStorageGetObject('winners', []);
    if (isHighestScoreForPlayer(winners, newScore)) {
      let scoreArrayIndex = getHighScoreIndex(winners, newScore.who);
      console.log(`writing high score to local winners scoreboard`);
      winners[scoreArrayIndex] = newScore;
      localStorageSetObject('winners', winners);
    }

    // trigger to show mail next time
    localStorageSetObject(newScore.who, newScore);

  } else {
    let losers = localStorageGetObject('losers', []);
    if (isHighestScoreForPlayer(losers, newScore)) {
      let scoreArrayIndex = getHighScoreIndex(losers, newScore.who);
      console.log(`writing high score to local visitors scoreboard`);
      losers[scoreArrayIndex] = newScore;
      localStorageSetObject('losers', losers);
    }
  }
}


function dbWriteHighScore(newScore) {

  console.log(`dbWriteHighScore: ${newScore.gameID}`);

  if (!navigator.onLine) {
    console.log(`dbWriteHighScore: offline`);
    ONLINE = false;
    return;
  }

  var params = {
    FunctionName: ENDPOINT,
    Payload: `{ "gamename" : "${GAMENAME}", "newScore" : ${JSON.stringify(newScore)} }`,
    InvocationType: 'RequestResponse',
    LogType: 'None' // 'Tail'
  };

  lambda.invoke(params, function (error, data) {
    if (data) {
      var payload = JSON.parse(data.Payload);
      var status = payload.statusCode;
      if (status == 200) {
        ONLINE = true;
        console.log(`dbWriteHighScore: success: ` + newScore.who + ` ` + newScore.score + ` ` + newScore.hardlev);
      } else if (status == 404) {
        console.log(`Couldn't save game ${gameId}`);
      } else {
        console.log(`lambda error: lambda status=${data.StatusCode} larn status=${status}`);
        if (error) console.log(error, error.stack);
      }
    } else {
      console.log(`no data lambda error: ${error}`);
    }
  });

  if (newScore.winner) {
    doRollbar(ROLLBAR_INFO, `winner`, `${newScore.who}, diff=${newScore.hardlev}, time=${newScore.timeused}, score=${newScore.score}, ${newScore.playerID}, ${newScore.gameID}`);
  } else if (newScore.timeused > 50 && newScore.hardlev > 3) {
    doRollbar(ROLLBAR_INFO, `visitor`, `${newScore.who}, diff=${newScore.hardlev}, time=${newScore.timeused}, score=${newScore.score}, ${newScore.what} on ${newScore.level}, ${newScore.playerID}, ${newScore.gameID}`);
  }

}



function getHighScore(scoreboard, gameID) {
  //console.log(getHighScoreIndex(scoreboard, gameID));
  return scoreboard[getHighScoreIndex(scoreboard, gameID)];
}



function getHighScoreIndex(scoreboard, gameID) {
  var i = 0;
  for (i = 0; i < scoreboard.length; i++) {
    var tmp = scoreboard[i];
    //console.log(`i: ` + i + tmp.who + `, ` + gameID);
    if (tmp.gameID == gameID) return i;
  }
  return i; // no high score found, signal to append at end of array
}



function isHighestScoreForPlayer(scoreboard, score) {
  for (var i = 0; i < scoreboard.length; i++) {
    var tmp = scoreboard[i];
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
  var cause = ``;
  if (typeof reason === `number`) {
    cause += DEATH_REASONS.get(reason);
  } //
  else {
    cause += `killed by a ${lastmonst}`;
  }
  return cause;
}



function canProtect(reason) {
  var protect = true;
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
      protect = false;
  }
  return protect;
}



/*
 * Subroutine to record who played larn, and what the score was
 */
function died(reason, slain) {

  var winner = reason == DIED_WINNER;

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

  if (ULARN) {
    let failGender = `their`;
    if (player.gender == `Male`) failGender = `his`;
    if (player.gender == `Female`) failGender = `her`;
    DEATH_REASONS.set(DIED_FAILED, `killed ${failGender} family and committed suicide`);
  }

  if (!winner) {
    if (slain) {
      updateLog(`You have been slain!`);
    }
  }

  paint();
  nomove = 1;
  dropflag = 1;

  /* delete the checkpoint file */
  localStorageRemoveItem('checkpoint');

  // show scoreboard unless they saved the game
  if (reason != DIED_SAVED_GAME) {
    var printFunc = mazeMode ? updateLog : lprcat;
    lastmonst = reason; // for scoreboard

    let extraNL = (printFunc == lprcat) ? `\n` : ``;
    try {
      if (isRecording()) {
        let linkText = window.location.href.split(`?`)[0];
        linkText = linkText.split('/larn.html')[0] + `/tv/?gameid=${gameID}`;
        printFunc(`Replay Link: <b><a href='${linkText}'>${linkText}</a></b>${extraNL}${extraNL}`);
      }
    } catch (error) {
      // do nothing
    }

    printFunc(`Press <b>enter</b> to view the scoreboard ${extraNL}`);
    if (wizard)
      printFunc(`(sorry, wizard scores are not recorded) `);
    if (cheat)
      printFunc(`(sorry, cheater scores are not recorded) `);

    writeScoreToDatabase();
    setCharCallback(endgame);

    paint();
  } else {
    updateLog(`----  Reload your browser to play again  ----`);
    setCharCallback(dead);
    paint();

    recordFrame({ 'LARN': ``, 'STATS': `` }); // record fade to blank screen so we can easily refresh on reload

    GAMEOVER = true;
    side_inventory = true;
    game_started = false;
    napping = true;
    mazeMode = false;
  }

  // TODO: https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine
  if (!endGameScore) {
    endGameScore = new LocalScore();
  }

  let endData = (reason == DIED_SAVED_GAME) ? null : endGameScore;
  endRecording(endData, ULARN);

}



/* this is a bit hacky, but makes life easier */
var endGameScore;



function writeScoreToDatabase() {
  if (!endGameScore) {
    endGameScore = new LocalScore();
  }

  console.log(`wizard == ` + wizard);
  console.log(`cheater == ` + cheat);
  console.log(`debug == ` + debug_used);
  console.log(`endGameScore.score == ` + endGameScore.score);

  if ((endGameScore.score > 0 || endGameScore.winner) && !wizard && !cheat) {
    localWriteHighScore(endGameScore);
    dbWriteHighScore(endGameScore);
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

  if (!endGameScore) {
    endGameScore = new LocalScore();
  }
  loadScores(endGameScore, true, true);
}



function dead(key) {
  return 0;
}