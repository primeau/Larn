'use strict';


function isKnownScroll(item, tempPlayer) {
  if (!tempPlayer) tempPlayer = player;
  if (item.matches(OSCROLL)) {
    if (tempPlayer.knownScrolls[item.arg]) {
      return true;
    }
  }
  return false;
}



function learnScroll(item) {
  if (item.matches(OSCROLL)) {
    player.knownScrolls[item.arg] = item;
  }
}



// TODO  quaffpotion, readscroll, eatcookie are all very similar
function act_read_something(index) {
  var useindex = getIndexFromChar(index);
  var item = player.inventory[useindex];
  if (item && item.matches(OSCROLL)) {
    player.inventory[useindex] = null;
    read_scroll(item);
  } else if (item && item.matches(OBOOK)) {
    player.inventory[useindex] = null;
    readbook(item);
  } else {
    if (!item) {

      if (index == '*' || index == ' ' || index == 'I') {
        if (mazeMode) {
          showinventory(true, act_read_something, showread, false, false, true);
        } else {
          setMazeMode(true);
        }
        nomove = 1;
        return 0;
      }

      if (useindex >= 0 && useindex < 26) {
        updateLog(`  You don't have item ${index}!`);
      }
      if (useindex <= -1) {
        appendLog(` cancelled`);
        nomove = 1;
      }
    } else {
      updateLog(`  You can't read that!`);
    }
  }
  setMazeMode(true);
  return 1;
}



/*
 * function to read a scroll
 */
function read_scroll(scroll) {
  if (!scroll) {
    return; /* be sure we are within bounds */
  }
  learnScroll(scroll);

  switch (scroll.arg) {
    case 0:
      /* enchant armor */
      enchantarmor(ENCH_SCROLL);
      break;

    case 1:
      /* enchant weapon */
      enchweapon(ENCH_SCROLL);
      break;

    case 2:
      /* enlightenment */
      updateLog(`  You have been granted enlightenment!`);
      var yh = Math.min(player.y + 7, MAXY);
      var xh = Math.min(player.x + 25, MAXX);
      var yl = Math.max(player.y - 7, 0);
      var xl = Math.max(player.x - 25, 0);
      for (var i = xl; i < xh; i++)
        for (var j = yl; j < yh; j++)
          player.level.know[i][j] = KNOWALL;
      //draws(xl, xh, yl, yh);
      break;

    case 3:
      /* blank paper */
      updateLog(`  This scroll seems to be blank`);
      break;

    case 4:
      /* this one creates a monster */
      createmonster(makemonst(level + 1));
      break;

    case 5:
      /* create artifact */
      something(level, true);
      break;

    case 6:
      /* aggravate monsters */
      updateLog(`  Something isn't right...`);
      player.AGGRAVATE += 800;
      break;

    case 7:
      /* time warp */
      var i = rnd(1000) - 850;
      gtime += i;
      var mobuls = Math.abs(Math.round(i / 100));
      if (i >= 0)
        updateLog(`  You went forward in time by ${mobuls} mobuls`);
      else
        updateLog(`  You went backward in time by ${mobuls} mobuls`);
      adjtime(i); /* adjust time for time warping */
      break;

    case 8:
      /* teleportation */
      updateLog(`  Your surroundings change`);
      oteleport(0);
      break;

    case 9:
      /* expanded awareness */
      updateLog(`  You feel extra alert`);
      player.AWARENESS += 1800;
      break;

    case 10:
      /* haste monster */
      updateLog(`  Something isn't right...`);
      player.HASTEMONST += rnd(55) + 12;
      break;

    case 11:
      /* monster healing */
      updateLog(`  Something isn't right...`);
      for (var j = 0; j < MAXY; j++)
        for (var i = 0; i < MAXX; i++)
          if (player.level.monsters[i][j])
            player.level.monsters[i][j].hitpoints = monsterlist[player.level.monsters[i][j].arg].hitpoints;
      break;

    case 12:
      /* spirit protection */
      player.updateSpiritPro(300 + rnd(200));
      break;

    case 13:
      /* undead protection */
      player.updateUndeadPro(300 + rnd(200));
      break;

    case 14:
      /* stealth */
      player.updateStealth(250 + rnd(250));
      break;

    case 15:
      /* magic mapping */
      updateLog(`  You have been granted enlightenment!`);
      for (var i = 0; i < MAXX; i++)
        for (var j = 0; j < MAXY; j++)
          player.level.know[i][j] = KNOWALL;
      //draws(0, MAXX, 0, MAXY);
      break;

    case 16:
      /* hold monster */
      player.updateHoldMonst(30);
      break;

    case 17:
      /* gem perfection */
      updateLog(`  You feel someone eyeing your belongings`);
      for (var i = 0; i < 26; i++) {
        var item = player.inventory[i];
        if (item && item.isGem()) {
          item.arg *= 2;
          item.arg = Math.min(255, item.arg);
        }
      }
      break;

    case 18:
      /* spell extension */
      updateLog(`  You feel a twitch at the base of your skull`);
      player.updateCharmCount(player.CHARMCOUNT);
      player.updateTimeStop(player.TIMESTOP);
      player.updateHoldMonst(player.HOLDMONST);
      player.updateDexCount(player.DEXCOUNT);
      player.updateStrCount(player.STRCOUNT);
      player.updateScareMonst(player.SCAREMONST);
      player.updateHasteSelf(player.HASTESELF);
      player.updateCancellation(player.CANCELLATION);
      player.updateInvisibility(player.INVISIBILITY);
      player.updateProtectionTime(player.PROTECTIONTIME);
      player.updateWTW(player.WTW); // BUGFIX in v12.4.5
      player.GLOBE <<= 1;
      break;

    case 19:
      /* identify */
      updateLog(`  You feel someone eyeing your belongings`);
      for (var i = 0; i < player.inventory.length; i++) {
        var item = player.inventory[i];
        if (item) {
          if (item.matches(OPOTION))
            learnPotion(item);
          if (item.matches(OSCROLL))
            learnScroll(item);
        }
      }
      break;

    case 20:
      /* remove curse */
      updateLog(`  You sense a benign presence`);
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
      var pulverize_message = function(monster) {
        return `  The ray hits the ${monster}`;
      }
      var scroll_pulverize = function(direction) {
        setup_godirect(10, LIT /* same as LIT */ , direction, 150, ' ', pulverize_message);
      }
      prepare_direction_event(scroll_pulverize);
      break;

    case 23:
      /* life protection */
      updateLog(`  You sense a benign presence`);
      player.LIFEPROT++;
      break;
  };
}
