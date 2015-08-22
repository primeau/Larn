"use strict";



var scoreBoard = [];


var ScoreBoardEntry = function() {

  this.score = score; /* the score of the player                          */
  this.what = what; /* the number of the monster that killed player     */
  this.level = level; /* the level player was on when he died             */
  this.hardlev = hardlev; /* the level of difficulty player played at         */
  this.who = who; /* the name of the character                        */

  this.timeused = timeused; /* the time used in mobuls to win the game          */
  this.taxes = taxes; /* taxes he owes to LRS                             */
  this.hasmail hasmail; /* 1 if mail is to be read, 0 otherwise */

  this.player = player;
  this.knownPotions = knownPotions;
  this.knownScrolls = knownScrolls;
  this.knownSpells = knownSpells;

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
 *  winshou()       Subroutine to print out the winning scoreboard
 *
 *  Returns the number of players on scoreboard that were shown
 */
function winshou() {
  // struct wscofmt * p;
  // int i, j, count;
  //
  // for (count = j = i = 0; i < SCORESIZE; i++) /* is there anyone on the scoreboard? */
  //   if (winr[i].score != 0) {
  //     j++;
  //     break;
  //   }
  // if (j) {
  //   lprcat("\n  Score    Difficulty   Time Needed   Larn Winners List\n");
  //
  //   for (i = 0; i < SCORESIZE; i++) /* this loop is needed to print out the */
  //     for (j = 0; j < SCORESIZE; j++) /* winners in order */ {
  //       p = & winr[j]; /* pointer to the scoreboard entry */
  //       if (p - > order == i) {
  //         if (p - > score) {
  //           count++;
  //           lprintf("%10d     %2d      %5d Mobuls   %s \n", (int) p - > score, (int) p - > hardlev, (int) p - > timeused, p - > who);
  //         }
  //         break;
  //       }
  //     }
  // }
  // return (count); /* return number of people on scoreboard */
}



/*
 *  Subroutine to print out the non-winners scoreboard
 *
 *  Enter with 0 to list the scores, enter with 1 to list inventories too
 *  Returns the number of players on scoreboard that were shown
 */
function shou(x) {
  // int i, j, n, k;
  // int count;
  //
  // for (count = j = i = 0; i < SCORESIZE; i++) /* is the scoreboard empty? */
  //   if (sco[i].score != 0) {
  //     j++;
  //     break;
  //   }
  // if (j) {
  //   lprcat("\n   Score   Difficulty   Larn Visitor Log\n");
  //   for (i = 0; i < SCORESIZE; i++) /* be sure to print them out in order */
  //     for (j = 0; j < SCORESIZE; j++)
  //       if (sco[j].order == i) {
  //         if (sco[j].score) {
  //           count++;
  //           lprintf("%10ld     %2d       %s ", sco[j].score, sco[j].hardlev, sco[j].who);
  //           if (sco[j].what < 256)
  //             lprintf("killed by a %s", monster[sco[j].what].name);
  //           else
  //             lprintf("%s", whydead[sco[j].what - 256]);
  //           if (x != 263)
  //             lprintf(" on %s", levelname[sco[j].level]);
  //           if (x) {
  //             for (n = 0; n < 26; n++) {
  //               iven[n] = sco[j].sciv[n][0];
  //               ivenarg[n] = sco[j].sciv[n][1];
  //             }
  //             for (k = 1; k < 99; k++) {
  //               for (n = 0; n < 26; n++) {
  //                 if (k == iven[n])
  //                   show3(n);
  //               }
  //             }
  //             lprcat("\n\n");
  //           } else lprc('\n');
  //         }
  //         j = SCORESIZE;
  //       }
  // }
  // return (count); /* return the number of players just shown */
}



/*
 *  showscores()        Function to show the scoreboard on the terminal
 *
 *  Returns nothing of value
 */
const esb = "The scoreboard is empty.\n";

function showscores() {
  // int i, j;
  //
  // lflush();
  // lcreat((char * ) 0);
  //
  // if (readboard() < 0) {
  //
  //   return;
  // }
  //
  // i = winshou();
  // j = shou(0);
  //
  // if (i + j == 0) {
  //
  //   lprcat(esb);
  //
  // } else {
  //
  //   lprc('\n');
  // }
  //
  // lflush();
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
 */
function died(reason) {

  var cantprotect = false;

  var cause = '-- ';
  if (typeof reason === "number") {
    cause += whydead[(Number(reason) - 256)];
  } //
  else {
    reason = 0; // TODO check for unseen attacker?
    cause += `killed by a ${lastmonst}`;
  }

  if (player.LIFEPROT > 0) {
    switch (reason) {
      case 262:
      case 263:
      case 269:
      case 271:
        cantprotect = true;
    }

    if (!cantprotect) {
      --player.LIFEPROT;
      --player.CONSTITUTION;
      player.HP = 1;

      //cursors();
      updateLog("You feel wiiieeeeerrrrrd all over!");
      nap(2000); // TODO
      return;
    }
  }

  if (reason != 263) {
    var pad = 67 - 14 - cause.length;
    cause = Array(pad).join(' ') + cause;
    if (DEBUG_IMMORTAL) {
      updateLog(`Immortal...    ${cause}`);
    } else {
      updateLog(`You Have Died! ${cause}`);
    }
  }
  paint();
  nomove = 1;
  dropflag = 1;

  if (DEBUG_IMMORTAL) {
    return;
  }

  setCharCallback(dead, true);
  napping = true;
  IN_STORE = true;
  GAME_OVER = true;


  // WarningOnClose = 2; TODO
  // cursors();
  // lprcat("\nPress ");
  // lstandout("Enter");
  // lprcat(" to continue: ");
  // while (ttgetch() != '\n') bell();
  //
  // cdesc[GOLD] += cdesc[BANKACCOUNT];
  // cdesc[BANKACCOUNT] = 0;
  //
  // {
  //   int win = 0;
  //
  //   if (x == 263) win = 1;
  //   newscore(cdesc[GOLD], logname, x, win);
  // }
  //
  // if (wizard == 0 && cdesc[GOLD] > 0)
  //   if (sortboard()) writeboard();
  //
  // showscores(0);
  //
  // end_program(""); /* doesn't return */
}



function dead(key) {
  return 0;
}
