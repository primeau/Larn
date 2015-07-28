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
      appendLog(" ignore");
      return;
    case 'r':
      appendLog(" read");
      if (player.BLINDCOUNT > 0) {
        cursors();
        updateLog("You can't read anything when you're blind!");
        return;
      }
      forget(); /* destroy scroll  */
      read_scroll(scroll);
      return;
    case 't':
      appendLog(" take");
      if (take(scroll)) {
        forget(); // remove from board
      }
      return;
  };
}



function act_read_something(index) {
  var useindex = getIndexFromChar(index);
  var item = player.inventory[useindex];
  if (item != null && item.matches(OSCROLL)) {
    player.inventory[useindex] = null;
    read_scroll(item);
  } else if (item != null && item.matches(OBOOK)) {
    player.inventory[useindex] = null;
    readbook(item);
  } else {
    if (item == null) {
      updateLog(`You don't have item ${index}`);
    } else {
      updateLog(`You can't read that!`);
    }
  }
  return 1;
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
      /* enchant armor */
      if (enchantarmor())
        updateLog("Your armor glows for a moment");
      break;

    case 1:
      /* enchant weapon */
      if (enchweapon())
        updateLog("Your weapon glows for a moment");
      break;

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
      break;

    case 3:
      updateLog("This scroll seems to be blank");
      break;

    case 4:
      /* this one creates a monster  */
      createmonster(makemonst(player.level.depth + 1));
      break;

    case 5:
      /* create artifact     */
      something(player.level.depth);
      break;

    case 6:
      /* aggravate monsters */
      player.AGGRAVATE += 800;
      break;

    case 7:
      updateLog("TODO: read_scroll(): time warp");
      // gtime += (i = rnd(1000) - 850); /* time warp */
      // if (i >= 0)
      //         lprintf("\nYou went forward in time by %d mobuls", (long) ((i + 99) / 100));
      // else
      //         lprintf("\nYou went backward in time by %d mobuls", (long) (-(i + 99) / 100));
      // adjtime((long) i); /* adjust time for time warping */
      break;

    case 8:
      /* teleportation */
      oteleport(0);
      break;

    case 9:
      /* expanded awareness   */
      player.AWARENESS += 1800;
      break;

    case 10:
      /* haste monster */
      player.HASTEMONST += rnd(55) + 12;
      break;

    case 11:
      /* monster healing */
      for (var i = 0; i < MAXY; i++)
        for (var j = 0; j < MAXX; j++)
          if (player.level.monsters[j][i] != null)
            player.level.monsters[j][i].hitpoints = monsterlist[player.level.monsters[j][i].arg].hitpoints;
      break;

    case 12:
      /* spirit protection */
      player.SPIRITPRO += 300 + rnd(200);
      break;

    case 13:
      /* undead protection */
      player.UNDEADPRO += 300 + rnd(200);
      break;

    case 14:
      /* stealth */
      player.STEALTH += 250 + rnd(250);
      break;

    case 15:
      /* magic mapping */
      updateLog("TODO: read_scroll(): magic mapping");
      // lprcat("\nYou have been granted enlightenment!");
      // for (i = 0; i < MAXY; i++)
      //         for (j = 0; j < MAXX; j++)
      //                 know[j][i] = KNOWALL;
      // draws(0, MAXX, 0, MAXY);
      break;

    case 16:
      /* hold monster */
      player.HOLDMONST += 30;
      break;

    case 17:
      /* gem perfection */
      for (var i = 0; i < 26; i++) {
        var item = player.inventory[i];
        if (item != null && item.isGem()) {
          item.arg &= 255;
          item.arg <<= 1;
          item.arg = Math.min(255, item.arg);
        }
      }
      break;

    case 18:
      /* spell extension */
      player.PROTECTIONTIME <<= 1;
      player.DEXCOUNT <<= 1;
      player.STRCOUNT <<= 1;
      player.CHARMCOUNT <<= 1;
      player.INVISIBILITY <<= 1;
      player.CANCELLATION <<= 1;
      player.HASTESELF <<= 1;
      player.GLOBE <<= 1;
      player.SCAREMONST <<= 1;
      player.HOLDMONST <<= 1;
      player.TIMESTOP <<= 1;
      break;

    case 19:
      /* identify */
      for (var i = 0; i < player.inventory.length; i++) {
        var item = player.inventory[i];
        if (item != null) {
          if (item.matches(OPOTION))
            learnPotion(item);
          if (item.matches(OSCROLL))
            learnScroll(item);
        }
      }
      break;

    case 20:
      /* remove curse */
      if (player.BLINDCOUNT > 0) player.BLINDCOUNT = 1;
      if (player.CONFUSE > 0) player.CONFUSE = 1;
      if (player.AGGRAVATE > 0) player.AGGRAVATE = 1;
      if (player.HASTEMONST > 0) player.HASTEMONST = 1;
      if (player.ITCHING > 0) player.ITCHING = 1;
      if (player.LAUGHING > 0) player.LAUGHING = 1;
      if (player.DRAINSTRENGTH > 0) player.DRAINSTRENGTH = 1;
      if (player.CLUMSINESS > 0) player.CLUMSINESS = 1;
      if (player.INFEEBLEMENT > 0) player.INFEEBLEMENT = 1;
      if (player.HALFDAM > 0) player.HALFDAM = 1;
      break;

    case 21:
      /* scroll of annihilation */
      annihilate();
      break;

    case 22:
      /* pulverization */
      updateLog("TODO: read_scroll(): pulverization");
      // godirect(22, 150, "The ray hits the %s", 0, ' ');
      break;

    case 23:
      /* life protection */
      player.LIFEPROT++;
      break;
  };
  // //player.level.paint(); /* show new stats      */
}
