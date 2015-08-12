"use strict";

/* list of monsters to move */
var movelist = [];
var MonsterLocation = {
  x: 0,
  y: 0,
  smart: false,
}

var w1x = [];
var w1y = [];

/*
 *  movemonst()     Routine to move the monsters toward the player
 *
 *  This routine has the responsibility to determine which monsters are to
 *  move, and call movemt() to do the move.
 *  Returns no value.
 */
function movemonst() {
  if (player.HOLDMONST) return; /* no action if monsters are held */

  var tmp1, tmp2, tmp3, tmp4;

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

  if (player.level.depth == 0) /* if on outside level monsters can move in perimeter */ {
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
  let smart_count = 0;
  let movecnt = 0;
  let min_int = 10 - player.HARDGAME; /* minimum monster intelligence to move smart */
  if (player.AGGRAVATE || player.STEALTH == 0) {
    for (let j = tmp1; j < tmp2; j++) {
      for (let i = tmp3; i < tmp4; i++) {
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
    for (let j = tmp1; j < tmp2; j++) {
      for (let i = tmp3; i < tmp4; i++) {
        var monster = monsterAt(i, j);
        if (monster && monster.awake) {
          var current = Object.create(MonsterLocation);
          current.x = i;
          current.y = j;
          if (monster.intelligence > min_int) {
            current.smart = true;
            smart_count++;
          } else
            current.smart = true;

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
      for (let i = 0; i < movecnt; i++)
        move_scared(movelist[i].x, movelist[i].y);
    else {
      if (smart_count > 0) {
        /* I was going to put in code that prevented the rebuilding
           of the proximity ripple if the player had not moved since
           the last turn.  Unfortunately, this permits the player to
           blast down doors to treasure rooms and not have a single
           intelligent monster move.
        */
        build_proximity_ripple(tmp1, tmp2, tmp3, tmp4);
        for (let i = 0; i < movecnt; i++)
          if (movelist[i].smart)
            move_smart(movelist[i].x, movelist[i].y);
          else
            move_dumb(movelist[i].x, movelist[i].y);
      } else
        for (let i = 0; i < movecnt; i++)
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
          build_proximity_ripple(tmp1, tmp2, tmp3, tmp4);
        move_smart(lasthx, lasthy);
      } else
        move_dumb(lasthx, lasthy);
      lasthx = w1x[0]; /* make sure the monster gets moved again */
      lasthy = w1y[0];
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
          build_proximity_ripple(tmp1, tmp2, tmp3, tmp4);
        }
        move_smart(lasthx, lasthy);
      } else {
        move_dumb(lasthx, lasthy);
      }
      lasthx = w1x[0]; /* make sure the monster gets moved again */
      lasthy = w1y[0];
    }
  }
}

var screen = initGrid(MAXX, MAXY); /* proximity ripple storage */

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
function build_proximity_ripple(tmp1, tmp2, tmp3, tmp4) {

  var k, m, z, tmpx, tmpy;
  var curx, cury, curdist;

  var xl = vx(tmp3 - 2);
  var yl = vy(tmp1 - 2);
  var xh = vx(tmp4 + 2);
  var yh = vy(tmp2 + 2);

  // debug(`xy1 ${xl}, ${yl}, ${xh}, ${yh}`);

  for (k = yl; k <= yh; k++)
    for (m = xl; m <= xh; m++) {
      switch (getItem(m, k).id) {
        case OWALL.id:
        case OPIT.id:
        case OCLOSEDDOOR.id:
        case OTRAPDOOR.id:
          // case OTRAPARROW.id: TODO
          // case ODARTRAP.id: TODO
          // case OTELEPORTER.id: TODO
          screen[m][k] = 127;
          break;
        case OHOMEENTRANCE.id:
        case OENTRANCE.id:
          if (player.level.depth == 1)
            screen[m][k] = 127;
          else
            screen[m][k] = 0;
          break;
        default:
          screen[m][k] = 0;
          break;
      };
    }

  /* now perform proximity ripple from player.x,player.y to monster */
  xl = vx(tmp3 - 1);
  yl = vy(tmp1 - 1);
  xh = vx(tmp4 + 1);
  yh = vy(tmp2 + 1);

  //debug(`xy2 ${xl}, ${yl}, ${xh}, ${yh}`);

  screen[player.x][player.y] = 1;
  queue.push(new QueueEntry(player.x, player.y, 1));

  IN_STORE = false; // TODO ACTUALLY PART OF DEBUG_PROXIMITY
  if (DEBUG_PROXIMITY) {
    paint();
    IN_STORE = true;
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
        if (screen[tmpx][tmpy] == 0) {
          screen[tmpx][tmpy] = curdist + 1;
          queue.push(new QueueEntry(tmpx, tmpy, curdist + 1));


          if (DEBUG_PROXIMITY) {
            cursor(tmpx + 1, tmpy + 1);
            if (screen[tmpx][tmpy] < 10) {
              var intel = 10 - player.HARDGAME;
              if (monsterAt(tmpx, tmpy)) {
                if (monsterAt(tmpx, tmpy).intelligence > intel) {
                  lprc(`<b>${monsterAt(tmpx, tmpy).char}</b>`);
                } else {
                  lprc(`${monsterAt(tmpx, tmpy).char}`);
                }
              } else {
                lprc(screen[tmpx][tmpy]);
              }
            } else {
              lprc(`<b>${(screen[tmpx][tmpy])%10}</b>`);
            }
          }


        }
      }
    }
  }
  while (queue.length != 0);

  if (DEBUG_PROXIMITY) {
    cursor(player.x + 1, player.y + 1);
    lprc(player.char);
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
    case INVISIBLESTALKER:
    case ICELIZARD:
      if ((gtime & 1) == 1) return;
  };

  var xl = vx(i + rnd(3) - 2);
  var yl = vy(j + rnd(3) - 2);

  var item = getItem(xl, yl);

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
    case INVISIBLESTALKER:
    case ICELIZARD:
      if ((gtime & 1) == 1) return;
  };

  /* find an adjoining location in the proximity ripple that is
     closer to the player (has a lower value) than the monster's
     current position.
  */
  if (!monster.matches(VAMPIRE))
    for (z = 1; z < 9; z++) /* go around in a circle */ {
      x = i + diroffx[z];
      y = j + diroffy[z];
      if (screen[x][y] < screen[i][j])
        if (monsterAt(x, y) == null) {
          w1x[0] = x;
          w1y[0] = y;
          mmove(i, j, x, y);
          return;
        }
    } else
    /* prevent vampires from moving onto mirrors
     */
      for (z = 1; z < 9; z++) /* go around in a circle */ {
      x = i + diroffx[z];
      y = j + diroffy[z];
      if ((screen[x][y] < screen[i][j]) && !(getItem(x, y).matches(OMIRROR)))
        if (monsterAt(x, y) == null) {
          w1x[0] = x;
          w1y[0] = y;
          mmove(i, j, x, y);
          return;
        }
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
    case INVISIBLESTALKER:
    case ICELIZARD:
      if ((gtime & 1) == 1) return;
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
        var item = getItem(k, m);
        //if (k < 0 || k >= MAXX || m < 0 || m >= MAXY) continue; // JRP fix for edge of home level
        if (!item.matches(OWALL) && //
          !item.matches(OCLOSEDDOOR) && //
          (player.level.monsters[k][m] == null || (k == i) && (m == j)) &&
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
    w1x[0] = tmpx; /* for last monster hit */
    w1y[0] = tmpy;
  } else {
    w1x[0] = i; /* for last monster hit */
    w1y[0] = j;
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

  var item = getItem(cc, dd);

  var tmp = player.level.monsters[aa][bb];
  player.level.monsters[cc][dd] = tmp;

  if (item.matches(OPIT) || item.matches(OTRAPDOOR)) {
    switch (tmp.arg) {
      case BAT:
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
        break;

      default:
        player.level.monsters[cc][dd] = null; /* fell in a pit or trapdoor */
    };
  }

  // TODO
  // TODO
  // if (i==OANNIHILATION)
  //     {
  //     if (tmp>=DEMONLORD+3) /* demons dispel spheres */
  //         {
  //         cursors();
  //         lprintf("\nThe %s dispels the sphere!",monster[tmp].name);
  //         rmsphere(cc,dd);    /* delete the sphere */
  //         }
  //     else mitem[cc][dd]=i=tmp=0;
  //     }
  // TODO
  // TODO

  tmp.awake = true;
  //if ((hitp[cc][dd] = hitp[aa][bb]) < 0) hitp[cc][dd]=1; // TODO: do we need this?
  player.level.monsters[aa][bb] = null;


  if (tmp.matches(LEPRECHAUN) && (item.matches(OGOLDPILE) || item.isGem())) {
    player.level.items[cc][dd] = createObject(OEMPTY); /* leprechaun takes gold */
  }

  if (tmp.matches(TROLL)) { /* if a troll regenerate him */
    if ((gtime & 1) == 0)
      if (monsterlist[tmp.arg].hitpoints > tmp.hitpoints) tmp.hitpoints++;
  }

  // TODO
  // var flag = 0; /* set to 1 if monster hit by arrow trap */
  //     if (i==OTRAPARROW)  /* arrow hits monster */
  //         { who = "An arrow";  if ((hitp[cc][dd] -= rnd(10)+level) <= 0)
  //             { mitem[cc][dd]=0;  flag=2; } else flag=1; }
  //     if (i==ODARTRAP)    /* dart hits monster */
  //         { who = "A dart";  if ((hitp[cc][dd] -= rnd(6)) <= 0)
  //             { mitem[cc][dd]=0;  flag=2; } else flag=1; }
  //     if (i==OTELEPORTER) /* monster hits teleport trap */
  //         { flag=3; fillmonst(mitem[cc][dd]);  mitem[cc][dd]=0; }
  //     if (c[BLINDCOUNT]) return;  /* if blind don't show where monsters are   */

  // TODO
  // if (player.level.know[cc][dd] & HAVESEEN) {
  //   p = 0;
  //   if (flag) cursors();
  //   switch (flag) {
  //     case 1:
  //       p = "\n%s hits the %s";
  //       break;
  //     case 2:
  //       p = "\n%s hits and kills the %s";
  //       break;
  //     case 3:
  //       p = "\nThe %s%s gets teleported";
  //       who = "";
  //       break;
  //   };
  //   if (p) {
  //     lprintf(p, who, monster[tmp].name);
  //     beep();
  //   }
  // }

  if (player.level.know[aa][bb] & HAVESEEN) show1cell(aa, bb);
  if (player.level.know[cc][dd] & HAVESEEN) show1cell(cc, dd);

}
