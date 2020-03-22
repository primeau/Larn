'use strict';

const itemlist = [];

var Item = function Item(id, char, hackchar, ularnchar, color, bold, desc, carry, arg, inv) {
  this.id = id;
  this.char = char;
  this.hackchar = hackchar;
  this.ularnchar = ularnchar;
  this.bold = bold;
  this.color = color;
  this.desc = desc;
  this.carry = carry;
  this.arg = arg;
  this.inv = inv;

  if (!arg) this.arg = 0;

  if (!itemlist[id])
    itemlist[id] = this;

}



function createObject(item, arg) {

  if (!item) return null;

  // create item via an ID (used in dnd_store, wizard mode)
  // otherwise the item passed in is already an item to be duplicated
  //if (!isNaN(Number(item)) && item != ``) {
  if (typeof item == 'number') {
    item = itemlist[item];
  }

  var newItem = new Item(item.id, item.char, item.hackchar, item.ularnchar, item.color, item.bold, item.desc, item.carry, item.arg, item.inv);

  if (arg) {
    newItem.arg = arg;
  } else if (item.arg) {
    newItem.arg = item.arg;
  } else {
    newItem.arg = 0;
  }

  return newItem;
}


const DIV_START = `url("img/`;
const DIV_END = `.png")`;



Item.prototype = {
  id: null,
  char: `💩`,
  hackchar: ``,
  ularnchar: ``,
  color: null,
  bold: true,
  desc: ``,
  carry: false,
  arg: 0,
  inv: null,



  // TODO: cache this
  // let buffer = [numobjects]
  // if !buffer.get buffer.put
  // flush when resetting mode/bold/color
  getChar: function () {
    if (amiga_mode) {
      if (this.id == OWALL.id) {
        return `${DIV_START}w${this.arg}${DIV_END}`;
      } else {
        return `${DIV_START}o${this.id}${DIV_END}`;
      }
    }

    let char = null;
    if (original_objects) {
      if (ULARN) {
        char = this.ularnchar;
      } 
      else {
        char = this.char;
      }
    } 
    else {
      char = this.hackchar;
    }

    if (show_color && this.color) {
      char = `<font color='${this.color}'>${char}</font>`;
    }
    if (bold_objects && this.bold) {
      char = `<b>${char}</b>`;
    }

    return char;
  },



  matches: function (item, exact) {
    if (item == null) {
      //debug(`object.matches() null item`);
      return false;
    }

    let isMatch = this.id == item.id;
    if (exact) isMatch &= this.arg == item.arg;

    return isMatch;
  },



  toString: function (inStore, showAll, tempPlayer) {
    var description = this.desc;
    //
    if (this.matches(OPOTION)) {
      if (tempPlayer && !isKnownPotion(this, tempPlayer) && showAll) {
        description += ` (of ${POTION_NAMES[this.arg]})`; // special case for scoreboard
      } else if (isKnownPotion(this) || inStore || showAll) {
        description += ` of ${POTION_NAMES[this.arg]}`;
      }
    }
    //
    else if (this.matches(OSCROLL)) {
      if (tempPlayer && !isKnownScroll(this, tempPlayer) && showAll) {
        description += ` (of ${SCROLL_NAMES[this.arg]})`; // special case for scoreboard
      } else if (isKnownScroll(this) || inStore || showAll) {
        description += ` of ` + SCROLL_NAMES[this.arg];
      }
    }
    //
    else if (this.matches(OOPENDOOR) ||
      this.matches(OCLOSEDDOOR) ||
      this.matches(OWALL) ||
      this.matches(OGOLDPILE) ||
      this.matches(ODEADTHRONE) ||
      this.matches(OBOOK) ||
      this.matches(OTHRONE) ||
      this.matches(OCHEST) ||
      this.matches(OAMULET) ||
      (this.isRing() && inStore && !showAll) ||
      this.isGem()) {
      // do nothing
    }
    //
    else {
      if (this.arg > 0) {
        description += ` +` + this.arg;
      } else if (this.arg < 0) {
        description += ` ` + this.arg;
      }
    }
    if (!tempPlayer) tempPlayer = player;
    if ((this === tempPlayer.WEAR || this === tempPlayer.SHIELD) && !inStore) {
      description += ` (being worn)`
    }
    if (this === tempPlayer.WIELD && !inStore) {
      description += ` (weapon in hand)`
    }
    return description;
  },

  // we can wield more things than we show during wield inventory check
  // this is everything that a player can actually wield
  canWield: function () {
    /*
    v12.4.5 - this list is much reduced
    */
    return this.isWeapon() || this.isArmor() || this.isRing();
  },



  // we can wield more things than we show during wield inventory check
  // this is what we show during an inventory check while wielding
  isWeapon: function () {
    var weapon = false;
    weapon |= this.matches(OSHIELD);
    weapon |= this.matches(ODAGGER);
    weapon |= this.matches(OSPEAR);
    weapon |= this.matches(OFLAIL);
    weapon |= this.matches(OBATTLEAXE);
    weapon |= this.matches(OLONGSWORD);
    weapon |= this.matches(O2SWORD);
    weapon |= this.matches(OSWORD);
    weapon |= this.matches(OLANCE);
    weapon |= this.matches(OSWORDofSLASHING);
    weapon |= this.matches(OHAMMER);
    weapon |= this.matches(OBELT);
    weapon |= this.matches(OVORPAL);
    weapon |= this.matches(OSLAYER);
    weapon |= this.matches(OPSTAFF);
    return weapon;
  },



  isArmor: function () {
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
    armor |= this.matches(OELVENCHAIN);
    return armor;
  },



  isGem: function () {
    var gem = false;
    gem |= this.matches(ODIAMOND);
    gem |= this.matches(ORUBY);
    gem |= this.matches(OEMERALD);
    gem |= this.matches(OSAPPHIRE);
    return gem;
  },



  isRing: function () {
    var ring = false;
    ring |= this.matches(ORINGOFEXTRA);
    ring |= this.matches(ODEXRING);
    ring |= this.matches(ODAMRING);
    ring |= this.matches(OREGENRING);
    ring |= this.matches(OSTRRING);
    ring |= this.matches(OPROTRING);
    ring |= this.matches(OCLEVERRING);
    ring |= this.matches(OENERGYRING);
    return ring;
  },



  isStore: function () {
    var store = false;
    store |= this.matches(OENTRANCE);
    store |= this.matches(OBANK);
    store |= this.matches(OBANK2);
    store |= this.matches(OLRS);
    store |= this.matches(OHOME);
    store |= this.matches(ODNDSTORE);
    store |= this.matches(OVOLUP);
    store |= this.matches(OVOLDOWN);
    store |= this.matches(OSCHOOL);
    store |= this.matches(OTRADEPOST);
    store |= this.matches(OPAD);
    return store;
  },



  isDrug: function () {
    var drug = false;
    drug |= this.matches(OSPEED);
    drug |= this.matches(OACID);
    drug |= this.matches(OHASH);
    drug |= this.matches(OSHROOMS);
    drug |= this.matches(OCOKE);
    return drug;
  },



  getSortCode: function () {
    var invcode = this.inv ? this.inv : 0;
    var sortcode = (sortorder.indexOf(this.id) + 1) * 10000 + invcode;

    // sort unknown scrolls and potions above known
    // sort unknown scrolls and potions in inventory order
    // sort known scrolls and potions in inventory order
    if (isKnownScroll(this) || isKnownPotion(this)) {
      sortcode += (this.arg + 1) * 100;
    }

    return sortcode;
  }


} // ITEM OBJECT




const BOLD = true;
const NO_BOLD = false;
const NO_COLOR = null;
const CARRY = true;
const NO_CARRY = false;

/* id, char, hackchar, ularnchar, color, bold, desc, carry, arg, inv */
const OEMPTY = new Item(0, `·`, `·`, `·`, NO_COLOR, NO_BOLD, `the dungeon floor`, NO_CARRY); // http://www.fileformat.info/info/unicode/char/00b7/index.htm
const OANNIHILATION = new Item(82, `s`, `0`, `s`, `crimson`, BOLD, `a sphere of annihilation`, NO_CARRY);
const OHOMEENTRANCE = new Item(93, OEMPTY.char, `8`, OEMPTY.char, NO_COLOR, NO_BOLD, `the exit to the home level`, NO_CARRY);
const OUNKNOWN = new Item(94, ' ', ` `, ` `, NO_COLOR, NO_BOLD, `... nothing`, NO_CARRY);

// buildings / home level
const OHOME = new Item(69, `H`, `1`, `H`, `cornflowerblue`, BOLD, `your home`, NO_CARRY);
const ODNDSTORE = new Item(12, `=`, `2`, `=`, `orchid`, BOLD, `the DND store`, NO_CARRY);
const OTRADEPOST = new Item(77, `S`, `3`, `S`, `tan`, BOLD, `the local trading post`, NO_CARRY);
const OLRS = new Item(80, `L`, `4`, `L`, NO_COLOR, BOLD, `the Larn Revenue Service`, NO_CARRY);
const OBANK = new Item(16, `$`, `5`, `$`, `gold`, BOLD, `the bank of Larn`, NO_CARRY);
const OBANK2 = new Item(15, `$`, `5`, `$`, `gold`, BOLD, `the Nth branch of the Bank of Larn`, NO_CARRY);
const OSCHOOL = new Item(10, `+`, `6`, `+`, `darkorange`, BOLD, `the College of Larn`, NO_CARRY);
const OENTRANCE = new Item(54, `E`, `8`, `E`, `mediumseagreen`, BOLD, `the dungeon entrance`, NO_CARRY);
const OVOLDOWN = new Item(55, `V`, `9`, `V`, `crimson`, BOLD, `a volcanic shaft leaning downward`, NO_CARRY);
/* need amiga */ const OPAD = new Item(100, `@`, `@`, `@`, `lightgreen`, BOLD, `Dealer McDope's Hideout!`, NO_CARRY); // ULARN

// dungeon features
const OWALL = new Item(21, `▒`, `▒`, `▒`, NO_COLOR, NO_BOLD, `a wall`, NO_CARRY);
const OALTAR = new Item(1, `A`, `:`, `A`, `orchid`, BOLD, `a holy altar`, NO_CARRY);
const OTHRONE = new Item(2, `T`, `\\`, `T`, `gold`, BOLD, `a handsome jewel encrusted throne`, NO_CARRY);
const ODEADTHRONE = new Item(79, `t`, `/`, `t`, NO_COLOR, BOLD, `a massive throne`, NO_CARRY);
const OPIT = new Item(4, `P`, `^`, `P`, `sandybrown`, BOLD, `a pit`, NO_CARRY);
const OVOLUP = new Item(56, `V`, `9`, `V`, `mediumseagreen`, BOLD, `the base of a volcanic shaft`, NO_CARRY);
const OSTAIRSUP = new Item(5, `&lt`, `&lt`, `%`, `mediumseagreen`, BOLD, `a staircase going up`, NO_CARRY); // use &lt to prevent bugginess when dropping a ! or ? to the right
const OSTAIRSDOWN = new Item(13, `&gt`, `&gt`, `%`, `sandybrown`, BOLD, `a staircase going down`, NO_CARRY);
const OELEVATORUP = new Item(6, `_`, `_`, `_`, `mediumseagreen`, BOLD, `an express elevator going up`, NO_CARRY); // ULARN
const OELEVATORDOWN = new Item(14, `_`, `_`, `_`, `sandybrown`, BOLD, `an express elevator going down`, NO_CARRY); // ULARN
const OFOUNTAIN = new Item(7, `F`, `{`, `F`, `cornflowerblue`, BOLD, `a bubbling fountain`, NO_CARRY);
const ODEADFOUNTAIN = new Item(17, `f`, `}`, `f`, `lightgray`, BOLD, `a dead fountain`, NO_CARRY);
const OSTATUE = new Item(8, `&`, `%`, `&`, `ivory`, BOLD, `a great marble statue`, NO_CARRY);
const OMIRROR = new Item(11, `M`, `|`, `M`, `silver`, BOLD, `a mirror`, NO_CARRY);
const OOPENDOOR = new Item(19, `O`, `'`, `O`, NO_COLOR, BOLD, `an open door`, NO_CARRY);
const OCLOSEDDOOR = new Item(20, `D`, `+`, `D`, NO_COLOR, BOLD, `a closed door`, NO_CARRY);

// traps
const OIVTELETRAP = new Item(78, OEMPTY.char, OEMPTY.char, OEMPTY.char, NO_COLOR, NO_BOLD, `a teleport trap`, NO_CARRY);
const OTELEPORTER = new Item(9, `^`, `^`, `^`, `mediumpurple`, BOLD, `a teleport trap`, NO_CARRY);
const OTRAPARROWIV = new Item(67, OEMPTY.char, OEMPTY.char, OEMPTY.char, NO_COLOR, NO_BOLD, `an arrow trap`, NO_CARRY);
const OTRAPARROW = new Item(66, `^`, `^`, `^`, NO_COLOR, BOLD, `an arrow trap`, NO_CARRY);
const ODARTRAP = new Item(74, `^`, `^`, `^`, `lightgreen`, BOLD, `a dart trap`, NO_CARRY);
const OIVDARTRAP = new Item(73, OEMPTY.char, OEMPTY.char, OEMPTY.char, NO_COLOR, NO_BOLD, `a dart trap`, NO_CARRY);
const OTRAPDOOR = new Item(75, `^`, `^`, `^`, `sandybrown`, BOLD, `a trapdoor`, NO_CARRY);
const OIVTRAPDOOR = new Item(76, OEMPTY.char, OEMPTY.char, OEMPTY.char, NO_COLOR, NO_BOLD, `a trapdoor`, NO_CARRY);

// dungeon items
const OGOLDPILE = new Item(18, `*`, `$`, `*`, `gold`, BOLD, `some gold`, CARRY, 0);
const OSCROLL = new Item(41, `?`, `?`, `?`, `tan`, BOLD, `a magic scroll`, CARRY);
const OPOTION = new Item(42, `!`, `!`, `!`, `mediumpurple`, BOLD, `a magic potion`, CARRY);
const OBOOK = new Item(43, `B`, `?`, `B`, `darkgoldenrod`, BOLD, `a book`, CARRY);
const OCHEST = new Item(44, `C`, `&`, `C`, `khaki`, BOLD, `a chest`, CARRY);
const ODIAMOND = new Item(50, `@`, `*`, `&lt`, `white`, BOLD, `a brilliant diamond`, CARRY);
const ORUBY = new Item(51, `@`, `*`, `&lt`, `crimson`, BOLD, `a ruby`, CARRY);
const OEMERALD = new Item(52, `@`, `*`, `&lt`, `seagreen`, BOLD, `an enchanting emerald`, CARRY);
const OSAPPHIRE = new Item(53, `@`, `*`, `&lt`, `dodgerblue`, BOLD, `a sparkling sapphire`, CARRY);
const OCOOKIE = new Item(83, `c`, `,`, `c`, `tan`, BOLD, `a fortune cookie`, CARRY);

// weapons
const OSWORD = new Item(28, `)`, `)`, `)`, NO_COLOR, BOLD, `a sunsword`, CARRY);
const O2SWORD = new Item(29, `(`, `)`, `(`, NO_COLOR, BOLD, `a two handed sword`, CARRY);
const OSPEAR = new Item(30, `(`, `)`, `(`, NO_COLOR, BOLD, `a spear`, CARRY);
const ODAGGER = new Item(31, `(`, `)`, `(`, NO_COLOR, BOLD, `a dagger`, CARRY);
const OBELT = new Item(40, `{`, `-`, `{`, `darkgoldenrod`, BOLD, `a belt of striking`, CARRY);
const OBATTLEAXE = new Item(57, `)`, `)`, `)`, NO_COLOR, BOLD, `a battle axe`, CARRY);
const OLONGSWORD = new Item(58, `)`, `)`, `)`, NO_COLOR, BOLD, `a longsword`, CARRY);
const OFLAIL = new Item(59, `(`, `)`, `(`, NO_COLOR, BOLD, `a flail`, CARRY);
const OLANCE = new Item(65, `)`, `)`, `)`, NO_COLOR, BOLD, `a lance of death`, CARRY);

// special weapons
const OSWORDofSLASHING = new Item(26, `)`, `)`, `)`, `cornflowerblue`, BOLD, `a sword of slashing`, CARRY);
const OHAMMER = new Item(27, `)`, `)`, `)`, `darkgoldenrod`, BOLD, `Bessman's flailing hammer`, CARRY);
/* need amiga */ const OVORPAL = new Item(90, `)`, `)`, `)`, `darkorange`, BOLD, `the Vorpal Blade`, CARRY); // ULARN
/* need amiga */ const OSLAYER = new Item(91, `)`, `)`, `)`, `crimson`, BOLD, `Slayer`, CARRY); // ULARN

// armour
const OLEATHER = new Item(25, `[`, `[`, `[`, NO_COLOR, BOLD, `leather armor`, CARRY);
const OSTUDLEATHER = new Item(61, `[`, `[`, `[`, NO_COLOR, BOLD, `studded leather armor`, CARRY);
const ORING = new Item(60, `[`, `[`, `[`, NO_COLOR, BOLD, `ring mail`, CARRY);
const OCHAIN = new Item(24, `[`, `[`, `[`, NO_COLOR, BOLD, `chain mail`, CARRY);
const OSPLINT = new Item(62, `]`, `[`, `]`, NO_COLOR, BOLD, `splint mail`, CARRY);
const OPLATE = new Item(23, `]`, `[`, `]`, NO_COLOR, BOLD, `plate mail`, CARRY);
const OPLATEARMOR = new Item(63, `]`, `[`, `]`, NO_COLOR, BOLD, `plate armor`, CARRY);
const OSSPLATE = new Item(64, `]`, `[`, `]`, NO_COLOR, BOLD, `stainless plate armor`, CARRY);
const OSHIELD = new Item(68, `[`, `[`, `[`, NO_COLOR, BOLD, `a shield`, CARRY);

// special armour
/* need amiga */ const OELVENCHAIN = new Item(92, `]`, `]`, `]`, `cornflowerblue`, BOLD, `elven chain`, CARRY); // ULARN

// rings
const ORINGOFEXTRA = new Item(32, `=`, `=`, `|`, NO_COLOR, BOLD, `a ring of extra regeneration`, CARRY);
const OREGENRING = new Item(33, `=`, `=`, `|`, NO_COLOR, BOLD, `a ring of regeneration`, CARRY);
const OPROTRING = new Item(34, `=`, `=`, `|`, NO_COLOR, BOLD, `a ring of protection`, CARRY);
const OENERGYRING = new Item(35, `=`, `=`, `|`, NO_COLOR, BOLD, `an energy ring`, CARRY);
const ODEXRING = new Item(36, `=`, `=`, `|`, NO_COLOR, BOLD, `a ring of dexterity`, CARRY);
const OSTRRING = new Item(37, `=`, `=`, `|`, NO_COLOR, BOLD, `a ring of strength`, CARRY);
const OCLEVERRING = new Item(38, `=`, `=`, `|`, NO_COLOR, BOLD, `a ring of cleverness`, CARRY);
const ODAMRING = new Item(39, `=`, `=`, `|`, NO_COLOR, BOLD, `a ring of increase damage`, CARRY);

// special objects
const OLARNEYE = new Item(22, `~`, `~`, `~`, `magenta`, BOLD, `The Eye of Larn`, CARRY);
const OAMULET = new Item(45, `}`, `~`, `.`, `gold`, BOLD, `an amulet of invisibility`, CARRY);
const OORBOFDRAGON = new Item(46, `o`, `~`, `o`, `skyblue`, BOLD, `an orb of dragon slaying`, CARRY);
const OSPIRITSCARAB = new Item(47, `:`, `~`, `.`, `darkorange`, BOLD, `a scarab of negate spirit`, CARRY);
const OCUBEofUNDEAD = new Item(48, `;`, `~`, `.`, `plum`, BOLD, `a cube of undead control`, CARRY);
const ONOTHEFT = new Item(49, `,`, `~`, `.`, `cornflowerblue`, BOLD, `a device of theft prevention`, CARRY);
const OORB = new Item(3, `o`, `~`, `o`, `plum`, BOLD, `an orb of enlightenment`, CARRY); // ULARN
/* need amiga */ const OBRASSLAMP = new Item(85, `.`, `.`, `.`, `gold`, BOLD, `a brass lamp`, CARRY); // ULARN
/* need amiga */ const OHANDofFEAR = new Item(86, `.`, `.`, `.`, `crimson`, BOLD, `The Hand of Fear`, CARRY); // ULARN
/* need amiga */ const OSPHTALISMAN = new Item(87, `.`, `.`, `.`, `skyblue`, BOLD, `The Talisman of the Sphere`, CARRY); // ULARN
/* need amiga */ const OWWAND = new Item(88, `/`, `/`, `/`, `mediumseagreen`, BOLD, `a wand of wonder`, CARRY); // ULARN
/* need amiga */ const OPSTAFF = new Item(89, `/`, `/`, `/`, `darkorange`, BOLD, `a staff of power`, CARRY); // ULARN

// drugs
/* need amiga */ const OSPEED = new Item(95, `:`, `:`, `:`, `paleblue`, BOLD, `some speed`, CARRY); // ULARN
/* need amiga */ const OACID = new Item(96, `:`, `:`, `:`, `mediumpurple`, BOLD, `some LSD`, CARRY); // ULARN
/* need amiga */ const OHASH = new Item(97, `:`, `:`, `:`, `sandybrown`, BOLD, `some hashish`, CARRY); // ULARN
/* need amiga */ const OSHROOMS = new Item(98, `:`, `:`, `:`, `tan`, BOLD, `some magic mushrooms`, CARRY); // ULARN
/* need amiga */ const OCOKE = new Item(99, `:`, `:`, `:`, `snow`, BOLD, `some cocaine`, CARRY); // ULARN



function isItem(x, y, compareItem) {
  var levelItem = player.level.items[x][y];
  if (levelItem.id == compareItem.id) {
    return true;
  } else {
    return false;
  }
}



function getItemDir(direction) {
  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];
  return itemAt(x, y);
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
  return (item && !item.matches(OEMPTY));
}



function setWallArg(x, y) {
  var wall = itemAt(x, y);
  if (!wall || !wall.matches(OWALL)) return;
  wall.arg = 0;
  var item;
  item = itemAt(x, y - 1);
  if (item && item.matches(OWALL)) wall.arg += 2; // up
  item = itemAt(x + 1, y);
  if (item && item.matches(OWALL)) wall.arg += 4; // right
  item = itemAt(x, y + 1);
  if (item && item.matches(OWALL)) wall.arg += 8; // down
  item = itemAt(x - 1, y);
  if (item && item.matches(OWALL)) wall.arg += 16; // left
}



function lookforobject(do_ident, do_pickup, do_action) {
  // do_ident;   /* identify item: T/F */
  // do_pickup;  /* pickup item:   T/F */
  // do_action;  /* prompt for actions on object: T/F */


  /* can't find objects if time is stopped    */
  if (player.TIMESTOP)
    return;

  showcell(player.x, player.y);

  var item = player.level.items[player.x][player.y];

  if (item.matches(OEMPTY)) {
    // do nothing
    nomove = 1;
    return;
  }
  //
  else if (item.matches(OGOLDPILE)) {
    updateLog(`You have found some gold!`);
    updateLog(`  It is worth ${Number(item.arg).toLocaleString()}!`);
    player.setGold(player.GOLD + item.arg);
    forget();
    return;
  }
  //
  else if (item.matches(OALTAR)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is a Holy Altar here!`, formatHint('p', 'to pray', 'A', 'to desecrate'));
  }
  //
  else if (item.matches(OTHRONE)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is ${item} here!`, formatHint('R', 'remove gems', 's', 'sit down'));
  }
  //
  else if (item.matches(ODEADTHRONE)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is ${item} here!`, formatHint('s', 'sit down'));
  }
  //
  else if (item.matches(OPIT)) {
    updateLog(`You're standing at the top of a pit`);
    opit();
  }
  //
  else if (item.matches(OMIRROR)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is a mirror here`);
  }
  //
  else if (item.matches(OFOUNTAIN)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is a fountain here`, formatHint('f', 'to wash', 'D', 'to drink'));
  }
  //
  else if (item.matches(ODEADFOUNTAIN)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is a dead fountain here`);
  }
  //
  else if (ULARN && item.matches(OOPENDOOR)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is an open door here.`);
  }
  //
  else if (item.matches(ODNDSTORE)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is a DND store here`, formatHint('e', 'to go inside'));
  }
  //
  else if (item.isStore() && !item.matches(OVOLUP) && !item.matches(OVOLDOWN)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`You have found ${item}`, formatHint('e', 'to go inside'));
  }
  //
  else if (item.matches(OSTATUE)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`You are standing in front of a statue`);
  }
  //
  else if (item.matches(OIVTELETRAP)) {
    if (rnd(11) < 6)
      return;
    setItem(player.x, player.y, createObject(OTELEPORTER));
    player.level.know[player.x][player.y] = KNOWALL;
    lookforobject(do_ident, do_pickup, do_action);
    /* fall through to OTELEPORTER case below!!! */
  }
  //
  else if (item.matches(OTELEPORTER)) {
    updateLog(`Zaaaappp!  You've been teleported!`);
    //nap(2000);
    oteleport(0);
  }
  //
  else if (item.matches(OTRAPARROWIV)) {
    /* for an arrow trap */
    if (rnd(17) < 13)
      return;
    setItem(player.x, player.y, createObject(OTRAPARROW));
    player.level.know[player.x][player.y] = KNOWALL;
    /* fall through to OTRAPARROW case below!!! */
    lookforobject(do_ident, do_pickup, do_action);
    return;
  }
  //
  else if (item.matches(OTRAPARROW)) {
    updateLog(`You are hit by an arrow`);
    lastnum = DIED_ARROW; /* shot by an arrow */
    player.losehp(rnd(10) + level);
    return;
  }
  //
  else if (item.matches(OIVDARTRAP)) {
    /* for a dart trap */
    if (rnd(17) < 13)
      return;
    setItem(player.x, player.y, createObject(ODARTRAP));
    player.level.know[player.x][player.y] = KNOWALL;
    /* fall through to ODARTRAP case below!!! */
    lookforobject(do_ident, do_pickup, do_action);
    return;
  }
  //
  else if (item.matches(ODARTRAP)) {
    updateLog(`You are hit by a dart`);
    lastnum = DIED_DART; /* hit by a dart */
    player.losehp(rnd(5));
    player.setStrength(player.STRENGTH - 1);
    return;
  }
  //
  else if (item.matches(OIVTRAPDOOR)) {
    /* for a trap door */
    if (rnd(17) < 13)
      return;
    setItem(player.x, player.y, createObject(OTRAPDOOR));
    player.level.know[player.x][player.y] = KNOWALL;
    /* fall through to OTRAPDOOR case below!!! */
    lookforobject(do_ident, do_pickup, do_action);
    return;
  }
  //
  else if (item.matches(OTRAPDOOR)) {
    if (isCarrying(OWWAND)) {
      updateLog(`You escape a trap door.`);
      return;
    }
    if ((level == DBOTTOM) || (level == VBOTTOM)) {
      var trapMessage = ``;
      if (ULARN) trapMessage = `leading straight to HELL`;
      updateLog(`You fell through a bottomless trap door ${trapMessage}!`);
      //nap(2000);
      died(DIED_BOTTOMLESS_TRAPDOOR, false); /* fell through a bottomless trap door */
      return;
    }
    var dmg = rnd(5 + level);
    updateLog(`You fall through a trap door!  You lose ${dmg} hit points`);
    lastnum = DIED_TRAPDOOR; /* fell through a trap door */
    player.losehp(dmg);
    //nap(2000);
    newcavelevel(level + 1);
    return;
  }
  //
  else if (item.matches(OANNIHILATION)) {
    if (isCarrying(OSPHTALISMAN)) {
      updateLog(`The Talisman of the Sphere protects you from annihilation!`);
    } else {
      updateLog(`You have been enveloped by the zone of nothingness!`);
      died(DIED_ANNIHILATED, false); /* annihilated in a sphere */
      return;
    }
  }
  //
  else if (item.matches(OSTAIRSUP) || item.matches(OVOLUP)) {
    let stairMessage = `You have found ${item}`;
    if (ULARN) stairMessage = `There is a circular staircase here`;
    if (do_ident) updateLog(stairMessage, formatHint('<', 'go up'));
  }
  //
  else if (item.matches(OSTAIRSDOWN) || item.matches(OVOLDOWN)) {
    let stairMessage = `You have found ${item}`;
    if (ULARN) stairMessage = `There is a circular staircase here`;
    if (do_ident) updateLog(stairMessage, formatHint('>', 'go down'));
  }
  //
  else if (item.matches(OELEVATORUP)) {
    updateLog(`You have found ${item}`);
    oelevator(1);
  }
  //
  else if (item.matches(OELEVATORDOWN)) {
    updateLog(`You have found ${item}`);
    oelevator(-1);
  }
  //
  else if (item.matches(OBRASSLAMP)) {
    updateLog(`You find ${item}. [<b>R</b> to rub]`);
  }
  //
  else if (item.matches(OPOTION)) {
    if (do_ident) updateLog(`You have found ${item}`, formatHint('t', 'to take', 'q', 'to quaff'));
  }
  //
  else if (item.matches(OSCROLL) || item.matches(OBOOK)) {
    if (do_ident) updateLog(`You have found ${item}`, formatHint('t', 'to take', 'r', 'to read'));
  }
  //
  else if (item.isArmor()) {
    if (do_ident) updateLog(`You have found ${item}`, formatHint('t', 'to take', 'W', 'to wear'));
  }
  //
  else if (item.isWeapon()) {
    if (do_ident) updateLog(`You have found ${item}`, formatHint('t', 'to take', 'w', 'to wield'));
  }
  //
  else if (item.matches(OCHEST)) {
    if (do_ident) updateLog(`There is a chest here`, formatHint('t', 'to take', 'o', 'to open'));
  }
  //
  else if (item.matches(OCOOKIE)) {
    if (do_ident) updateLog(`You have found ${item}`, formatHint('t', 'to take', 'E', 'to eat'));
  }
  else if (item.matches(OSPEED)) {
    if (do_ident) updateLog(`You find some speed. [<b>s</b> to snort]`);
  }
  else if (item.matches(OSHROOMS)) {
    if (do_ident) updateLog(`You find some magic mushrooms. [<b>e</b> to eat]`);
  }
  else if (item.matches(OACID)) {
    if (do_ident) updateLog(`You find some LSD. [<b>e</b> to eat]`);
  }
  else if (item.matches(OHASH)) {
    if (do_ident) updateLog(`You find some hashish. [<b>s</b> to smoke]`);
  }
  else if (item.matches(OCOKE)) {
    if (do_ident) updateLog(`You find some cocaine. [<b>s</b> to snort]`);
  }
  //
  else if (item.carry) {
    if (ULARN) {
      if (do_ident) updateLog(`You find ${item}.`, formatHint('t', 'to take'));
    } else {
      if (do_ident) updateLog(`You have found ${item}`, formatHint('t', 'to take'));
    }
  }

  // base case
  else {
    if (do_ident && !item.matches(OWALL)) {
      if (ULARN) {
        updateLog(`You find ${item}.`);
      } else {
        updateLog(`You have found ${item}`);
      }
    }
  }

  if (do_pickup) {
    if (item.carry && take(item)) {
      forget(); // remove from board
    } else {
      nomove = 1;
    }
  }

} // lookforobject



function formatHint(key1, hint1, key2, hint2) {
  var hintstring1 = `<b>${key1}</b> ${hint1}`;
  var hintstring2 = key2 && hint2 ? `, <b>${key2}</b> ${hint2}` : ``;
  return `[${hintstring1}${hintstring2}]`;
}



function opit() {
  if (rnd(101) >= 81) {
    return;
  }
  if (rnd(70) <= 9 * player.DEXTERITY - packweight() && rnd(101) >= 5) { // BUGFIX this is broken in 12.4
    return;
  }
  if (isCarrying(OWWAND)) {
    updateLog(`You float right over the pit.`);
    return;
  }
  if (level == DBOTTOM || level >= VBOTTOM) {
    obottomless();
  } else {
    var damage = 0;
    if (rnd(101) < 20) {
      var pitMessage = ULARN ? `A poor monster cushions your fall!` : `Your fall is cushioned by an unknown force`;
      updateLog(`You fell into a pit! ${pitMessage}`);
    } else {
      damage = rnd(level * 3 + 3);
      var plural = damage == 1 ? `` : `s`;
      updateLog(`You fell into a pit! You suffer ${damage} hit point${plural} damage`);
      lastnum = DIED_PIT; /* fell into a pit */
    }
    player.losehp(damage);
    //nap(2000);
    newcavelevel(level + 1);
  }
}



function obottomless() {
  var bottomlessMessage = ULARN ? `You fell into a pit leading straight to HELL!` : `You fell into a bottomless pit!`;
  updateLog(bottomlessMessage);
  beep();
  //nap(3000);
  died(DIED_BOTTOMLESS_PIT, false); /* fell into a bottomless pit */
}



function oelevator(direction) {
  // going up
  if (direction == 1) {
    if (level == 0) {
      appendLog(`, unfortunately it is out of order.`);
      return;
    }
    player.x = rnd(MAXX - 2);
    player.y = rnd(MAXY - 2);
    //nap(2000);


    // in dungeon
    if (level <= DBOTTOM) {
      newcavelevel(rund(level));
    }
    // in volcano
    else {
      var newLevel = DBOTTOM + rund(level - DBOTTOM);
      console.log(MAXLEVEL, level, newLevel);
      if (newLevel == DBOTTOM) newLevel = 0;
      console.log(MAXLEVEL, level, newLevel);
      newcavelevel(newLevel);
    }
  }
  // going down 
  else {
    if (level == DBOTTOM || level == (VBOTTOM)) {
      //nap(2000);
      updateLog(`  and it leads straight to HELL!`);
      beep();
      //nap(3000);
      died(DIED_BOTTOMLESS_ELEVATOR, false);
      return;
    }
    player.x = rnd(MAXX - 2);
    player.y = rnd(MAXY - 2);
    //nap(2000);

    // in dungeon
    if (level <= DBOTTOM) {
      newcavelevel(level + rnd(DBOTTOM - level));
    }
    // in volcano
    else {
      newcavelevel(level + rnd(VBOTTOM - level));
    }
  }
  positionplayer();
}



function forget() {
  setItem(player.x, player.y, OEMPTY);
}



/*
 * subroutine to handle a teleport trap +/- 1 level maximum
 */
function oteleport(err) {
  if (err) {
    if (rnd(151) < 3) {
      /*
      12.4.5 - you shouldn't get trapped in solid rock with WTW
      This was also added in ularn 1.6.3
      */
      if (player.WTW == 0) {
        updateLog(`You are trapped in solid rock!`)
        died(DIED_SOLID_ROCK, false); /* trapped in solid rock */
        return;
      } else {
        updateLog(`You feel lucky!`)
      }
    }
  }

  if (player.TELEFLAG == 0 && level != 0) {
    changedDepth = millis(); // notify when depth changes to '?'
  }

  player.TELEFLAG = 1; /* show ? on bottomline if been teleported */
  var newLevel;
  if (level == 0) {
    newLevel = 0;
  } else if (level < MAXLEVEL) {
    newLevel = rnd(5) + level - 3;
    if (newLevel >= MAXLEVEL)
      newLevel = DBOTTOM;
    if (newLevel < 1)
      newLevel = 1;
  } else {
    newLevel = rnd(ULARN ? 4 : 3) + level - 2;
    if (newLevel >= MAXLEVEL + MAXVLEVEL)
      newLevel = VBOTTOM;
    if (newLevel < MAXLEVEL)
      newLevel = MAXLEVEL;
  }
  player.x = rnd(MAXX - 2);
  player.y = rnd(MAXY - 2);

  /*
  v12.4.5 - if you hit a monster, and then teleport away, it would keep
            trying to chase you, even if you were really far away.

            BONUS bug: if there is a monster on a *different level* at
            the same location, IT will start to move around, sometimes
            through walls. now fixed in newcavelevel() and a few other
            places also.
  */
  lasthx = 0;
  lasthy = 0;

  if (level != newLevel) {
    newcavelevel(newLevel);
  }
  positionplayer();
}



/*
 * function to read a book
 */
function readbook(book) {
  var lev = book.arg;
  var spellIndex, spell;
  if (lev <= 3) {
    spell = splev[lev];
    spellIndex = rund((spell) ? spell : 1);
  } else {
    spell = splev[lev] - 9;
    spellIndex = rnd((spell) ? spell : 1) + 9;
  }

  // original larn doesn't have make wall spell
  if (!ULARN && spellIndex == MKW) {
    readbook(book);
    return;
  }

  learnSpell(spelcode[spellIndex]);
  updateLog(`Spell '<b>${spelcode[spellIndex]}</b>': ${spelname[spellIndex]}`);
  updateLog(`  ${speldescript[spellIndex]}`);
  if (rnd(10) == 4) {
    if (ULARN) updateLog(`You feel clever!`);
    else updateLog(`  Your intelligence went up by one!`);
    player.setIntelligence(player.INTELLIGENCE + 1);
  }
}



/* function to adjust time when time warping and taking courses in school */
function adjtime(tim) {
  if (player.STEALTH) player.updateStealth(-tim);
  if (player.UNDEADPRO) player.updateUndeadPro(-tim);
  if (player.SPIRITPRO) player.updateSpiritPro(-tim);
  if (player.CHARMCOUNT) player.updateCharmCount(-tim);
  // stop time
  if (player.HOLDMONST) player.updateHoldMonst(-tim);
  if (player.GIANTSTR) player.updateGiantStr(-tim);
  if (player.FIRERESISTANCE) player.updateFireResistance(-tim);
  if (player.DEXCOUNT) player.updateDexCount(-tim);
  if (player.STRCOUNT) player.updateStrCount(-tim);
  if (player.SCAREMONST) player.updateScareMonst(-tim);
  if (player.HASTESELF) player.updateHasteSelf(-tim);
  if (player.CANCELLATION) player.updateCancellation(-tim);
  if (player.INVISIBILITY) player.updateInvisibility(-tim);
  if (player.ALTPRO) player.updateAltPro(-tim);
  if (player.PROTECTIONTIME) player.updateProtectionTime(-tim);
  if (player.WTW) player.updateWTW(-tim);

  player.HERO = player.HERO > 0 ? Math.max(1, player.HERO - tim) : 0;
  player.GLOBE = player.GLOBE > 0 ? Math.max(1, player.GLOBE - tim) : 0;
  player.AWARENESS = player.AWARENESS > 0 ? Math.max(1, player.AWARENESS - tim) : 0;
  player.SEEINVISIBLE = player.SEEINVISIBLE > 0 ? Math.max(1, player.SEEINVISIBLE - tim) : 0;

  player.AGGRAVATE = player.AGGRAVATE > 0 ? Math.max(1, player.AGGRAVATE - tim) : 0;
  player.HASTEMONST = player.HASTEMONST > 0 ? Math.max(1, player.HASTEMONST - tim) : 0;
  player.HALFDAM = player.HALFDAM > 0 ? Math.max(1, player.HALFDAM - tim) : 0;
  player.ITCHING = player.ITCHING > 0 ? Math.max(1, player.ITCHING - tim) : 0;
  player.CLUMSINESS = player.CLUMSINESS > 0 ? Math.max(1, player.CLUMSINESS - tim) : 0;
  // confusion?
  // blindness?

  regen();
}