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
    //know[player.x][player.y] = 0;
  } else if (k < 40 && arg == 0) {
    createmonster(GNOMEKING);
    player.level.items[player.x][player.y].arg = 1;
    //know[player.x][player.y] = 0;
  } else {
    updateLog("Nothing happens");
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
    //know[player.x][player.y] = 0;
  } else if (k < 35) {
    updateLog("Zaaaappp!  You've been teleported!\n");
    beep();
    oteleport(0);
  } else {
    updateLog("Nothing happens");
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
    lprcat("Oops!  You seem to have caught the dreadful sleep!");
    beep();
    lflush();
    sleep(3);
    died(280);
    return;
  }

  var x = rnd(100);
  if (x < 7) {
    player.HALFDAM += 200 + rnd(200);
    lprcat("You feel a sickness coming on");
  } else if (x < 13)
    quaffpotion(23, false); /* see invisible,but don't know the potion */

  else if (x < 45)
    lprcat("nothing seems to have happened");

  else if (rnd(3) != 2)
    fntchange(1); /*  change char levels upward   */

  else
    fntchange(-1); /*  change char levels downward */

  if (rnd(12) < 3) {
    lprcat("The fountains bubbling slowly quiets");
    setItem(player.x, player.y, createObject(ODEADFOUNTAIN)); /* dead fountain */
    //know[playerx][playery]=0;
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
    lprcat(`Oh no!  The water was foul!  You suffer ${x} hit points!`);
    lastnum = 273;
    player.losehp(x);
    // bottomline();
    // cursors();
  } else if (rnd(100) < 29) {
    lprcat("You got the dirt off!");
  } else if (rnd(100) < 31) {
    lprcat("This water seems to be hard water!  The dirt didn't come off!");
  } else if (rnd(100) < 34) {
    createmonster(WATERLORD); /*    make water lord     */
  } else {
    lprcat("nothing seems to have happened");
  }
  player.level.paint();
  return;
}


/*
    Perform the actions common to command and prompt mode when opening a
    door.  Assumes cursors().

    Parameters:     the X,Y location of the door to open.
    Return value:   TRUE if successful in opening the door, false if not.
*/
function act_open_door(x, y) {
  if (rnd(11) < 7) {
    switch (getItem(x, y).arg) {
      case 6:
        player.AGGRAVATE += rnd(400);
        break;

      case 7:
        updateLog("You are jolted by an electric shock ");
        player.lastnum = 274;
        player.losehp(rnd(20));
        break;

      case 8:
        player.loselevel();
        break;

      case 9:
        updateLog("You suddenly feel weaker ");
        player.STRENGTH = Math.max(3, player.STRENGTH - 1);
        break;

      default:
        break;
    }
    player.level.paint();
    return (0);
  } else {
    //know[x][y] = 0;
    player.level.items[x][y] = createObject(OOPENDOOR);
    player.level.paint();
    return (1);
  }
}
