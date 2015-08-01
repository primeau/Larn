"use strict";

const MAXINVEN = 26;

/*
    function to put something in the players inventory
    returns true if success, false if a failure
*/
function take(item) {
  if (item.carry == false) {
    return false;
  }
  var limit = Math.min(15 + (player.LEVEL >> 1), MAXINVEN);
  for (var i = 0; i < limit; i++) {
    if (player.inventory[i] == null) {
      player.inventory[i] = item;
      debug("take(): " + item);
      limit = 0;
      player.adjustcvalues(item, true);
      updateLog(`You pick up: ${'a'.nextChar(i)}) ${item}`);
      if (limit) {
        //bottomline(); //player.level.paint();
      }
      return (true);
    }
  }
  updateLog("You can't carry anything else");
  return false;
}


/*
    subroutine to drop an object  returns false if something there already else true
 */
function drop_object(index) {
  dropflag = 1; /* say dropped an item so wont ask to pick it up right away */

  var useindex = getIndexFromChar(index);
  var item = player.inventory[useindex];

  if (item == null) {
    if (useindex >= 0 && useindex < 26) {
      updateLog(`  You don't have item ${index}!`);
    }
    if (useindex <= -1) {
        appendLog(` cancelled`);
    }
    return 1;
  }

  if (isItemAt(player.x, player.y)) {
    beep();
    updateLog("  There's something here already");
    return 1;
  }

  // if (playery == MAXY - 1 && playerx == 33) return (1); /* not in entrance */

  player.inventory[useindex] = null;
  player.level.items[player.x][player.y] = item;

  updateLog(`  You drop: ${item}`);
  // show3(k); /* show what item you dropped*/
  // know[playerx][playery] = 0;

  if (player.WIELD === item) {
    player.WIELD = null;
  }
  if (player.WEAR === item) {
    player.WEAR = null;
  }
  if (player.SHIELD === item) {
    player.SHIELD = null;
  }
  player.adjustcvalues(item, false);

  return 1;
}


/*
    routine to tell if player can carry one more thing
    returns 1 if pockets are full, else 0
*/
function pocketfull() {
  var limit = Math.min(15 + (player.LEVEL >> 1), MAXINVEN); //TODO externalize
  for (var i = 0; i < limit; i++) {
    if (player.inventory[i] == null) {
      return (false);
    }
  }
  return (true);
}
