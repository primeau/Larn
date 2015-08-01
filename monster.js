"use strict";

var Monster = function Monster(char, desc, level, armorclass, damage, attack, defence, genocided, intelligence, gold, hitpoints, experience) {
  this.char = char;
  this.desc = desc;
  this.level = level;
  this.armorclass = armorclass;
  this.damage = damage;
  this.attack = attack;
  this.defence = defence;
  this.genocided = genocided;
  this.intelligence = intelligence;
  this.gold = gold;
  this.hitpoints = hitpoints;
  this.experience = experience;
}

function createNewMonster(arg) {
  var tmp = monsterlist[arg];
  var monster = new Monster(tmp.char, tmp.desc, tmp.level,
    tmp.armorclass, tmp.damage, tmp.attack, tmp.defence, tmp.genocided,
    tmp.intelligence, tmp.gold, tmp.hitpoints, tmp.experience);
  monster.arg = arg;
  return monster;
}

Monster.prototype = {
    arg: 0,
    char: "💩",
    desc: null,
    level: 0,
    armorclass: 0,
    damage: 0,
    attack: 0,
    defense: 0,
    genocided: 0,
    intelligence: 0,
    gold: 0,
    hitpoints: 0,
    experience: 0,
    awake: false,
    /*  false=sleeping true=awake monst*/

    matches: function(monsterarg) {
      return this.arg == monsterarg;
    },

    toString: function() {
      if (player.BLINDCOUNT == 0)
        return this.desc;
      else
        return "monster";
    },

    getChar: function() {
      return monsterlist[this.arg].char;
    },

    /*
     *  dropsomething(monst)    Function to create an object when a monster dies
     *      int monst;
     *
     *  Function to create an object near the player when certain monsters are killed
     *  Enter with the monster number
     *  Returns nothing of value.
     */
    dropsomething: function() {
      switch (this.arg) {
        case ORC:
        case NYMPH:
        case ELF:
        case TROGLODYTE:
        case TROLL:
        case ROTHE:
        case VIOLETFUNGI:
        case PLATINUMDRAGON:
        case GNOMEKING:
        case REDDRAGON:
          something(player.level.depth);
          return;

        case LEPRECHAUN:
          if (rnd(101) >= 75) creategem();
          if (rnd(5) == 1) this.dropsomething(LEPRECHAUN);
          return;
      }
    },


  } // monster class




/*
 *  dropgold(amount)    Function to drop some gold around player
 *      int amount;
 *
 *  Enter with the number of gold pieces to drop
 *  Returns nothing of value.
 */
function dropgold(amount) {
  if (amount > 250) {
    amount = Math.round(amount / 100) * 100;
  }
  createitem(OGOLDPILE, amount);
}



/*
 *  Function to create a random item around player
 *
 *  Function to create an item from a designed probability around player
 *  Enter with the cave level on which something is to be dropped
 *  Returns nothing of value.
 */
function something(lv) {
  if (lv < 0 || lv > MAXLEVEL + MAXVLEVEL) return; /* correct level? */
  if (rnd(101) < 8) something(lv); /* possibly more than one item */
  createitem(newobject(lv));
}



/*
 *  Routine to return a randomly selected new object
 *
 *  Routine to return a randomly selected object to be created
 *  Returns the object number created, and sets *i for its argument
 *  Enter with the cave level and a pointer to the items arg
 */
function newobject(lev) {
  var tmp;
  if (lev > 6) tmp = rnd(41);
  else if (lev > 4) tmp = rnd(39);
  else tmp = rnd(33);

  var item = nobjtab[tmp]; /* the object type */
  var arg = 0;

  switch (tmp) {
    case 1:
    case 2:
    case 3:
    case 4:
      arg = newscroll();
      break; /* scroll */
    case 5:
    case 6:
    case 7:
    case 8:
      arg = newpotion();
      break; /* potion */
    case 9:
    case 10:
    case 11:
    case 12:
      arg = rnd((lev + 1) * 10) + lev * 10 + 10;
      break; /* gold */
    case 13:
    case 14:
    case 15:
    case 16:
      arg = lev;
      break; /* book */
    case 17:
    case 18:
    case 19:
      arg = newdagger();
      break; /* dagger */
    case 20:
    case 21:
    case 22:
      arg = newleather();
      break; /* leather armor */
    case 23:
    case 32:
    case 38:
      arg = rund(lev / 3 + 1);
      break; /* regen ring, shield, 2-hand sword */
    case 24:
    case 26:
      arg = rnd(lev / 4 + 1);
      break; /* prot ring, dexterity ring */
    case 25:
      arg = rund(lev / 4 + 1);
      break; /* energy ring */
    case 27:
    case 39:
      arg = rnd(lev / 2 + 1);
      break; /* strength ring, cleverness ring */
    case 30:
    case 34:
      arg = rund(lev / 2 + 1);
      break; /* ring mail, flail */
    case 28:
    case 36:
      arg = rund(lev / 3 + 1);
      break; /* spear, battleaxe */
    case 29:
    case 31:
    case 37:
      arg = rund(lev / 2 + 1);
      break; /* belt, studded leather, splint */
    case 33:
      arg = 0;
      break; /* fortune cookie */
    case 35:
      arg = newchain();
      break; /* chain mail */
    case 40:
      arg = newplate();
      break; /* plate mail */
    case 41:
      arg = newsword();
      break; /* longsword */
  }
  return createObject(item, arg);
}



const nobjtab = [
  0,
  OSCROLL, OSCROLL, OSCROLL, OSCROLL, /* 1 - 4 */
  OPOTION, OPOTION, OPOTION, OPOTION, /* 5 - 8 */
  OGOLDPILE, OGOLDPILE, OGOLDPILE, OGOLDPILE, /* 9 - 12 */
  OBOOK, OBOOK, OBOOK, OBOOK, /* 13 - 16 */
  ODAGGER, ODAGGER, ODAGGER, /* 17 - 19 */
  OLEATHER, OLEATHER, OLEATHER, /* 20 - 22 */
  OREGENRING, /* 23 */
  OPROTRING, /* 24 */
  OENERGYRING, /* 25 */
  ODEXRING, /* 26 */
  OSTRRING, /* 27 */
  OSPEAR, /* 28 */
  OBELT, /* 29 */
  ORING, /* 30 */
  OSTUDLEATHER, /* 31 */
  OSHIELD, /* 32 */
  OCOOKIE, /* 33 */
  OFLAIL, /* 34 */
  OCHAIN, /* 35 */
  OBATTLEAXE, /* 36 */
  OSPLINT, /* 37 */
  O2SWORD, /* 38 */
  OCLEVERRING, /* 39 */
  OPLATE, /* 40 */
  OLONGSWORD /* 41 */
];



const nlpts = [0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7];
const nch = [0, 0, 0, 1, 1, 1, 2, 2, 3, 4];
const nplt = [0, 0, 0, 0, 1, 1, 2, 2, 3, 4];
const ndgg = [0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 4, 5];
const nsw = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 3];



/* macro to create scroll #'s with probability of occurrence */
function newscroll() {
  return (scprob[rund(81)]);
}
/* macro to return a potion # created with probability of occurrence */
function newpotion() {
  return (potprob[rund(41)]);
}
/* macro to return the + points on created leather armor */
function newleather() {
  return (nlpts[rund(player.HARDGAME ? 13 : 15)]);
}
/* macro to return the + points on chain armor */
function newchain() {
  return (nch[rund(10)]);
}
/* macro to return + points on plate armor */
function newplate() {
  return (nplt[rund(player.HARDGAME ? 4 : 12)]);
}
/* macro to return + points on new daggers */
function newdagger() {
  return (ndgg[rund(13)]);
}
/* macro to return + points on new swords */
function newsword() {
  return (nsw[rund(player.HARDGAME ? 6 : 13)]);
}



function monsterAt(x, y) {
  if (x == null || y == null) {
    return null;
  }
  if (x < 0 || x >= MAXX) {
    return null;
  }
  if (y < 0 || y >= MAXY) {
    return null;
  }
  var monster = player.level.monsters[x][y];
  return monster;
}



function getMonster(direction) {
  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];
  return monsterAt(x, y);
}



/*
 *  createmonster(monstno)      Function to create a monster next to the player
 *      int monstno;
 *
 *  Enter with the monster number (1 to MAXMONST+8)
 *  Returns no value.
 */
function createmonster(mon, x, y) {
  if (mon < 1 || mon > monsterlist.length - 1) /* check for monster number out of bounds */ {
    beep();
    updateLog(`can't createmonst ${mon}`);
    nap(3000);
    return;
  }
  while (monsterlist[mon].genocided && mon < monsterlist.length - 1) mon++; /* genocided? */

  // JRP force creation and use exact co-ordinates if they are given
  var oktocreate = (x != null && y != null && cgood(x, y, 0, 1));
  var i = oktocreate ? 0 : -8;

  for (var k = rnd(8); i < 0; i++, k++) { /* choose direction, then try all */
    if (k > 8) k = 1; /* wraparound the diroff arrays */
    x = player.x + diroffx[k];
    y = player.y + diroffy[k];
    if (cgood(x, y, 0, 1)) /* if we can create here */ {
      oktocreate = true;
      i = 0;
    }
  }

  if (oktocreate) {
    var monster = createNewMonster(mon);
    player.level.monsters[x][y] = monster;
    debug("createmonster: " + mon + " " + monsterlist[mon]);
    //hitp[x][y] = monster[mon].hitpoints;
    player.level.know[x][y] &= ~KNOWHERE;
    monster.awake = false;
    switch (mon) {
      case ROTHE:
      case POLTERGEIST:
      case VAMPIRE:
        monster.awake = true;
    };
  }
}



/*
 *  int cgood(x,y,itm,monst)      Function to check location for emptiness
 *      int x,y,itm,monst;
 *
 *  Routine to return TRUE if a location does not have itm or monst there
 *  returns FALSE (0) otherwise
 *  Enter with itm or monst TRUE or FALSE if checking it
 *  Example:  if itm==TRUE check for no item at this location
 *            if monst==TRUE check for no monster at this location
 *  This routine will return FALSE if at a wall,door or the dungeon exit
 *  on level 1
 */
function cgood(x, y, itm, monst) {
  var item = getItem(x, y);
  var monster = monsterAt(x, y);

  /* cannot create either monster or item if:
     - out of bounds
     - wall
     - closed door
     - dungeon entrance
  */
  if (((y < 0) || (y > MAXY - 1) || (x < 0) || (x > MAXX - 1)) ||
    (item.matches(OWALL)) ||
    (item.matches(OCLOSEDDOOR)) ||
    (item.matches(OENTRANCE))) return (false);

  /* if checking for an item, return False if one there already
   */
  if (itm && !item.matches(OEMPTY))
    return (false);

  /* if checking for a monster, return False if one there already _or_
     there is a pit/trap there.
  */
  if (monst) {
    if (monsterAt(x, y) != null) {
      return (false);
    }
    switch (getItem(x, y).id) {
      /* note: not invisible traps, since monsters are not affected
         by them.
      */
      case OPIT.id:
        // case OANNIHILATION.id:
        // case OTELEPORTER.id:
        // case OTRAPARROW.id:
        // case ODARTRAP.id:
        // case OTRAPDOOR.id:          return (false);
        break;
      default:
        break;
    };
  }
  return (true);
}



/*
 *  createitem(it,arg)      Routine to place an item next to the player
 *      int it,arg;
 *
 *  Enter with the item number and its argument (iven[], ivenarg[])
 *  Returns no value, thus we don't know about createitem() failures.
 */
function createitem(it, arg) {
  var x, y, k, i;
  //if (it >= MAXOBJ) return; /* no such object */
  for (k = rnd(8), i = -8; i < 0; i++, k++) /* choose direction, then try all */ {
    if (k > 8) k = 1; /* wraparound the diroff arrays */
    x = player.x + diroffx[k];
    y = player.y + diroffy[k];
    if (cgood(x, y, 1, 0)) /* if we can create here */ {
      player.level.items[x][y] = createObject(it, arg);
      //know[x][y] = 0;
      return;
    }
  }
}


/*
 *  for the monster data
 *
 *  array to do rnd() to create monsters <= a given level
 */
const monstlevel = [5, 11, 17, 22, 27, 33, 39, 42, 46, 50, 53, 56, 59];

const monsterlist = [
  /*         CHAR  NAME LV AC DAM ATT DEF GEN INT GOLD HP EXP
  --------------------------------------------------------------------- */
  // 0
  new Monster(" ", " ", 0, 0, 0, 0, 0, 0, 3, 0, 0, 0),
  new Monster("B", "bat", 1, 0, 1, 0, 0, 0, 3, 0, 1, 1),
  new Monster("G", "gnome", 1, 10, 1, 0, 0, 0, 8, 30, 2, 2),
  new Monster("H", "hobgoblin", 1, 14, 2, 0, 0, 0, 5, 25, 3, 2),
  new Monster("J", "jackal", 1, 17, 1, 0, 0, 0, 4, 0, 1, 1),
  new Monster("K", "kobold", 1, 20, 1, 0, 0, 0, 7, 10, 1, 1),
  // 6
  new Monster("O", "orc", 2, 12, 1, 0, 0, 0, 9, 40, 4, 2),
  new Monster("S", "snake", 2, 15, 1, 0, 0, 0, 3, 0, 3, 1),
  new Monster("c", "giant centipede", 2, 14, 0, 4, 0, 0, 3, 0, 1, 2),
  new Monster("j", "jaculi", 2, 20, 1, 0, 0, 0, 3, 0, 2, 1),
  new Monster("t", "troglodyte", 2, 10, 2, 0, 0, 0, 5, 80, 4, 3),
  new Monster("A", "giant ant", 2, 8, 1, 4, 0, 0, 4, 0, 5, 5),
  // 12
  new Monster("E", "floating eye", 3, 8, 1, 0, 0, 0, 3, 0, 5, 2),
  new Monster("L", "leprechaun", 3, 3, 0, 8, 0, 0, 3, 1500, 13, 45),
  new Monster("N", "nymph", 3, 3, 0, 14, 0, 0, 9, 0, 18, 45),
  new Monster("Q", "quasit", 3, 5, 3, 0, 0, 0, 3, 0, 10, 15),
  new Monster("R", "rust monster", 3, 4, 0, 1, 0, 0, 3, 0, 18, 25),
  new Monster("Z", "zombie", 3, 12, 2, 0, 0, 0, 3, 0, 6, 7),
  // 18
  new Monster("a", "assassin bug", 4, 9, 3, 0, 0, 0, 3, 0, 20, 15),
  new Monster("b", "bugbear", 4, 5, 4, 15, 0, 0, 5, 40, 20, 35),
  new Monster("h", "hell hound", 4, 5, 2, 2, 0, 0, 6, 0, 16, 35),
  new Monster("i", "ice lizard", 4, 11, 2, 10, 0, 0, 6, 50, 16, 25),
  new Monster("C", "centaur", 4, 6, 4, 0, 0, 0, 10, 40, 24, 45),
  // 23
  new Monster("T", "troll", 5, 4, 5, 0, 0, 0, 9, 80, 50, 300),
  new Monster("Y", "yeti", 5, 6, 4, 0, 0, 0, 5, 50, 35, 100),
  new Monster("d", "white dragon", 5, 2, 4, 5, 0, 0, 16, 500, 55, 1000),
  new Monster("e", "elf", 5, 8, 1, 0, 0, 0, 15, 50, 22, 35),
  new Monster("g", "gelatinous cube", 5, 9, 1, 0, 0, 0, 3, 0, 22, 45),
  // 28
  new Monster("m", "metamorph", 6, 7, 3, 0, 0, 0, 3, 0, 30, 40),
  new Monster("v", "vortex", 6, 4, 3, 0, 0, 0, 3, 0, 30, 55),
  new Monster("z", "ziller", 6, 15, 3, 0, 0, 0, 3, 0, 30, 35),
  new Monster("F", "violet fungi", 6, 12, 3, 0, 0, 0, 3, 0, 38, 100),
  new Monster("W", "wraith", 6, 3, 1, 6, 0, 0, 3, 0, 30, 325),
  new Monster("f", "forvalaka", 6, 2, 5, 0, 0, 0, 7, 0, 50, 280),
  // 34
  new Monster("l", "lawless", 7, 7, 3, 0, 0, 0, 6, 0, 35, 80),
  new Monster("o", "osequip", 7, 4, 3, 16, 0, 0, 4, 0, 35, 100),
  new Monster("r", "rothe", 7, 15, 5, 0, 0, 0, 3, 100, 50, 250),
  new Monster("X", "xorn", 7, 0, 6, 0, 0, 0, 13, 0, 60, 300),
  new Monster("V", "vampire", 7, 3, 4, 6, 0, 0, 17, 0, 50, 1000),
  new Monster(OEMPTY.char, "invisible stalker", 7, 3, 6, 0, 0, 0, 5, 0, 50, 350),
  // 40
  new Monster("p", "poltergeist", 8, 1, 4, 0, 0, 0, 3, 0, 50, 450),
  new Monster("q", "disenchantress", 8, 3, 0, 9, 0, 0, 3, 0, 50, 500),
  new Monster("s", "shambling mound", 8, 2, 5, 0, 0, 0, 6, 0, 45, 400),
  new Monster("y", "yellow mold", 8, 12, 4, 0, 0, 0, 3, 0, 35, 250),
  new Monster("U", "umber hulk", 8, 3, 7, 11, 0, 0, 14, 0, 65, 600),
  // 45
  new Monster("k", "gnome king", 9, -1, 10, 0, 0, 0, 18, 2000, 100, 3000),
  new Monster("M", "mimic", 9, 5, 6, 0, 0, 0, 8, 0, 55, 99),
  new Monster("w", "water lord", 9, -10, 15, 7, 0, 0, 20, 0, 150, 15000),
  new Monster("D", "bronze dragon", 9, 2, 9, 3, 0, 0, 16, 300, 80, 4000),
  new Monster("D", "green dragon", 9, 3, 8, 10, 0, 0, 15, 200, 70, 2500),
  new Monster("P", "purple worm", 9, -1, 11, 0, 0, 0, 3, 100, 120, 15000),
  new Monster("x", "xvart", 9, -2, 12, 0, 0, 0, 13, 0, 90, 1000),
  // 52
  new Monster("n", "spirit naga", 10, -20, 12, 12, 0, 0, 23, 0, 95, 20000),
  new Monster("D", "silver dragon", 10, -1, 12, 3, 0, 0, 20, 700, 100, 10000),
  new Monster("D", "platinum dragon", 10, -5, 15, 13, 0, 0, 22, 1000, 130, 24000),
  new Monster("u", "green urchin", 10, -3, 12, 0, 0, 0, 3, 0, 85, 5000),
  new Monster("D", "red dragon", 10, -2, 13, 3, 0, 0, 19, 800, 110, 14000),
  // 57
  new Monster(OEMPTY.char, "type I demon lord", 12, -30, 18, 0, 0, 0, 20, 0, 140, 50000),
  new Monster(OEMPTY.char, "type II demon lord", 13, -30, 18, 0, 0, 0, 21, 0, 160, 75000),
  new Monster(OEMPTY.char, "type III demon lord", 14, -30, 18, 0, 0, 0, 22, 0, 180, 100000),
  new Monster(OEMPTY.char, "type IV demon lord", 15, -35, 20, 0, 0, 0, 23, 0, 200, 125000),
  new Monster(OEMPTY.char, "type V demon lord", 16, -40, 22, 0, 0, 0, 24, 0, 220, 150000),
  new Monster(OEMPTY.char, "type VI demon lord", 17, -45, 24, 0, 0, 0, 25, 0, 240, 175000),
  new Monster(OEMPTY.char, "type VII demon lord", 18, -70, 27, 6, 0, 0, 26, 0, 260, 200000),
  new Monster(OEMPTY.char, "demon prince", 25, -127, 30, 6, 0, 0, 28, 0, 345, 300000)

];

/* defines for the monsters as objects */
const BAT = 1;
const GNOME = 2;
const HOBGOBLIN = 3;
const JACKAL = 4;
const KOBOLD = 5;
const ORC = 6;
const SNAKE = 7;
const CENTIPEDE = 8;
const JACULI = 9;
const TROGLODYTE = 10;
const ANT = 11;
const EYE = 12;
const LEPRECHAUN = 13;
const NYMPH = 14;
const QUASIT = 15;
const RUSTMONSTER = 16;
const ZOMBIE = 17;
const ASSASSINBUG = 18;
const BUGBEAR = 19;
const HELLHOUND = 20;
const ICELIZARD = 21;
const CENTAUR = 22;
const TROLL = 23;
const YETI = 24;
const WHITEDRAGON = 25;
const ELF = 26;
const CUBE = 27;
const METAMORPH = 28;
const VORTEX = 29;
const ZILLER = 30;
const VIOLETFUNGI = 31;
const WRAITH = 32;
const FORVALAKA = 33;
const LAMANOBE = 34;
const OSEQUIP = 35;
const ROTHE = 36;
const XORN = 37;
const VAMPIRE = 38;
const INVISIBLESTALKER = 39;
const POLTERGEIST = 40;
const DISENCHANTRESS = 41;
const SHAMBLINGMOUND = 42;
const YELLOWMOLD = 43;
const UMBERHULK = 44;
const GNOMEKING = 45;
const MIMIC = 46;
const WATERLORD = 47;
const BRONZEDRAGON = 48;
const GREENDRAGON = 49;
const PURPLEWORM = 50;
const XVART = 51;
const SPIRITNAGA = 52;
const SILVERDRAGON = 53;
const PLATINUMDRAGON = 54;
const GREENURCHIN = 55;
const REDDRAGON = 56;
const DEMONLORD = 57;

const DEMONPRINCE = 64;



/*
 *  hitplayer(x,y)      Function for the monster to hit the player from (x,y)
 *      int x,y;
 *
 *  Function for the monster to hit the player with monster at location x,y
 *  Returns nothing of value.
 */
function hitplayer(x, y) {
  //console.trace();
  var monster = player.level.monsters[x][y];
  if ((monster) == null) {
    debug("monster.hitplayer(): no monster at: " + xy(x, y));
    return;
  }

  lastnum = monster;

  /*  spirit naga's and poltergeist's do nothing if scarab of negate spirit   */
  if (player.NEGATESPIRIT || player.SPIRITPRO) {
    if (monster.matches(POLTERGEIST) || monster.matches(SPIRITNAGA)) return;
  }

  /*  if undead and cube of undead control    */
  if (player.CUBEofUNDEAD || player.UNDEADPRO) {
    if (monster.matches(VAMPIRE) || monster.matches(WRAITH) || monster.matches(ZOMBIE)) return;
  }
  if ((player.level.know[x][y] & KNOWHERE) == 0)
      show1cell(x,y);

  var bias = player.HARDGAME + 1;
  //hitflag = hit2flag = hit3flag = 1; // TODO
  yrepcount = 0;

  cursors();
  ifblind(x, y);

  if ((player.INVISIBILITY > 0) && (rnd(33) < 20)) {
    updateLog(`The ${monster} misses wildly`);
    return;
  }
  if ((player.CHARMCOUNT > 0) && (rnd(30) + 5 * monster.level - player.CHARISMA < 30)) {
    updateLog(`The ${monster} is awestruck at your magnificence!`);
    return;
  }

  var dam;
  if (monster.matches(BAT)) {
    dam = 1;
  } else {
    dam = monster.damage;
    dam += rnd(((dam < 1) ? 1 : dam)) + monster.level;
  }

  var tmp = 0;

  // TODO special attack
  // if (monster[mster].attack > 0)
  //   if (((dam + bias + 8) > c[AC]) || (rnd((int)((c[AC] > 0) ? c[AC] : 1)) == 1)) {
  //     if (spattack(monster[mster].attack, x, y)) {
  //       lflushall();
  //       return;
  //     }
  //     tmp = 1;
  //     bias -= 2;
  //     cursors();
  //   }

  if (((dam + bias) > player.AC) || (rnd(((player.AC > 0) ? player.AC : 1)) == 1)) {
    updateLog(`  The ${monster} hit you `);
    tmp = 1;
    if ((dam -= player.AC) < 0) dam = 0;
    if (dam > 0) {
      player.losehp(dam);
      //bottomhp();
      //lflushall();
    }
  }
  if (tmp == 0) updateLog(`  The ${monster} missed `);
}



/*
 *  hitmonster(x,y)     Function to hit a monster at the designated coordinates
 *      int x,y;
 *
 *  This routine is used for a bash & slash type attack on a monster
 *  Enter with the coordinates of the monster in (x,y).
 *  Returns no value.
 */
function hitmonster(x, y) {
  var monster = player.level.monsters[x][y];
  hitflag = 0;
  var damage = 0;

  //extern char lastmonst[];
  //  register int tmp, monst;
  if (player.TIMESTOP > 0) return; /* not if time stopped */
  //vxy( & x, & y); /* verify coordinates are within range */
  if ((monster) == null) {
    debug("monster.hitmonster(): no monster at: " + xy(x, y));
    return;
  }
  //hit3flag = 1;
  var blind = ifblind(x, y);
  var tmp = monster.armorclass + player.LEVEL + player.DEXTERITY + player.WCLASS / 4 - 12;
  if ((rnd(20) < tmp - player.HARDGAME) || (rnd(71) < 5)) /* need at least random chance to hit */ {
    updateLog("You hit the " + (blind ? "monster" : monster));
    hitflag = 1;
    damage = fullhit(1);
    if (damage < 9999) damage = rnd(damage) + 1;
  } else {
    updateLog("  You missed the " + (blind ? "monster" : monster));
    hitflag = 0;
  }
  if (hitflag == 1) { /* if the monster was hit */
    if (monster.matches(RUSTMONSTER) || monster.matches(DISENCHANTRESS) || monster.matches(CUBE)) {
      if (player.WIELD != null) {
        if (player.WIELD.arg > -10) {
          updateLog(`  Your weapon is dulled by the ${monster}`);
          beep();
          player.WIELD.arg--;

          /* fix for dulled rings of strength,cleverness, and dexterity
             bug.
          */
          if (player.WIELD.matches(ODEXRING))
            player.DEXTERITY--;
          if (player.WIELD.matches(OSTRRING))
            player.STREXTRA--;
          if (player.WIELD.matches(OCLEVERRING))
            player.INTELLIGENCE--;
        }
      }
    }
  }
  if (hitflag == 1) {
    hitm(x, y, damage);
  }
  if (monster.matches(VAMPIRE)) {
    if (monster.hitpoints > 0 && monster.hitpoints < 25) {
      player.level.monsters[x][y] = createNewMonster(BAT);
      player.level.know[x][y] = 0;
    }
  }
}



/*
 *  hitm(x,y,amt)       Function to just hit a monster at a given coordinates
 *      int x,y,amt;
 *
 *  Returns the number of hitpoints the monster absorbed
 *  This routine is used to specifically damage a monster at a location (x,y)
 *  Called by hitmonster(x,y)
 */
function hitm(x, y, damage) {
  //vxy( & x, & y); /* verify coordinates are within range */
  var monster = player.level.monsters[x][y];
  var fulldamage = damage; /* save initial damage so we can return it */
  if (player.HALFDAM > 0) damage >>= 1; /* if half damage curse adjust damage points */
  if (damage <= 0) {
    damage = 1;
    fulldamage = 1;
  }
  lasthx = x;
  lasthy = y;
  player.level.monsters[x][y].awake = true; /* make sure hitting monst breaks stealth condition */
  player.HOLDMONST = 0; /* hit a monster breaks hold monster spell  */
  switch (monster.arg) { /* if a dragon and orb(s) of dragon slaying   */
    case WHITEDRAGON:
    case REDDRAGON:
    case GREENDRAGON:
    case BRONZEDRAGON:
    case PLATINUMDRAGON:
    case SILVERDRAGON:
      damage *= 1 + (player.SLAYING << 1);
      break;
  }

  /* invincible monster fix is here */
  if (monster.hitpoints > monsterlist[monster.arg].hitpoints)
    monster.hitpoints = monsterlist[monster.arg].hitpoints;

  var hpoints = monster.hitpoints;
  monster.hitpoints -= damage;
  debug("hitm(): hp = " + monster.hitpoints + "/" + monsterlist[monster.arg].hitpoints);
  if (monster.hitpoints <= 0) {
    player.MONSTKILLED++;
    updateLog(`  The ${monster} died!`);
    player.raiseexperience(monster.experience);
    if (monster.gold > 0) {
      dropgold(rnd(monster.gold) + monster.gold);
    }
    monster.dropsomething();
    player.level.monsters[x][y] = null;
    player.level.know[x][y] = 0;
    //monster = null;
    return (hpoints);
  }
  return (fulldamage);
}
