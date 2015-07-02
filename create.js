"use strict";


/*
    subroutine to put an object into an empty room
 *  uses a random walk
*/
function fillroom(item, what, arg) {
  var x, y;

  var safe = 100;
  x = rnd(MAXX - 2);
  y = rnd(MAXY - 2);
  while (isItem(x, y, OWALL)) {
    x += rnd(3) - 2;
    y += rnd(3) - 2;
    if (x > MAXX - 2) x = 1;
    if (x < 1) x = MAXX - 2;
    if (y > MAXY - 2) y = 1;
    if (y < 1) y = MAXY - 2;
    debug("fillroom(): safe=" + safe + ": " + x + "," + y + "=" + item.char);
    if (safe-- == 0) {
      debug("fillroom: SAFETY!");
      break;
    }
  }
  item[x][y] = what;
  what.arg = arg;
  debug("fillroom(): safe=" + safe + " " + x + "," + y + " " + item[x][y].char + " -> " + what.char + "(" + what.arg + ")");
}



/*
 ***********
    MAKE_OBJECT
 ***********
    subroutine to create the objects in the maze for the given level
 */
function makeobject(level) {

  debug("makeobject: level " + level.depth);

  if (level.depth == 0) {
    fillroom(level.items, createObject(OENTRANCE), 0);
    fillroom(level.items, createObject(OVOLDOWN), 0);
    return;
  }

  if (level.depth == 1) {
    level.items[Math.floor(MAXX / 2)][MAXY - 1] = createObject(OHOMEENTRANCE);
  }
  if (level.depth >= 1 && level.depth < 10 || level.depth == 11 || level.depth == 12) {
    fillroom(level.items, createObject(OSTAIRSDOWN), 0);
  }
  if (level.depth > 1 && level.depth <= 10 || level.depth == 12 || level.depth == 13) {
    fillroom(level.items, createObject(OSTAIRSUP), 0);
  }
  if (level.depth == 11) {
    fillroom(level.items, createObject(OVOLUP), 0);
  }

  var numgold = rnd(12) + 11;
  while(numgold-- >= 0)
    fillroom(level.items, createObject(OGOLDPILE), 12 * rnd(level.depth + 1) + (level.depth << 3) + 10); /* make GOLD */

}
