"use strict";

var LEVELS = [];
var LOG = [""];
var IN_STORE = false;


var gtime = 0; /*  the clock for the game                      */

var prompt_mode = false;

var logname = "adventurer";

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
var prayed = 1;
/* did player pray at an altar (command mode)? needs
                    to be saved, but I don't want to add incompatibility
                    right now.  KBR 1/11/90 */
var oldx = 0;
var oldy = 0;
var course = []; /* the list of courses taken */
var wizard = false; /*  the wizard mode flag                            */
var outstanding_taxes=0;   /* present tax bill from score file             */

var newsphereflag = false; /* JRP hack to not move sphere twice after cast */



var dropflag = 0; /* if 1 then don't lookforobject() next round */
var rmst = 120; /* random monster creation counter */
var nomove = 0; /* if (nomove) then don't count next iteration as a move */
var viewflag = 0; /* if viewflag then we have done a 99 stay here and don't showcell in the main loop */

var napping = false; // prevent keyboard input while a nap event is happening


var lasttime = 0; /* last time he was in bank */

var GAME_OVER = false;

var w1x;
var w1y;

var spheres = [];

var knownPotions = [];
var knownScrolls = [];
var knownSpells = [];
