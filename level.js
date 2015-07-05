"use strict";

const MAXX = 67;
const MAXY = 17;

var Level = {

  depth: -1,
  items: [],
  monsters: [],

  create: function(depth) {
    var mazeTemplate = createRandomMaze(depth);

    this.items = initGrid();
    this.monsters = initGrid();

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
          if (this.monsters[x][y] != null) {
            output += this.monsters[x][y].char;
          } else {
            output += this.items[x][y].char;
          }
        } else {
          output += "▓"; // http://www.iam.uni-bonn.de/~alt/html/unicode_172.html
        }
        // HACK
        // HACK
        // HACK
      } // inner for
      output += "\n";
    } // outer for


    this.bottomline();

    // TODO: move to bottomline()?
    output += player.getStatString();
    output += "\n";

    for (var logindex = 0; logindex < LOG.length; logindex++) {
      output += LOG[logindex] + "\n";
    }
    output += "\n";

    document.getElementById("LARN").innerHTML = output;

    var doc = document.getElementById("STATS");
    if (doc != null)
      document.getElementById("STATS").innerHTML = game_stats();

  },


  /*
      bottomline()

      now for the bottom line of the display
   */
  bottomline: function() {
    player.recalc();
    // TODO: lots
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
