"use strict";

const OWALL = new Item("OWALL", "▒", "a wall", false);
const OEMPTY = new Item("OEMPTY", "·", "empty space", false); // http://www.fileformat.info/info/unicode/char/00b7/index.htm
const OSTAIRSDOWN = new Item("OSTAIRSDOWN", ">", "a staircase going down", false);
const OSTAIRSUP = new Item("OSTAIRSUP", "&lt", "a staircase going up", false); // use &lt to prevent bugginess when dropping a ! or ? to the right
const OENTRANCE = new Item("OENTRANCE", "E", "the dungeon entrance", false);
const OHOMEENTRANCE = new Item("OHOMEENTRANCE", ".", "exit to home level", false);
const OVOLUP = new Item("OVOLUP", "V", "the base of a volcanic shaft", false);
const OVOLDOWN = new Item("OVOLDOWN", "V", "a volcanic shaft leaning downward", false);
const OPIT = new Item("OPIT", "<b>P</b>", "a pit", false);
const OMIRROR = new Item("MIRROR", "<b>M</b>", "a mirror", false);
const OSTATUE = new Item("OSTATUE", "&", "a great marble statue", false);

const OGOLDPILE = new Item("OGOLDPILE", "*", "some gold", true, 0);
const OPOTION = new Item("OPOTION", "<b>!</b>", "a magic potion", true);
const OSCROLL = new Item("OSCROLL", "<b>?</b>", "a magic scroll", true);

const ODAGGER = new Item("ODAGGER", "(", "a dagger", true);
const OBELT = new Item("OBELT", "{", "a belt of striking", true);
const OSPEAR = new Item("OSPEAR", "(", "a spear", true);
const OFLAIL = new Item("OFLAIL", "(", "a flail", true);
const OBATTLEAXE = new Item("OBATTLEAXE", ")", "a battle axe", true);
const OLANCE = new Item("OLANCE", ")", "a lance of death", true);
const OLONGSWORD = new Item("OLONGSWORD", ")", "a longsword", true);
const O2SWORD = new Item("O2SWORD", "(", "a two handed sword", true);
const OSWORD = new Item("OSWORD", ")", "a sunsword", true);
const OSWORDofSLASHING = new Item("OSWORDofSLASHING", ")", "a sword of slashing", true);
const OHAMMER = new Item("OHAMMER", ")", "Bessman's flailing hammer", true);

const OSHIELD = new Item("OSHIELD", "[", "a shield", true);
const OLEATHER = new Item("OLEATHER", "[", "leather armor", true);
const OSTUDLEATHER = new Item("OSTUDLEATHER", "[", "studded leather armor", true);
const ORING = new Item("ORING", "[", "ring mail", true);
const OCHAIN = new Item("OCHAIN", "[", "chain mail", true);
const OSPLINT = new Item("OSPLINT", "]", "splint mail", true);
const OPLATE = new Item("OPLATE", "]", "plate mail", true);
const OPLATEARMOR = new Item("OPLATEARMOR", "]", "plate armor", true);
const OSSPLATE = new Item("OSSPLATE", "]", "stainless plate armor", true);

const OCLOSEDDOOR = new Item("OCLOSEDDOOR", "D", "a closed door", false);
const OOPENDOOR = new Item("OOPENDOOR", "O", "an open door", false);
const OALTAR = new Item("OALTAR", "<b>A</b>", "a holy altar", false);
const OTRAPARROWIV = new Item("OTRAPARROWIV", ".", "an arrow trap", false);
const OIVTELETRAP = new Item("OIVTELETRAP", ".", "a teleport trap", false);
const OIVDARTRAP = new Item("OIVDARTRAP", ".", "a dart trap", false);
const OIVTRAPDOOR = new Item("OIVTRAPDOOR", ".", "a trap door", false);

const OLARNEYE = new Item("OLARNEYE", "~", "The Eye of Larn", true);
const ODIAMOND = new Item("ODIAMOND", "@", "a brilliant diamond", true);
const ORUBY = new Item("ORUBY", "@", "a ruby", true);
const OEMERALD = new Item("OEMERALD", "@", "an enchanting emerald", true);
const OSAPPHIRE = new Item("OSAPPHIRE", "@", "a sparkling sapphire", true);

const OTHRONE = new Item("OTHRONE", "<b>T</b>", "a handsome jewel encrusted throne", false);
const ODEADTHRONE = new Item("ODEADTHRONE", "<b>t</b>", "a massive throne", false);

const OFOUNTAIN = new Item("OFOUNTAIN", "<b>F</b>", "a bubbling fountain", false);
const ODEADFOUNTAIN = new Item("ODEADFOUNTAIN", "<b>f</b>", "a dead fountain", false);

const OSCHOOL = new Item("OSCHOOL", "+", "the college of Larn", false);
const ODNDSTORE = new Item("ODNDSTORE", "=", "the DND store", false);
const OBANK2 = new Item("OBANK2", "$", "the 5th branch of the Bank of Larn", false);
const OBANK = new Item("OBANK", "$", "the bank of Larn", false);
const OHOME = new Item("OHOME", "H", "your home", false);
const OLRS = new Item("OLRS", "L", "the Larn Revenue Service", false);
const OTRADEPOST = new Item("OTRADEPOST", "S", "the local trading post", false);

const OPROTRING = new Item("OPROTRING", "=", "a ring of protection", true);
const OSTRRING = new Item("OSTRRING", "=", "a ring of strength", true);
const ODEXRING = new Item("ODEXRING", "=", "a ring of dexterity", true);
const OCLEVERRING = new Item("OCLEVERRING", "=", "a ring of cleverness", true);
const OENERGYRING = new Item("OENERGYRING", "=", "an energy ring", true);
const ODAMRING = new Item("ODAMRING", "=", "a ring of increase damage", true);
const OREGENRING = new Item("OREGENRING", "=", "a ring of regeneration", true);
const ORINGOFEXTRA = new Item("ORINGOFEXTRA", "=", "ring of extra regeneration", true);
const OAMULET = new Item("OAMULET", "}", "an amulet of invisibility", true);
const OORBOFDRAGON = new Item("OORBOFDRAGON", "<b>o</b>", "an orb of dragon slaying", true);
const OSPIRITSCARAB = new Item("OSPIRITSCARAB", ":", "a scarab of negate spirit", true);
const OCUBEofUNDEAD = new Item("OCUBEofUNDEAD", ";", "a cube of undead control", true);
const ONOTHEFT = new Item("ONOTHEFT", ",", "device of theft prevention", true);
const OCHEST = new Item("OCHEST", "<b>C</b>", "a chest", true);
const OBOOK = new Item("OBOOK", "<b>B</b>", "a book", true);
const OCOOKIE = new Item("OCOOKIE", "<b>c</b>", "a fortune cookie", true);




var Item = {
    id: null,
    char: "💩",
    desc: "",
    carry: false,
    arg: 0,

    matches: function(item) {
      return (this.id == item.id);
    },

    toString: function(force_known) {
      var description = this.desc;
      if (this.matches(OPOTION)) {
        if (isKnownPotion(this) || force_known || DEBUG_KNOW_ALL) {
          description += " of " + potionname[this.arg];
        }
      }
      //
      else if (this.matches(OSCROLL)) {
        if (isKnownScroll(this) || force_known || DEBUG_KNOW_ALL) {
          description += " of " + scrollname[this.arg];
        }
      }
      //
      else if (this.matches(OOPENDOOR) ||
        this.matches(OCLOSEDDOOR) ||
        this.matches(OTHRONE) ||
        this.matches(ODEADTHRONE) ||
        this.matches(OBOOK) ||
        this.matches(OCHEST) ||
        (this.isRing() && force_known) ||
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

    isRing: function() {
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

  } // ITEM OBJECT

function Item(id, char, desc, carry, arg) {
  this.id = id;
  this.char = char;
  this.desc = desc;
  this.carry = carry;
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
  newItem.carry = item.carry;
  if (item.carry == null)
    console.log(`undefined carry: ${item.id} ${item.carry}`);
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


  /* can't find objects if time is stopped    */
  if (player.TIMESTOP)
    return;

  var item = player.level.items[player.x][player.y];

  if (item.matches(OEMPTY)) {
    // do nothing
  }
  //
  else if (item.matches(OGOLDPILE)) {
    updateLog("You have found some gold!");
    updateLog("It is worth " + item.arg + "!");
    player.GOLD += item.arg;
    forget();
  }
  //
  else if (item.matches(OPOTION)) {
    if (do_ident) {
      updateLog(`You have found ${item}: (q) quaff or (t) take`);
    }
    if (do_action) {
      //non_blocking_callback = opotion;
    }
  }
  //
  else if (item.matches(OSCROLL)) {
    if (do_ident) {
      if (player.BLINDCOUNT == 0)
        updateLog(`You have found ${item}: (r) read or (t) take`);
      else
        updateLog(`You have found ${item}: (t) take`);
    }
    if (do_action) {
      //non_blocking_callback = oscroll;
    }
  }
  //
  else if (item.matches(OBOOK)) {
    if (do_ident) {
      if (player.BLINDCOUNT == 0)
        updateLog(`You have found ${item}: (r) read or (t) take`);
      else
        updateLog(`You have found ${item}: (t) take`);
    }
    if (do_action) {
      //non_blocking_callback = obook;
    }
  }
  //
  else if (item.matches(OALTAR)) {
    if (nearbymonst())
      return;
    if (do_ident) {
      updateLog("There is a Holy Altar here!");
      updateLog("Do you (p) pray (d) desecrate, or (i) ignore it?");
    }
    if (do_action) {
      blocking_callback = oaltar;
    }
  }
  //
  else if (item.matches(OTHRONE)) {
    if (nearbymonst())
      return;
    if (do_ident) {
      updateLog(`There is ${item} here!`);
      updateLog(`Do you (p) pry off jewels, (s) sit down`);
    }
    if (do_action) {
      non_blocking_callback = othrone;
    }
  }
  //
  else if (item.matches(ODEADTHRONE)) {
    if (nearbymonst())
      return;
    if (do_ident) {
      updateLog(`There is ${item} here!`);
      updateLog(`Do you (s) sit down`);
    }
    if (do_action) {
      non_blocking_callback = othrone;
    }
  }
  //
  else if (item.matches(OPIT)) {
    updateLog("You're standing at the top of a pit");
    opit();
  }
  //
  else if (item.matches(OMIRROR)) {
    if (nearbymonst())
      return;
    if (do_ident)
      updateLog("There is a mirror here");
  }
  //
  else if (item.matches(OFOUNTAIN)) {
    if (nearbymonst())
      return;
    if (do_ident) {
      updateLog("There is a fountain here");
      updateLog("Do you (D) drink, (T) tidy up");
    }
    if (do_action) {
      //non_blocking_callback = ofountain;
    }
  }
  //
  else if (item.matches(ODEADFOUNTAIN)) {
    if (nearbymonst())
      return;
    if (do_ident)
      updateLog("There is a dead fountain here");
  }
  //
  else if (item.matches(ODNDSTORE)) {
    if (nearbymonst())
      return;
    if (do_ident)
      updateLog("There is a DND store here");
    // if (do_action)
    //   prompt_enter();
  }
  //
  else if (item.matches(OBANK) || item.matches(OBANK2)) {
    if (nearbymonst())
      return;
    if (do_ident)
      updateLog(`You have found ${item}`);
    // if (do_action)
    //   prompt_enter();
  }
  //
  else if (item.matches(OSTATUE)) {
    if (nearbymonst())
      return;
    if (do_ident)
      updateLog("You are standing in front of a statue");
  }
  //
  else if (item.matches(OOPENDOOR)) {
    if (do_ident) {
      updateLog(`You have found ${item} (c) close`);
    }
    if (do_action) {
      non_blocking_callback = o_open_door;
    }
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
  }
  // put this before wield to make wear be default for shields
  else if (item.isArmor()) {
    if (do_ident) {
      updateLog(`You have found ${item}: (W) wear or (t) take`);
    }
    if (do_action) {
      //non_blocking_callback = wear;
    }
  }
  //
  else if (item.isWeapon()) {
    if (do_ident) {
      updateLog(`You have found ${item}: (w) wield or (t) take`);
    }
    if (do_action) {
      //non_blocking_callback = wield;
    }
  }

  // base case
  else {
    if (do_ident) {
      if (item.carry) {
        updateLog(`You have found ${item}: (t) take`);
      } else if (!item.matches(OWALL)) {
        updateLog(`You have found ${item}`);
      }
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



/*
 * function to read a book
 */
function readbook(book) {
  var lev = book.arg;
  var i, tmp;
  if (lev <= 3)
    i = rund((tmp = splev[lev]) ? tmp : 1);
  else
    i = rnd((tmp = splev[lev] - 9) ? tmp : 1) + 9;
  learnSpell(spelcode[i]);
  updateLog(`Spell \"${spelcode[i]}\":  ${spelname[i]}`);
  updateLog(`${speldescript[i]}`);
  if (rnd(10) == 4) {
    updateLog("Your int went up by one!");
    player.INTELLIGENCE++;
    bottomline();
  }
}
