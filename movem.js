'use strict';

var MonsterLocation = {
  x: 0,
  y: 0,
  smart: false,
}

/*
 *  movemonst()     Routine to move the monsters toward the player
 *
 *  This routine has the responsibility to determine which monsters are to
 *  move, and call movemt() to do the move.
 *  Returns no value.
 */
function movemonst() {
  if (player.HOLDMONST) return; /* no action if monsters are held */

  /* list of monsters to move */
  var movelist = [];

  var i, j, tmp1, tmp2, tmp3, tmp4;

  if (player.AGGRAVATE) /* determine window of monsters to move */ {
    tmp1 = player.y - 5;
    tmp2 = player.y + 6;
    tmp3 = player.x - 10;
    tmp4 = player.x + 11;
  } else {
    tmp1 = player.y - 3;
    tmp2 = player.y + 4;
    tmp3 = player.x - 5;
    tmp4 = player.x + 6;
  }

  if (level == 0) /* if on outside level monsters can move in perimeter */ {
    if (tmp1 < 0) tmp1 = 0;
    if (tmp2 > MAXY) tmp2 = MAXY;
    if (tmp3 < 0) tmp3 = 0;
    if (tmp4 > MAXX) tmp4 = MAXX;
  } else /* if in a dungeon monsters can't be on the perimeter (wall there) */ {
    if (tmp1 < 1) tmp1 = 1;
    if (tmp2 > MAXY - 1) tmp2 = MAXY - 1;
    if (tmp3 < 1) tmp3 = 1;
    if (tmp4 > MAXX - 1) tmp4 = MAXX - 1;
  }

  /* We now have a window in which to move monsters.  First find all
     monsters in the window, then decide whether or not to move them.
     Its faster that way since the size of the window is usually larger
     than the # of monsters in that window.

     Find all monsters in the window.  The only time a monster cannot
     move is if: monsters are not aggrevated, AND player is stealthed,
     AND the monster is asleep due to stealth.  Split into two
     separate loops in order to simplify the if statement inside the
     loop for the most common case.

     Also count # of smart monsters.
  */
  var smart_count = 0;
  var movecnt = 0;
  var min_int = 10 - getDifficulty(); /* minimum monster intelligence to move smart */
  if (player.AGGRAVATE || player.STEALTH == 0) {
    for (j = tmp1; j < tmp2; j++) {
      for (i = tmp3; i < tmp4; i++) {
        var monster = monsterAt(i, j);
        if (monster) {
          var current = Object.create(MonsterLocation);
          current.x = i;
          current.y = j;
          if (monster.intelligence > min_int) {
            current.smart = true;
            smart_count++;
          } else
            current.smart = false;

          movelist[movecnt] = current;
          movecnt++;
        }
      }
    }
  } else {
    for (j = tmp1; j < tmp2; j++) {
      for (i = tmp3; i < tmp4; i++) {
        var monster = monsterAt(i, j);
        if (monster && monster.awake) {
          var current = Object.create(MonsterLocation);
          current.x = i;
          current.y = j;
          if (monster.intelligence > min_int) {
            current.smart = true;
            smart_count++;
          } else
            current.smart = false;

          movelist[movecnt] = current;
          movecnt++;
        }
      }
    }
  }

  /* now move the monsters in the movelist.  If we have at least one
     smart monster, build a proximity ripple and use it for all smart
     monster movement.
  */
  if (movecnt > 0) {
    if (player.SCAREMONST)
      for (i = 0; i < movecnt; i++)
        move_scared(movelist[i].x, movelist[i].y);
    else {
      if (smart_count > 0) {
        /* I was going to put in code that prevented the rebuilding
           of the proximity ripple if the player had not moved since
           the last turn.  Unfortunately, this permits the player to
           blast down doors to treasure rooms and not have a single
           intelligent monster move.
        */
        build_proximity_ripple();
        for (i = 0; i < movecnt; i++)
          if (movelist[i].smart)
            move_smart(movelist[i].x, movelist[i].y);
          else
            move_dumb(movelist[i].x, movelist[i].y);
      } else
        for (i = 0; i < movecnt; i++)
          move_dumb(movelist[i].x, movelist[i].y);
    }
  }

  /* Also check for the last monster hit.  This is necessary to prevent
     the player from getting free hits on a monster with long range
     spells or when stealthed.
  */
  if (player.AGGRAVATE || player.STEALTH == 0) {
    /* If the last monster hit is within the move window, its already
       been moved.
    */
    var monster = monsterAt(lasthx, lasthy);
    if (((lasthx < tmp3 || lasthx >= tmp4) ||
        (lasthy < tmp1 || lasthy >= tmp2)) && monster) {
      if (player.SCAREMONST)
        move_scared(lasthx, lasthy);
      else
      if (monster.intelligence > min_int) {
        if (smart_count == 0)
          build_proximity_ripple();
        move_smart(lasthx, lasthy);
      } else
        move_dumb(lasthx, lasthy);
      lasthx = w1x; /* make sure the monster gets moved again */
      lasthy = w1y;
    }
  } else {
    /* If the last monster hit is within the move window, and not
           asleep due to stealth, then it has already been moved.
       Otherwise (monster outside window, asleep due to stealth),
       move the monster and update the lasthit x,y position.
        */
    var monster = monsterAt(lasthx, lasthy);
    if (((lasthx < tmp3 || lasthx >= tmp4) ||
        (lasthy < tmp1 || lasthy >= tmp2)) && monster ||
      monster && !monster.awake) {
      if (player.SCAREMONST) {
        move_scared(lasthx, lasthy);
      } else
      if (monster.intelligence > min_int) {
        if (smart_count == 0) {
          build_proximity_ripple();
        }
        move_smart(lasthx, lasthy);
      } else {
        move_dumb(lasthx, lasthy);
      }
      lasthx = w1x; /* make sure the monster gets moved again */
      lasthy = w1y;
    }
  }

  noticeplayer();

}



/*
   v12.4.5:
   randomly wake up monsters next to our hero, even in stealth mode
 */
function noticeplayer() {
  var monsters = nearbymonsters();
  for (var i = 0; i < monsters.length ; i++) {
    var monster = monsters[i];
    if (rund(15) < getDifficulty() - 1) { // increase odds starting with diff 2
      if (!monster.awake && rnd(101) < 50) { // want at worst 50/50 odds
        if (player.STEALTH) {
          updateLog(`The ${monster} sees you!`);
        }
        monster.awake = true;
      }
    }
  }
}



const ripple = initGrid(MAXX, MAXY); /* proximity ripple storage */

function QueueEntry(x, y, distance) {
  this.x = x;
  this.y = y;
  this.distance = distance;
}
var queue = [];



// /*
//     For smart monster movement, build a proximity ripple from the player's
//     position, out to a 'distance' of 20.  For example:
//
//     W 5 4 4 W W X    Player is at position marked 1
//     W 5 W 3 3 W W    W is a wall.  Monsters will attempt
//     W 6 W 2 W 4 W    to move to a location with a smaller
//     W 7 W 1 W 5 W    value than their current position.
//     W 8 W W W 6 W    Note that a monster at location X
//     W 9 9 8 7 7 7    will not move at all.
//     W W W 8 W W W
// */
function build_proximity_ripple() {

  var k, m, z, tmpx, tmpy;
  var curx, cury, curdist;

  var xl = 0;
  var yl = 0;
  var xh = MAXX - 1;
  var yh = MAXY - 1;

  for (k = yl; k <= yh; k++)
    for (m = xl; m <= xh; m++) {
      switch (itemAt(m, k).id) {
        case OWALL.id:
        case OELEVATORUP.id:
        case OELEVATORDOWN.id:
        case OPIT.id:
        case OCLOSEDDOOR.id:
        case OTRAPDOOR.id:
        case OTRAPARROW.id:
        case ODARTRAP.id:
        case OTELEPORTER.id:
          ripple[m][k] = 127;
          break;
        case OHOMEENTRANCE.id:
        case OENTRANCE.id:
          if (level == 1)
            ripple[m][k] = 127;
          else
            ripple[m][k] = 0;
          break;
        default:
          ripple[m][k] = 0;
          break;
      };
    }

  /* now perform proximity ripple from player.x,player.y to monster */

  ripple[player.x][player.y] = 1;
  queue.push(new QueueEntry(player.x, player.y, 1));

  mazeMode = true; // THIS IS ACTUALLY FOR DEBUG_PROXIMITY
  if (DEBUG_PROXIMITY) {
    paint();
    mazeMode = false;
  }

  do {
    var q = queue.shift();
    curx = q.x;
    cury = q.y;
    curdist = q.distance;

    /* test all spots around the current one being looked at.
     */
    if ((curx >= xl && curx <= xh) && (cury >= yl && cury <= yh)) {
      for (z = 1; z < 9; z++) {
        tmpx = vx(curx + diroffx[z]);
        tmpy = vy(cury + diroffy[z]);
        if (ripple[tmpx][tmpy] == 0) {
          ripple[tmpx][tmpy] = curdist + 1;
          queue.push(new QueueEntry(tmpx, tmpy, curdist + 1));


          if (DEBUG_PROXIMITY) {
            cursor(tmpx + 1, tmpy + 1);

            if (monsterAt(tmpx, tmpy)) {
              var intel = 10 - getDifficulty();
              if (monsterAt(tmpx, tmpy).intelligence > intel) {
                lprc(`<b>${monsterAt(tmpx, tmpy).getChar()}</b>`);
                //lprc(`<b>${ripple[tmpx][tmpy]%10}</b>`);
              } else {
                lprc(`${monsterAt(tmpx, tmpy).getChar()}`);
              }
            }
            else {
              lprc(ripple[tmpx][tmpy]%10);
            }
          }

        }
      }
    }
  }
  while (queue.length != 0);

  if (DEBUG_PROXIMITY) {
    cursor(player.x + 1, player.y + 1);
    lprc(player.getChar());
    blt();
  }

}



/*
    Move scared monsters randomly away from the player position.
*/
function move_scared(i, j) {
  /* check for a half-speed monster, and check if not to move.  Could be
     done in the monster list build.
  */
  var monster = monsterAt(i, j);
  switch (monster.arg) {
    case TROGLODYTE:
    case HOBGOBLIN:
    case METAMORPH:
    case XVART:
    case STALKER:
    case ICELIZARD:
      if (isHalfTime()) return;
  };

  var xl = vx(i + rnd(3) - 2);
  var yl = vy(j + rnd(3) - 2);

  // // TODO: THIS TOTALLY DOESN'T WORK because scared isn't used for anything

  // var scared = isCarrying(OHANDofFEAR) ? 1 : 0;
  // if (player.SCAREMONST) {
  //   /* hand of fear is scarier if scare monster is in effect. */
  //   scared++;
  // } else if ((scared == 1) && (rnd(10) > 4)) {
  //   /* Hand of fear alone is only effective 60% of the time */
  //   scared = 0;
  // }
  // /* A demon lord or higher is only scared if the player has both
  //  * the hand of fear and scare monster active.
  //  * Even then, only half the time */
  // if ((monster.isDemon()) || (monster.matches(PLATINUMDRAGON))) {
  //   scared = (scared <= 1) ? 0 : (rnd(10) > 5);
  // }

  // console.log(scared);

  var item = itemAt(xl, yl);

  if (!item.matches(OWALL) && !item.matches(OCLOSEDDOOR) && !monsterAt(xl, yl)) {
    if ((!monster.matches(VAMPIRE)) || (!item.matches(OMIRROR))) {
      mmove(i, j, xl, yl);
    }
  }

}



/*
    Move monsters that are moving intelligently, using the proximity
    ripple.  Attempt to move to a position in the proximity ripple
    that is closer to the player.

    Parameters: the X,Y position of the monster to be moved.
*/
function move_smart(i, j) {

  // if (!DEBUG_OUTPUT) {
  //   console.log(`dumb`);
  //   move_dumb(i,j);
  //   return;
  // }

  var x, y, z;

  /* check for a half-speed monster, and check if not to move.  Could be
     done in the monster list build.
  */
  var monster = monsterAt(i, j);

  switch (monster.arg) {
    case TROGLODYTE:
    case HOBGOBLIN:
    case METAMORPH:
    case XVART:
    case STALKER:
    case ICELIZARD:
      if (isHalfTime()) return;
  };

  var didmove = false; // UPGRADE -- smart monster should move inside closed rooms

  /* find an adjoining location in the proximity ripple that is
     closer to the player (has a lower value) than the monster's
     current position.
  */
  if (!monster.matches(VAMPIRE))
    for (z = 1; z < 9; z++) /* go around in a circle */ {
      x = i + diroffx[z];
      y = j + diroffy[z];
      if (ripple[x] && ripple[i] && ripple[x][y] < ripple[i][j])
        if (!monsterAt(x, y)) {
          w1x = x;
          w1y = y;
          didmove = true; // UPGRADE
          mmove(i, j, x, y);
          return;
        }
    } else
    /* prevent vampires from moving onto mirrors
     */
      for (z = 1; z < 9; z++) /* go around in a circle */ {
      x = i + diroffx[z];
      y = j + diroffy[z];
      if ((ripple[x][y] < ripple[i][j]) && !(itemAt(x, y).matches(OMIRROR)))
        if (!monsterAt(x, y)) {
          w1x = x;
          w1y = y;
          didmove = true; // UPGRADE
          mmove(i, j, x, y);
          return;
        }
    }

  // UPGRADE
  // make all monsters move in closed rooms, except demons, who should
  // alway guard the eye / potion
  if (!didmove && !monster.isDemon()) {
    move_dumb(i, j);
  }
}

/*
   For monsters that are not moving in an intelligent fashion.  Move
   in a direct fashion toward the player's current position.

   Parameters: the X,Y position of the monster to move.
*/
function move_dumb(i, j) {

  /* check for a half-speed monster, and check if not to move.  Could be
     done in the monster list build.
  */
  switch (player.level.monsters[i][j].arg) {
    case TROGLODYTE:
    case HOBGOBLIN:
    case METAMORPH:
    case XVART:
    case STALKER:
    case ICELIZARD:
      if (isHalfTime()) return;
  };


  /* dumb monsters move here */
  /* set up range of spots to check.  instead of checking all points
     around the monster, only check those closest to the player.  For
     example, if the player is up and right of the monster, check only
     the three spots up and right of the monster.
  */
  var xl = i - 1;
  var yl = j - 1;
  var xh = i + 2;
  var yh = j + 2;
  if (i < player.x) xl++;
  else if (i > player.x) --xh;
  if (j < player.y) yl++;
  else if (j > player.y) --yh;

  if (xl < 0) xl = 0;
  if (yl < 0) yl = 0;
  if (xh > MAXX) xh = MAXX; /* MAXX OK; loop check below is <, not <= */
  if (yh > MAXY) yh = MAXY; /* MAXY OK; loop check below is <, not <= */

  /* check all spots in the range.  find the one that is closest to
     the player.  if the monster is already next to the player, exit
     the check immediately.
  */
  var tmpd = 10000;
  var tmpx = i;
  var tmpy = j;
  for (var k = xl; k < xh; k++) {
    for (var m = yl; m < yh; m++) {
      if (k == player.x && m == player.y) {
        tmpd = 1;
        tmpx = k;
        tmpy = m;
        break; /* exitloop */
      } //
      else {
        var item = itemAt(k, m);
        //if (k < 0 || k >= MAXX || m < 0 || m >= MAXY) continue; // JRP fix for edge of home level
        if (!item.matches(OWALL) && //
          !item.matches(OCLOSEDDOOR) && //
          (!player.level.monsters[k][m] || (k == i) && (m == j)) &&
          (!player.level.monsters[i][j].matches(VAMPIRE) || !item.matches(OMIRROR))
        ) {
          var tmp = (player.x - k) * (player.x - k) + (player.y - m) * (player.y - m);
          if (tmp < tmpd) {
            tmpd = tmp;
            tmpx = k;
            tmpy = m;
          } /* end if */
        }
      } /* end if */
    }
  }

  /* we have finished checking the spaces around the monster.  if
     any can be moved on and are closer to the player than the
     current location, move the monster.
  */
  if ((tmpd < 10000) && ((tmpx != i) || (tmpy != j))) {
    mmove(i, j, tmpx, tmpy);
    w1x = tmpx; /* for last monster hit */
    w1y = tmpy;
  } else {
    w1x = i; /* for last monster hit */
    w1y = j;
  }
} /* end move_dumb() */



/*
 *  mmove(x,y,xd,yd)    Function to actually perform the monster movement
 *      int x,y,xd,yd;
 *
 *  Enter with the from coordinates in (x,y) and the destination coordinates
 *  in (xd,yd).
 */
function mmove(aa, bb, cc, dd) {
  if ((cc == player.x) && (dd == player.y)) {
    hitplayer(aa, bb);
    return;
  }

  var item = itemAt(cc, dd);
  var monster = player.level.monsters[aa][bb];

  player.level.monsters[cc][dd] = monster;

  if (item.matches(OPIT) || item.matches(OTRAPDOOR)) {
    switch (monster.arg) {
      case BAT:
      case LEMMING:
      case EYE:
      case SPIRITNAGA:
      case PLATINUMDRAGON:
      case WRAITH:
      case VAMPIRE:
      case SILVERDRAGON:
      case POLTERGEIST:
      case DEMONLORD:
      case DEMONLORD + 1:
      case DEMONLORD + 2:
      case DEMONLORD + 3:
      case DEMONLORD + 4:
      case DEMONLORD + 5:
      case DEMONLORD + 6:
      case DEMONPRINCE:
      case LUCIFER:
          if (!(ULARN && monster.arg == LEMMING)) // lemmings fall, bats don't
          break;

      default:
        player.level.monsters[cc][dd] = null; /* fell in a pit or trapdoor */
    };
  }

  if (item.matches(OANNIHILATION)) {
    if (monster.isDemon()) /* demons dispel spheres */ {
      cursors();
      updateLog(`The ${monster} dispels the sphere!`);
      rmsphere(cc, dd); /* delete the sphere */
    } else {
      player.level.monsters[cc][dd] = null;
      setItem(cc, dd, OEMPTY);
    }
  }

  monster.awake = true;
  player.level.monsters[aa][bb] = null;

  if (ULARN && monster.matches(LEMMING)) {
    /* 2% chance moving a lemming creates a new lemming in the old spot */
    if (rnd(100) <= 2) {
      player.level.monsters[aa][bb] = createMonster(LEMMING);
    }
  }

  if (monster.matches(LEPRECHAUN) && (item.matches(OGOLDPILE) || item.isGem())) {
    player.level.items[cc][dd] = OEMPTY; /* leprechaun takes gold */
  }

  if (monster.matches(TROLL)) { /* if a troll regenerate him */
    if (isHalfTime())
      if (monsterlist[monster.arg].hitpoints > monster.hitpoints) monster.hitpoints++;
  }

  var what;
  var flag = 0; /* set to 1 if monster hit by arrow trap */
  if (item.matches(OTRAPARROW)) /* arrow hits monster */ {
    what = `An arrow`;
    if ((monster.hitpoints -= rnd(10) + level) <= 0) {
      player.level.monsters[cc][dd] = null;
      flag = 2;
    } else flag = 1;
  }
  if (item.matches(ODARTRAP)) /* dart hits monster */ {
    what = `A dart`;
    if ((monster.hitpoints -= rnd(6)) <= 0) {
      player.level.monsters[cc][dd] = null;
      flag = 2;
    } else flag = 1;
  }
  if (!monster.isDemon()) {  
    if (item.matches(OTELEPORTER)) /* monster hits teleport trap */ {
      flag = 3;
      fillmonst(monster.arg);
      player.level.monsters[cc][dd] = null;
    }
    if (item.matches(OELEVATORDOWN) || item.matches(OELEVATORUP)) {
      flag = 4;
      player.level.monsters[cc][dd] = null;
    }
  }  
  
  if (player.BLINDCOUNT) return; /* if blind don't show where monsters are   */

  if (player.level.know[cc][dd] & HAVESEEN) {
    if (flag) {
      cursors();
      beep();
    }
    switch (flag) {
      case 1:
        updateLog(`${what} hits the ${monster}`);
        break;
      case 2:
        updateLog(`${what} hits and kills the ${monster}`);
        break;
      case 3:
        updateLog(`The ${monster} gets teleported`);
        break;
      case 4:
        updateLog(`The ${monster} is carried away by an elevator!`);
        break;
      };
  }

  if (player.level.know[aa][bb] & HAVESEEN) show1cell(aa, bb);
  if (player.level.know[cc][dd] & HAVESEEN) show1cell(cc, dd);

}



/*
 v12.4.5 - fix for half speed monsters following at 1:1 or not at all when running
 */
function isHalfTime() {
  // TODO: IS THIS THE PLACE TO FIX 1/2 SPEED MONSTERS NOT WORKING WITH HASTE?
  return (player.MOVESMADE & 1) == 1;
}
