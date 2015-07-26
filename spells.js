"use strict";

const splev = [1, 4, 9, 14, 18, 22, 26, 29, 32, 35, 37, 37, 37, 37, 37];

const spelcode = [
  "pro", "mle", "dex", "sle", "chm", "ssp",
  "web", "str", "enl", "hel", "cbl", "cre", "pha", "inv",
  "bal", "cld", "ply", "can", "has", "ckl", "vpr",
  "dry", "lit", "drl", "glo", "flo", "fgr",
  "sca", "hld", "stp", "tel", "mfi", /* 31 */
  "sph", "gen", "sum", "wtw", "alt", "per"
];

const spelname = [
  "protection", "magic missile", "dexterity",
  "sleep", "charm monster", "sonic spear",
  "web", "strength", "enlightenment",
  "healing", "cure blindness", "create monster",
  "phantasmal forces", "invisibility",
  "fireball", "cold", "polymorph",
  "cancellation", "haste self", "cloud kill",
  "vaporize rock",
  "dehydration", "lightning", "drain life",
  "invulnerability", "flood", "finger of death",
  "scare monster", "hold monster", "time stop",
  "teleport away", "magic fire",
  "sphere of annihilation", "genocide", "summon demon",
  "walk through walls", "alter reality", "permanence",
];

const speldescript = [
  /* 1 */
  "generates a +2 protection field",
  "creates and hurls a magic missile equivalent to a + 1 magic arrow",
  "adds +2 to the casters dexterity",
  "causes some monsters to go to sleep",
  "some monsters may be awed at your magnificence",
  "causes your hands to emit a screeching sound toward what they point",
  /* 7 */
  "causes strands of sticky thread to entangle an enemy",
  "adds +2 to the casters strength for a short term",
  "the caster becomes aware of things around him",
  "restores some hp to the caster",
  "restores sight to one so unfortunate as to be blinded",
  "creates a monster near the caster appropriate for the location",
  "creates illusions, and if believed, monsters die",
  "the caster becomes invisible",
  /* 15 */
  "makes a ball of fire that burns on what it hits",
  "sends forth a cone of cold which freezes what it touches",
  "you can find out what this does for yourself",
  "negates the ability of a monster to use his special abilities",
  "speeds up the casters movements",
  "creates a fog of poisonous gas which kills all that is within it",
  "this changes rock to air",
  /* 22 */
  "dries up water in the immediate vicinity",
  "you finger will emit a lightning bolt when this spell is cast",
  "subtracts hit points from both you and a monster",
  "this globe helps to protect the player from physical attack",
  "this creates an avalanche of H2O to flood the immediate chamber",
  "this is a holy spell and calls upon your god to back you up",
  /* 28 */
  "terrifies the monster so that hopefully he wont hit the magic user",
  "the monster is frozen in his tracks if this is successful",
  "all movement in the caverns ceases for a limited duration",
  "moves a particular monster around in the dungeon (hopefully away from you)",
  "this causes a curtain of fire to appear all around you",
  /* 33 */
  "anything caught in this sphere is instantly killed.  Warning -- dangerous",
  "eliminates a species of monster from the game -- use sparingly",
  "summons a demon who hopefully helps you out",
  "allows the player to walk through walls for a short period of time",
  "god only knows what this will do",
  "makes a character spell permanent, i. e. protection, strength, etc.",
];


var knownSpells = [];

function learnSpell(spell) {
  debug(`learning ${spell} ${spelcode.indexOf(spell)}`)
  knownSpells[spelcode.indexOf(spell)] = spell;
}


var eys = "Enter your spell: ";
var spell_cast = null;



function pre_cast() {
  cursors();
  if (player.SPELLS > 0) {
    updateLog(eys);
    spell_cast = "";
    blocking_callback = cast;
  } else {
    updateLog("You don't have any spells!");
  }
}



function cast(key) {

  if (key == 'I' || key == " ") {
    // TODO
    // seemagic(-1);
    // cursors();
    if (spell_cast == null) updateLog(eys);
    return 0;
  }

  if (key == ESC) {
    appendLog(`  aborted`);
    return 1;
  }

  spell_cast += key;
  appendLog(key);

  if (spell_cast.length < 3) {
    return 0;
  }

  updateLog("");

  --player.SPELLS;

  var spellnum = knownSpells.indexOf(spell_cast);
  if (spellnum >= 0) {
    speldamage(spellnum);
  } else {
    appendLog("  Nothing Happened ");
    bottomline();
  }

  player.level.paint();
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
    appendLog("  It didn't seem to work");
    return;
  }

  var clev = player.LEVEL;
  if ((rnd(23) == 7) || (rnd(18) > player.INTELLIGENCE)) {
    appendLog("  It didn't work!");
    return;
  }
  if (clev * 3 + 2 < x) {
    appendLog("  Nothing happens.  You seem inexperienced at this");
    return;
  }

  switch (x) {
    /* ----- LEVEL 1 SPELLS ----- */

    case 0:
      /* protection field +2 */
      if (player.PROTECTIONTIME == 0) player.MOREDEFENSES += 2;
      player.PROTECTIONTIME += 250;
      return;

      // case 1:
      //   i = rnd(((clev + 1) << 1)) + clev + 3;
      //   godirect(x, i, (clev >= 2) ? "  Your missiles hit the %s" : "  Your missile hit the %s", 100, '+'); /* magic missile */
      //
      //   return;

    case 2:
      /* dexterity   */
      if (player.DEXCOUNT == 0) player.DEXTERITY += 3;
      player.DEXCOUNT += 400;
      return;

    case 3:
      /*    sleep   */
      prepare_direction_spell(spell_sleep);
      return;

    case 4:
      /*  charm monster   */
      player.CHARMCOUNT += player.CHARISMA << 1;
      return;

      // case 5:
      //   godirect(x, rnd(10) + 15 + clev, "  The sound damages the %s", 70, '@'); /* sonic spear */
      //   return;

      /* ----- LEVEL 2 SPELLS ----- */

    case 6:
      /* web */
      prepare_direction_spell(spell_web);
      return;

    case 7:
      /*  strength    */
      if (player.STRCOUNT == 0) player.STREXTRA += 3;
      player.STRCOUNT += 150 + rnd(100);
      return;

      // case 8:
      //   yl = playery - 5; /* enlightenment */
      //   yh = playery + 6;
      //   xl = playerx - 15;
      //   xh = playerx + 16;
      //   vxy( & xl, & yl);
      //   vxy( & xh, & yh); /* check bounds */
      //   for (i = yl; i <= yh; i++) /* enlightenment */
      //     for (j = xl; j <= xh; j++)
      //       know[j][i] = KNOWALL;
      //   draws(xl, xh + 1, yl, yh + 1);
      //   return;

    case 9:
      /* healing */
      raisehp(20 + (clev << 1));
      return;

    case 10:
      /* cure blindness   */
      player.BLINDCOUNT = 0;
      return;

    case 11:
      /* create monster   */
      createmonster(makemonst(player.level.depth + 1) + 8);
      return;

    case 12:
      /* phantasmal forces */
      prepare_direction_spell(spell_phantasmal);
      return;

    case 13:
      /* invisibility */
      let j = 0;
      for (let i = 0; i < 26; i++) {
        /* if he has the amulet of invisibility then add more time */
        if (player.inventory[i] != null && player.inventory[i].matches(OAMULET)) {
          j += 1 + player.inventory[i].arg;
        }
      }
      player.INVISIBILITY += (j << 7) + 12;
      return;

      /* ----- LEVEL 3 SPELLS ----- */

      // case 14:
      //   godirect(x, rnd(25 + clev) + 25 + clev, "  The fireball hits the %s", 40, '*');
      //   return; /*    fireball */
      //
      // case 15:
      //   godirect(x, rnd(25) + 20 + clev, "  Your cone of cold strikes the %s", 60, 'O'); /*  cold */
      //   return;

    case 16:
      /*  polymorph */
      prepare_direction_spell(spell_polymorph);
      return;

    case 17:
      /*  cancellation    */
      player.CANCELLATION += 5 + clev;
      return;

    case 18:
      /* haste self  */
      player.HASTESELF += 7 + clev;
      return;

    case 19:
      /* cloud kill */
      omnidirect(x, 30 + rnd(10), "gasps for air");
      return;

    case 20:
      /* vaporize rock */
      var xh = Math.min(player.x + 1, MAXX - 2);
      var yh = Math.min(player.y + 1, MAXY - 2);
      for (let i = Math.max(player.x - 1, 1); i <= xh; i++) {
        for (let j = Math.max(player.y - 1, 1); j <= yh; j++) {
          // kn = & know[i][j];
          var item = getItem(i, j);
          if (item.matches(OWALL)) {
            if (player.level.depth < MAXLEVEL + MAXVLEVEL - 1)
            //* p = * kn = 0;
              setItem(i, j, createObject(OEMPTY));
          } else if (item.matches(OSTATUE)) {
            if (player.HARDGAME < 3) {
              setItem(i, j, createObject(OBOOK, player.level.depth));
              //* kn = 0;
            }
          } else if (item.matches(OTHRONE)) {
            if (item.arg == 0) {
              create_guardian(GNOMEKING, i, j);
              item.arg = 1; // nullify the throne
            }
          } else if (item.matches(OALTAR)) {
            create_guardian(DEMONPRINCE, i, j);
          } else if (item.matches(OFOUNTAIN)) {
            create_guardian(WATERLORD, i, j);
          } else if (monsterAt(i, j) != null && monsterAt(i, j).matches(XORN)) {
            ifblind(i, j);
            hitm(i, j, 200);
          }
        }
      }
      return;

      /* ----- LEVEL 4 SPELLS ----- */

    case 21:
      /* dehydration */
      prepare_direction_spell(spell_dry);
      return;

      // case 22:
      //   godirect(x, rnd(25) + 20 + (clev << 1), "  A lightning bolt hits the %s", 1, '~'); /*  lightning */
      //   return;

    case 23:
      /* drain life */
      prepare_direction_spell(spell_drain);
      return;

    case 24:
      /* globe of invulnerability */
      if (player.GLOBE == 0) player.MOREDEFENSES += 10;
      player.GLOBE += 200;
      loseint();
      return;

    case 25:
      /* flood */
      omnidirect(x, 32 + clev, "struggles for air in your flood!");
      return;

    case 26:
      /* finger of death */
      if (rnd(151) != 63) {
        prepare_direction_spell(spell_finger);
      } else {
        beep();
        updateLog("Your heart stopped!");
        nap(4000);
        died(270);
      }
      return;

      /* ----- LEVEL 5 SPELLS ----- */

    case 27:
      /* scare monster */
      player.SCAREMONST += rnd(10) + clev;
      return;

    case 28:
      /* hold monster */
      player.HOLDMONST += rnd(10) + clev;
      return;

    case 29:
      /* time stop */
      player.TIMESTOP += rnd(20) + (clev << 1);
      return;

    case 30:
      /* teleport away */
      prepare_direction_spell(spell_teleport);
      return;

    case 31:
      /* magic fire */
      omnidirect(x, 35 + rnd(10) + clev, "cringes from the flame");
      return;

      /* ----- LEVEL 6 SPELLS ----- */

      // case 32:
      //   if ((rnd(23) == 5) && (wizard == 0)) /* sphere of annihilation */ {
      //     beep();
      //     lprcat("\nYou have been enveloped by the zone of nothingness!\n");
      //     nap(4000);
      //     died(258);
      //     return;
      //   }
      //   xl = playerx;
      //   yl = playery;
      //   loseint();
      //   i = dirsub( & xl, & yl); /* get direction of sphere */
      //   newsphere(xl, yl, i, rnd(20) + 11); /* make a sphere */
      //   return;
      //
      // case 33:
      //   genmonst();
      //   spelknow[33] = 0; /* genocide */
      //   loseint();
      //   return;

    case 34:
      /* summon demon */
      if (rnd(100) > 30) {
        prepare_direction_spell(spell_summon);
      } else if (rnd(100) > 15) {
        updateLog("  Nothing seems to have happened");
      } else {
        updateLog("  The demon turned on you and vanished!");
        beep();
        var i = rnd(40) + 30;
        lastnum = 277;
        losehp(i); /* must say killed by a demon */
      }
      return;

    case 35:
      /* walk through walls */
      player.WTW += rnd(10) + 5;
      return;

      // case 36:
      //   /* alter reality */ {
      //     struct isave * save; /* pointer to item save structure */
      //     int sc;
      //     sc = 0; /* # items saved */
      //     save = (struct isave * ) malloc(sizeof(struct isave) * MAXX * MAXY * 2);
      //     if (save == NULL) {
      //       lprcat("\nPolinneaus won't let you mess with his dungeon!");
      //       return;
      //     }
      //     for (j = 0; j < MAXY; j++)
      //       for (i = 0; i < MAXX; i++) /* save all items and monsters */ {
      //         xl = item[i][j];
      //         if (xl && xl != OWALL && xl != OANNIHILATION) {
      //           save[sc].type = 0;
      //           save[sc].id = item[i][j];
      //           save[sc++].arg = iarg[i][j];
      //         }
      //         if (mitem[i][j]) {
      //           save[sc].type = 1;
      //           save[sc].id = mitem[i][j];
      //           save[sc++].arg = hitp[i][j];
      //         }
      //         item[i][j] = OWALL;
      //         mitem[i][j] = 0;
      //         if (wizard)
      //           know[i][j] = KNOWALL;
      //         else
      //           know[i][j] = 0;
      //       }
      //     eat(1, 1);
      //     if (level == 1) item[33][MAXY - 1] = OENTRANCE;
      //     for (j = rnd(MAXY - 2), i = 1; i < MAXX - 1; i++) item[i][j] = 0;
      //     while (sc > 0) /* put objects back in level */ {
      //       --sc;
      //       if (save[sc].type == 0) {
      //         int trys;
      //         for (trys = 100, i = j = 1; --trys > 0 && item[i][j]; i = rnd(MAXX - 1), j = rnd(MAXY - 1));
      //         if (trys) {
      //           item[i][j] = save[sc].id;
      //           iarg[i][j] = save[sc].arg;
      //         }
      //       } else { /* put monsters back in */
      //         int trys;
      //         for (trys = 100, i = j = 1; --trys > 0 && (item[i][j] == OWALL || mitem[i][j]); i = rnd(MAXX - 1), j = rnd(MAXY - 1));
      //         if (trys) {
      //           mitem[i][j] = save[sc].id;
      //           hitp[i][j] = save[sc].arg;
      //         }
      //       }
      //     }
      //     loseint();
      //     draws(0, MAXX, 0, MAXY);
      //     if (wizard == 0) spelknow[36] = 0;
      //     free((char * ) save);
      //     positionplayer();
      //     return;
      //   }
      //
      // case 37:
      //   /* permanence */ adjtime(-99999 L);
      //   spelknow[37] = 0; /* forget */
      //   loseint();
      //   return;

    default:
      appendLog(`  spell ${x} not available!`);
      beep();
      return;
  };
}



function prepare_direction_spell(spell_function) {
  blocking_callback = getdirectioninput;
  keyboard_input_callback = spell_function;
  updateLog("In what direction? ");
}



function spell_sleep(direction) {
  var monster = getMonster(direction);
  var i = rnd(3) + 1;
  var str = `  While the ${monster} slept, you smashed it ${i} times`;
  direct(3 /*sleep*/ , direction, fullhit(i), str);
}



function spell_web(direction) {
  var monster = getMonster(direction);
  var i = rnd(3) + 2;
  var str = `  While the ${monster} is entangled, you hit ${i} times`;
  direct(6 /*web*/ , direction, fullhit(i), str);
}



function spell_phantasmal(direction) {
  var monster = getMonster(direction);
  if (rnd(11) + 7 <= player.WISDOM) {
    var str = `  The ${monster} believed!`;
    direct(12 /*phantasmal*/ , direction, rnd(20) + 20 + player.LEVEL, str)
  } else {
    updateLog("  It didn't believe the illusions!");
  }
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
  if (monster == null) {
    updateLog("  There wasn't anything there!");
    return;
  }

  ifblind(x, y);

  if (nospell(16 /*polymorph*/ , monster) == 0) {
    //while (monster[m = mitem[x][y] = rnd(MAXMONST + 7)].genocided);
    player.level.monsters[x][y] = null;
    createmonster(rnd(monsterlist.length - 1), x, y);
    //show1cell(x, y); /* show the new monster */
  } else {
    lasthx = x;
    lasthy = y;
  }
}



function spell_dry(direction) {
  var monster = getMonster(direction);
  var str = `  The ${monster} shrivels up`;
  direct(21 /*dehydration*/ , direction, 100 + player.LEVEL, str);
}



function spell_drain(direction) {
  var monster = getMonster(direction);
  var dam = Math.min(player.HP - 1, player.HPMAX / 2);
  direct(23 /*drainlife*/ , direction, dam + dam, ``);
  player.HP -= Math.round(dam);
}



function spell_finger(direction) {
  var monster = getMonster(direction);
  if (player.WISDOM > rnd(10) + 10) {
    direct(26 /*fingerofdeath*/ , direction, 2000, `  The ${monster}'s heart stopped`);
  } else {
    updateLog("  It didn't work");
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
  if (monster == null) {
    lprcat("  There wasn't anything there!");
    return;
  }
  ifblind(x, y);
  if (nospell(30 /*teleportaway*/ , monster) == 0) {
    fillmonst(monster.arg);
    player.level.monsters[x][y] = null;
    //know[x][y] &= ~KNOWHERE;
  } else {
    lasthx = x;
    lasthy = y;
    return;
  }
}



function spell_summon(direction) {
  var monster = getMonster(direction);
  direct(34 /*summondemon*/ , direction, 150, `  The demon strikes at the ${monster}`);
}



/*
    Create a guardian for a throne/altar/fountain, as a result of the player
    using a VPR spell or pulverization scroll on it.
*/
function create_guardian(monst, x, y) {
  /* prevent the guardian from being created on top of the player */
  if ((x == player.x) && (y == player.y)) {
    k = rnd(8);
    x += diroffx[k];
    y += diroffy[k];
  }
  // know[x][y] = 0;
  // mitem[x][y] = monst;
  // hitp[x][y] = monster[monst].hitpoints;
  createmonster(monst, x, y);
}



/*
 *  Routine to subtract 1 from your int (intelligence) if > 3
 *
 *  No arguments and no return value
 */
function loseint() {
  player.INTELLIGENCE = Math.max(player.INTELLIGENCE - 1, 3);
}



/*
 *  isconfuse()         Routine to check to see if player is confused
 *
 *  This routine prints out a message saying "You can't aim your magic!"
 *  returns 0 if not confused, non-zero (time remaining confused) if confused
 */
function isconfuse() {
  if (player.CONFUSE) {
    updateLog(" You can't aim your magic!");
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
  return 0;
  // register int tmp;
  // if (x >= SPNUM || monst >= MAXMONST + 8 || monst < 0 || x < 0) return (0); /* bad spell or monst */
  // if ((tmp = spelweird[monst - 1][x]) == 0) return (0);
  // cursors();
  // lprc('\n');
  // lprintf(spelmes[tmp], monster[monst].name);
  // return (1);
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
  if (player.WIELD != null && player.WIELD.matches(OLANCE)) return (10000); /* lance of death */
  var i = xx * ((player.WCLASS >> 1) + player.STRENGTH + player.STREXTRA - player.HARDGAME - 12 + player.MOREDAM);
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
function direct(spnum, direction, dam, str, arg) {
  //if (spnum < 0 || spnum >= SPNUM || str == 0) return; /* bad arguments */
  if (isconfuse()) {
    return;
  }
  //dirsub( & x, & y);
  var monster = getMonster(direction);

  if (monster == null) {
    updateLog("  There wasn't anything there!");
    return;
  }

  ifblind(x, y);

  if (getItemDir(direction).matches(OMIRROR)) {
    // TODO attack mirror
    // if (spnum == 3) /* sleep */ {
    //   lprcat("You fall asleep! ");
    //   beep();
    //   fool:
    //     arg += 2;
    //   while (arg-- > 0) {
    //     parse2();
    //     nap(1000);
    //   }
    //   return;
    // } else if (spnum == 6) /* web */ {
    //   lprcat("You get stuck in your own web! ");
    //   beep();
    //   goto fool;
    // } else {
    //   lastnum = 278;
    //   lprintf(str, "spell caster (thats you)", (long) arg);
    //   beep();
    //   losehp(dam);
    //   return;
    // }
  }
  if (nospell(spnum, monster) == 0) {
    updateLog(str);
    hitm(x, y, dam);
  } else {
    lasthx = x;
    lasthy = y;
    return;
  }
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
      if (monster != null) {
        if (nospell(spnum, monster) == 0) {
          ifblind(x, y);
          cursors();
          lprc('\n');
          updateLog(`  The ${monster} ${str}`);
          hitm(x, y, dam);
          nap(800);
        } else {
          lasthx = x;
          lasthy = y;
        }
      }
    }
  }
}



/*
 *  annihilate()    Routine to annihilate all monsters around player (playerx,playery)
 *
 *  Gives player experience, but no dropped objects
 *  Returns the experience gained from all monsters killed
 */
function annihilate() {
  var i, j;
  var k = 0;
  for (i = player.x - 1; i <= player.x + 1; i++) {
    for (j = player.y - 1; j <= player.y + 1; j++) {
      var monster = monsterAt(i, j);
      if (monster != null) { /* if a monster there */
        if (monster.arg < DEMONLORD + 2) {
          k += monster.experience;
          player.level.monsters[i][j] = null;
          //*p = know[i][j] &= ~KNOWHERE;
        } else {
          updateLog(`The ${monster} barely escapes being annihilated!`);
          monster.hitpoints = (monster.hitpoints >> 1) + 1; /* lose half hit points*/
        }
      }
    }
  }
  if (k > 0) {
    updateLog("You hear loud screams of agony!");
    player.raiseexperience(k);
  }
  return k;
}
