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
    this.hof = this.get('hof');
    this.explored = this.get('explored');
    this.player = JSON.parse(this.get('player'));
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
  equal &= (a.gamelog == b.gamelog);
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





var winners = null;
var losers = null;


const MAX_SCORES_TO_PRINT = 17;
const MIN_TIME_PLAYED = 50;



function loadScores(newScore) {
  mazeMode = false;
  amiga_mode = false;
  clear();
  lprcat(`Loading Global Scoreboard...\n`);

  scoresPrinted = 0; // reset scores list

  readGlobal(true, newScore); // load winners
  readGlobal(false, newScore); // load losers
}



function readGlobal(loadWinners, newScore, offline) {

  if (offline) {
    showLocalScores(newScore);
    return;
  }

  Parse.Cloud.run('highscores', {
    winner: loadWinners,
    limit: MAX_SCORES_TO_PRINT,
    logname: logname,
    gameover: GAMEOVER,
    timeused: MIN_TIME_PLAYED,
  }, {
    success: function(results) {
      /* populate an empty array in case there are no results */
      loadWinners ? winners = [] : losers = [];

      debug(`Successfully retrieved ` + results.length + ` scores.`);
      for (var i = 0; i < results.length; i++) {
        var object = results[i];
        object.convertToLocal();
        //console.log(`${object.id} - ${object.get('winner')} ${object.get('hardlev')} ${object.get('score')} ${object.get('who')}`);
      }

      if (loadWinners) {
        winners = results;
      } else {
        losers = results;
      }

      if (winners && losers) // wait for both to load before showing
        showGlobalScores(newScore);
    },
    error: function(error) {
      console.log(`Error: ` + error.code + ` ` + error.message);
      showLocalScores(newScore);
    }
  });

}



function showGlobalScores(newScore) {
  showScores(newScore, false);
}



function showLocalScores(newScore) {
  showScores(newScore, true);
}



function showScores(newScore, local) {
  var exitscores = function(key) {
    if (key == ESC || key == ' ' || key == ENTER) {
      return exitbuilding();
    }
  }

  mazeMode = false;
  clear();

  if (local) {
    lprcat(`               <b>Larn Scoreboard</b> (Global scoreboard not available)\n`);
    winners = localStorage.getObject('winners') || [];
    losers = localStorage.getObject('losers') || [];
  } else {
    lprcat(`                             <b>Global Larn Scoreboard</b>\n`);
  }

  if (winners.length != 0 || losers.length != 0) {
    printWinnerScoreBoard(winners, newScore);
    printLoserScoreBoard(losers, newScore);
  } else {
    lprcat(`\n  The scoreboard is empty`);
  }

  cursor(1, 23);
  lprcat(`         Click on a score for more information (only games > ${MIN_TIME_PLAYED} mobuls)\n`);
  //cursor(1, 24);
  if (!GAMEOVER) {
    lprcat(`                        ---- Press <b>escape</b> to exit  ----`);
    // clear the arrays for the next time the scoreboard is loaded
    winners = null;
    losers = null;
    setCharCallback(exitscores);
  } else {
    lprcat(`                 ----  Reload your browser to play again  ----`);
  }
  blt();
}



function printWinnerScoreBoard(winners, newScore) {
  var header = `\n     Score   Difficulty   Time Needed   Larn Winners List\n`;

  // TODO duplication
  function printout(p) {
    var scoreId = p.id || p.who;
    var local = p.id == null;
    var score = `${padString(Number(p.score).toLocaleString(), 10)}   ${padString(``+p.hardlev, 10)}  ${padString(`` + p.timeused, 5)} Mobuls   ${p.who}`;
    lprc(`<a href='javascript:loadScoreStats("${scoreId}", ${local}, true)'>`);
    lprc(`${score}`);
    lprc(`</a>`);
  }
  printScoreBoard(winners, newScore, header, printout);
}



function printLoserScoreBoard(losers, newScore) {
  var header = (`\n     Score   Difficulty   Larn Visitor Log\n`);

  // TODO duplication
  function printout(p) {
    var scoreId = p.id || p.who;
    var local = p.id == null;
    var score = `${padString(Number(p.score).toLocaleString(), 10)}   ${padString(``+p.hardlev, 10)}   ${p.who}, ${p.what} on ${p.level}`;
    lprc(`<a href='javascript:loadScoreStats("${scoreId}", ${local}, false)'>`);
    lprc(`${score}`);
    lprc(`</a>`);
  }
  printScoreBoard(losers, newScore, header, printout);
}



var scoresPrinted = 0; // made global to be able to print more high scores

function printScoreBoard(board, newScore, header, printout) {
  var scoreboard = board.sort(sortScore);

  /* the scoreboard has multiple games per player in it,
  we only want to show one result per player */
  var players = [];
  var winners = false;

  lprcat(header);
  var newScorePrinted = false;

  for (var i = 0; i < scoreboard.length; i++) {
    var p = scoreboard[i];
    //console.log(i + ` ` + p.who + `, ` + p.score);
    if (players.indexOf(p.who) >= 0) continue;
    players.push(p.who);

    winners = p.winner;

    var isNewScore = newScore ? isEqual(p, newScore) : false;

    if (++scoresPrinted > MAX_SCORES_TO_PRINT) break;

    if (isNewScore) {
      lprc(`<b>`);
    }

    printout(p);

    if (isNewScore) {
      lprc(`</b>`);
      newScorePrinted = true;
    }
    lprcat(`\n`);

  } // end for

  /* if this score didn't make the high score board, print it out at the bottom  */
  if (!newScorePrinted && newScore && newScore.winner == winners) {
    lprc(`<b>`);
    printout(newScore);
    lprc(`</b>`);
    lprcat(`\n`);
  }
}



function loadScoreStats(gameId, local, winner) {

  if (local) {
    var board = winner ? localStorage.getObject('winners') : localStorage.getObject('losers');
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





function writeLocal(newScore) {
  //console.log(`writeLocal: ` + newScore);

  // don't write 0 scores
  if (newScore.score <= 0) {
    return;
  }

  // write high score to board
  // TODO there is lots of duplication here...
  if (newScore.winner) {
    var winners = localStorage.getObject('winners') || [];
    if (isHighestScoreForPlayer(winners, newScore)) {
      var scoreIndex = getHighScoreIndex(winners, newScore.who);
      console.log(`writing high score to winners scoreboard`);
      winners[scoreIndex] = newScore;
      localStorage.setObject('winners', winners);
    }

    // always write trigger to show mail next time
    localStorage.setObject(newScore.who, 'winner');

  } else {
    var losers = localStorage.getObject('losers') || [];
    if (isHighestScoreForPlayer(losers, newScore)) {
      var scoreIndex = getHighScoreIndex(losers, newScore.who);
      console.log(`writing high score to visitors scoreboard`);
      losers[scoreIndex] = newScore;
      localStorage.setObject('losers', losers);
    }
  }
}



function writeGlobal(newScore) {
  //console.log(`writeGlobal: ` + newScore);

  var globalScore = new GlobalScore(newScore);
  //console.log(newScore.who + ` ` + newScore.score + ` ` + newScore.hardlev);
  globalScore.write();
  globalScore.save(null, {
    success: function(score) {
      console.log(`writeGlobal: success: ` + newScore.who + ` ` + newScore.score + ` ` + newScore.hardlev);
      score.convertToLocal();
      loadScores(score);
    },
    error: function(score, error) {
      console.log('Failed to create new object, with error code: ' + error.message);
      loadScores(newScore);
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
//   var w = localStorage.getObject('losers'); // or 'winners'
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
  localStorage.removeItem('checkpoint');

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



function endgame(key) {
  if (key != ENTER) {
    return 0;
  }

  setCharCallback(dead);
  GAMEOVER = true;
  napping = true;
  mazeMode = false;

  var newScore = new LocalScore();

  console.log(`wizard == ` + wizard);
  console.log(`cheater == ` + cheat);
  console.log(`newscore.score == ` + newScore.score);

  if ((newScore.score > 0 || newScore.winner) && !wizard && !cheat) {
    writeLocal(newScore);
    writeGlobal(newScore);
  } else {
    loadScores(newScore);
  }
}



function dead(key) {
  return 0;
}
