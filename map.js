"use strict";

var Map = {
  width: 80,
  height: 15,
  grid: [],

  /*
   * init
   */
  init: function() {
    // initialize the grid[][] Array
    this.grid = new Array(this.width);
    for (var x = 0 ; x < this.width ; x++) {
      this.grid[x] = new Array(this.height);
    }
    // fill the grid with empty space
    for (var x = 0 ; x < this.width ; x++) {
      for (var y = 0 ; y < this.height ; y++) {
         this.grid[x][y] = ".";
      } // inner for
    } // outer for
  }, // init

  paintGrid: function() {
    // fill the grid with empty space
    for (var x = 0 ; x < this.width ; x++) {
      for (var y = 0 ; y < this.height ; y++) {
         this.grid[x][y] = ".";
      } // inner for
    } // outer for
  }, // paintGrid

  paintPlayer: function() {
    this.grid[player.x][player.y] = "\u2588";
  }, // paintPlayer

  /*
   * paint
   */
  paint: function () {
   this.paintGrid();
   this.paintPlayer();
    var output = "";
    for (var y = 0 ; y < this.height ; y++) {
      for (var x = 0 ; x < this.width ; x++) {
         output += this.grid[x][y];
      } // inner for
      output += "\n";
    } // outer for
    document.getElementById("LARN").innerHTML = output;
  }
};
