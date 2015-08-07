"use strict";

const IDISTNORM = 8; /* was 17 - dgk */ // TODO: WHAT SHOULD THIS BE?
const IDISTAGGR = 20; /* was 40 - dgk */

/* list of monsters to move */
var foo = {
  x: 0,
  y: 0,
  smart: false,
}

var movelist = [];
let w1x = [];
let w1y = [];

/*
 *  movemonst()     Routine to move the monsters toward the player
 *
 *  This routine has the responsibility to determine which monsters are to
 *  move, and call movemt() to do the move.
 *  Returns no value.
 */
function movemonst() {

  //debug("movemonst()");

  let tmp1, tmp2, tmp3, tmp4, distance;

  if (player.HOLDMONST > 0) return; /* no action if monsters are held */

  if (player.AGGRAVATE > 0) /* determine window of monsters to move */ {
    tmp1 = player.y - 5;
    tmp2 = player.y + 6;
    tmp3 = player.x - 10;
    tmp4 = player.x + 11;
    distance = IDISTAGGR; /* depth of intelligent monster movement */
  } else {
    tmp1 = player.y - 3;
    tmp2 = player.y + 4;
    tmp3 = player.x - 5;
    tmp4 = player.x + 6;
    distance = IDISTNORM; /* depth of intelligent monster movement */
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
  if (player.AGGRAVATE > 0 || player.STEALTH == 0) {
    for (let j = tmp1; j < tmp2; j++)
      for (let i = tmp3; i < tmp4; i++)
        if (player.level.monsters[i][j] != null) {
          let zzz = Object.create(foo);
          zzz.x = i;
          zzz.y = j;
          if (player.level.monsters[i][j].intelligence > min_int) {
            zzz.smart = true;
            smart_count++;
          } else
            zzz.smart = false;

          movelist[movecnt] = zzz;
          movecnt++;
        }
  } else {
    for (let j = tmp1; j < tmp2; j++)
      for (let i = tmp3; i < tmp4; i++) {
        if (player.level.monsters[i][j] != null && player.level.monsters[i][j].awake) {
          let zzz = Object.create(foo);
          zzz.x = i;
          zzz.y = j;
          if (player.level.monsters[i][j].intelligence > min_int) {
            zzz.smart = true;
            smart_count++;
          } else
            zzz.smart = true;

          movelist[movecnt] = zzz;
          movecnt++;
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
        build_proximity_ripple();
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
  if (player.AGGRAVATE > 0 || player.STEALTH == 0) { // TODO CORRECT?
//    if (player.AGGRAVATE > 0 || player.STEALTH > 0) {
    /* If the last monster hit is within the move window, its already
       been moved.
    */
    if (((lasthx < tmp3 || lasthx >= tmp4) ||
        (lasthy < tmp1 || lasthy >= tmp2)) &&
      player.level.monsters[lasthx][lasthy] != null) {
      if (player.SCAREMONST > 0)
        move_scared(lasthx, lasthy);
      else
      if (player.level.monsters[lasthx][lasthy].intelligence > min_int) {
        if (smart_count == 0)
          build_proximity_ripple();
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
        if (((lasthx < tmp3 || lasthx >= tmp4) ||
            (lasthy < tmp1 || lasthy >= tmp2)) &&
      player.level.monsters[lasthx][lasthy] != null ||
      player.level.monsters[lasthx][lasthy] && !player.level.monsters[lasthx][lasthy].awake) { // TODO CORRECT?
      //player.level.monsters[lasthx][lasthy] && player.level.monsters[lasthx][lasthy].awake) { // TODO     lines is buggy
      if (player.SCAREMONST > 0) {
        move_scared(lasthx, lasthy);
      } else
      if (player.level.monsters[lasthx][lasthy].intelligence > min_int) {
        if (smart_count == 0) {
          build_proximity_ripple();
        }
        move_smart(lasthx, lasthy);
      } else {
        // TODO: THERE IS A BUG HERE WITH DOUBLE MONSTER MOVEMENT AFTER THEY HAVE BEEN HIT
        move_dumb(lasthx, lasthy);
        // TODO: THERE IS A BUG HERE WITH DOUBLE MONSTER MOVEMENT AFTER THEY HAVE BEEN HIT
      }
      lasthx = w1x[0]; /* make sure the monster gets moved again */
      lasthy = w1y[0];
    }
  }
}

// static char screen[MAXX][MAXY];    /* proximity ripple storage */

// /* queue for breadth-first 'search' build of proximity ripple.
// */
// const MAX_QUEUE 100
// static struct queue_entry
//         {
//         char x ;
//         char y ;
//         char distance ;
//         } queue[MAX_QUEUE];
// static int queue_head = 0 ;
// static int queue_tail = 0 ;

// /* put a location on the proximity ripple queue
// */
// #define PUTQUEUE( _x, _y, _d )          \
//     {                                   \
//     queue[queue_tail].x = (_x) ;        \
//     queue[queue_tail].y = (_y) ;        \
//     queue[queue_tail].distance = (_d);  \
//     queue_tail++;                       \
//     if (queue_tail == MAX_QUEUE)        \
//         queue_tail = 0 ;                \
//     }

// /* take a location from the proximity ripple queue
// */
// #define GETQUEUE( _x, _y, _d )          \
//     {                                   \
//     (_x) = queue[queue_head].x ;        \
//     (_y) = queue[queue_head].y ;        \
//     (_d) = queue[queue_head].distance ; \
//     queue_head++;                       \
//     if (queue_head == MAX_QUEUE)        \
//         queue_head = 0 ;                \
//     }

// /* check for the proximity ripple queue being empty
// */
// #define QUEUEEMPTY() (queue_head == queue_tail)

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
  // TODO!
}
//     int xl, yl, xh, yh ;
//     int k, m, z, tmpx, tmpy;
//     int curx, cury, curdist;
//
//     xl=tmp3-2; yl=tmp1-2; xh=tmp4+2;  yh=tmp2+2;
//     vxy(&xl,&yl);  vxy(&xh,&yh);
//     for (k=yl; k<=yh; k++)
//     for (m=xl; m<=xh; m++)
//         {
//         switch(item[m][k])
//         {
//         case OWALL:
//         case OPIT:
//         case OTRAPARROW:
//         case ODARTRAP:
//         case OCLOSEDDOOR:
//         case OTRAPDOOR:
//         case OTELEPORTER:
//             screen[m][k]=127;
//             break;
//         case OENTRANCE:
//             if (level==1)
//                 screen[m][k] = 127;
//             else
//                 screen[m][k] = 0;
//             break;
//         default:
//             screen[m][k] = 0;
//             break;
//         };
//           }
//       screen[player.x][player.y]=1;
//
// /* now perform proximity ripple from player.x,player.y to monster */
//       xl=tmp3-1; yl=tmp1-1; xh=tmp4+1;  yh=tmp2+1;
//       vxy(&xl,&yl);  vxy(&xh,&yh);
//
//       PUTQUEUE( player.x, player.y, 1 );
//       do
//       {
//       GETQUEUE( curx, cury, curdist );
//
//       /* test all spots around the current one being looked at.
//       */
//       if ( ( curx >= xl && curx < xh ) &&
//            ( cury >= yl && cury < yh ) )
//           {
//           for (z=1; z<9; z++)
//           {
//           tmpx = curx + diroffx[z] ;
//           tmpy = cury + diroffy[z] ;
//           if (screen[tmpx][tmpy] == 0 )
//               {
//               screen[tmpx][tmpy] = curdist + 1;
//               PUTQUEUE( tmpx, tmpy, curdist + 1 );
//               }
//           }
//           }
//       }
//       while (!QUEUEEMPTY());
//
//     }

// /*
//     Move scared monsters randomly away from the player position.
// */
function move_scared(i, j) {
  move_dumb(i, j);
}
// int i, j ;
//     {
//     int xl, yl, tmp, tmpitem ;
//
//     /* check for a half-speed monster, and check if not to move.  Could be
//        done in the monster list build.
//     */
//     switch(mitem[i][j])
//         {
//         case TROGLODYTE:  case HOBGOBLIN:  case METAMORPH:  case XVART:
//         case INVISIBLESTALKER:  case ICELIZARD: if ((gtime & 1) == 1) return;
//         };
//
//     if ((xl = i+rnd(3)-2) < 0)
//     xl=0;
//     if (xl >= MAXX)
//     xl=MAXX-1;
//     if ((yl = j+rnd(3)-2) < 0)
//     yl=0;
//     if (yl >= MAXY)
//     yl=MAXY-1;
//
//     if ((tmp=item[xl][yl]) != OWALL)
//     if (mitem[xl][yl] == 0)
//         if ((mitem[i][j] != VAMPIRE) || (tmp != OMIRROR))
//         if (tmp != OCLOSEDDOOR)
//             mmove(i,j,xl,yl);
//     }

// /*
//     Move monsters that are moving intelligently, using the proximity
//     ripple.  Attempt to move to a position in the proximity ripple
//     that is closer to the player.
//
//     Parameters: the X,Y position of the monster to be moved.
// */
function move_smart(i, j) {
  move_dumb(i, j);
}
// int i,j ;
//     {
//     int x,y,z ;
//
//     /* check for a half-speed monster, and check if not to move.  Could be
//        done in the monster list build.
//     */
//     switch(mitem[i][j])
//         {
//         case TROGLODYTE:  case HOBGOBLIN:  case METAMORPH:  case XVART:
//         case INVISIBLESTALKER:  case ICELIZARD: if ((gtime & 1) == 1) return;
//         };
//
//     /* find an adjoining location in the proximity ripple that is
//        closer to the player (has a lower value) than the monster's
//        current position.
//     */
//     if (mitem[i][j] != VAMPIRE)
//     for (z=1; z<9; z++) /* go around in a circle */
//         {
//         x = i + diroffx[z] ;
//         y = j + diroffy[z] ;
//         if ( screen[x][y] < screen[i][j] )
//         if ( !mitem[x][y] )
//             {
//             mmove(i,j,w1x[0]=x,w1y[0]=y);
//             return;
//             }
//         }
//     else
//     /* prevent vampires from moving onto mirrors
//     */
//     for (z=1; z<9; z++) /* go around in a circle */
//         {
//         x = i + diroffx[z] ;
//         y = j + diroffy[z] ;
//         if (( screen[x][y] < screen[i][j] ) &&
//         ( item[x][y] != OMIRROR ))
//         if ( !mitem[x][y] )
//             {
//             mmove(i,j,w1x[0]=x,w1y[0]=y);
//             return;
//             }
//         }
//
//     }

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
        if (k < 0 || k >= MAXX || m < 0 || m >= MAXY) continue; // JRP fix for edge of home level
        if (!player.level.items[k][m].matches(OWALL) && //
          !player.level.items[k][m].matches(OCLOSEDDOOR) && //
          (player.level.monsters[k][m] == null || (k == i) && (m == j)) &&
          (!player.level.monsters[i][j].matches(VAMPIRE) || !player.level.items[k][m].matches(OMIRROR))
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

  if (item.matches(OPIT) || item.matches(OTRAPDOOR))
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


  // TODO
  // if (tmp == TROLL)  /* if a troll regenerate him */
  //     if ((gtime & 1) == 0)
  //         if (monster[tmp].hitpoints > hitp[cc][dd])  hitp[cc][dd]++;
  // TODO

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
