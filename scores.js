"use strict";


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
    }
    else {
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
