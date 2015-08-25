"use strict";

const MAXX = 67;
const MAXY = 17;

var Level = {
  items: [],
  monsters: [],
  know: [],
}; // Level



function paint() {

  DEBUG_PAINT++;

  if (IN_STORE) {
    drawstore();
  } else {
    drawscreen();
    botside();
    bottomline();
  }

  blt();

}


function blt() {
  var output = "";
  for (var y = 0; y < 24; y++) {
    for (var x = 0; x < 80; x++) {
      output += display[x][y] != null ? display[x][y] : ' ';
    } // inner for
    output += "\n";
  } // outer for
  document.getElementById("LARN").innerHTML = output;
}



function drawstore() {
  var doc = document.getElementById("STATS");
  if (doc != null)
    document.getElementById("STATS").innerHTML = DEBUG_STATS ? game_stats() : "";
}
