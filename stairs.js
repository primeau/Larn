"use strict";


/*
For command mode.  Checks that player is actually standing at a set up
up stairs or volcanic shaft.
*/
function up_stairs() {
  var item = getItem(player.x, player.y);

  if (item.matches(OSTAIRSDOWN)) {
    updateLog("The stairs don't go up!");
    dropflag = 1;
  }

  else if (item.matches(OVOLUP))
    act_up_shaft();

  else if (!item.matches(OSTAIRSUP)) {
    updateLog("I see no way to go up here!");
    dropflag = 1;
  }

  else
    act_up_stairs();
}



/*
For command mode.  Checks that player is actually standing at a set of
down stairs or volcanic shaft.
*/
function down_stairs() {
  var item = getItem(player.x, player.y);

  if (item.matches(OSTAIRSUP)) {
    updateLog("The stairs don't go down!");
    dropflag = 1;
  }


  else if (item.matches(OVOLDOWN))
    act_down_shaft();

  else if (!item.matches(OSTAIRSDOWN)) {
    updateLog("I see no way to go down here!");
    dropflag = 1;
  }

  else
    act_down_stairs();
}



/*
assumes that cursors() has been called and that a check has been made that
the user is actually standing at a set of up stairs.
*/
function act_up_stairs() {
  if (level >= 2 && level != 11) {
    newcavelevel(level - 1);
  } else {
    updateLog("The stairs lead to a dead end!");
    dropflag = 1;
  }
}



/*
assumes that cursors() has been called and that a check has been made that
the user is actually standing at a set of down stairs.
*/
function act_down_stairs() {
  if (level != 0 && level != 10 && level != 13) {
    newcavelevel(level + 1);
  } else {
    updateLog("The stairs lead to a dead end!");
    dropflag = 1;
  }
}



/*
Perform the act of climbing down the volcanic shaft.  Assumes
cursors() has been called and that a check has been made that
are actually at a down shaft.
*/
function act_down_shaft() {
  if (level != 0) {
    updateLog("The shaft only extends 5 feet downward!");
    return;
  }

  if (packweight() > 45 + 3 * (player.STRENGTH + player.STREXTRA)) {
    updateLog("You slip and fall down the shaft");
    lastnum = 275;
    player.losehp(30 + rnd(20));
  }

  newcavelevel(MAXLEVEL);
  // moveNear(OVOLUP, false); // this is a larn 12.0 "feature"

}



/*
Perform the action of climbing up the volcanic shaft. Assumes
cursors() has been called and that a check has been made that
are actually at an up shaft.
*/
function act_up_shaft() {
  if (level != 11) {
    updateLog("The shaft only extends 8 feet upwards before you find a blockage!");
    return;
  }

  if (packweight() > 45 + 5 * (player.STRENGTH + player.STREXTRA)) {
    updateLog("You slip and fall down the shaft");
    lastnum = 275;
    player.losehp(15 + rnd(20));
    return;
  }

  newcavelevel(0);
  moveNear(OVOLDOWN, false);
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
    player.level.items[x][y] = OEMPTY; /* destroy the chest */
    player.level.know[x][y] = 0;
    if (rnd(100) < 69) {
      creategem(); /* gems from the chest */
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
        updateLog("  The door makes an awful groan, but remains stuck");
        player.AGGRAVATE += rnd(400);
        break;

      case 7:
        updateLog("  You are jolted by an electric shock ");
        lastnum = 274;
        player.losehp(rnd(20));
        break;

      case 8:
        updateLog("  You feel drained");
        player.loselevel();
        break;

      case 9:
        updateLog("  You suddenly feel weaker ");
        player.STRENGTH = Math.max(3, player.STRENGTH - 1);
        break;

      default:
        updateLog("  The door doesn't budge");
        return (0);
        break;
    }
  } else {
    updateLog("  The door opens");
    player.level.know[x][y] = 0;
    player.level.items[x][y] = createObject(OOPENDOOR);
    return (1);
  }
}
