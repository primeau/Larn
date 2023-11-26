'use strict';







var Monster = function Monster(char, desc, level, armorclass, damage, attack, intelligence, gold, hitpoints, experience, arg, awake, moved) {
  this.arg = arg;

  this.char = char;
  this.desc = desc;
  this.level = level;
  this.armorclass = armorclass;
  this.damage = damage;
  this.attack = attack;
  this.intelligence = intelligence;
  this.gold = gold;
  this.experience = experience;

  this.inventory = [];
  this.hitpoints = hitpoints;
  this.awake = awake;
  this.moved = moved;

  this.color = NO_COLOR;
}



function createMonster(monst) {

  if (!monst) return null;
  if (DEBUG_NO_MONSTERS) return null;

  var arg = monst.arg;

  // if we are passed an int, retrieve the appropriate monster
  if (!arg) {
    arg = monst;
    monst = monsterlist[arg];
  }

  var monster = new Monster(monst.char, monst.desc, monst.level,
    monst.armorclass, monst.damage, monst.attack,
    monst.intelligence, monst.gold, monst.hitpoints, monst.experience,
    monst.arg, monst.awake, monst.moved);

  if (monst.inventory && monst.inventory.length > 0) {
    for (let index = 0; index < monst.inventory.length; index++) {
      monster.inventory[index] = createObject(monst.inventory[index]);
    }
  } else {
    monster.initInventory();
  }

  if (ULARN && arg == MIMIC) {
    monster.mimicarg = monst.mimicarg ? monst.mimicarg : createMimicArg();
    monster.mimiccounter = monst.mimiccounter ? monst.mimiccounter : 0;
  }

  return monster;
}



function createMimicArg() {
  let arg = rnd(REDDRAGON);
  if (arg == INVISIBLESTALKER) arg++;
  return arg;
}



Monster.prototype = {
  arg: 0,
  char: `💩`,
  desc: null,
  level: 0,
  armorclass: 0,
  damage: 0,
  attack: 0,
  defense: 0,
  intelligence: 0,
  gold: 0,
  hitpoints: 0,
  experience: 0,
  awake: false,
  /*  false=sleeping true=awake monst*/
  moved: false,

  matches: function(monsterarg) {
    return this.arg == monsterarg;
  },

  toString: function() {
    if (player.BLINDCOUNT == 0)
      return this.desc;
    else
      return `monster`;
  },

  getChar: function() {
    let monster = this.arg;

    if (ULARN && this.arg == MIMIC && this.mimicarg) {
      monster = this.mimicarg;
    }

    if (amiga_mode) {
      let prefix = `m`;
      let suffix = ``;
      if (monster == INVISIBLESTALKER && player.SEEINVISIBLE > 0) {
        suffix = `v`;
      } else if (ULARN && this.isDemon() && isCarrying(OLARNEYE)) {
        suffix = `v`;
      } else if (ULARN && (monster == LEMMING || monster == BITBUG || monster == LAMANOBE)) {
        suffix = `u`;
      }
      return `${DIV_START}${prefix}${monster}${suffix}${DIV_END}`;
    } else {
      if (monster == INVISIBLESTALKER) {
        return player.SEEINVISIBLE > 0 ? monsterlist[INVISIBLESTALKER].char : OEMPTY.char;
      } else if (ULARN && this.isDemon() && isCarrying(OLARNEYE)) {
        return `<font color='crimson'>${demonchar[this.arg - DEMONLORD]}</font>`;
      } else {
        if (show_color && monsterlist[monster].color) {
          return `<font color='${monsterlist[monster].color}'>${monsterlist[monster].char}</font>`;
        } else {
          return monsterlist[monster].char;
        }
      }
    }
  },

  isDemon: function() {
    return this.arg >= DEMONLORD;
  },

  initInventory: function() {
    if (!this.inventory) { // TODO for old savegame -- delete june 2021
      this.inventory = [];
    }
    this.addInventory();
    this.addGold();
  },

  addInventory: function() {
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
        this.pickup(createRandomItem(level));
        if (rnd(101) < 8) this.addInventory();
        return;
      case LEPRECHAUN:
        if (rnd(101) >= 75) this.pickup(createGem());
        if (rnd(5) == 1) this.addInventory();
        return;
    }
  },

  addGold: function() {
    if (this.gold <= 0) return;
    let amount = rnd(this.gold) + this.gold;
    this.pickup(createGold(amount));
    return;
  },

  pickup: function(item) {
    if (!item) {
      return;
    }
    if (!this.inventory) this.initInventory(); // TODO for old savegame -- delete june 2021
    this.inventory.push(item);
  },

  dropInventory: function(x, y) {
    if (!this.inventory) this.initInventory(); // TODO for old savegame -- delete june 2021
    while (this.inventory.length > 0) {
      dropItem(x, y, this.inventory.pop());
    }
  },

  isCarrying: function(item) {
    if (!item) return false;
    for (let i = 0; i < this.inventory.length; i++) {
      let tmpItem = this.inventory[i];
      if (item.matches(tmpItem)) {
        return true;
      }
    }
    return false;
  },

  /*
   * Can we chop this thing's head off with the Vorpal Blade? 
   */
  canBehead() {
    if (this.isDemon()) return false;
    switch (this.arg) {
      case EYE:
      case CUBE:
      case METAMORPH:
      case VORTEX:
      case VIOLETFUNGI:
      case XORN:
      case POLTERGEIST:
      case SHAMBLINGMOUND:
      case YELLOWMOLD:
      case MIMIC:
      case WATERLORD:
      case SPIRITNAGA:
      case GREENURCHIN:
        return false;
      default:
        return true;
    }
  },

  /*
   * Can this monster float over a pit / trapdoor?
   */
  canFly() {
    /* lemmings can't fly */
    if (ULARN && this.arg == LEMMING) return false;

    switch (this.arg) {
      case BAT:
      case EYE:
      case SPIRITNAGA:
      case PLATINUMDRAGON:
      case WRAITH:
      case VAMPIRE:
      case SILVERDRAGON:
      case POLTERGEIST:
      case DEMONLORD:
      case DEMONLORD + 1:
      case DEMONLORD + 2:
      case DEMONLORD + 3:
      case DEMONLORD + 4:
      case DEMONLORD + 5:
      case DEMONLORD + 6:
      case DEMONPRINCE:
      case LUCIFER:
        return true;
      default:
        return false;
    }
  },

  /*
   * Is this a half-speed monster
   */
  isSlow() {
    switch (this.arg) {
      case TROGLODYTE:
      case HOBGOBLIN:
      case METAMORPH:
      case XVART:
      case INVISIBLESTALKER:
      case ICELIZARD:
        // if (isHalfTime()) return;
        return true;
    }
    return false;
  },

  /*
   * Can our Hero see this monster right now
   */
  isVisible() {
    if (this.isDemon()) {
      return ULARN && isCarrying(OLARNEYE);
    }
    if (this.matches(INVISIBLESTALKER)) {
      return player.SEEINVISIBLE > 0;
    }
    return true;
  },



} // monster class



/*
    subroutine to randomly create monsters if needed
 */
function randmonst() {
  if (!player) return;

  if (player.TIMESTOP) return; /*  don't make monsters if time is stopped  */
  if (--rmst <= 0) {
    rmst = 120 - (level << 2);
    fillmonst(makemonst(level));
  }
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
  return (SCROLL_PROBABILITY[rund(81)]);
}
/* macro to return a potion # created with probability of occurrence */
function newpotion() {
  return (POTION_PROBABILITY[rund(41)]);
}
/* macro to return the + points on created leather armor */
function newleather() {
  return (nlpts[rund(getDifficulty() ? 13 : 15)]);
}
/* macro to return the + points on chain armor */
function newchain() {
  return (nch[rund(10)]);
}
/* macro to return + points on plate armor */
function newplate() {
  return (nplt[rund(getDifficulty() ? 4 : 12)]);
}
/* macro to return + points on new daggers */
function newdagger() {
  return (ndgg[rund(13)]);
}
/* macro to return + points on new swords */
function newsword() {
  return (nsw[rund(getDifficulty() ? 6 : 13)]);
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
    debug(`createmonst invalid ${mon}`);
    return;
  }
  while (isGenocided(mon) && mon < monsterlist.length - 1) mon++; /* genocided? */

  if (!x) x = player.x;
  if (!y) y = player.y;

  let dx = x;
  let dy = y;

  let onPlayer = x == player.x && y == player.y;
  var oktocreate = (x != null && y != null && !onPlayer && cgood(x, y, false, true));
  var i = oktocreate ? 0 : -8;

  /* choose direction, then try all */
  for (var k = rnd(8); i < 0; i++, k++) {
    if (k > 8) k = 1; /* wraparound the diroff arrays */
    dx = x + diroffx[k];
    dy = y + diroffy[k];
    if (cgood(dx, dy, false, true)) /* if we can create here */ {
      oktocreate = true;
      i = 0;
    }
  }

  if (oktocreate) {
    var monster = createMonster(mon);
    if (!monster) return;
    player.level.monsters[dx][dy] = monster;
    player.level.know[dx][dy] &= ~KNOWHERE;
    monster.awake = false;
    switch (mon) {
      case ROTHE:
      case POLTERGEIST:
      case VAMPIRE:
        monster.awake = true;
    }
  } else {
    debug(`failed to createmonst ${mon}, ${dx},${dy}`)
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
  /* cannot create either monster or item if:
     - out of bounds
     - wall
     - closed door
     - dungeon entrance
  */
  var item = itemAt(x, y);

  if (((y < 0) || (y > MAXY - 1) || (x < 0) || (x > MAXX - 1)) ||
    (!item) ||
    (item.matches(OWALL)) ||
    (item.matches(OCLOSEDDOOR)) ||
    (item.matches(OHOMEENTRANCE))) {
      return false;
    }

  /* if checking for an item, return False if one there already */
  if (itm && !item.matches(OEMPTY)) {
    return false;
  }

  /* if checking for a monster, return False if one there already _or_
     there is a pit/trap there.
  */
  if (monst) {
    if (monsterAt(x, y)) {
      return false;
    }
    switch (item.id) {
      /* note: not invisible traps, since monsters are not affected
         by them.
      */
      case OPIT.id:
      case OANNIHILATION.id:
      case OTELEPORTER.id:
      case OTRAPARROW.id:
      case ODARTRAP.id:
      case OTRAPDOOR.id:
      case OELEVATORUP.id:
      case OELEVATORDOWN.id:
        return false;
      default:
        break;
    }
  }
  return true;
}



/*
 *  createitem(it,arg)      Routine to place an item next to the player
 *      int item, arg;
 *
 *  Enter with the item number and its argument (iven[], ivenarg[])
 *  Returns no value, thus we don't know about createitem() failures.
 */
function createitem(item, arg, nearPlayer) {
  var x, y, k, i;
  //if (it >= MAXOBJ) return; /* no such object */
  var firstTry = true;
  for (k = rnd(8), i = -8; i < 0; i++, k++) /* choose direction, then try all */ {
    if (k > 8) k = 1; /* wraparound the diroff arrays */

    if (nearPlayer) {
      x = player.x + diroffx[k];
      y = player.y + diroffy[k];
    } else {
      x = lasthx + (firstTry ? 0 : diroffx[k]);
      y = lasthy + (firstTry ? 0 : diroffy[k]);
    }

    if (cgood(x, y, true, false)) /* if we can create here */ {
      setItem(x, y, createObject(item, arg));
      return;
    }

    firstTry = false;
  }
}



function dropItemNearPlayer(item) {
  dropItem(player.x, player.y, item, true);
}



function dropItem(x, y, item, scatter) {
  if (!scatter && cgood(x, y, true, false)) {
    setItem(x, y, item);
    return;
  } else {
    let dx, dy;
    for (let k = rnd(8), i = -8; i < 0; i++, k++) /* choose direction, then try all */ {
      if (k > 8) k = 1; /* wraparound the diroff arrays */
      dx = x + diroffx[k];
      dy = y + diroffy[k];
      if (cgood(dx, dy, true, false)) /* if we can create here */ {
        setItem(dx, dy, item);
        return;
      }
    }
  }
}



/*
 *  hitplayer(x,y)      Function for the monster to hit the player from (x,y)
 *      int x,y;
 *
 *  Function for the monster to hit the player with monster at location x,y
 *  Returns nothing of value.
 */
function hitplayer(x, y) {

  var monster = player.level.monsters[x][y];
  if (!monster) {
    return;
  }

  lastnum = monster; /* killed by a ${monstername} */

  var damageModifier = 1; // will alway be 1 for classic Larn

  if (monster.matches(POLTERGEIST) || monster.matches(SPIRITNAGA)) {
    if (player.SPIRITPRO || isCarrying(OSPIRITSCARAB)) {
      if (ULARN) {
        /* spirit naga's and poltergeist's damage is halved if scarab of negate spirit */
        damageModifier = 0.5;
      } else {
        /* spirit naga's and poltergeist's do nothing if scarab of negate spirit */
        return;
      }
    }
  }

  if (monster.matches(VAMPIRE) || monster.matches(WRAITH) || monster.matches(ZOMBIE)) {
    if (player.UNDEADPRO || isCarrying(OCUBEofUNDEAD)) {
      if (ULARN) {
        /*	halved if undead and cube of undead control	*/
        damageModifier = 0.5;
      } else {
        /* do nothing */
        return;
      }
    }
  }

  if ((player.level.know[x][y] & KNOWHERE) == 0)
    show1cell(x, y);

  var bias = getDifficulty() + 1;
  hitflag = 1;

  cursors();
  ifblind(x, y);

  if (ULARN && monster.matches(LEMMING)) {
    return;
  }

  if (!(ULARN && monster.isDemon())) {
    if ((player.INVISIBILITY > 0) && (rnd(33) < 20)) {
      updateLog(`The ${monster} misses wildly${period}`);
      return;
    }
  }

  if (!(ULARN && (monster.isDemon() || monster.matches(PLATINUMDRAGON)))) {
    if ((player.CHARMCOUNT > 0) && (rnd(30) + 5 * monster.level - player.CHARISMA < 30)) {
      updateLog(`The ${monster} is awestruck at your magnificence!`);
      return;
    }
  }

  var dam;
  if (monster.matches(BAT)) {
    dam = 1;
  } else {
    dam = monster.damage;
    dam += rnd(((dam < 1) ? 1 : dam)) + monster.level;
  }

  /* demon damage is reduced if wielding Slayer */
  if (monster.isDemon() && player.WIELD && player.WIELD.matches(OSLAYER)) {
    dam = (1 - (0.1 * rnd(5)) * dam);
  }

  /* take damage reductions into account for ularn special artifacts */
  dam *= damageModifier;

  var playerHit = false;
  var lifeCount = player.LIFEPROT;

  if (monster.attack > 0)
    if (((dam + bias + 8) > player.AC) || (rnd(((player.AC > 0) ? player.AC : 1)) == 1)) {
      if (spattack(monster, monster.attack, x, y)) {
        // spattack returns 1 if the monster disappears (theft)
        return;
      }
      playerHit = true;
      bias -= 2;
      //cursors();
    }

  if (player.HP <= 0 || lifeCount != player.LIFEPROT) {
    // doRollbar(ROLLBAR_DEBUG, `already dead`, `${logname} ${playerID} ${gameID}`);
    debug('already dead');
    return;
  }

  if (((dam + bias) > player.AC) || (rnd(((player.AC > 0) ? player.AC : 1)) == 1)) {
    updateLog(`  The ${monster} hit you${period}`);
    playerHit = true;
    if ((dam -= player.AC) < 0) dam = 0;
    if (dam > 0) {
      player.losehp(dam);
    }
  }
  if (!playerHit) updateLog(`  The ${monster} missed${period}`);
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
  if (player.TIMESTOP > 0) return; /* not if time stopped */

  //vxy( & x, & y); /* verify coordinates are within range */

  var monster = player.level.monsters[x][y];
  var weapon = player.WIELD;

  if (!monster) {
    //debug(`monster.hitmonster(): no monster at: ` + xy(x, y));
    return;
  }

  var blind = ifblind(x, y);
  var damage = 0;
  let hitMonster = false;

  var hitSkill = monster.armorclass + player.LEVEL + player.DEXTERITY + player.WCLASS / 4 - 12;

  //console.log(`${hitSkill}, ${monster.armorclass}, ${player.LEVEL}, ${player.DEXTERITY}, ${player.WCLASS}, ${getDifficulty()}`);

  /*
  v12.4.5
  hitting monsters at higher difficulties was absurdly hard, and
  with monster.armorclass already increasing with difficulty, the
  extra modifier is excessive
  */
  var difficultyModifier = 0 /* getDifficulty() */ ;

  if ((rnd(20) < hitSkill - difficultyModifier) || (rnd(71) < 5)) /* need at least random chance to hit */ {
    updateLog(`You hit the ${blind ? `monster` : monster}${period}`);
    hitMonster = true;
    damage = fullhit(1);
    if (damage < 9999) damage = rnd(damage) + 1;
  } else {
    updateLog(`You missed the ${blind ? `monster` : monster}${period}`);
    hitMonster = false;
  }
  if (hitMonster) {
    /* if the monster was hit */
    if (monster.matches(RUSTMONSTER) || monster.matches(DISENCHANTRESS) || monster.matches(CUBE)) {
      if (weapon && weapon.isWeapon()) {
        if (weapon.arg > -10) {
          if (!weapon.matches(OSWORDofSLASHING)) /* 12.5.0 -- impervious to rust */ {
            updateLog(`  Your weapon is dulled by the ${monster}`);
            beep();
            weapon.arg--;
          }
        } else if (ULARN && weapon.arg <= -10) {
          destroyInventory(weapon);
          updateLog(`  Your weapon disintegrates!`);
          hitMonster = false; /* Didn't hit after all... */
        }
      }
    }
  }
  if (hitMonster) {

    /* Deal with Vorpy */
    // 12.5.0 fix: this was in hitm() before and you could 'behead' a monster with a spell
    if (weapon && weapon.matches(OVORPAL) && rnd(20) == 1 && monster.canBehead()) {
      updateLog(`  The Vorpal Blade beheads the ${monster}!`);
      damage = monster.hitpoints;
    }

    // 12.5.0 fix: this was in hitm() before and was causing spells to be too powerful
    if (ULARN && monster.isDemon()) {
      if (weapon && weapon.matches(OLANCE)) {
        damage = 300;
        if (monster.hitpoints > damage) {
          updateLog(`  Your lance of death tickles the ${monster}`);
        }
      }
      if (weapon && weapon.matches(OSLAYER)) {
        damage = 10000;
      }
    }

    hitm(x, y, damage); /* actually hit the monster */

  }

  if (!ULARN && monster.matches(VAMPIRE)) {
    if (monster.hitpoints > 0 && monster.hitpoints < 25) {
      player.level.monsters[x][y] = createMonster(BAT);
      player.level.know[x][y] = 0;
    }
  }

  if (ULARN && monster.matches(METAMORPH)) {
    if (monster.hitpoints > 0 && monster.hitpoints < 25) {
      player.level.monsters[x][y] = createMonster(BRONZEDRAGON + rund(9));
      player.level.know[x][y] = 0;
    }
  }

  if (ULARN && monster.matches(LEMMING)) {
    if (rnd(100) <= 40) createmonster(LEMMING);
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
  var monster = player.level.monsters[x][y];
  var fulldamage = damage; /* save initial damage so we can return it */
  if (player.HALFDAM > 0) damage >>= 1; /* if half damage curse adjust damage points */
  if (damage <= 0) {
    damage = 1;
    fulldamage = 1;
  }
  lasthx = x;
  lasthy = y;
  monster.awake = true; /* make sure hitting monst breaks stealth condition */
  player.updateHoldMonst(-player.HOLDMONST); /* hit a monster breaks hold monster spell  */

  /* if a dragon and orb of dragon slaying */
  if (isCarrying(OORBOFDRAGON)) {
    switch (monster.arg) {
      case WHITEDRAGON:
      case REDDRAGON:
      case GREENDRAGON:
      case BRONZEDRAGON:
      case PLATINUMDRAGON:
      case SILVERDRAGON:
        damage *= 3;
        break;
    }
  }

  /* invincible monster fix is here */
  if (monster.hitpoints > monsterlist[monster.arg].hitpoints)
    monster.hitpoints = monsterlist[monster.arg].hitpoints;

  var hpoints = monster.hitpoints;
  monster.hitpoints -= damage;
  debug(`hitm(): ${monster.toString()} ${monster.hitpoints} / ${monsterlist[monster.arg].hitpoints}`);
  if (monster.hitpoints <= 0) {
    player.MONSTKILLED++;
    updateLog(`  The ${monster} died!`);
    player.raiseexperience(monster.experience);
    monster.dropInventory(x, y);
    killMonster(x, y);

    return (hpoints);
  }
  return (fulldamage);
}



/*
 *  Function to process special attacks from monsters
 *
 *  Enter with the special attack number, and the coordinates (xx,yy)
 *      of the monster that is special attacking
 *  Returns 1 if must do a show1cell(xx,yy) upon return, 0 otherwise
 *
 * atckno   monster     effect
 * ---------------------------------------------------
 *  0   none
 *  1   rust monster    eat armor
 *  2   hell hound      breathe light fire
 *  3   dragon          breathe fire
 *  4   giant centipede weakening sing
 *  5   white dragon    cold breath
 *  6   wraith          drain level
 *  7   waterlord       water gusher
 *  8   leprechaun      steal gold
 *  9   disenchantress  disenchant weapon or armor
 *  10  ice lizard      hits with barbed tail
 *  11  umber hulk      confusion
 *  12  spirit naga     cast spells taken from special attacks
 *  13  platinum dragon psionics
 *  14  nymph           steal objects
 *  15  bugbear         bite
 *  16  osequip         bite
 *
 *  int rustarm[ARMORTYPES][2];
 *  special array for maximum rust damage to armor from rustmonster
 *  format is: { armor type , minimum attribute
 */
const spsel = [1, 2, 3, 5, 6, 8, 9, 11, 13, 14];
const rustarm = [
  [OSTUDLEATHER, -2],
  [ORING, -4],
  [OCHAIN, -5],
  [OSPLINT, -6],
  [OPLATE, -8],
  [OPLATEARMOR, -9],
];

function spattack(monster, attack, xx, yy) {

  if (player.CANCELLATION) {
    /* cancel only works 5% of time for demon prince and god */
    if (ULARN && (monster.matches(DEMONPRINCE) || monster.matches(LUCIFER))) {
      if (rnd(100) >= 95) {
        return 0;
      }
    } else {
      return 0;
    }
  }

  /* 12.5.0 - seems like this is missing from the original. updated to no special attack 
     for naga with spirit protection, but leave at 50% if scarab of negate spirit (done in hitplayer())
  */
  if (ULARN && monster.matches(SPIRITNAGA)) {
    if (player.SPIRITPRO) {
      return 0;
    }
  }

  /* no drain life if cube or undead protect */
  if (monster.matches(VAMPIRE) || monster.matches(WRAITH)) {
    if (isCarrying(OCUBEofUNDEAD) || player.UNDEADPRO) {
      return 0;
    }
  }

  /* staff of power cancels demonlords/wraiths/vampires 75% of time */
  /* lucifer is unaffected */
  if (ULARN && !monster.matches(LUCIFER)) {
    if (monster.isDemon() || monster.matches(WRAITH) || monster.matches(VAMPIRE)) {
      if (isCarrying(OPSTAFF)) {
        if (rnd(100) < 75) {
          return 0;
        }
      }
    }
  }

  if (player.HP <= 0) {
    // doRollbar(ROLLBAR_DEBUG, `already dead`, `${logname} ${playerID} ${gameID}`);
    debug('already dead');
    return 0;
  }

  //vxy( & xx, & yy); /* verify x & y coordinates */

  var damage = null;
  var armorclass = player.AC;
  // monster = lastmonst; // lastmonst is only the name of the last monster to hit

  switch (attack) {
    case 1:
      /* rust your armor, rust=1 when rusting has occurred */
      var rust = 0;
      var armor = player.WEAR;
      var shield = player.SHIELD;
      if (shield) {
        if (shield.arg >= 0) {
          shield.arg -= 1;
          rust = 1;
        }
      }
      if (rust == 0 && armor) {
        for (let i = 0; i < rustarm.length; i++) {
          if (armor.matches(rustarm[i][0])) {
            /* find armor in table */
            if (armor.arg > rustarm[i][1]) {
              armor.arg -= 1;
              rust = 1;
            }
            break;
          }
        }
      }
      /* if rusting did not occur */
      if (rust == 0) {
        if (armor && armor.matches(OLEATHER)) {
          updateLog(`The ${monster} hit you -- you're lucky to be wearing leather armor!`);
        }
        if (armor && armor.matches(OSSPLATE)) {
          updateLog(`The ${monster} hit you -- you're fortunate to have stainless steel armor!`);
        }
        if (armor && armor.matches(OELVENCHAIN)) {
          updateLog(`The ${monster} hit you -- you are very lucky to have such strong elven chain!`);
        }
      } else {
        updateLog(`The ${monster} hit you -- your armor feels weaker${period}`);
      }
      break;

    case 2: // hell hound
      damage = rnd(15) + 8 - armorclass;
      // fall through

    case 3: // dragon
      if (damage == null) {
        damage = rnd(20) + 25 - armorclass;
      }
      if (player.FIRERESISTANCE) {
        updateLog(`The ${monster}'s flame doesn't faze you!`);
      } else {
        updateLog(`The ${monster} breathes fire at you!`);
        player.losehp(damage);
      }
      return 0;

    case 4:
      if (player.STRENGTH > 3) {
        updateLog(`The ${monster} stung you! You feel weaker${period}`);
        player.setStrength(player.STRENGTH - 1);
      } else updateLog(`The ${monster} stung you!`);
      break;

    case 5:
      updateLog(`The ${monster} blasts you with its cold breath${period}`);
      damage = rnd(15) + 18 - armorclass;
      player.losehp(damage);
      return 0;

    case 6:
      if (isCarrying(OLIFEPRESERVER)) {
        /* Life preserver prevents all drain life attacks */
        return 0;
      }
      updateLog(`The ${monster} drains you of your life energy!`);
      player.loselevel();
      if (monster.matches(DEMONPRINCE)) {
        player.losemspells(1);
      }
      if (monster.matches(LUCIFER)) {
        player.loselevel();
        player.losemspells(2);
      }
      // beep();
      return 0;

    case 7:
      updateLog(`The ${monster} got you with a gusher!`);
      damage = rnd(15) + 25 - armorclass;
      player.losehp(damage);
      return 0;

    case 8:
      if (isCarrying(ONOTHEFT)) return 0; /* he has a device of no theft */
      if (player.GOLD) {
        updateLog(`The ${monster} hit you -- your purse feels lighter${period}`);
        if (player.GOLD > 32767)
          player.setGold(player.GOLD >> 1);
        else
          player.setGold(player.GOLD - rnd(1 + (player.GOLD >> 1)));
      } else updateLog(`The ${monster} couldn't find any gold to steal${period}`);
      /* 12.4.5 and ularn */
      /* put the monster back somewhere on the level */
      teleportMonster(xx, yy);
      beep();
      return 1;

    case 9:
      for (var j = 50;;) {
        /* disenchant */
        var rndItem = rund(26);
        let item = player.inventory[rndItem]; /* randomly select item */
        if (item && item.arg > 0 && !item.matches(OSCROLL) && !item.matches(OPOTION)) {
          if ((item.arg -= 3) < 0) item.arg = 0;
          updateLog(`The ${monster} hits you with a spell of disenchantment!`);
          updateLog(`  ${getCharFromIndex(rndItem)}) ${item}`);
          beep();
          recalc();
          return 0;
        }
        if (--j <= 0) {
          updateLog(`The ${monster} nearly misses${period}`);
        }
        break;
      }
      break;

    case 10:
      updateLog(`The ${monster} hit you with its barbed tail${period}`);
      damage = rnd(25) - armorclass;
      player.losehp(damage);
      return 0;

    case 11:
      updateLog(`The ${monster} has confused you${period}`);
      player.CONFUSE += 10 + rnd(10);
      break;

    case 12:
      /* performs any number of other special attacks */
      return spattack(monster, spsel[rund(10)], xx, yy);

    case 13:
      updateLog(`The ${monster} flattens you with its psionics!`);
      damage = rnd(15) + 30 - armorclass;
      player.losehp(damage);
      return 0;

    case 14: {
      if (isCarrying(ONOTHEFT)) return 0; /* he has device of no theft */
      if (emptyhanded()) {
        updateLog(`The ${monster} couldn't find anything to steal${period}`);
        break;
      }
      updateLog(`The ${monster} picks your pocket and takes: `);
      let item = stealsomething();
      if (!item) updateLog(`  nothing${period}`);
      /* put the stolen item into the monsters inventory */
      monsterAt(xx, yy).pickup(item);
      /* 12.4.5 and ularn */
      /* put the monster back somewhere on the level */
      teleportMonster(xx, yy);
      beep();
      recalc();
      return 1;
    }
    case 15: // bugbear
      damage = rnd(10) + 5 - armorclass;
      // fall through

    case 16: // osequip
      if (damage == null) damage = rnd(15) + 10 - armorclass;
      updateLog(`The ${monster} bit you!`);
      player.losehp(damage);
      return 0;

  }

  recalc();
  return 0;
}



function teleportMonster(x, y) {
  let oldMonster = monsterAt(x, y);
  killMonster(x, y);

  let newMonster = fillmonst(oldMonster.arg);
  if (!newMonster) return; // fillmonst failed, so bail out

  /* restore inventory & hp */
  newMonster.inventory = oldMonster.inventory;
  newMonster.hitpoints = oldMonster.hitpoints;
}



function killMonster(x, y) {
  player.level.monsters[x][y] = null;
  if (lasthx == x && lasthy == y) {
    lasthx = 0;
    lasthy = 0;
  }
  player.level.know[x][y] &= ~KNOWHERE;
}