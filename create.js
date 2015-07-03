"use strict";


/*
    subroutine to put an object into an empty room
 *  uses a random walk
*/
function fillroom(what, arg) {
  var x, y;

  var newItem = createObject(what);

  var safe = 100;
  x = rnd(MAXX - 2);
  y = rnd(MAXY - 2);
  while (!isItem(x, y, OEMPTY)) {
    x += rnd(3) - 2;
    y += rnd(3) - 2;
    if (x > MAXX - 2) x = 1;
    if (x < 1) x = MAXX - 2;
    if (y > MAXY - 2) y = 1;
    if (y < 1) y = MAXY - 2;
    //debug("fillroom(): safe=" + safe + ": " + x + "," + y + "=" + newItem.char);
    if (safe-- == 0) {
      debug("fillroom: SAFETY!");
      break;
    }
  }
  player.level.items[x][y] = newItem;
  newItem.arg = arg;
  //debug("fillroom(): safe=" + safe + " " + x + "," + y + " " + player.level.items[x][y].char + " -> " + newItem.char + "(" + newItem.arg + ")");
}


/*
    subroutine to fill in a number of objects of the same kind
 */
function fillmroom(n, what, arg) {
  for (var i = 0; i < n; i++) {
    fillroom(what, arg);
  }
}


/*
 ***********
    MAKE_OBJECT
 ***********
    subroutine to create the objects in the maze for the given level
 */
function makeobject(level) {

  debug("makeobject: making objects for level " + level.depth);

  if (level.depth == 0) {
    fillroom(OENTRANCE, 0);
    fillroom(OVOLDOWN, 0);
    return;
  }

  if (level.depth == 1) {
    level.items[Math.floor(MAXX / 2)][MAXY - 1] = OHOMEENTRANCE;
  }
  if (level.depth != 0 && level.depth != 13) {
    fillroom(OSTAIRSDOWN, 0);
  }
  if (level.depth != 0 && level.depth != 11) {
    fillroom(OSTAIRSUP, 0);
  }
  if (level.depth == 11) {
    fillroom(OVOLUP, 0);
  }

  fillmroom(rund(3), OPIT, 0);
  fillmroom(rund(2), OMIRROR, 0);
  fillmroom(rund(3), OSTATUE, 0);

  var numgold = rnd(12) + 11;
  while (numgold-- >= 0)
    fillroom(OGOLDPILE, 12 * rnd(level.depth + 1) + (level.depth << 3) + 10); /* make GOLD */


}
