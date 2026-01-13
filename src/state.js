'use strict';

// TODO, make this the canonical source for data?
// i.e. replace cheat = ... with status.cheat etc.


/* additions for JS Larn */
var LEVELS;
let EXPLORED_LEVELS;
let LOG = Array(LOG_SAVE_SIZE).fill(' ');
var player;
var playerID;
var playerIP = `0`;
var gameID = Math.random().toString(36).substring(2, 12);
// var gameID = `testgameid`;
var PARAMS = {};
var recording = {};

var newsphereflag = false; /* JRP hack to not move sphere twice after cast */
var GAMEOVER = true;
var game_started = false;
var mazeMode = false;
var napping = false; /* prevent keyboard input while a nap event is happening */

var showConfigButtons = true;
var original_objects = true;
var keyboard_hints = true;
var auto_pickup = false;
var side_inventory = true;
var show_color = true;
var log_color = true;
var bold_objects = true;
var amiga_mode = false;
var retro_mode = false;
var wall_char = 0; // index into WALLS
var floor_char = OEMPTY_DEFAULT_CHAR;
var custom_monsters = [];
var no_intro = false;

var dnd_item = null;
var genocide = [];

var logname = `Adventurer`;
var debug_used = 0;
var cheat = 0; /* 1 if the player has fudged save file */
var level = -1; /* cavelevel player is on = cdesc[CAVELEVEL] */
var wizard = 0; /* the wizard mode flag */
var gtime = 0; /* the clock for the game */
var HARDGAME = 0; /* game difficulty */

/* these function were added as a defensive measure to find a pesky bug,
   and now it's easier to just leave them here
*/
function getDifficulty() {
  if (HARDGAME == null || HARDGAME === `` || isNaN(Number(HARDGAME))) {
    console.log('get: invalid difficulty: ' + HARDGAME);
    console.trace();
  }
  return Math.min(128, HARDGAME);
}

function setDifficulty(diff) {
  if (diff == null || diff === `` || isNaN(Number(diff))) {
    console.log('set: invalid difficulty: ' + diff);
    console.trace();
  }
  if (diff > 128) {
    console.log(`capping difficulty at 128`);
    diff = 128;
  }
  HARDGAME = diff;
}

var lastmonst = ``; /* name of the last monster to hit the player */
var lastnum = 0; /* the number of the monster last hitting player */
var hitflag = 0; /* flag for if player has been hit when running */
var lastpx = 0;
var lastpy = 0;
var lasthx = 0; /* location of monster last hit by player */
var lasthy = 0; /* location of monster last hit by player */
var prayed = 1; /* did player pray at an altar?  */
var course = []; /* the list of courses taken */
var outstanding_taxes = 0; /* present tax bill from score file */
var dropflag = 0; /* if 1 then don't lookforobject() next round */
var rmst = 120; /* random monster creation counter */
var nomove = 0; /* if (nomove) then don't count next iteration as a move */
var viewflag = 0; /* if viewflag then we have done a 99 stay here and don't showcell in the main loop */
var lasttime = 0; /* last time in bank */
var spheres = [];



function GameState(save) {
  this.LEVELS = LEVELS;
  this.LOG = LOG;
  this.player = player;
  this.gameID = gameID;

  this.recording = getRecordingInfo();
  if (this.recording) {
    if (save) {
      this.recording.frames += 3; // hack because three more frames get added before a game is done saving
    } else {
      // this.recording.frames -= 1; // hack because 1 frame is added before a game is loaded
      this.recording.rolls -= 1; // hack because 1 roll is added before a game is loaded
    }
  }

  this.newsphereflag = newsphereflag;
  this.GAMEOVER = GAMEOVER;
  this.mazeMode = mazeMode;
  this.napping = napping;

  this.showConfigButtons = showConfigButtons;
  this.original_objects = original_objects;
  this.keyboard_hints = keyboard_hints;
  this.auto_pickup = auto_pickup;
  this.side_inventory = side_inventory;
  this.show_color = show_color;
  this.log_color = log_color;
  this.bold_objects = bold_objects;
  this.amiga_mode = amiga_mode;
  this.retro_mode = retro_mode;
  this.wall_char = wall_char;
  this.floor_char = floor_char;
  this.custom_monsters = custom_monsters;
  
  this.dnd_item = dnd_item;
  this.genocide = genocide;

  this.logname = logname;
  this.debug_used = debug_used;
  this.cheat = cheat;
  this.level = level;
  this.wizard = wizard;
  this.gtime = gtime;
  this.HARDGAME = getDifficulty();

  this.lastmonst = lastmonst;
  this.lastnum = lastnum;
  this.hitflag = hitflag;
  this.lastpx = lastpx;
  this.lastpy = lastpy;
  this.lasthx = lasthx;
  this.lasthy = lasthy;
  this.prayed = prayed;
  this.course = course;
  this.outstanding_taxes = outstanding_taxes;
  this.dropflag = dropflag;
  this.rmst = rmst;
  this.nomove = nomove;
  this.viewflag = viewflag;
  this.lasttime = lasttime;
  this.spheres = spheres;
}