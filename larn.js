"use strict";

var DEBUG_STATS = false;
var DEBUG_OUTPUT = false;
var DEBUG_STAIRS_EVERYWHERE = false;
var DEBUG_KNOW_ALL = false;
var DEBUG_IMMORTAL = false;
var DEBUG_PAINT = 0;
var DEBUG_LPRCAT = 0;
var DEBUG_LPRC = 0;
var DEBUG_PROXIMITY = false;


var Larn = {
  run: function() {

    Mousetrap.bind('ctrl+h', eventToggleOriginalObjects);

    Mousetrap.bind('ctrl+`', eventToggleDebugStats);
    Mousetrap.bind('ctrl+1', eventToggleDebugOutput);
    Mousetrap.bind('ctrl+2', eventToggleDebugWTW);
    Mousetrap.bind('ctrl+3', eventToggleDebugStairs);
    Mousetrap.bind('ctrl+4', eventToggleDebugKnowAll);
    Mousetrap.bind('ctrl+5', eventToggleDebugStealth);
    Mousetrap.bind('ctrl+6', eventToggleDebugAwareness);
    Mousetrap.bind('ctrl+7', eventToggleDebugImmortal);
    Mousetrap.bind('ctrl+8', eventToggleDebugProximity);

    document.onkeypress = this.keyPress;
    document.onkeydown = this.keyDown;
    //document.onkeyup = this.keyUp;
    welcome();
  },

  // http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
  keyPress: function(e) {
    e = e || window.event;
    parseEvent(e, false, false);
  }, // KEYPRESS

  keyDown: function(e) {
    e = e || window.event;
    parseEvent(e, true, false);
  }, // KEYDOWN

  keyUp: function(e) {
    e = e || window.event;
    parseEvent(e, false, true);
  }, // KEYUP

}; // LARN OBJECT



// toggle between hack-like and original objects
function eventToggleOriginalObjects() {
  nomove = 1;
  original_objects = !original_objects;
  updateLog(`hack-like objects: ${original_objects ? "off" : "on"}`);
}

function eventToggleDebugStats() {
  nomove = 1;
  DEBUG_STATS = !DEBUG_STATS;
  updateLog("DEBUG_STATS: " + DEBUG_STATS);
}

function eventToggleDebugOutput() {
  nomove = 1;
  DEBUG_OUTPUT = !DEBUG_OUTPUT;
  updateLog("DEBUG_OUTPUT: " + DEBUG_OUTPUT);
}

function eventToggleDebugWTW() {
  nomove = 1;
  player.WTW = player.WTW == 0 ? 100000 : 0;
  updateLog("DEBUG_WALK_THROUGH_WALLS: " + (player.WTW > 0));
}

function eventToggleDebugStairs() {
  nomove = 1;
  DEBUG_STAIRS_EVERYWHERE = !DEBUG_STAIRS_EVERYWHERE;
  updateLog("DEBUG_STAIRS_EVERYWHERE: " + DEBUG_STAIRS_EVERYWHERE);
}

function eventToggleDebugKnowAll() {
  nomove = 1;
  DEBUG_KNOW_ALL = true;
  for (var i = 0; i < spelcode.length; i++) {
    learnSpell(spelcode[i]);
  }
  for (var i = 0; i < scrollname.length; i++) {
    learnScroll(createObject(OSCROLL, i));
  }
  for (var i = 0; i < potionname.length; i++) {
    learnPotion(createObject(OPOTION, i));
  }
  updateLog("DEBUG_KNOW_ALL: " + DEBUG_KNOW_ALL);
}

function eventToggleDebugStealth() {
  nomove = 1;
  if (player.STEALTH <= 0) {
    updateLog("DEBUG: FREEZING MONSTERS");
    player.HOLDMONST = 100000;
    player.STEALTH = 100000;
  } else {
    updateLog("DEBUG: UNFREEZING MONSTERS");
    player.HOLDMONST = 0;
    player.STEALTH = 0;
  }
}

function eventToggleDebugAwareness() {
  nomove = 1;
  if (player.AWARENESS <= 0) {
    updateLog("DEBUG: EXPANDED AWARENESS++");
    player.AWARENESS = 100000;
  } else {
    updateLog("DEBUG: EXPANDED AWARENESS--");
    player.AWARENESS = 0;
  }
}

function eventToggleDebugImmortal() {
  nomove = 1;
  DEBUG_IMMORTAL = !DEBUG_IMMORTAL;
  updateLog("DEBUG: IMMORTAL: " + DEBUG_IMMORTAL);
}

function eventToggleDebugProximity() {
  nomove = 1;
  DEBUG_PROXIMITY = !DEBUG_PROXIMITY;
  if (!DEBUG_PROXIMITY) IN_STORE = false;
  updateLog("DEBUG: PROXIMITY: " + DEBUG_PROXIMITY);
  paint();
}
