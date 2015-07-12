"use strict";

var drink_take_ignore_potion = false;
var wait_for_drop_input = false;
var take_ignore_item = false;
var wait_for_wear_input = false;
var wait_for_open_direction = false;

const ESC = 27;


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

var blocking_callback;
var non_blocking_callback;

function parseEvent(e) {

  nomove = 0;

  var code = e.which;
  var key = String.fromCharCode(code);

  var newx = player.x;
  var newy = player.y;

  if (blocking_callback != null) {
    let done = blocking_callback(code == ESC ? ESC : key);
    player.level.paint();
    if (done) {
      blocking_callback = null;
    }
    return;
  }

  if (non_blocking_callback != null) {
    non_blocking_callback(code == ESC ? ESC : key);
    non_blocking_callback = null;
    player.level.paint();
  }



  if (take_ignore_item) {
    oitem(code == ESC ? ESC : key);
    return;
  }
  if (wait_for_drop_input) {
    drop_object(code == ESC ? ESC : key);
    return;
  }
  if (wait_for_wear_input) {
    wear(code == ESC ? ESC : key);
    return;
  }
  if (wait_for_open_direction) {
    open_something(parseDirectionKeys(key, code));
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
    updateLog("What do you want to wield (- for nothing) [* for all] ?");
    non_blocking_callback = wield;
    return;
  }

  //
  // WEAR
  //
  if (key == 'W') {
    wear(null);
    return;
  }

  //
  // OPEN (in a direction)
  //
  if (key == 'O') {
    yrepcount = 0;
    //    if (!prompt_mode)
    open_something(null);
    // else
    //   nomove = 1;
    return;
  }

  //
  // OPEN (in a direction)
  //
  if (key == 'o') {
    yrepcount = 0;
    //    if (!prompt_mode)
    o_closed_door(null);
    // else
    //   nomove = 1;
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
  var dir = parseDirectionKeys(key, code);
  if (dir > 0) {
    if (e.shiftKey) {
      run(dir);
    } else {
      moveplayer(dir);
    }
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
    player.WTW = player.WTW == 0 ? 100000 : 0;
    updateLog("DEBUG_WALK_THROUGH_WALLS: " + (player.WTW > 0));
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
  } else if (key == '^') {
    if (player.STEALTH <= 0) {
      updateLog("DEBUG: FREEZING MONSTERS");
      player.HOLDMONST = 100000;
      player.STEALTH = 100000;
    }
    else {
      updateLog("DEBUG: UNFREEZING MONSTERS");
      player.HOLDMONST = 0;
      player.STEALTH = 0;
    }
  }

  hitflag = 0;

  if (prompt_mode)
    lookforobject(true, false, true);
  //else
  //lookforobject( true, ( auto_pickup && !move_no_pickup ), false);
  //else
  //dropflag=0; /* don't show it just dropped an item */


  if (nomove == 0) {
    movemonst();
  }
  player.level.paint();

} // KEYPRESS


// /*
//  *  dirsub(x,y)      Routine to ask for direction, then modify playerx,
//  *                   playery for it
//  *      int *x,*y;
//  *
//  *  Function to ask for a direction and modify an x,y for that direction
//  *  Enter with the coordinate destination (x,y).
//  *  Returns index into diroffx[] (0-8).
//  */
// function dirsub(direction) {
//
//   if (direction == null || direction < 0) {
//     updateLog("In What Direction? ");
//     wait_for_direction = true;
//     return;
//   }
//
//   var x = player.x + diroffx[direction];
//   var y = player.y + diroffy[direction];
//   var item = itemAt(x, y);
//
//   if (item != null) {
//     wait_for_direction = false;
//     return direction;
//   }
//
//   updateLog("TODO: parse.dirsub()");
//   // * x = playerx + diroffx[i]; * y = playery + diroffy[i];
//   // vxy(x, y);
//   // return (i);
// }


//const diroffx = { 0,  0, 1,  0, -1,  1, -1, 1, -1 };
//const diroffy = { 0,  1, 0, -1,  0, -1, -1, 1,  1 };

function parseDirectionKeys(key, code) {
  var dir = 0;
  if (key == 'y' || key == 'Y' || code == 55) { // UP,LEFT
    dir = 6;
  } else if (key == 'k' || key == 'K' || code == 56 || code == 38) { // NORTH
    dir = 3;
  } else if (key == 'u' || key == 'U' || code == 57) { // UP,RIGHT
    dir = 5;
  } else if (key == 'h' || key == 'H' || code == 52 || code == 37) { // LEFT
    dir = 4;
  } else if (key == 'l' || key == 'L' || code == 54 || code == 39) { // RIGHT
    dir = 2;
  } else if (key == 'b' || key == 'B' || code == 49) { // DOWN,LEFT
    dir = 8;
  } else if (key == 'j' || key == 'J' || code == 50 || code == 40) { // DOWN
    dir = 1;
  } else if (key == 'n' || key == 'N' || code == 51) { // DOWN, RIGHT
    dir = 7;
  }
  return dir;

}
