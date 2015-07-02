function movePlayer(currentx, currenty, xdir, ydir, run) {
  while (canMove(currentx + xdir, currenty + ydir)) {
    currentx += xdir;
    currenty += ydir;
    if (!run || !isItem(currentx, currenty, OEMPTY)) {
      break;
    }
    //debug("moveplayer: " + currentx + "," + currenty);
  }
  player.x = currentx;
  player.y = currenty;

  lookforobject(true, false, true);

  player.level.paint();

}


function parseEvent(e) {

  var newx = player.x;
  var newy = player.y;

  /*
                 ARROW KEYS           NUMPAD               KEYBOARD
               HOME  ↑  PgUp         7  8  9               q  w  e
                   \ | /              \ | /                 \ | /
                  ← -5- →            4 -5- 6               a -s- d
                   / | \              / | \                 / | \
                END  ↓  PgDn         1  2  3               z  x  c
  */

  //debug(e.keyCode);

  /*
  if (e.keyCode == '36' || e.keyCode == '103' || e.keyCode == '81') { // UP,LEFT
    newx--;
    newy--;
  } else if (e.keyCode == '38' || e.keyCode == '104' || e.keyCode == '87') { // UP
    newy--;
  } else if (e.keyCode == '33' || e.keyCode == '105' || e.keyCode == '69') { // UP,RIGHT
    newx++;
    newy--;
  } else if (e.keyCode == '37' || e.keyCode == '100' || e.keyCode == "65") { // LEFT
    newx--;
  } else if (e.keyCode == '39' || e.keyCode == '102' || e.keyCode == "68") { // RIGHT
    newx++;
  } else if (e.keyCode == '35' || e.keyCode == '97' || e.keyCode == '90') { // DOWN,LEFT
    newx--;
    newy++;
  } else if (e.keyCode == '40' || e.keyCode == '98' || e.keyCode == '88') { // DOWN
    newy++;
  } else if (e.keyCode == '34' || e.keyCode == '99' || e.keyCode == "67") { // GO DOWN
    newx++;
    newy++;
*/
  if (String.fromCharCode(e.which) == 'q') { // UP,LEFT
    movePlayer(newx, newy, -1, -1, false);
  } else if (String.fromCharCode(e.which) == 'Q') { // RUN UP,LEFT
    movePlayer(newx, newy, -1, -1, true);
  } else if (String.fromCharCode(e.which) == 'w') { // UP
    movePlayer(newx, newy, 0, -1, false);
  } else if (String.fromCharCode(e.which) == 'W') { // RUN UP
    movePlayer(newx, newy, 0, -1, true);
  } else if (String.fromCharCode(e.which) == 'e') { // UP,RIGHT
    movePlayer(newx, newy, 1, -1, false);
  } else if (String.fromCharCode(e.which) == 'E') { // RUN UP,RIGHT
    movePlayer(newx, newy, 1, -1, true);
  } else if (String.fromCharCode(e.which) == 'a') { // LEFT
    movePlayer(newx, newy, -1, 0, false);
  } else if (String.fromCharCode(e.which) == 'A') { // RUN LEFT
    movePlayer(newx, newy, -1, 0, true);
  } else if (String.fromCharCode(e.which) == 'd') { // RIGHT
    movePlayer(newx, newy, 1, 0, false);
  } else if (String.fromCharCode(e.which) == 'D') { // RUN RIGHT
    movePlayer(newx, newy, 1, 0, true);
  } else if (String.fromCharCode(e.which) == 'z') { // DOWN,LEFT
    movePlayer(newx, newy, -1, 1, false);
  } else if (String.fromCharCode(e.which) == 'Z') { // RUN DOWN,LEFT
    movePlayer(newx, newy, -1, 1, true);
  } else if (String.fromCharCode(e.which) == 'x') { // DOWN
    movePlayer(newx, newy, 0, 1, false);
  } else if (String.fromCharCode(e.which) == 'X') { // RUN DOWN
    movePlayer(newx, newy, 0, 1, true);
  } else if (String.fromCharCode(e.which) == 'c') { // DOWN, RIGHT
    movePlayer(newx, newy, 1, 1, false);
  } else if (String.fromCharCode(e.which) == 'C') { // RUN DOWN, RIGHT
    movePlayer(newx, newy, 1, 1, true);
  }

  //
  // UP
  //
  else if (String.fromCharCode(e.which) == '<') { // UP STAIRS
    if (isItem(newx, newy, OSTAIRSUP)) {
      updateLog("Climbing Up Stairs");
      newcavelevel(player.level.depth - 1);
      positionplayer(newx, newy, true);
    } else if (isItem(newx, newy, OVOLUP)) {
      updateLog("Climbing Up Volcanic Shaft");
      newcavelevel(0);
      moveNear(OVOLDOWN, false);
    } else if (DEBUG_STAIRS_EVERYWHERE) {
      if (player.level.depth == 0) {
        // do nothing
      } else if (player.level.depth == 1) {
        debug("STAIRS_EVERYWHERE: going to home level");
        newcavelevel(0);
        moveNear(OENTRANCE, false);
      } else if (player.level.depth == 11) {
        debug("STAIRS_EVERYWHERE: climbing up volcanic shaft");
        moveNear(OVOLUP, true);
        parseEvent(e);
        return;
      } else {
        debug("STAIRS_EVERYWHERE: climbing up stairs");
        moveNear(OSTAIRSUP, true);
        parseEvent(e);
        return;
      }
    } else if (isItem(newx, newy, OSTAIRSDOWN)) {
      updateLog("The stairs don't go up!");
    } else if (!isItem(newx, newy, OSTAIRSUP) || !isItem(newx, newy, OVOLUP)) {
      // we can only go up stairs, or volcanic shaft leading upward
      updateLog("I see no way to go up here!");
    }
  }

  //
  // DOWN
  //
  else if (String.fromCharCode(e.which) == '>') { // DOWN STAIRS
    if (isItem(newx, newy, OSTAIRSDOWN)) {
      updateLog("Climbing Down Stairs");
      newcavelevel(player.level.depth + 1);
      positionplayer(newx, newy, true);
    } else if (isItem(newx, newy, OVOLDOWN)) {
      updateLog("Climbing Down Volcanic Shaft");
      newcavelevel(11);
      //positionplayer(newx, newy, true);
      moveNear(OVOLUP, false);
      debug("Moving near V -- REMOVE THIS FEATURE LATER");
    } else if (isItem(newx, newy, OENTRANCE)) {
      updateLog("Entering Dungeon");
      player.x = Math.floor(MAXX / 2);
      player.y = MAXY - 2;
      newcavelevel(1);
    } else if (DEBUG_STAIRS_EVERYWHERE) {
      if (player.level.depth == 0) {
        debug("STAIRS_EVERYWHERE: entering dungeon");
        moveNear(OENTRANCE, true);
        parseEvent(e);
        return;
      } else if (player.level.depth != 10 && player.level.depth != 13) {
        debug("STAIRS_EVERYWHERE: climbing down stairs");
        moveNear(OSTAIRSDOWN, true);
        parseEvent(e);
        return;
      }
    } else if (isItem(newx, newy, OSTAIRSUP)) {
      updateLog("The stairs don't go down!");
    } else if (!isItem(newx, newy, OSTAIRSDOWN) || !isItem(newx, newy, OVOLDOWN)) {
      updateLog("I see no way to go down here!");
    }

  } else if (String.fromCharCode(e.which) == 'g') { // GO INSIDE DUNGEON
  } else if (String.fromCharCode(e.which) == 'C') { // CLIMB IN/OUT OF VOLCANO

  } else if (String.fromCharCode(e.which) == '!') {
    DEBUG_OUTPUT = !DEBUG_OUTPUT;
    updateLog("DEBUG_OUTPUT: " + DEBUG_OUTPUT);
  } else if (String.fromCharCode(e.which) == '@') {
    DEBUG_WALK_THROUGH_WALLS = !DEBUG_WALK_THROUGH_WALLS;
    updateLog("DEBUG_WALK_THROUGH_WALLS: " + DEBUG_WALK_THROUGH_WALLS);
  } else if (String.fromCharCode(e.which) == '#') {
    DEBUG_STAIRS_EVERYWHERE = !DEBUG_STAIRS_EVERYWHERE;
    updateLog("DEBUG_STAIRS_EVERYWHERE: " + DEBUG_STAIRS_EVERYWHERE);
  }



  if (isItem(player.x, player.y, OHOMEENTRANCE)) {
    updateLog("Going to Home Level");
    newcavelevel(0);
    moveNear(OENTRANCE, false);
  }

} // KEYPRESS
