"use strict";


const MAXPLEVEL = 100; /* maximum player level allowed        */

var Player = {
  inventory: [],
  x: 0,
  y: 0,
  level: null,

  STRENGTH: 12,
  INTELLIGENCE: 12,
  WISDOM: 12,
  CONSTITUTION: 12,
  DEXTERITY: 12,
  CHARISMA: 12,
  HPMAX: 10,
  HP: 10,
  GOLD: 0,
  EXPERIENCE: 0,
  LEVEL: 1,
  REGEN: 1,
  WCLASS: 0,
  AC: 0,
  // BANKACCOUNT:
  SPELLMAX: 1,
  SPELLS: 1,
  ENERGY: 0,
  // ECOUNTER:
  MOREDEFENSES: 0,
  WEAR: null,
  // PROTECTIONTIME:
  WIELD: null,
  // AMULET:           // UNUSED
  // REGENCOUNTER:
  MOREDAM: 0,
  // DEXCOUNT:
  // STRCOUNT:
  // BLINDCOUNT:
  CAVELEVEL: function() {
    return this.level.depth;
  },
  CONFUSE: 0,
  ALTPRO: 0,
  HERO: 0,
  // CHARMCOUNT:
  // INVISIBILITY:
  // CANCELLATION:
  //HASTESELF: 0,
  // EYEOFLARN:        // UNUSED
  AGGRAVATE: 0,
  // GLOBE:
  // TELEFLAG:
  SLAYING: 0,
  NEGATESPIRIT: 0,
  // SCAREMONST:
  AWARENESS: 0,
  HOLDMONST: 0,
  TIMESTOP: 0,
  HASTEMONST: 0,
  CUBEofUNDEAD: 0,
  GIANTSTR: 0,
  FIRERESISTANCE: 0,
  BESSMANN: 0,
  NOTHEFT: 0,
  HARDGAME: 0,
  // CPUTIME:
  // BYTESIN:
  // BYTESOUT:
  // MOVESMADE:
  MONSTKILLED: 0,
  // SPELLSCAST:
  LANCEDEATH: null,
  SPIRITPRO: 0,
  UNDEADPRO: 0,
  SHIELD: null,
  STEALTH: 0,
  // ITCHING:
  // LAUGHING:         // UNUSED
  // DRAINSTRENGTH:    // UNUSED
  // CLUMSINESS:
  // INFEEBLEMENT:     // UNUSED
  HALFDAM: 0,
  SEEINVISIBLE: 0,
  // FILLROOM:
  // RANDOMWALK:
  // SPHCAST:    /* nz if an active sphere of annihilation */
  WTW: 0,        /* walk through walls */
  STREXTRA: 0,   /* character strength due to objects or enchantments */
  // TMP:        /* misc scratch space */
  LIFEPROT: 0,   /* life protection counter */

  CLASS: function() {
    return CLASSES[this.LEVEL - 1];
  },


  /*
      losehp(x)
      losemhp(x)

      subroutine to remove hit points from the player
      warning -- will kill player if hp goes to zero
   */
  losehp: function(damage) {
    debug("losehp: damage: " + damage);
    this.HP -= damage;
    if (this.HP <= 0) {
      debug("losehp: DEATH!: " + damage);
      beep();
      nap(3000);
      died(lastnum);
    }
  },

  losemhp: function(x) {
    this.HP = Math.max(1, this.HP - x);
    this.HPMAX = Math.max(1, this.HPMAX - x);
  },


  /*
      function to calculate the pack weight of the player
      returns the number of pounds the player is carrying
   */
  packweight: function() {
    var weight = 50;
    debug("TODO: player.packweight() (returning " + weight + ")");
    return weight;
    // register int i, j=25, k;
    //
    // k=c[GOLD]/1000;
    // while ((iven[j]==0) && (j>0))
    // --j;
    // for (i=0; i<=j; i++)
    //     switch(iven[i])
    //         {
    //     case 0:
    //     break;
    //     case OSSPLATE:
    //     case OPLATEARMOR:
    //     k += 40;
    //     break;
    //     case OPLATE:
    //     k += 35;
    //     break;
    //     case OHAMMER:
    //     k += 30;
    //     break;
    //     case OSPLINT:
    //     k += 26;
    //     break;
    //     case OSWORDofSLASHING:
    //     case OCHAIN:
    //     case OBATTLEAXE:
    //     case O2SWORD:
    //     k += 23;
    //     break;
    //     case OLONGSWORD:
    //     case OSWORD:
    //     case ORING:
    //     case OFLAIL:
    //     k += 20;
    //     break;
    //     case OLANCE:
    //     case OSTUDLEATHER:
    //     k += 15;
    //     break;
    //     case OLEATHER:
    //     case OSPEAR:
    //     k += 8;
    //     break;
    //     case OORBOFDRAGON:
    //     case OBELT:
    //     k += 4;
    //     break;
    //     case OSHIELD:
    //     k += 7;
    //     break;
    //     case OCHEST:
    //     k += 30 + ivenarg[i];
    //     break;
    //     default:
    //     k++;
    //     break;
    //         };
    // return(k);
  }, // packweight

  /*
      raisehp(x)
      raisemhp(x)

      subroutine to gain maximum hit points
   */
  raisehp: function(x) {
    this.HP = Math.min(this.HP + x, this.HPMAX);
  },

  raisemhp: function(x) {
    this.HP += x;
    this.HPMAX += x;
  },


  /*
      raisemspells(x)

      subroutine to gain maximum spells
  */
  raisemspells: function(x) {
    this.SPELLMAX += x;
    player.SPELLS += x;
  },


  /*
      losemspells(x)

      subroutine to lose maximum spells
  */
  losemspells: function(x) {
    player.SPELLMAX = Math.max(0, player.SPELLMAX - x);
    player.SPELLS = Math.max(0, player.SPELLS - x);
  },


  /*
      raiselevel()

      subroutine to raise the player one level
      uses the skill[] array to find level boundarys
      uses c[EXPERIENCE]  c[LEVEL]
   */
  raiselevel: function() {
    if (player.LEVEL < MAXPLEVEL) {
      player.raiseexperience(skill[player.LEVEL] - player.EXPERIENCE);
    }
  },


  /*
      loselevel()

      subroutine to lower the players character level by one
   */
  loselevel: function() {
    if (player.LEVEL > 1) loseexperience((player.EXPERIENCE - skill[player.LEVEL - 1] + 1));
  },


  /*
      raiseexperience(x)
      subroutine to increase experience points
   */
  raiseexperience: function(x) {
    var i = player.LEVEL;
    player.EXPERIENCE += x;
    while (player.EXPERIENCE >= skill[player.LEVEL] && (player.LEVEL < MAXPLEVEL)) {
      var tmp = (player.CONSTITUTION - player.HARDGAME) >> 1;
      player.LEVEL++;
      player.raisemhp((rnd(3) + rnd((tmp > 0) ? tmp : 1)));
      player.raisemspells(rund(3));
      if (player.LEVEL < 7 - player.HARDGAME) {
        player.raisemhp((player.CONSTITUTION >> 2));
      }
    }
    if (player.LEVEL != i) {
      beep();
      updateLog("Welcome to level " + player.LEVEL); /* if we changed levels */
    }
    player.level.paint();
  },


  /*
      loseexperience(x)

      subroutine to lose experience points
   */
  loseexperience: function(x) {
    var i = player.LEVEL;
    player.EXPERIENCE = Math.max(0, player.EXPERIENCE - x);
    while (player.EXPERIENCE < skill[player.LEVEL - 1]) {
      if (--player.LEVEL <= 1) {
        player.LEVEL = 1; /*  down one level      */
      }
      var tmp = (player.CONSTITUTION - player.HARDGAME) >> 1; /* lose hpoints */
      player.losemhp(rnd((tmp > 0) ? tmp : 1)); /* lose hpoints */
      if (player.LEVEL < 7 - player.HARDGAME) {
        player.losemhp((player.CONSTITUTION >> 2));
      }
      player.losemspells(rund(3)); /*  lose spells     */
    }
    if (i != player.LEVEL) {
      cursors();
      beep();
      updateLog(`You went down to level ${player.LEVEL}!`);
    }
    bottomline();
  },


  /*
      function to change character levels as needed when taking/dropping an object
      that affects these characteristics
   */
  adjustcvalues: function(item, pickup) {
    if (item.matches(ODEXRING))
      player.DEXTERITY += pickup ? item.arg + 1 : (item.arg + 1) * -1;
    if (item.matches(OSTRRING))
      player.STREXTRA += pickup ? item.arg + 1 : (item.arg + 1) * -1;
    if (item.matches(OCLEVERRING))
      player.INTELLIGENCE += pickup ? item.arg + 1 : (item.arg + 1) * -1;
    if (item.matches(OHAMMER)) {
      player.DEXTERITY += pickup ? player.DEXTERITY + 10 : player.DEXTERITY - 10;
      player.STREXTRA += pickup ? player.STREXTRA + 10 : player.STREXTRA - 10;
      player.INTELLIGENCE += pickup ? player.INTELLIGENCE - 10 : player.INTELLIGENCE + 10;
    }
    if (item.matches(OSWORDofSLASHING)) {
      player.DEXTERITY += pickup ? 5 : - 5;
    }
    if (item.matches(OORBOFDRAGON))
      player.SLAYING = pickup;
    if (item.matches(OSPIRITSCARAB))
      player.NEGATESPIRIT = pickup;
    if (item.matches(OCUBEofUNDEAD))
      player.CUBEofUNDEAD = pickup;
    if (item.matches(ONOTHEFT))
      player.NOTHEFT = pickup;
    if (item.matches(OLANCE)) {
      if (!pickup) {
        player.LANCEDEATH = null;
      } else if (player.WIELD != null && player.WIELD.matches(OLANCE)) {
        player.LANCEDEATH = item;
      }
    }
  },


  /*
      recalc()    function to recalculate the weapon and armor class of the player
   */
  recalc: function() {
    player.WCLASS = 0;
    player.AC = 0;

    if (player.WEAR != null) {
      let armor = player.WEAR;
      let extra = armor.arg;
      if (armor.matches(OSHIELD)) player.AC = 2 + extra;
      if (armor.matches(OLEATHER)) player.AC = 2 + extra;
      if (armor.matches(OSTUDLEATHER)) player.AC = 3 + extra;
      if (armor.matches(ORING)) player.AC = 5 + extra;
      if (armor.matches(OCHAIN)) player.AC = 6 + extra;
      if (armor.matches(OSPLINT)) player.AC = 7 + extra;
      if (armor.matches(OPLATE)) player.AC = 9 + extra;
      if (armor.matches(OPLATEARMOR)) player.AC = 10 + extra;
      if (armor.matches(OSSPLATE)) player.AC = 12 + extra;
    }
    if (player.SHIELD != null && player.SHIELD.matches(OSHIELD)) {
      player.AC += 2 + player.SHIELD.arg;
    }
    player.AC += player.MOREDEFENSES;

    if (player.WIELD != null) {
      let weapon = player.WIELD;
      let extra = weapon.arg;
      if (weapon.matches(ODAGGER)) player.WCLASS = 3 + extra;
      if (weapon.matches(OBELT)) player.WCLASS = 7 + extra;
      if (weapon.matches(OSHIELD)) player.WCLASS = 8 + extra;
      if (weapon.matches(OSPEAR)) player.WCLASS = 10 + extra;
      if (weapon.matches(OFLAIL)) player.WCLASS = 14 + extra;
      if (weapon.matches(OBATTLEAXE)) player.WCLASS = 17 + extra;
      if (weapon.matches(OLANCE)) player.WCLASS = 19 + extra;
      if (weapon.matches(OLONGSWORD)) player.WCLASS = 22 + extra;
      if (weapon.matches(O2SWORD)) player.WCLASS = 26 + extra;
      if (weapon.matches(OSWORD)) player.WCLASS = 32 + extra;
      if (weapon.matches(OSWORDofSLASHING)) player.WCLASS = 30 + extra;
      if (weapon.matches(OHAMMER)) player.WCLASS = 35 + extra;
    }
    player.WCLASS += player.MOREDAM;

    player.REGEN = 1;
    player.ENERGY = 0;

    for (var i = 0; i < player.inventory.length; i++) {
      let item = player.inventory[i];
      if (item == null)
        continue;

      if (item.matches(OBELT)) player.WCLASS += ((item.arg << 1)) + 2;

      /*  now for regeneration abilities based on rings   */
      if (item.matches(OPROTRING)) player.AC += item.arg + 1;
      if (item.matches(ODAMRING)) player.WCLASS += item.arg + 1;
      if (item.matches(OREGENRING)) player.REGEN += item.arg + 1;
      if (item.matches(ORINGOFEXTRA)) player.REGEN += 5 * (item.arg + 1);
      if (item.matches(OENERGYRING)) player.ENERGY += item.arg + 1;
    }
  },



  getStatString: function() {
    var output = "";
    output += "Spells: " + this.SPELLS + "(" + this.SPELLMAX + ")  " +
      "AC: " + this.AC + "  " +
      "WC: " + this.WCLASS + "  " +
      "Level " + this.LEVEL + " " +
      "Exp: " + this.EXPERIENCE + "  " + this.CLASS() + "\n" +
      "HP: " + this.HP + "(" + this.HPMAX + ") " +
      "STR=" + (this.STRENGTH + this.STREXTRA) + " " +
      "INT=" + this.INTELLIGENCE + " " +
      "WIS=" + this.WISDOM + " " +
      "CON=" + this.CONSTITUTION + " " +
      "DEX=" + this.DEXTERITY + " " +
      "CHA=" + this.CHARISMA + " " +
      "LV: " + (this.CAVELEVEL() <= 10 ? (this.CAVELEVEL() == 0 ? "H" : this.CAVELEVEL()) : "V" + (this.CAVELEVEL() - 10)) + " " +
      "Gold: " + this.GOLD;
    return output;
  }, //

};

/*
 *  ifblind(x,y)    Routine to put "monster" or the monster name into lastmosnt
 *      int x,y;
 *
 *  Subroutine to copy the word "monster" into lastmonst if the player is blind
 *  Enter with the coordinates (x,y) of the monster
 *  Returns true or false.
 */
function ifblind(x, y) {
  if (player.BLINDCOUNT > 0) {
    lastnum = 279;
    lastmonst = "monster";
    return true;
  } else {
    lastnum = player.level.monsters[x][y];
    lastmonst = player.level.monsters[x][y].name;
    return false;
  }
}

/*
    function to wield a weapon
 */
function wield(index) {

  var item = getItem(player.x, player.y);

  // player is over a weapon
  if (item.isWeapon()) {
    switch (index) {
      case ESC:
      case 'i':
        updateLog("ignore");
        return;
      case 'w':
        updateLog("wield");
        if (take(item)) {
          forget(); // remove from board
        } else {
          return;
        }
        break; // code lower down will do the rest
      case 't':
        updateLog("take");
        if (take(item)) {
          forget(); // remove from board
        }
        return;
      default:
        return;
    };
  }
  // player hit 'w'
  else {
    //debug("wield(): " + index);

    if (index == ESC) {
      updateLog("");
      return false;
    }

    if (index == '*') {
      // TODO
      // i = showwield();
      // cursors();
    }

    var useindex = getIndexFromChar(index);
    item = player.inventory[useindex];

    if (item == null) {
      if (useindex >= 0 && useindex < 26) {
        updateLog("You don't have item " + index + "!");
      }
      return;
    }

    if (item.matches(OPOTION) || item.matches(OSCROLL)) {
      updateLog("You can't wield that!");
      return;
    }

  }

  // common cases for both
  if (player.SHIELD != null && item.matches(O2SWORD)) {
    updateLog("But one arm is busy with your shield!");
    return;
  }

  if (index == '-') {
    // TODO
    // player.WIELD = null;
    // bottomline();
    // recalc(); // JRP added
    // return;
  }

  player.WIELD = item;
  if (item.matches(OLANCE)) {
    player.LANCEDEATH = item;
  } else {
    player.LANCEDEATH = null;
  }

  player.level.paint();
  return;
}


/*
    function to wear armor
 */
function wear(index) {
  var item = getItem(player.x, player.y);

  // player is over some armor
  if (item.isArmor()) {
    switch (index) {
      case ESC:
      case 'i':
        updateLog("ignore");
        return;
      case 'W':
        updateLog("wear");
        if (take(item)) {
          forget(); // remove from board
        } else {
          return;
        }
        break; // code lower down will do the rest
      case 't':
        updateLog("take");
        if (take(item)) {
          forget(); // remove from board
        }
        return;
      default:
        return;
    };
  } // else player hit 'W'
  else {
    if (index == ESC) {
      updateLog("");
      return false;
    }

    if (index == '*') {
      // TODO
      // i = showwear();
      // cursors();
    }

    var useindex = getIndexFromChar(index);
    item = player.inventory[useindex];

    if (item == null) {
      if (useindex >= 0 && useindex < 26) {
        updateLog("You don't have item " + index + "!");
      }
      return;
    }
  }
  // common cases for both
  if (
    item.matches(OLEATHER) ||
    item.matches(OCHAIN) ||
    item.matches(OPLATE) ||
    item.matches(ORING) ||
    item.matches(OSPLINT) ||
    item.matches(OPLATEARMOR) ||
    item.matches(OSTUDLEATHER) ||
    item.matches(OSSPLATE)) {
    player.WEAR = item;
  } else if (item.matches(OSHIELD)) {
    if (player.WIELD != null && player.WIELD.matches(O2SWORD)) {
      updateLog("Your hands are busy with the two handed sword!");
      return;
    } else {
      player.SHIELD = item;
    }
  } else {
    updateLog("You can't wear that!");
    return;
  }

  player.level.paint();
  return;
}


function game_stats() {
  var s = "";
  s += "X:     " + player.x + "\n";
  s += "Y:     " + player.y + "\n";

  // s += "LV:    " + player.level.depth + "\n";
  // s += "STR:   " + player.STRENGTH + "\n";
  // s += "INT:   " + player.INTELLIGENCE + "\n";
  // s += "WIS:   " + player.WISDOM + "\n";
  // s += "CON:   " + player.CONSTITUTION + "\n";
  // s += "DEX:   " + player.DEXTERITY + "\n";
  // s += "CHA:   " + player.CHARISMA + "\n";
  // s += "HPMAX: " + player.HPMAX + "\n";
  // s += "HP:    " + player.HP + "\n";
  // s += "SPMAX: " + player.SPELLMAX + "\n";
  // s += "SPELL: " + player.SPELLS + "\n";
  // s += "GOLD:  " + player.GOLD + "\n";
  // s += "EXP:   " + player.EXPERIENCE + "\n";
  s += "LEVEL: " + player.LEVEL + "\n";
  // s += "WC:    " + player.WCLASS + "\n";
  // s += "AC:    " + player.AC + "\n";

  s += "ENERG: " + player.ENERGY + "\n";
  s += "REGEN: " + player.REGEN + "\n";

  s += "WIELD: " + player.WIELD + "\n";
  s += "WEAR:  " + player.WEAR + "\n";
  s += "SHLD:  " + player.SHIELD + "\n";

  s += "PRO3: " + player.MOREDEFENSES + "\n";
  s += "ALTPR: " + player.ALTPRO + "\n";

  s += "STREX: " + player.STREXTRA + "\n";
  s += "GIAST: " + player.GIANTSTR + "\n";
  s += "HERO:  " + player.HERO + "\n";

  s += "AGGR:  " + player.AGGRAVATE + "\n";
  s += "HSTM:  " + player.HASTEMONST + "\n";
  s += "POIS:  " + player.HALFDAM + "\n";
  s += "CONF:  " + player.CONFUSE + "\n";

  s += "AWARE: " + player.AWARENESS + "\n";
  s += "SEEIN: " + player.SEEINVISIBLE + "\n";

  s += "SPRO:  " + player.SPIRITPRO + "\n";
  s += "UPRO:  " + player.UNDEADPRO + "\n";
  s += "FIRE:  " + player.FIRERESISTANCE + "\n";

  s += "HOLD:  " + player.HOLDMONST + "\n";
  s += "STEL:  " + player.STEALTH + "\n";
  //s += "HASTE: " + player.HASTESELF + "\n";
  s += "WTW:   " + player.WTW + "\n";

  s += "THEFT: " + player.NOTHEFT + "\n";
  s += "CUBE:  " + player.CUBEofUNDEAD + "\n";
  s += "ORB:   " + player.SLAYING + "\n";
  s += "NEGAT: " + player.NEGATESPIRIT + "\n";

  s += "KILL:  " + player.MONSTKILLED + "\n";
  s += "LANCE: " + player.LANCEDEATH + "\n";
  s += "LIFE:  " + player.LIFEPROT + "\n";

  s += "\n";
  var c = "a";
  for (var inven = 0; inven < player.inventory.length; inven++) {
    var item = player.inventory[inven];
    if (item != null) {
      s += c.nextChar(inven) + ") " + item + "\n";
    }
  }

  return s;
}
