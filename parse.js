"use strict";

var drink_take_ignore_potion = false;
var read_take_ignore_scroll = false;
var wait_for_drop_input = false;
var take_ignore_item = false;
var wait_for_wield_input = false;
var wait_for_wear_input = false;

const ESC = 27;

function movePlayer(currentx, currenty, xdir, ydir, run) {
  while (canMove(currentx + xdir, currenty + ydir)) {
    currentx += xdir;
    currenty += ydir;
    if (!run || !isItem(currentx, currenty, OEMPTY)) {
      break;
    }
    //debug("moveplayer: " + currentx + "," + currenty);
  }

  if (player.level.monsters[currentx][currenty]) {
    hitmonster(currentx, currenty);
  } else {
    player.x = currentx;
    player.y = currenty;
  }

  lookforobject(true, false, true);

  movemonst();

  player.level.paint();

}


function preParseEvent(e, keyDown, keyUp) {
  var code = e.which;
  //debug(`preParseEvent(): got: ${code}: ${keyDown} ${keyUp} ${e.key}`);
  if (keyDown) { // to capture ESC key etc
    if (code == 27 || code >= 37 && code <= 40) {
      e.preventDefault(); // prevent scrolling on page
      parseEvent(e);
    } else {
      //debug("preParseEvent.keydown(): ignoring: " + code);
    }
  } else if (keyUp) {
    //debug("preParseEvent.keyup(): ignoring: " + code);
  } else {
    if (code < 37 || code > 40) {
      parseEvent(e);
    } else {
      debug("preParseEvent.keypress(): ignoring: " + code);
    }
  }
}


function parseEvent(e) {

  var code = e.which;
  var key = String.fromCharCode(code);

  var newx = player.x;
  var newy = player.y;

  if (drink_take_ignore_potion) {
    opotion(code == ESC ? ESC : key);
    return;
  }
  if (read_take_ignore_scroll) {
    oscroll(code == ESC ? ESC : key);
    return;
  }
  if (take_ignore_item) {
    oitem(code == ESC ? ESC : key);
    return;
  }
  if (wait_for_drop_input) {
    drop_object(code == ESC ? ESC : key);
    return;
  }
  if (wait_for_wield_input) {
    wield(code == ESC ? ESC : key);
    return;
  }
  if (wait_for_wear_input) {
    wear(code == ESC ? ESC : key);
    return;
  }

  //
  // DROP
  //
  if (key == 'd') {
    drop_object(null);
    return;
  }

  //
  // WIELD
  //
  if (key == 'w') {
    wield(null);
    return;
  }

  //
  // WEAR
  //
  if (key == 'W') {
    wear(null);
    return;
  }


  /*
           ARROW KEYS           NUMPAD               KEYBOARD
               ↑               7  8  9               y  k  u
               |                \ | /                 \ | /
            ←- . -→            4 -.- 6               h -.- l
               |                / | \                 / | \
               ↓               1  2  3               b  j  n
  */

  //
  // MOVE PLAYER
  //

  if (key == 'y' || key == 'Y' || code == 55) { // UP,LEFT
    movePlayer(newx, newy, -1, -1, e.shiftKey);
  } else if (key == 'k' || key == 'K' || code == 56 || code == 38) { // UP
    movePlayer(newx, newy, 0, -1, e.shiftKey);
  } else if (key == 'u' || key == 'U' || code == 57) { // UP,RIGHT
    movePlayer(newx, newy, 1, -1, e.shiftKey);
  } else if (key == 'h' || key == 'H' || code == 52 || code == 37) { // LEFT
    movePlayer(newx, newy, -1, 0, e.shiftKey);
  } else if (key == 'l' || key == 'L' || code == 54 || code == 39) { // RIGHT
    movePlayer(newx, newy, 1, 0, e.shiftKey);
  } else if (key == 'b' || key == 'B' || code == 49) { // DOWN,LEFT
    movePlayer(newx, newy, -1, 1, e.shiftKey);
  } else if (key == 'j' || key == 'J' || code == 50 || code == 40) { // DOWN
    movePlayer(newx, newy, 0, 1, e.shiftKey);
  } else if (key == 'n' || key == 'N' || code == 51) { // DOWN, RIGHT
    movePlayer(newx, newy, 1, 1, e.shiftKey);
  }

  //
  // UP LEVEL
  //
  else if (key == '<') { // UP STAIRS
    if (isItem(newx, newy, OSTAIRSUP)) {
      updateLog("Climbing Up Stairs");
      newcavelevel(player.level.depth - 1);
      //positionplayer(newx, newy, true);
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
  // DOWN LEVEL
  //
  else if (key == '>') { // DOWN STAIRS
    if (isItem(newx, newy, OSTAIRSDOWN)) {
      updateLog("Climbing Down Stairs");
      newcavelevel(player.level.depth + 1);
      //positionplayer(newx, newy, true);
    } else if (isItem(newx, newy, OVOLDOWN)) {
      updateLog("Climbing Down Volcanic Shaft");
      newcavelevel(11);
      //positionplayer(newx, newy, true); // should do this to make it more difficult
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

  } else if (key == 'g') { // GO INSIDE DUNGEON
  } else if (key == 'C') { // CLIMB IN/OUT OF VOLCANO

    //
    // DEBUGGING SHORTCUTS
    //
  } else if (key == '~') {
    DEBUG_STATS = !DEBUG_STATS;
    updateLog("DEBUG_STATS: " + DEBUG_STATS);
  } else if (key == '!') {
    DEBUG_OUTPUT = !DEBUG_OUTPUT;
    updateLog("DEBUG_OUTPUT: " + DEBUG_OUTPUT);
  } else if (key == '@') {
    DEBUG_WALK_THROUGH_WALLS = !DEBUG_WALK_THROUGH_WALLS;
    updateLog("DEBUG_WALK_THROUGH_WALLS: " + DEBUG_WALK_THROUGH_WALLS);
  } else if (key == '#') {
    DEBUG_STAIRS_EVERYWHERE = !DEBUG_STAIRS_EVERYWHERE;
    updateLog("DEBUG_STAIRS_EVERYWHERE: " + DEBUG_STAIRS_EVERYWHERE);
  } else if (key == '$') {
    DEBUG_KNOW_ALL = !DEBUG_KNOW_ALL;
    if (DEBUG_KNOW_ALL) {
      for (var potioni = 0; potioni < potionname.length; potioni++) {
        var potion = createObject(OPOTION, potioni);
        player.level.items[potioni][0] = potion;
      }
      for (var scrolli = 0; scrolli < scrollname.length; scrolli++) {
        var scroll = createObject(OSCROLL, scrolli);
        player.level.items[potioni + scrolli][0] = scroll;
      }
      var weaponi = 0;
      player.level.items[weaponi++][MAXY - 1] = createObject(ODAGGER);
      player.level.items[weaponi++][MAXY - 1] = createObject(OBELT);
      player.level.items[weaponi++][MAXY - 1] = createObject(OSPEAR);
      player.level.items[weaponi++][MAXY - 1] = createObject(OFLAIL);
      player.level.items[weaponi++][MAXY - 1] = createObject(OBATTLEAXE);
      player.level.items[weaponi++][MAXY - 1] = createObject(OLANCE);
      player.level.items[weaponi++][MAXY - 1] = createObject(OLONGSWORD);
      player.level.items[weaponi++][MAXY - 1] = createObject(O2SWORD);
      player.level.items[weaponi++][MAXY - 1] = createObject(OSWORD);
      player.level.items[weaponi++][MAXY - 1] = createObject(OSWORDofSLASHING);
      player.level.items[weaponi++][MAXY - 1] = createObject(OHAMMER);
      var armori = weaponi;
      player.level.items[armori++][MAXY - 1] = createObject(OSHIELD);
      player.level.items[armori++][MAXY - 1] = createObject(OLEATHER);
      player.level.items[armori++][MAXY - 1] = createObject(OSTUDLEATHER);
      player.level.items[armori++][MAXY - 1] = createObject(ORING);
      player.level.items[armori++][MAXY - 1] = createObject(OCHAIN);
      player.level.items[armori++][MAXY - 1] = createObject(OSPLINT);
      player.level.items[armori++][MAXY - 1] = createObject(OPLATE);
      player.level.items[armori++][MAXY - 1] = createObject(OPLATEARMOR);
      player.level.items[armori++][MAXY - 1] = createObject(OSSPLATE);

    }
    updateLog("DEBUG_KNOW_ALL: " + DEBUG_KNOW_ALL);
  }



  if (isItem(player.x, player.y, OHOMEENTRANCE)) {
    updateLog("Going to Home Level");
    newcavelevel(0);
    moveNear(OENTRANCE, false);
  }

} // KEYPRESS
