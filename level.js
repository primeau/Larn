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
    output += this.depth <= 10 ? this.depth : "V"+(this.depth-10);
    output += "\n";

    for (var i = 0; i < LOG_SIZE; i++) {
      output += LOG[i] + "\n";
    }
    output += "\n";

    document.getElementById("LARN").innerHTML = output;
  }

}; // Level
