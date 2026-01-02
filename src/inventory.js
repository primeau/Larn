'use strict';

/* show character's inventory */
// HACK this printScreen business is probably the most embarassing code i've
// written for this project
// TODO change this to getInventory() that returns an array of appropriate items
// to separate filtering from viewing
function showinventory(select_allowed, callback, inv_filter, show_gold, show_time, printScreen, p) {

  if (!p) p = player;

  let buttons = [];

  if (callback) nomove = 1; // HACK callback is null when called by game_stats()

  if (printScreen) setMazeMode(false);
  let srcount = 0;

  if (callback) setCharCallback(callback);

  if (printScreen) cursor(1, 1);

  if (show_gold) {
    if (p.GOLD) {
      if (printScreen) cltoeoln();
      if (printScreen) lprcat(`.) ${Number(p.GOLD).toLocaleString()} gold pieces\n`);
      srcount++;
    } else {
      show_gold = false;
    }
  }

  let widest = 40;
  let wrap = 23;
  wrap -= show_time ? 1 : 0;

  let inventory = p.inventory.slice();
  inventory.sort(inv_sort);

  for (let k = 0; k < inventory.length; k++) {
    let item = inventory[k];
    if (inv_filter(item)) {
      srcount++;
      if (srcount <= wrap) {
        if (printScreen) cltoeoln();
        widest = Math.max(widest, item.toString().length + 5);
      } else {
        let extra = show_gold ? 1 : 0;
        if (printScreen) cursor(widest, srcount % wrap + extra);
      }
      let foo = p.inventory.indexOf(item);
      if (printScreen) lprcat(`${getCharFromIndex(foo)}) ${item}\n`);
      buttons.push([getCharFromIndex(foo), item]);
    }
  }

  if (printScreen) cursor(1, Math.min(wrap + 1, ++srcount));

  if (show_time) {
    if (printScreen) cltoeoln();
    if (printScreen) lprcat(`Elapsed time is ${elapsedtime()}. You have ${timeleft()} mobuls left\n`);
  }

  if (printScreen) cltoeoln();
  if (printScreen) more(select_allowed);
  if (printScreen) blt();

  return buttons;
}



function showall(item) {
  return item != null;
}

function showwield(item) {
  return item && item.isWeapon();
}

function showallwield(item) {
  return item && item.canWield();
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

  OELVENCHAIN.id,
  OSSPLATE.id,
  OPLATEARMOR.id,
  OPLATE.id,
  OSPLINT.id,
  OCHAIN.id,
  ORING.id,
  OSTUDLEATHER.id,
  OLEATHER.id,

  OSHIELD.id,

  OLANCE.id,
  OSLAYER.id,
  OHAMMER.id,
  OSWORDofSLASHING.id,
  OVORPAL.id,
  OSWORD.id,
  O2SWORD.id,
  OLONGSWORD.id,
  OBATTLEAXE.id,
  OBELT.id,
  OFLAIL.id,
  OSPEAR.id,
  ODAGGER.id,

  ORINGOFEXTRA.id,
  OPROTRING.id,
  OCLEVERRING.id,
  OREGENRING.id,
  OENERGYRING.id,
  ODEXRING.id,
  OSTRRING.id,
  ODAMRING.id,

  OSCROLL.id,
  OPOTION.id,
  OBOOK.id,

  OCHEST.id,
  OAMULET.id,

  OBRASSLAMP.id,
  OWWAND.id,
  OORBOFDRAGON.id,
  OSPIRITSCARAB.id,
  OCUBEofUNDEAD.id,
  ONOTHEFT.id,
  OSPHTALISMAN.id,
  OHANDofFEAR.id,
  OORB.id,
  OPSTAFF.id,
  OLIFEPRESERVER.id,

  ODIAMOND.id,
  ORUBY.id,
  OEMERALD.id,
  OSAPPHIRE.id,

  OCOKE.id,
  OSHROOMS.id,
  OHASH.id,
  OACID.id,
  OSPEED.id,
  OCOOKIE.id,
];



function inv_sort(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a.getSortCode() - b.getSortCode();
}



function parse_inventory(key) {
  nomove = 1;
  if (key == ESC || key == ' ') {
    setMazeMode(true);
    return 1;
  } else {
    return 0;
  }
}



function canTake(item) {
  return itemlist[item.id].carry;
}



/*
    function to put something in the players inventory
    returns true if success, false if a failure
*/
function take(item) {
  if (canTake(item) == false) {
    return false;
  }
  const limit = maxcarry();
  for (let i = 0; i < limit; i++) {
    if (!player.inventory[i]) {
      if (mazeMode) {
        updateLog(`  You pick up:`);
        updateLog(`${getCharFromIndex(i)}) ${item}`);
      }
      if (item.matches(OPOTION) && item.arg == 21) player.hasPickedUpPotion = true;
      if (item.matches(OLARNEYE)) player.hasPickedUpEye = true;
      debug(`take(): ` + item);
      player.adjustcvalues(item, true);
      player.inventory[i] = item;
      return true;
    }
  }
  updateLog(`You can't carry anything else${period}`);
  return false;
}



/*
    subroutine to drop an object  returns false if something there already else true
 */
function drop_object(index) {
  dropflag = 1; /* say dropped an item so wont ask to pick it up right away */
  if (index == '*' || index == ' ' || index == 'I') {
    if (mazeMode) {
      showinventory(true, drop_object, showall, false, false, true);
    } else {
      setMazeMode(true);
    }
    nomove = 1;
    return 0;
  }

  if (index == '.') {
    nomove = 1;
    setMazeMode(true); // fix for when dropping gold when inventory is visible
    updateLog(`How much gold will you drop? `);
    setNumberCallback(drop_object_gold, true);
    return 1;
  }

  const useindex = getIndexFromChar(index);
  const inventoryItem = player.inventory[useindex];
  const item = itemAt(player.x, player.y);
  const pitflag = item.matches(OPIT);

  if (!inventoryItem) {
    if (useindex >= 0 && useindex < 26) {
      updateLog(`  You don't have item ${index}!`);
    }
    if (useindex <= -1) {
      appendLog(` cancelled${period}`);
      nomove = 1;
    }
    setMazeMode(true);
    return 1;
  }

  if (!pitflag && !item.matches(OEMPTY)) {
    beep();
    updateLog(`  There's something here already${period}`);
    setMazeMode(true);
    return 1;
  }

  // if (player.y == MAXY - 1 && player.x == 33) return (1); /* not in entrance */

  updateLog(`  You drop: `);
  updateLog(`${getCharFromIndex(useindex)}) ${inventoryItem}`);
  // show3(k); /* show what item you dropped*/

  player.inventory[useindex] = null;
  if (pitflag) {
    updateLog(`  It disappears down the pit${period}`);
  } else {
    setItem(player.x, player.y, inventoryItem);
  }

  if (player.WIELD === inventoryItem) {
    player.WIELD = null;
  }
  if (player.WEAR === inventoryItem) {
    player.WEAR = null;
  }
  if (player.SHIELD === inventoryItem) {
    player.SHIELD = null;
  }
  player.adjustcvalues(inventoryItem, false);

  setMazeMode(true);
  return 1;
}



function drop_object_gold(amount) {
  dropflag = 1; /* say dropped an item so wont ask to pick it up right away */

  if (amount == ESC) {
    appendLog(` cancelled${period}`);
    nomove = 1;
    return 1;
  }

  if (amount == '*') amount = player.GOLD;

  amount = Number(amount);

  if (amount == 0) return 1;

  if (amount > player.GOLD) {
    updateLog(`  You don't have that much!`);
    return 1;
  }

  /* 12.4.5
  Allow dropping gold on top of gold
  */
 const item = itemAt(player.x, player.y);
 const pitflag = item.matches(OPIT);
 const goldExists = item.matches(OGOLDPILE);
  if (!pitflag && !item.matches(OEMPTY) && !goldExists) {
    beep();
    updateLog(`  There's something here already${period}`);
    return 1;
  }

  player.setGold(player.GOLD - amount);
  updateLog(`  You drop ${Number(amount).toLocaleString()} gold pieces`);
  if (pitflag) {
    updateLog(`  The gold disappears down the pit${period}`);
  } else {
    let floorGoldAmount = 0;
    if (goldExists) {
      floorGoldAmount = itemAt(player.x, player.y).arg;
    }
    setItem(player.x, player.y, createObject(OGOLDPILE, amount + floorGoldAmount));
  }
  return 1;
}



/* 
    routine to tell how many things a player can carry
*/
function maxcarry(p) {
  if (!p) p = player;
  return Math.min(15 + (p.LEVEL >> 1), MAXINVEN);
}



/*
    routine to tell if player can carry one more thing
    returns 1 if pockets are full, else 0
*/
function pocketfull() {
  const limit = maxcarry();
  for (let i = 0; i < limit; i++) {
    if (!player.inventory[i]) {
      return (false);
    }
  }
  return (true);
}



/*
    routine to tell if player isn't carrying anything
    returns true if pockets are empty, else false
*/
function pocketempty() {
  const limit = maxcarry();
  for (let i = 0; i < limit; i++) {
    if (player.inventory[i]) {
      return (false);
    }
  }
  return (true);
}


/*
    routine to tell if player is carrying an item
    returns *the item* if carrying, else *null*
    this is *not* obvious, but handy when you know
*/
function isCarrying(item) {
  let exact = item && (item.matches(OPOTION) || item.matches(OSCROLL));
  for (let i = 0; i < player.inventory.length; i++) {
    let tmpItem = player.inventory[i];
    if (tmpItem && item.matches(tmpItem, exact)) {
      return tmpItem;
    }
  }
  return null;
}



/*
    routine to tell if player is carrying a weapon
*/
function isCarryingWeapon() {
  return player.inventory.some(itm => itm && itm.canWield());
}



/*
    routine to tell if player is carrying armour
*/
function isCarryingArmor() {
  return player.inventory.some(itm => itm && itm.isArmor());
}



/*
    routine to tell if player is carrying a book
*/
function isCarryingBook() {
  return player.inventory.some(itm => itm && itm.matches(OBOOK));
}



/*
    routine to tell if player is carrying a scroll
*/
function isCarryingScroll() {
  return player.inventory.some(itm => itm && itm.matches(OSCROLL));
}



/*
    routine to tell if player is carrying a potion
*/
function isCarryingPotion() {
  return player.inventory.some(itm => itm && itm.matches(OPOTION));
}



/*
    routine to tell if player is carrying a cookie
*/
function isCarryingCookie() {
  return player.inventory.some(itm => itm && itm.matches(OCOOKIE));
}



/*
    routine to tell if player is carrying a gem
*/
function isCarryingGem() {
  return player.inventory.some(itm => itm && (itm.isGem() || itm.matches(OLARNEYE)));
}
