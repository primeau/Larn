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

      // case 3:
      //   i = rnd(3) + 1;
      //   p = "  While the %s slept, you smashed it %d times";
      //   ws: direct(x, fullhit(i), p, i); /*    sleep   */
      //   return;

    case 4:
      /*  charm monster   */
      player.CHARMCOUNT += player.CHARISMA << 1;
      return;

      // case 5:
      //   godirect(x, rnd(10) + 15 + clev, "  The sound damages the %s", 70, '@'); /* sonic spear */
      //   return;
      //
      //   /* ----- LEVEL 2 SPELLS ----- */
      //
      // case 6:
      //   i = rnd(3) + 2;
      //   p = "  While the %s is entangled, you hit %d times";
      //   goto ws; /* web */

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

      // case 12:
      //   if (rnd(11) + 7 <= c[WISDOM]) direct(x, rnd(20) + 20 + clev, "  The %s believed!", 0);
      //   else lprcat("  It didn't believe the illusions!");
      //   return;

    case 13:
      /* invisibility */
      /* if he has the amulet of invisibility then add more time */
      let j = 0;
      for (let i = 0; i < 26; i++) {
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
      //
      // case 16:
      //   dirpoly(x);
      //   return; /*  polymorph */

    case 17:
      /*  cancellation    */
      player.CANCELLATION += 5 + clev;
      return;

    case 18:
      /* haste self  */
      player.HASTESELF += 7 + clev;
      return;

      // case 19:
      //   omnidirect(x, 30 + rnd(10), "  The %s gasps for air"); /* cloud kill */
      //   return;

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

      // case 21:
      //   direct(x, 100 + clev, "  The %s shrivels up", 0); /* dehydration */
      //   return;
      //
      // case 22:
      //   godirect(x, rnd(25) + 20 + (clev << 1), "  A lightning bolt hits the %s", 1, '~'); /*  lightning */
      //   return;
      //
      // case 23:
      //   i = min(c[HP] - 1, c[HPMAX] / 2); /* drain life */
      //   direct(x, i + i, "", 0);
      //   c[HP] -= i;
      //   return;

    case 24:
      /* globe of invulnerability */
      if (player.GLOBE == 0) player.MOREDEFENSES += 10;
      player.GLOBE += 200;
      loseint();
      return;

      // case 25:
      //   omnidirect(x, 32 + clev, "  The %s struggles for air in your flood!"); /* flood */
      //   return;
      //
      // case 26:
      //   if (rnd(151) == 63) {
      //     beep();
      //     lprcat("\nYour heart stopped!\n");
      //     nap(4000);
      //     died(270);
      //     return;
      //   }
      //   if (c[WISDOM] > rnd(10) + 10) direct(x, 2000, "  The %s's heart stopped", 0); /* finger of death */
      //   else lprcat("  It didn't work");
      //   return;
      //
      //   /* ----- LEVEL 5 SPELLS ----- */

    case 27:
      /* scare monster */
      player.SCAREMONST += rnd(10) + clev;
      return;

    case 28:
      /* hold monster */
      player.HOLDMONST += rnd(10) + clev;
      return;

    case 29:
      player.TIMESTOP += rnd(20) + (clev << 1);
      return; /* time stop */

      // case 30:
      //   tdirect(x);
      //   return; /* teleport away */
      //
      // case 31:
      //   omnidirect(x, 35 + rnd(10) + clev, "  The %s cringes from the flame"); /* magic fire */
      //   return;
      //
      //   /* ----- LEVEL 6 SPELLS ----- */
      //
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
      //
      // case 34:
      //   /* summon demon */
      //   if (rnd(100) > 30) {
      //     direct(x, 150, "  The demon strikes at the %s", 0);
      //     return;
      //   }
      //   if (rnd(100) > 15) {
      //     lprcat("  Nothing seems to have happened");
      //     return;
      //   }
      //   lprcat("  The demon turned on you and vanished!");
      //   beep();
      //   i = rnd(40) + 30;
      //   lastnum = 277;
      //   losehp(i); /* must say killed by a demon */
      //   return;

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
 *  annihilate()    Routine to annihilate all monsters around player (playerx,playery)
 *
 *  Gives player experience, but no dropped objects
 *  Returns the experience gained from all monsters killed
 */
function annihilate() {
  var i, j;
  var k = 0;
  for (i = player.x - 1; i <= player.x + 1 ; i++) {
    for (j = player.y - 1 ; j <= player.y + 1 ; j++) {
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
