"use strict";

// home = 0
// volcanic 1 = 11
var LEVELS = [14];
var LOG_SIZE = 15;
var LOG = null;
var LAST_LOG = 0;

var DEBUG_WALK_THROUGH_WALLS = false;
var DEBUG_STAIRS_EVERYWHERE = false;

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

function isItem(x, y, compareItem) {
  var levelItem = player.level.items[x][y];
  if (levelItem.char == compareItem.char) {
    return true;
  } else {
    return false;
  }
}

var Larn = {
  run: function() {
    document.onkeypress = this.keyPress;
    //document.onkeydown = this.keyPress;

    player.x = 1;
    player.y = 1;

    updateLog("1"); // need to initialize the log
    updateLog("2");
    updateLog("3");
    updateLog("4");

    newcavelevel(0);



  },


  // http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
  keyPress: function(e) {

    e = e || window.event;

    var newx = player.x;
    var newy = player.y;

    /*
                   ARROW KEYS           NUMPAD               KEYBOARD
                 HOME  ↑  PgUp         7  8  9               q  w  e
                     \ | /              \ | /                 \ | /
                    ← -5- →            4 -5- 6               a -s- d
                     / | \              / | \                 / | \
                  END  ↓  PgDn         1  2  3               z  x  c
    */

    //debug(e.keyCode);

    /*
    if (e.keyCode == '36' || e.keyCode == '103' || e.keyCode == '81') { // UP,LEFT
      newx--;
      newy--;
    } else if (e.keyCode == '38' || e.keyCode == '104' || e.keyCode == '87') { // UP
      newy--;
    } else if (e.keyCode == '33' || e.keyCode == '105' || e.keyCode == '69') { // UP,RIGHT
      newx++;
      newy--;
    } else if (e.keyCode == '37' || e.keyCode == '100' || e.keyCode == "65") { // LEFT
      newx--;
    } else if (e.keyCode == '39' || e.keyCode == '102' || e.keyCode == "68") { // RIGHT
      newx++;
    } else if (e.keyCode == '35' || e.keyCode == '97' || e.keyCode == '90') { // DOWN,LEFT
      newx--;
      newy++;
    } else if (e.keyCode == '40' || e.keyCode == '98' || e.keyCode == '88') { // DOWN
      newy++;
    } else if (e.keyCode == '34' || e.keyCode == '99' || e.keyCode == "67") { // GO DOWN
      newx++;
      newy++;
*/
    if (String.fromCharCode(e.which) == 'q') { // UP,LEFT
      newx--;
      newy--;
    } else if (String.fromCharCode(e.which) == 'w') { // UP
      newy--;
    } else if (String.fromCharCode(e.which) == 'e') { // UP,RIGHT
      newx++;
      newy--;
    } else if (String.fromCharCode(e.which) == 'a') { // LEFT
      newx--;
    } else if (String.fromCharCode(e.which) == 'd') { // RIGHT
      newx++;
    } else if (String.fromCharCode(e.which) == 'z') { // DOWN,LEFT
      newx--;
      newy++;
    } else if (String.fromCharCode(e.which) == 'x') { // DOWN
      newy++;
    } else if (String.fromCharCode(e.which) == 'c') { // GO DOWN
      newx++;
      newy++;
    } else if (String.fromCharCode(e.which) == '<') { // UP STAIRS
      if (isItem(newx, newy, OSTAIRSDOWN) && !DEBUG_STAIRS_EVERYWHERE) {
        updateLog("The stairs don't go up!");
        return;
      }
      if (!isItem(newx, newy, OSTAIRSUP) && !DEBUG_STAIRS_EVERYWHERE) {
        updateLog("I see no way to go up here!");
        return;
      }
      if (player.level.depth != 0) {
        updateLog("Going Up");
        newcavelevel(player.level.depth - 1);
      }
    } else if (String.fromCharCode(e.which) == '>') { // DOWN STAIRS
      if (isItem(newx, newy, OSTAIRSUP) && !DEBUG_STAIRS_EVERYWHERE) {
        updateLog("The stairs don't go down!");
        return;
      }
      if (!isItem(newx, newy, OSTAIRSDOWN) && !DEBUG_STAIRS_EVERYWHERE) {
        updateLog("I see no way to go down here!");
        return;
      }
      if (player.level.depth != 10 && player.level.depth != 13) {
        updateLog("Going Down");
        newcavelevel(player.level.depth + 1);
      }
    } else if (String.fromCharCode(e.which) == 'g') { // GO INSIDE DUNGEON
      if (!isItem(newx, newy, OENTRANCE) && !DEBUG_STAIRS_EVERYWHERE) {
         //updateLog("");
         return;
      }
      if (player.level.depth == 0) {
        updateLog("Entering Dungeon");
        newx = Math.floor(MAXX / 2);
        newy = MAXY - 2;
        newcavelevel(1);
      }
    }

    if (canMove(newx, newy)) {
      player.x = newx;
      player.y = newy;

      if (isItem(player.x, player.y, OHOMEENTRANCE)) {
        updateLog("Going to Home Level");
        newcavelevel(0);
        player.level.paint();
      }

    }

    player.level.paint();

  }, // KEYPRESS




};


var DEBUG = true;

function debug(text) {

  if (DEBUG) {
    console.log("DEBUG: " + text);
    updateLog("DEBUG: " + text);
  }

}
