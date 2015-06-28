"use strict";

const MAXX = 67;
const MAXY = 17;

var Level = {
  items: [],

  create: function(grid) {
    var mazeTemplate = getRandomMaze();

    this.items = initGrid();

    for (var x = 0; x < MAXX; x++) {
      for (var y = 0; y < MAXY; y++) {
        if (mazeTemplate[x][y] == "#") {
          this.items[x][y] = "#";
        } else {
          this.items[x][y] = ".";
        }
      }
    } // create
  },


  paint: function() {
    var output = "";

    for (var y = 0; y < MAXY; y++) {
      for (var x = 0; x < MAXX; x++) {
        // HACK
        // HACK
        // HACK
        if (x != player.x || y != player.y) {
          output += this.items[x][y];
        }
        else {
          output += "\u2588";
        }
        // HACK
        // HACK
        // HACK
      } // inner for
      output += "\n";
    } // outer for
    document.getElementById("LARN").innerHTML = output;
  }

}; // Level
