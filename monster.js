"use strict";

var Monster = function Monster(id, char, name, level, armorclass, damage, attack, defence, genocided, intelligence, gold, hitpoints, experience) {
  this.id = id;
  this.char = char;
  this.name = name;
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

function createmonster(arg) {
  var tmp = monsterlist[arg];
  var monster = new Monster(tmp.id, tmp.char, tmp.name, tmp.level,
    tmp.armorclass, tmp.damage, tmp.attack, tmp.defence, tmp.genocided,
    tmp.intelligence, tmp.gold, tmp.hitpoints, tmp.experience);
  monster.arg = arg;
  return monster;
}

Monster.prototype = {
    arg: 0,
    id: null,
    char: "💩",
    name: null,
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

    matches: function(monster) {
      return this.id == monster.id;
    },

    toString: function() {
      return this.name;
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
      debug("TODO: monster.dropsomething()");
      // int monst;
      // {
      // switch(monst)
      //     {
      //     case ORC:             case NYMPH:      case ELF:      case TROGLODYTE:
      //     case TROLL:           case ROTHE:      case VIOLETFUNGI:
      //     case PLATINUMDRAGON:  case GNOMEKING:  case REDDRAGON:
      //         something(level); return;
      //
      //     case LEPRECHAUN: if (rnd(101)>=75) creategem();
      //                      if (rnd(5)==1) dropsomething(LEPRECHAUN);   return;
      //     }
      // }
    },

    /*
     *  dropgold(amount)    Function to drop some gold around player
     *      int amount;
     *
     *  Enter with the number of gold pieces to drop
     *  Returns nothing of value.
     */
    dropgold: function(amount) {
      // if (amount > 250)
      //   createitem(OMAXGOLD, amount / 100);
      // else
      createitem(OGOLDPILE, amount);
    },


  } // monster class


/*
 *  createitem(it,arg)      Routine to place an item next to the player
 *      int it,arg;
 *
 *  Enter with the item number and its argument (iven[], ivenarg[])
 *  Returns no value, thus we don't know about createitem() failures.
 */
function createitem(it, arg) {
  debug("TODO: monster.createitem()");
  // int it,arg;
  // {
  // register int x,y,k,i;
  // if (it >= MAXOBJ) return;   /* no such object */
  // for (k=rnd(8), i= -8; i<0; i++,k++) /* choose direction, then try all */
  //     {
  //     if (k>8) k=1;   /* wraparound the diroff arrays */
  //     x = playerx + diroffx[k];       y = playery + diroffy[k];
  //     if (cgood(x,y,1,0)) /* if we can create here */
  //         {
  //         item[x][y] = it;  know[x][y]=0;  iarg[x][y]=arg;  return;
  //         }
  //     }
}

/*
 *  for the monster data
 *
 *  array to do rnd() to create monsters <= a given level
 */
const monstlevel = [5, 11, 17, 22, 27, 33, 39, 42, 46, 50, 53, 56, 59];

const monsterlist = [
  /*  NAME   ID CHAR NAME  LV  AC  DAM ATT DEF GEN INT GOLD    HP  EXP
  --------------------------------------------------------------------- */
  new Monster("", ".", "", 0, 0, 0, 0, 0, 0, 3, 0, 0, 0),
  new Monster("BAT, ", "B", "bat", 1, 0, 1, 0, 0, 0, 3, 0, 1, 1),
  new Monster("GNOME, ", "G", "gnome", 1, 10, 1, 0, 0, 0, 8, 30, 2, 2),
  new Monster("HOBGOBLIN", "H", "hobgoblin", 1, 14, 2, 0, 0, 0, 5, 25, 3, 2),
  new Monster("JACKAL", "J", "jackal", 1, 17, 1, 0, 0, 0, 4, 0, 1, 1),
  new Monster("KOBOLD", "K", "kobold", 1, 20, 1, 0, 0, 0, 7, 10, 1, 1),

  new Monster("ORC", "O", "orc", 2, 12, 1, 0, 0, 0, 9, 40, 4, 2),
  new Monster("SNAKE", "S", "snake", 2, 15, 1, 0, 0, 0, 3, 0, 3, 1),
  new Monster("CENTIPEDE", "c", "giant centipede", 2, 14, 0, 4, 0, 0, 3, 0, 1, 2),
  new Monster("JACULI", "j", "jaculi", 2, 20, 1, 0, 0, 0, 3, 0, 2, 1),
  new Monster("TROGLODYTE", "t", "troglodyte", 2, 10, 2, 0, 0, 0, 5, 80, 4, 3),
  new Monster("ANT", "A", "giant ant", 2, 8, 1, 4, 0, 0, 4, 0, 5, 5),

  new Monster("EYE", "E", "floating eye", 3, 8, 1, 0, 0, 0, 3, 0, 5, 2),
  new Monster("LEPRECHAUN", "L", "leprechaun", 3, 3, 0, 8, 0, 0, 3, 1500, 13, 45),
  new Monster("NYMPH", "N", "nymph", 3, 3, 0, 14, 0, 0, 9, 0, 18, 45),
  new Monster("QUASIT", "Q", "quasit", 3, 5, 3, 0, 0, 0, 3, 0, 10, 15),
  new Monster("RUSTMONSTER", "R", "rust monster", 3, 4, 0, 1, 0, 0, 3, 0, 18, 25),
  new Monster("ZOMBIE", "Z", "zombie", 3, 12, 2, 0, 0, 0, 3, 0, 6, 7),

  new Monster("ASSASSINBUG", "a", "assassin bug", 4, 9, 3, 0, 0, 0, 3, 0, 20, 15),
  new Monster("BUGBEAR", "b", "bugbear", 4, 5, 4, 15, 0, 0, 5, 40, 20, 35),
  new Monster("HELLHOUND", "h", "hell hound", 4, 5, 2, 2, 0, 0, 6, 0, 16, 35),
  new Monster("ICELIZARD", "i", "ice lizard", 4, 11, 2, 10, 0, 0, 6, 50, 16, 25),
  new Monster("CENTAUR", "C", "centaur", 4, 6, 4, 0, 0, 0, 10, 40, 24, 45),

  new Monster("TROLL", "T", "troll", 5, 4, 5, 0, 0, 0, 9, 80, 50, 300),
  new Monster("YETI", "Y", "yeti", 5, 6, 4, 0, 0, 0, 5, 50, 35, 100),
  new Monster("WHITEDRAGON", "w", "white dragon", 5, 2, 4, 5, 0, 0, 16, 500, 55, 1000),
  new Monster("ELF", "e", "elf", 5, 8, 1, 0, 0, 0, 15, 50, 22, 35),
  new Monster("CUBE", "g", "gelatinous cube", 5, 9, 1, 0, 0, 0, 3, 0, 22, 45),

  new Monster("METAMORPH", "m", "metamorph", 6, 7, 3, 0, 0, 0, 3, 0, 30, 40),
  new Monster("VORTEX", "v", "vortex", 6, 4, 3, 0, 0, 0, 3, 0, 30, 55),
  new Monster("ZILLER", "z", "ziller", 6, 15, 3, 0, 0, 0, 3, 0, 30, 35),
  new Monster("VIOLETFUNGI", "F", "violet fungi", 6, 12, 3, 0, 0, 0, 3, 0, 38, 100),
  new Monster("WRAITH", "W", "wraith", 6, 3, 1, 6, 0, 0, 3, 0, 30, 325),
  new Monster("FORVALAKA", "f", "forvalaka", 6, 2, 5, 0, 0, 0, 7, 0, 50, 280),

  new Monster("LAMANOBE", "l", "lama nobe", 7, 7, 3, 0, 0, 0, 6, 0, 35, 80),
  new Monster("OSEQUIP", "o", "osequip", 7, 4, 3, 16, 0, 0, 4, 0, 35, 100),
  new Monster("ROTHE", "r", "rothe", 7, 15, 5, 0, 0, 0, 3, 100, 50, 250),
  new Monster("XORN", "X", "xorn", 7, 0, 6, 0, 0, 0, 13, 0, 60, 300),
  new Monster("VAMPIRE", "V", "vampire", 7, 3, 4, 6, 0, 0, 17, 0, 50, 1000),
  new Monster("INVISIBLESTALKER", ".", "invisible stalker", 7, 3, 6, 0, 0, 0, 5, 0, 50, 350),

  new Monster("POLTERGEIST", "p", "poltergeist", 8, 1, 4, 0, 0, 0, 3, 0, 50, 450),
  new Monster("DISENCHANTRESS", "q", "disenchantress", 8, 3, 0, 9, 0, 0, 3, 0, 50, 500),
  new Monster("SHAMBLINGMOUND", "s", "shambling mound", 8, 2, 5, 0, 0, 0, 6, 0, 45, 400),
  new Monster("YELLOWMOLD", "y", "yellow mold", 8, 12, 4, 0, 0, 0, 3, 0, 35, 250),
  new Monster("UMBERHULK", "U", "umber hulk", 8, 3, 7, 11, 0, 0, 14, 0, 65, 600),

  new Monster("GNOMEKING", "k", "gnome king", 9, -1, 10, 0, 0, 0, 18, 2000, 100, 3000),
  new Monster("MIMIC", "M", "mimic", 9, 5, 6, 0, 0, 0, 8, 0, 55, 99),
  new Monster("WATERLORD", "w", "water lord", 9, -10, 15, 7, 0, 0, 20, 0, 150, 15000),
  new Monster("BRONZEDRAGON", "D", "bronze dragon", 9, 2, 9, 3, 0, 0, 16, 300, 80, 4000),
  new Monster("GREENDRAGON", "D", "green dragon", 9, 3, 8, 10, 0, 0, 15, 200, 70, 2500),
  new Monster("PURPLEWORM", "P", "purple worm", 9, -1, 11, 0, 0, 0, 3, 100, 120, 15000),
  new Monster("XVART", "x", "xvart", 9, -2, 12, 0, 0, 0, 13, 0, 90, 1000),

  new Monster("SPIRITNAGA", "n", "spirit naga", 10, -20, 12, 12, 0, 0, 23, 0, 95, 20000),
  new Monster("SILVERDRAGON", "D", "silver dragon", 10, -1, 12, 3, 0, 0, 20, 700, 100, 10000),
  new Monster("PLATINUMDRAGON", "D", "platinum dragon", 10, -5, 15, 13, 0, 0, 22, 1000, 130, 24000),
  new Monster("GREENURCHIN", "u", "green urchin", 10, -3, 12, 0, 0, 0, 3, 0, 85, 5000),
  new Monster("REDDRAGON", "D", "red dragon", 10, -2, 13, 3, 0, 0, 19, 800, 110, 14000),

  new Monster("DEMONLORD", ".", "type I demon lord", 12, -30, 18, 0, 0, 0, 20, 0, 140, 50000),
  new Monster("DEMONLORD", ".", "type II demon lord", 13, -30, 18, 0, 0, 0, 21, 0, 160, 75000),
  new Monster("DEMONLORD", ".", "type III demon lord", 14, -30, 18, 0, 0, 0, 22, 0, 180, 100000),
  new Monster("DEMONLORD", ".", "type IV demon lord", 15, -35, 20, 0, 0, 0, 23, 0, 200, 125000),
  new Monster("DEMONLORD", ".", "type V demon lord", 16, -40, 22, 0, 0, 0, 24, 0, 220, 150000),
  new Monster("DEMONLORD", ".", "type VI demon lord", 17, -45, 24, 0, 0, 0, 25, 0, 240, 175000),
  new Monster("DEMONLORD", ".", "type VII demon lord", 18, -70, 27, 6, 0, 0, 26, 0, 260, 200000),
  new Monster("DEMONPRINCE", ".", "demon prince", 25, -127, 30, 6, 0, 0, 28, 0, 345, 300000)

];

const VAMPIRE = monsterlist[38];
const BAT = monsterlist[1];


/*
 *  hitplayer(x,y)      Function for the monster to hit the player from (x,y)
 *      int x,y;
 *
 *  Function for the monster to hit the player with monster at location x,y
 *  Returns nothing of value.
 */
function hitplayer(x, y) {

  var monster = player.level.monsters[x][y];
  if ((monster) == null) {
    debug("monster.hitplayer(): no monster at: " + xy(x, y));
    return;
  }

  var dam, tmp, bias;

  lastnum = monster;

  // TODO
  // /*  spirit naga's and poltergeist's do nothing if scarab of negate spirit   */
  //     if (c[NEGATESPIRIT] || c[SPIRITPRO])  if ((mster ==POLTERGEIST) || (mster ==SPIRITNAGA))  return;

  // TODO
  // /*  if undead and cube of undead control    */
  //     if (c[CUBEofUNDEAD] || c[UNDEADPRO]) if ((mster ==VAMPIRE) || (mster ==WRAITH) || (mster ==ZOMBIE)) return;

  bias = (player.HARDGAME) + 1;
  hitflag = hit2flag = hit3flag = 1;
  yrepcount = 0;

  ifblind(x, y);
  if (player.INVISIBILITY > 0)
    if (rnd(33) < 20) {
      updateLog(`The ${monster} misses wildly`);
      return;
    }
  if (player.CHARMCOUNT > 0)
    if (rnd(30) + 5 * monster.level - player.CHARISMA < 30) {
      updateLog(`The ${monster} is awestruck at your magnificence!`);
      return;
    }
  if (monster.matches(BAT)) {
    dam = 1;
  }
  else {
    dam = monster.damage;
    dam += rnd((dam < 1 ? 1 : dam)) + monster.level;
  }
  tmp = 0;
  // if (monster.attack > 0)
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
      player.level.paint();
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
    updateLog("You hit");
    hitflag = 1;
    damage = fullhit(1);
    if (damage < 9999) damage = rnd(damage) + 1;
  } else {
    updateLog("You missed");
    hitflag = 0;
  }
  appendLog(" the " + (blind ? "monster" : monster.name));
  if (hitflag == 1) /* if the monster was hit */
    if ((monster.id == "RUSTMONSTER") || (monster.id == "DISENCHANTRESS") || (monster.id == "CUBE"))
      debug("TODO: monster.hitmonster(): dull weapon: " + monster.id);
    //   if (player.WIELD >= 0)
    //     if (ivenarg[c[WIELD]] > -10) {
    //       lprintf("\nYour weapon is dulled by the %s", lastmonst);
    //       beep();
    //       --ivenarg[c[WIELD]];
    //
    //       /* fix for dulled rings of strength,cleverness, and dexterity
    //          bug.
    //       */
    //       switch (iven[c[WIELD]]) {
    //         case ODEXRING:
    //           c[DEXTERITY]--;
    //           break;
    //         case OSTRRING:
    //           c[STREXTRA]--;
    //           break;
    //         case OCLEVERRING:
    //           c[INTELLIGENCE]--;
    //           break;
    //       }
    //     }
  if (hitflag == 1) hitm(x, y, damage);
  if (monster.id == "VAMPIRE")
    if (monster.hitpoints < 25) {
      player.level.monster[x][y] = new Monster(BAT);
      // know[x][y] = 0; // TODO?
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
  // TODO ORB OF DRAGON SLAYING
  // switch (monst) /* if a dragon and orb(s) of dragon slaying   */ {
  //   case WHITEDRAGON:
  //   case REDDRAGON:
  //   case GREENDRAGON:
  //   case BRONZEDRAGON:
  //   case PLATINUMDRAGON:
  //   case SILVERDRAGON:
  //     amt *= 1 + (c[SLAYING] << 1);
  //     break;
  // }
  /* invincible monster fix is here */
  // if (hitp[x][y] > monster[monst].hitpoints) // TODO do i need this?
  //   hitp[x][y] = monster[monst].hitpoints;
  monster.hitpoints -= damage;
  debug("monster.hitm(): monster hp = " + monster.hitpoints + "/" + monsterlist[monster.arg].hitpoints);
  if (monster.hitpoints <= 0) {
    player.MONSTKILLED++;
    updateLog("The " + monster.name + " died!");
    player.raiseexperience(monster.experience);
    if (monster.gold > 0) {
      monster.dropgold(rnd(monster.gold) + monster.gold);
    }
    monster.dropsomething();
    //disappear(x, y);
    player.level.monsters[x][y] = null;
    //player.level.paint();
    return fulldamage;
    //return (hpoints); // TODO do i need this?
  }
  return (fulldamage);
}

/*
 *  fullhit(xx)     Function to return full damage against a monster (aka web)
 *      int xx;
 *
 *  Function to return hp damage to monster due to a number of full hits
 *  Enter with the number of full hits being done
 */
function fullhit(xx) {
  if (xx < 0 || xx > 20) return (0); /* fullhits are out of range */
  if (player.LANCEDEATH) return (10000); /* lance of death */
  var i = xx * ((player.WCLASS >> 1) + player.STRENGTH + player.STREXTRA - player.HARDGAME - 12 + player.MOREDAM);
  return ((i >= 1) ? i : xx);
}
