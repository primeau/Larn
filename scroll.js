"use strict";
/*
 *  function to create scroll numbers with appropriate probability of
 *  occurrence
 *
 *  0 - armor           1 - weapon      2 - enlightenment   3 - paper
 *  4 - create monster  5 - create item 6 - aggravate       7 - time warp
 *  8 - teleportation   9 - expanded awareness              10 - haste monst
 *  11 - heal monster   12 - spirit protection      13 - undead protection
 *  14 - stealth        15 - magic mapping          16 - hold monster
 *  17 - gem perfection 18 - spell extension        19 - identify
 *  20 - remove curse   21 - annihilation           22 - pulverization
 *  23 - life protection
 */
var scprob = [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3,
  3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9,
  9, 9, 10, 10, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13, 13, 14, 14,
  15, 15, 16, 16, 16, 17, 17, 18, 18, 19, 19, 19, 20, 20, 20, 20, 21, 22,
  22, 22, 23
];

/*  name array for magic scrolls    */
var scrollname = [
  "enchant armor", "enchant weapon", "enlightenment",
  "blank paper", "create monster", "create artifact",
  "aggravate monsters", "time warp", "teleportation",
  "expanded awareness", "haste monsters", "monster healing",
  "spirit protection", "undead protection", "stealth",
  "magic mapping", "hold monsters", "gem perfection",
  "spell extension", "identify", "remove curse",
  "annihilation", "pulverization", "life protection"
];

var knownScrolls = [];

function isKnownScroll(item) {
  if (item.matches(OSCROLL)) {
    if (knownScrolls.indexOf(item.arg) >= 0) {
      return true;
    }
  }
  return false;
}

function learnScroll(item) {
  if (item.matches(OSCROLL)) {
    knownScrolls.push(item.arg);
  }
}

function newscroll() {
  var scroll = rund(81);
  debug("newscroll(): created: " + scrollname[scprob[scroll]]);
  return scprob[scroll];
}


/*
 * function to process a potion. or a keypress related
 */
function oscroll(key) {
  var scroll = getItem(player.x, player.y);
  if (scroll == null) {
    debug("oscroll: couldn't find it!");
    return;
  }
  switch (key) {
    // TODO don't allow reading scrolls if blind!
    case ESC:
    case 'i':
      updateLog("ignore");
      return;
    case 'r':
      updateLog("read");
      forget(); /* destroy scroll  */
      read_scroll(scroll);
      return;
    case 't':
      updateLog("take");
      if (take(scroll)) {
        forget(); // remove from board
      }
      return;
  };
}

/*
 * function to read a scroll
 */
function read_scroll(scroll) {
  if (scroll == null) {
    return; /* be sure we are within bounds */
  }
  learnScroll(scroll);

  switch (scroll.arg) {
    case 0:
      lprcat("Your armor glows for a moment");
      enchantarmor();
      return;

    case 1:
      lprcat("Your weapon glows for a moment");
      enchweapon();
      return; /* enchant weapon */

    case 2:
      updateLog("TODO: read_scroll(): enlightenment");
      // lprcat("\nYou have been granted enlightenment!");
      // yh = min(playery + 7, MAXY);
      // xh = min(playerx + 25, MAXX);
      // yl = max(playery - 7, 0);
      // xl = max(playerx - 25, 0);
      // for (i = yl; i < yh; i++)
      //         for (j = xl; j < xh; j++)
      //                 know[j][i] = KNOWALL;
      // draws(xl, xh, yl, yh);
      return;

    case 3:
      updateLog("This scroll seems to be blank");
      return;

    case 4:
      createmonster(makemonst(player.level.depth + 1));
      return; /* this one creates a monster  */

    case 5:
      updateLog("TODO: read_scroll(): create artifact");
      // something(level); /* create artifact     */
      return;

    case 6:
      player.AGGRAVATE += 800;
      return; /* aggravate monsters */

    case 7:
      updateLog("TODO: read_scroll(): time warp");
      // gtime += (i = rnd(1000) - 850); /* time warp */
      // if (i >= 0)
      //         lprintf("\nYou went forward in time by %d mobuls", (long) ((i + 99) / 100));
      // else
      //         lprintf("\nYou went backward in time by %d mobuls", (long) (-(i + 99) / 100));
      // adjtime((long) i); /* adjust time for time warping */
      return;

    case 8:
      oteleport(0);
      return; /* teleportation */

    case 9:
      player.AWARENESS += 1800;
      return; /* expanded awareness   */

    case 10:
      player.HASTEMONST += rnd(55) + 12;
      return; /* haste monster */

    case 11:
      updateLog("TODO: read_scroll(): monster healing");
      // for (i = 0; i < MAXY; i++)
      //         for (j = 0; j < MAXX; j++)
      //                 if (mitem[j][i])
      //                         hitp[j][i] = monster[mitem[j][i]].hitpoints;
      return; /* monster healing */

    case 12:
      player.SPIRITPRO += 300 + rnd(200);
      return; /* spirit protection */

    case 13:
      player.UNDEADPRO += 300 + rnd(200);
      return; /* undead protection */

    case 14:
      player.STEALTH += 250 + rnd(250);
      return; /* stealth */

    case 15:
      updateLog("TODO: read_scroll(): magic mapping");
      // lprcat("\nYou have been granted enlightenment!"); /* magic mapping */
      // for (i = 0; i < MAXY; i++)
      //         for (j = 0; j < MAXX; j++)
      //                 know[j][i] = KNOWALL;
      // draws(0, MAXX, 0, MAXY);
      return;

    case 16:
      player.HOLDMONST += 30;
      return; /* hold monster */

    case 17:
      updateLog("TODO: read_scroll(): gem perfection");
      // for (i = 0; i < 26; i++) /* gem perfection */
      //         switch (iven[i])
      //         {
      //         case ODIAMOND:
      //         case ORUBY:
      //         case OEMERALD:
      //         case OSAPPHIRE:
      //                 j = ivenarg[i];
      //                 j &= 255;
      //                 j <<= 1;
      //                 if (j > 255)
      //                         j = 255; /* double value */
      //                 ivenarg[i] = j;
      //                 break;
      //         }
      break;

    case 18:
      updateLog("TODO: read_scroll(): spell extension");
      // for (i = 0; i < 11; i++)
      //         c[exten[i]] <<= 1; /* spell extension */
      break;

    case 19:
      updateLog("TODO: read_scroll(): identify");
      // for (i = 0; i < 26; i++) /* identify */
      // {
      //         if (iven[i] == OPOTION)
      //                 potionname[ivenarg[i]][0] = ' ';
      //         if (iven[i] == OSCROLL)
      //                 scrollname[ivenarg[i]][0] = ' ';
      // }
      break;

    case 20:
      updateLog("TODO: read_scroll(): remove curse");
      // for (i = 0; i < 10; i++) /* remove curse */
      //         if (c[curse[i]])
      //                 c[curse[i]] = 1;
      break;

    case 21:
      updateLog("TODO: read_scroll(): annihilation");
      // annihilate();
      break; /* scroll of annihilation */

    case 22:
      updateLog("TODO: read_scroll(): pulverization");
      // godirect(22, 150, "The ray hits the %s", 0, ' '); /* pulverization */
      break;

    case 23:
      player.LIFEPROT++;
      break; /* life protection */
  };
}
