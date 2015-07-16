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
    player.level.items[player.x][player.y] = createObject(ODEADTHRONE, itemAt(player.x, player.y).arg);
    //know[player.x][player.y] = 0;
  } else if (k < 40 && arg == 0) {
    createmonster(45); // GNOMEKING
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
    createmonster(45); // GNOMEKING
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
    Perform the actions common to command and prompt mode when opening a
    door.  Assumes cursors().

    Parameters:     the X,Y location of the door to open.
    Return value:   TRUE if successful in opening the door, false if not.
*/
function act_open_door(x, y) {
  if (rnd(11) < 7) {
    switch (itemAt(x, y).arg) {
      case 6:
        player.AGGRAVATE += rnd(400);
        break;

      case 7:
        updateLog("You are jolted by an electric shock ");
        player.lastnum = 274;
        losehp(rnd(20));
        break;

      case 8:
        updateLog("TODO: player.loselevel()");
        player.loselevel();
        break;

      case 9:
        updateLog("You suddenly feel weaker ");
        player.STRENGTH = Math.max(3, player.STRENGTH - 1);
        break;

      default:
        break;
    }
  } else {
    //know[x][y] = 0;
    player.level.items[x][y] = createObject(OOPENDOOR);
    player.level.paint();
    return (1);
  }
  player.level.paint();
  return (0);
}
