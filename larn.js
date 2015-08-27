"use strict";

var DEBUG_STATS = false;
var DEBUG_OUTPUT = false;
var DEBUG_STAIRS_EVERYWHERE = false;
var DEBUG_KNOW_ALL = false;
var DEBUG_PAINT = 0;
var DEBUG_LPRCAT = 0;
var DEBUG_LPRC = 0;
var DEBUG_PROXIMITY = false;


var Larn = {
  run: function() {

    Mousetrap.bind('alt+h', eventToggleOriginalObjects);

    var host = location.hostname;
    if (host === 'localhost') {
      enableDebug();
    } else {
      window.onbeforeunload = confirmExit;
    }
    //Mousetrap.bind('i', eventShowInventory); // kills the i key for everything else

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



function confirmExit() {
  return "Are you sure? Your game will be lost!";
}



function enableDebug() {
  Mousetrap.bind('alt+`', eventToggleDebugStats);
  Mousetrap.bind('alt+1', eventToggleDebugOutput);
  Mousetrap.bind('alt+2', eventToggleDebugWTW);
  Mousetrap.bind('alt+3', eventToggleDebugStairs);
  Mousetrap.bind('alt+4', eventToggleDebugKnowAll);
  Mousetrap.bind('alt+5', eventToggleDebugStealth);
  Mousetrap.bind('alt+6', eventToggleDebugAwareness);
  Mousetrap.bind('alt+7', eventToggleDebugImmortal);
  Mousetrap.bind('alt+8', eventToggleDebugProximity);
}


// toggle between hack-like and original objects
function eventToggleOriginalObjects() {
  nomove = 1;
  original_objects = !original_objects;
  if (original_objects)
    document.getElementById("toggleObjects").value = "Hack Style Objects";
  else
    document.getElementById("toggleObjects").value = "Larn Style Objects";

  updateLog(`hack-style objects: ${original_objects ? "off" : "on"}`);
  paint();
}

function eventToggleDebugStats() {
  nomove = 1;
  DEBUG_STATS = !DEBUG_STATS;
  updateLog("DEBUG_STATS: " + DEBUG_STATS);
  paint();
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
    player.HOLDMONST = 100000;
    player.STEALTH = 100000;
    updateLog("DEBUG: FREEZING MONSTERS");
  } else {
    player.HOLDMONST = 0;
    player.STEALTH = 0;
    updateLog("DEBUG: UNFREEZING MONSTERS");
  }
}

function eventToggleDebugAwareness() {
  nomove = 1;
  if (player.AWARENESS <= 0) {
    player.AWARENESS = 100000;
    updateLog("DEBUG: EXPANDED AWARENESS++");
  } else {
    player.AWARENESS = 0;
    updateLog("DEBUG: EXPANDED AWARENESS--");
  }
}

function eventToggleDebugImmortal() {
  nomove = 1;
  if (player.LIFEPROT <= 0) {
    player.LIFEPROT = 100000;
    updateLog("DEBUG: LIFE PROTECTION++");
  } else {
    player.LIFEPROT = 0;
    updateLog("DEBUG: LIFE PROTECTION--");
  }
}

function eventToggleDebugProximity() {
  nomove = 1;
  DEBUG_PROXIMITY = !DEBUG_PROXIMITY;
  if (!DEBUG_PROXIMITY) IN_STORE = false;
  updateLog("DEBUG: PROXIMITY: " + DEBUG_PROXIMITY);
  paint();
}

// function eventShowInventory() {
//     showinventory(false, parse_inventory, showall, true, true);
// }
