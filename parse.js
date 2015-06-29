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
    newx--;
    newy--;
  } else if (String.fromCharCode(e.which) == 'Q') { // RUN UP,LEFT
    do {
      newx--;
      newy--;
    } while (canMove(newx - 1, newy - 1));
  } else if (String.fromCharCode(e.which) == 'w') { // UP
    newy--;
  } else if (String.fromCharCode(e.which) == 'W') { // RUN UP
    do {
      newy--;
    } while (canMove(newx, newy - 1));
  } else if (String.fromCharCode(e.which) == 'e') { // UP,RIGHT
    newx++;
    newy--;
  } else if (String.fromCharCode(e.which) == 'E') { // RUN UP,RIGHT
    do {
      newx++;
      newy--;
    } while (canMove(newx + 1, newy - 1));
  } else if (String.fromCharCode(e.which) == 'a') { // LEFT
    newx--;
  } else if (String.fromCharCode(e.which) == 'A') { // RUN LEFT
    do {
      newx--;
    } while (canMove(newx - 1, newy));
  } else if (String.fromCharCode(e.which) == 'd') { // RIGHT
    newx++;
  } else if (String.fromCharCode(e.which) == 'D') { // RUN RIGHT
    do {
      newx++;
    } while (canMove(newx + 1, newy));
  } else if (String.fromCharCode(e.which) == 'z') { // DOWN,LEFT
    newx--;
    newy++;
  } else if (String.fromCharCode(e.which) == 'Z') { // RUN DOWN,LEFT
    do {
      newx--;
      newy++;
    } while (canMove(newx - 1, newy + 1));
  } else if (String.fromCharCode(e.which) == 'x') { // DOWN
    newy++;
  } else if (String.fromCharCode(e.which) == 'X') { // RUN DOWN
    do {
      newy++;
    } while (canMove(newx, newy + 1));
  } else if (String.fromCharCode(e.which) == 'c') { // DOWN, RIGHT
    newx++;
    newy++;
  } else if (String.fromCharCode(e.which) == 'C') { // RUN DOWN, RIGHT
    do {
      newx++;
      newy++;
    } while (canMove(newx + 1, newy + 1));
  }

  // UP
  else if (String.fromCharCode(e.which) == '<') { // UP STAIRS
    if (isItem(newx, newy, OSTAIRSUP)) {
      newcavelevel(player.level.depth - 1);
      positionplayer(newx, newy, true);
      return;
    } else if (isItem(newx, newy, OVOLUP)) {
      updateLog("Climbing Up Volcanic Shaft");
      newcavelevel(0);
      moveNear(OVOLDOWN, false);
      return;
    } else if (DEBUG_STAIRS_EVERYWHERE) {
      if (player.level.depth == 0) {
        // do nothing
      } else if (player.level.depth == 1) {
        moveNear(OHOMEENTRANCE, true);
        newx = player.x;
        newy = player.y;
      } else if (player.level.depth == 11) {
        moveNear(OVOLUP, true);
        parseEvent(e);
        return;
      } else {
        moveNear(OSTAIRSUP, true);
        parseEvent(e);
        return;
      }
    } else if (isItem(newx, newy, OSTAIRSDOWN)) {
      updateLog("The stairs don't go up!");
      return;
    } else if (!isItem(newx, newy, OSTAIRSUP) || !isItem(newx, newy, OVOLUP)) {
      // we can only go up stairs, or volcanic shaft leading upward
      updateLog("I see no way to go up here!");
      return;
    }
  }

  // DOWN
  else if (String.fromCharCode(e.which) == '>') { // DOWN STAIRS
    if (isItem(newx, newy, OSTAIRSDOWN)) {
      newcavelevel(player.level.depth + 1);
      positionplayer(newx, newy, true);
      return;
    } else if (isItem(newx, newy, OVOLDOWN)) {
      updateLog("Climbing Down Volcanic Shaft");
      newcavelevel(11);
      //positionplayer(newx, newy, true);
      moveNear(OVOLUP, false);
      debug("Moving near V -- REMOVE THIS FEATURE LATER");
      return;
    } else if (isItem(newx, newy, OENTRANCE)) {
      updateLog("Entering Dungeon");
      newx = Math.floor(MAXX / 2);
      newy = MAXY - 2;
      newcavelevel(1);
      return;
    } else if (DEBUG_STAIRS_EVERYWHERE) {
      if (player.level.depth == 0) {
        moveNear(OENTRANCE, true);
        parseEvent(e);
        return;
      } else if (player.level.depth != 10 && player.level.depth != 13) {
        moveNear(OSTAIRSDOWN, true);
        parseEvent(e);
        return;
      }


    }


    if (isItem(newx, newy, OSTAIRSUP) && !DEBUG_STAIRS_EVERYWHERE) {
      updateLog("The stairs don't go down!");
      return;
    }
    if (!isItem(newx, newy, OSTAIRSDOWN) && !DEBUG_STAIRS_EVERYWHERE) {
      updateLog("I see no way to go down here!");
      return;
    }

    // if (isItem(newx, newy, OENTRANCE) || DEBUG_STAIRS_EVERYWHERE && player.level.depth == 0) {
    //   updateLog("Entering Dungeon");
    //   newx = Math.floor(MAXX / 2);
    //   newy = MAXY - 2;
    //   newcavelevel(1);
    // }

  } else if (String.fromCharCode(e.which) == 'g') { // GO INSIDE DUNGEON
  } else if (String.fromCharCode(e.which) == 'C') { // CLIMB IN/OUT OF VOLCANO
  }




  if (canMove(newx, newy)) {
    player.x = newx;
    player.y = newy;

    if (isItem(player.x, player.y, OHOMEENTRANCE)) {
      updateLog("Going to Home Level");
      newcavelevel(0);
      moveNear(OENTRANCE, false);
    }
  }

  player.level.paint();

} // KEYPRESS
