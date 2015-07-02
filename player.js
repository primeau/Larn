"use strict";

var Player = {
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
  // MOREDAM:
  // DEXCOUNT:
  // STRCOUNT:
  // BLINDCOUNT:
  CAVELEVEL: function() {return this.level.depth;},
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
  // TIMESTOP:
  // HASTEMONST:
  // CUBEofUNDEAD:
  // GIANTSTR:
  // FIRERESISTANCE:
  // BESSMANN:
  // NOTHEFT:
  // HARDGAME:
  // CPUTIME:
  // BYTESIN:
  // BYTESOUT:
  // MOVESMADE:
  // MONSTKILLED:
  // SPELLSCAST:
  // LANCEDEATH:
  // SPIRITPRO:
  // UNDEADPRO:
  // SHIELD:
  // STEALTH:
  // ITCHING:
  // LAUGHING:
  // DRAINSTRENGTH:
  // CLUMSINESS:
  // INFEEBLEMENT:
  // HALFDAM:
  // SEEINVISIBLE:
  // FILLROOM:
  // RANDOMWALK:
  // SPHCAST:    /* nz if an active sphere of annihilation */
  // WTW:        /* walk through walls */
  // STREXTRA:   /* character strength due to objects or enchantments */
  // TMP:        /* misc scratch space */
  // LIFEPRT:     /* life protection counter */

  CLASS: function() {
    return CLASSES[this.LEVEL - 1];
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
    "LV: " + (this.CAVELEVEL() <= 10 ? (this.CAVELEVEL() == 0 ? "H" : this.CAVELEVEL()) : "V"+(this.CAVELEVEL()-10)) + " " +
    "Gold: " + this.GOLD;
    return output;
  }, //

};




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
