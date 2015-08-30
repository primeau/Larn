"use strict";


const MAXPLEVEL = 100; /* maximum player level allowed        */
const TIMELIMIT = 30000; /* maximum number of moves before the game is called */

var Player = function Player() {
  this.inventory = [];
  this.x = 0;
  this.y = 0;
  this.level = null;
  this.char = `▓`;

  this.STRENGTH = 12;
  this.INTELLIGENCE = 12;
  this.WISDOM = 12;
  this.CONSTITUTION = 12;
  this.DEXTERITY = 12;
  this.CHARISMA = 12;
  this.HPMAX = 10;
  this.HP = 10;
  this.GOLD = 0;
  this.EXPERIENCE = 0;
  this.LEVEL = 1;
  this.REGEN = 1;
  this.WCLASS = 0;
  this.AC = 0;
  this.BANKACCOUNT = 0;
  this.SPELLMAX = 1;
  this.SPELLS = 1;
  this.ENERGY = 0;
  this.ECOUNTER = 96;
  this.MOREDEFENSES = 0;
  this.WEAR = null;
  this.PROTECTIONTIME = 0;
  this.WIELD = null;
  // AMULET =           // UNUSED
  this.REGENCOUNTER = 16;
  this.MOREDAM = 0;
  this.DEXCOUNT = 0;
  this.STRCOUNT = 0;
  this.BLINDCOUNT = 0;
  this.CONFUSE = 0;
  this.ALTPRO = 0;
  this.HERO = 0;
  this.CHARMCOUNT = 0;
  this.INVISIBILITY = 0;
  this.CANCELLATION = 0;
  this.HASTESELF = 0;
  // EYEOFLARN =        // UNUSED
  this.AGGRAVATE = 0;
  this.GLOBE = 0;
  this.TELEFLAG = 0;
  this.SLAYING = 0;
  this.NEGATESPIRIT = 0;
  this.SCAREMONST = 0;
  this.AWARENESS = 0;
  this.HOLDMONST = 0;
  this.TIMESTOP = 0;
  this.HASTEMONST = 0;
  this.CUBEofUNDEAD = 0;
  this.GIANTSTR = 0;
  this.FIRERESISTANCE = 0;
  this.BESSMANN = 0;
  this.NOTHEFT = 0;
  // this.HARDGAME = 0; moved to state.js
  // CPUTIME =
  // BYTESIN =
  // BYTESOUT =
  this.MOVESMADE = 0;
  this.MONSTKILLED = 0;
  this.SPELLSCAST = 0;
  // LANCEDEATH = null; // NOT USING
  this.SPIRITPRO = 0;
  this.UNDEADPRO = 0;
  this.SHIELD = null;
  this.STEALTH = 0;
  this.ITCHING = 0;
  this.LAUGHING = 0; // UNUSED
  this.DRAINSTRENGTH = 0; // UNUSED
  this.CLUMSINESS = 0;
  this.INFEEBLEMENT = 0; // UNUSED
  this.HALFDAM = 0;
  this.SEEINVISIBLE = 0;
  // FILLROOM =
  // RANDOMWALK =
  // SPHCAST =    /* nz if an active sphere of annihilation */
  this.WTW = 0;
  /* walk through walls */
  this.STREXTRA = 0;
  /* character strength due to objects or enchantments */
  // TMP =        /* misc scratch space */
  this.LIFEPROT = 0;
  /* life protection counter */

  this.CLASS = function() {
    return CLASSES[this.LEVEL - 1];
  };


  /*
      losehp(x)
      losemhp(x)

      subroutine to remove hit points from the player
      warning -- will kill player if hp goes to zero
   */
  this.losehp = function(damage) {
    if (damage < 0) return;
    debug(`losehp: ${lastmonst}:${damage}`);
    this.HP -= damage;
    if (this.HP <= 0) {
      beep();
      nap(3000);
      died(lastnum, true);
    }
  };

  this.losemhp = function(x) {
    if (x < 0) return;
    this.HP = Math.max(1, this.HP - x);
    this.HPMAX = Math.max(1, this.HPMAX - x);
  };

  /*
      raisehp(x)
      raisemhp(x)

      subroutine to gain maximum hit points
   */
  this.raisehp = function(x) {
    if (x < 0) return;
    this.HP = Math.min(this.HP + x, this.HPMAX);
  };

  this.raisemhp = function(x) {
    if (x < 0) return;
    this.HP += x;
    this.HPMAX += x;
  };


  /*
      raisemspells(x)

      subroutine to gain maximum spells
  */
  this.raisemspells = function(x) {
    if (x < 0) return;
    this.SPELLMAX += x;
    player.SPELLS += x;
  };


  /*
      losemspells(x)

      subroutine to lose maximum spells
  */
  this.losemspells = function(x) {
    if (x < 0) return;
    player.SPELLMAX = Math.max(0, player.SPELLMAX - x);
    player.SPELLS = Math.max(0, player.SPELLS - x);
  };


  /*
      raiselevel()

      subroutine to raise the player one level
      uses the skill[] array to find level boundarys
      uses c[EXPERIENCE]  c[LEVEL]
   */
  this.raiselevel = function() {
    if (player.LEVEL < MAXPLEVEL) {
      player.raiseexperience(skill[player.LEVEL] - player.EXPERIENCE);
    }
  };


  /*
      loselevel()

      subroutine to lower the players character level by one
   */
  this.loselevel = function() {
    if (player.LEVEL > 1) player.loseexperience((player.EXPERIENCE - skill[player.LEVEL - 1] + 1));
  };


  /*
      raiseexperience(x)
      subroutine to increase experience points
   */
  this.raiseexperience = function(x) {
    var i = player.LEVEL;
    player.EXPERIENCE += x;
    while (player.EXPERIENCE >= skill[player.LEVEL] && (player.LEVEL < MAXPLEVEL)) {
      var tmp = (player.CONSTITUTION - HARDGAME) >> 1;
      player.LEVEL++;
      player.raisemhp((rnd(3) + rnd((tmp > 0) ? tmp : 1)));
      player.raisemspells(rund(3));
      if (player.LEVEL < 7 - HARDGAME) {
        player.raisemhp((player.CONSTITUTION >> 2));
      }
    }
    if (player.LEVEL != i) {
      beep();
      updateLog("Welcome to level " + player.LEVEL); /* if we changed levels */
    }
  };


  /*
      loseexperience(x)

      subroutine to lose experience points
   */
  this.loseexperience = function(x) {
    var i = player.LEVEL;
    player.EXPERIENCE = Math.max(0, player.EXPERIENCE - x);
    while (player.EXPERIENCE < skill[player.LEVEL - 1]) {
      if (--player.LEVEL <= 1) {
        player.LEVEL = 1; /*  down one level      */
      }
      var tmp = (player.CONSTITUTION - HARDGAME) >> 1; /* lose hpoints */
      player.losemhp(rnd((tmp > 0) ? tmp : 1)); /* lose hpoints */
      if (player.LEVEL < 7 - HARDGAME) {
        player.losemhp((player.CONSTITUTION >> 2));
      }
      player.losemspells(rund(3)); /*  lose spells     */
    }
    if (i != player.LEVEL) {
      cursors();
      beep();
      updateLog(`  You went down to level ${player.LEVEL}!`);
    }
    bottomline();
  };


  /*
      function to change character levels as needed when taking/dropping an object
      that affects these characteristics
   */
  this.adjustcvalues = function(item, pickup) {
    if (item.matches(ODEXRING))
      player.DEXTERITY += pickup ? item.arg + 1 : (item.arg + 1) * -1;
    if (item.matches(OSTRRING))
      player.STREXTRA += pickup ? item.arg + 1 : (item.arg + 1) * -1;
    if (item.matches(OCLEVERRING))
      player.INTELLIGENCE += pickup ? item.arg + 1 : (item.arg + 1) * -1;
    if (item.matches(OHAMMER)) {
      player.DEXTERITY += pickup ? 10 : -10;
      player.STREXTRA += pickup ? 10 : -10;
      player.INTELLIGENCE += pickup ? -10 : 10;
    }
    if (item.matches(OSWORDofSLASHING)) {
      player.DEXTERITY += pickup ? 5 : -5;
    }
    if (item.matches(OORBOFDRAGON))
      pickup ? player.SLAYING++ : player.SLAYING--;
    if (item.matches(OSPIRITSCARAB))
      pickup ? player.NEGATESPIRIT++ : player.NEGATESPIRIT--;
    if (item.matches(OCUBEofUNDEAD))
      pickup ? player.CUBEofUNDEAD++ : player.CUBEofUNDEAD--;
    if (item.matches(ONOTHEFT))
      pickup ? player.NOTHEFT++ : player.NOTHEFT--;
  };


  //  Spells:  1( 1)  AC: 2    WC: 3    Level 1  Exp: 0           novice explorer
  // HP: 10(10)   STR=12 INT=12 WIS=12 CON=12 DEX=12 CHA=12 LV: H  Gold: 0
  this.getStatString = function() {
    if (level == 0) player.TELEFLAG = 0;
    var hpstring = `HP: ${pad(this.HP,2)}(${pad(this.HPMAX, 2)})`;
    var output =
      // `Spells: ${pad(this.SPELLS,2)}(${pad(this.SPELLMAX,2)})  AC: ${pad(this.AC,-4)} WC: ${pad(this.WCLASS,-4)} Level ${pad(this.LEVEL,-2)} Exp: ${pad(this.EXPERIENCE,-10)}${this.CLASS()} \n` +
      // `${pad(hpstring,-12)} STR=${pad((this.STRENGTH + this.STREXTRA),-2)} INT=${pad(this.INTELLIGENCE,-2)} WIS=${pad(this.WISDOM,-2)} CON=${pad(this.CONSTITUTION,-2)} DEX=${pad(this.DEXTERITY,-2)} CHA=${pad(this.CHARISMA,-2)} LV: ${pad((player.TELEFLAG ? "?" : levelnames[level]),-2)} Gold: ${Number(this.GOLD).toLocaleString()}`;
`\
Spells: ${pad(this.SPELLS,2)}(${pad(this.SPELLMAX,2)})  \
AC: ${pad(this.AC,-4)} \
WC: ${pad(this.WCLASS,-4)} \
Level ${pad(this.LEVEL,-2)} \
Exp: ${pad(this.EXPERIENCE,-10)}${this.CLASS()}\n\
${pad(hpstring,-12)} \
STR=${pad((this.STRENGTH + this.STREXTRA),-2)} \
INT=${pad(this.INTELLIGENCE,-2)} \
WIS=${pad(this.WISDOM,-2)} \
CON=${pad(this.CONSTITUTION,-2)} \
DEX=${pad(this.DEXTERITY,-2)} \
CHA=${pad(this.CHARISMA,-2)} \
LV: ${pad((player.TELEFLAG ? "?" : levelnames[level]),-2)} \
Gold: ${Number(this.GOLD).toLocaleString()}`;
    return output;
  }; //

};


const levelnames = ["H", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "V1", "V2", "V3"];



/*
 *  ifblind(x,y)    Routine to put "monster" or the monster name into lastmosnt
 *      int x,y;
 *
 *  Subroutine to copy the word "monster" into lastmonst if the player is blind
 *  Enter with the coordinates (x,y) of the monster
 *  Returns true or false.
 */
function ifblind(x, y) {
  // TODO: make this work for when monster hit/miss the player, and die
  if (player.BLINDCOUNT > 0) {
    lastnum = 279;
    lastmonst = "monster";
    return true;
  } else {
    lastnum = player.level.monsters[x][y];
    lastmonst = player.level.monsters[x][y].toString();
    return false;
  }
}



/*
    function to wield a weapon
 */
function wield(index) {
  var item = getItem(player.x, player.y);

  // player is over a weapon
  if (item.canWield()) {
    appendLog(" wield");
    if (take(item)) {
      forget(); // remove from board
    } else {
      IN_STORE = false;
      return 1;
    }
  }
  // wield from inventory
  else {
    if (index == '*' || index == ' ' || index == 'I') {
      if (!IN_STORE) {
        showinventory(true, wield, showwield, false, false);
      } else {
        IN_STORE = false;
        paint();
      }
      nomove = 1;
      return;
    }
    if (index == '-') {
      if (player.WIELD) {
        updateLog("You weapon is sheathed");
        player.WIELD = null;
        bottomline();
        recalc(); // JRP added
      }
      return 1;
    }

    var useindex = getIndexFromChar(index);
    item = player.inventory[useindex];

    if (item == null) {
      if (useindex >= 0 && useindex < 26) {
        updateLog(`  You don't have item ${index}!`);
      }
      if (useindex <= -1) {
        appendLog(` cancelled`);
      }
      debug(useindex);
      IN_STORE = false;
      return 1;
    }

    if (!item.canWield()) {
      updateLog("  You can't wield that!");
      IN_STORE = false;
      return 1;
    }
  }

  // common cases for both
  if (player.SHIELD && item.matches(O2SWORD)) {
    updateLog("  But one arm is busy with your shield!");
    IN_STORE = false;
    return 1;
  }

  if (index === item) {
    index = getCharFromIndex(player.inventory.indexOf(item));
  }
  updateLog(`  You wield:`);
  updateLog(`${index}) ${item.toString(true)}`);
  player.WIELD = item;

  IN_STORE = false;
  return 1;
}



/*
    function to wear armor
 */
function wear(index) {
  var item = getItem(player.x, player.y);

  // player is over some armor
  if (item.isArmor()) {
    appendLog(" wear");
    if (take(item)) {
      forget(); // remove from board
    } else {
      IN_STORE = false;
      return 1;
    }
  } // wear from inventory
  else {
    if (index == '*' || index == ' ' || index == 'I') {
      if (!IN_STORE) {
        showinventory(true, wear, showwear, false, false);
      } else {
        IN_STORE = false;
        paint();
      }
      nomove = 1;
      return;
    }

    var useindex = getIndexFromChar(index);
    item = player.inventory[useindex];

    if (item == null) {
      if (useindex >= 0 && useindex < 26) {
        updateLog(`  You don't have item ${index}!`);
      }
      if (useindex <= -1) {
        appendLog(` cancelled`);
      }
      IN_STORE = false;
      return 1;
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
    if (player.WIELD && player.WIELD.matches(O2SWORD)) {
      updateLog("  Your hands are busy with the two handed sword!");
      IN_STORE = false;
      return 1;
    } else {
      player.SHIELD = item;
    }
  } else {
    updateLog("  You can't wear that!");
    IN_STORE = false;
    return 1;
  }

  if (index === item) {
    index = getCharFromIndex(player.inventory.indexOf(item));
  }
  updateLog(`  You wear:`);
  updateLog(`${index}) ${item.toString(true)}`);

  IN_STORE = false;
  return 1;
}


function game_stats() {
  var s = "";
  s += "X:     " + player.x + "\n";
  s += "Y:     " + player.y + "\n";

  // s += "LV:    " + level + "\n";
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

  s += "ENER:  " + player.ENERGY + "\n";
  s += "ENERC: " + player.ECOUNTER + "\n";
  s += "REGE:  " + player.REGEN + "\n";
  s += "REGEC: " + player.REGENCOUNTER + "\n";
  s += "TIME:  " + gtime + "\n";

  s += "WIELD: " + player.WIELD + "\n";
  s += "WEAR:  " + player.WEAR + "\n";
  s += "SHLD:  " + player.SHIELD + "\n";
  s += "+AC:   " + player.MOREDEFENSES + "\n";

  s += "PRO2:  " + player.PROTECTIONTIME + "\n";
  s += "DEX:   " + player.DEXCOUNT + "\n";
  s += "CHM:   " + player.CHARMCOUNT + "\n";
  s += "STR:   " + player.STRCOUNT + "\n";
  s += "INV:   " + player.INVISIBILITY + "\n";
  s += "CAN:   " + player.CANCELLATION + "\n";
  s += "HAS:   " + player.HASTESELF + "\n";
  s += "GLO:   " + player.GLOBE + "\n";
  s += "SCA:   " + player.SCAREMONST + "\n";
  s += "HLD:   " + player.HOLDMONST + "\n";
  s += "STP:   " + player.TIMESTOP + "\n";
  s += "WTW:   " + player.WTW + "\n";
  s += "PRO3:  " + player.ALTPRO + "\n";

  s += "STREX: " + player.STREXTRA + "\n";
  s += "GIAST: " + player.GIANTSTR + "\n";
  s += "HERO:  " + player.HERO + "\n";

  s += "AWARE: " + player.AWARENESS + "\n";
  s += "SEEIN: " + player.SEEINVISIBLE + "\n";
  s += "SPRO:  " + player.SPIRITPRO + "\n";
  s += "UPRO:  " + player.UNDEADPRO + "\n";
  s += "FIRE:  " + player.FIRERESISTANCE + "\n";
  s += "STEL:  " + player.STEALTH + "\n";

  s += "AGGR:  " + player.AGGRAVATE + "\n";
  s += "HSTM:  " + player.HASTEMONST + "\n";
  s += "POIS:  " + player.HALFDAM + "\n";
  s += "CONF:  " + player.CONFUSE + "\n";
  s += "BLIND: " + player.BLINDCOUNT + "\n";
  s += "ITCH:  " + player.ITCHING + "\n";
  s += "CLMSY: " + player.CLUMSINESS + "\n";

  s += "THEFT: " + player.NOTHEFT + "\n";
  s += "CUBE:  " + player.CUBEofUNDEAD + "\n";
  s += "ORB:   " + player.SLAYING + "\n";
  s += "NEGAT: " + player.NEGATESPIRIT + "\n";
  s += "LIFE:  " + player.LIFEPROT + "\n";

  s += "KILL:  " + player.MONSTKILLED + "\n";
  s += "RMST:  " + rmst + "\n";

  s += "PAINT: " + DEBUG_PAINT + "\n";
  s += "LPR:   " + DEBUG_LPRCAT + "\n";
  s += "LPRC:  " + DEBUG_LPRC + "\n";

  s += "\n";
  var c = "a";
  for (var inven = 0; inven < player.inventory.length; inven++) {
    var item = player.inventory[inven];
    if (item != null) {
      s += c.nextChar(inven) + ") " + item + "\n";
    }
  }
  s += "\n";
  for (var spell = 0; spell < knownSpells.length; spell++) {
    if (knownSpells[spell] != null)
      s += knownSpells[spell] + "\n";
  }

  return s;
}
