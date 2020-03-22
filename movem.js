'use strict';

let movedx = -1;
let movedy = -1;
let distance = -1;
let move_yl = -1;
let move_yh = -1;
let move_xl = -1;
let move_xh = -1;

/* =============================================================================
 * FUNCTION: movemonst
 */
function movemonst() {

  /* no action if time is stopped */
  if (player.TIMESTOP) return;

  // ULARN TODO? all done in main.js
  // /* Check for haste self */
  // if (player.HASTESELF)
  //   if ((player.HASTESELF & 1) == 0) return;
  // /* move the spheres of annihilation if any */
  // movsphere();

  /* no action if monsters are held */
  if (player.HOLDMONST) return;

  if (player.AGGRAVATE) {
    /* determine window of monsters to move */
    move_yl = player.y - 5;
    move_yh = player.y + 6;
    move_xl = player.x - 10;
    move_xh = player.x + 11;
    distance = 40; /* depth of intelligent monster movement */
  } else {
    move_yl = player.y - 3;
    move_yh = player.y + 4;
    move_xl = player.x - 5;
    move_xh = player.x + 6;
    distance = 17; /* depth of intelligent monster movement */
  }

  if (level == 0) {
    /* if on outside level monsters can move in perimeter */
    if (move_yl < 0) move_yl = 0;
    if (move_yh > MAXY) move_yh = MAXY;
    if (move_xl < 0) move_xl = 0;
    if (move_xh > MAXX) move_xh = MAXX;
  } else {
    /* if in a dungeon monsters can't be on the perimeter (wall there) */
    if (move_yl < 1) move_yl = 1;
    if (move_yh > MAXY - 1) move_yh = MAXY - 1;
    if (move_xl < 1) move_xl = 1;
    if (move_xh > MAXX - 1) move_xh = MAXX - 1;
  }

  /* now reset monster moved flags */
  for (let j = move_yl; j < move_yh; j++) {
    for (let i = move_xl; i < move_xh; i++) {
      let tmpMonst = monsterAt(i, j);
      if (tmpMonst) tmpMonst.moved = false;
    }
  }

  /*
   * Move the last monster hit by the player
   * This is mainly to make monster hit by spells move towards the player,
   * even if out of the normal movement range.
   * If the last monster hit by the player no longer exists then
   * last_monst_hx and last_monst_hy will be out of the map range
   * (actually set to -1).
   */
  if ((lasthx >= 0) && (lasthx < MAXX) && (lasthy >= 0) && (lasthy < MAXY)) {
    let last_monst = monsterAt(lasthx, lasthy);
    if (last_monst) {
      last_monst.moved = false;
      movemt(lasthx, lasthy);
      lasthx = movedx;
      lasthy = movedy;
    }
  }

  // ULARN TODO / LARN UPGRADE -> do this in a spiral out from the player 
  for (let j = move_yl; j < move_yh; j++) {
    for (let i = move_xl; i < move_xh; i++) {
      let monster = monsterAt(i, j);
      if (monster && !monster.moved) {
        /* if there is a monster to move and it isn't already moved */
        if (player.AGGRAVATE || !player.STEALTH || monster.awake) {
          movemt(i, j);
        }
      }
    }
  }

  /*
   v12.4.5:
   randomly wake up monsters next to our hero, even in stealth mode
 */
  noticeplayer();

}



/* =============================================================================
 * FUNCTION: movemt
 *
 * DESCRIPTION:
 * This routine is responsible for determining where one monster at (x,y)
 * will move to.
 *
 * PARAMETERS:
 *
 *   x : The x coordinate of the monster.
 *
 *   y : The y coordinate of the monster.
 *
 * RETURN VALUE:
 *
 *   None.
 */
function movemt(x, y) {
  let monster = monsterAt(x, y);
  if (!monster) {
    console.log(`movemt(): no monster at ${x},${y}`);
    return;
  }

  /* half speed monsters only move every other turn */
  if (monster.isSlow() && isHalfTime()) {
    return;
  }

  /* choose destination randomly if scared */

  /* Check for hand of fear */
  let scared = isCarrying(OHANDofFEAR) ? 1 : 0;
  if (player.SCAREMONST) {
    /*
     * hand of fear is scarier (may work on higher level monsters) if scare
     * monster is in effect.
     */
    scared++;
  } else if ((scared == 1) && (rnd(10) > 4)) {
    /*
     * Hand of fear alone is only effective 60% of the time
     */
    scared = 0;
  }
  if ((monster.isDemon()) || (monster.matches(PLATINUMDRAGON))) {
    /*
     * A demon lord or higher is only scared if the player has both
     * the hand of fear and scare monster active.
     * Even then, only half the time
     */
    scared = (scared <= 1) ? 0 : (rnd(10) > 5);
  }

  /* Call the appropriate move routine */
  if (scared) {
    scared_move(x, y);
  } else if (monster.intelligence > 10 - getDifficulty()) {
    smart_move(x, y);
  } else {
    dumb_move(x, y);
  }
}



/* =============================================================================
 * FUNCTION: dumb_move
 *
 * DESCRIPTION:
 * Function to move dumb monsters.
 *
 * PARAMETERS:
 *
 *   x : The x coordinate of the monster.
 *
 *   y : The y coordinate of the monster.
 *
 * RETURN VALUE:
 *
 *   None.
 */
function dumb_move(x, y) {
  let monster = monsterAt(x, y);
  if (!monster) {
    console.log(`dumb_move(): no monster at ${x},${y}`);
    return;
  }

  let w1 = [];
  let w1x = [];
  let w1y = [];

  let xl = x - 1;
  let yl = y - 1;
  let xh = x + 2;
  let yh = y + 2;

  if (x < player.x)
    xl++;
  else if (x > player.x)
    xh--;

  if (y < player.y)
    yl++;
  else if (y > player.y)
    yh--;

  if (xl < 0) xl = 0;
  if (xh > MAXX) xh = MAXX;
  if (yl < 0) yl = 0;
  if (yh > MAXY) yh = MAXY;

  for (let k = 0; k < 9; k++)
    w1[k] = 10000;

  /* For each square compute distance to player */

  let tmp = 0;
  for (let tx = xl; tx < xh; tx++) {
    for (let ty = yl; ty < yh; ty++) {
      if (valid_monst_move(tx, ty, monster) && !monsterAt(tx, ty)) {
        w1[tmp] = ((player.x - tx) * (player.x - tx) + (player.y - ty) * (player.y - ty));
        w1x[tmp] = tx;
        w1y[tmp] = ty;
      }
      tmp++;
    }
  }

  /* find the closest square in the search area */
  let j = 0;
  for (let k = 1; k < 9; k++) {
    if (w1[k] < w1[j]) {
      j = k;
    }
  }

  if ((w1[j] < 10000) && ((x != w1x[j]) || (y != w1y[j]))) {
    mmove(x, y, w1x[j], w1y[j]);
  }
}



/* =============================================================================
 * FUNCTION: scared_move
 *
 * DESCRIPTION:
 * Function to move scared monsters.
 *
 * PARAMETERS:
 *
 *   x : The x coordinate of the monster.
 *
 *   y : The y coordinate of the monster.
 *
 * RETURN VALUE:
 *
 *   None.
 */
function scared_move(x, y) {
  let monster = monsterAt(x, y);
  if (!monster) {
    console.log(`scared_move(): no monster at ${x},${y}`);
    return;
  }

  /* move in random direction */
  let nx = x + rnd(3) - 2;
  let ny = y + rnd(3) - 2;

  if (nx < 0) nx = 0;
  if (nx >= MAXX) nx = MAXX - 1;
  if (ny < 0) ny = 0;
  if (ny >= MAXY) ny = MAXY - 1;

  if (valid_monst_move(nx, ny, monster) && !monsterAt(nx, ny)) {
    /* This is a valid place to move, so move there */
    mmove(x, y, nx, ny);
  }
}



/* for smart monster movement */
let screen = initGrid(MAXX, MAXY);

/* =============================================================================
 * FUNCTION: smart_move
 *
 * DESCRIPTION:
 * Function to move smart monsters.
 *
 * PARAMETERS:
 *
 *   x : The x coordinate of the monster.
 *
 *   y : The y coordinate of the monster.
 *
 * RETURN VALUE:
 *
 *   None.
 */
function smart_move(x, y) {
  let monster = monsterAt(x, y);
  if (!monster) {
    console.log(`smart_move(): no monster at ${x},${y}`);
    return;
  }

  if (DEBUG_PROXIMITY) {
    screen = initGrid(MAXX, MAXY);
  }

  /* get the screen region to check for monster movement */
  let xl = vx(move_xl - 2);
  let yl = vy(move_yl - 2);
  let xh = vx(move_xh + 2);
  let yh = vy(move_yh + 2);

  for (let sy = yl; sy <= yh; sy++) {
    for (let sx = xl; sx <= xh; sx++) {
      if (valid_monst_move(sx, sy, monster)) {
        if (monster.matches(DEMONPRINCE) || monster.matches(LUCIFER)) {
          /* Monsters of rank DEMONPRINCE and above ignore traps etc */
          screen[sx][sy] = 0;
        } else {
          /* smart monsters will avoid traps */
          let item = itemAt(sx, sy);
          switch (item.id) {
            case OELEVATORUP.id:
            case OELEVATORDOWN.id:
            case OTRAPARROW.id:
            case ODARTRAP.id:
            case OTELEPORTER.id:
              /* all monsters avoid these traps */
              screen[sx][sy] = 127;
              break;

            case OPIT.id:
            case OTRAPDOOR.id:
              if (monster.canFly()) {
                /* flying monsters ignore pits and trap doors. */
                screen[sx][sy] = 0;
              } else {
                screen[sx][sy] = 127;
              }
              break;

            default:
              screen[sx][sy] = 0;
              break;
          }
        }
      } else {
        /* not valid for this monster to move here */
        screen[sx][sy] = 127;
      } /* if valid move */
    } /* for sx */
  } /* for sy */

  /* Mark the player's location */
  screen[player.x][player.y] = 1;

  /* now perform proximity ripple from player.x, player.y to monster */
  xl = vx(move_xl - 1);
  yl = vy(move_yl - 1);
  xh = vx(move_xh + 1);
  yh = vy(move_yh + 1);

  let path_dist = 1;
  let found_path = 0;

  while ((path_dist < distance) && (!found_path)) {
    for (let sy = yl; sy <= yh; sy++) {
      for (let sx = xl; sx <= xh; sx++) {

        if (screen[sx][sy] == path_dist) {
          /*
           * This square is path_dist steps from the player, so advance
           * the path by one in all directions not already part of a path.
           */
          for (let z = 1; z < 9; z++) {
            let xtmp = sx + diroffx[z];
            let ytmp = sy + diroffy[z];

            if ((xtmp >= 0) && (xtmp < MAXX) && (ytmp >= 0) && (ytmp < MAXY)) {
              /* This square is within the map */
              if (screen[xtmp][ytmp] == 0) {
                /*
                 * a valid position that is not part of a path has been found,
                 * so mark it as path_dist + 1 away from the player
                 */
                screen[xtmp][ytmp] = (path_dist + 1);

                if ((xtmp == x) && (ytmp == y)) {
                  found_path = 1;
                }
              }
            } /* if xtmp, ytmp on map */
          } /* for each direction */
        } /* if found path end */
      } /* for sx */
    } /* for sy */

    path_dist++;

  }

  if (found_path) {
    /* did find connectivity */
    /*
     * Now find the square with a distance 1 lower than the distance to the
     * monster being moved.
     */
    path_dist = screen[x][y] - 1;

    let on_map;
    for (let z = 1; z < 9; z++) {
      xl = x + diroffx[z];
      yl = y + diroffy[z];

      if (level == 0) {
        /* 
         * On the home level monsters can move right to the edge 
         * of the map 
         */
        on_map = ((xl >= 0) && (xl < MAXX) && (yl >= 0) && (yl < MAXY));
      } else {
        /* 
         * In the dungeon and volcano monsters can not move onto the
         * outer border of walls. 
         */
        on_map = ((xl >= 1) && (xl < (MAXX - 1)) && (yl >= 1) && (yl < (MAXY - 1)));
      }

      if (on_map) {
        if (screen[xl][yl] == path_dist) {
          if (!monsterAt(xl, yl)) {
            mmove(x, y, xl, yl);
            return;
          }
        }
      }
    }
  }

  /* 12.4.5 UPGRADE
   * make smart monsters move in closed rooms too, except demons, who should
   * alway guard the eye / potion
   */
  else {
    let item = itemAt(x, y);
    if (!(monster.isDemon() && (item.matches(OLARNEYE) || item.matches(OPOTION) && item.arg == 21))) {
      dumb_move(x, y);
    }
  }
}



/* =============================================================================
 * FUNCTION:
 *
 * DESCRIPTION:
 * Function to actually perform the monster movement.
 * This function sets MovedX & MovedY to the new monster position, or -1
 * if the monster was killed or otherwise removed from the level.
 *
 * PARAMETERS:
 *
 *   sx : The starting x coordinate of the monster
 *
 *   sy : The starting y coordinate of the monster
 *
 *   dx : The destination x coordinate for the monster
 *
 *   dy : The destination y coordinate for the monster
 *
 * RETURN VALUE:
 *
 *   None.
 */
function mmove(sx, sy, dx, dy) {
  let monster = monsterAt(sx, sy);
  if (!monster) {
    console.log(`mmove(): no monster at ${sx},${sy}`);
    return;
  }

  //console.log(`${sx}->${dx}, ${sy}->${dy}`);

  if (dx == player.x && dy == player.y) {
    /* The destination is the player, so the monster attacks */
    hitplayer(sx, sy);
    monster.moved = true;
    movedx = sx;
    movedy = sy;
    return;
  }

  /* move monster to the new location */
  player.level.monsters[sx][sy] = null;
  player.level.monsters[dx][dy] = monster;

  monster.awake = true;

  /* mark this monster as moved */
  monster.moved = true;

  /* perform special processing for monsters */

  let item = itemAt(dx, dy);

  if (ULARN && monster.matches(LEMMING)) {
    /* 2% chance moving a lemming creates a new lemming in the old spot */
    if (rnd(100) <= 2) {
      player.level.monsters[sx][sy] = createMonster(LEMMING);
    }
  }

  if (monster.matches(LEPRECHAUN)) {
    /* leprechaun takes gold and gems */
    if (item.matches(OGOLDPILE) || item.isGem()) {
      monster.pickup(item);
      setItem(dx, dy, OEMPTY);
    }
  }

  if (monster.matches(TROLL)) {
    /* if a troll regenerate him */
    if (isHalfTime()) {
      if (monsterlist[monster.arg].hitpoints > monster.hitpoints) monster.hitpoints++;
    }
  }

  // /* check for monsters walking into traps and spheres of annihilation */

  let monst_killed = 0;
  let what;
  let trap_damage = 0;
  let trap_msg;

  if (item.matches(OANNIHILATION)) {
    /* demons dispel spheres */
    if (monster.isDemon()) {
      let have_talisman = isCarrying(OSPHTALISMAN);
      if ((!have_talisman) ||
        // lucifer can't dispels 30% of the time if talisman
        (have_talisman && monster.matches(LUCIFER) && rnd(10) > 7)) {
        /* delete the sphere */
        trap_msg = `The ${monster} dispels the sphere!`;
        rmsphere(dx, dy);
      } else {
        /* monster annihilated */
        trap_msg = `The ${monster} is destroyed by the sphere of annihilation!`;
        killMonster(dx, dy);
        monst_killed = 1;
      }
    } else {
      if (monster.isCarrying(OSPHTALISMAN)) {
        /* talisman protects monster */
        trap_msg = `The ${monster} is unaffected by the sphere of annihilation!`;
      } else {
        /* monster annihilated */
        trap_msg = `The ${monster} is destroyed by the sphere of annihilation!`;
        killMonster(dx, dy);
        monst_killed = 1;
      }
    }
  } else if (item.matches(OTRAPARROW)) {
    what = `An arrow`;
    trap_damage = rnd(10) + level;
  } else if (item.matches(ODARTRAP)) {
    what = `A dart`;
    trap_damage = rnd(6);
  } else if (item.matches(OTELEPORTER)) {
    /* monster hits teleport trap */
    if (!monster.isDemon()) {
      trap_msg = `The ${monster} gets teleported.`;
      teleportMonster(dx, dy);
      dx = movedx;
      dy = movedy;
    }
  } else if (item.matches(OPIT) || item.matches(OTRAPDOOR)) {
    /* non-flying monsters can fall into pits and trap doors */
    if (!monster.canFly()) {
      trap_msg = `The ${monster} fell into a pit.`;
      if (item.matches(OTRAPDOOR)) {
        trap_msg = `The ${monster} fell through a trapdoor.`;
      }
      killMonster(dx, dy);
      monst_killed = 1;
    }
  } else if ((item.matches(OELEVATORUP)) || (item.matches(OELEVATORDOWN))) {
    /* The monster enters an elevator */
    if (!monster.isDemon()) {
      trap_msg = `The ${monster} is carried away by an elevator!`;
      killMonster(dx, dy);
      monst_killed = 1;
    }
  }

  if (trap_damage > 0) {
    /* the monster was damaged by a trap */
    monster.hitpoints -= trap_damage;

    if (monster.hitpoints <= 0) {
      /* the trap killed the monster */
      killMonster(dx, dy);
      trap_msg = `${what} hits and kills the ${monster}.`;
      monst_killed = 1;
    } else {
      trap_msg = `${what} hits the ${monster}.`;
    }
  }

  /*
   * Store the location to which this monster has been moved, or -1 if
   * the monster was destroyed
   */
  if (monst_killed) {
    movedx = -1;
    movedy = -1;
  } else {
    movedx = dx;
    movedy = dy;
  }

  /* if blind don't show where monsters are */
  if (player.BLINDCOUNT) return;

  if (player.level.know[dx][dy] != OUNKNOWN) {
    if (trap_msg) {
      updateLog(trap_msg);
      beep();
    }
  }

  if (ULARN && monster.isDemon() && !isCarrying(OLARNEYE)) {
    /*
     * don't update the screen for demonlords and above if the player
     * doesn't have the eye of larn as the player can't see the monster.
     */
    return;
  }

  /* Update the screen */
  if (player.level.know[sx][sy] & HAVESEEN) show1cell(sx, sy);
  if (player.level.know[dx][dy] & HAVESEEN) show1cell(dx, dy);

  // ULARN TODO? this actually does something kinda cool by revealing 
  // monsters outside the players normal view. could take advantage 
  // of this to make a "widget of spine tingling" or something
  // if (player.level.know[sx][sy] != OUNKNOWN) show1cell(sx, sy);
  // if (player.level.know[dx][dy] != OUNKNOWN) show1cell(dx, dy);

}



/* =============================================================================
 * FUNCTION: valid_monst_move
 *
 * DESCRIPTION:
 * Check if the location x, y is a valid place for monster monst_id to move
 * or attack.
 * Does NOT check if the location is already occupied by another monster.
 *
 * PARAMETERS:
 *
 *   x        : The x coordinate to check
 *
 *   y        : THe y coordinate to check
 *
 *   monst_id : The monster id
 *
 * RETURN VALUE:
 *
 *   0 if the monster cannot occupy to this position
 *   1 if the monster can occupy to this postion
 */
function valid_monst_move(x, y, monster) {
  let item = itemAt(x, y);
  let at_entrance; /* flag indicating that this is the dungeon entrance */
  let at_player; /* flag that this is the player's location */
  let blocked; /* flag that the monster canot move here (wall etc) */
  let monster_special; /* flag that there is a special reason the monster  */

  /* can't move here */
  at_player = (x == player.x) && (y == player.y);
  at_entrance = (x == 33) && (y == MAXY - 1) && (level == 1);

  /*
   * A monster cannot pass through a closed door or a wall.
   * However, while a monster cannot hit the player through a closed door
   * a monster can hit a player who is walking through walls.
   */
  blocked = (item.matches(OCLOSEDDOOR)) || ((item.matches(OWALL)) && !at_player);

  /*
   * Vampires will not move onto mirrors.
   */
  monster_special = (monster.matches(VAMPIRE)) && (item.matches(OMIRROR));

  //// ULARN TODO?? this looks ridiculous! -- jrp
  // if (monster.matches(DEMONPRINCE) || monster.matches(LUCIFER)) {
  //   /* walls and closed doors are no hindrance to a demon prince or above */
  //   blocked = false;
  // }

  if (at_entrance || blocked || monster_special) {
    /* Return false to indicate illegal position */
    return false;
  } else {
    return true;
  }
}



/*
   v12.4.5:
   randomly wake up monsters next to our hero, even in stealth mode
 */
function noticeplayer() {
  if (player.STEALTH) {
    var monsters = nearbymonsters();
    for (var i = 0; i < monsters.length; i++) {
      var monster = monsters[i];
      if (rund(15) < getDifficulty() - 1) { // increase odds starting with diff 2
        if (!monster.awake && rnd(101) < 50) { // want at worst 50/50 odds
          updateLog(`The ${monster} sees you!`);
          monster.awake = true;
        }
      }
    }
  }
}



/*
 v12.4.5 - fix for half speed monsters following at 1:1 or not at all when running
 */
function isHalfTime() {
  // TODO: IS THIS THE PLACE TO FIX 1/2 SPEED MONSTERS NOT WORKING WITH HASTE?
  return (player.MOVESMADE & 1) == 1;
  // if ((gtime & 1) == 1) // old code
}