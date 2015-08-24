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


// TODO!
function bot_linex() {}



//TODO!
function drawscreen() {
  clear();

  // if (messages_saved) {
  //   messages_saved = 0;
  //   os_save_restore_area(1, 0, 20 - 1, 80 - 1, 24 - 1);
  // }
  // messages_on = 1;
  // display_status_info(0);

  var know = player.level.know;

  for (var j = 0; j < MAXY; j++) {
    cursor(1, 1 + j);

    for (var i = 0; i < MAXX; i++) {
      if (know[i][j] == 0)
        lprc(' ');
      else if (know[i][j] & HAVESEEN) {
        if (i == player.x && j == player.y)
          lprc(player.char);
        else {
          var monst = monsterAt(i,j);
          if (monst != null && know[i][j] & KNOWHERE)
            lprc(monst.getChar());
          else
            lprc(getItem(i,j).getChar());
        }
      } else {
        lprc(' ');
        //mitem[i][j] = item[i][j] = 0;
      }
    }
  }
}



function drawstore() {
  var doc = document.getElementById("STATS");
  if (doc != null)
    document.getElementById("STATS").innerHTML = DEBUG_STATS ? game_stats() : "";
}
