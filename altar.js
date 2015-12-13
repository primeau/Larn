'use strict';


/* For command mode. Perform the act of descecrating an altar */
function desecrate_altar() {
  cursors();
  if (itemAt(player.x, player.y).matches(OALTAR)) {
    act_desecrate_altar();
  } else {
    updateLog(`I see no altar to desecrate here!`);
  }
}



/* For command mode. Perform the act of praying at an altar */
function pray_at_altar() {
  cursors();
  if (!itemAt(player.x, player.y).matches(OALTAR)) {
    updateLog(`I see no altar to pray at here!`);
  } else {
    updateLog(`  How much do you donate? `);
    setNumberCallback(act_donation_pray, true);
    nomove = 1;
  }
}



/*
    Perform the actions associated with praying at an altar and giving a
    donation.
*/
function act_donation_pray(k) {
  if (k == ESC) {
      appendLog(` cancelled`);
      nomove = 1;
      prayed = 0;
      return 1;
  }

  if (k == '*') {
    debug(k = player.GOLD);
  }

  k = Number(k);

  /* make giving zero gold equivalent to 'just pray'ing.  Allows player to
     'just pray' in command mode, without having to add yet another command.
  */
  if (k == 0) {
    act_just_pray();
    dropflag = 1;
    prayed = 1;
    return 1;
  }

  if (player.GOLD >= k) {
    prayed = 1;
    dropflag = 1;

    var temp = player.GOLD / 10;
    player.setGold(player.GOLD - k);

    /* if player gave less than 10% of _original_ gold, make a monster
     */
    if (k < temp || k < rnd(50)) {
      createmonster(makemonst(level + 1));
      player.AGGRAVATE += 200;
      return 1;
    }
    if (rnd(101) > 50) {
      act_prayer_heard();
      return 1;
    }
    if (rnd(43) == 5) {
      if (player.WEAR || player.SHIELD)
        updateLog(`  You feel your armor vibrate for a moment`);
      enchantarmor();
      return 1;
    }
    if (rnd(43) == 8) {
      if (player.WIELD)
        updateLog(`  You feel your weapon vibrate for a moment`);
      enchweapon();
      return 1;
    }

    updateLog(`  Thank You.`);
    return 1;
  }

  /* Player donates more gold than they have.  Loop back around so
     player can't escape the altar for free.
  */
  updateLog(`  You don't have that much!`);
  prayed = 0;
  dropflag = 1;
  return 1;

}



/*
    Performs the actions associated with 'just praying' at the altar.  Called
    when the user responds 'just pray' when in prompt mode, or enters 0 to
    the money prompt when praying.
*/
function act_just_pray() {
  if (rnd(100) < 75)
    updateLog(`  Nothing happens`);
  else if (rnd(43) == 10) {
    if (player.WEAR || player.SHIELD)
      updateLog(`  You feel your armor vibrate for a moment`);
    enchantarmor();
    return;
  } else if (rnd(43) == 10) {
    if (player.WIELD)
      updateLog(`  You feel your weapon vibrate for a moment`);
    enchweapon();
    return;
  } else
    createmonster(makemonst(level + 1));
  return;
}



/*
    Perform the actions associated with Altar desecration.
*/
function act_desecrate_altar() {
  if (rnd(100) < 60) {
    createmonster(makemonst(level + 2) + 8);
    player.AGGRAVATE += 2500;
  } else if (rnd(101) < 30) {
    updateLog(`  The altar crumbles into a pile of dust before your eyes`);
    forget(); /*  remember to destroy the altar   */
  } else
    updateLog(`  Nothing happens`);
  return;
}



/*
    Performs the act of ignoring an altar.

    Assumptions:  cursors() has been called.
*/
function act_ignore_altar(x, y) {
  if (rnd(100) < 30) {
    createmonster(makemonst(level + 1), x, y);
    player.AGGRAVATE += rnd(450);
  } else
    updateLog(`  Nothing happens`);
  return;
}



/*
    function to cast a +3 protection on the player
 */
function act_prayer_heard() {
  updateLog(`  You have been heard!`);
  if (player.ALTPRO == 0)
    player.MOREDEFENSES += 3;
  player.updateAltPro(500); /* protection field */
}
