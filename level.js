"use strict";

const MAXX = 67;
const MAXY = 17;

var Level = {

  depth: -1,
  items: [],

  create: function(depth) {
    var mazeTemplate = createRandomMaze(depth);

    this.items = initGrid();

    this.depth = depth;

    for (var x = 0; x < MAXX; x++) {
      for (var y = 0; y < MAXY; y++) {
        if (mazeTemplate[x][y] == "#") {
          this.items[x][y] = createObject(OWALL);
        } else {
          this.items[x][y] = createObject(OEMPTY);
        }
      }
    }

  }, // create


  paint: function() {
    var output = "";

    for (var y = 0; y < MAXY; y++) {
      for (var x = 0; x < MAXX; x++) {
        // HACK
        // HACK
        // HACK
        if (x != player.x || y != player.y) {
          output += this.items[x][y].char;
        } else {
          output += "\u2593"; // http://www.iam.uni-bonn.de/~alt/html/unicode_172.html
        }
        // HACK
        // HACK
        // HACK
      } // inner for
      output += "\n";
    } // outer for

    output += player.getStatString();

    output += "\n";

    for (var i = 0; i < LOG_SIZE; i++) {
      output += LOG[i] + "\n";
    }
    output += "\n";

    document.getElementById("LARN").innerHTML = output;
  },



}; // Level




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
  } else {
    debug("level does not exist: " + depth);
    var newLevel = Object.create(Level);
    newLevel.create(depth);
    LEVELS[depth] = newLevel;
    player.level = LEVELS[depth];
    makeobject(newLevel);
  }
  player.level.paint();
}
