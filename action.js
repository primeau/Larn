"use strict";

/*
    act_remove_gems

    Remove gems from a throne.

    arg is zero if there is a gnome king associated with the throne

    Assumes that cursors() has been called previously, and that a check
    has been made that the throne actually has gems.
*/
function act_remove_gems(arg) {
  var k = rnd(101);
  if (k < 25) {
    for (var i = 0; i < rnd(4); i++) {
      creategem(); /* gems pop off the throne */
    }
    player.level.items[player.x][player.y] = createObject(ODEADTHRONE, getItem(player.x, player.y).arg);
    player.level.know[player.x][player.y] = 0;
  } else if (k < 40 && arg == 0) {
    createmonster(GNOMEKING);
    player.level.items[player.x][player.y].arg = 1;
    player.level.know[player.x][player.y] = 0;
  } else {
    updateLog("  Nothing happens");
  }
  return;
}



/*
    act_sit_throne

    Sit on a throne.

    arg is zero if there is a gnome king associated with the throne

    Assumes that cursors() has been called previously.
*/
function act_sit_throne(arg) {
  var k = rnd(101);
  if (k < 30 && arg == 0) {
    createmonster(GNOMEKING);
    player.level.items[player.x][player.y].arg = 1;
    player.level.know[player.x][player.y] = 0;
  } else if (k < 35) {
    updateLog("  Zaaaappp!  You've been teleported!");
    beep();
    oteleport(0);
  } else {
    updateLog("  Nothing happens");
  }
  return;
}


/*
    Code to perform the action of drinking at a fountian.  Assumes that
    cursors() has already been called, and that a check has been made that
    the player is actually standing at a live fountain.
*/
function act_drink_fountain() {
  if (rnd(1501) < 2) {
    updateLog("  Oops! You seem to have caught the dreadful sleep!");
    beep();
    lflush();
    sleep(3);
    died(280);
    return;
  }

  var x = rnd(100);
  if (x < 7) {
    player.HALFDAM += 200 + rnd(200);
    updateLog("  You feel a sickness coming on");
  } else if (x < 13)
    quaffpotion(createObject(OPOTION, 23), false); /* see invisible,but don't know the potion */

  else if (x < 45)
    updateLog("  Nothing seems to have happened");

  else if (rnd(3) != 2)
    fntchange(1); /*  change char levels upward   */

  else
    fntchange(-1); /*  change char levels downward */

  if (rnd(12) < 3) {
    updateLog("  The fountains bubbling slowly quiets");
    setItem(player.x, player.y, createObject(ODEADFOUNTAIN)); /* dead fountain */
    player.level.know[player.x][player.y] = 0;
  }
  return;
}


/*
    Code to perform the action of washing at a fountain.  Assumes that
    cursors() has already been called and that a check has been made that
    the player is actually standing at a live fountain.
*/
function act_wash_fountain() {
  if (rnd(100) < 11) {
    var x = rnd((player.level.depth << 2) + 2);
    updateLog(`  Oh no!  The water was foul!  You suffer ${x} hit points!`);
    lastnum = 273;
    player.losehp(x);
    // bottomline();
    // cursors();
  } else if (rnd(100) < 29) {
    updateLog("  You got the dirt off!");
  } else if (rnd(100) < 31) {
    updateLog("  This water seems to be hard water!  The dirt didn't come off!");
  } else if (rnd(100) < 34) {
    createmonster(WATERLORD); /*    make water lord     */
  } else {
    updateLog("  Nothing seems to have happened");
  }
  //player.level.paint();
  return;
}



/*
    Performs the act of opening a chest.

    Parameters:   x,y location of the chest to open.
    Assumptions:  cursors() has been called previously
*/
function act_open_chest(x, y) {
  var chest = getItem(x, y);
  if (!chest.matches(OCHEST)) {
    return;
  }
  if (rnd(101) < 40) {
    updateLog("  The chest explodes as you open it");
    beep();
    var i = rnd(10);
    lastnum = 281; /* in case he dies */
    updateLog(`  You suffer ${i} hit points damage!`);
    if (i > 0) {
      player.losehp(i);
      //bottomhp();
    }
    switch (rnd(10)) /* see if he gets a curse */ {
      case 1:
        player.ITCHING += rnd(1000) + 100;
        updateLog("  You feel an irritation spread over your skin!");
        beep();
        break;

      case 2:
        player.CLUMSINESS += rnd(1600) + 200;
        updateLog("  You begin to lose hand to eye coordination!");
        beep();
        break;

      case 3:
        player.HALFDAM += rnd(1600) + 200;
        beep();
        updateLog("  A sickness engulfs you!");
        break;
    };
    player.level.items[x][y] = createObject(OEMPTY); /* destroy the chest */
    player.level.know[x][y] = 0;
    if (rnd(100) < 69) {
      creategem();  /* gems from the chest */
    }
    dropgold(rnd(110 * chest.arg + 200));
    for (i = 0; i < rnd(4); i++) {
      something(chest.arg + 2);
    }
  } else
    updateLog("  Nothing happens");
  return;
}



/*
    Perform the actions common to command and prompt mode when opening a
    door.  Assumes cursors().

    Parameters:     the X,Y location of the door to open.
    Return value:   TRUE if successful in opening the door, false if not.
*/
function act_open_door(x, y) {
  var door = getItem(x, y);
  if (!door.matches(OCLOSEDDOOR)) {
    return;
  }
  if (rnd(11) < 7) {
    switch (door.arg) {
      case 6:
        player.AGGRAVATE += rnd(400);
        break;

      case 7:
        updateLog("  You are jolted by an electric shock ");
        player.lastnum = 274;
        player.losehp(rnd(20));
        break;

      case 8:
        player.loselevel();
        break;

      case 9:
        updateLog("  You suddenly feel weaker ");
        player.STRENGTH = Math.max(3, player.STRENGTH - 1);
        break;

      default:
        break;
    }
    updateLog("  The door doesn't budge");
    return (0);
  } else {
    player.level.know[x][y] = 0;
    player.level.items[x][y] = createObject(OOPENDOOR);
    return (1);
  }
}
