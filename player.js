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
      raiselevel()

      subroutine to raise the player one level
      uses the skill[] array to find level boundarys
      uses c[EXPERIENCE]  c[LEVEL]
   */
  raiselevel() {
    updateLog("TODO: player.raiselevel()")
    //if (c[LEVEL] < MAXPLEVEL) raiseexperience((long)(skill[c[LEVEL]] - c[EXPERIENCE]));
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
