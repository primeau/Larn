'use strict';

function learnSpell(spell) {
  //debug(`learning ${spell} ${spelcode.indexOf(spell)}`)
  player.knownSpells[spelcode.indexOf(spell)] = spell;
}



function forgetSpell(spellnum) {
  player.knownSpells[spellnum] = null;
}



var eys = `Enter your spell: `;
var spellToCast = null;



function pre_cast() {
  cursors();
  nomove = 1;
  if (player.SPELLS > 0) {
    updateLog(eys);
    spellToCast = ``;
    setCharCallback(cast);
  } else {
    updateLog(`You don't have any spells!`);
  }
}



function matchesSpell(spell) {
  for (var i = 0; i < spelcode.length; i++) {
    if (spelcode[i] === spell) return true;
  }
  return false;
}



function cast(key) {

  nomove = 1;

  if (key == 'I' || key == ` `) {
    seemagic(true);
    setCharCallback(parse_see_spells);
    if (!spellToCast) updateLog(eys);
    return 0;
  }

  if (key == DEL && spellToCast.length >= 1) {
    spellToCast = spellToCast.substring(0, spellToCast.length - 1);
    var line = deleteLog();
    updateLog(line.substring(0, line.length - 1));
    return 0;
  }

  if (key == ESC) {
    appendLog(`  aborted`);
    spellToCast = null;
    return 1;
  }

  if (!(isalpha(key) || matchesSpell(key))) {
    // if (!isalpha(key) && !matchesSpell(key)) {
    return 0;
  }

  spellToCast += key;
  appendLog(key);

  if (spellToCast.length < 3) {
    return 0;
  }

  player.setSpells(player.SPELLS - 1);
  player.SPELLSCAST++;

  var spellnum = player.knownSpells.indexOf(spellToCast.toLowerCase());
  if (spellnum >= 0) {
    speldamage(spellnum);
  } else {
    nomove = 0;
    updateLog(`  Nothing Happened `);
    //bottomline();
  }

  spellToCast = null;
  return 1;
}



/*
 *  speldamage(x)       Function to perform spell functions cast by the player
 *      int x;
 *
 *  Enter with the spell number, returns no value.
 *  Please insure that there are 2 spaces before all messages here
 */
function speldamage(x) {
  /* no such spell */
  //if (x >= SPNUM) return;

  /* not if time stopped */
  if (player.TIMESTOP) {
    updateLog(`  It didn't seem to work`);
    return;
  }

  var clev = player.LEVEL;
  if ((rnd(23) == 7) || (rnd(18) > player.INTELLIGENCE)) {
    nomove = 0;
    updateLog(`  It didn't work!`);
    return;
  }
  if (clev * 3 + 2 < x) {
    nomove = 0;
    updateLog(`  Nothing happens.  You seem inexperienced at this`);
    return;
  }

  nomove = 0;

  switch (x) {
    /* ----- LEVEL 1 SPELLS ----- */

    case 0:
      /* protection field +2 */
      player.updateProtectionTime(250);
      return;

    case 1:
      /* magic missile */
      prepare_direction_event(spell_magic_missile);
      return;

    case 2:
      /* dexterity   */
      player.updateDexCount(400);
      return;

    case 3:
      /* sleep */
      prepare_direction_event(spell_sleep);
      return;

    case 4:
      /* charm monster */
      player.updateCharmCount(player.CHARISMA << 1);
      return;

    case 5:
      /* sonic spear */
      prepare_direction_event(spell_sonic_spear);
      return;

      /* ----- LEVEL 2 SPELLS ----- */

    case 6:
      /* web */
      prepare_direction_event(spell_web);
      return;

    case 7:
      /* strength */
      player.updateStrCount(150 + rnd(100));
      return;

    case 8:
      /* enlightenment */
      var yl = Math.max(0, player.y - 5);
      var yh = Math.min(MAXY, player.y + 6);
      var xl = Math.max(0, player.x - 15);
      var xh = Math.min(MAXX, player.x + 16);
      for (var i = xl; i < xh; i++)
        for (var j = yl; j < yh; j++)
          player.level.know[i][j] = KNOWALL;
      return;

    case 9:
      /* healing */
      player.raisehp(20 + (clev << 1));
      return;

    case 10:
      /* cure blindness */
      if (player.BLINDCOUNT)
        player.BLINDCOUNT = 1;
      return;

    case 11:
      /* create monster */
      createmonster(makemonst(level + 1) + 8);
      return;

    case 12:
      /* phantasmal forces */
      prepare_direction_event(spell_phantasmal);
      return;

    case 13:
      /* invisibility */
      var amuletmodifier = 0;
      var amulet = isCarrying(OAMULET);
      /* if he has the amulet of invisibility then add more time */
      if (amulet) {
        amuletmodifier += 1 + amulet.arg;
      }
      player.updateInvisibility((amuletmodifier << 7) + 12);
      return;

      /* ----- LEVEL 3 SPELLS ----- */

    case 14:
      /* fireball */
      prepare_direction_event(spell_fireball);
      return;

    case 15:
      /* cold */
      prepare_direction_event(spell_cold);
      return;

    case 16:
      /* polymorph */
      prepare_direction_event(spell_polymorph);
      return;

    case 17:
      /* cancellation */
      player.updateCancellation(5 + clev);
      return;

    case 18:
      /* haste self */
      player.updateHasteSelf(7 + clev);
      return;

    case 19:
      /* cloud kill */
      omnidirect(x, 30 + rnd(10), `gasps for air`);
      return;

    case 20:
      /* vaporize rock */
      var xh = Math.min(player.x + 1, MAXX - 2);
      var yh = Math.min(player.y + 1, MAXY - 2);
      for (var i = Math.max(player.x - 1, 1); i <= xh; i++) {
        for (var j = Math.max(player.y - 1, 1); j <= yh; j++) {
          var item = itemAt(i, j);
          if (item.matches(OWALL)) {
            if (level < VBOTTOM - (ULARN ? 2 : 0))
              setItem(i, j, OEMPTY);
          } else if (item.matches(OSTATUE)) {
            var doCrumble = getDifficulty() < 3;
            if (ULARN) doCrumble = getDifficulty() <= 3 && rnd(60) < 30;
            if (doCrumble) {
              setItem(i, j, createObject(OBOOK, level));
            }
          } else if (item.matches(OTHRONE)) {
            if (item.arg == 0) {
              create_guardian(GNOMEKING, i, j);
              item.arg = 1; // nullify the throne
            }
          } else if (item.matches(OALTAR)) {
            create_guardian(DEMONPRINCE, i, j);
            if (ULARN) {
              createmonster(DEMONPRINCE);
              createmonster(DEMONPRINCE);
              createmonster(DEMONPRINCE);
            }
          } else if (!ULARN && item.matches(OFOUNTAIN)) {
            create_guardian(WATERLORD, i, j);
          } else if (monsterAt(i, j) && monsterAt(i, j).matches(XORN)) {
            ifblind(i, j);
            hitm(i, j, 200);
          } else if (ULARN && monsterAt(i, j) && monsterAt(i, j).matches(TROLL)) {
            ifblind(i, j);
            hitm(i, j, 200);
          }
          player.level.know[i][j] = KNOWALL; // HACK fix for black tile
        }
      }

      updateWalls(player.x, player.y, 2);

      return;

      /* ----- LEVEL 4 SPELLS ----- */

    case 21:
      /* dehydration */
      prepare_direction_event(spell_dry);
      return;

    case 22:
      /* lightning */
      prepare_direction_event(spell_lightning);
      return;

    case 23:
      /* drain life */
      prepare_direction_event(spell_drain);
      return;

    case 24:
      /* globe of invulnerability */
      if (player.GLOBE == 0) player.setMoreDefenses(player.MOREDEFENSES + 10);
      player.GLOBE += 200;
      loseint();
      return;

    case 25:
      /* flood */
      omnidirect(x, 32 + clev, `struggles for air in your flood!`);
      return;

    case 26:
      /* finger of death */
      if (rnd(151) != 63) {
        prepare_direction_event(spell_finger);
      } else {
        beep();
        updateLog(`  Your heart stopped!`);
        //nap(4000);
        died(270, false); /* erased by a wayward finger */
      }
      return;

      /* ----- LEVEL 5 SPELLS ----- */

    case 27:
      /* scare monster */
      player.updateScareMonst(rnd(10) + clev);
      if (isCarrying(OHANDofFEAR)) {
        player.SCAREMONST *= 3;
      }
      return;

    case 28:
      /* hold monster */
      player.updateHoldMonst(rnd(10) + clev);
      return;

    case 29:
      /* time stop */
      player.updateTimeStop(rnd(20) + (clev << 1));
      return;

    case 30:
      /* teleport away */
      prepare_direction_event(spell_teleport);
      return;

    case 31:
      /* magic fire */
      omnidirect(x, 35 + rnd(10) + clev, `cringes from the flame`);
      return;

      /* ----- LEVEL 6 SPELLS ----- */

    case 32:
      /* sphere of annihilation */
      if ((rnd(23) == 5) && (wizard == 0)) {
        //beep();
        updateLog(`You have been enveloped by the zone of nothingness!`);
        //nap(4000);
        died(258, false); /* self - annihilated */
        return;
      }
      loseint();
      prepare_direction_event(spell_sphere);
      return;
      //
    case 33:
      /* genocide */
      updateLog(`Genocide what monster? `);
      setCharCallback(genmonst);
      if (!wizard)
        forgetSpell(33); /* forget */
      loseint();
      return;

    case 34:
      /* summon demon */
      if (rnd(100) > 30) {
        prepare_direction_event(spell_summon);
      } else if (rnd(100) > 15) {
        updateLog(`  Nothing seems to have happened`);
      } else {
        updateLog(`  The demon turned on you and vanished!`);
        beep();
        var i = rnd(40) + 30;
        lastnum = 277; /* attacked by a revolting demon */
        player.losehp(i);
      }
      return;

    case 35:
      /* walk through walls */
      player.updateWTW(rnd(10) + 5);
      return;

    case 36:
      /* alter reality */
      var savemon = [];
      var saveitm = [];
      var i, j;
      var empty = OEMPTY;
      for (j = 0; j < MAXY; j++) {
        for (i = 0; i < MAXX; i++) /* save all items and monsters */ {
          var item = itemAt(i, j);
          var monster = monsterAt(i, j);
          if (!item.matches(OEMPTY) && !item.matches(OWALL) &&
            !item.matches(OANNIHILATION) && !item.matches(OHOMEENTRANCE)) {
            saveitm.push(item);
          }
          if (monster) {
            savemon.push(monster);
          }
          if (level != 0) {
            setItem(i, j, OWALL);
          } else {
            setItem(i, j, OEMPTY);
          }
          player.level.monsters[i][j] = null;
          if (wizard)
            player.level.know[i][j] = KNOWALL;
          else
            player.level.know[i][j] = 0;
        }
      }
      if (level != 0) eat(1, 1);
      if (level == 1)
        setItem(33, MAXY - 1, createObject(OHOMEENTRANCE));
      for (j = rnd(MAXY - 2), i = 1; i < MAXX - 1; i++) {
        // JRP: I'm not sure why we do this, but it's in the original code
        setItem(i, j, empty);
      }
      /* put objects back in level */
      while (saveitm.length > 0) {
        var item = saveitm.pop();
        fillroom(item, item.arg);
      }
      /* put monsters back in */
      while (savemon.length > 0) {
        var monster = savemon.pop();
        fillmonst(monster.arg);
      }
      loseint();
      if (!wizard)
        forgetSpell(36); /* forget */
      positionplayer();
      /* 12.4.5
      the last hit monster is probably somewhere else now
      */
      lasthx = 0;
      lasthy = 0;

      updateWalls();

      return;

    case 37:
      /* permanence */
      adjtime(-99999);
      if (!wizard)
        forgetSpell(37); /* forget */
      loseint();
      return;

    default:
      nomove = 0;
      appendLog(`  spell ${x} not available!`);
      beep();
      return;
  };
}



/* it would be nice to have these methods closer to the
spells they are for, but they need to be at the top level
for firefox compatibility */

function spell_magic_missile(direction) {
  var damage = rnd(((player.LEVEL + 1) << 1)) + player.LEVEL + 3;
  setup_godirect(100, MLE, direction, damage, '+');
}

function spell_sleep(direction) {
  var hits = rnd(3) + 1;
  direct(SLE, direction, fullhit(hits), hits);
}

function spell_sonic_spear(direction) {
  var damage = rnd(10) + 15 + player.LEVEL;
  setup_godirect(70, SSP, direction, damage, '@');
}

function spell_web(direction) {
  var hits = rnd(3) + 2;
  direct(WEB, direction, fullhit(hits), hits);
}

function spell_phantasmal(direction) {
  if (rnd(11) + 7 <= player.WISDOM) {
    direct(PHA, direction, rnd(20) + 20 + player.LEVEL, 0)
  } else {
    updateLog(`  It didn't believe the illusions!`);
  }
}

function spell_fireball(direction) {
  var damage = rnd(25 + player.LEVEL) + 25 + player.LEVEL;
  setup_godirect(40, BAL, direction, damage, '*');
}

function spell_cold(direction) {
  var damage = rnd(25) + 20 + player.LEVEL;
  setup_godirect(60, CLD, direction, damage, 'O');
}

function spell_dry(direction) {
  direct(DRY, direction, 100 + player.LEVEL, 0);
}

function spell_lightning(direction) {
  var damage = rnd(25) + 20 + (player.LEVEL << 1);
  setup_godirect(10, LIT, direction, damage, '~');
}

function spell_drain(direction) {
  var damage = Math.min(player.HP - 1, player.HPMAX / 2);
  direct(DRL, direction, damage + damage, 0);
  player.losehp(Math.round(damage));
}

function spell_finger(direction) {
  if (player.WISDOM > rnd(10) + 10) {
    direct(FGR, direction, 2000, 0);
  } else {
    updateLog(`  It didn't work`);
  }
}

function spell_sphere(direction) {
  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];
  newsphere(x, y, direction, rnd(20) + 11, level); /* make a sphere */
  newsphereflag = true;
}

function spell_summon(direction) {
  direct(SUM, direction, 150, 0);
}



/*
 *  dirpoly(spnum)      Routine to ask for a direction and polymorph a monst
 *      int spnum;
 *
 *  Subroutine to polymorph a monster and ask for the direction its in
 *  Enter with the spell number in spmun.
 *  Returns no value.
 */
function spell_polymorph(direction) {
  //if (spnum < 0 || spnum >= SPNUM) return; /* bad args */

  if (isconfuse())
    return; /* if he is confused, he can't aim his magic */

  //dirsub( & x, & y);
  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];

  var monster = getMonster(direction);
  if (!monster) {
    updateLog(`  There wasn't anything there!`);
    return;
  }

  ifblind(x, y);

  if (nospell(16 /*polymorph*/ , monster) == 0) {
    player.level.monsters[x][y] = null;
    createmonster(rnd(monsterlist.length - 1), x, y);
    show1cell(x, y); /* show the new monster */
  } else {
    lasthx = x;
    lasthy = y;
  }
}



/*
 *  tdirect(spnum)      Routine to teleport away a monster
 *      int spnum;
 *
 *  Routine to ask for a direction to a spell and then teleport away monster
 *  Enter with the spell number that wants to teleport away
 *  Returns no value.
 */
function spell_teleport(direction) {
  //if (spnum < 0 || spnum >= SPNUM) return; /* bad args */
  if (isconfuse()) return;
  //dirsub( & x, & y);
  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];
  var monster = getMonster(direction);
  if (!monster) {
    updateLog(`  There wasn't anything there!`);
    return;
  }
  ifblind(x, y);
  if (nospell(30 /*teleportaway*/ , monster) == 0) {
    fillmonst(monster.arg);
    player.level.monsters[x][y] = null;
    player.level.know[x][y] &= ~KNOWHERE;

    /* 12.4.5
    fix for last hit monster chasing the player from across the maze
    caused by hitting monster, teleporting it away, then a new monster
    appears in the same spot
    */
    lasthx = 0;
    lasthy = 0;

  } else {
    lasthx = x;
    lasthy = y;
    return;
  }
}



/*
    Create a guardian for a throne/altar/fountain, as a result of the player
    using a VPR spell or pulverization scroll on it.
*/
function create_guardian(monst, x, y) {
  /* prevent the guardian from being created on top of the player */
  if ((x == player.x) && (y == player.y)) {
    var k = rnd(8);
    x += diroffx[k];
    y += diroffy[k];
  }
  player.level.know[x][y] = 0;
  if (!isGenocided(monst))
    createmonster(monst, x, y);

  // 12.4.5: not in original, but maybe a good idea?
  // if (monsterAt(x,y)) {
  //   monsterAt(x,y).awake = true;
  // }
}



/*
 *  Routine to subtract 1 from your int (intelligence) if > 3
 *
 *  No arguments and no return value
 */
function loseint() {
  player.setIntelligence(player.INTELLIGENCE - 1);
}



/*
 *  isconfuse()         Routine to check to see if player is confused
 *
 *  This routine prints out a message saying `You can't aim your magic!`
 *  returns 0 if not confused, non-zero (time remaining confused) if confused
 */
function isconfuse() {
  if (player.CONFUSE) {
    updateLog(`  You can't aim your magic!`);
    beep();
  }
  return (player.CONFUSE > 0);
}



/*
 *  nospell(x,monst)    Routine to return 1 if a spell doesn't affect a monster
 *      int x,monst;
 *
 *  Subroutine to return 1 if the spell can't affect the monster
 *    otherwise returns 0
 *  Enter with the spell number in x, and the monster number in monst.
 */
function nospell(x, monst) {
  var tmp = spelweird[monst.arg - 1][x];
  //if (x >= SPNUM || monst >= MAXMONST + 8 || monst < 0 || x < 0) return (0); /* bad spell or monst */
  if (tmp == 0) {
    return (0);
  }
  cursors();
  updateLog(spelmes[tmp](monst));
  return (1);
}



/*
 *  fullhit(xx)     Function to return full damage against a monster (aka web)
 *      int xx;
 *
 *  Function to return hp damage to monster due to a number of full hits
 *  Enter with the number of full hits being done
 */
function fullhit(xx) {
  if (xx < 0 || xx > 20) return (0); /* fullhits are out of range */
  if (player.WIELD && player.WIELD.matches(OLANCE)) return (10000); /* lance of death */
  var i = xx * ((player.WCLASS >> 1) + player.STRENGTH + player.STREXTRA - getDifficulty() - 12 + player.MOREDAM);
  return ((i >= 1) ? i : xx);
}



/*
 *  direct(spnum,dam,str,arg)   Routine to direct spell damage 1 square in 1 dir
 *      int spnum,dam,arg;
 *      char *str;
 *
 *  Routine to ask for a direction to a spell and then hit the monster
 *  Enter with the spell number in spnum, the damage to be done in dam,
 *    lprintf format string in str, and lprintf's argument in arg.
 *  Returns no value.
 */
function direct(spnum, direction, dam, arg) {
  //if (spnum < 0 || spnum >= SPNUM || str == 0) return; /* bad arguments */
  if (isconfuse()) {
    return;
  }
  //dirsub( & x, & y);
  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];

  var monster = getMonster(direction);
  var item = getItemDir(direction);

  if (!monster && !item.matches(OMIRROR)) {
    updateLog(`  There wasn't anything there!`);
    return;
  }

  var str = attackmessage[spnum];

  if (item.matches(OMIRROR) && !monster) {
    if (spnum == 3) /* sleep */ {
      updateLog(`  You fall asleep! `);
      beep();
      arg += 2;
      while (arg-- > 0) {
        parse2();
        //nap(1000);
      }
      return;
    } else if (spnum == 6) /* web */ {
      updateLog(`  You get stuck in your own web! `);
      beep();
      arg += 2;
      while (arg-- > 0) {
        parse2();
        //nap(1000);
      }
      return;
    } else {
      lastnum = 278; /* hit by own magic */
      updateLog(str(`spell caster (that's you)`));
      beep();
      player.losehp(dam);
      return;
    }
  }
  ifblind(x, y);
  if (nospell(spnum, monster) == 0) {
    updateLog(str(monster, arg));
    hitm(x, y, dam);
  } else {
    lasthx = x;
    lasthy = y;
    return;
  }
}



function setup_godirect(delay, spnum, direction, damage, cshow, stroverride) {
  napping = true;
  nomove = 1;
  setTimeout(godirect, delay, spnum, player.x, player.y, diroffx[direction], diroffy[direction], damage, delay, cshow, stroverride);
  // // might need this for IE compatibility? so far so good though
  // setTimeout(
  //   function() {
  //     godirect(spnum, player.x, player.y, diroffx[direction], diroffy[direction], damage, delay, cshow, stroverride);
  //   }
  // );
}



/*
 *  Function to perform missile attacks
 *
 *  Function to hit in a direction from a missile weapon and have it keep
 *  on going in that direction until its power is exhausted
 *  Enter with the spell number in spnum, the power of the weapon in hp,
 *    lprintf format string in str, the # of milliseconds to delay between
 *    locations in delay, and the character to represent the weapon in cshow.
 *  Returns no value.
 */
function godirect(spnum, x, y, dx, dy, dam, delay, cshow, stroverride) {

  if (isconfuse()) {
    exitspell();
    return;
  }

  //debug(`${x}, ${y}: ${dam}`);

  // clear the previous square
  if (x != player.x || y != player.y) {
    cursor(x + 1, y + 1);
    if (amiga_mode) {
      lprc(` `);
    } else {
      lprc(itemAt(x, y).getChar());
    }
  }

  x += dx;
  y += dy;
  if ((x > MAXX - 1) || (y > MAXY - 1) || (x < 0) || (y < 0)) {
    dam = 0;
    exitspell();
    return;
  } /* out of bounds */

  /* if energy hits player */
  if (x == player.x && y == player.y) {
    cursors();
    updateLog(`  You are hit by your own magic!`);

    lastnum = 278;
    player.losehp(dam);
    // if (player.HP <= 0) {
    //   died(278, true); /* hit by own magic */
    // }
    exitspell();
    return;
  }

  /* if not blind show effect */
  if (player.BLINDCOUNT == 0) {
    cursor(x + 1, y + 1);
    lprc(cshow);
    //nap(delay);
    show1cell(x, y);
  }

  var monster = monsterAt(x, y);
  var item = itemAt(x, y);
  var str = stroverride || attackmessage[spnum];

  /* is there a monster there? */
  if (monster) {
    ifblind(x, y);

    /* cannot cast a missile spell at lucifer!! */
    if (ULARN && (monster.matches(LUCIFER) || (monster.isDemon() && rnd(100) < 10))) {
      dx *= -1;
      dy *= -1;
      cursors();
      updateLog(`  the ${monster} returns your puny missile!`);
    } else {
      if (nospell(spnum, monster)) {
        lasthx = x;
        lasthy = y;
        exitspell();
        return;
      }

      cursors();
      updateLog(str(monster));
      dam -= hitm(x, y, dam);
      show1cell(x, y);
      //nap(1000);

      x -= dx;
      y -= dy;
    }
  } else if (item.matches(OWALL)) {
    cursors();
    updateLog(str(`wall`));
    if ( /* enough damage? */
      dam >= 50 + getDifficulty() &&
      /* not on V3,V4,V5 */
      level < VBOTTOM - (ULARN ? 2 : 0) &&
      x < MAXX - 1 && y < MAXY - 1 &&
      x != 0 && y != 0) {
      updateLog(`  The wall crumbles`);
      setItem(x, y, OEMPTY);

      updateWalls(x, y, 1);

    }
    dam = 0;
  } else if (item.matches(OCLOSEDDOOR)) {
    cursors();
    updateLog(str(`door`));
    if (dam >= 40) {
      updateLog(`  The door is blasted apart`);
      setItem(x, y, OEMPTY);
    }
    dam = 0;
  } else if (item.matches(OSTATUE)) {
    cursors();
    updateLog(str(`statue`));
    if (dam > 44) {
      var doCrumble = getDifficulty() < 3;
      if (ULARN) doCrumble = getDifficulty() <= 3 && rnd(60) < 30;
      if (doCrumble) {
        updateLog(`  The statue crumbles`);
        setItem(x, y, createObject(OBOOK, level));
      }
    }
    dam = 0;
  } else if (item.matches(OTHRONE)) {
    cursors();
    updateLog(str(`throne`));
    var throneStrength = ULARN ? 39 : 33;
    if (dam > throneStrength && item.arg == 0) {
      create_guardian(GNOMEKING, x, y);
      item.arg = 1; // nullify the throne
      show1cell(x, y);
    }
    dam = 0;
  } else if (!ULARN && item.matches(OALTAR)) {
    cursors();
    updateLog(str(`altar`));
    if (dam > 75 - (getDifficulty() >> 2)) {
      create_guardian(DEMONPRINCE, x, y);
      show1cell(x, y);
    }
    dam = 0;
  } else if (!ULARN && item.matches(OFOUNTAIN)) {
    cursors();
    updateLog(str(`fountain`));
    if (dam > 55) {
      create_guardian(WATERLORD, x, y);
      show1cell(x, y);
    }
    dam = 0;
  } else if (item.matches(OMIRROR)) {
    var bounce = 0;
    var odx = dx;
    var ody = dy;

    /* spells may bounce directly back or off at an angle */
    if (rnd(100) < 50) {
      bounce = 1;
      dx *= -1;
    }
    if (rnd(100) < 50) {
      bounce = 1;
      dy *= -1;
    }
    /* guarantee a bounce */
    if (!bounce || (odx == dx && ody == dy)) {
      dx = -odx;
      dy = -ody;
    }
  }

  dam -= 3 + (getDifficulty() >> 1);

  if (dam > 0) {
    nomove = 1;
    blt(); // don't use paint() because it doesn't show missile trail
    setTimeout(godirect, delay, spnum, x, y, dx, dy, dam, delay, cshow, stroverride);
  } else {

    // clear the previous square
    cursor(x + 1, y + 1);
    if (amiga_mode) {
      lprc(` `);
    }

    exitspell();
    return;
  }

}



function exitspell() {
  napping = false;
  nomove = 0;
  gtime++; // this is pretty hacky
  parse2(); // monsters need a chance to attack
  paint();
}



/*
 *  omnidirect(sp,dam,str)   Routine to damage all monsters 1 square from player
 *      int sp,dam;
 *      char *str;
 *
 *  Routine to cast a spell and then hit the monster in all directions
 *  Enter with the spell number in sp, the damage done to wach square in dam,
 *    and the lprintf string to identify the spell in str.
 *  Returns no value.
 */
function omnidirect(spnum, dam, str) {
  //if (spnum < 0 || spnum >= SPNUM || str == 0) return; /* bad args */
  for (var x = player.x - 1; x <= player.x + 1; x++) {
    for (var y = player.y - 1; y <= player.y + 1; y++) {
      var monster = monsterAt(x, y);
      if (monster) {
        if (nospell(spnum, monster) == 0) {
          ifblind(x, y);
          cursors();
          updateLog(`  The ${monster} ${str}`);
          hitm(x, y, dam);
          //player.level.know[x][y] = KNOWALL; // HACK FIX FOR BLACK TILE IF KNOW = 0 in HITM()
          //nap(800);
        } else {
          lasthx = x;
          lasthy = y;
        }
      }
    }
  }
}



/*
 *  annihilate()    Routine to annihilate all monsters around player (player.x,player.y)
 *
 *  Gives player experience, but no dropped objects
 *  Returns the experience gained from all monsters killed
 */
function annihilate() {
  var k = 0;
  for (var i = player.x - 1; i <= player.x + 1; i++) {
    for (var j = player.y - 1; j <= player.y + 1; j++) {
      var monster = monsterAt(i, j);
      if (monster) {
        /* if a monster there */
        if (monster.arg < DEMONLORD + 2 &&
          // JRP: Everyone gets an easter egg. This one is mine.
          monster.arg != LAMANOBE) {
          k += monster.experience;
          player.level.monsters[i][j] = null;
          player.level.know[i][j] &= ~KNOWHERE;
        } else {
          updateLog(`  The ${monster} barely escapes being annihilated!`);
          monster.hitpoints = (monster.hitpoints >> 1) + 1; /* lose half hit points*/
        }
      }
    }
  }
  if (k > 0) {
    updateLog(`  You hear loud screams of agony!`);
    player.raiseexperience(k);
  }
  return k;
}



function isGenocided(monsterId) {
  return genocide.indexOf(monsterId) >= 0;
}




function setGenocide(monsterId) {
  genocide.push(monsterId);
}



/* Function to ask for monster and genocide from game */
function genmonst(key) {

  if (!isalpha(key)) {
    return 0;
  }

  //bell();

  appendLog(key);

  for (var j = 0; j < monsterlist.length; j++)
    if (monsterlist[j].char == key) {
      var monstname;
      if (j != LAMANOBE) setGenocide(j); // JRP see below
      switch (j) {
        case JACULI:
          monstname = `jaculi`;
          break;
        case YETI:
          monstname = `yeti`;
          break;
        case ELF:
          monstname = `elves`;
          break;
        case VORTEX:
          monstname = `vortexes`;
          break;
        case VIOLETFUNGI:
          monstname = `violet fungi`;
          break;
        case DISENCHANTRESS:
          monstname = `disenchantresses`;
          break;
        case LAMANOBE:
          // JRP: Everyone gets an easter egg. This one is mine.
          updateLog(`  Lawless resists!`);
          return 1;
        default:
          monstname = monsterlist[j] + `s`;
          break;
      }

      updateLog(`  There will be no more ${monstname}`);

      newcavelevel(level); /* now wipe out monsters on this level */
      paint();
      return 1;
    }

  updateLog(`  You sense failure!`);
  return 1;
}