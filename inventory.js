"use strict";

const MAXINVEN = 26;

/*
    function to put something in the players inventory
    returns true if success, false if a failure
*/
function take(item) {
  var limit = Math.min(15 + (player.LEVEL >> 1), MAXINVEN);
  for (var i = 0; i < limit; i++) {
    if (player.inventory[i] == null) {
      player.inventory[i] = item;
      debug("inventory.take(): " + item);
      limit = 0;
      // switch(itm)
      //     {
      //     case OPROTRING: case ODAMRING: case OBELT: limit=1;  break;
      //     case ODEXRING:      c[DEXTERITY] += ivenarg[i]+1; limit=1;  break;
      //     case OSTRRING:      c[STREXTRA]  += ivenarg[i]+1;   limit=1; break;
      //     case OCLEVERRING:   c[INTELLIGENCE] += ivenarg[i]+1;  limit=1; break;
      //     case OHAMMER:       c[DEXTERITY] += 10; c[STREXTRA]+=10;
      //                         c[INTELLIGENCE]-=10;    limit=1;     break;
      //
      //     case OORBOFDRAGON:  c[SLAYING]++;       break;
      //     case OSPIRITSCARAB: c[NEGATESPIRIT]++;  break;
      //     case OCUBEofUNDEAD: c[CUBEofUNDEAD]++;  break;
      //     case ONOTHEFT:      c[NOTHEFT]++;       break;
      //     case OSWORDofSLASHING:  c[DEXTERITY] +=5;   limit=1; break;
      //     };
      updateLog("You pick up: " + item);
      if (limit) {
        //bottomline(); player.level.paint();
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

  if (index == null) {
    updateLog("What do you want to drop?");
    wait_for_drop_input = true;
    return;
  } else {
    //debug("drop_item(): " + index);
  }

  if (index == ESC) {
    updateLog("");
    wait_for_drop_input = false;
    return false;
  }

  var acode = "a".charCodeAt(0);
  var dropcode = index.charCodeAt(0);
  var dropIndex = dropcode - acode;

  debug("drop: " + dropIndex);

  var item = player.inventory[dropIndex];

  if (item == null) {
    if (dropIndex >= 0 && dropIndex < 26) {
      updateLog("You don't have item " + index + "!");
    }
    wait_for_drop_input = false;
    return false;
  }

  if (isItemAt(player.x, player.y)) {
    beep();
    updateLog("There's something here already");
    wait_for_drop_input = false;
    return false;
  }

  // if (playery == MAXY - 1 && playerx == 33) return (1); /* not in entrance */

  player.level.items[player.x][player.y] = item;
  updateLog("  You drop: " + item);
  // show3(k); /* show what item you dropped*/
  // know[playerx][playery] = 0;
  player.inventory[dropIndex] = null;
  // if (c[WIELD] == k) c[WIELD] = -1;
  // if (c[WEAR] == k) c[WEAR] = -1;
  // if (c[SHIELD] == k) c[SHIELD] = -1;
  // adjustcvalues(itm, ivenarg[k]);
  // dropflag = 1; /* say dropped an item so wont ask to pick it up right away */

  player.level.paint();
  wait_for_drop_input = false;
  return true;
}
