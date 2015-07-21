"use strict";

const MAXX = 67;
const MAXY = 17;

var Level = {

  depth: -1,
  items: [],
  monsters: [],

  create: function(depth) {
    var mazeTemplate = createRandomMaze(depth);

    this.items = initGrid(MAXX, MAXY);
    this.monsters = initGrid(MAXX, MAXY);

    this.depth = depth;

    let wall = createObject(OWALL); // TODO THIS IS BECAUSE I AM DUMB AND DON'T UNDERSTAND OBJECTS
    let empty = createObject(OEMPTY); // TODO THIS IS BECAUSE I AM DUMB AND DON'T UNDERSTAND OBJECTS

    for (var x = 0; x < MAXX; x++) {
      for (var y = 0; y < MAXY; y++) {
        if (mazeTemplate[x][y] == "#") {
          // this.items[x][y] = createObject(OWALL); //
          // this.items[x][y] = OWALL; // TODO: this is what I should do
          this.items[x][y] = wall; // TODO
        } else if (mazeTemplate[x][y] == "D") {
          this.items[x][y] = createObject(OCLOSEDDOOR, rnd(30));
        } else {
          // this.items[x][y] = createObject(OEMPTY);
          // this.items[x][y] = OEMPTY; // TODO
          this.items[x][y] = empty; // TODO
        }
      }
    }

  }, // create


  paint: function() {

    if (IN_STORE) {
      drawstore();
    } else {
      drawmaze();
    }

  },


}; // Level


// TODO!
function bot_linex() {}

//TODO!
function drawscreen() {
player.level.paint();
}

function drawstore() {

  var output = "";

  for (var y = 0; y < 24; y++) {
    for (var x = 0; x < 80; x++) {
      output += display[x][y] != null ? display[x][y] : ' ';
    } // inner for
    output += "\n";
  } // outer for

  document.getElementById("LARN").innerHTML = output;

  var doc = document.getElementById("STATS");
  if (doc != null)
    document.getElementById("STATS").innerHTML = DEBUG_STATS ? game_stats() : "";


}



function drawmaze() {
  var level = player.level;
  var output = "";

  cursor(1,1);
  for (var y = 0; y < MAXY; y++) {
    for (var x = 0; x < MAXX; x++) {
      // HACK
      // HACK
      // HACK
      if (x != player.x || y != player.y) {
        if (level.monsters[x][y] != null) {
          lprc(monsterlist[level.monsters[x][y].arg].char);
        } else {
          lprc(level.items[x][y].char);
        }
      } else {
        lprc(`▓`); // http://www.iam.uni-bonn.de/~alt/html/unicode_172.html
      }
      // HACK
      // HACK
      // HACK
    } // inner for
    lprc("\n");
  } // outer for

  bottomline();

  // TODO: move to bottomline()?
  lprcat(player.getStatString());
  lprc("\n");

  for (var logindex = 0; logindex < LOG.length; logindex++) {
    cltoeoln();
    lprcat(LOG[logindex] + "\n");
  }

  drawstore();

  //document.getElementById("LARN").innerHTML = output;

  var doc = document.getElementById("STATS");
  if (doc != null)
    document.getElementById("STATS").innerHTML = DEBUG_STATS ? game_stats() : "";
}


/*
    newcavelevel(level)
    int level;

    function to enter a new level.  This routine must be called anytime the
    player changes levels.  If that level is unknown it will be created.
TODO    A new set of monsters will be created for a new level, and existing
    levels will get a few more monsters.
TODO    Note that it is here we remove genocided monsters from the present level.
 */

function newcavelevel(depth) {
  debug("going to: " + depth);

  if (LEVELS[depth] instanceof Level.constructor) {
    debug("level exists: " + depth);
    player.level = LEVELS[depth];
    sethp(false);
  } else {
    debug("level does not exist: " + depth);
    var newLevel = Object.create(Level);
    newLevel.create(depth);
    LEVELS[depth] = newLevel;
    player.level = LEVELS[depth];
    sethp(true);
    makeobject(newLevel);
  }
  if (!positionplayer(player.x, player.y, true)) {
    debug("newcavelevel(): adjusted to " + xy(player.x, player.y));
  }
  player.level.paint();
}
