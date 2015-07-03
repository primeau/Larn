"use strict";

// home = 0
// volcanic 1 = 11
var LEVELS = [14];
var LOG_SIZE = 6;
var LOG = [""];
var LAST_LOG = 0;

var DEBUG_OUTPUT = false;
var DEBUG_WALK_THROUGH_WALLS = false;
var DEBUG_STAIRS_EVERYWHERE = false;
var DEBUG_KNOW_ALL = false;

function positionplayer(x, y, exact) {
  // short circuit for moving to exact location
  var distance = 0;
  if (exact && canMove(x, y)) {
    player.x = x;
    player.y = y;
    player.level.paint();
    debug("positionplayer: (" + distance + ") got " + xy(x, y));
    return true;
  }

  // try 20 times to be 1 step away, then 2 steps, etc...
  distance = 1;
  var maxTries = 20;
  var numTries = maxTries;
  while (distance < 10) {
    while (numTries-- > 0) {
      var newx = x + (rnd(3) - 2) * distance;
      var newy = y + (rnd(3) - 2) * distance;
      debug("positionplayer: (" + distance + ") try " + xy(newx, newy));
      if ((newx != x || newy != y)) {
        if (canMove(newx, newy)) {
          player.x = newx;
          player.y = newy;
          player.level.paint();
          debug("positionplayer: (" + distance + ") got " + xy(newx, newy));
          return true;
        }
      }
    }
    numTries = maxTries;
    distance++;
  }
  return false;
}

// move near an item, or on top of it if possible
function moveNear(item, exact) {
  // find the item
  for (var x = 0; x < MAXX; x++) {
    for (var y = 0; y < MAXY; y++) {
      if (isItem(x, y, item)) {
        debug("movenear: found: " + item.id + " at " + xy(x, y));
        positionplayer(x, y, exact);
        return true;
      }
    }
  }
  debug("movenear: NOT FOUND: " + item.id);
  return false;
} // movenear

function canMove(x, y) {
  //debug("canMove: testing: (" + x + "," + y + ")");
  if (x < 0) return false;
  if (x >= MAXX) return false;
  if (y < 0) return false;
  if (y >= MAXY) return false;

  if (DEBUG_WALK_THROUGH_WALLS) return true;

  var item = player.level.items[x][y];
  if (isItem(x, y, OWALL)) {
    return false;
  } else {
    return true;
  }
}


var Larn = {
  run: function() {
    document.onkeypress = this.keyPress;
    //document.onkeydown = this.keyPress;

    player.x = rnd(MAXX - 2);
    player.y = rnd(MAXY - 2);

    updateLog("Welcome to Larn"); // need to initialize the log

    newcavelevel(0);
  },

  // http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
  keyPress: function(e) {
    e = e || window.event;
    parseEvent(e);
  }, // KEYPRESS

}; // LARN OBJCT



function updateLog(text) {
  LOG.push(text);
  if (LOG.length > LOG_SIZE) {
    LOG.shift();
  }
  if (player != null && player.level != null) {
    player.level.paint();
  }
}


function appendLog(text) {
  var newText = LOG.pop() + text;
  updateLog(newText);
}
