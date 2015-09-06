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

  //if (!amiga_mode) amiga_mode = true;

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
  if (amiga_mode) return bltAmiga();

  var output = "";
  for (var y = 0; y < 24; y++) {
    for (var x = 0; x < 80; x++) {
      output += display[x][y] != null ? display[x][y] : ' ';
    } // inner for
    output += "\n";
  } // outer for
  document.getElementById("LARN").innerHTML = output;
}


//var images = initGrid(80, 24);
var images = [];

function loadImages() {

}



function bltAmiga() {

  console.log("bltamiga");

  var canvas = document.getElementById("lCanvas");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var y = 0; y < 24; y++) {
    // console.log(""+y);
    for (var x = 0; x < 80; x++) {

      if (display[x][y].indexOf('png') >= 0) {

        var image = images[display[x][y]];
        if (!image) {
          image = new Image();
          image.onload = function() {
            if (!this.isloaded) {
              this.isloaded = true;
              var canvas = document.getElementById("lCanvas");
              var ctx = canvas.getContext("2d");
              ctx.drawImage(this, this.xx, this.yy, 9, 18);
            }
          };
          images[display[x][y]] = image;
        }
        image.xx = x * 9;
        image.yy = y * 18;
        image.src = display[x][y];
//        if (image.isloaded) {
          ctx.drawImage(image, image.xx, image.yy, 9, 18);
//        }

      } else {
        ctx.font = "12px Courier New";
        ctx.fillStyle = "lightgrey";
        //ctx.textAlign = "center";
        ctx.fillText(display[x][y], 9 + x * 9, 18 + y * 18);
      }

    } // inner for
  } // outer for

}



function drawstore() {
  var doc = document.getElementById("STATS");
  if (doc != null)
    document.getElementById("STATS").innerHTML = DEBUG_STATS ? game_stats() : "";
}
