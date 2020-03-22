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

  if (ULARN) updateLog(`You read a scroll of ${SCROLL_NAMES[scroll.arg]}`);
  var printMessage = !ULARN;

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
      if (printMessage) updateLog(`  You have been granted enlightenment!`);
      var yh = Math.min(player.y + 7, MAXY);
      var xh = Math.min(player.x + 25, MAXX);
      var yl = Math.max(player.y - 7, 0);
      var xl = Math.max(player.x - 25, 0);
      for (let i = xl; i < xh; i++)
        for (let j = yl; j < yh; j++)
          player.level.know[i][j] = KNOWALL;
      //draws(xl, xh, yl, yh);
      break;

    case 3:
      /* blank paper */
      if (printMessage) updateLog(`  This scroll seems to be blank`);
      break;

    case 4:
      /* this one creates a monster */
      createmonster(makemonst(level + 1));
      break;

    case 5:
      /* create artifact */
      dropItemNearPlayer(createRandomitem(level));
      if (rnd(101) < 8) dropItemNearPlayer(createRandomitem(level)); // chance for 2 items
      break;

    case 6:
      /* aggravate monsters */
      if (printMessage) updateLog(`  Something isn't right...`);
      player.AGGRAVATE += 800;
      break;

    case 7:
      /* time warp */
      var warpTime = (rnd(1000) - 850);
      gtime += warpTime;
      if (ULARN && gtime < 0) gtime = 0;
      var mobuls = Math.abs(Math.round(warpTime / 100));
      debug(`timewarp: ${warpTime} ${mobuls}`);
      if (warpTime >= 0) {
        updateLog(`  You went forward in time by ${mobuls} mobul${mobuls==1?``:`s`}`);
      } else {
        updateLog(`  You went backward in time by ${mobuls} mobul${mobuls==1?``:`s`}`);
      }
      adjtime(warpTime); /* adjust time for time warping */
      break;

    case 8:
      /* teleportation */
      if (printMessage) updateLog(`  Your surroundings change`);
      oteleport(0);
      break;

    case 9:
      /* expanded awareness */
      if (printMessage) updateLog(`  You feel extra alert`);
      player.AWARENESS += 1800;
      break;

    case 10:
      /* haste monster */
      if (ULARN) updateLog(`  You feel nervous.`);
      else updateLog(`  Something isn't right...`);
      player.HASTEMONST += rnd(55) + 12;
      break;

    case 11:
      /* monster healing */
      if (ULARN) updateLog(`  You feel uneasy.`);
      else updateLog(`  Something isn't right...`);
      for (let j = 0; j < MAXY; j++)
        for (let i = 0; i < MAXX; i++)
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
      if (printMessage) updateLog(`  You have been granted enlightenment!`);
      revealLevel();
      break;

    case 16:
      /* hold monster */
      player.updateHoldMonst(30);
      break;

    case 17:
      /* gem perfection */
      if (printMessage) updateLog(`  You feel someone eyeing your belongings`);
      for (let i = 0; i < 26; i++) {
        let item = player.inventory[i];
        if (item && item.isGem()) {
          item.arg *= 2;
          item.arg = Math.min(255, item.arg);
        }
      }
      break;

    case 18:
      /* spell extension */
      if (printMessage) updateLog(`  You feel a twitch at the base of your skull`);
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
      if (printMessage) updateLog(`  You feel someone eyeing your belongings`);
      for (let i = 0; i < player.inventory.length; i++) {
        let item = player.inventory[i];
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
      removecurse(printMessage);
      break;

    case 21:
      /* scroll of annihilation */
      annihilate();
      break;

    case 22:
      /* pulverization */
      var pulverize_message = function (monster) {
        return `  The ray hits the ${monster}`;
      }
      var scroll_pulverize = function (direction) {
        setup_godirect(10, LIT /* same as LIT */ , direction, 150, ' ', pulverize_message);
      }
      prepare_direction_event(scroll_pulverize);
      break;

    case 23:
      /* life protection */
      if (printMessage) updateLog(`  You sense a benign presence`);
      player.LIFEPROT++;
      break;
  }
}



function removecurse(printMessage) {
  if (printMessage) updateLog(`  You sense a benign presence`);
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
}