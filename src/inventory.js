'use strict';

/* show character's inventory */
function drawInventory(filter, show_gold = false, show_time = false, show_empty = false, select_allowed = true) {
  const items = player.getInventory(filter);
  const starty = show_gold ? 2 : 1;
  const maxrows = 24 - (show_time ? 1 : 0) - starty;
  let row = starty;
  let col = 1;
  let column2 = 41;
  let wrapped = false;

  // clear screen and set up for inventory display
  setMazeMode(false);

  if (show_gold) {
    lprcat(`.) `);
    if (getPref(`inventory_pics`)) {
      lprc(OGOLDPILE.getChar()); // lprc magic for amiga image --> see io.js:os_put_font()
      lprc(` `);
    }
    lprcat(`${Number(player.GOLD).toLocaleString()} gold pieces\n`);
  }

  // print inventory
  for (let i = 0; i < items.length; i++) {
    // figure out if we need to wrap to the next column
    if (row >= starty + maxrows) {
      row = starty;
      col = column2;
      wrapped = true;
    }

    cursor(col, row);
    cltoeoln();

    const item = items[i];
    const itemIndex = player.inventory.indexOf(item);
    const itemChar = getCharFromIndex(itemIndex);
    lprcat(`${itemChar}) `);
    if (getPref(`inventory_pics`)) {
      lprc(item.getChar()); // lprc magic for amiga image --> see io.js:os_put_font()
      lprc(` `);
    }
    lprcat(`${item.shortName(false)}\n`);

    // // if we want to compensate for extra wide items
    // if (col === 1) column2 = Math.max(column2, itemString.length + 1);

    row++;
  }

  // print empty slots if requested
  if (show_empty) {
    for (let slot = 0; slot < maxcarry(player); slot++) {
      // skip over printed items
      if (player.inventory[slot]) continue; 

      // same wrap logic as above
      if (row >= starty + maxrows) { 
        row = starty;
        col = column2;
        wrapped = true;
      }

      cursor(col, row);
      cltoeoln();

      const gap = amiga_mode ? ` ` : ``;
      lprcat(`${getCharFromIndex(slot)}) -${gap}-${gap}-\n`);

      row++;
    }
  }

  cursor(1, wrapped ? starty + maxrows : row);

  if (show_time) {
    lprcat(`Elapsed time is <b>${elapsedtime()}</b>. You have <b>${timeleft()}</b> mobuls left\n`);
  }

  more(select_allowed);

}

function isItem(item) {
  return item != null;
}

function isWeapon(item) {
  return item && item.isWeapon();
}

function canWield(item) {
  return item && item.canWield();
}

function canWear(item) {
  return item && item.isArmor();
}

function canEat(item) {
  return item && item.matches(OCOOKIE);
}

function canRead(item) {
  return item && (item.matches(OSCROLL) || item.matches(OBOOK));
}

function canQuaff(item) {
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



function act_drop(key) {
  if (key == '.') {
    nomove = 1;
    setMazeMode(true);
    updateLog(`How much gold will you drop? `);
    setNumberCallback(drop_object_gold, true);
    return CALLBACK_COMPLETE;
  }
  return handleInventoryAction(key, act_drop, isItem, isItem, dropItem, `  You can't drop that!`);
}



function dropItem(item) {
  const dungeonItem = itemAt(player.x, player.y);
  const pitflag = dungeonItem.matches(OPIT);
  if (!pitflag && !dungeonItem.matches(OEMPTY)) {
    beep();
    updateLog(`  There's something here already${period}`);
    return 1; // nomove = 1;
  }
  
  const index = player.inventory.indexOf(item);
  if (!item || index < 0) {
    updateLog(`  You aren't carrying that!`);
    return 1; // nomove = 1;
  }
  const indexChar = getCharFromIndex(index);
  updateLog(`  You drop: `);
  updateLog(`${indexChar}) ${item.toString(false)}`);
  
  if (pitflag) {
    updateLog(`  It disappears down the pit${period}`);
  } else {
    setItem(player.x, player.y, item);
  }

  destroyInventory(item);
  return 0; // nomove = 0;
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
