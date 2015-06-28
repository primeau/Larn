"use strict";



function canMove(x, y) {
  if (x < 0) return false;
  if (x >= MAXX) return false;
  if (y < 0) return false;
  if (y >= MAXY) return false;
  var item = player.level.items[x][y];
  if (item == "#") {
    return false;
  } else {
    return true;
  }
}


var Larn = {
  run: function() {
    document.onkeydown = this.keyPressed;

    player.x = 1;
    player.y = 1;

    // home = 0
    // volcanic 1 = 11
    var LEVELS = [14];

    var level = Object.create(Level);
    level.create();
    LEVELS[0] = level;

    player.level = level;

    level.paint();

    // map.init();
    // map.paint();

  },


  keyPressed: function(e) {

    e = e || window.event;

    //console.log(event.keyCode);

    var newx = player.x;
    var newy = player.y;

    //console.log(e.keyCode);

    /*

    q  w  e
     \ | /
    a - - d
     / | \
    z  x  c

    */


    // TODO: NEED DIAGONAL KEY CODES
    if (e.keyCode == '81' || e.keyCode == '81') { // UP,LEFT
      newx--;
      newy--;
    } else if (e.keyCode == '38' || e.keyCode == '87') { // UP
      newy--;
    } else if (e.keyCode == '69' || e.keyCode == '69') { // UP,RIGHT
      newx++;
      newy--;
    } else if (e.keyCode == '37' || e.keyCode == "65") { // LEFT
      newx--;
    } else if (e.keyCode == '39' || e.keyCode == "68") { // RIGHT
      newx++;
    } else if (e.keyCode == '90' || e.keyCode == '90') { // DOWN,LEFT
      newx--;
      newy++;
    } else if (e.keyCode == '40' || e.keyCode == '88') { // DOWN
      newy++;
    } else if (e.keyCode == '67' || e.keyCode == "67") { // DOWN,RIGHT
      newx++;
      newy++;
    }

    if (canMove(newx, newy)) {
      player.x = newx;
      player.y = newy;
    }


    player.level.paint();

  },




};
