"use strict";

const MAXLEVEL = 11; /*  max # levels in the dungeon         */
const MAXVLEVEL = 3; /*  max # of levels in the temple of the luran  */
var LEVELS = [];
var LOG_SIZE = 5;
var LOG = [""];
var LAST_LOG = 0;

var IN_STORE = false;

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



/*
    moveplayer(dir)

    subroutine to move the player from one room to another
    returns 0 if can't move in that direction or hit a monster or on an object
    else returns 1
    nomove is set to 1 to stop the next move (inadvertent monsters hitting
    players when walking into walls) if player walks off screen or into wall
 */

const diroffx = [0, 0, 1, 0, -1, 1, -1, 1, -1];
const diroffy = [0, 1, 0, -1, 0, -1, -1, 1, 1];

/*  from = present room #  direction =
        [1-north] [2-east] [3-south] [4-west]
        [5-northeast] [6-northwest] [7-southeast] [8-southwest]
        if direction=0, don't move--just show where he is */
function moveplayer(dir) {

  if (player.CONFUSE) {
    if (player.level.depth < rnd(30)) {
      dir = rund(9); /*if confused any dir*/
    }
  }

  var k = player.x + diroffx[dir];
  var m = player.y + diroffy[dir];

  if (k < 0 || k >= MAXX || m < 0 || m >= MAXY) {
    nomove = 1;
    yrepcount = 0;
    return (0);
  }
  var item = player.level.items[k][m];
  var monster = player.level.monsters[k][m];

  /* prevent the player from moving onto a wall, or a closed door when
     in command mode, unless the character has Walk-Through-Walls.
   */
  if ((item.matches(OCLOSEDDOOR) || item.matches(OWALL)) && player.WTW == 0) {
    nomove = 1;
    yrepcount = 0;
    return (0);
  }

  if (item.matches(OHOMEENTRANCE)) {
    newcavelevel(0);
    moveNear(OENTRANCE, false);
    return 0;
  }

  /* hit a monster
   */
  if (monster) {
    hitmonster(k, m);
    yrepcount = 0;
    return (0);
  }

  /* check for the player ignoring an altar when in command mode.
   */
  if (getItem(player.x, player.y).matches(OALTAR) && !prayed) {
    updateLog("  You have ignored the altar!");
    act_ignore_altar();
  }
  prayed = 0;

  lastpx = player.x;
  lastpy = player.y;
  player.x = k;
  player.y = m;

  if (!item.matches(OEMPTY) &&
    !item.matches(OTRAPARROWIV) && !item.matches(OIVTELETRAP) &&
    !item.matches(OIVDARTRAP) && !item.matches(OIVTRAPDOOR)) {
    yrepcount = 0;
    return (0);
  } else {
    return (1);
  }
}



// move near an item, or on top of it if possible
function moveNear(item, exact) {
  // find the item
  for (var x = 0; x < MAXX; x++) {
    for (var y = 0; y < MAXY; y++) {
      if (isItem(x, y, item)) {
        //debug("movenear: found: " + item.id + " at " + xy(x, y));
        positionplayer(x, y, exact);
        return true;
      }
    }
  }
  debug("movenear: NOT FOUND: " + item.id);
  return false;
} // movenear



function updateLog(text) {
  if (DEBUG_OUTPUT) {
    //console.log(`LARN: ${text}`);
  }
  LOG.push(text);
  if (LOG.length > LOG_SIZE) {
    LOG.shift();
  }
}


function lprcat(text) {
  updateLog(text);
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
