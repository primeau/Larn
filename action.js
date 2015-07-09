"use strict";

/*
    Perform the actions common to command and prompt mode when opening a
    door.  Assumes cursors().

    Parameters:     the X,Y location of the door to open.
    Return value:   TRUE if successful in opening the door, false if not.
*/
function act_open_door(x, y) {
  if (rnd(11) < 7) {
    console.log("foo!" + itemAt(x, y).arg);
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
