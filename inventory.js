"use strict";

const MAXINVEN = 26;


/* show character's inventory */
function showinventory(select_allowed, callback, inv_filter, show_gold, show_time) {
  IN_STORE = true;
  var srcount = 0;

  setCharCallback(callback, true);

  cursor(1, 1);

  if (show_gold) {
    if (player.GOLD) {
      cltoeoln();
      lprcat(`.) ${player.GOLD} gold pieces\n`);
      srcount++;
    } else {
      show_gold = false;
    }
  }

  var widest = 40;
  var wrap = 23;
  //wrap -= show_gold ? 1 : 0;
  wrap -= show_time ? 1 : 0;

  var inventory = player.inventory.slice();
  inventory.sort(inv_sort);

  for (var k = 0; k < inventory.length; k++) {
    var item = inventory[k];
    if (inv_filter(item)) {
      srcount++;
      if (srcount <= wrap) {
        cltoeoln();
        widest = Math.max(widest, item.toString().length + 5);
      } else {
        var extra = show_gold ? 1 : 0;
        cursor(widest, srcount % wrap + extra);
      }
      var foo = player.inventory.indexOf(item);
      lprcat(`${getCharFromIndex(foo)}) ${item}\n`);
    }
  }

  cursor(1, Math.min(wrap + 1, ++srcount));

  if (show_time) {
    cltoeoln();
    lprcat(`Elapsed time is ${elapsedtime()}. You have ${timeleft()} mobuls left\n`);
  }

  cltoeoln();
  more(select_allowed);

  blt();

}



function showall(item) {
  return item != null;
}

function showwield(item) {
  return item && item.isWeapon();
}

function showwear(item) {
  return item && item.isArmor();
}

function showeat(item) {
  return item && item.matches(OCOOKIE);
}

function showread(item) {
  return item && (item.matches(OSCROLL) || item.matches(OBOOK));
}

function showquaff(item) {
  return item && item.matches(OPOTION);
}



const sortorder = [
  OLARNEYE.id,

  OSHIELD.id,
  OLEATHER.id,
  OSTUDLEATHER.id,
  ORING.id,
  OCHAIN.id,
  OSPLINT.id,
  OPLATE.id,
  OPLATEARMOR.id,
  OSSPLATE.id,

  ODAGGER.id,
  OSPEAR.id,
  OFLAIL.id,
  OBATTLEAXE.id,
  OLONGSWORD.id,
  O2SWORD.id,
  OSWORD.id,
  OSWORDofSLASHING.id,
  OHAMMER.id,
  OLANCE.id,

  ORINGOFEXTRA.id,
  OREGENRING.id,
  OPROTRING.id,
  OENERGYRING.id,
  ODEXRING.id,
  OSTRRING.id,
  OCLEVERRING.id,
  ODAMRING.id,

  OBELT.id,

  OSCROLL.id,
  OPOTION.id,
  OBOOK.id,

  OCHEST.id,
  OAMULET.id,
  OORBOFDRAGON.id,
  OSPIRITSCARAB.id,
  OCUBEofUNDEAD.id,
  ONOTHEFT.id,

  OSAPPHIRE.id,
  ORUBY.id,
  OEMERALD.id,
  ODIAMOND.id,

  OCOOKIE.id,
];



function inv_sort(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  var asort = sortorder.indexOf(a.id); // JRP we could cache this in the item object
  var bsort = sortorder.indexOf(b.id); // but it's not enough of a perf issue
  if (asort != bsort) {
    return asort - bsort;
  } else {
    return a.arg - b.arg;
  }
  //return sortorder.indexOf(a.id) - sortorder.indexOf(b.id);
}




function parse_inventory(key) {
  nomove = 1;
  if (key == ESC || key == ' ') {
    IN_STORE = false;
    return 1;
  } else {
    return 0;
  }
}



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
      updateLog(`  You pick up:`);
      updateLog(`${getCharFromIndex(i)}) ${item}`);
      if (limit) {
        //bottomline();  //TODO?
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

  if (index == '*' || index == ' ') {
    if (!IN_STORE) {
      showinventory(true, drop_object, showall, false, false);
    }
    else {
      IN_STORE = false;
      paint();
    }
    nomove = 1;
    return;
  }

  var useindex = getIndexFromChar(index);
  var item = player.inventory[useindex];

  if (item == null) {
    if (useindex >= 0 && useindex < 26) {
      updateLog(`  You don't have item ${index}!`);
    }
    if (useindex <= -1) {
      appendLog(` cancelled`);
    }
    IN_STORE = false;
    return 1;
  }

  if (isItemAt(player.x, player.y)) {
    beep();
    updateLog("  There's something here already");
    IN_STORE = false;
    return 1;
  }

  // if (player.y == MAXY - 1 && player.x == 33) return (1); /* not in entrance */

  player.inventory[useindex] = null;
  player.level.items[player.x][player.y] = item;

  updateLog(`  You drop: `);
  updateLog(`${getCharFromIndex(useindex)}) ${item}`);
  // show3(k); /* show what item you dropped*/
  player.level.know[player.x][player.y] = 0;

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

  IN_STORE = false;
  return 1;
}



/*
    routine to tell if player can carry one more thing
    returns 1 if pockets are full, else 0
*/
function pocketfull() {
  var limit = Math.min(15 + (player.LEVEL >> 1), MAXINVEN);
  for (var i = 0; i < limit; i++) {
    if (player.inventory[i] == null) {
      return (false);
    }
  }
  return (true);
}
