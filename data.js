"use strict";


var gtime = 0; /*  the clock for the game                      */

var prompt_mode = false;


var lastmonst = "";

// TODO! var level = 0; /*  cavelevel player is on = c[CAVELEVEL]           */

var lastnum = 0; /* the number of the monster last hitting player    */
var hitflag = 0; /*  flag for if player has been hit when running    */
var hit2flag = 0; /*  flag for if player has been hit when running    */
var hit3flag = 0; /*  flag for if player has been hit flush input     */
var lastpx = 0;
var lastpy = 0;
var lasthx = 0; /* location of monster last hit by player       */
var lasthy = 0; /* location of monster last hit by player       */
var  prayed = 1;       /* did player pray at an altar (command mode)? needs
                           to be saved, but I don't want to add incompatibility
                           right now.  KBR 1/11/90 */
var oldx = 0;
var oldy = 0;
var course = []; /* the list of courses taken */

/*
    table of experience needed to be a certain level of player
    skill[c[LEVEL]] is the experience required to attain the next level
 */
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
