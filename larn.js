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

const MAXLEVEL = 11; /*  max # levels in the dungeon         */
const MAXVLEVEL = 3; /*  max # of levels in the temple of the luran  */
var LOG_SIZE = 5;

var Larn = {
  run: function() {
    document.onkeypress = this.keyPress;
    document.onkeydown = this.keyDown;
    //document.onkeyup = this.keyUp;

    player.x = rnd(MAXX - 2);
    player.y = rnd(MAXY - 2);

    updateLog("Welcome to Larn -- Press ? for help"); // need to initialize the log

    player.inventory[0] = createObject(OLEATHER);
    player.inventory[1] = createObject(ODAGGER);
    player.WEAR = player.inventory[0];
    player.WIELD = player.inventory[1];

    // always know cure dianthroritis
    learnPotion(createObject(OPOTION, 21));

    learnSpell("pro");
    learnSpell("mle");
    newcavelevel(0);

    regen();

    showcell(player.x, player.y);

    paint();

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



function updateLog(text) {
  if (DEBUG_OUTPUT) {
    //console.log(`LARN: ${text}`);
  }
  LOG.push(text);
  if (LOG.length > LOG_SIZE) {
    LOG.shift();
  }
}


function appendLog(text) {
  var newText;
  if (text == DEL) {
    newText = LOG.pop();
    newText = newText.substring(0, newText.length - 1);
  } else {
    newText = LOG.pop() + text;
  }
  updateLog(newText);
}
