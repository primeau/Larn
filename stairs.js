'use strict';


/*
For command mode.  Checks that player is actually standing at a set up
up stairs or volcanic shaft.
*/
function up_stairs() {
  var item = itemAt(player.x, player.y);

  if (item.matches(OSTAIRSDOWN)) {
    updateLog(`  The stairs don't go up!`);
    dropflag = 1;
  } else if (item.matches(OVOLUP))
    act_up_shaft();

  else if (!item.matches(OSTAIRSUP)) {
    updateLog(`  I see no way to go up here!`);
    dropflag = 1;
  } else
    act_up_stairs();
}



/*
For command mode.  Checks that player is actually standing at a set of
down stairs or volcanic shaft.
*/
function down_stairs() {
  var item = itemAt(player.x, player.y);

  if (item.matches(OSTAIRSUP)) {
    updateLog(`  The stairs don't go down!`);
    dropflag = 1;
  } else if (item.matches(OVOLDOWN))
    act_down_shaft();

  else if (item.matches(OENTRANCE))
    enter();

  else if (!item.matches(OSTAIRSDOWN)) {
    updateLog(`  I see no way to go down here!`);
    dropflag = 1;
  } else
    act_down_stairs();
}



/*
assumes that cursors() has been called and that a check has been made that
the user is actually standing at a set of up stairs.
*/
function act_up_stairs() {
  if (level > 1 && level != MAXLEVEL) {
    newcavelevel(level - 1);
  } else {
    updateLog(`  The stairs lead to a dead end!`);
    dropflag = 1;
  }
}



/*
assumes that cursors() has been called and that a check has been made that
the user is actually standing at a set of down stairs.
*/
function act_down_stairs() {
  if (level != 0 && level != MAXLEVEL-1 && level != MAXLEVEL+MAXVLEVEL-1) {
    newcavelevel(level + 1);
  } else {
    updateLog(`  The stairs lead to a dead end!`);
    dropflag = 1;
  }
}



/*
Perform the act of climbing down the volcanic shaft.  Assumes
cursors() has been called and that a check has been made that
are actually at a down shaft.
*/
function act_down_shaft() {
  setMazeMode(true);

  if (level != 0) {
    updateLog(`  The shaft only extends 5 feet downward!`);
    return;
  }

  /*
  v12.4.5 - far too many newbie players go into the volcanic shaft, die,
            and never play again. this seemed like the least restrictive
            way to prevent that from happening.
  */
  // if (gtime < 100) {
  // if (player.EXPERIENCE < 10) {
  if (LEVELS[1] == null && !wizard) {
    nomove = 1;
    updateLog(`  You feel a foreboding sense of doom, and back away`);
    return;
  }

  if (packweight() > 45 + 3 * (player.STRENGTH + player.STREXTRA)) {
    updateLog(`  You slip and fall down the shaft`);
    lastnum = 275; /* slipped on a volcano shaft */
    player.losehp(30 + rnd(20));
  }

  newcavelevel(MAXLEVEL);
  // moveNear(OVOLUP, false); // this is a larn 12.0 `feature`

}



/*
Perform the action of climbing up the volcanic shaft. Assumes
cursors() has been called and that a check has been made that
are actually at an up shaft.
*/
function act_up_shaft() {
  setMazeMode(true);

  if (level != MAXLEVEL) {
    updateLog(`  The shaft only extends 8 feet upwards before you find a blockage!`);
    return;
  }

  if (packweight() > (ULARN ? 40 : 45) + 5 * (player.STRENGTH + player.STREXTRA)) {
    updateLog(`  You slip and fall down the shaft`);
    lastnum = 275; /* slipped on a volcano shaft */
    player.losehp(15 + rnd(20));
    return;
  }

  newcavelevel(0);
  moveNear(OVOLDOWN, false);
}
