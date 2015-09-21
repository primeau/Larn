"use strict";

var Player = function Player() {
  this.inventory = [];
  for (var i = 0; i < MAXINVEN; i++) {
    this.inventory[i] = null;
  }

  this.knownPotions = [];
  this.knownScrolls = [];
  this.knownSpells = [];

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

  this.getChar = function() {
    if (amiga_mode)
      return `${divstart}player${divend}`;
    else
      return this.char;
  };

  /*
      losehp(x)
      losemhp(x)

      subroutine to remove hit points from the player
      warning -- will kill player if hp goes to zero
   */
  this.losehp = function(damage) {
    if (damage <= 0) return;
    changedHP = millis();
    debug(`losehp: ${lastmonst}:${damage}`);
    this.HP -= damage;
    if (this.HP <= 0) {
      beep();
      //nap(3000);
      died(lastnum, true); /* slain by something */
    }
  };

  this.losemhp = function(x) {
    if (x <= 0) return;
    changedHP = millis();
    changedHPMax = true;
    this.HP = Math.max(1, this.HP - x);
    this.HPMAX = Math.max(1, this.HPMAX - x);
  };

  /*
      raisehp(x)
      raisemhp(x)

      subroutine to gain maximum hit points
   */
  this.raisehp = function(x) {
    if (x <= 0) return;
    changedHP = millis();
    this.HP = Math.min(this.HP + x, this.HPMAX);
  };

  this.raisemhp = function(x) {
    if (x <= 0) return;
    changedHP = millis();
    changedHPMax = true;
    this.HP += x;
    this.HPMAX += x;
  };


  /*
      raisemspells(x)

      subroutine to gain maximum spells
  */
  this.raisemspells = function(x) {
    if (x <= 0) return;
    changedSpells = true;
    changedSpellsMax = true;
    this.SPELLMAX += x;
    player.SPELLS += x;
  };


  /*
      losemspells(x)

      subroutine to lose maximum spells
  */
  this.losemspells = function(x) {
    if (x <= 0) return;
    changedSpells = true;
    changedSpellsMax = true;
    player.SPELLMAX = Math.max(1, player.SPELLMAX - x);
    player.SPELLS = Math.max(1, player.SPELLS - x);
  };


  /*
      raiselevel()

      subroutine to raise the player one level
      uses the SKILL[] array to find level boundarys
      uses c[EXPERIENCE]  c[LEVEL]
   */
  this.raiselevel = function() {
    if (player.LEVEL < MAXPLEVEL) {
      changedLevel = true;
      player.raiseexperience(SKILL[player.LEVEL] - player.EXPERIENCE);
    }
  };


  /*
      loselevel()

      subroutine to lower the players character level by one
   */
  this.loselevel = function() {
    if (player.LEVEL > 1) {
      changedLevel = true;
      player.loseexperience((player.EXPERIENCE - SKILL[player.LEVEL - 1] + 1));
    }
  };


  /*
      raiseexperience(x)
      subroutine to increase experience points
   */
  this.raiseexperience = function(x) {
    changedExp = true;
    var oldLevel = player.LEVEL;
    player.EXPERIENCE += x;
    while (player.EXPERIENCE >= SKILL[player.LEVEL] && (player.LEVEL < MAXPLEVEL)) {
      var tmp = (player.CONSTITUTION - getDifficulty()) >> 1;
      player.LEVEL++;
      player.raisemhp((rnd(3) + rnd((tmp > 0) ? tmp : 1)));
      player.raisemspells(rund(3));
      if (player.LEVEL < 7 - getDifficulty()) {
        player.raisemhp((player.CONSTITUTION >> 2));
      }
    }
    if (player.LEVEL != oldLevel) {
      beep();
      changedLevel = true;
      updateLog("Welcome to level " + player.LEVEL); /* if we changed levels */
    }
  };


  /*
      loseexperience(x)

      subroutine to lose experience points
   */
  this.loseexperience = function(x) {
    changedExp = true;
    var oldLevel = player.LEVEL;
    player.EXPERIENCE = Math.max(0, player.EXPERIENCE - x);
    while (player.EXPERIENCE < SKILL[player.LEVEL - 1]) {
      if (--player.LEVEL <= 1) {
        player.LEVEL = 1; /*  down one level      */
      }
      var tmp = (player.CONSTITUTION - getDifficulty()) >> 1; /* lose hpoints */
      player.losemhp(rnd((tmp > 0) ? tmp : 1)); /* lose hpoints */
      if (player.LEVEL < 7 - getDifficulty()) {
        player.losemhp((player.CONSTITUTION >> 2));
      }
      player.losemspells(rund(3)); /*  lose spells     */
    }
    if (oldLevel != player.LEVEL) {
      cursors();
      beep();
      changedLevel = true;
      updateLog(`  You went down to level ${player.LEVEL}!`);
    }
  };


  /*
      function to change character levels as needed when taking/dropping an object
      that affects these characteristics
   */
  this.adjustcvalues = function(item, pickup) {
    var oldDex = player.DEXTERITY;
    var oldStr = player.STREXTRA;
    var oldInt = player.INTELLIGENCE;

    if (item.matches(ODEXRING))
      player.setDexterity(player.DEXTERITY + (pickup ? item.arg + 1 : (item.arg + 1) * -1));
    if (item.matches(OSTRRING))
      player.setStrExtra(player.STREXTRA + (pickup ? item.arg + 1 : (item.arg + 1) * -1));
    if (item.matches(OCLEVERRING))
      player.setIntelligence(player.INTELLIGENCE + (pickup ? item.arg + 1 : (item.arg + 1) * -1));
    if (item.matches(OHAMMER)) {
      player.setDexterity(player.DEXTERITY + (pickup ? 10 : -10));
      player.setStrExtra(player.STREXTRA + (pickup ? 10 : -10));
      player.setIntelligence(player.INTELLIGENCE + (pickup ? -10 : 10));
    }
    if (item.matches(OSWORDofSLASHING)) {
      player.setDexterity(player.DEXTERITY + (pickup ? 5 : -5));
    }
    if (item.matches(OORBOFDRAGON))
      pickup ? player.SLAYING++ : player.SLAYING--;
    if (item.matches(OSPIRITSCARAB))
      pickup ? player.NEGATESPIRIT++ : player.NEGATESPIRIT--;
    if (item.matches(OCUBEofUNDEAD))
      pickup ? player.CUBEofUNDEAD++ : player.CUBEofUNDEAD--;
    if (item.matches(ONOTHEFT))
      pickup ? player.NOTHEFT++ : player.NOTHEFT--;

    changedDEX = oldDex != player.DEXTERITY;
    changedSTR = oldStr != player.STREXTRA;
    changedINT = oldInt != player.INTELLIGENCE;
  };


  this.setStrExtra = function(x) {
    changedSTR = true;
    this.STREXTRA = x;
  };
  this.setMoreDefenses = function(x) {
    changedAC = true;
    this.MOREDEFENSES = x;
  };



  this.setHP = function(x) {
    changedHP = millis();
    this.HP = x;
  };
  this.setSpells = function(x) {
    changedSpells = true;
    this.SPELLS = x;
  };



  this.setStrength = function(x) {
    changedSTR = true;
    this.STRENGTH = Math.max(3, x);
  };
  this.setIntelligence = function(x) {
    changedINT = true;
    this.INTELLIGENCE = Math.max(3, x);
  };
  this.setWisdom = function(x) {
    changedWIS = true;
    this.WISDOM = Math.max(3, x);
  };
  this.setConstitution = function(x) {
    changedCON = true;
    this.CONSTITUTION = Math.max(3, x);
  };
  this.setDexterity = function(x) {
    changedDEX = true;
    this.DEXTERITY = Math.max(3, x);
  };
  this.setCharisma = function(x) {
    changedCHA = true;
    this.CHARISMA = Math.max(3, x);
  };



  this.setGold = function(x) {
    changedGold = true;
    this.GOLD = Math.max(0, x);
  };



  //  Spells:  1( 1)  AC: 2    WC: 3    Level 1  Exp: 0           novice explorer
  // HP: 10(10)   STR=12 INT=12 WIS=12 CON=12 DEX=12 CHA=12 LV: H  Gold: 0
  this.getStatString = function() {

    if (level == 0) this.TELEFLAG = 0;
    var hpstring = `${pad(this.HP,2,changedHP)}(${pad(this.HPMAX, 2,changedHPMax)})`;
    var output =
      `Spells: ${pad(this.SPELLS,2,changedSpells)}(${pad(this.SPELLMAX,2,changedSpellsMax)})  \
AC: ${pad(this.AC,-4,changedAC)} \
WC: ${pad(this.WCLASS,-4,changedWC)} \
Level ${pad(this.LEVEL,-2,changedLevel)} \
Exp: ${pad(this.EXPERIENCE,-10,changedExp)}${pad(CLASSES[this.LEVEL - 1],0,changedLevel)}\n\
HP: ${pad(hpstring,-1)} \
STR=${pad((this.STRENGTH + this.STREXTRA),-2,changedSTR)} \
INT=${pad(this.INTELLIGENCE,-2,changedINT)} \
WIS=${pad(this.WISDOM,-2, changedWIS)} \
CON=${pad(this.CONSTITUTION,-2,changedCON)} \
DEX=${pad(this.DEXTERITY,-2,changedDEX)} \
CHA=${pad(this.CHARISMA,-2,changedCHA)} \
LV: ${pad((this.TELEFLAG ? "?" : LEVELNAMES[level]),-2,changedDepth)} \
Gold: ${pad(Number(this.GOLD).toLocaleString(),1,changedGold)}`;

    changedSpells = false;
    changedSpellsMax = false;
    changedAC = false;
    changedWC = false;
    changedLevel = false;
    changedExp = false;
    changedHP = false;
    changedHPMax = false;
    changedSTR = false;
    changedINT = false;
    changedWIS = false;
    changedCON = false;
    changedDEX = false;
    changedCHA = false;
    changedDepth = false;
    changedGold = false;

    return output;
  }; //





}; // END PLAYER





var changedHP = false;
var changedHPMax = false;
var changedSpells = false;
var changedSpellsMax = false;
var changedAC = false;
var changedWC = false;
var changedLevel = false;
var changedExp = false;
var changedHP = false;
var changedHPMax = false;
var changedSTR = false;
var changedINT = false;
var changedWIS = false;
var changedCON = false;
var changedDEX = false;
var changedCHA = false;
var changedDepth = false;
var changedGold = false;







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
    lastnum = 279; /* demolished by an unseen attacker */
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
  var item = itemAt(player.x, player.y);

  // player is over a weapon
  if (item.canWield()) {
    appendLog(" wield");
    if (take(item)) {
      forget(); // remove from board
    } else {
      mazeMode = true;
      return 1;
    }
  }
  // wield from inventory
  else {
    if (index == '*' || index == ' ' || index == 'I') {
      if (mazeMode) {
        showinventory(true, wield, showwield, false, false);
      } else {
        mazeMode = true;
        paint();
      }
      nomove = 1;
      return 0;
    }
    if (index == '-') {
      if (player.WIELD) {
        updateLog("You weapon is sheathed");
        player.WIELD = null;
      }
      mazeMode = true;
      return 1;
    }

    var useindex = getIndexFromChar(index);
    item = player.inventory[useindex];

    if (!item) {
      if (useindex >= 0 && useindex < 26) {
        updateLog(`  You don't have item ${index}!`);
      }
      if (useindex <= -1) {
        appendLog(` cancelled`);
        nomove = 1;
      }
      debug(useindex);
      mazeMode = true;
      return 1;
    }

    if (!item.canWield()) {
      updateLog("  You can't wield that!");
      mazeMode = true;
      return 1;
    }
  }

  // common cases for both
  if (player.SHIELD && item.matches(O2SWORD)) {
    updateLog("  But one arm is busy with your shield!");
    mazeMode = true;
    return 1;
  }

  if (index === item) {
    index = getCharFromIndex(player.inventory.indexOf(item));
  }
  updateLog(`  You wield:`);
  updateLog(`${index}) ${item.toString(true)}`);
  player.WIELD = item;

  mazeMode = true;
  return 1;
}



/*
    function to wear armor
 */
function wear(index) {
  var item = itemAt(player.x, player.y);

  // player is over some armor
  if (item.isArmor()) {
    appendLog(" wear");
    if (take(item)) {
      forget(); // remove from board
    } else {
      mazeMode = true;
      return 1;
    }
  } // wear from inventory
  else {
    if (index == '*' || index == ' ' || index == 'I') {
      if (mazeMode) {
        showinventory(true, wear, showwear, false, false);
      } else {
        mazeMode = true;
        paint();
      }
      nomove = 1;
      return 0;
    }

    var useindex = getIndexFromChar(index);
    item = player.inventory[useindex];

    if (!item) {
      if (useindex >= 0 && useindex < 26) {
        updateLog(`  You don't have item ${index}!`);
      }
      if (useindex <= -1) {
        appendLog(` cancelled`);
        nomove = 1;
      }
      mazeMode = true;
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
      mazeMode = true;
      return 1;
    } else {
      player.SHIELD = item;
    }
  } else {
    updateLog("  You can't wear that!");
    mazeMode = true;
    return 1;
  }

  if (index === item) {
    index = getCharFromIndex(player.inventory.indexOf(item));
  }
  updateLog(`  You wear:`);
  updateLog(`${index}) ${item.toString(true)}`);

  mazeMode = true;
  return 1;
}



function game_stats(p) {
  if (!p) p = player;

  var s = "";

  s += "Inventory:\n";
  s += ".) " + Number(p.GOLD).toLocaleString() + " gold pieces\n";
  var c = "a";
  for (var inven = 0; inven < p.inventory.length; inven++) {
    var item = p.inventory[inven];
    if (item) {
      s += c.nextChar(inven) + ") " + item.toString(true, true) + "\n";
    }
  }

  s += `\nBank Account:\n`;
  s += Number(p.BANKACCOUNT).toLocaleString() + " gold pieces\n";

  s += `\nBonuses:\n`;
  s += "+AC:   " + p.MOREDEFENSES + "\n";
  s += "STREX: " + p.STREXTRA + "\n";
  s += "GIAST: " + p.GIANTSTR + "\n";
  s += "HERO:  " + p.HERO + "\n";
  s += "AWARE: " + p.AWARENESS + "\n";
  s += "SEEIN: " + p.SEEINVISIBLE + "\n";
  s += "SPRO:  " + p.SPIRITPRO + "\n";
  s += "UPRO:  " + p.UNDEADPRO + "\n";
  s += "FIRE:  " + p.FIRERESISTANCE + "\n";
  s += "STEL:  " + p.STEALTH + "\n";
  s += "LIFE:  " + p.LIFEPROT + "\n";

  s += `\nMagic:\n`;
  s += "PRO2:  " + p.PROTECTIONTIME + "\n";
  s += "DEX:   " + p.DEXCOUNT + "\n";
  s += "CHM:   " + p.CHARMCOUNT + "\n";
  s += "STR:   " + p.STRCOUNT + "\n";
  s += "INV:   " + p.INVISIBILITY + "\n";
  s += "CAN:   " + p.CANCELLATION + "\n";
  s += "HAS:   " + p.HASTESELF + "\n";
  s += "GLO:   " + p.GLOBE + "\n";
  s += "SCA:   " + p.SCAREMONST + "\n";
  s += "HLD:   " + p.HOLDMONST + "\n";
  s += "STP:   " + p.TIMESTOP + "\n";
  s += "WTW:   " + p.WTW + "\n";
  s += "PRO3:  " + p.ALTPRO + "\n";

  s += `\nCurses:\n`;
  s += "AGGR:  " + p.AGGRAVATE + "\n";
  s += "HSTM:  " + p.HASTEMONST + "\n";
  s += "POIS:  " + p.HALFDAM + "\n";
  s += "CONF:  " + p.CONFUSE + "\n";
  s += "BLIND: " + p.BLINDCOUNT + "\n";
  s += "ITCH:  " + p.ITCHING + "\n";
  s += "CLMSY: " + p.CLUMSINESS + "\n";

  s += `\nSpecial Items:\n`;
  s += "THEFT: " + p.NOTHEFT + "\n";
  s += "CUBE:  " + p.CUBEofUNDEAD + "\n";
  s += "ORB:   " + p.SLAYING + "\n";
  s += "NEGAT: " + p.NEGATESPIRIT + "\n";

  s += `\nLocation:\nx,y:   ${p.x},${p.y}\n`;

  s += `\nCounters:\n`;
  s += "TIME:  " + gtime + "\n";
  s += "RMST:  " + rmst + "\n";
  s += `ENERG: ${p.ENERGY}, ${p.ECOUNTER}\n`;
  s += `REGEN: ${p.REGEN}, ${p.REGENCOUNTER}\n`;

  s += `\nStats:\n`;
  s += "MOVES: " + p.MOVESMADE + "\n";
  s += "KILLS: " + p.MONSTKILLED + "\n";
  s += "CAST:  " + p.SPELLSCAST + "\n";
  // s += "PAINT: " + DEBUG_PAINT + "\n";
  // s += "LPR:   " + DEBUG_LPRCAT + "\n";
  // s += "LPRC:  " + DEBUG_LPRC + "\n";

  s += "\nKnown Spells:\n";
  var count = 0;
  for (var spell = 0; spell < p.knownSpells.length; spell++) {
    var tmp = p.knownSpells[spell];
    if (tmp) {
      s += tmp + " ";
      if (++count % 3 == 0)
        s += "\n";
    }
  }
  if (count % 3) s += "\n";
  s += "\nKnown Scrolls:\n";
  for (var scroll = 0; scroll < p.knownScrolls.length; scroll++) {
    var tmp = p.knownScrolls[scroll];
    if (tmp) s += SCROLL_NAMES[tmp.arg] + "\n";
  }
  s += "\nKnown Potions:\n";
  for (var potion = 0; potion < p.knownPotions.length; potion++) {
    var tmp = p.knownPotions[potion];
    if (tmp) s += POTION_NAMES[tmp.arg] + "\n";
  }

  return s;
}
