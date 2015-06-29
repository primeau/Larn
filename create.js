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
  debug("fillroom(): safe=" + safe + " " + x + "," + y + " " + item[x][y].char + " -> " + what.char);

  item[x][y] = what;
  //iarg[x][y] = arg; // TODO: WHAT IS THIS FOR
}


function filllevel(level) {

  debug(level.depth);

  if (level.depth >= 1 && level.depth < 10 || level.depth == 11 || level.depth == 12) {
    fillroom(level.items, createObject(OSTAIRSDOWN), 0);
  }
  if (level.depth > 1 && level.depth <= 10 || level.depth == 12 || level.depth == 13) {
    fillroom(level.items, createObject(OSTAIRSUP), 0);
  }
  if (level.depth == 0) {
    fillroom(level.items, createObject(OENTRANCE), 0);
    fillroom(level.items, createObject(OVOLDOWN), 0);
  }
  if (level.depth == 1) {
    level.items[Math.floor(MAXX/2)][MAXY-1] = createObject(OHOMEENTRANCE);
  }
  if (level.depth == 11) {
    fillroom(level.items, createObject(OVOLUP), 0);
  }


}




/*
    newcavelevel(level)
    int level;

    function to enter a new level.  This routine must be called anytime the
    player changes levels.  If that level is unknown it will be created.
    A new set of monsters will be created for a new level, and existing
    levels will get a few more monsters.
    Note that it is here we remove genocided monsters from the present level.
 */
/*
newcavelevel(x)
register int x;
{
        register int i,j;
        if (beenhere[level]) savelevel(); // put the level back into storage
        level = x;          // get the new level and put in working storage
        if (beenhere[x])
        {
                getlevel();
                sethp(0);
                positionplayer();
                checkgen();
                return;
        }

        // fill in new level
        for (i=0; i<MAXY; i++)
                for (j=0; j<MAXX; j++)
                        know[j][i]=mitem[j][i]=0;
        makemaze(x);
        makeobject(x);
        beenhere[x]=1;
        sethp(1);
        positionplayer();
        checkgen(); // wipe out any genocided monsters

#if WIZID
        if (wizard || x==0)
#else
        if (x==0)
#endif
                for (j=0; j<MAXY; j++)
                        for (i=0; i<MAXX; i++)
                                know[i][j] = KNOWALL;
}
*/

function newcavelevel(depth) {
  debug("going to: " + depth);

  if (LEVELS[depth] instanceof Level.constructor) {
    debug("level exists: " + depth);
    player.level = LEVELS[depth];
  } else {
    debug("level does not exist: " + depth);
    var newLevel = Object.create(Level);
    newLevel.create(depth);
    LEVELS[depth] = newLevel;
    player.level = LEVELS[depth];
    filllevel(newLevel);
  }
  player.level.paint();
}
