"use strict";

const OWALL = new Item("OWALL", "▒", "a wall");
const OEMPTY = new Item("OEMPTY", ".", "empty space");
const OSTAIRSDOWN = new Item("OSTAIRSDOWN", ">", "a staircase going down");
const OSTAIRSUP = new Item("OSTAIRSUP", "<", "a staircase going up");
const OENTRANCE = new Item("OENTRANCE", "E", "the dungeon entrance");
const OHOMEENTRANCE = new Item("OHOMEENTRANCE", ".", "exit to home level");
const OVOLUP = new Item("OVOLUP", "V", "the base of a volcanic shaft");
const OVOLDOWN = new Item("OVOLDOWN", "V", "a volcanic shaft leaning downward");
const OGOLDPILE = new Item("OGOLDPILE", "*", "some gold", 0);
const OPIT = new Item("OPIT", "P", "a pit");
const OMIRROR = new Item("MIRROR", "M", "a mirror");
const OSTATUE = new Item("OSTATUE", "&", "a great marble statue");
const OPOTION = new Item("OPOTION", "!", "a magic potion");
const OSCROLL = new Item("OSCROLL", "?", "a magic scroll");

const ODAGGER = new Item("ODAGGER", "(", "a dagger");
const OBELT = new Item("OBELT", "{", "a belt of striking");
const OSPEAR = new Item("OSPEAR", "(", "a spear");
const OFLAIL = new Item("OFLAIL", "(", "a flail");
const OBATTLEAXE = new Item("OBATTLEAXE", ")", "a battle axe");
const OLANCE = new Item("OLANCE", ")", "a lance of death");
const OLONGSWORD = new Item("OLONGSWORD", ")", "a longsword");
const O2SWORD = new Item("O2SWORD", "(", "a two handed sword");
const OSWORD = new Item("OSWORD", ")", "a sunsword");
const OSWORDofSLASHING = new Item("OSWORDofSLASHING", ")", "a sword of slashing");
const OHAMMER = new Item("OHAMMER", ")", "Bessman's flailing hammer");

const OSHIELD = new Item("OSHIELD", "[", "a shield");
const OLEATHER = new Item("OLEATHER", "[", "leather armor");
const OSTUDLEATHER = new Item("OSTUDLEATHER", "[", "studded leather armor");
const ORING = new Item("ORING", "[", "ring mail");
const OCHAIN = new Item("OCHAIN", "[", "chain mail");
const OSPLINT = new Item("OSPLINT", "]", "splint mail");
const OPLATE = new Item("OPLATE", "]", "plate mail");
const OPLATEARMOR = new Item("OPLATEARMOR", "]", "plate armor");
const OSSPLATE = new Item("OSSPLATE", "]", "stainless plate armor");

const OCLOSEDDOOR = new Item("OCLOSEDDOOR", "D", "a closed door");
const OOPENDOOR = new Item("OOPENDOOR", "0", "an open door");
const OALTAR = new Item("OALTAR", "A", "a holy altar");
const OTRAPARROWIV = new Item("OTRAPARROWIV", ".", "an arrow trap");
const OIVTELETRAP = new Item("OIVTELETRAP", ".", "a teleport trap");
const OIVDARTRAP = new Item("OIVDARTRAP", ".", "a dart trap");
const OIVTRAPDOOR = new Item("OIVTRAPDOOR", ".", "a trap door");


// TODO Item types?
// characters (player, monster) 1 per square
// items (scrolls potions gold) 1 per square
// fundamental (doors, walls) no charaters/items

var Item = {
  id: null,
  char: "💩",
  desc: "",
  arg: null,

  matches: function(item) {
    return (this.id == item.id);
  },

  toString: function() {
    var description = this.desc;
    if (this.matches(OPOTION)) {
      if (isKnownPotion(this) || DEBUG_KNOW_ALL) {
        description += " of " + potionname[this.arg];
      }
    }
    //
    else if (this.matches(OSCROLL)) {
      if (isKnownScroll(this) || DEBUG_KNOW_ALL) {
        description += " of " + scrollname[this.arg];
      }
    } else if (this.matches(OOPENDOOR) || this.matches(OCLOSEDDOOR)) {
      // do nothing
    }
    //
    else {
      if (this.arg > 0) {
        description += " +" + this.arg;
      } else if (this.arg < 0) {
        description += " " + this.arg;
      }
      if (this === player.WIELD) {
        description += " (weapon in hand)"
      }
      if (this === player.WEAR || this === player.SHIELD) {
        description += " (being worn)"
      }
    }
    return description;
  },

  isWeapon: function() {
    var weapon = false;
    weapon |= this.matches(ODAGGER);
    weapon |= this.matches(OBELT);
    weapon |= this.matches(OSHIELD);
    weapon |= this.matches(OSPEAR);
    weapon |= this.matches(OFLAIL);
    weapon |= this.matches(OBATTLEAXE);
    weapon |= this.matches(OLANCE);
    weapon |= this.matches(OLONGSWORD);
    weapon |= this.matches(O2SWORD);
    weapon |= this.matches(OSWORD);
    weapon |= this.matches(OSWORDofSLASHING);
    weapon |= this.matches(OHAMMER);
    return weapon;
  },

}

function Item(id, char, desc, arg) {
  this.id = id;
  this.char = char;
  this.desc = desc;
  this.arg = arg;
}

// Item.prototype.toString = function itemToString() {
//   return this.desc;
// }


function createObject(item, arg) {
  var newItem = Object.create(Item);
  newItem.id = item.id;
  newItem.char = item.char;
  newItem.desc = item.desc;
  if (arg != null) {
    newItem.arg = arg;
  } else {
    if (item.arg != null)
      newItem.arg = item.arg;
  }
  return newItem;
}

function isItem(x, y, compareItem) {
  var levelItem = player.level.items[x][y];
  if (levelItem.id == compareItem.id) {
    return true;
  } else {
    return false;
  }
}

function itemAt(x, y) {
  if (x == null || y == null) {
    return null;
  }
  if (x < 0 || x >= MAXX) {
    return null;
  }
  if (y < 0 || y >= MAXY) {
    return null;
  }
  var item = player.level.items[x][y];
  // if (item.id == OPOTION.id) {
  //   return item;
  // } else if (item.id == OSCROLL.id) {
  //   return item;
  // }
  return item;
}

function isItemAt(x, y) {
  var item = player.level.items[x][y];
  return (item != null && !item.matches(OEMPTY));
}

function lookforobject(do_ident, do_pickup, do_action) {
  // do_ident;   /* identify item: T/F */
  // do_pickup;  /* pickup item:   T/F */
  // do_action;  /* prompt for actions on object: T/F */

  //
  //     // /* can't find objects if time is stopped    */
  //     // if (c[TIMESTOP])
  //     //     return;
  //
  var item = player.level.items[player.x][player.y];

  if (item.matches(OEMPTY)) {
    return;
  }
  //
  else if (item.matches(OGOLDPILE)) {
    updateLog("You have found some gold!");
    updateLog("It is worth " + item.arg + "!");
    player.GOLD += item.arg;
    forget();
    return;
  }
  //
  else if (item.matches(OPOTION)) {
    if (do_ident) {
      updateLog(`You have found ${item}: (q) quaff or (t) take`);
    }
    if (do_action) {
      non_blocking_callback = opotion;
    }
    return;
  }
  //
  else if (item.matches(OSCROLL)) {
    if (do_ident) {
      updateLog(`You have found ${item}: (r) read or (t) take`);
    }
    if (do_action) {
      non_blocking_callback = oscroll;
    }
    return;
  }
  //
  else if (item.matches(OPIT)) {
    updateLog("You're standing at the top of a pit");
    opit();
    return;
  }
  //
  else if (item.matches(OMIRROR)) {
    if (nearbymonst())
      return;
    if (do_ident)
      updateLog("There is a mirror here");
    return;
  }
  //
  else if (item.matches(OSTATUE)) {
    if (nearbymonst())
      return;
    if (do_ident)
      updateLog("You are standing in front of a statue");
    return;
  } else if (item.matches(OOPENDOOR)) {
    if (do_ident) {
      updateLog(`You have found ${item} (c) close`);
    }
    if (do_action) {
      non_blocking_callback = o_open_door;
    }
    return;
  } else if (item.matches(OCLOSEDDOOR)) {
    if (do_ident) {
      updateLog("You have found " + item);
      updateLog("Do you (o) try to open it, or (i) ignore it?");
    }
    if (do_action) {
      blocking_callback = o_closed_door;
    }
    return;
  } else if (item.isWeapon()) {
    if (do_ident) {
      updateLog(`You have found ${item}: (w) wield or (t) take`);
    }
    if (do_action) {
      non_blocking_callback = wield;
    }
    return;
  }

  // base case
  else if ( // this is a bit hacky, but we don't want to pick these up!
    !isItem(player.x, player.y, OWALL) && //
    !isItem(player.x, player.y, OENTRANCE) && //
    !isItem(player.x, player.y, OHOMEENTRANCE) && //
    !isItem(player.x, player.y, OVOLUP) && //
    !isItem(player.x, player.y, OVOLDOWN) && //
    !isItem(player.x, player.y, OSTAIRSUP) && //
    !isItem(player.x, player.y, OSTAIRSDOWN) //
  ) //
  {
    if (do_ident) {
      updateLog("You have found " + item);
    }
    if (do_pickup) {
      if (take(item)) {
        forget();
      }
    }
    if (do_action) {
      oitem(item);
    }
  }
} // lookforobject


/*
 * function to process an item. or a keypress related
 */
function oitem(item_or_key) {
  var item;
  var key;
  if (item_or_key instanceof Item.constructor) {
    item = item_or_key;
    //debug("oitem(): got item: " + item);
  } else {
    key = item_or_key;
    //debug("oitem(): got key: " + key);
  }
  if (take_ignore_item == false) {
    updateLog("Do you want to (t) take it, or (i) ignore it?");
    take_ignore_item = true; // signal to parse function
    return;
  } else {
    var item = itemAt(player.x, player.y);
    if (item == null) {
      debug("oitem(): couldn't find it!");
      take_ignore_item = false;
      return;
    }
    switch (key) {
      case ESC:
      case 'i':
        updateLog("ignore");
        take_ignore_item = false;
        return;

      case 't':
        updateLog("take");
        if (take(item)) {
          forget(); // remove from board
        }
        take_ignore_item = false;
        return;
    };
  }
}


function opit() {
  if (rnd(101) < 81) {
    if (rnd(70) > 9 * player.DEXTERITY - player.packweight() || rnd(101) < 5) {
      if (player.level.depth == 10 || player.level.depth >= 13) {
        obottomless();
      } else {
        var damage;
        if (rnd(101) < 20) {
          damage = 0;
          updateLog("You fell into a pit!  Your fall is cushioned by an unknown force");
        } else {
          damage = rnd(player.level.depth * 3 + 3);
          updateLog("You fell into a pit!  You suffer " + damage + " hit points damage");
          lastnum = 261;
          /* if hero dies scoreboard will say so */
        }
        player.losehp(damage);
        nap(2000);
        newcavelevel(player.level.depth + 1);
      }
    }
  }
}


function obottomless() {
  updateLog("You fell into a bottomless pit!");
  beep();
  nap(3000);
  died(262);
}


function nearbymonst() {
  debug("TODO: nearbymonst()");
  return false;
}


function forget() {
  player.level.items[player.x][player.y] = createObject(OEMPTY);
}


function o_open_door(key) {
  var item = itemAt(player.x, player.y);
  if (item == null) {
    debug("o_open_door(): couldn't find it!");
    return true;
  }
  switch (key) {
    case ESC:
    case 'i':
      updateLog("ignore");
      return true;
    case 'c':
      updateLog("close");
      player.level.items[player.x][player.y] = createObject(OCLOSEDDOOR, 0);
      player.x = lastpx;
      player.y = lastpy;
      player.level.paint();
      return true;
  }
}

function o_closed_door(key) {
  var item = itemAt(player.x, player.y);
  if (item == null) {
    debug("o_closed_door(): couldn't find it!");
    player.x = lastpx;
    player.y = lastpy;
    return true;
  }
  switch (key) {
    case ESC:
    case 'i':
      updateLog("ignore");
      player.x = lastpx;
      player.y = lastpy;
      return true;
    case 'o':
      updateLog("open");
      let success = act_open_door(player.x, player.y) == 1;
      if (!success) {
        player.x = lastpx;
        player.y = lastpy;
      }
      return true;
  }
}
