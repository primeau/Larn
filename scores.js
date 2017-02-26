//TODO: break into multiple files (endgame, scoreboard (new class), scores)

'use strict';

var scoreBoard = [];
const EXTRA_VERSION = 0;
const EXTRA_BUILD = 1;
const EXTRA_RMST = 2;
const EXTRA_GTIME = 3;


var LocalScore = function() {
  var isWinner = lastmonst == 263;
  var winBonus = isWinner ? 100000 * getDifficulty() : 0;

  this.who = logname; /* the name of the character */
  this.hardlev = getDifficulty(); /* the level of difficulty player played at */
  this.winner = isWinner;
  this.score = player.GOLD + player.BANKACCOUNT + winBonus; /* the score of the player */
  this.timeused = Math.floor(gtime / 100); /* the time used in mobuls to win the game */
  this.what = getWhyDead(lastmonst); /* the number of the monster that killed player */
  this.level = LEVELNAMES[level]; /* the level player was on when he died */
  this.playerID = playerID; /* nothing nefarious, just simple way to differentiate players in the game database */
  this.gameID = gameID; /* unique game ID */
  this.hof = false; /* hall of fame candidate? */
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
  var x = player.level;
  player.level = null;
  this.player = JSON.stringify(player);
  player.level = x;
  // END HACK -- we don't want to save the level

  this.browser = `${navigator.vendor} (${navigator.userAgent})`;
}

LocalScore.prototype.toString = function() {
  var stats = getStatString(this);
  return stats;
}



var GlobalScore = Parse.Object.extend({
  className: `GlobalScore`,

  initialize: function(local) {
    if (!local) {
      //console.log('!local');
      return;
    }
    this.who = local.who;
    this.hardlev = local.hardlev;
    this.winner = local.winner;
    this.score = local.score;
    this.timeused = local.timeused;
    this.what = local.what;
    this.level = local.level;
    this.playerID = local.playerID;
    this.gameID = local.gameID;
    this.hof = local.hof;
    this.explored = local.explored;
    this.player = local.player;
    this.browser = local.browser;
    this.debug = local.debug;
    this.gamelog = local.gamelog;
    this.extra = local.extra;
  },

  convertToLocal: function() {
    this.who = this.get('who');
    this.hardlev = this.get('hardlev');
    this.winner = this.get('winner');
    this.score = this.get('score');
    this.timeused = this.get('timeused');
    this.what = this.get('what');
    this.level = this.get('level');

    /*
    for higher performance,  everything after this point comes back
    'undefined' when requesting the winners/losers scoreboard list
    */
    this.playerID = this.get('playerID');
    this.gameID = this.get('gameID');
    this.hof = this.get('hof');
    this.explored = this.get('explored');
    var p = this.get('player');
    this.player = p ? JSON.parse(p) : p;
    this.browser = this.get('browser');
    this.debug = this.get('debug');
    this.gamelog = this.get('gamelog');
    this.extra = this.get('extra');
  },

  write: function() {
    this.set('who', this.who);
    this.set('hardlev', this.hardlev);
    this.set('winner', this.winner);
    this.set('score', this.score);
    this.set('timeused', this.timeused);
    this.set('what', this.what);
    this.set('level', this.level);
    this.set('playerID', this.playerID);
    this.set('gameID', this.gameID);
    this.set('hof', this.hof);
    this.set('explored', this.explored);
    this.set('player', this.player);
    this.set('browser', this.browser);
    this.set('debug', this.debug);
    this.set('gamelog', this.gamelog);
    this.set('extra', this.extra);
  },

  toString: function() {
    var stats = this.createdAt + `\n`;
    stats += getStatString(this);
    return stats;
  },

});



function getStatString(score) {
  var tempPlayer;
  if (score.player.inventory) {
    tempPlayer = loadPlayer(score.player);
  } else {
    tempPlayer = loadPlayer(JSON.parse(score.player));
  }
  var stats = ``;
  stats += `Player: ${score.who}\n`;
  stats += `Winner: ${score.winner ? 'Yes' : 'No'}\n`;
  stats += `Diff:   ${score.hardlev}\n`;
  stats += `Score:  ${score.score}\n`;
  stats += `Mobuls: ${score.timeused}\n`;
  if (!score.winner) {
    stats += `${score.what} on ${score.level}\n`;
  }
  stats += `\n${game_stats(tempPlayer, score)}\n`;
  if (score.explored) {
    stats += `Levels Visited:\n`;
    stats += `${score.explored}\n\n`;
  }

  if (score.gamelog) {
    var logString = score.gamelog.join('\n').trim();
    stats += `Final Moments: \n${logString}\n\n`;
  }

  stats += `Bottom Line:\n`;
  stats += tempPlayer.getStatString(score.level) + '\n\n';

  if (score.debug) {
    stats += `Debug mode used!\n\n`;
  }

  return stats;
}



function isEqual(a, b) {
  var equal = true;
  equal &= (a.who == b.who);
  equal &= (a.hardlev == b.hardlev);
  equal &= (a.winner == b.winner);
  equal &= (a.score == b.score);
  equal &= (a.timeused == b.timeused);
  equal &= (a.what == b.what);
  equal &= (a.level == b.level);
  equal &= (a.explored == b.explored);
  equal &= (a.hof == b.hof);
  equal &= (a.debug == b.debug);
  equal &= compareArrays(a.gamelog, b.gamelog);
  equal &= (JSON.stringify(a.player) == JSON.stringify(b.player));
  return equal;
}



function sortScore(a, b) {
  //console.log(`a: ${a.hardlev}, ${a.score}, ${a.level}, ${a.timeused}`);
  //console.log(`b: ${b.hardlev}, ${b.score}, ${b.level}, ${b.timeused}`);
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  if (a.hardlev != b.hardlev) {
    return b.hardlev - a.hardlev;
  } else if (a.score != b.score) {
    return b.score - a.score;
  } else if (a.level != b.level) {
    return b.level - a.level;
  } else {
    return b.timeused - a.timeused;
  }
}





/* function for reading / displaying the scoreboard */





var winners = [];
var losers = [];
var winnerTime = 0;
var loserTime = 0;
var scoreIndex = 0;


const MAX_SCORES_PER_PAGE = 18;
const MAX_SCORES_TO_READ = 18*3;
const MIN_TIME_PLAYED = 50;



function loadScores(newScore, showWinners, showLosers) {
  if (NOCOOKIES) {
    updateLog(`Sorry, the scoreboard can't be retrieved when cookies are disabled`);
    return;
  }

  mazeMode = false;
  amiga_mode = false;
  clear();
  lprcat(`Loading Scoreboard...\n`);

  dbQueryHighScores(newScore, showWinners, showLosers, true);
  dbQueryHighScores(newScore, showWinners, showLosers, false);
}



function dbQueryHighScores(newScore, showWinners, showLosers, loadWinners) {
  Parse.Cloud.run('highscores', {
    winner: loadWinners,
    limit: MAX_SCORES_TO_READ,
    timeused: MIN_TIME_PLAYED,
    doselect: true,
  }, {
    success: function(results) {
      if (loadWinners) {
        winnerTime = millis();
        winners = dbQueryHighScoresSuccess(results);
      }
      else {
        loserTime = millis();
        losers = dbQueryHighScoresSuccess(results);
      }
      if (winnerTime > 0 && loserTime > 0) { // wait for both to load before showing
        showGlobalScores(newScore, showWinners, showLosers);
      }
    },
    error: function(error) {
      console.log(`Error: ${error.code} ${error.message}`);
      showLocalScores(newScore, true, true);
    }
  });
}



function dbQueryHighScoresSuccess (results) {
  console.log(`Successfully retrieved ` + results.length + ` scores.`);
  for (var i = 0; i < results.length; i++) {
    var highscore = results[i];
    highscore.convertToLocal();
    //console.log(`${highscore.id} - ${highscore.get('winner')} ${highscore.get('hardlev')} ${highscore.get('score')} ${highscore.get('who')}`);
  }
  return results;
}



function showGlobalScores(newScore, showWinners, showLosers) {
  showScores(newScore, false, showWinners, showLosers, 0);
}



function showLocalScores(newScore, showWinners, showLosers) {
  showScores(newScore, true, showWinners, showLosers, 0);
}



function showScores(newScore, local, showWinners, showLosers, offset) {
  var exitscores = function(key) {
    if (key == ESC || key == ENTER) {
      winnerTime = 0;
      loserTime = 0;
      scoreIndex = 0;
      return exitbuilding();
    }
    if (key == ' ') {
      if (scoreIndex < winners.length) {
        showScores(newScore, local, true, false, 0);
      }
      else {
        showScores(newScore, local, false, true, winners.length);
        if (scoreIndex >= winners.length + losers.length) {
          scoreIndex = 0;
        }
      }
    }
  }

  mazeMode = false;
  clear();

  if (local) {
    lprcat(`                   <b>Larn Scoreboard</b> (Global scoreboard not available)\n`);
    winners = localStorageGetObject('winners', []);
    losers = localStorageGetObject('losers', []);
  } else {
    if (showWinners && !showLosers)
      lprcat(`                    <b>Winners Scoreboard</b> (Games > ${MIN_TIME_PLAYED} mobuls)\n`);
    else if (showLosers && !showWinners)
      lprcat(`                    <b>Visitors Scoreboard</b> (Games > ${MIN_TIME_PLAYED} mobuls)\n`);
    else
      lprcat(`                    <b>Global Larn Scoreboard</b> (Games > ${MIN_TIME_PLAYED} mobuls)\n`);
  }

  if (winners.length != 0 || losers.length != 0) {
    if (showWinners) printWinnerScoreBoard(winners, newScore, offset);
    if (showLosers) printLoserScoreBoard(losers, newScore, offset);
  } else {
    lprcat(`\n  The scoreboard is empty`);
  }

  cursor(1, GAMEOVER ? 7 : 23);
  //cursor(1, 7); // this looks weird, but we aren't printing '/n' after each score to make more space
  lprcat(`                     Click on a score for more information\n`);
  if (!GAMEOVER) {
    lprcat(`             ----  Press <b>space</b> for next page, <b>escape</b> to exit  ----`);
    setCharCallback(exitscores);
  } else {
    lprcat(`                 ----  Reload your browser to play again  ----`);
  }
  blt();
}



function printWinnerScoreBoard(winners, newScore, offset) {
  var header = `\n     Score   Difficulty   Winner                    Time Needed\n`;
  // TODO duplication
  function printout(p) {
    var scoreId = p.id || p.who;
    var local = p.id == null;
    var score = `${padString(Number(p.score).toLocaleString(), 10)}   ${padString(``+p.hardlev, 10)}   ${padString(p.who, -25)}${padString(`` + p.timeused, 5)} Mobuls`;
    var endcode = GAMEOVER ? `<br>` : ``;
    lprc(`<a href='javascript:dbQueryLoadGame("${scoreId}", ${local}, true)'>${score}</a>${endcode}`);
    if (!GAMEOVER) lprc(`\n`);
}
  printScoreBoard(winners, newScore, header, printout, offset);
}



function printLoserScoreBoard(losers, newScore, offset) {
  var header = (`\n     Score   Difficulty   Visitor                   Fate\n`);
  // TODO duplication
  function printout(p) {
    var scoreId = p.id || p.who;
    var local = p.id == null;
    var score = `${padString(Number(p.score).toLocaleString(), 10)}   ${padString(``+p.hardlev, 10)}   ${padString(p.who, -25)} ${p.what} on ${p.level}`;
    var endcode = GAMEOVER ? `<br>` : ``;
    lprc(`<a href='javascript:dbQueryLoadGame("${scoreId}", ${local}, false)'>${score}</a>${endcode}`);
    if (!GAMEOVER) lprc(`\n`);
  }
  printScoreBoard(losers, newScore, header, printout, offset);
}



function printScoreBoard(board, newScore, header, printout, offset) {
  var scoreboard = board.sort(sortScore);

  /* the scoreboard has multiple games per player in it,
  we only want to show one result per player */
  var players = [];
  var isWinningScore = false;

  lprcat(header);
  var newScorePrinted = false;

  var i = GAMEOVER ? 0 : scoreIndex - offset;

  for (var count = 0 ; i < scoreboard.length ; i++, scoreIndex++) {

    if (!GAMEOVER && ++count > MAX_SCORES_PER_PAGE) {
      break;
    }

    var p = scoreboard[i];
    //console.log(i + ` ` + p.who + `, ` + p.score);
    if (players.indexOf(p.who) >= 0) continue;
    players.push(p.who);

    isWinningScore = p.winner;

    var isNewScore = newScore ? isEqual(p, newScore) : false;

    if (isNewScore) {
      lprc(`<b>`);
    }

    printout(p);

    if (isNewScore) {
      lprc(`</b>`);
      newScorePrinted = true;
    }

  } // end for

  /* if this score didn't make the high score board, print it out at the bottom  */
  if (!newScorePrinted && newScore && newScore.winner == isWinningScore) {
    lprc(`<b>`);
    printout(newScore);
    lprc(`</b>`);
    //lprcat(`\n`);
  }
}



function dbQueryLoadGame(gameId, local, winner) {

  if (local) {
    var board = winner ? localStorageGetObject('winners', []) : localStorageGetObject('losers', []);
    var stats = getHighScore(board, gameId);
    setDiv(`STATS`, getStatString(stats));
    return;
  }
  // else if (gameId == logname) { // it's non-local game that didn't make the scoreboard
  //   var stats = new LocalScore();
  //   setDiv(`STATS`, getStatString(stats));
  //   return;
  // }

  var query = new Parse.Query(GlobalScore);
  query.get(gameId, {
    success: function(globalScore) {
      globalScore.convertToLocal();
      var stats = globalScore;
      setDiv(`STATS`, stats);
    },

    error: function(object, error) {
      console.log(`parse error: ` + error);
      var stats = `Couldn't load game stats ` + error;
      setDiv(`STATS`, stats);
    }
  });

};





/* function for writing to the scoreboard */





function localWriteHighScore(newScore) {
  //console.log(`localWriteHighScore: ` + newScore);

  // don't write 0 scores
  if (newScore.score <= 0) {
    return;
  }

  // write high score to board
  // TODO there is lots of duplication here...
  if (newScore.winner) {
    var winners = localStorageGetObject('winners', []);
    if (isHighestScoreForPlayer(winners, newScore)) {
      var scoreArrayIndex = getHighScoreIndex(winners, newScore.who);
      console.log(`writing high score to winners scoreboard`);
      winners[scoreArrayIndex] = newScore;
      localStorageSetObject('winners', winners);
    }

    // always write trigger to show mail next time
    localStorageSetObject(newScore.who, 'winner');

  } else {
    var losers = localStorageGetObject('losers', []);
    if (isHighestScoreForPlayer(losers, newScore)) {
      var scoreArrayIndex = getHighScoreIndex(losers, newScore.who);
      console.log(`writing high score to visitors scoreboard`);
      losers[scoreArrayIndex] = newScore;
      localStorageSetObject('losers', losers);
    }
  }
}



function dbWriteHighScore(newScore) {
  //console.log(`dbWriteHighScore: ` + newScore);

  var globalScore = new GlobalScore(newScore);
  //console.log(newScore.who + ` ` + newScore.score + ` ` + newScore.hardlev);
  globalScore.write();
  globalScore.save(null, {
    success: function(score) {
      console.log(`dbWriteHighScore: success: ` + newScore.who + ` ` + newScore.score + ` ` + newScore.hardlev);
      score.convertToLocal();
      endGameScore = score; // need to record the game id from parse
    },
    error: function(score, error) {
      console.log('Failed to create new object, with error code: ' + error.message);
    }
  });
}



function getHighScore(scoreboard, playername) {
  //console.log(getHighScoreIndex(scoreboard, playername));
  return scoreboard[getHighScoreIndex(scoreboard, playername)];
}



function getHighScoreIndex(scoreboard, playername) {
  var i = 0;
  for (i = 0; i < scoreboard.length; i++) {
    var tmp = scoreboard[i];
    //console.log(`i: ` + i + tmp.who + `, ` + playername);
    if (tmp.who == playername) return i;
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



/* convenience function to move local game score to the global board */
// function writeLocalToGlobal() {
//   var w = localStorageGetObject('losers', []); // or 'winners'
//   for (var i = 0; i < w.length; i++) {
//     var g = new GlobalScore(w[i]);
//     g.write();
//     g.save(null, {
//       success: function(score) {
//         // Execute any logic that should take place after the object is saved.
//         score.convertToLocal();
//         console.log(score.id + ` = ` + score.who + ` ` + score.score + ` ` + score.hardlev);
//       },
//       error: function(score, error) {
//         // Execute any logic that should take place if the save fails.
//         // error is a Parse.Error with an error code and message.
//         console.log('Failed to create new object, with error code: ' + error.message);
//       }
//     });
//   }
// }




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
    cause += DEATH_REASONS[(Number(reason) - 256)];
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
    case 262: // bottomless pit
    case 263: // winner
    case 269: // failed to save daughter
    case 271: // bottomless trapdoor
    case 286: // quitter
    case 287: // saved game
      protect = false;
  }
  return protect;
}



/*
 * Subroutine to record who played larn, and what the score was
 *
 * < 256   killed by the monster number
 *
 * 258     self - annihilated
 * 259     shot by an arrow
 * 260     hit by a dart
 * 261     fell into a pit
 * 262     fell into a bottomless pit
 * 263     a winner
 * 264     trapped in solid rock
 *
 * 269     failed
 * 270     erased by a wayward finger
 * 271     fell through a bottomless trap door
 * 272     fell through a trap door
 * 273     drank some poisonous water
 * 274     fried by an electric shock
 * 275     slipped on a volcano shaft
 *
 * 277     attacked by a revolting demon
 * 278     hit by own magic
 * 279     demolished by an unseen attacker
 * 280     fell into the dreadful sleep
 * 281     killed by an exploding chest
 *
 * 283     annihilated in a sphere
 * 286     a quitter
 * 287     saved game -- shouldn't go on scoreboard!
 */
function died(reason, slain) {

  var winner = reason == 263;

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
  if (reason != 287) {
    lastmonst = reason; // for scoreboard
    updateLog(`Press <b>enter</b> to view the scoreboard: `);
    if (cheat && wizard)
      appendLog(`(cheater and wizard scores not recorded)`);
    else if (wizard)
      appendLog(`(sorry, wizard scores are not recorded)`);
    else if (cheat)
      appendLog(`(sorry, cheater scores are not recorded)`);

    writeScoreToDatabase();
    setCharCallback(endgame);

    paint();
  } else {
    updateLog(`----  Reload your browser to play again  ----`);
    setCharCallback(dead);
    paint();
    GAMEOVER = true;
    napping = true;
    mazeMode = false;
  }
}



/* this is a bit hacky, but makes life easier */
var endGameScore;



function writeScoreToDatabase() {
  if (!endGameScore) {
    endGameScore = new LocalScore();
  }

  console.log(`wizard == ` + wizard);
  console.log(`cheater == ` + cheat);
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
