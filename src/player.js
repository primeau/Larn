'use strict';

var Player = function Player() {
  this.inventory = [];
  for (var i = 0; i < MAXINVEN; i++) {
    this.inventory[i] = null;
  }

  this.gender = `Male`;
  this.char_picked = `Adventurer`;
  this.ramboflag = false;

  this.knownPotions = [];
  this.knownScrolls = [];
  this.knownSpells = [];

  this.x = 0;
  this.y = 0;
  this.level = null;
  this.char = `▓`;

  this.WEAR = null;
  this.WIELD = null;
  this.SHIELD = null;

  // bottom line stats
  this.SPELLS = 1;
  this.SPELLMAX = 1;
  this.AC = 0;
  this.WCLASS = 0;
  this.LEVEL = 1; /* experience level, not cave level */
  this.EXPERIENCE = 0;
  this.HP = 10;
  this.HPMAX = 10;
  this.STRENGTH = 12;
  this.START_STRENGTH = this.STRENGTH;
  this.INTELLIGENCE = 12;
  this.WISDOM = 12;
  this.CONSTITUTION = 12;
  this.DEXTERITY = 12;
  this.CHARISMA = 12;

  this.GOLD = 0;
  this.BANKACCOUNT = 0;

  //counters
  this.ENERGY = 0;
  this.ECOUNTER = 96;
  this.REGEN = 1;
  this.REGENCOUNTER = 16;

  // bonuses
  this.MOREDEFENSES = 0;
  this.STREXTRA = 0;
  this.GIANTSTR = 0;
  this.HERO = 0;
  this.COKED = 0; // ULARN
  this.AWARENESS = 0;
  this.SEEINVISIBLE = 0;
  this.SPIRITPRO = 0;
  this.UNDEADPRO = 0;
  this.FIRERESISTANCE = 0;
  this.STEALTH = 0;
  this.LIFEPROT = 0;
  this.MOREDAM = 0; // not sure this does anything

  // magic
  this.PROTECTIONTIME = 0;
  this.DEXCOUNT = 0;
  this.CHARMCOUNT = 0;
  this.STRCOUNT = 0;
  this.INVISIBILITY = 0;
  this.CANCELLATION = 0;
  this.HASTESELF = 0;
  this.GLOBE = 0;
  this.SCAREMONST = 0;
  this.HOLDMONST = 0;
  this.TIMESTOP = 0;
  this.WTW = 0;
  this.ALTPRO = 0;

  // curses
  this.AGGRAVATE = 0;
  this.HASTEMONST = 0;
  this.HALFDAM = 0;
  this.CONFUSE = 0;
  this.BLINDCOUNT = 0;
  this.ITCHING = 0;
  this.CLUMSINESS = 0;
  this.LAUGHING = 0; // UNUSED
  this.DRAINSTRENGTH = 0; // UNUSED
  this.INFEEBLEMENT = 0; // UNUSED

  this.TELEFLAG = 0;

  // special items
  this.LAMP = false;
  this.WAND = false;
  this.SLAYING = false; // orb of dragon slaying
  this.NEGATESPIRIT = false;
  this.CUBEofUNDEAD = false;
  this.NOTHEFT = false;
  this.TALISMAN = false;
  this.HAND = false;
  this.ORB = false; // orb of enlightenment
  this.ELVEN = false;
  this.SLASH = false; // sword of slashing
  this.BESSMANNINTEL = 0;
  this.BESSMANN = false;
  this.SLAY = false; // slayer
  this.VORPAL = false;
  this.STAFF = false;
  this.PRESERVER = false;
  this.PAD = false;
  this.ELEVDOWN = false;
  this.ELEVUP = false;

  // this.HARDGAME = 0; moved to state.js

  // stats
  this.MOVESMADE = 0;
  this.MONSTKILLED = 0;
  this.SPELLSCAST = 0;

  /* 12.4.5
  prevent players from selling things once they have found the potion
  to prevent them from racking up the scoreboard
  */
  this.hasPickedUpPotion = false;
  // for larntv
  this.hasPickedUpEye = false;

  this.getChar = function () {
    if (amiga_mode)
      return `${DIV_START}player${DIV_END}`;
    else if (retro_mode) {
      return `<b><font color='white'>@</font></b>`;
    } else {
      return `▓`;
    }
  };

  /*
      losehp(x)
      losemhp(x)

      subroutine to remove hit points from the player
      warning -- will kill player if hp goes to zero
   */
  this.losehp = function (damage) {
    damage = Math.round(damage);
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

  this.losemhp = function (x) {
    if (x <= 0) return;
    changedHP = millis();
    changedHPMax = millis();
    this.HP = Math.max(1, this.HP - x);
    this.HPMAX = Math.max(1, this.HPMAX - x);
  };

  /*
      raisehp(x)
      raisemhp(x)

      subroutine to gain maximum hit points
   */
  this.raisehp = function (x) {
    if (x <= 0) return;
    changedHP = millis();
    this.HP = Math.min(this.HP + x, this.HPMAX);
  };

  this.raisemhp = function (x) {
    if (x <= 0) return;
    changedHP = millis();
    changedHPMax = millis();
    this.HP += x;
    this.HPMAX += x;
  };


  /*
      raisemspells(x)

      subroutine to gain maximum spells
  */
  this.raisemspells = function (x) {
    if (x <= 0) return;
    changedSpells = millis();
    changedSpellsMax = millis();
    this.SPELLMAX += x;
    player.SPELLS += x;
  };


  /*
      losemspells(x)

      subroutine to lose maximum spells
  */
  this.losemspells = function (x) {
    if (x <= 0) return;
    changedSpells = millis();
    changedSpellsMax = millis();
    player.SPELLMAX = Math.max(1, player.SPELLMAX - x);
    player.SPELLS = Math.max(1, player.SPELLS - x);
  };


  /*
      raiselevel()

      subroutine to raise the player one level
      uses the SKILL[] array to find level boundarys
      uses c[EXPERIENCE]  c[LEVEL]
   */
  this.raiselevel = function () {
    if (player.LEVEL < MAXPLEVEL) {
      changedLevel = millis();
      player.raiseexperience(SKILL[player.LEVEL] - player.EXPERIENCE);
    }
  };


  /*
      loselevel()

      subroutine to lower the players character level by one
   */
  this.loselevel = function () {
    if (player.LEVEL > 1) {
      changedLevel = millis();
      player.loseexperience((player.EXPERIENCE - SKILL[player.LEVEL - 1] + 1));
    }
  };


  /*
      raiseexperience(x)
      subroutine to increase experience points
   */
  this.raiseexperience = function (x) {
    changedExp = millis();
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
      changedLevel = millis();
      updateLog(`Welcome to level ${player.LEVEL}${period}`); /* if we changed levels */

      switch (player.LEVEL) {
        case 94:
          /* earth guardian */
          player.WTW = 99999;
          break;
        case 95:
          /* air guardian */
          player.INVISIBILITY = 99999;
          break;
        case 96:
          /* fire guardian */
          player.FIRERESISTANCE = 99999;
          break;
        case 97:
          /* water guardian */
          player.CANCELLATION = 99999;
          break;
        case 98:
          /* time guardian */
          player.HASTESELF = 99999;
          break;
        case 99:
          /* ethereal guardian */
          player.STEALTH = 99999;
          player.SPIRITPRO = 99999;
          break;
        case 100:
          updateLog(`You are now The Creator!`);
          learnAll();
          revealLevel();
          break;
      }
    }

  };


  /*
      loseexperience(x)

      subroutine to lose experience points
   */
  this.loseexperience = function (x) {
    changedExp = millis();
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
      changedLevel = millis();
      updateLog(`  You went down to level ${player.LEVEL}!`);
    }
  };


  /*
      function to change character levels as needed when taking/dropping an object
      that affects these characteristics
   */
  this.adjustcvalues = function (item, pickup) {
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
      var startIntel = player.INTELLIGENCE;
      // our hero might lose < 10 intelligence when picking up the
      // hammer. we don't want them to get 10 back when dropping it.
      // this can still be gamed with rings of intelligence, but 
      // it's better than it was.
      if (pickup) {
        player.setIntelligence(player.INTELLIGENCE - 10);
        player.BESSMANNINTEL = startIntel - player.INTELLIGENCE;
      } else {
        player.setIntelligence(player.INTELLIGENCE + player.BESSMANNINTEL);
      }
    }
    if (item.matches(OSWORDofSLASHING)) {
      player.setDexterity(player.DEXTERITY + (pickup ? 5 : -5));
    }
    if (item.matches(OSLAYER)) {
      player.setIntelligence(player.INTELLIGENCE + (pickup ? 10 : -10));
    }
    if (item.matches(OPSTAFF)) {
      player.setWisdom(player.WISDOM + (pickup ? 10 : -10));
    }
    if (item.matches(OORB) && pickup) {
      player.AWARENESS++;
    }

    if (oldDex != player.DEXTERITY) changedDEX = millis();
    if (oldStr != player.STREXTRA) changedSTR = millis();
    if (oldInt != player.INTELLIGENCE) changedINT = millis();

    if (ULARN && item.matches(OLARNEYE) && player.BLINDCOUNT == 0) {
      updateLog(`Your sight fades for a moment...`);
      //await nap(1000); // ULARN TODO, eventually
      if (pickup) {
        updateLog(`Your sight returns, and everything looks crystal-clear!`);
      } else {
        updateLog(`Your sight returns but everything looks dull and faded${period}`);
      }
    }

  };



  this.setStrExtra = function (x) {
    changedSTR = millis();
    this.STREXTRA = x;
  };
  this.setMoreDefenses = function (x) {
    changedAC = millis();
    this.MOREDEFENSES = x;
  };



  this.setHP = function (x) {
    changedHP = millis();
    this.HP = x;
  };
  this.setSpells = function (x) {
    changedSpells = millis();
    this.SPELLS = x;
  };



  this.setStrength = function (x) {
    changedSTR = millis();
    this.STRENGTH = Math.max(3, x);
  };
  this.setIntelligence = function (x) {
    changedINT = millis();
    this.INTELLIGENCE = Math.max(3, x);
  };
  this.setWisdom = function (x) {
    changedWIS = millis();
    this.WISDOM = Math.max(3, x);
  };
  this.setConstitution = function (x) {
    changedCON = millis();
    this.CONSTITUTION = Math.max(3, x);
  };
  this.setDexterity = function (x) {
    changedDEX = millis();
    this.DEXTERITY = Math.max(3, x);
  };
  this.setCharisma = function (x) {
    changedCHA = millis();
    this.CHARISMA = Math.max(3, x);
  };



  this.setGold = function (x) {
    changedGold = millis();
    this.GOLD = Math.max(0, x);
  };



  this.updateStealth = function (x) {
    var prev = this.STEALTH;
    this.STEALTH = Math.max(0, this.STEALTH + x);
    changedStealth = getUpdateTime(prev, x, this.STEALTH, changedStealth);
    return this.STEALTH;
  };
  this.updateUndeadPro = function (x) {
    var prev = this.UNDEADPRO;
    this.UNDEADPRO = Math.max(0, this.UNDEADPRO + x);
    changedUndeadPro = getUpdateTime(prev, x, this.UNDEADPRO, changedUndeadPro);
    return this.UNDEADPRO;
  };
  this.updateSpiritPro = function (x) {
    var prev = this.SPIRITPRO;
    this.SPIRITPRO = Math.max(0, this.SPIRITPRO + x);
    changedSpiritPro = getUpdateTime(prev, x, this.SPIRITPRO, changedSpiritPro);
    return this.SPIRITPRO;
  };
  this.updateCharmCount = function (x) {
    var prev = this.CHARMCOUNT;
    this.CHARMCOUNT = Math.max(0, this.CHARMCOUNT + x);
    changedCharmCount = getUpdateTime(prev, x, this.CHARMCOUNT, changedCharmCount);
    return this.CHARMCOUNT;
  };
  this.updateTimeStop = function (x) {
    var prev = this.TIMESTOP;
    this.TIMESTOP = Math.max(0, this.TIMESTOP + x);
    changedTimeStop = getUpdateTime(prev, x, this.TIMESTOP, changedTimeStop);
    /* 12.4.5
    fix for last hit monster chasing the player from across the maze
    caused by hitting monster, holding, then running away
    */
    if (x > 0) {
      lasthx = 0;
      lasthy = 0;
    }
    return this.TIMESTOP;
  };
  this.updateHoldMonst = function (x) {
    var prev = this.HOLDMONST;
    this.HOLDMONST = Math.max(0, this.HOLDMONST + x);
    changedHoldMonst = getUpdateTime(prev, x, this.HOLDMONST, changedHoldMonst);
    /* 12.4.5
    fix for last hit monster chasing the player from across the maze
    caused by hitting monster, holding, then running away
    */
    if (x > 0) {
      lasthx = 0;
      lasthy = 0;
    }
    return this.HOLDMONST;
  };
  this.updateGiantStr = function (x) {
    var prev = this.GIANTSTR;
    this.GIANTSTR = Math.max(0, this.GIANTSTR + x);
    changedGiantStr = getUpdateTime(prev, x, this.GIANTSTR, changedGiantStr);
    if (prev <= 0 && this.GIANTSTR > 0) this.setStrExtra(this.STREXTRA + 21);
    if (prev > 0 && this.GIANTSTR <= 0) this.setStrExtra(this.STREXTRA - 20);
    return this.GIANTSTR;
  };
  this.updateFireResistance = function (x) {
    var prev = this.FIRERESISTANCE;
    this.FIRERESISTANCE = Math.max(0, this.FIRERESISTANCE + x);
    changedFireResistance = getUpdateTime(prev, x, this.FIRERESISTANCE, changedFireResistance);
    return this.FIRERESISTANCE;
  };
  this.updateDexCount = function (x) {
    var prev = this.DEXCOUNT;
    this.DEXCOUNT = Math.max(0, this.DEXCOUNT + x);
    changedDexCount = getUpdateTime(prev, x, this.DEXCOUNT, changedDexCount);
    if (prev <= 0 && this.DEXCOUNT > 0) this.setDexterity(this.DEXTERITY + 3);
    if (prev > 0 && this.DEXCOUNT <= 0) this.setDexterity(this.DEXTERITY - 3);
    return this.DEXCOUNT;
  };
  this.updateStrCount = function (x) {
    var prev = this.STRCOUNT;
    this.STRCOUNT = Math.max(0, this.STRCOUNT + x);
    changedStrCount = getUpdateTime(prev, x, this.STRCOUNT, changedStrCount);
    if (prev <= 0 && this.STRCOUNT > 0) this.setStrExtra(this.STREXTRA + 3);
    if (prev > 0 && this.STRCOUNT <= 0) this.setStrExtra(this.STREXTRA - 3);
    return this.STRCOUNT;
  };
  this.updateScareMonst = function (x) {
    var prev = this.SCAREMONST;
    this.SCAREMONST = Math.max(0, this.SCAREMONST + x);
    changedScareMonst = getUpdateTime(prev, x, this.SCAREMONST, changedScareMonst);
    return this.SCAREMONST;
  };
  this.updateHasteSelf = function (x) {
    var prev = this.HASTESELF;
    this.HASTESELF = Math.max(0, this.HASTESELF + x);
    changedHasteSelf = getUpdateTime(prev, x, this.HASTESELF, changedHasteSelf);
    return this.HASTESELF;
  };
  this.updateCancellation = function (x) {
    var prev = this.CANCELLATION;
    this.CANCELLATION = Math.max(0, this.CANCELLATION + x);
    changedCancellation = getUpdateTime(prev, x, this.CANCELLATION, changedCancellation);
    return this.CANCELLATION;
  };
  this.updateInvisibility = function (x) {
    var prev = this.INVISIBILITY;
    this.INVISIBILITY = Math.max(0, this.INVISIBILITY + x);
    changedInvisibility = getUpdateTime(prev, x, this.INVISIBILITY, changedInvisibility);
    return this.INVISIBILITY;
  };
  this.updateAltPro = function (x) {
    var prev = this.ALTPRO;
    this.ALTPRO = Math.max(0, this.ALTPRO + x);
    changedAltPro = getUpdateTime(prev, x, this.ALTPRO, changedAltPro);
    var ALTAR_BOOST = ULARN ? 5 : 3;
    if (prev <= 0 && this.ALTPRO > 0) this.setMoreDefenses(this.MOREDEFENSES + ALTAR_BOOST);
    if (prev > 0 && this.ALTPRO <= 0) this.setMoreDefenses(this.MOREDEFENSES - ALTAR_BOOST);
    return this.ALTPRO;
  };
  this.updateProtectionTime = function (x) {
    var prev = this.PROTECTIONTIME;
    this.PROTECTIONTIME = Math.max(0, this.PROTECTIONTIME + x);
    changedProtectionTime = getUpdateTime(prev, x, this.PROTECTIONTIME, changedProtectionTime);
    if (prev <= 0 && this.PROTECTIONTIME > 0) this.setMoreDefenses(this.MOREDEFENSES + 2);
    if (prev > 0 && this.PROTECTIONTIME <= 0) this.setMoreDefenses(this.MOREDEFENSES - 2);
    return this.PROTECTIONTIME;
  };
  this.updateWTW = function (x) {
    var prev = this.WTW;
    this.WTW = Math.max(0, this.WTW + x);
    changedWTW = getUpdateTime(prev, x, this.WTW, changedWTW);
    return this.WTW;
  };



  /*
  I'd like to do something like this, but it's ES6 only and not supported
  by chrome yet, and I don't want to deal with the transpile step every time
  see: https://github.com/airbnb/javascript#destructuring
  */
  /*
  this.updateProtectionTime = function(x) {
    ({this.PROTECTIONTIME, changedProtectionTime} = this.updateStat(this.PROTECTIONTIME, changedProtectionTime, x));
    return this.PROTECTIONTIME;
  };

  this.updateStat = function(stat, changetime, x) {
    var prev = stat;
    stat = Math.max(0, stat + x);
    if (x > 0 || prev != 0 && stat <= 0)
      changetime = millis();
    return {stat, changetime};
  };
  */



  //  Spells:  1( 1)  AC: 2    WC: 3    Level 1  Exp: 0           novice explorer
  // HP: 10(10)   STR=12 INT=12 WIS=12 CON=12 DEX=12 CHA=12 LV: H  Gold: 0
  this.getStatString = function(lev) {
    if (level < 0) return ``;
    var templevel = LEVELNAMES[level];
    if (lev) templevel = lev;

    if (level == 0) this.TELEFLAG = 0;
    let hppad = this.HPMAX >= 100 ? 3 : 2;
    var output =
      `Spells: ${pad(this.SPELLS,2,changedSpells)}(${pad(this.SPELLMAX,2,changedSpellsMax)})  \
AC: ${pad(this.AC,-4,changedAC)} \
WC: ${pad(this.WCLASS,-4,changedWC)} \
Level ${pad(this.LEVEL,-2,changedLevel)} \
Exp: ${pad(this.EXPERIENCE,-10,changedExp)}${pad(CLASSES[this.LEVEL - 1],16,changedLevel)}               \n\
HP: ${pad(this.HP,hppad,changedHP)}(${pad(this.HPMAX, hppad,changedHPMax)}) \
STR=${pad((this.STRENGTH + this.STREXTRA),-2,changedSTR)} \
INT=${pad(this.INTELLIGENCE,-2,changedINT)} \
WIS=${pad(this.WISDOM,-2, changedWIS)} \
CON=${pad(this.CONSTITUTION,-2,changedCON)} \
DEX=${pad(this.DEXTERITY,-2,changedDEX)} \
CHA=${pad(this.CHARISMA,-2,changedCHA)} \
LV: ${pad((this.TELEFLAG ? `?` : templevel),-2,changedDepth)} \
Gold: ${pad(Number(this.GOLD).toLocaleString(),1,changedGold)}            `;

    return output;
  }; //



  this.setCharacterClass = function (characterClass) {
    this.char_picked = characterClass;
    let selected = false;
    if (characterClass === `Ogre`) {
      learnSpell(`mle`);
      this.SPELLMAX = 1;
      this.SPELLS = 1;
      this.HPMAX = 16;
      this.HP = 16;
      this.STRENGTH = 18;
      this.INTELLIGENCE = 4;
      this.WISDOM = 6;
      this.CONSTITUTION = 16;
      this.DEXTERITY = 6;
      this.CHARISMA = 4;
      take(createObject(OPOTION, rund(6)));
      take(createObject(OPOTION, rund(6)));
      selected = true;
    } else if (characterClass === `Wizard`) {
      learnSpell(`mle`);
      learnSpell(`chm`);
      this.SPELLMAX = 2;
      this.SPELLS = 2;
      this.HPMAX = 8;
      this.HP = 8;
      this.STRENGTH = 8;
      this.INTELLIGENCE = 16;
      this.WISDOM = 16;
      this.CONSTITUTION = 6;
      this.DEXTERITY = 6;
      this.CHARISMA = 8;
      take(createObject(OSCROLL, rund(6)));
      take(createObject(OSCROLL, rund(6)));
      take(createObject(OPOTION, 19)); /* treasure finding */
      selected = true;
    } else if (characterClass === `Klingon`) {
      learnSpell(`ssp`);
      this.SPELLMAX = 1;
      this.SPELLS = 1;
      this.HPMAX = 14;
      this.HP = 14;
      this.STRENGTH = 14;
      this.INTELLIGENCE = 12;
      this.WISDOM = 4;
      this.CONSTITUTION = 12;
      this.DEXTERITY = 8;
      this.CHARISMA = 3;
      let startArmor = createObject(OSTUDLEATHER);
      take(startArmor);
      this.WEAR = startArmor;
      take(createObject(OPOTION, rund(6)));
      selected = true;
    } else if (characterClass === `Elf`) {
      learnSpell(`pro`);
      this.SPELLMAX = 2;
      this.SPELLS = 1; // odd, but true to the original
      this.HPMAX = 8;
      this.HP = 8;
      this.STRENGTH = 8;
      this.INTELLIGENCE = 14;
      this.WISDOM = 12;
      this.CONSTITUTION = 8;
      this.DEXTERITY = 8;
      this.CHARISMA = 14;
      let startArmor = createObject(OLEATHER);
      take(startArmor);
      this.WEAR = startArmor;
      take(createObject(OSCROLL, rund(6)));
      selected = true;
    } else if (characterClass === `Rogue`) {
      learnSpell(`mle`);
      this.SPELLMAX = 1;
      this.SPELLS = 1;
      this.HPMAX = 12;
      this.HP = 12;
      this.STRENGTH = 8;
      this.INTELLIGENCE = 12;
      this.WISDOM = 8;
      this.CONSTITUTION = 10;
      this.DEXTERITY = 14;
      this.CHARISMA = 6;
      let startArmor = createObject(OLEATHER);
      take(startArmor);
      this.WEAR = startArmor;
      let startWeapon = createObject(ODAGGER);
      take(startWeapon);
      this.WIELD = startWeapon;
      take(createObject(OSCROLL, 14)); /* stealth */
      selected = true;
    } else if (characterClass === `Adventurer`) {
      learnSpell(`mle`);
      learnSpell(`pro`);
      this.SPELLMAX = 1;
      this.SPELLS = 1;
      this.HPMAX = 10;
      this.HP = 10;
      this.STRENGTH = 12;
      this.INTELLIGENCE = 12;
      this.WISDOM = 12;
      this.CONSTITUTION = 12;
      this.DEXTERITY = 12;
      this.CHARISMA = 12;
      if (ULARN || getDifficulty() == 0) {
        let startArmor = createObject(OLEATHER);
        take(startArmor);
        this.WEAR = startArmor;
        let startWeapon = createObject(ODAGGER);
        take(startWeapon);
        this.WIELD = startWeapon;
      }
      selected = true;
    } else if (characterClass === `Dwarf`) {
      learnSpell(`pro`);
      this.SPELLMAX = 1;
      this.SPELLS = 1;
      this.HPMAX = 12;
      this.HP = 12;
      this.STRENGTH = 16;
      this.INTELLIGENCE = 6;
      this.WISDOM = 8;
      this.CONSTITUTION = 16;
      this.DEXTERITY = 4;
      this.CHARISMA = 4;
      let startWeapon = createObject(OSPEAR);
      take(startWeapon);
      this.WIELD = startWeapon;
      selected = true;
    } else if (characterClass === `Rambo`) {
      this.SPELLMAX = 0;
      this.SPELLS = 0;
      this.HPMAX = 1;
      this.HP = 1;
      this.STRENGTH = 3;
      this.INTELLIGENCE = 3;
      this.WISDOM = 3;
      this.CONSTITUTION = 3;
      this.DEXTERITY = 3;
      this.CHARISMA = 3;
      let startWeapon = createObject(OLANCE);
      take(startWeapon);
      this.WIELD = startWeapon;
      this.ramboflag = true;
      selected = true;
    }

    /* 12.5.0 fix for ularn: potion of strength defaulted to min 12,
              now default to the starting strength of the character 
    */
    this.START_STRENGTH = this.STRENGTH; // ularn 

    return selected;
  };



  this.setGender = function (newGender) {
    this.gender = newGender;
    return (newGender === `Male` || newGender === `Female` || newGender === `Other`);
  }



  this.getConductString = function(inline) {
    let spellsknownbychar = 1;
    if (this.char_picked === `Wizard`) spellsknownbychar = 2;
    else if (this.char_picked === `Adventurer`) spellsknownbychar = 2;
    else if (this.char_picked === `Rambo`) spellsknownbychar = 0;

    function count (arr) { return arr.filter(x => x != null).length; }
  
    let pacifist = this.MONSTKILLED === 0;
    let illiterate = count(this.knownScrolls) === 0 && count(this.knownSpells) === spellsknownbychar;
    let thirsty = count(this.knownPotions) === 1;
    let spellbound = this.SPELLSCAST === 0;
    
    let conductString = ``;
    const nl = inline ? ` ` : `\n`;
    if (pacifist) conductString += `pacifist${nl}`;
    if (thirsty) conductString += `thirsty${nl}`;
    if (illiterate) conductString += `illiterate${nl}`;
    if (spellbound) conductString += `spellbound${nl}`;
    if (conductString === ``) conductString = `none${nl}`;

    return conductString;
  }

}; // END PLAYER



function getUpdateTime(prevVal, change, newVal, prevTime) {
  if (change > 0 || prevVal != 0 && newVal <= 0) {
    return millis();
  } else {
    return prevTime;
  }
}

var changedHP = 0;
var changedHPMax = 0;
var changedSpells = 0;
var changedSpellsMax = 0;
var changedAC = 0;
var changedWC = 0;
var changedLevel = 0;
var changedExp = 0;
var changedSTR = 0;
var changedINT = 0;
var changedWIS = 0;
var changedCON = 0;
var changedDEX = 0;
var changedCHA = 0;
var changedDepth = 0;
var changedGold = 0;

var changedStealth = 0;
var changedUndeadPro = 0;
var changedSpiritPro = 0;
var changedCharmCount = 0;
var changedTimeStop = 0;
var changedHoldMonst = 0;
var changedGiantStr = 0;
var changedFireResistance = 0;
var changedDexCount = 0;
var changedStrCount = 0;
var changedScareMonst = 0;
var changedHasteSelf = 0;
var changedCancellation = 0;
var changedInvisibility = 0;
var changedAltPro = 0;
var changedProtectionTime = 0;
var changedWTW = 0;

/*
 *  ifblind(x,y)    Routine to put `monster` or the monster name into lastmosnt
 *      int x,y;
 *
 *  Subroutine to copy the word `monster` into lastmonst if the player is blind
 *  Enter with the coordinates (x,y) of the monster
 *  Returns true or false.
 */
function ifblind(x, y) {
  if (player.BLINDCOUNT > 0) {
    lastnum = DIED_UNSEEN_ATTACKER; /* demolished by an unseen attacker */
    lastmonst = `monster`;
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
  if (item.isWeapon()) {
    appendLog(` wield${period}`);
    if (take(item)) {
      forget(); // remove from board
    } else {
      setMazeMode(true);
      return 1;
    }
  }
  // wield from inventory
  else {
    if (index == '*' || index == ' ' || index == 'I') {
      if (mazeMode) {
        showinventory(true, wield, showwield, false, false, true);
      } else {
        setMazeMode(true);
      }
      nomove = 1;
      return 0;
    }
    if (index == '-') {
      if (player.WIELD) {
        updateLog(`You unwield your weapon${period}`);
        player.WIELD = null;
      }
      setMazeMode(true);
      return 1;
    }

    var useindex = getIndexFromChar(index);
    item = player.inventory[useindex];

    if (!item) {
      if (useindex >= 0 && useindex < 26) {
        updateLog(`  You don't have item ${index}!`);
      }
      if (useindex <= -1) {
        appendLog(` cancelled${period}`);
        nomove = 1;
      }
      setMazeMode(true);
      return 1;
    }

    if (!item.canWield()) {
      updateLog(`  You can't wield that!`);
      setMazeMode(true);
      return 1;
    }
  }

  // common cases for both
  if (player.SHIELD && item.matches(O2SWORD)) {
    updateLog(`  But one arm is busy with your shield!`);
    setMazeMode(true);
    return 1;
  }

  /* can't wield and wear at the same time */
  if (ULARN) {
    if (player.SHIELD == item || player.WEAR == item) {
      let arm = item.matches(OSHIELD) ?  `shield` : `armor`;
      updateLog(`  You can't wield your ${arm} while you're wearing it!`);
      return 1;
    }
  }

  if (index === item) {
    index = getCharFromIndex(player.inventory.indexOf(item));
  }
  updateLog(`  You wield:`);
  updateLog(`${index}) ${item.toString(true)}`);
  player.WIELD = item;

  setMazeMode(true);
  return 1;
}



/*
    function to wear armor
 */
function wear(index) {
  var item = itemAt(player.x, player.y);

  // player is over some armor
  if (item.isArmor()) {
    appendLog(` wear${period}`);
    if (take(item)) {
      forget(); // remove from board
    } else {
      setMazeMode(true);
      return 1;
    }
  } // wear from inventory
  else {
    if (index == '*' || index == ' ' || index == 'I') {
      if (mazeMode) {
        showinventory(true, wear, showwear, false, false, true);
      } else {
        setMazeMode(true);
      }
      nomove = 1;
      return 0;
    }

    if (index == '-') {
      if (player.SHIELD) {
        player.SHIELD = null;
        updateLog(`Your shield is off${period}`);
      } else if (player.WEAR) {
        player.WEAR = null;
        updateLog(`Your armor is off${period}`);
      } else {
        updateLog(`You aren't wearing anything${period}`);
      }
      setMazeMode(true);
      return 1;
    }

    var useindex = getIndexFromChar(index);
    item = player.inventory[useindex];

    if (!item) {
      if (useindex >= 0 && useindex < 26) {
        updateLog(`  You don't have item ${index}!`);
      }
      if (useindex <= -1) {
        appendLog(` cancelled${period}`);
        nomove = 1;
      }
      setMazeMode(true);
      return 1;
    }
  }

  // common cases for both

  if (item.isArmor()) {
    /* can't wield and wear at the same time */
    if (ULARN) {
      if (player.WIELD == item) {
        let arm = item.matches(OSHIELD) ?  `shield` : `armor`;
        updateLog(`  You can't wear your ${arm} while you're wielding it!`);  
        return 1;
      }
    }
    if (item.matches(OSHIELD)) {
      if (player.WIELD && player.WIELD.matches(O2SWORD)) {
        updateLog(`  Your hands are busy with the two handed sword!`);
        setMazeMode(true);
        return 1;
      } else {
        player.SHIELD = item;
      }
    } else {
      player.WEAR = item;
    }
  } else {
    updateLog(`  You can't wear that!`);
    setMazeMode(true);
    return 1;
  }

  if (index === item) {
    index = getCharFromIndex(player.inventory.indexOf(item));
  }

  updateLog(`  You wear:`);
  updateLog(`${index}) ${item.toString(true)}`);

  setMazeMode(true);
  return 1;
}



function game_stats(p, endgame) {

  if (!p) p = player;

  var s = endgame ? `Inventory:\n` : ``;

  if (endgame) {
    s += `.) ` + Number(p.GOLD).toLocaleString() + ` gold pieces\n`;
  }
  var inv = showinventory(false, null, showall, false, false, false, p); //HACK!
  for (var i = 0; i < inv.length; i++) {
    var item = inv[i][1];
    if (item) {
      let itemString = inv[i][0] + `) ` + item.toString(false, endgame || DEBUG_STATS, p);
      let itemParts = [itemString];
      if (itemString.length > 39)
        itemParts = itemString.split(`(`);
      itemString = padString(itemParts[0], -39);
      if (itemParts.length >= 2) {
        /* (being worn) */
        itemString += `\n   (` + itemParts[1];
      }
      if (itemParts.length == 3) {
        /* (being worn) (weapon in hand) */
        itemString += `(` + itemParts[2];
      }
      s += itemString + `\n`;
    }
  }

  let gap = amiga_mode ? ` ` : ``;
  for (let slot = 0; slot < maxcarry(p); slot++) {
    if (!p.inventory[slot]) {
      s += `${getCharFromIndex(slot)}) -${gap}-${gap}-\n`;
    }
  }

  if (endgame || !pocketempty()) s += `\n`;
  s += `Known Spells:\n`;
  var count = 0;
  var spellcolumns = 6;
  for (var spell = 0; spell < p.knownSpells.length; spell++) {
    var tmp = p.knownSpells[spell];
    if (tmp) {
      s += tmp + ` `;
      if (++count % spellcolumns == 0)
        s += `\n`;
    }
  }
  if (count % spellcolumns != 0) s += `\n`;

  return s;
}



function debug_stats(p, score) {
  if (!p) p = player;
  if (!p) return;

  var tmpgtime = gtime;
  var tmprmst = rmst;
  if (score && score.extra) {
    tmpgtime = score.extra[EXTRA_GTIME];
    tmprmst = score.extra[EXTRA_RMST];
  }

  var s = game_stats(p, score != null);

  s += `\nKnown Scrolls:\n`;
  for (var scroll = 0; scroll < p.knownScrolls.length; scroll++) {
    let tmp = p.knownScrolls[scroll];
    if (tmp) s += SCROLL_NAMES[tmp.arg] + `\n`;
  }
  s += `\nKnown Potions:\n`;
  for (var potion = 0; potion < p.knownPotions.length; potion++) {
    let tmp = p.knownPotions[potion];
    if (tmp) s += POTION_NAMES[tmp.arg] + `\n`;
  }

  s += `\nBank Account:\n`;
  s += Number(p.BANKACCOUNT).toLocaleString() + ` gold pieces\n`;

  s += `\nBonuses:\n`;
  s += `+AC:   ` + p.MOREDEFENSES + `\n`;
  s += `STREX: ` + p.STREXTRA + `\n`;
  s += `GIAST: ` + p.GIANTSTR + `\n`;
  s += `HERO:  ` + p.HERO + `\n`;
  s += `AWARE: ` + p.AWARENESS + `\n`;
  s += `SEEIN: ` + p.SEEINVISIBLE + `\n`;
  s += `SPRO:  ` + p.SPIRITPRO + `\n`;
  s += `UPRO:  ` + p.UNDEADPRO + `\n`;
  s += `FIRE:  ` + p.FIRERESISTANCE + `\n`;
  s += `STEL:  ` + p.STEALTH + `\n`;
  s += `LIFE:  ` + p.LIFEPROT + `\n`;

  s += `\nMagic:\n`;
  s += `PRO2:  ` + p.PROTECTIONTIME + `\n`;
  s += `DEX:   ` + p.DEXCOUNT + `\n`;
  s += `CHM:   ` + p.CHARMCOUNT + `\n`;
  s += `STR:   ` + p.STRCOUNT + `\n`;
  s += `INV:   ` + p.INVISIBILITY + `\n`;
  s += `CAN:   ` + p.CANCELLATION + `\n`;
  s += `HAS:   ` + p.HASTESELF + `\n`;
  s += `GLO:   ` + p.GLOBE + `\n`;
  s += `SCA:   ` + p.SCAREMONST + `\n`;
  s += `HLD:   ` + p.HOLDMONST + `\n`;
  s += `STP:   ` + p.TIMESTOP + `\n`;
  s += `WTW:   ` + p.WTW + `\n`;
  s += `PRO3:  ` + p.ALTPRO + `\n`;

  s += `\nCurses:\n`;
  s += `AGGR:  ` + p.AGGRAVATE + `\n`;
  s += `HSTM:  ` + p.HASTEMONST + `\n`;
  s += `POIS:  ` + p.HALFDAM + `\n`;
  s += `CONF:  ` + p.CONFUSE + `\n`;
  s += `BLIND: ` + p.BLINDCOUNT + `\n`;
  s += `ITCH:  ` + p.ITCHING + `\n`;
  s += `CLMSY: ` + p.CLUMSINESS + `\n`;

  s += `\nSpecial Items Created:\n`;
  if (ULARN) s += `LAMP:  ${booleanToNumberString(p.LAMP)}\n`;
  if (ULARN) s += `WAND:  ${booleanToNumberString(p.WAND)}\n`;
  s += `DRGSL: ${booleanToNumberString(p.SLAYING)}\n`;
  s += `NEGAT: ${booleanToNumberString(p.NEGATESPIRIT)}\n`;
  s += `CUBE:  ${booleanToNumberString(p.CUBEofUNDEAD)}\n`;
  s += `THEFT: ${booleanToNumberString(p.NOTHEFT)}\n`;
  if (ULARN) s += `TALIS: ${booleanToNumberString(p.TALISMAN)}\n`;
  if (ULARN) s += `HAND:  ${booleanToNumberString(p.HAND)}\n`;
  if (ULARN) s += `ORB:   ${booleanToNumberString(p.ORB)}\n`;
  if (ULARN) s += `ELVEN: ${booleanToNumberString(p.ELVEN)}\n`;
  s += `SLASH: ${booleanToNumberString(p.SLASH)}\n`;
  s += `BESSM: ${booleanToNumberString(p.BESSMANN)}\n`;
  if (ULARN) s += `SLAYR: ${booleanToNumberString(p.SLAY)}\n`;
  if (ULARN) s += `VORP:  ${booleanToNumberString(p.VORPAL)}\n`;
  if (ULARN) s += `STAFF: ${booleanToNumberString(p.STAFF)}\n`;
  if (ULARN) s += `PRSVR: ${booleanToNumberString(p.PRESERVER)}\n`;
  if (ULARN) s += `PAD:   ${booleanToNumberString(p.PAD)}\n`;
  if (ULARN) s += `ELEDN: ${booleanToNumberString(p.ELEVDOWN)}\n`;
  if (ULARN) s += `ELEUP: ${booleanToNumberString(p.ELEVUP)}\n`;

  s += `\nLocation:\nx,y:   ${p.x},${p.y}\n`;

  s += `\nCounters:\n`;
  s += `TIME:  ` + tmpgtime + `\n`;
  s += `RMST:  ` + tmprmst + `\n`;
  s += `ENERG: ${p.ENERGY}, ${p.ECOUNTER}\n`;
  s += `REGEN: ${p.REGEN}, ${p.REGENCOUNTER}\n`;

  s += `\nStats:\n`;
  s += `MOVES: ` + p.MOVESMADE + `\n`;
  s += `KILLS: ` + p.MONSTKILLED + `\n`;
  s += `CAST:  ` + p.SPELLSCAST + `\n`;
  // s += `PAINT: ` + DEBUG_PAINT + `\n`;
  // s += `LPR:   ` + DEBUG_LPRCAT + `\n`;
  // s += `LPRC:  ` + DEBUG_LPRC + `\n`;

  return s;
}



function booleanToNumberString(bool) {
  if (bool) return `1`;
  else return `0`;
}