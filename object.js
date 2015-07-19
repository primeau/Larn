"use strict";

const OWALL = new Item("OWALL", "▒", "a wall");
const OEMPTY = new Item("OEMPTY", ".", "empty space");
const OSTAIRSDOWN = new Item("OSTAIRSDOWN", ">", "a staircase going down");
const OSTAIRSUP = new Item("OSTAIRSUP", "&lt", "a staircase going up"); // use &lt to prevent bugginess when dropping a ! or ? to the right
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
const OOPENDOOR = new Item("OOPENDOOR", "O", "an open door");
const OALTAR = new Item("OALTAR", "A", "a holy altar");
const OTRAPARROWIV = new Item("OTRAPARROWIV", ".", "an arrow trap");
const OIVTELETRAP = new Item("OIVTELETRAP", ".", "a teleport trap");
const OIVDARTRAP = new Item("OIVDARTRAP", ".", "a dart trap");
const OIVTRAPDOOR = new Item("OIVTRAPDOOR", ".", "a trap door");

const ODIAMOND = new Item("ODIAMOND", "@", "a brilliant diamond");
const ORUBY = new Item("ORUBY", "@", "a ruby");
const OEMERALD = new Item("OEMERALD", "@", "an enchanting emerald");
const OSAPPHIRE = new Item("OSAPPHIRE", "@", "a sparkling sapphire");

const OTHRONE = new Item("OTHRONE", "T", "a handsome jewel encrusted throne");
const ODEADTHRONE = new Item("ODEADTHRONE", "t", "a massive throne");

const OFOUNTAIN = new Item("OFOUNTAIN", "F", "a bubbling fountain");
const ODEADFOUNTAIN = new Item("ODEADFOUNTAIN", "f", "a dead fountain");

const OSCHOOL = new Item("OSCHOOL", "+", "the college of Larn");
const ODNDSTORE = new Item("ODNDSTORE", "=", "the DND store");
const OBANK2 = new Item("OBANK2", "$", "the 5th branch of the Bank of Larn");
const OBANK = new Item("OBANK", "$", "the bank of Larn");
const OHOME = new Item("OHOME", "H", "your home");
const OLRS = new Item("OLRS", "L", "the Larn Revenue Service");
const OTRADEPOST = new Item("OTRADEPOST", "S", "the local trading post");


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
      }
      //
      else if (this.matches(OOPENDOOR) ||
        this.matches(OCLOSEDDOOR) ||
        this.matches(OTHRONE) ||
        this.matches(ODEADTHRONE) ||
        this.isGem()) {
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

    isArmor: function() {
      var armor = false;
      armor |= this.matches(OSHIELD);
      armor |= this.matches(OLEATHER);
      armor |= this.matches(OSTUDLEATHER);
      armor |= this.matches(ORING);
      armor |= this.matches(OCHAIN);
      armor |= this.matches(OSPLINT);
      armor |= this.matches(OPLATE);
      armor |= this.matches(OPLATEARMOR);
      armor |= this.matches(OSSPLATE);
      return armor;
    },

    isGem: function() {
      var gem = false;
      gem |= this.matches(ODIAMOND);
      gem |= this.matches(ORUBY);
      gem |= this.matches(OEMERALD);
      gem |= this.matches(OSAPPHIRE);
      return gem;
    },

  } // ITEM OBJECT

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

function getItem(x, y) {
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
  return item;
}


function setItem(x, y, item) {
  if (x == null || y == null) {
    return null;
  }
  if (x < 0 || x >= MAXX) {
    return null;
  }
  if (y < 0 || y >= MAXY) {
    return null;
  }
  player.level.items[x][y] = item;
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
  else if (item.matches(OALTAR)) {
    if (nearbymonst())
      return;
    if (do_ident) {
      lprcat("There is a Holy Altar here!");
      lprcat("Do you (p) pray (d) desecrate, or (i) ignore it?");
    }
    if (do_action) {
      blocking_callback = oaltar;
    }
    return;
  }
  //
  else if (item.matches(OTHRONE)) {
    if (nearbymonst())
      return;
    if (do_ident) {
      updateLog(`There is ${item} here!\nDo you (p) pry off jewels, (s) sit down`);
    }
    if (do_action) {
      non_blocking_callback = othrone;
    }
    return;
  }
  //
  else if (item.matches(ODEADTHRONE)) {
    if (nearbymonst())
      return;
    if (do_ident) {
      updateLog(`There is ${item} here!\nDo you (s) sit down`);
    }
    if (do_action) {
      non_blocking_callback = othrone;
    }
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
  else if (item.matches(OFOUNTAIN)) {
    if (nearbymonst())
      return;
    if (do_ident) {
      lprcat("There is a fountain here");
      lprcat("Do you (D) drink, (T) tidy up");
    }
    if (do_action) {
      non_blocking_callback = ofountain;
    }
  }
  //
  else if (item.matches(ODEADFOUNTAIN)) {
    if (nearbymonst())
      return;
    if (do_ident)
      lprcat("There is a dead fountain here");
  }
  //
  else if (item.matches(ODNDSTORE)) {
    if (nearbymonst())
      return;
    if (do_ident)
      lprcat("There is a DND store here.");
    if (do_action)
      prompt_enter();
  }
  //
  else if (item.matches(OSTATUE)) {
    if (nearbymonst())
      return;
    if (do_ident)
      updateLog("You are standing in front of a statue");
    return;
  }
  //
  else if (item.matches(OOPENDOOR)) {
    if (do_ident) {
      updateLog(`You have found ${item} (c) close`);
    }
    if (do_action) {
      non_blocking_callback = o_open_door;
    }
    return;
  }
  //
  else if (item.matches(OCLOSEDDOOR)) {
    if (do_ident) {
      updateLog("You have found " + item);
      updateLog("Do you (o) try to open it, or (i) ignore it?");
    }
    if (do_action) {
      blocking_callback = o_closed_door;
    }
    return;
  }
  // put this before wield to make wear be default for shields
  else if (item.isArmor()) {
    if (do_ident) {
      updateLog(`You have found ${item}: (W) wear or (t) take`);
    }
    if (do_action) {
      non_blocking_callback = wear;
    }
    return;
  }
  //
  else if (item.isWeapon()) {
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
      updateLog(`You have found ${item}: (t) take`);
    }
    // if (do_pickup) {
    //   if (take(item)) {
    //     forget();
    //   }
    // }
    if (do_action) {
      non_blocking_callback = oitem;
    }
  }
} // lookforobject


/*
 * function to process an item. or a keypress related
 */
function oitem(key) {
  var item = getItem(player.x, player.y);
  if (item == null) {
    debug("oitem(): couldn't find it!");
    return;
  }
  switch (key) {
    case ESC:
    case 'i':
      updateLog("ignore");
      return;
    case 't':
      updateLog("take");
      if (take(item)) {
        forget(); // remove from board
      }
      return;
  };
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


function forget() {
  player.level.items[player.x][player.y] = createObject(OEMPTY);
}


function o_open_door(key) {
  var item = getItem(player.x, player.y);
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
  var item = getItem(player.x, player.y);
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
      var success = act_open_door(player.x, player.y) == 1;
      if (!success) {
        player.x = lastpx;
        player.y = lastpy;
      }
      return true;
  }
}


/*
 * subroutine to handle a teleport trap +/- 1 level maximum
 */
function oteleport(err) {
  var tmp;
  if (err)
    if (rnd(151) < 3)
      died(264); /* stuck in a rock */
  player.TELEFLAG = 1; /* show ?? on bottomline if been teleported    */
  if (player.level.depth == 0)
    tmp = 0;
  else
  if (player.level.depth < MAXLEVEL) {
    tmp = rnd(5) + player.level.depth - 3;
    if (tmp >= MAXLEVEL)
      tmp = MAXLEVEL - 1;
    if (tmp < 1)
      tmp = 1;
  } else {
    tmp = rnd(3) + player.level.depth - 2;
    if (tmp >= MAXLEVEL + MAXVLEVEL)
      tmp = MAXLEVEL + MAXVLEVEL - 1;
    if (tmp < MAXLEVEL)
      tmp = MAXLEVEL;
  }
  player.x = rnd(MAXX - 2);
  player.y = rnd(MAXY - 2);
  if (player.level.depth != tmp)
    newcavelevel(tmp);
  positionplayer();
  //draws(0, MAXX, 0, MAXY);
  bot_linex();
}
