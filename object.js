"use strict";

const OEMPTY = new Item(0, "·", "empty space", false); // http://www.fileformat.info/info/unicode/char/00b7/index.htm
const OHOMEENTRANCE = new Item(-1, OEMPTY.char, "exit to home level", false);
const OALTAR = new Item(1, "<b>A</b>", "a holy altar", false);
const OTHRONE = new Item(2, "<b>T</b>", "a handsome jewel encrusted throne", false);
//#define OORB 3
const OPIT = new Item(4, "<b>P</b>", "a pit", false);
const OSTAIRSUP = new Item(5, "<b>&lt</b>", "a staircase going up", false); // use &lt to prevent bugginess when dropping a ! or ? to the right
//#define OELEVATORUP 6
const OFOUNTAIN = new Item(7, "<b>F</b>", "a bubbling fountain", false);
const OSTATUE = new Item(8, "<b>&</b>", "a great marble statue", false);
const OTELEPORTER = new Item(9, "<b>^</b>", "a teleport trap", false);
const OSCHOOL = new Item(10, "<b>+</b>", "the college of Larn", false);
const OMIRROR = new Item(11, "<b>M</b>", "a mirror", false);
const ODNDSTORE = new Item(12, "<b>=</b>", "the DND store", false);
const OSTAIRSDOWN = new Item(13, "<b>&gt</b>", "a staircase going down", false);
//#define OELEVATORDOWN 14
const OBANK2 = new Item(15, "<b>$</b>", "the 5th branch of the Bank of Larn", false);
const OBANK = new Item(16, "<b>$</b>", "the bank of Larn", false);
const ODEADFOUNTAIN = new Item(17, "<b>f</b>", "a dead fountain", false);
const OGOLDPILE = new Item(18, "<b>*</b>", "some gold", true, 0);
const OOPENDOOR = new Item(19, "<b>O</b>", "an open door", false);
const OCLOSEDDOOR = new Item(20, "<b>D</b>", "a closed door", false);
const OWALL = new Item(21, "▒", "a wall", false);
const OLARNEYE = new Item(22, "<b>~</b>", "The Eye of Larn", true);
const OPLATE = new Item(23, "<b>]</b>", "plate mail", true);
const OCHAIN = new Item(24, "<b>[</b>", "chain mail", true);
const OLEATHER = new Item(25, "<b>[</b>", "leather armor", true);
const OSWORDofSLASHING = new Item(26, "<b>)</b>", "a sword of slashing", true);
const OHAMMER = new Item(27, "<b>)</b>", "Bessman's flailing hammer", true);
const OSWORD = new Item(28, "<b>)</b>", "a sunsword", true);
const O2SWORD = new Item(29, "<b>(</b>", "a two handed sword", true);
const OSPEAR = new Item(30, "<b>(</b>", "a spear", true);
const ODAGGER = new Item(31, "<b>(</b>", "a dagger", true);
const ORINGOFEXTRA = new Item(32, "<b>=</b>", "ring of extra regeneration", true);
const OREGENRING = new Item(33, "<b>=</b>", "a ring of regeneration", true);
const OPROTRING = new Item(34, "<b>=</b>", "a ring of protection", true);
const OENERGYRING = new Item(35, "<b>=</b>", "an energy ring", true);
const ODEXRING = new Item(36, "<b>=</b>", "a ring of dexterity", true);
const OSTRRING = new Item(37, "<b>=</b>", "a ring of strength", true);
const OCLEVERRING = new Item(38, "<b>=</b>", "a ring of cleverness", true);
const ODAMRING = new Item(39, "<b>=</b>", "a ring of increase damage", true);
const OBELT = new Item(40, "<b>{</b>", "a belt of striking", true);
const OSCROLL = new Item(41, "<b>?</b>", "a magic scroll", true);
const OPOTION = new Item(42, "<b>!</b>", "a magic potion", true);
const OBOOK = new Item(43, "<b>B</b>", "a book", true);
const OCHEST = new Item(44, "<b>C</b>", "a chest", true);
const OAMULET = new Item(45, "<b>}</b>", "an amulet of invisibility", true);
const OORBOFDRAGON = new Item(46, "<b>o</b>", "an orb of dragon slaying", true);
const OSPIRITSCARAB = new Item(47, "<b>:</b>", "a scarab of negate spirit", true);
const OCUBEofUNDEAD = new Item(48, "<b>;</b>", "a cube of undead control", true);
const ONOTHEFT = new Item(49, "<b>,</b>", "device of theft prevention", true);
const ODIAMOND = new Item(50, "<b>@</b>", "a brilliant diamond", true);
const ORUBY = new Item(51, "<b>@</b>", "a ruby", true);
const OEMERALD = new Item(52, "<b>@</b>", "an enchanting emerald", true);
const OSAPPHIRE = new Item(53, "<b>@</b>", "a sparkling sapphire", true);
const OENTRANCE = new Item(54, "<b>E</b>", "the dungeon entrance", false);
const OVOLDOWN = new Item(55, "<b>V</b>", "a volcanic shaft leaning downward", false);
const OVOLUP = new Item(56, "<b>V</b>", "the base of a volcanic shaft", false);
const OBATTLEAXE = new Item(57, "<b>)</b>", "a battle axe", true);
const OLONGSWORD = new Item(58, "<b>)</b>", "a longsword", true);
const OFLAIL = new Item(59, "<b>(</b>", "a flail", true);
const ORING = new Item(60, "<b>[</b>", "ring mail", true);
const OSTUDLEATHER = new Item(61, "<b>[</b>", "studded leather armor", true);
const OSPLINT = new Item(62, "<b>]</b>", "splint mail", true);
const OPLATEARMOR = new Item(63, "<b>]</b>", "plate armor", true);
const OSSPLATE = new Item(64, "<b>]</b>", "stainless plate armor", true);
const OLANCE = new Item(65, "<b>)</b>", "a lance of death", true);
const OTRAPARROW = new Item(66, "<b>^</b>", "an arrow trap", false);
const OTRAPARROWIV = new Item(67, OEMPTY.char, "an arrow trap", false);
const OSHIELD = new Item(68, "<b>[</b>", "a shield", true);
const OHOME = new Item(69, "<b>H</b>", "your home", false);
//#define OMAXGOLD 70
//#define OKGOLD 71
//#define ODGOLD 72
const OIVDARTRAP = new Item(73, OEMPTY.char, "a dart trap", false);
const ODARTRAP = new Item(74, "<b>^</b>", "a dart trap", false);
const OTRAPDOOR = new Item(75, "<b>^</b>", "a trapdoor", false);
const OIVTRAPDOOR = new Item(76, OEMPTY.char, "a trapdoor", false);
const OTRADEPOST = new Item(77, "<b>S</b>", "the local trading post", false);
const OIVTELETRAP = new Item(78, OEMPTY.char, "a teleport trap", false);
const ODEADTHRONE = new Item(79, "<b>t</b>", "a massive throne", false);
const OLRS = new Item(80, "<b>L</b>", "the Larn Revenue Service", false);
//#define OTHRONE2 81
const OANNIHILATION = new Item(82, "<b>s</b>", "a sphere of annihilation", false);
const OCOOKIE = new Item(83, "<b>c</b>", "a fortune cookie", true);
//#define OURN 84
//#define OBRASSLAMP 85
//#define OHANDofFEAR 86      /* hand of fear */
//#define OSPHTAILSMAN 87     /* tailsman of the sphere */
//#define OWWAND 88           /* wand of wonder */
//#define OPSTAFF 89          /* staff of power */
//#define OVORPAL 90
//#define OSLAYER 91
//#define OELVENCHAIN 92



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



function createObject(item, arg) {

  if (!item) return null;

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
    return;
  }
  //
  else if (item.matches(OALTAR)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog("There is a Holy Altar here!");
  }
  //
  else if (item.matches(OTHRONE) || item.matches(ODEADTHRONE)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`There is ${item} here!`);
  }
  //
  else if (item.matches(OPIT)) {
    updateLog("You're standing at the top of a pit");
    opit();
  }
  //
  else if (item.matches(OMIRROR)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog("There is a mirror here");
  }
  //
  else if (item.matches(OFOUNTAIN)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog("There is a fountain here");
  }
  //
  else if (item.matches(ODEADFOUNTAIN)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog("There is a dead fountain here");
  }
  //
  else if (item.matches(ODNDSTORE)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog("There is a DND store here");
  }
  //
  else if (item.matches(OBANK) || item.matches(OBANK2)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog(`You have found ${item}`);
  }
  //
  else if (item.matches(OSTATUE)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog("You are standing in front of a statue");
  }
  //
  else if (item.matches(OCHEST)) {
    if (nearbymonst()) return;
    if (do_ident) updateLog("There is a chest here");
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
    updateLog("Zaaaappp!  You've been teleported!");
    nap(2000);
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
    updateLog("You are hit by an arrow");
    lastnum = 259;
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
    updateLog("You are hit by a dart");
    lastnum = 260;
    player.losehp(rnd(5));
    if ((--player.STRENGTH) < 3)
      player.STRENGTH = 3;
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
    lastnum = 272; /* a trap door */
    if ((level == MAXLEVEL - 1) || (level == MAXLEVEL + MAXVLEVEL - 1)) {
      updateLog("You fell through a bottomless trap door!");
      nap(2000);
      died(271, false);
    }
    var dmg = rnd(5 + level);
    updateLog(`You fall through a trap door!  You lose ${dmg} hit points`);
    player.losehp(dmg);
    nap(2000);
    newcavelevel(level + 1);
    return;
  }
  //
  else if (item.matches(OANNIHILATION)) {
    updateLog("You have been enveloped by the zone of nothingness!");
    died(283, false); /* annihilated by sphere of annihilation */
    return;
  }

  // base case
  else {
    if (do_ident && !item.matches(OWALL)) {
      updateLog(`You have found ${item}`);
    }
  }

  if (do_pickup && item.carry) {
    if (take(item)) {
      forget(); // remove from board
    } else {
      nomove = 1;
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
  if (level == 10 || level >= 13) {
    obottomless();
  } else {
    var damage = 0;
    if (rnd(101) < 20) {
      updateLog("You fell into a pit! Your fall is cushioned by an unknown force");
    } else {
      damage = rnd(level * 3 + 3);
      updateLog(`You fell into a pit! You suffer ${damage} hit points damage`);
      lastnum = 261;
      /* if hero dies scoreboard will say so */
    }
    player.losehp(damage);
    nap(2000);
    newcavelevel(level + 1);
  }
}



function obottomless() {
  updateLog("You fell into a bottomless pit!");
  beep();
  nap(3000);
  died(262, false);
}



function forget() {
  player.level.items[player.x][player.y] = createObject(OEMPTY);
}



/*
 * subroutine to handle a teleport trap +/- 1 level maximum
 */
function oteleport(err) {
  var tmp;
  if (err) {
    if (rnd(151) < 3) {
      updateLog("You are trapped in solid rock!")
      died(264, false); /* stuck in a rock */
    }
  }
  player.TELEFLAG = 1; /* show ?? on bottomline if been teleported    */
  if (level == 0)
    tmp = 0;
  else
  if (level < MAXLEVEL) {
    tmp = rnd(5) + level - 3;
    if (tmp >= MAXLEVEL)
      tmp = MAXLEVEL - 1;
    if (tmp < 1)
      tmp = 1;
  } else {
    tmp = rnd(3) + level - 2;
    if (tmp >= MAXLEVEL + MAXVLEVEL)
      tmp = MAXLEVEL + MAXVLEVEL - 1;
    if (tmp < MAXLEVEL)
      tmp = MAXLEVEL;
  }
  player.x = rnd(MAXX - 2);
  player.y = rnd(MAXY - 2);
  if (level != tmp)
    newcavelevel(tmp);
  positionplayer();
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
  updateLog(`Spell \"<b>${spelcode[i]}</b>\": ${spelname[i]}`);
  updateLog(`  ${speldescript[i]}`);
  if (rnd(10) == 4) {
    updateLog("  Your intelligence went up by one!");
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
