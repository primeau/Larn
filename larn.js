"use strict";

// home = 0
// volcanic 1 = 11
var LEVELS = [14];
var LOG_SIZE = 15;
var LOG = null;
var LAST_LOG = 0;

var DEBUG_OUTPUT = false;
var DEBUG_WALK_THROUGH_WALLS = false;
var DEBUG_STAIRS_EVERYWHERE = false;

function positionplayer(x, y, exact) {
  // short circuit for moving to exact location
  if (exact && canMove(x, y)) {
    player.x = x;
    player.y = y;
    player.level.paint();
    debug("positionplayer: (0): " + x + "," + y);
    return;
  }

  // try 20 times to be 1 step away, then 2 steps, etc...
  var distance = 1;
  var maxTries = 20;
  while (distance < 10) {
    while (maxTries-- > 0) {
      var newx = x + (rnd(3) - 1) * distance;
      var newy = y + (rnd(3) - 1) * distance;
      debug(newx + "," + newy);
      if ((newx != x || newy != y)) {
        if (canMove(newx, newy)) {
          player.x = newx;
          player.y = newy;
          player.level.paint();
          debug("positionplayer: (" + distance + ") " + newx + "," + newy);
          return;
        }
      }
    }
    maxTries = 20;
    distance++;
  }
}

// move near an item, or on top of it if possible
function moveNear(item, exact) {
  var x, y;
  var itemx = -1;
  var itemy = -1;
  // find the item
  for (x = 0; x < MAXX; x++) {
    if (itemx >= 0) break;
    for (y = 0; y < MAXY; y++) {
      if (itemx >= 0) break;
      if (isItem(x, y, item)) {
        debug("movenear: found: " + item.id + " at " + x + "," + y);
        itemx = x;
        itemy = y;
        break;
      }
    }
  }
  positionplayer(itemx, itemy, exact);
} // movenear

function canMove(x, y) {
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

    player.x = rnd(MAXX);
    player.y = rnd(MAXY);

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
  if (LOG == null) {
    LOG = [LOG_SIZE];
    for (var i = 0; i < LOG_SIZE; i++) {
      LOG[i] = "";
    }
  }
  LOG.pop();
  LOG.unshift(text);
  if (player != null && player.level != null) {
    player.level.paint();
  }
}
