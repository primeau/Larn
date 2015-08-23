"use strict";

/* additions for JS Larn */
var LEVELS = [];
var LOG = [""];
var player;

var newsphereflag = false; /* JRP hack to not move sphere twice after cast */
var GAME_OVER = false;
var IN_STORE = false;
var napping = false; /* prevent keyboard input while a nap event is happening */
var knownPotions = [];
var knownScrolls = [];
var knownSpells = [];

var logname = "";
var cheat = 0; /* 1 if the player has fudged save file */
var level = 0; /* cavelevel player is on = cdesc[CAVELEVEL] */
var wizard = 0; /* the wizard mode flag */
var gtime = -1; /* the clock for the game */
var HARDGAME = 0;
var lastmonst = "";
var lastnum = 0; /* the number of the monster last hitting player */
var hitflag = 0; /* flag for if player has been hit when running */
var hit2flag = 0; /* flag for if player has been hit when running */
var hit3flag = 0; /* flag for if player has been hit flush input */
var lastpx = 0;
var lastpy = 0;
var lasthx = 0; /* location of monster last hit by player */
var lasthy = 0; /* location of monster last hit by player */
var prayed = 1; /* did player pray at an altar?  */
var oldx = 0;
var oldy = 0;
var course = []; /* the list of courses taken */
var outstanding_taxes = 0; /* present tax bill from score file */
var dropflag = 0; /* if 1 then don't lookforobject() next round */
var rmst = 120; /* random monster creation counter */
var nomove = 0; /* if (nomove) then don't count next iteration as a move */
var viewflag = 0; /* if viewflag then we have done a 99 stay here and don't showcell in the main loop */
var lasttime = 0; /* last time in bank */
var w1x;
var w1y;
var spheres = [];
var auto_pickup = false;


function GameState() {
  //this.LEVELS = LEVELS;
  //this.LOG = LOG;
  //this.player = player;

  this.newsphereflag = newsphereflag;
  this.GAME_OVER = GAME_OVER;
  this.IN_STORE = IN_STORE;
  this.napping = napping;
  this.knownPotions = knownPotions;
  this.knownScrolls = knownScrolls;
  this.knownSpells = knownSpells;

  this.logname = logname;
  this.cheat = cheat;
  this.level = level;
  this.wizard = wizard;
  this.gtime = gtime;
  this.HARDGAME = HARDGAME;
  this.lastmonst = lastmonst;
  this.lastnum = lastnum;
  this.hitflag = hitflag;
  this.hit2flag = hit2flag;
  this.hit3flag = hit3flag;
  this.lastpx = lastpx;
  this.lastpy = lastpy;
  this.lasthx = lasthx;
  this.lasthy = lasthy;
  this.prayed = prayed;
  this.oldx = oldx;
  this.oldy = oldy;
  this.course = course;
  this.outstanding_taxes = outstanding_taxes;
  this.dropflag = dropflag;
  this.rmst = rmst;
  this.nomove = nomove;
  this.viewflag = viewflag;
  this.lasttime = lasttime;
  this.w1x = w1x;
  this.w1y = w1y;
  this.spheres = spheres;
  this.auto_pickup = auto_pickup;
}
