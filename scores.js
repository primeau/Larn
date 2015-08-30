"use strict";

var scoreBoard = [];


var LocalScore = function() {
  var isWinner = lastmonst == 263;
  var winBonus = isWinner ? 100000 * HARDGAME : 0;

  this.who = logname; /* the name of the character */
  this.hardlev = HARDGAME; /* the level of difficulty player played at */
  this.winner = isWinner;
  this.score = player.GOLD + winBonus; /* the score of the player */
  this.timeused = Math.round(gtime / 100); /* the time used in mobuls to win the game */
  this.what = getWhyDead(lastmonst); /* the number of the monster that killed player */
  this.level = levelnames[level]; /* the level player was on when he died */
  this.taxes = 0; /* taxes he owes to LRS */

  // TODO HACK -- we don't want to save the level
  var x = player.level;
  player.level = null;
  this.player = JSON.stringify(player);
  player.level = x;
}



var GlobalScore = Parse.Object.extend({
  className: "GlobalScore",

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
    this.taxes = local.taxes;
    this.player = local.player;
  },

  convertToLocal: function() {
    this.who = this.get('who');
    this.hardlev = this.get('hardlev');
    this.winner = this.get('winner');
    this.score = this.get('score');
    this.timeused = this.get('timeused');
    this.what = this.get('what');
    this.level = this.get('level');
    this.taxes = this.get('taxes');
    this.player = this.get('player');
  },

  write: function() {
    this.set("who", this.who);
    this.set("hardlev", this.hardlev);
    this.set("winner", this.winner);
    this.set("score", this.score);
    this.set("timeused", this.timeused);
    this.set("what", this.what);
    this.set("level", this.level);
    this.set("taxes", this.taxes);
    this.set("player", this.player);
  },

});



function isEqual(a, b) {
  var equal = true;
  equal &= (a.who == b.who);
  equal &= (a.hardlev == b.hardlev);
  equal &= (a.winner == b.winner);
  equal &= (a.score == b.score);
  equal &= (a.timeused == b.timeused);
  equal &= (a.what == b.what);
  equal &= (a.level == b.level);
  equal &= (a.taxes == b.taxes);
  equal &= (JSON.stringify(a.player) == JSON.stringify(b.player));
  return equal;
}



function sortScore(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
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



function loadScores(newScore) {
  IN_STORE = true;
  clear();
  lprcat("Loading Global Scoreboard...\n");

  readGlobal(true, newScore); // load winners
  readGlobal(false, newScore); // load losers
}



function readGlobal(loadWinners, newScore, offline) {

  if (offline) {
    showLocalScores(newScore);
    return;
  }

  var query = new Parse.Query(GlobalScore);
  query.limit(10); // limit to at most 10 results
  query.descending("hardlev", "score", "level", "timeused");
  query.equalTo("winner", loadWinners)

  query.find({
    success: function(results) {
      /* populate an empty array in case there are no results */
      loadWinners ? winners = [] : losers = [];

      console.log("Successfully retrieved " + results.length + " scores.");
      for (var i = 0; i < results.length; i++) {
        var object = results[i];
        object.convertToLocal();
        //console.log(object.id + ' - ' + object.who + " " + object.hardlev + " " + object.score);
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
      console.log("Error: " + error.code + " " + error.message);
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

  IN_STORE = true;
  clear();

  if (local) {
    lprcat("               <b>Larn Scoreboard</b> (Global scoreboard not available)\n");
    winners = localStorage.getObject('winners') || [];
    losers = localStorage.getObject('losers') || [];
  } else {
    lprcat("                             <b>Global Larn Scoreboard</b>\n");
  }

  if (winners.length != 0 || losers.length != 0) {
    printWinnerScoreBoard(winners, newScore);
    printLoserScoreBoard(losers, newScore);
  } else {
    lprcat("\n  The scoreboard is empty");
  }


  cursor(1, 24);
  if (!GAME_OVER) {
    lprcat("                        ---- Press <b>escape</b> to exit  ----");
    // clear the arrays for the next time the scoreboard is loaded
    winners = null;
    losers = null;
    setCharCallback(exitscores);
  } else {
    lprcat("                     ---- Reload your browser to play again  ----");
  }
  blt();
}



function printWinnerScoreBoard(winners, newScore) {
  var header = "\n     Score   Difficulty   Time Needed   Larn Winners List\n";

  function printout(p) {
    lprcat(`${padString(Number(p.score).toLocaleString(), 10)}   ${padString(""+p.hardlev, 10)}  ${padString("" + p.timeused, 5)} Mobuls   ${p.who} \n`);
  }
  printScoreBoard(winners, newScore, header, printout);
}



function printLoserScoreBoard(losers, newScore) {
  var header = ("\n     Score   Difficulty   Larn Visitor Log\n");

  function printout(p) {
    lprcat(`${padString(Number(p.score).toLocaleString(), 10)}   ${padString(""+p.hardlev, 10)}   ${p.who}, ${p.what} on ${p.level} \n`);
  }
  printScoreBoard(losers, newScore, header, printout);
}



function printScoreBoard(board, newScore, header, printout) {
  var scoreboard = board.sort(sortScore);

  /* the scoreboard has multiple games per player in it,
  we only want to show one result per player */
  var players = [];

  lprcat(header);
  for (var i = 0; i < scoreboard.length; i++) {
    var p = scoreboard[i];

    if (players.indexOf(p.who) >= 0) continue;
    players.push(p.who);

    var isNewScore = newScore ? isEqual(p, newScore) : false;

    if (isNewScore) lprc("<b>");
    printout(p);
    if (isNewScore) lprc("</b>");
  }

}





/* function for writing to the scoreboard */





function writeLocal(newScore) {
  // don't write 0 scores
  if (newScore.score <= 0) {
    return;
  }

  // write high score to board
  // TODO eventually we should replace the old high score with the new one
  if (newScore.winner) {
    var winners = localStorage.getObject('winners') || [];
    if (isHighestScoreForPlayer(winners, newScore)) {
      console.log("writing high score to winners scoreboard");
      winners.push(newScore);
      localStorage.setObject('winners', winners);
    }
    // always write trigger to show mail next time
    localStorage.setObject(logname, 'winner');
  } else {
    var losers = localStorage.getObject('losers') || [];
    if (isHighestScoreForPlayer(losers, newScore)) {
      console.log("writing high score to visitors scoreboard");
      losers.push(newScore);
      localStorage.setObject('losers', losers);
    }
  }
}



function writeGlobal(newScore) {
  var globalScore = new GlobalScore(newScore);

  globalScore.write();
  globalScore.save(null, {
    success: function(newScore) {
      // Execute any logic that should take place after the object is saved.
      newScore.convertToLocal();
      //console.log(score.id + " = " + score.who + " " + score.score + " " + score.hardlev);
      loadScores(newScore);
    },
    error: function(newScore, error) {
      // Execute any logic that should take place if the save fails.
      // error is a Parse.Error with an error code and message.
      console.log('Failed to create new object, with error code: ' + error.message);
      loadScores(newScore);
    }
  });
}



function isHighestScoreForPlayer(scoreboard, score) {
  for (var i = 0; i < scoreboard.length; i++) {
    var tmp = scoreboard[i];
    if (tmp.logname == score.logname && tmp.winner == score.winner) {
      if (sortScore(tmp, score) < 0) return false;
    }
  }
  return true;
}



/*
 *  showallscores() Function to show scores and the iven lists that go with them
 *
 *  Returns nothing of value
 */
function showallscores() {
  // int i, j;
  //
  // lflush();
  // lcreat((char * ) 0);
  // if (readboard() < 0)
  //   return;
  // cdesc[WEAR] = cdesc[WIELD] = cdesc[SHIELD] = -1; /* not wielding or wearing anything */
  // for (i = 0; i < MAXPOTION; i++)
  //   potionname[i][0] = ' ';
  // for (i = 0; i < MAXSCROLL; i++)
  //   scrollname[i][0] = ' ';
  // i = winshou();
  // j = shou(1);
  // if (i + j == 0)
  //   lprcat(esb);
  // else
  //   lprc('\n');
  // lflush();
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
//         console.log(score.id + " = " + score.who + " " + score.score + " " + score.hardlev);
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
  var cause = "";
  if (typeof reason === "number") {
    cause += whydead[(Number(reason) - 256)];
  } //
  else {
    cause += `killed by a ${lastmonst}`;
  }
  return cause;
}



function canProtect(reason) {
  var protect = true;
  if (typeof reason === "number") {
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
      --player.CONSTITUTION;
      if (player.CONSTITUTION < 3) player.CONSTITUTION = 3;
      player.HP = 1;
      updateLog("You feel wiiieeeeerrrrrd all over!");
      nap(2000); // TODO
      return;
    }
  }

  if (!winner) {
    if (slain)
      updateLog(`You have been slain!`);
  }
  paint();
  nomove = 1;
  dropflag = 1;

  /* delete the checkpoint file */
  localStorage.removeItem('checkpoint');

  // show scoreboard unless they saved the game
  if (reason != 287) {
    lastmonst = reason; // for scoreboard
    updateLog("Press <b>enter</b> to view the scoreboard: ");
    if (cheat && wizard)
      appendLog("(cheater and wizard scores not recorded)");
    else if (wizard)
      appendLog("(sorry, wizard scores are not recorded)");
    else if (cheat)
      appendLog("(sorry, cheater scores are not recorded)");
    setCharCallback(endgame);
    paint();
  } else {
    updateLog("---- Reload your browser to play again  ----");
    setCharCallback(dead);
    paint();
    GAME_OVER = true;
    napping = true;
    IN_STORE = true;
  }
}



function endgame(key) {
  if (key != ENTER) {
    return 0;
  }

  setCharCallback(dead);
  GAME_OVER = true;
  napping = true;
  IN_STORE = true;

  player.GOLD += player.BANKACCOUNT;
  player.BANKACCOUNT = 0;

  var newScore = new LocalScore();

  console.log("wizard == " + wizard);
  console.log("cheater == " + cheat);

  if (newScore.score > 0 && !wizard && !cheat) {
    writeLocal(newScore);
    writeGlobal(newScore);
  } else {
    loadScores(newScore);
  }
}



function dead(key) {
  return 0;
}
