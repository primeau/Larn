"use strict";

var Larn = {
  run: function () {
    document.onkeydown = this.keyPressed;

    player.x = 1;
    player.y = 1;
    map.init();
    map.paint();

  },


  keyPressed: function(e) {

    e = e || window.event;

    //console.log(event.keyCode);

    if (e.keyCode == '38') {
      player.y = Math.max(0, player.y-1);
    }
    else if (e.keyCode == '40') {
      player.y = Math.min(map.height-1, player.y+1);
    }
    else if (e.keyCode == '37') {
      player.x = Math.max(0, player.x-1);
    }
    else if (e.keyCode == '39') {
      player.x = Math.min(map.width-1, player.x+1);
    }

    map.paint();

  }



};
