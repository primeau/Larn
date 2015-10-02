"use strict";

const VERSION = '12.4.5';
const BUILD = '216';

var DEBUG_STATS = false;
var DEBUG_OUTPUT = false;
var DEBUG_STAIRS_EVERYWHERE = false;
var DEBUG_KNOW_ALL = false;
var DEBUG_PAINT = 0;
var DEBUG_LPRCAT = 0;
var DEBUG_LPRC = 0;
var DEBUG_PROXIMITY = false;


function play() {

  Parse.initialize("ZG6aY4DKdkKn39YGogG0WFhqk089WTqVWprNfijo", "Ioo0zvIxR5xvkf6lQQDW9A7YHaNyOItSDFb756Um");

  initKeyBindings();

  /* warn the player that closing their window will kill the game.
     this is a bit annoying, and I'm tempted to get rid of it now
     that there are checkpoints in place */
  var host = location.hostname;
  if (host === 'localhost') {
    enableDebug();
  } else {
    window.onbeforeunload = confirmExit;
  }

  welcome(); // show welcome screen, start the game

}



function confirmExit() {
  if (!GAMEOVER)
    return "Are you sure? Your game will be lost!";
}



function initKeyBindings() {
  Mousetrap.bind('.', mousetrap);
  Mousetrap.bind(',', mousetrap);
  Mousetrap.bind('<', mousetrap);
  Mousetrap.bind('>', mousetrap);
  Mousetrap.bind('^', mousetrap);
  Mousetrap.bind(':', mousetrap);
  Mousetrap.bind('@', mousetrap);
  Mousetrap.bind('{', eventToggleOriginalObjects);
  Mousetrap.bind('}', eventToggleAmigaMode);
  Mousetrap.bind('?', mousetrap);
  Mousetrap.bind('_', mousetrap);
  Mousetrap.bind('-', mousetrap);

  Mousetrap.bind(['(', ')'], mousetrap); // allow () for pvnert(x)

  //Mousetrap.bind('enter', mousetrap);
  Mousetrap.bind('tab', mousetrap); // so we can block default browser action
  Mousetrap.bind('return', mousetrap);
  Mousetrap.bind('escape', mousetrap);
  //Mousetrap.bind('del', mousetrap);
  Mousetrap.bind('backspace', mousetrap);
  Mousetrap.bind('space', mousetrap);

  Mousetrap.bind(['up', 'shift+up'], mousetrap);
  Mousetrap.bind(['down', 'shift+down'], mousetrap);
  Mousetrap.bind(['left', 'shift+left'], mousetrap);
  Mousetrap.bind(['right', 'shift+right'], mousetrap);
  Mousetrap.bind(['pageup', 'shift+pageup'], mousetrap);
  Mousetrap.bind(['pagedown', 'shift+pagedown'], mousetrap);
  Mousetrap.bind(['home', 'shift+home'], mousetrap);
  Mousetrap.bind(['end', 'shift+end'], mousetrap);

  Mousetrap.bind(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'], mousetrap);
  Mousetrap.bind(['n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'], mousetrap);

  Mousetrap.bind(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'], mousetrap);
  Mousetrap.bind(['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], mousetrap);

  Mousetrap.bind('*', mousetrap);
  Mousetrap.bind(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], mousetrap);
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
  // if (original_objects)
  //   document.getElementById("toggleObjects").value = "  Hack Style Objects  ";
  // else
  //   document.getElementById("toggleObjects").value = "  Larn Style Objects  ";
  updateLog(`hack-style objects: ${original_objects ? "off" : "on"}`);
  paint();
}



// toggle between hack-like and original objects
function eventToggleAmigaMode() {
  nomove = 1;
  amiga_mode = !amiga_mode;
  updateLog(`amiga-style objects: ${amiga_mode ? "on" : "off"}`);
  paint();
}



function eventToggleDebugStats() {
  nomove = 1;
  debug_used = 1;
  DEBUG_STATS = !DEBUG_STATS;
  updateLog("DEBUG_STATS: " + DEBUG_STATS);
  paint();
}



function eventToggleDebugOutput() {
  nomove = 1;
  debug_used = 1;
  DEBUG_OUTPUT = !DEBUG_OUTPUT;
  updateLog("DEBUG_OUTPUT: " + DEBUG_OUTPUT);
  paint();
}



function eventToggleDebugWTW() {
  nomove = 1;
  debug_used = 1;
  player.updateWTW(player.WTW == 0 ? 100000 : -player.WTW);
  updateLog("DEBUG_WALK_THROUGH_WALLS: " + (player.WTW > 0));
  paint();
}



function eventToggleDebugStairs() {
  nomove = 1;
  debug_used = 1;
  DEBUG_STAIRS_EVERYWHERE = !DEBUG_STAIRS_EVERYWHERE;
  updateLog("DEBUG_STAIRS_EVERYWHERE: " + DEBUG_STAIRS_EVERYWHERE);
  paint();
}



function eventToggleDebugKnowAll() {
  nomove = 1;
  debug_used = 1;
  DEBUG_KNOW_ALL = true;
  for (var i = 0; i < spelcode.length; i++) {
    learnSpell(spelcode[i]);
  }
  for (var i = 0; i < SCROLL_NAMES.length; i++) {
    learnScroll(createObject(OSCROLL, i));
  }
  for (var i = 0; i < POTION_NAMES.length; i++) {
    learnPotion(createObject(OPOTION, i));
  }
  updateLog("DEBUG_KNOW_ALL: " + DEBUG_KNOW_ALL);
  paint();
}



function eventToggleDebugStealth() {
  nomove = 1;
  debug_used = 1;
  if (player.STEALTH <= 0) {
    player.updateHoldMonst(100000);
    player.updateStealth(100000);
    updateLog("DEBUG: FREEZING MONSTERS");
  } else {
    player.updateHoldMonst(-player.HOLDMONST);
    player.updateStealth(-player.STEALTH);
    updateLog("DEBUG: UNFREEZING MONSTERS");
  }
  paint();
}



function eventToggleDebugAwareness() {
  nomove = 1;
  debug_used = 1;
  if (player.AWARENESS <= 0) {
    player.AWARENESS = 100000;
    updateLog("DEBUG: EXPANDED AWARENESS++");
  } else {
    player.AWARENESS = 0;
    updateLog("DEBUG: EXPANDED AWARENESS--");
  }
  paint();
}



function eventToggleDebugImmortal() {
  nomove = 1;
  debug_used = 1;
  if (player.LIFEPROT <= 0) {
    player.LIFEPROT = 100000;
    updateLog("DEBUG: LIFE PROTECTION++");
  } else {
    player.LIFEPROT = 0;
    updateLog("DEBUG: LIFE PROTECTION--");
  }
  paint();
}



function eventToggleDebugProximity() {
  nomove = 1;
  debug_used = 1;
  DEBUG_PROXIMITY = !DEBUG_PROXIMITY;
  if (!DEBUG_PROXIMITY) mazeMode = true;
  updateLog("DEBUG: PROXIMITY: " + DEBUG_PROXIMITY);
  paint();
}
