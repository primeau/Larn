'use strict';

/* this is the structure for maintaining & moving the spheres of annihilation */
var Sphere = function(x, y, dir, lifetime, lev) {
  this.x = x; /* location of the sphere */
  this.y = y;
  this.level = lev;
  this.direction = dir; /* direction sphere is going in */
  this.lifetime = lifetime; /* duration of the sphere */
  //console.log(`${x} ${y} ${this.level} ${lifetime}`)
};



/*
 *  newsphere(x,y,dir,lifetime)  Function to create a new sphere of annihilation
 *      int x,y,dir,lifetime;
 *
 *  Enter with the coordinates of the sphere in x,y
 *    the direction (0-8 diroffx format) in dir, and the lifespan of the
 *    sphere in lifetime (in turns)
 *  Returns the number of spheres currently in existence
 */
function newsphere(x, y, dir, life, lev) {
  if (dir >= 9) dir = 0; /* no movement if direction not found */
  if (lev == 0) { /* don't go out of bounds */
    x = vx(x);
    y = vy(y);
  } else {
    if (x < 1) x = 1;
    if (x >= MAXX - 1) x = MAXX - 2;
    if (y < 1) y = 1;
    if (y >= MAXY - 1) y = MAXY - 2;
  }
  var monster = monsterAt(x, y);
  if (monster && monster.isDemon()) /* demons dispel spheres */ {
    show1cell(x, y); /* show the demon (ha ha) */
    cursors();
    updateLog(`The ${monster} dispels the sphere!`);
    rmsphere(x, y); /* remove any spheres that are here */
    return;
  }
  if (monster && monster.matches(DISENCHANTRESS)) /* disenchantress cancels spheres */ {
    cursors();
    updateLog(`The ${monster} causes cancellation of the sphere!`);
    sphboom(x, y); /* blow up stuff around sphere */
    rmsphere(x, y); /* remove any spheres that are here */
    return;
  }
  if (player.CANCELLATION) /* cancellation cancels spheres */ {
    cursors();
    updateLog(`As the cancellation takes effect, you hear a great earth shaking blast!`);
    sphboom(x, y); /* blow up stuff around sphere */
    rmsphere(x, y); /* remove any spheres that are here */
    return;
  }
  if (itemAt(x, y).matches(OANNIHILATION)) /* collision of spheres detonates spheres */ {
    cursors();
    updateLog(`Two spheres of annihilation collide! You hear a great earth shaking blast!`);
    sphboom(x, y); /* blow up stuff around sphere */
    rmsphere(x, y); /* remove any spheres that are here */
    return;
  }
  if (player.x == x && player.y == y) /* collision of sphere and player! */ {
    cursors();
    updateLog(`You have been enveloped by the zone of nothingness!`);
    rmsphere(x, y); /* remove any spheres that are here */
    //nap(2000);
    died(DIED_ANNIHILATED_SELF, false); /* self - annihilated */
  }

  setItem(x, y, createObject(OANNIHILATION));

  updateWalls(x, y, 1);

  player.level.monsters[x][y] = null;
  player.level.know[x][y] = 1;
  show1cell(x, y); /* show the new sphere */

  /* one more sphere in the world */
  var sp = new Sphere(x, y, dir, life, lev);
  spheres.push(sp);

  return;
}



/*
 *  rmsphere(x,y)       Function to delete a sphere of annihilation from list
 *      int x,y;
 *
 *  Enter with the coordinates of the sphere (on current level)
 *  Returns the number of spheres currently in existence
 */
function rmsphere(x, y) {
  for (var i = 0; i < spheres.length; i++) {
    var sp = spheres[i];
    if (!sp) continue;
    if (sp.level == level) { /* is sphere on this level? */
      if (x == sp.x && y == sp.y) /* locate sphere at this location */ {
        setItem(x, y, OEMPTY);
        player.level.monsters[x][y] = null;
        player.level.know[x][y] = 1;
        show1cell(x, y); /* show the now missing sphere */
        spheres.splice(i, 1); // remove the sphere from the list
        //break;
      }
    }
  }

  /* return number of spheres in the world */
  return spheres.length;
}



/*
 *  sphboom(x,y)    Function to perform the effects of a sphere detonation
 *      int x,y;
 *
 *  Enter with the coordinates of the blast, Returns no value
 */
function sphboom(x, y) {
  if (player.HOLDMONST) player.updateHoldMonst(-player.HOLDMONST); // set to 0
  if (player.CANCELLATION) player.updateCancellation(-player.CANCELLATION); // set to 0
  for (var j = Math.max(1, x - 2); j < Math.min(x + 3, MAXX - 1); j++) {
    for (var i = Math.max(1, y - 2); i < Math.min(y + 3, MAXY - 1); i++) {
      setItem(j, i, OEMPTY);
      player.level.monsters[j][i] = null;
      show1cell(j, i);
      if (player.x == j && player.y == i) {
        cursors();
        updateLog(`You were too close to the sphere!`);
        //nap(2000);
        died(DIED_ANNIHILATED, false); /* player killed in explosion */
      }
    }
  }
  updateWalls(x, y, 3);
}



/*
 *  movsphere()     Function to look for and move spheres of annihilation
 *
 *  This function works on the sphere linked list, first duplicating the list
 *  (the act of moving changes the list), then processing each sphere in order
 *  to move it.  They eat anything in their way, including stairs, volcanic
 *  shafts, potions, etc, except for upper level demons, who can dispel
 *  spheres.
 *  No value is returned.
 */
function movsphere() {
  for (var i = spheres.length; i >= 0; --i) /* look through sphere list */ {
    var sp = spheres[i];
    if (!sp) continue;
    if (sp.level != level) continue;
    // if (!itemAt(sp.x, sp.y).matches(OANNIHILATION)) continue; /* not really there */
    if (--sp.lifetime < 0) /* has sphere run out of gas? */ {
      rmsphere(sp.x, sp.y); /* delete sphere */
      continue;
    }
    switch (rnd(Math.max(7, player.INTELLIGENCE >> 1))) /* time to move the sphere */ {
      case 1:
      case 2:
        /* change direction to a random one */
        sp.direction = rnd(8);
      default:
        /* move in normal direction */
        rmsphere(sp.x, sp.y);
        newsphere(sp.x + diroffx[sp.direction], sp.y + diroffy[sp.direction], sp.direction, sp.lifetime, sp.level);
    };
  }
}
