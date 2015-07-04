"use strict";


const MAXPLEVEL = 100; /* maximum player level allowed        */

const MEG = 1000000;
var skill = [
  0, 10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120, /*  1-11 */
  10240, 20480, 40960, 100000, 200000, 400000, 700000, 1 * MEG, /* 12-19 */
  2 * MEG, 3 * MEG, 4 * MEG, 5 * MEG, 6 * MEG, 8 * MEG, 10 * MEG, /* 20-26 */
  12 * MEG, 14 * MEG, 16 * MEG, 18 * MEG, 20 * MEG, 22 * MEG, 24 * MEG, 26 * MEG, 28 * MEG, /* 27-35 */
  30 * MEG, 32 * MEG, 34 * MEG, 36 * MEG, 38 * MEG, 40 * MEG, 42 * MEG, 44 * MEG, 46 * MEG, /* 36-44 */
  48 * MEG, 50 * MEG, 52 * MEG, 54 * MEG, 56 * MEG, 58 * MEG, 60 * MEG, 62 * MEG, 64 * MEG, /* 45-53 */
  66 * MEG, 68 * MEG, 70 * MEG, 72 * MEG, 74 * MEG, 76 * MEG, 78 * MEG, 80 * MEG, 82 * MEG, /* 54-62 */
  84 * MEG, 86 * MEG, 88 * MEG, 90 * MEG, 92 * MEG, 94 * MEG, 96 * MEG, 98 * MEG, 100 * MEG, /* 63-71 */
  105 * MEG, 110 * MEG, 115 * MEG, 120 * MEG, 125 * MEG, 130 * MEG, 135 * MEG, 140 * MEG, /* 72-79 */
  145 * MEG, 150 * MEG, 155 * MEG, 160 * MEG, 165 * MEG, 170 * MEG, 175 * MEG, 180 * MEG, /* 80-87 */
  185 * MEG, 190 * MEG, 195 * MEG, 200 * MEG, 210 * MEG, 220 * MEG, 230 * MEG, 240 * MEG, /* 88-95 */
  250 * MEG, 260 * MEG, 270 * MEG, 280 * MEG, 290 * MEG, 300 * MEG /* 96-101*/
];


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
  // WEAR:
  // PROTECTIONTIME:
  // WIELD:
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
  // HASTESELF:
  // EYEOFLARN:
  // AGGRAVATE:
  // GLOBE:
  // TELEFLAG:
  // SLAYING:
  // NEGATESPIRIT:
  // SCAREMONST:
  // AWARENESS:
  // HOLDMONST:
  TIMESTOP: 0,
  // HASTEMONST:
  // CUBEofUNDEAD:
  // GIANTSTR:
  // FIRERESISTANCE:
  // BESSMANN:
  // NOTHEFT:
  HARDGAME: 0,
  // CPUTIME:
  // BYTESIN:
  // BYTESOUT:
  // MOVESMADE:
  MONSTKILLED: 0,
  // SPELLSCAST:
  LANCEDEATH: 0,
  // SPIRITPRO:
  // UNDEADPRO:
  // SHIELD:
  // STEALTH:
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
  STREXTRA: 0,
  /* character strength due to objects or enchantments */
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
  raiselevel() {
    updateLog("TODO: player.raiselevel()")
      //if (c[LEVEL] < MAXPLEVEL) raiseexperience((long)(skill[c[LEVEL]] - c[EXPERIENCE]));
  },


  /*
      table of experience needed to be a certain level of player
      skill[c[LEVEL]] is the experience required to attain the next level
   */

  /*
      raiseexperience(x)
      subroutine to increase experience points
   */
  raiseexperience(x) {
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


  getStatString: function() {
    var output = "";
    output += "Spells: " + this.SPELLS + "(" + this.SPELLMAX + ")  " +
      "AC: " + this.AC + "  " +
      "WC: " + this.WCLASS + "  " +
      "Level " + this.LEVEL + " " +
      "Exp: " + this.EXPERIENCE + "  " + this.CLASS() + "\n" +
      "HP: " + this.HP + "(" + this.HPMAX + ") " +
      "STR=" + this.STRENGTH + " " +
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


const CLASSES = [
  "  novice explorer  ", "apprentice explorer", " practiced explorer", /*  -3*/
  "   expert explorer ", "  novice adventurer", "     adventurer    ", /*  -6*/
  "apprentice conjurer", "     conjurer      ", "  master conjurer  ", /*  -9*/
  "  apprentice mage  ", "        mage       ", "  experienced mage ", /* -12*/
  "     master mage   ", " apprentice warlord", "   novice warlord  ", /* -15*/
  "   expert warlord  ", "   master warlord  ", " apprentice gorgon ", /* -18*/
  "       gorgon      ", "  practiced gorgon ", "   master gorgon   ", /* -21*/
  "    demi-gorgon    ", "    evil master    ", " great evil master ", /* -24*/
  " mighty evil master", " mighty evil master", " mighty evil master", /* -27*/
  " mighty evil master", " mighty evil master", " mighty evil master", /* -30*/
  " mighty evil master", " mighty evil master", " mighty evil master", /* -33*/
  " mighty evil master", " mighty evil master", " mighty evil master", /* -36*/
  " mighty evil master", " mighty evil master", " mighty evil master", /* -39*/
  "apprentice demi-god", "apprentice demi-god", "apprentice demi-god", /* -42*/
  "apprentice demi-god", "apprentice demi-god", "apprentice demi-god", /* -45*/
  "apprentice demi-god", "apprentice demi-god", "apprentice demi-god", /* -48*/
  "  minor demi-god   ", "  minor demi-god   ", "  minor demi-god   ", /* -51*/
  "  minor demi-god   ", "  minor demi-god   ", "  minor demi-god   ", /* -54*/
  "  minor demi-god   ", "  minor demi-god   ", "  minor demi-god   ", /* -57*/
  "  major demi-god   ", "  major demi-god   ", "  major demi-god   ", /* -60*/
  "  major demi-god   ", "  major demi-god   ", "  major demi-god   ", /* -63*/
  "  major demi-god   ", "  major demi-god   ", "  major demi-god   ", /* -66*/
  "    minor deity    ", "    minor deity    ", "    minor deity    ", /* -69*/
  "    minor deity    ", "    minor deity    ", "    minor deity    ", /* -72*/
  "    minor deity    ", "    minor deity    ", "    minor deity    ", /* -75*/
  "    major deity    ", "    major deity    ", "    major deity    ", /* -78*/
  "    major deity    ", "    major deity    ", "    major deity    ", /* -81*/
  "    major deity    ", "    major deity    ", "    major deity    ", /* -84*/
  "  novice guardian  ", "  novice guardian  ", "  novice guardian  ", /* -87*/
  "apprentice guardian", "apprentice guardian", "apprentice guardian", /* -90*/
  "apprentice guardian", "apprentice guardian", "apprentice guardian", /* -93*/
  "  earth guardian   ", "   air guardian    ", "   fire guardian   ", /* -96*/
  "  water guardian   ", "  time guardian    ", " ethereal guardian ", /* -99*/
  "    The Creator    ", "    The Creator    ", "    The Creator    ", /* -102*/
];
