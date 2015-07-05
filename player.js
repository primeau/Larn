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
  // REGEN:
  WCLASS: 0,
  AC: 0,
  // BANKACCOUNT:
  SPELLMAX: 1,
  SPELLS: 1,
  // ENERGY:
  // ECOUNTER:
  // MOREDEFENSES:
  WEAR: null,
  // PROTECTIONTIME:
  WIELD: null,
  // AMULET:
  // REGENCOUNTER:
  MOREDAM: 0,
  // DEXCOUNT:
  // STRCOUNT:
  // BLINDCOUNT:
  CAVELEVEL: function() {
    return this.level.depth;
  },
  // CONFUSE:
  // ALTPRO:
  // HERO:
  // CHARMCOUNT:
  // INVISIBILITY:
  // CANCELLATION:
  // HASTESELF: 0,
  // EYEOFLARN:
  AGGRAVATE: 0,
  // GLOBE:
  // TELEFLAG:
  // SLAYING:
  // NEGATESPIRIT:
  // SCAREMONST:
  AWARENESS: 0,
  HOLDMONST: 0,
  TIMESTOP: 0,
  HASTEMONST: 0,
  // CUBEofUNDEAD:
  // GIANTSTR:
  FIRERESISTANCE: 0,
  BESSMANN: 0,
  // NOTHEFT:
  HARDGAME: 0,
  // CPUTIME:
  // BYTESIN:
  // BYTESOUT:
  // MOVESMADE:
  MONSTKILLED: 0,
  // SPELLSCAST:
  LANCEDEATH: 0,
  SPIRITPRO: 0,
  UNDEADPRO: 0,
  SHIELD: null,
  STEALTH: 0,
  // ITCHING:
  // LAUGHING:
  // DRAINSTRENGTH:
  // CLUMSINESS:
  // INFEEBLEMENT:
  HALFDAM: 0,
  // SEEINVISIBLE:
  // FILLROOM:
  // RANDOMWALK:
  // SPHCAST:    /* nz if an active sphere of annihilation */
  // WTW:        /* walk through walls */
  STREXTRA: 0,   /* character strength due to objects or enchantments */
  // TMP:        /* misc scratch space */
  LIFEPROT: 0,
  /* life protection counter */

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
    this.hp = Math.min(this.HP + x, this.HPMAX);
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
      function to change character levels as needed when taking/dropping an object
      that affects these characteristics
   */
  adjustcvalues: function(item, pickup) {
    // TODO: WHAT ABOUT OTHER RINGS???
    // case ODEXRING:
    //   c[DEXTERITY] -= arg + 1;
    // case OSTRRING:
    //   c[STREXTRA] -= arg + 1;
    // case OCLEVERRING:
    //   c[INTELLIGENCE] -= arg + 1;
    if (item.matches(OHAMMER)) {
      player.DEXTERITY = pickup ? player.DEXTERITY + 10 : player.DEXTERITY - 10;
      player.STREXTRA = pickup ? player.STREXTRA + 10 : player.STREXTRA - 10;
      player.INTELLIGENCE = pickup ? player.INTELLIGENCE - 10 : player.INTELLIGENCE + 10;
    }
    if (item.matches(OSWORDofSLASHING)) {
      player.DEXTERITY = pickup ? player.DEXTERITY + 5 : player.DEXTERITY - 5;
    }
    // case OORBOFDRAGON:
    //   --c[SLAYING];
    // case OSPIRITSCARAB:
    //   --c[NEGATESPIRIT];
    // case OCUBEofUNDEAD:
    //   --c[CUBEofUNDEAD];
    // case ONOTHEFT:
    //   --c[NOTHEFT];
    if (item.matches(OLANCE)) {
      player.LANCEDEATH = pickup ? item : null;
    }
  },


  /*
      recalc()    function to recalculate the weapon and armor class of the player
   */
  recalc: function() {
    player.WCLASS = 0;

    // player.AC = player.MOREDEFENSES;
    // if (player.WEAR != null)
    //     switch(iven[c[WEAR]])
    //         {
    //         case OSHIELD:       c[AC] += 2 + ivenarg[c[WEAR]]; break;
    //         case OLEATHER:      c[AC] += 2 + ivenarg[c[WEAR]]; break;
    //         case OSTUDLEATHER:  c[AC] += 3 + ivenarg[c[WEAR]]; break;
    //         case ORING:         c[AC] += 5 + ivenarg[c[WEAR]]; break;
    //         case OCHAIN:        c[AC] += 6 + ivenarg[c[WEAR]]; break;
    //         case OSPLINT:       c[AC] += 7 + ivenarg[c[WEAR]]; break;
    //         case OPLATE:        c[AC] += 9 + ivenarg[c[WEAR]]; break;
    //         case OPLATEARMOR:   c[AC] += 10 + ivenarg[c[WEAR]]; break;
    //         case OSSPLATE:      c[AC] += 12 + ivenarg[c[WEAR]]; break;
    //         }

    // if (c[SHIELD] >= 0) if (iven[c[SHIELD]] == OSHIELD) c[AC] += 2 + ivenarg[c[SHIELD]];

    if (player.WIELD != null) {
      var weapon = player.WIELD;
      var extra = weapon.arg;
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

    // /*  now for regeneration abilities based on rings   */
    //     c[REGEN]=1;     c[ENERGY]=0;
    //     j=0;  for (k=25; k>0; k--)  if (iven[k]) {j=k; k=0; }
    //     for (i=0; i<=j; i++)
    //         {
    //         switch(iven[i])
    //             {
    //             case OPROTRING: c[AC]     += ivenarg[i] + 1;    break;
    //             case ODAMRING:  c[WCLASS] += ivenarg[i] + 1;    break;
    //             case OBELT:     c[WCLASS] += ((ivenarg[i]<<1)) + 2; break;
    //
    //             case OREGENRING:    c[REGEN]  += ivenarg[i] + 1;    break;
    //             case ORINGOFEXTRA:  c[REGEN]  += 5 * (ivenarg[i]+1); break;
    //             case OENERGYRING:   c[ENERGY] += ivenarg[i] + 1;    break;
    //             }
    //         }
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

  if (index == null) {
    updateLog("What do you want to wield (- for nothing) [* for all] ?");
    wait_for_wield_input = true;
    return;
  } else {
    //debug("wield(): " + index);
  }

  if (index == ESC) {
    updateLog("");
    wait_for_wield_input = false;
    return false;
  }

  if (index == '*') {
    // TODO
    // i = showwield();
    // cursors();
  }

  var startcode = "a".charCodeAt(0);
  var code = index.charCodeAt(0);
  var wieldIndex = code - startcode;

  debug("wield: " + wieldIndex);

  var item = player.inventory[wieldIndex];

  debug("wield(): trying to wield " + item);

  if (item == null) {
    if (wieldIndex >= 0 && wieldIndex < 26) {
      updateLog("You don't have item " + index + "!");
    }
    wait_for_wield_input = false;
    return;
  }

  if (item.matches(OPOTION) || item.matches(OSCROLL)) {
    updateLog("You can't wield that!");
    wait_for_wield_input = false;
    return;
  }
  if (player.SHIELD != null && item.matches(O2SWORD)) {
    updateLog("But one arm is busy with your shield!");
    wait_for_wield_input = false;
    return;
  }

  if (index == '-') {
    // TODO
    // player.WIELD = null;
    // bottomline();
    // wait_for_wield_input = false;
    // recalc(); // JRP added
    // return;
  }

  player.WIELD = item;
  if (item.matches(OLANCE)) {
    player.LANCEDEATH = item;
  } else {
    player.LANCEDEATH = 0;
  }

  player.level.bottomline();
  player.level.paint();
  wait_for_wield_input = false;
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
  // s += "LEVEL: " + player.LEVEL + "\n";
  // s += "WC:    " + player.WCLASS + "\n";
  // s += "AC:    " + player.AC + "\n";

  s += "WIELD: " + player.WIELD + "\n";
  s += "WEAR:  " + player.WEAR + "\n";
  s += "SHLD:  " + player.SHIELD + "\n";

  s += "STREX: " + player.STREXTRA + "\n";

  s += "AGGR:  " + player.AGGRAVATE + "\n";
  s += "HSTM:  " + player.HASTEMONST + "\n";
  s += "POIS:  " + player.HALFDAM + "\n";

  s += "AWARE: " + player.AWARENESS + "\n";

  s += "SPRO:  " + player.SPIRITPRO + "\n";
  s += "UPRO:  " + player.UNDEADPRO + "\n";
  s += "FIRE:  " + player.FIRERESISTANCE + "\n";

  s += "HOLD:  " + player.HOLDMONST + "\n";
  s += "STEL:  " + player.STEALTH + "\n";
  //  s += "HASTE: " + player.HASTESELF + "\n";

  s += "KILL:  " + player.MONSTKILLED + "\n";
  s += "LANCE: " + player.LANCEDEATH + "\n";
  s += "LIFE:  " + player.LIFEPROT + "\n";

  s += "\n";
  var c = "a";
  for (var inven = 0; inven < player.inventory.length; inven++) {
    var item = player.inventory[inven];
    if (item != null) {
      s += c + ") " + item + "\n";
    }
    c = c.nextChar();
  }

  return s;
}
