'use strict';

const itemlist = [];
var youFound;  // set in config
var period;    // set in config


/* 
This is the base object for every item in the game
It only has 2 fields to reduce the size of saved games since localstorage is limited to 5MB
*/
class Item {
  constructor(id, arg) {
    this.id = id;
    this.arg = arg ? arg : 0;
  }



  getChar() {
    return itemlist[this.id].getChar(this.arg);
  }



  getDescription() {
    return itemlist[this.id].desc;
  }



  matches(item, exact) {
    if (!item) {
      return false;
    }
    let isMatch = this.id == item.id;
    if (exact) isMatch &= this.arg == item.arg;
    return isMatch;
  }



  toString(inStore, showAll, tempPlayer) {
    var description = this.getDescription();
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
  }

  // we can wield more things than we show during wield inventory check
  // this is everything that a player can actually wield
  canWield() {
    /*
    v12.4.5 - this list is much reduced
    */
    return this.isWeapon() || this.isArmor() || this.isRing();
  }



  // this is what we show during an inventory check while wielding
  isWeapon() {
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
  }



  isArmor() {
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
  }



  isGem() {
    var gem = false;
    gem |= this.matches(ODIAMOND);
    gem |= this.matches(ORUBY);
    gem |= this.matches(OEMERALD);
    gem |= this.matches(OSAPPHIRE);
    return gem;
  }



  isRing() {
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
  }



  isStore() {
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
  }



  isDrug() {
    var drug = false;
    drug |= this.matches(OSPEED);
    drug |= this.matches(OACID);
    drug |= this.matches(OHASH);
    drug |= this.matches(OSHROOMS);
    drug |= this.matches(OCOKE);
    return drug;
  }



  getSortCode() {
    var sortcode = (sortorder.indexOf(this.id) + 1) * 10000;
    // sort unknown scrolls and potions above known
    // sort unknown scrolls and potions in inventory order
    // sort known scrolls and potions in inventory order
    if (isKnownScroll(this) || isKnownPotion(this)) {
      sortcode += (this.arg + 1) * 100;
    }
    return sortcode;
  }


}



const DIV_START = `url("img/`;
const DIV_END = `.png")`;
const BOLD = true;
const NO_BOLD = false;
const NO_COLOR = null;
const CARRY = true;
const NO_CARRY = false;



/* 
DungeonObject extends Item and is used to store static characteristics
of anything that can be found in the dungeon
*/
class DungeonObject extends Item {

  /*
    DungeonObject Constructor
  */
  constructor(id, char, hackchar, ularnchar, color, bold, desc, carry) {
    super(id, 0);
    this.char = char;
    this.hackchar = hackchar;
    this.ularnchar = ularnchar;
    this.color = color;
    this.bold = bold;
    this.desc = desc;
    this.carry = carry;
    if (!itemlist[id]) itemlist[id] = this;
  }

  /*
    DungeonObject getChar()
  */
  getChar(arg) {
    // TODO: cache this
    // let buffer = [numobjects]
    // if !buffer.get buffer.put
    // flush when resetting mode/bold/color
    if (amiga_mode) {
      if (this.id == OWALL.id) {
        return `${DIV_START}w${arg}${DIV_END}`;
      } else {
        return `${DIV_START}o${this.id}${DIV_END}`;
      }
    }
    let char = null;
    if (original_objects) {
      if (ULARN) {
        char = this.ularnchar;
      } else {
        char = this.char;
      }
    } else {
      char = this.hackchar;
    }
    if (show_color && this.color) {
      char = `<font color='${this.color}'>${char}</font>`;
    }
    if (bold_objects && this.bold) {
      char = `<b>${char}</b>`;
    }
    return char;
  }

} /* DungeonObject */



function createObject(item, arg) {

  if (!item) return null;

  // create item via an ID (used in dnd_store, wizard mode)
  // otherwise the item passed in is already an item to be duplicated
  //if (!isNaN(Number(item)) && item != ``) {
  if (typeof item == 'number') {
    item = itemlist[item];
  }

  var newItem = new Item(item.id, item.arg);

  if (arg) {
    newItem.arg = arg;
  } else if (item.arg) {
    newItem.arg = item.arg;
  } else {
    newItem.arg = 0;
  }

  return newItem;
}



/* id, char, hackchar, ularnchar, color, bold, desc, carry, arg */
const OEMPTY = new DungeonObject(0, `·`, `·`, `·`, NO_COLOR, NO_BOLD, `the dungeon floor`, NO_CARRY); // http://www.fileformat.info/info/unicode/char/00b7/index.htm
const OANNIHILATION = new DungeonObject(82, `s`, `0`, `s`, `crimson`, BOLD, `a sphere of annihilation`, NO_CARRY);
const OHOMEENTRANCE = new DungeonObject(93, OEMPTY.char, `8`, OEMPTY.char, NO_COLOR, NO_BOLD, `the exit to the home level`, NO_CARRY);
const OUNKNOWN = new DungeonObject(94, ` `, ` `, ` `, NO_COLOR, NO_BOLD, `... nothing`, NO_CARRY);

// buildings / home level
const OHOME = new DungeonObject(69, `H`, `1`, `H`, `cornflowerblue`, BOLD, `your way home`, NO_CARRY);
const ODNDSTORE = new DungeonObject(12, `=`, `2`, `=`, `orchid`, BOLD, `the DND store`, NO_CARRY);
const OTRADEPOST = new DungeonObject(77, `S`, `3`, `S`, `tan`, BOLD, `the local trading post`, NO_CARRY);
const OLRS = new DungeonObject(80, `L`, `4`, `L`, `lightgray`, BOLD, `the Larn Revenue Service`, NO_CARRY);
const OBANK = new DungeonObject(16, `$`, `5`, `$`, `gold`, BOLD, `the bank of Larn`, NO_CARRY);
const OBANK2 = new DungeonObject(15, `$`, `5`, `$`, `gold`, BOLD, `the Nth branch of the Bank of Larn`, NO_CARRY);
const OSCHOOL = new DungeonObject(10, `+`, `6`, `+`, `darkorange`, BOLD, `the College of Larn`, NO_CARRY);
const OENTRANCE = new DungeonObject(54, `E`, `8`, `E`, `yellowgreen`, BOLD, `the dungeon entrance`, NO_CARRY);
const OVOLDOWN = new DungeonObject(55, `V`, `9`, `V`, `crimson`, BOLD, `a volcanic shaft leaning downward`, NO_CARRY);
// ULARN
const OPAD = new DungeonObject(100, `@`, `@`, `@`, `lightgreen`, BOLD, `Dealer McDope's Hideout!`, NO_CARRY);

// dungeon features
const OWALL = new DungeonObject(21, `▒`, `▒`, `▒`, NO_COLOR, NO_BOLD, `a wall`, NO_CARRY);
// const OALTAR = new DungeonObject(1, `A`, `:`, `A`, `orchid`, BOLD, `a holy altar`, NO_CARRY);
const OALTAR = new DungeonObject(1, `A`, `:`, `A`, `lightslategray`, BOLD, `a holy altar`, NO_CARRY);
const OTHRONE = new DungeonObject(2, `T`, `\\`, `T`, `gold`, BOLD, `a handsome jewel encrusted throne`, NO_CARRY);
const ODEADTHRONE = new DungeonObject(79, `t`, `/`, `t`, `lightgray`, BOLD, `a massive throne`, NO_CARRY);
const OPIT = new DungeonObject(4, `P`, `^`, `P`, `sandybrown`, BOLD, `a pit`, NO_CARRY);
const OVOLUP = new DungeonObject(56, `V`, `9`, `V`, `yellowgreen`, BOLD, `the base of a volcanic shaft`, NO_CARRY);
const OSTAIRSUP = new DungeonObject(5, `&lt`, `&lt`, `%`, `yellowgreen`, BOLD, `a staircase going up`, NO_CARRY); // use &lt to prevent bugginess when dropping a ! or ? to the right
const OSTAIRSDOWN = new DungeonObject(13, `&gt`, `&gt`, `%`, `sandybrown`, BOLD, `a staircase going down`, NO_CARRY);
const OFOUNTAIN = new DungeonObject(7, `F`, `{`, `F`, `cornflowerblue`, BOLD, `a bubbling fountain`, NO_CARRY);
const ODEADFOUNTAIN = new DungeonObject(17, `f`, `}`, `f`, `lightgray`, BOLD, `a dead fountain`, NO_CARRY);
const OSTATUE = new DungeonObject(8, `&`, `%`, `&`, `ivory`, BOLD, `a great marble statue`, NO_CARRY);
const OMIRROR = new DungeonObject(11, `M`, `|`, `M`, `silver`, BOLD, `a mirror`, NO_CARRY);
const OOPENDOOR = new DungeonObject(19, `O`, `'`, `O`, `lightgray`, BOLD, `an open door`, NO_CARRY);
const OCLOSEDDOOR = new DungeonObject(20, `D`, `+`, `D`, `lightgray`, BOLD, `a closed door`, NO_CARRY);
// ULARN
const OELEVATORUP = new DungeonObject(6, `_`, `_`, `_`, `yellowgreen`, BOLD, `an express elevator going up`, NO_CARRY);
const OELEVATORDOWN = new DungeonObject(14, `_`, `_`, `_`, `sandybrown`, BOLD, `an express elevator going down`, NO_CARRY);

// traps
const OIVTELETRAP = new DungeonObject(78, OEMPTY.char, OEMPTY.char, OEMPTY.char, NO_COLOR, NO_BOLD, `a teleport trap`, NO_CARRY);
const OTELEPORTER = new DungeonObject(9, `^`, `^`, `^`, `mediumpurple`, BOLD, `a teleport trap`, NO_CARRY);
const OTRAPARROWIV = new DungeonObject(67, OEMPTY.char, OEMPTY.char, OEMPTY.char, NO_COLOR, NO_BOLD, `an arrow trap`, NO_CARRY);
const OTRAPARROW = new DungeonObject(66, `^`, `^`, `^`, `lightgray`, BOLD, `an arrow trap`, NO_CARRY);
const ODARTRAP = new DungeonObject(74, `^`, `^`, `^`, `lightgreen`, BOLD, `a dart trap`, NO_CARRY);
const OIVDARTRAP = new DungeonObject(73, OEMPTY.char, OEMPTY.char, OEMPTY.char, NO_COLOR, NO_BOLD, `a dart trap`, NO_CARRY);
const OTRAPDOOR = new DungeonObject(75, `^`, `^`, `^`, `sandybrown`, BOLD, `a trapdoor`, NO_CARRY);
const OIVTRAPDOOR = new DungeonObject(76, OEMPTY.char, OEMPTY.char, OEMPTY.char, NO_COLOR, NO_BOLD, `a trapdoor`, NO_CARRY);

// dungeon items
const OGOLDPILE = new DungeonObject(18, `*`, `$`, `*`, `gold`, BOLD, `some gold`, CARRY, 0);
const OSCROLL = new DungeonObject(41, `?`, `?`, `?`, `tan`, BOLD, `a magic scroll`, CARRY);
const OPOTION = new DungeonObject(42, `!`, `!`, `!`, `plum`, BOLD, `a magic potion`, CARRY);
const OBOOK = new DungeonObject(43, `B`, `?`, `B`, `darkgoldenrod`, BOLD, `a book`, CARRY);
const OCHEST = new DungeonObject(44, `C`, `&`, `C`, `khaki`, BOLD, `a chest`, CARRY);
const ODIAMOND = new DungeonObject(50, `@`, `*`, `&lt`, `white`, BOLD, `a brilliant diamond`, CARRY);
const ORUBY = new DungeonObject(51, `@`, `*`, `&lt`, `crimson`, BOLD, `a ruby`, CARRY);
const OEMERALD = new DungeonObject(52, `@`, `*`, `&lt`, `springgreen`, BOLD, `an enchanting emerald`, CARRY);
const OSAPPHIRE = new DungeonObject(53, `@`, `*`, `&lt`, `dodgerblue`, BOLD, `a sparkling sapphire`, CARRY);
const OCOOKIE = new DungeonObject(83, `c`, `,`, `c`, `tan`, BOLD, `a fortune cookie`, CARRY);

// weapons
const OSWORD = new DungeonObject(28, `)`, `)`, `)`, `lightgray`, BOLD, `a sunsword`, CARRY);
const O2SWORD = new DungeonObject(29, `(`, `)`, `(`, `lightgray`, BOLD, `a two handed sword`, CARRY);
const OSPEAR = new DungeonObject(30, `(`, `)`, `(`, `lightgray`, BOLD, `a spear`, CARRY);
const ODAGGER = new DungeonObject(31, `(`, `)`, `(`, `lightgray`, BOLD, `a dagger`, CARRY);
const OBELT = new DungeonObject(40, `{`, `-`, `{`, `darkgoldenrod`, BOLD, `a belt of striking`, CARRY);
const OBATTLEAXE = new DungeonObject(57, `)`, `)`, `)`, `lightgray`, BOLD, `a battle axe`, CARRY);
const OLONGSWORD = new DungeonObject(58, `)`, `)`, `)`, `lightgray`, BOLD, `a longsword`, CARRY);
const OFLAIL = new DungeonObject(59, `(`, `)`, `(`, `lightgray`, BOLD, `a flail`, CARRY);
const OLANCE = new DungeonObject(65, `)`, `)`, `)`, `lightgray`, BOLD, `a lance of death`, CARRY);

// special weapons
const OSWORDofSLASHING = new DungeonObject(26, `)`, `)`, `)`, `cornflowerblue`, BOLD, `a sword of slashing`, CARRY);
const OHAMMER = new DungeonObject(27, `)`, `)`, `)`, `darkgoldenrod`, BOLD, `Bessman's flailing hammer`, CARRY);
// ULARN
const OVORPAL = new DungeonObject(90, `)`, `)`, `)`, `darkorange`, BOLD, `the Vorpal Blade`, CARRY);
const OSLAYER = new DungeonObject(91, `)`, `)`, `)`, `crimson`, BOLD, `Slayer`, CARRY);

// armour
const OLEATHER = new DungeonObject(25, `[`, `[`, `[`, `lightgray`, BOLD, `leather armor`, CARRY);
const OSTUDLEATHER = new DungeonObject(61, `[`, `[`, `[`, `lightgray`, BOLD, `studded leather armor`, CARRY);
const ORING = new DungeonObject(60, `[`, `[`, `[`, `lightgray`, BOLD, `ring mail`, CARRY);
const OCHAIN = new DungeonObject(24, `[`, `[`, `[`, `lightgray`, BOLD, `chain mail`, CARRY);
const OSPLINT = new DungeonObject(62, `]`, `[`, `]`, `lightgray`, BOLD, `splint mail`, CARRY);
const OPLATE = new DungeonObject(23, `]`, `[`, `]`, `lightgray`, BOLD, `plate mail`, CARRY);
const OPLATEARMOR = new DungeonObject(63, `]`, `[`, `]`, `lightgray`, BOLD, `plate armor`, CARRY);
const OSSPLATE = new DungeonObject(64, `]`, `[`, `]`, `lightgray`, BOLD, `stainless plate armor`, CARRY);
const OSHIELD = new DungeonObject(68, `[`, `[`, `[`, `lightgray`, BOLD, `a shield`, CARRY);
// ULARN
const OELVENCHAIN = new DungeonObject(92, `]`, `]`, `]`, `cornflowerblue`, BOLD, `elven chain`, CARRY);

// rings
const ORINGOFEXTRA = new DungeonObject(32, `=`, `=`, `|`, `lightgray`, BOLD, `a ring of extra regeneration`, CARRY);
const OREGENRING = new DungeonObject(33, `=`, `=`, `|`, `lightgray`, BOLD, `a ring of regeneration`, CARRY);
const OPROTRING = new DungeonObject(34, `=`, `=`, `|`, `lightgray`, BOLD, `a ring of protection`, CARRY);
const OENERGYRING = new DungeonObject(35, `=`, `=`, `|`, `lightgray`, BOLD, `an energy ring`, CARRY);
const ODEXRING = new DungeonObject(36, `=`, `=`, `|`, `lightgray`, BOLD, `a ring of dexterity`, CARRY);
const OSTRRING = new DungeonObject(37, `=`, `=`, `|`, `lightgray`, BOLD, `a ring of strength`, CARRY);
const OCLEVERRING = new DungeonObject(38, `=`, `=`, `|`, `lightgray`, BOLD, `a ring of cleverness`, CARRY);
const ODAMRING = new DungeonObject(39, `=`, `=`, `|`, `lightgray`, BOLD, `a ring of increase damage`, CARRY);

// special objects
const OLARNEYE = new DungeonObject(22, `~`, `~`, `~`, `magenta`, BOLD, `The Eye of Larn`, CARRY);
const OAMULET = new DungeonObject(45, `}`, `~`, `.`, `gold`, BOLD, `an amulet of invisibility`, CARRY);
const OORBOFDRAGON = new DungeonObject(46, `o`, `~`, `o`, `skyblue`, BOLD, `an orb of dragon slaying`, CARRY);
const OSPIRITSCARAB = new DungeonObject(47, `:`, `~`, `.`, `darkorange`, BOLD, `a scarab of negate spirit`, CARRY);
const OCUBEofUNDEAD = new DungeonObject(48, `;`, `~`, `.`, `plum`, BOLD, `a cube of undead control`, CARRY);
const ONOTHEFT = new DungeonObject(49, `,`, `~`, `.`, `cornflowerblue`, BOLD, `a device of theft prevention`, CARRY);
const OORB = new DungeonObject(3, `o`, `~`, `o`, `plum`, BOLD, `an orb of enlightenment`, CARRY);
// ULARN
const OBRASSLAMP = new DungeonObject(85, `.`, `.`, `.`, `gold`, BOLD, `a brass lamp`, CARRY);
const OHANDofFEAR = new DungeonObject(86, `.`, `.`, `.`, `crimson`, BOLD, `The Hand of Fear`, CARRY);
const OSPHTALISMAN = new DungeonObject(87, `.`, `.`, `.`, `skyblue`, BOLD, `The Talisman of the Sphere`, CARRY);
const OWWAND = new DungeonObject(88, `/`, `/`, `/`, `mediumseagreen`, BOLD, `a wand of wonder`, CARRY);
const OPSTAFF = new DungeonObject(89, `/`, `/`, `/`, `darkorange`, BOLD, `a staff of power`, CARRY);
const OLIFEPRESERVER = new DungeonObject(101, `"`, `"`, `"`, `orange`, BOLD, `an amulet of life preservation`, CARRY);

// ULARN drugs
const OSPEED = new DungeonObject(95, `:`, `:`, `:`, `paleblue`, BOLD, `some speed`, CARRY);
const OACID = new DungeonObject(96, `:`, `:`, `:`, `mediumpurple`, BOLD, `some LSD`, CARRY);
const OHASH = new DungeonObject(97, `:`, `:`, `:`, `sandybrown`, BOLD, `some hashish`, CARRY);
const OSHROOMS = new DungeonObject(98, `:`, `:`, `:`, `tan`, BOLD, `some magic mushrooms`, CARRY);
const OCOKE = new DungeonObject(99, `:`, `:`, `:`, `snow`, BOLD, `some cocaine`, CARRY);



function getItemDir(direction) {
  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];
  return itemAt(x, y);
}



function itemAt(x, y) {
  if (x == null || y == null || x < 0 || x >= MAXX || y < 0 || y >= MAXY) {
    return null;
  }

  // debugging: there is an issue with a null player.level.item[][]
  if (!player.level.items[x][y]) {
    let errorMessage = `itemAt(): null item: x=${x} y=${y}`;
    console.log(errorMessage);
    try {
      let o = `level:${level}\n`;
      let m = `monsters:\n`;
      let k = `know:\n`;
      for (let y = 0; y < 17; y++) {
        for (let x = 0; x < 67; x++) {
          o += player.level.items[x][y] ? itemlist[player.level.items[x][y].id].char : `#=#`;
          m += player.level.monsters[x][y] ? player.level.monsters[x][y].char : `.`;
          k += player.level.know[x][y] ? player.level.know[x][y] : `.`;
        }
        o += `\n`;
        m += `\n`;
        k += `\n`;
      }
      doRollbar(ROLLBAR_ERROR, `null itemAt()`, `${errorMessage}\n${o}\n${m}\n${k}`);
    } catch (error) {
      // do nothing
    }
  }

  return player.level.items[x][y];
}



function setItem(x, y, item) {
  if (x == null || y == null || x < 0 || x >= MAXX || y < 0 || y >= MAXY) {
    return null;
  }
  player.level.items[x][y] = createObject(item, item.arg);
  return item;
}



function isItemAt(x, y) {
  var item = itemAt(x, y);
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



function lookforobject(do_ident, do_pickup) {
  if (!player) return;

  // do_ident;   /* identify item: T/F */
  // do_pickup;  /* pickup item:   T/F */

  /* can't find objects if time is stopped    */
  if (player.TIMESTOP)
    return;

  showcell(player.x, player.y);

  var item = itemAt(player.x, player.y);

  if (item.matches(OEMPTY)) {
    // do nothing
    nomove = 1;
    return;
  }
  else if (item.matches(OGOLDPILE)) {
    if (ULARN) {
      updateLog(`${youFound} ${Number(item.arg).toLocaleString()} gold pieces${period}`)
    }
    else {
      updateLog(`${youFound} some gold!`);
      updateLog(`  It is worth ${Number(item.arg).toLocaleString()}!`);
    }
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
    updateLog(`You're standing at the top of a pit${period}`);
    opit();
  }
  //
  else if (item.matches(OMIRROR)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is a mirror here${period}`);
  }
  //
  else if (item.matches(OFOUNTAIN)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is a fountain here${period}`, formatHint('f', 'to wash', 'D', 'to drink'));
  }
  //
  else if (item.matches(ODEADFOUNTAIN)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is a dead fountain here${period}`);
  }
  //
  else if (ULARN && item.matches(OOPENDOOR)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is an open door here${period}`);
  }
  //
  else if (item.matches(ODNDSTORE)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is a DND store here${period}`, formatHint('e', 'to go inside'));
  }
  //
  else if (item.matches(OPAD)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`You have found ${item}`, formatHint('e', 'to go inside'));
  }
  else if (item.matches(OVOLDOWN)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`You have found ${item}${period}`, formatHint('>', 'to climb down'));
  }
  else if (item.matches(OVOLUP)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`You have found ${item}${period}`, formatHint('<', 'to climb up'));
  }
  else if (item.isStore()) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`You have found ${item}${period}`, formatHint('e', 'to go inside'));
  }
  //
  else if (item.matches(OSTATUE)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`You are standing in front of a statue${period}`);
  }
  //
  else if (item.matches(OIVTELETRAP)) {
    if (rnd(11) < 6)
      return;
    setItem(player.x, player.y, OTELEPORTER);
    player.level.know[player.x][player.y] = KNOWALL;
    lookforobject(do_ident, do_pickup);
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
    setItem(player.x, player.y, OTRAPARROW);
    player.level.know[player.x][player.y] = KNOWALL;
    /* fall through to OTRAPARROW case below!!! */
    lookforobject(do_ident, do_pickup);
    return;
  }
  //
  else if (item.matches(OTRAPARROW)) {
    updateLog(`You are hit by an arrow!`);
    lastnum = DIED_ARROW; /* shot by an arrow */
    player.losehp(rnd(10) + level);
    return;
  }
  //
  else if (item.matches(OIVDARTRAP)) {
    /* for a dart trap */
    if (rnd(17) < 13)
      return;
    setItem(player.x, player.y, ODARTRAP);
    player.level.know[player.x][player.y] = KNOWALL;
    /* fall through to ODARTRAP case below!!! */
    lookforobject(do_ident, do_pickup);
    return;
  }
  //
  else if (item.matches(ODARTRAP)) {
    updateLog(`You are hit by a dart!`);
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
    setItem(player.x, player.y, OTRAPDOOR);
    player.level.know[player.x][player.y] = KNOWALL;
    /* fall through to OTRAPDOOR case below!!! */
    lookforobject(do_ident, do_pickup);
    return;
  }
  //
  else if (item.matches(OTRAPDOOR)) {
    if (isCarrying(OWWAND)) {
      updateLog(`You escape a trap door!`);
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
    updateLog(`You fall through a trap door! You lose ${dmg} hit points${period}`);
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
  else if (item.matches(OSTAIRSUP)) {
    let stairMessage = `${youFound} ${item}`;
    if (ULARN) stairMessage = `There is a circular staircase here${period}`;
    if (do_ident) updateLog(stairMessage, formatHint('<', 'go up'));
  }
  //
  else if (item.matches(OSTAIRSDOWN)) {
    let stairMessage = `${youFound} ${item}`;
    if (ULARN) stairMessage = `There is a circular staircase here${period}`;
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
    updateLog(`You find ${item}${period} [<b>R</b> to rub]`);
  }
  //
  else if (item.matches(OPOTION)) {
    if (do_ident) updateLog(`${youFound} ${item}${period}`, formatHint('t', 'to take', 'q', 'to quaff'));
  }
  //
  else if (item.matches(OSCROLL) || item.matches(OBOOK)) {
    if (do_ident) updateLog(`${youFound} ${item}${period}`, formatHint('t', 'to take', 'r', 'to read'));
  }
  //
  else if (item.isArmor()) {
    if (do_ident) updateLog(`${youFound} ${item}${period}`, formatHint('t', 'to take', 'W', 'to wear'));
  }
  //
  else if (item.isWeapon()) {
    if (do_ident) updateLog(`${youFound} ${item}${period}`, formatHint('t', 'to take', 'w', 'to wield'));
  }
  //
  else if (item.matches(OCHEST)) {
    if (do_ident) updateLog(`There is a chest here${period}`, formatHint('t', 'to take', 'o', 'to open'));
  }
  //
  else if (item.matches(OCOOKIE)) {
    if (do_ident) updateLog(`${youFound} ${item}${period}`, formatHint('t', 'to take', 'E', 'to eat'));
  }
  //
  else if (item.matches(OSPEED)) {
    if (do_ident) updateLog(`${youFound} ${item}${period} [<b>s</b> to snort]`);
  }
  //
  else if (item.matches(OSHROOMS)) {
    if (do_ident) updateLog(`${youFound} ${item}${period} [<b>e</b> to eat]`);
  }
  //
  else if (item.matches(OACID)) {
    if (do_ident) updateLog(`${youFound} ${item}${period} [<b>e</b> to eat]`);
  }
  //
  else if (item.matches(OHASH)) {
    if (do_ident) updateLog(`${youFound} ${item}${period} [<b>s</b> to smoke]`);
  }
  //
  else if (item.matches(OCOKE)) {
    if (do_ident) updateLog(`${youFound} ${item}${period} [<b>s</b> to snort]`);
  }
  //
  else if (canTake(item)) {
    if (do_ident) updateLog(`${youFound} ${item}${period}`, formatHint('t', 'to take'));
  }

  // base case
  else {
    if (do_ident && !item.matches(OWALL)) {
      updateLog(`${youFound} ${item}${period}`);
    }
  }

  if (do_pickup) {
    if (canTake(item) && take(item)) {
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
    updateLog(`You float right over the pit!`);
    return;
  }
  if (level == DBOTTOM || level >= VBOTTOM) {
    obottomless();
  } else {
    var damage = 0;
    if (rnd(101) < 20) {
      var pitMessage = ULARN ? `A poor monster cushions your fall!` : `Your fall is cushioned by an unknown force${period}`;
      updateLog(`You fell into a pit! ${pitMessage}`);
    } else {
      damage = rnd(level * 3 + 3);
      var plural = damage == 1 ? `` : `s`;
      updateLog(`You fell into a pit! You suffer ${damage} hit point${plural} damage${period}`);
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
      appendLog(`, unfortunately it is out of order${period}`);
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
      if (newLevel == DBOTTOM) newLevel = 0;
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
function oteleport(teleportSelf) {
  if (teleportSelf && level != 0) {
    if (rnd(151) < 3) {

      // idea: (rnd(151) < 3 + getDifficulty()) or + rnd(getDifficulty()) ? 
      // might be too fast of a progression. would be smoother to go from 1 in 75 to 1 in 74 etc

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

  player.TELEFLAG = wizard ? 0 : 1; /* show ? on bottomline if been teleported */

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

  if (teleportSelf) updateLog(`Zaaaappp!`);

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
  updateLog(`  ${speldescript[spellIndex]}${period}`);
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