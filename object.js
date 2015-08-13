"use strict";

const OWALL = new Item("OWALL", "▒", "a wall", false);
const OEMPTY = new Item("OEMPTY", "·", "empty space", false); // http://www.fileformat.info/info/unicode/char/00b7/index.htm
const OSTAIRSDOWN = new Item("OSTAIRSDOWN", "<b>></b>", "a staircase going down", false);
const OSTAIRSUP = new Item("OSTAIRSUP", "<b>&lt</b>", "a staircase going up", false); // use &lt to prevent bugginess when dropping a ! or ? to the right
const OENTRANCE = new Item("OENTRANCE", "<b>E</b>", "the dungeon entrance", false);
const OHOMEENTRANCE = new Item("OHOMEENTRANCE", OEMPTY.char, "exit to home level", false);
const OVOLUP = new Item("OVOLUP", "<b>V</b>", "the base of a volcanic shaft", false);
const OVOLDOWN = new Item("OVOLDOWN", "<b>V</b>", "a volcanic shaft leaning downward", false);
const OPIT = new Item("OPIT", "<b>P</b>", "a pit", false);
const OMIRROR = new Item("MIRROR", "<b>M</b>", "a mirror", false);
const OSTATUE = new Item("OSTATUE", "<b>&</b>", "a great marble statue", false);

const OGOLDPILE = new Item("OGOLDPILE", "<b>*</b>", "some gold", true, 0);
const OPOTION = new Item("OPOTION", "<b>!</b>", "a magic potion", true);
const OSCROLL = new Item("OSCROLL", "<b>?</b>", "a magic scroll", true);

const ODAGGER = new Item("ODAGGER", "<b>(</b>", "a dagger", true);
const OBELT = new Item("OBELT", "<b>{</b>", "a belt of striking", true);
const OSPEAR = new Item("OSPEAR", "<b>(</b>", "a spear", true);
const OFLAIL = new Item("OFLAIL", "<b>(</b>", "a flail", true);
const OBATTLEAXE = new Item("OBATTLEAXE", "<b>)</b>", "a battle axe", true);
const OLANCE = new Item("OLANCE", "<b>)</b>", "a lance of death", true);
const OLONGSWORD = new Item("OLONGSWORD", "<b>)</b>", "a longsword", true);
const O2SWORD = new Item("O2SWORD", "<b>(</b>", "a two handed sword", true);
const OSWORD = new Item("OSWORD", "<b>)</b>", "a sunsword", true);
const OSWORDofSLASHING = new Item("OSWORDofSLASHING", "<b>)</b>", "a sword of slashing", true);
const OHAMMER = new Item("OHAMMER", "<b>)</b>", "Bessman's flailing hammer", true);

const OSHIELD = new Item("OSHIELD", "<b>[</b>", "a shield", true);
const OLEATHER = new Item("OLEATHER", "<b>[</b>", "leather armor", true);
const OSTUDLEATHER = new Item("OSTUDLEATHER", "<b>[</b>", "studded leather armor", true);
const ORING = new Item("ORING", "<b>[</b>", "ring mail", true);
const OCHAIN = new Item("OCHAIN", "<b>[</b>", "chain mail", true);
const OSPLINT = new Item("OSPLINT", "<b>]</b>", "splint mail", true);
const OPLATE = new Item("OPLATE", "<b>]</b>", "plate mail", true);
const OPLATEARMOR = new Item("OPLATEARMOR", "<b>]</b>", "plate armor", true);
const OSSPLATE = new Item("OSSPLATE", "<b>]</b>", "stainless plate armor", true);

const OCLOSEDDOOR = new Item("OCLOSEDDOOR", "<b>D</b>", "a closed door", false);
const OOPENDOOR = new Item("OOPENDOOR", "<b>O</b>", "an open door", false);
const OALTAR = new Item("OALTAR", "<b>A</b>", "a holy altar", false);
const OTRAPARROWIV = new Item("OTRAPARROWIV", ".", "an arrow trap", false);
const OIVTELETRAP = new Item("OIVTELETRAP", ".", "a teleport trap", false);
const OIVDARTRAP = new Item("OIVDARTRAP", ".", "a dart trap", false);
const OIVTRAPDOOR = new Item("OIVTRAPDOOR", ".", "a trap door", false);
const OTRAPDOOR = new Item("OIVTRAPDOOR", "<b>^</b>", "a trap door", false);

const OLARNEYE = new Item("OLARNEYE", "<b>~</b>", "The Eye of Larn", true);
const ODIAMOND = new Item("ODIAMOND", "<b>@</b>", "a brilliant diamond", true);
const ORUBY = new Item("ORUBY", "<b>@</b>", "a ruby", true);
const OEMERALD = new Item("OEMERALD", "<b>@</b>", "an enchanting emerald", true);
const OSAPPHIRE = new Item("OSAPPHIRE", "<b>@</b>", "a sparkling sapphire", true);

const OTHRONE = new Item("OTHRONE", "<b>T</b>", "a handsome jewel encrusted throne", false);
const ODEADTHRONE = new Item("ODEADTHRONE", "<b>t</b>", "a massive throne", false);

const OFOUNTAIN = new Item("OFOUNTAIN", "<b>F</b>", "a bubbling fountain", false);
const ODEADFOUNTAIN = new Item("ODEADFOUNTAIN", "<b>f</b>", "a dead fountain", false);

const OSCHOOL = new Item("OSCHOOL", "<b>+</b>", "the college of Larn", false);
const ODNDSTORE = new Item("ODNDSTORE", "<b>=</b>", "the DND store", false);
const OBANK2 = new Item("OBANK2", "<b>$</b>", "the 5th branch of the Bank of Larn", false);
const OBANK = new Item("OBANK", "<b>$</b>", "the bank of Larn", false);
const OHOME = new Item("OHOME", "<b>H</b>", "your home", false);
const OLRS = new Item("OLRS", "<b>L</b>", "the Larn Revenue Service", false);
const OTRADEPOST = new Item("OTRADEPOST", "<b>S</b>", "the local trading post", false);

const OPROTRING = new Item("OPROTRING", "<b>=</b>", "a ring of protection", true);
const OSTRRING = new Item("OSTRRING", "<b>=</b>", "a ring of strength", true);
const ODEXRING = new Item("ODEXRING", "<b>=</b>", "a ring of dexterity", true);
const OCLEVERRING = new Item("OCLEVERRING", "<b>=</b>", "a ring of cleverness", true);
const OENERGYRING = new Item("OENERGYRING", "<b>=</b>", "an energy ring", true);
const ODAMRING = new Item("ODAMRING", "<b>=</b>", "a ring of increase damage", true);
const OREGENRING = new Item("OREGENRING", "<b>=</b>", "a ring of regeneration", true);
const ORINGOFEXTRA = new Item("ORINGOFEXTRA", "<b>=</b>", "ring of extra regeneration", true);
const OAMULET = new Item("OAMULET", "<b>}</b>", "an amulet of invisibility", true);
const OORBOFDRAGON = new Item("OORBOFDRAGON", "<b>o</b>", "an orb of dragon slaying", true);
const OSPIRITSCARAB = new Item("OSPIRITSCARAB", "<b>:</b>", "a scarab of negate spirit", true);
const OCUBEofUNDEAD = new Item("OCUBEofUNDEAD", "<b>;</b>", "a cube of undead control", true);
const ONOTHEFT = new Item("ONOTHEFT", "<b>,</b>", "device of theft prevention", true);
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

    toString: function(in_store) {
      var description = this.desc;
      if (this.matches(OPOTION)) {
        if (isKnownPotion(this) || in_store || DEBUG_KNOW_ALL) {
          description += " of " + potionname[this.arg];
        }
      }
      //
      else if (this.matches(OSCROLL)) {
        if (isKnownScroll(this) || in_store || DEBUG_KNOW_ALL) {
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
        (this.isRing() && in_store) ||
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
      }
      if ((this === player.WEAR || this === player.SHIELD) && !in_store) {
        description += " (being worn)"
      }
      if (this === player.WIELD && !in_store) {
        description += " (weapon in hand)"
      }
      return description;
    },

    // we can wield more things than we show during wield inventory check
    // this is everything that a player can actually wield
    canWield: function() {
      switch (this.id) {
        case OPOTION.id:
        case OSCROLL.id:
          return false;
          break;
      };
      return this.carry;
    },


    // we can wield more things than we show during wield inventory check
    // this is what we show during an inventory check while wielding
    isWeapon: function() {
      switch (this.id) {
        case ODIAMOND.id:
        case ORUBY.id:
        case OEMERALD.id:
        case OSAPPHIRE.id:
        case OBOOK.id:
        case OCHEST.id:
        case OLARNEYE.id:
        case ONOTHEFT.id:
        case OSPIRITSCARAB.id:
        case OCUBEofUNDEAD.id:
        case OPOTION.id:
        case OSCROLL.id:
          return false;
          break;
      };
      return this.carry;
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



function getItemDir(direction) {
  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];
  return getItem(x, y);
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

  showcell(player.x, player.y);

  var item = player.level.items[player.x][player.y];

  if (item.matches(OEMPTY)) {
    // do nothing
    return;
  }
  //
  else if (item.matches(OGOLDPILE)) {
    updateLog(`You have found some gold!`);
    updateLog(`  It is worth ${item.arg}!`);
    player.GOLD += item.arg;
    forget();
  }
  //
  else if (item.matches(OALTAR)) {
    if (nearbymonst())
      return;
    if (do_ident) {
      updateLog("There is a Holy Altar here!");
      //updateLog("Do you (p) pray (d) desecrate, or (i) ignore it?");
    }
    if (do_action) {
      //blocking_callback = oaltar;
    }
  }
  //
  else if (item.matches(OTHRONE)) {
    if (nearbymonst())
      return;
    if (do_ident) {
      updateLog(`There is ${item} here!`);
    }
    if (do_action) {
      //non_blocking_callback = othrone;
    }
  }
  //
  else if (item.matches(ODEADTHRONE)) {
    if (nearbymonst())
      return;
    if (do_ident) {
      updateLog(`There is ${item} here!`);
    }
    if (do_action) {
      //non_blocking_callback = othrone;
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
  else if (item.matches(OCHEST)) {
    if (nearbymonst())
      return;
    if (do_ident)
      updateLog("There is a chest here");
  }
  // base case
  else {
    if (do_ident) {
      if (item.carry) {
        updateLog(`You have found ${item}`);
      } else if (!item.matches(OWALL)) {
        updateLog(`You have found ${item}`);
      }
    }
  }

} // lookforobject



function opit() {
  if (rnd(101) >= 81) {
    return;
  }
  if (rnd(70) <= 9 * player.DEXTERITY - packweight() && rnd(101) >= 5) {
    return;
  }
  if (player.level.depth == 10 || player.level.depth >= 13) {
    obottomless();
  } else {
    var damage = 0;
    if (rnd(101) < 20) {
      updateLog("You fell into a pit! Your fall is cushioned by an unknown force");
    } else {
      damage = rnd(player.level.depth * 3 + 3);
      updateLog(`You fell into a pit! You suffer ${damage} hit points damage`);
      lastnum = 261;
      /* if hero dies scoreboard will say so */
    }
    player.losehp(damage);
    nap(2000);
    newcavelevel(player.level.depth + 1);
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
  updateLog(`Spell \"${spelcode[i]}\": ${spelname[i]}`);
  updateLog(`  ${speldescript[i]}`);
  if (rnd(10) == 4) {
    updateLog("  Your int went up by one!");
    player.INTELLIGENCE++;
    bottomline();
  }
}



/* function to adjust time when time warping and taking courses in school */
function adjtime(tim) {
  player.HASTESELF = player.HASTESELF > 0 ? Math.max(1, player.HASTESELF - tim) : 0;
  player.HERO = player.HERO > 0 ? Math.max(1, player.HERO - tim) : 0;
  player.ALTPRO = player.ALTPRO > 0 ? Math.max(1, player.ALTPRO - tim) : 0;
  player.PROTECTIONTIME = player.PROTECTIONTIME > 0 ? Math.max(1, player.PROTECTIONTIME - tim) : 0;
  player.DEXCOUNT = player.DEXCOUNT > 0 ? Math.max(1, player.DEXCOUNT - tim) : 0;
  player.STRCOUNT = player.STRCOUNT > 0 ? Math.max(1, player.STRCOUNT - tim) : 0;
  player.GIANTSTR = player.GIANTSTR > 0 ? Math.max(1, player.GIANTSTR - tim) : 0;
  player.CHARMCOUNT = player.CHARMCOUNT > 0 ? Math.max(1, player.CHARMCOUNT - tim) : 0;
  player.INVISIBILITY = player.INVISIBILITY > 0 ? Math.max(1, player.INVISIBILITY - tim) : 0;
  player.CANCELLATION = player.CANCELLATION > 0 ? Math.max(1, player.CANCELLATION - tim) : 0;
  player.HASTESELF = player.HASTESELF > 0 ? Math.max(1, player.HASTESELF - tim) : 0;
  player.AGGRAVATE = player.AGGRAVATE > 0 ? Math.max(1, player.AGGRAVATE - tim) : 0;
  player.SCAREMONST = player.SCAREMONST > 0 ? Math.max(1, player.SCAREMONST - tim) : 0;
  player.STEALTH = player.STEALTH > 0 ? Math.max(1, player.STEALTH - tim) : 0;
  player.AWARENESS = player.AWARENESS > 0 ? Math.max(1, player.AWARENESS - tim) : 0;
  player.HOLDMONST = player.HOLDMONST > 0 ? Math.max(1, player.HOLDMONST - tim) : 0;
  player.HASTEMONST = player.HASTEMONST > 0 ? Math.max(1, player.HASTEMONST - tim) : 0;
  player.FIRERESISTANCE = player.FIRERESISTANCE > 0 ? Math.max(1, player.FIRERESISTANCE - tim) : 0;
  player.GLOBE = player.GLOBE > 0 ? Math.max(1, player.GLOBE - tim) : 0;
  player.SPIRITPRO = player.SPIRITPRO > 0 ? Math.max(1, player.SPIRITPRO - tim) : 0;
  player.UNDEADPRO = player.UNDEADPRO > 0 ? Math.max(1, player.UNDEADPRO - tim) : 0;
  player.HALFDAM = player.HALFDAM > 0 ? Math.max(1, player.HALFDAM - tim) : 0;
  player.SEEINVISIBLE = player.SEEINVISIBLE > 0 ? Math.max(1, player.SEEINVISIBLE - tim) : 0;
  player.ITCHING = player.ITCHING > 0 ? Math.max(1, player.ITCHING - tim) : 0;
  player.CLUMSINESS = player.CLUMSINESS > 0 ? Math.max(1, player.CLUMSINESS - tim) : 0;
  player.WTW = player.WTW > 0 ? Math.max(1, player.WTW - tim) : 0;

  regen();
}
