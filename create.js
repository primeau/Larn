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
    level.items[Math.floor(MAXX / 2)][MAXY - 1] = createObject(OHOMEENTRANCE);
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

  for (var numgold = rnd(12) + 11; numgold > 0; numgold--)
    fillroom(OGOLDPILE, 12 * rnd(level.depth + 1) + (level.depth << 3) + 10);
  for (var numpotions = rnd(4) + 3; numpotions > 0; numpotions--)
    fillroom(OPOTION, newpotion());
  for (var numscrolls = rnd(5) + 3; numscrolls > 0; numscrolls--)
    fillroom(OSCROLL, newscroll());

}


/*
    subroutine to put monsters into an empty room without walls or other
    monsters
 */
function fillmonst(monster) {
  for (var trys = 5; trys > 0; --trys) /* max # of creation attempts */ {
    var x = rnd(MAXX - 2);
    var y = rnd(MAXY - 2);
    if ((player.level.items[x][y].matches(OEMPTY))
     && (player.level.monsters[x][y] == null) && ((player.x != x) || (player.y != y))) {
      player.level.monsters[x][y] = monster;
      // know[x][y] &= ~KNOWHERE; //TODO what is this for?
      // hitp[x][y] = monster[what].hitpoints;
      return (0);
    }
  }
  return (-1); /* creation failure */
}


/*
    creates an entire set of monsters for a level
    must be done when entering a new level
    if sethp(1) then wipe out old monsters else leave them there
 */
function sethp(flg) {
  // TODO
  // if (flg) {
  //   for (i = 0; i < MAXY; i++) {
  //     for (j = 0; j < MAXX; j++) {
  //       stealth[j][i] = 0;
  //     }
  //   }
  // }

  // TODO
  // if (level == 0) {
  //   c[TELEFLAG] = 0;
  //   return;
  // } /* if teleported and found level 1 then know level we are on */
  var nummonsters;
  if (flg) {
    nummonsters = rnd(12) + 2 + (player.level.depth >> 1);
  } else {
    nummonsters = (player.level.depth >> 1) + 1;
  }
  for (var i = 0; i < nummonsters; i++) {
    fillmonst(makemonst(player.level.depth));
  }
}

/*
    makemonst(lev)
        int lev;

    function to return monster number for a randomly selected monster
        for the given cave level
 */

// var monstlevel = [5, 11, 17, 22, 27, 33, 39, 42, 46, 50, 53, 56, 59];

function makemonst(lev) {
  var arg;
  var x;
  if (lev < 1)
    lev = 1;
  if (lev > 12)
    lev = 12;
  if (lev < 5)
    arg = rnd(monstlevel[lev - 1]);
  else
    arg = rnd(monstlevel[lev - 1] - monstlevel[lev - 4]) + monstlevel[lev - 4];

  var monster = createMonster(arg);
  debug("create.makemonst(" + lev + "): " + monster.name);

  // tmp=rnd((x=monstlevel[lev-1])?x:1);
  // else
  // tmp=rnd((x=monstlevel[lev-1]-monstlevel[lev-4])?x:1)+monstlevel[lev-4];

  // TODO
  // while (monster[tmp].genocided && tmp < MAXMONST)
  //   tmp++; /* genocided? */
  // return (tmp);
  return monster;
}
