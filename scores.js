"use strict";

var scoreBoard = [];

var ScoreBoardEntry = function() {
  this.hardlev = HARDGAME; /* the level of difficulty player played at */
  this.score = player.GOLD; /* the score of the player */
  this.timeused = Math.round(gtime / 100); /* the time used in mobuls to win the game */
  this.what = getWhyDead(lastmonst); /* the number of the monster that killed player */
  this.level = levelnames[level]; /* the level player was on when he died */
  this.who = logname; /* the name of the character */
  this.winner = lastmonst == 263;

  if (this.winner) {
    player.score += 100000 * this.hardlev;
  }

  this.taxes = 0; /* taxes he owes to LRS */

  // // TODO HACK
  // var x = player.level;
  // player.level = null;
  // this.player = player;
  // player.level = x;

  this.knownPotions = knownPotions;
  this.knownScrolls = knownScrolls;
  this.knownSpells = knownSpells;
}



function getScore() {
  return new ScoreBoardEntry();
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



function printscore(board, newscore, header, printout) {
  var scoreboard = board.sort(sortScore);

  /* the scoreboard has every game in it,
  we only want to show one result per player */
  var players = [];

  lprcat(header);
  for (var i = 0; i < scoreboard.length; i++) {
    var p = scoreboard[i];

    if (players.indexOf(p.who) >= 0) continue;
    players.push(p.who);

    var isNewScore = JSON.stringify(p) == JSON.stringify(newscore);

    if (isNewScore) lprc("<b>");
    printout(p);
    if (isNewScore) lprc("</b>");
  }

}


function printwinners(winners, newscore) {
  var header = "\n     Score   Difficulty   Time Needed   Larn Winners List\n";

  function printout(p) {
    lprcat(`${padString(Number(p.score).toLocaleString(), 10)}   ${padString(""+p.hardlev, 10)}  ${padString("" + p.timeused, 5)} Mobuls   ${p.who} \n`);
  }

  printscore(winners, newscore, header, printout);
}



function printlosers(losers, newscore) {
  var header = ("\n     Score   Difficulty   Larn Visitor Log\n");

  function printout(p) {
    lprcat(`${padString(Number(p.score).toLocaleString(), 10)}   ${padString(""+p.hardlev, 10)}   ${p.who}, ${p.what} on ${p.level} \n`);
  }

  printscore(losers, newscore, header, printout);
}



/*
 *  hashewon()   Function to return 1 if player has won a game before, else 0
 *
 *  This function also sets cdesc[HARDGAME] to appropriate value -- 0 if not a
 *  winner, otherwise the next level of difficulty listed in the winners
 *  scoreboard.  This function also sets outstanding_taxes to the value in
 *  the winners scoreboard.
 */
function hashewon() {
  // int i;
  //
  // cdesc[HARDGAME] = 0;
  // if (readboard() < 0)
  // 	return(0); /* can't find scoreboard */
  // for (i=0; i<SCORESIZE; i++) /* search through winners scoreboard */
  // 	if (strcmp(winr[i].who, logname) == 0)
  // 		if (winr[i].score > 0)
  // 		{
  // 			cdesc[HARDGAME]=winr[i].hardlev+1;
  // 			outstanding_taxes=winr[i].taxes;
  // 			return(1);
  // 		}
  // 		return(0);
}



function checkmail() {
  // int i;
  // int gold, taxes;
  //
  // if (readboard() < 0)
  // 	return;         /* can't find scoreboard */
  // for (i = 0; i < SCORESIZE; i++) /* search through winners scoreboard */
  // 	if (strcmp(winr[i].who, logname) == 0  &&  winr[i].score > 0  &&  winr[i].hasmail) {
  // 		winr[i].hasmail = 0;
  // 		gold = taxes = winr[i].taxes;
  // 		writeboard();
  //
  // 		/* Intuit the amount of gold -- should have changed
  // 		* the score file, but ...  TAXRATE is an fraction.
  // 		*/
  // 		while ((gold * TAXRATE) < taxes)
  // 			gold += taxes;
  // 		readmail(gold);
  // 	}
}



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
    case 262:
    case 263:
    case 269:
    case 271:
    case 286:
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
    setCharCallback(endgame, true);
    paint();
  } else {
    updateLog("---- Reload your browser to play again  ----");
    setCharCallback(dead, true);
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

  setCharCallback(dead, true);
  GAME_OVER = true;
  napping = true;
  IN_STORE = true;

  player.GOLD += player.BANKACCOUNT;
  player.BANKACCOUNT = 0;

  var newscore = getScore();

  console.log("wizard == " + wizard);
  console.log("cheater == " + cheat);

  if (!wizard && !cheat) {
    var winners = localStorage.getObject('winners') || [];
    var losers = localStorage.getObject('losers') || [];
    if (newscore.score > 0) {
      if (newscore.winner) {
        winners.push(newscore);
        localStorage.setObject(logname, 'winner'); // trigger to show mail next time
        localStorage.setObject('winners', winners);
      } else {
        losers.push(newscore);
        localStorage.setObject('losers', losers);
      }
    }
  }

  showscores(newscore);
}



function showscores(newscore) {
  var exitscores = function(key) {
    if (key == ESC || key == ' ' || key == ENTER) {
      return exitbuilding();
    }
  }

  IN_STORE = true;
  clear();
  lprcat("                                <b>Larn Scoreboard</b> \n");
  var winners = localStorage.getObject('winners') || [];
  var losers = localStorage.getObject('losers') || [];

  if (winners.length != 0 || losers.length != 0) {
    printwinners(winners, newscore);
    printlosers(losers, newscore);
  } else {
    lprcat("\n  The scoreboard is empty");
  }

  cursor(1, 24);
  if (!GAME_OVER) {
    lprcat("                        ---- Press <b>escape</b> to exit  ----");
    setCharCallback(exitscores, true);
  } else {
    lprcat("                     ---- Reload your browser to play again  ----");
  }
  blt();
}



function dead(key) {
  return 0;
}
