"use strict";

/*
    subroutine to process an altar object
*/
function oaltar(key) {
  var item = getItem(player.x, player.y);
  if (!item.matches(OALTAR)) {
    return 1;
  }
  switch (key) {
    case 'p':
      appendLog(" pray");
      lprcat("  Do you (m) give money or (j) just pray?");
      blocking_callback = oaltar_pray_helper;
      return 0;

    case 'd':
      appendLog(" desecrate");
      act_desecrate_altar();
      return 1;

    case ESC:
    case 'i':
      appendLog(" ignore");
      act_ignore_altar();
      return 1;
  };
  return 0;
}


function oaltar_pray_helper(key) {
  switch (key) {
    case 'j':
      //lprcat("\n");
      appendLog(" just pray");
      act_just_pray();
      return 1;

    case 'm':
      appendLog(" give money");
      lprcat("how much do you donate? ");
      blocking_callback = getnumberinput;
      keyboard_input_callback = act_donation_pray;
      return 0;

    case ESC:
      lookforobject(true, false, true); // re-find the altar
      return 0;
  };
  return 0;
}


/*
    Perform the actions associated with praying at an altar and giving a
    donation.
*/
function act_donation_pray(k) {
    // lprcat("\n");
    // cursor(1, 24);
    // cltoeoln();
    // cursor(1, 23);
    // cltoeoln();
    //var k = readnum(player.GOLD);

    // TODO: accept "*" to donate all gold
    
    /* make giving zero gold equivalent to 'just pray'ing.  Allows player to
       'just pray' in command mode, without having to add yet another command.
    */
    if (k == 0) {
      act_just_pray();
      return 1;
    }

    if (player.GOLD >= k) {
      var temp = player.GOLD / 10;
      player.GOLD -= k;
      bottomline();

      /* if player gave less than 10% of _original_ gold, make a monster
       */
      if (k < temp || k < rnd(50)) {
        createmonster(makemonst(player.level.depth + 1));
        player.AGGRAVATE += 200;
        return 1;
      }
      if (rnd(101) > 50) {
        act_prayer_heard();
        return 1;
      }
      if (rnd(43) == 5) {
        if (player.WEAR != null)
          lprcat("You feel your armor vibrate for a moment");
        enchantarmor();
        return 1;
      }
      if (rnd(43) == 8) {
        if (player.WIELD != null)
          lprcat("You feel your weapon vibrate for a moment");
        enchweapon();
        return 1;
      }

      lprcat("Thank You.");
      return 1;
    }

    /* Player donates more gold than they have.  Loop back around so
       player can't escape the altar for free.
    */
    lprcat("  You don't have that much!");
    //lookforobject(true, false, true);

    lprcat("how much do you donate? ");
    blocking_callback = getnumberinput;
    keyboard_input_callback = act_donation_pray;
    return 0;

    // blocking_callback = oaltar_pray_helper;
    // parseEvent("m");
    // return 0;
}


/*
    Performs the actions associated with 'just praying' at the altar.  Called
    when the user responds 'just pray' when in prompt mode, or enters 0 to
    the money prompt when praying.

    Assumes cursors(), and that any leading \n have been printed (to get
    around VMS echo mode problem.
*/
function act_just_pray() {
  if (rnd(100) < 75)
    lprcat("nothing happens");
  else if (rnd(43) == 10) {
    if (player.WEAR != null)
      lprcat("You feel your armor vibrate for a moment");
    enchantarmor();
    return;
  } else if (rnd(43) == 10) {
    if (player.WIELD != null)
      lprcat("You feel your weapon vibrate for a moment");
    enchweapon();
    return;
  } else
    createmonster(makemonst(player.level.depth + 1));
  return;
}


/*
    Perform the actions associated with Altar desecration.
*/
function act_desecrate_altar() {
  if (rnd(100) < 60) {
    createmonster(makemonst(player.level.depth + 2) + 8);
    player.AGGRAVATE += 2500;
  } else if (rnd(101) < 30) {
    lprcat("The altar crumbles into a pile of dust before your eyes");
    forget(); /*  remember to destroy the altar   */
  } else
    lprcat("nothing happens");
  return;
}


/*
    Performs the act of ignoring an altar.

    Assumptions:  cursors() has been called.
*/
function act_ignore_altar() {
  if (rnd(100) < 30) {
    createmonster(makemonst(player.level.depth + 1));
    player.AGGRAVATE += rnd(450);
  } else
    lprcat("Nothing happens");
  return;
}


/*
    function to cast a +3 protection on the player
 */
function act_prayer_heard() {
  lprcat("You have been heard!");
  if (player.ALTPRO == 0)
    player.MOREDEFENSES += 3;
  player.ALTPRO += 500; /* protection field */
  bottomline();
}
