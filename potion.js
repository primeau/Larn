"use strict";
/*
 *  function to return a potion number created with appropriate probability
 *  of occurrence
 *
 *  0 - sleep               1 - healing                 2 - raise level
 *  3 - increase ability    4 - gain wisdom             5 - gain strength
 *  6 - increase charisma   7 - dizziness               8 - learning
 *  9 - object detection    10 - monster detection      11 - forgetfulness
 *  12 - water              13 - blindness              14 - confusion
 *  15 - heroism            16 - sturdiness             17 - giant strength
 *  18 - fire resistance    19 - treasure finding       20 - instant healing
 *  21 - cure dianthroritis 22 - poison                 23 - see invisible
 */
const potprob = [
  0, 0, 1, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 9, 9, 9,
  10, 10, 10, 11, 11, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 19,
  20, 20, 22, 22, 23, 23
];

/*  name array for magic potions    */
const potionname = [
  "sleep", "healing", "raise level",
  "increase ability", "wisdom", "strength",
  "raise charisma", "dizziness", "learning",
  "object detection", "monster detection", "forgetfulness",
  "water", "blindness", "confusion",
  "heroism", "sturdiness", "giant strength",
  "fire resistance", "treasure finding", "instant healing",
  "cure dianthroritis", "poison", "see invisible"
];


var knownPotions = [];

function isKnownPotion(item) {
  if (item.matches(OPOTION)) {
    if (knownPotions[item.arg] || DEBUG_KNOW_ALL) {
      return true;
    }
  }
  return false;
}

function learnPotion(item) {
  if (item.matches(OPOTION)) {
    knownPotions[item.arg] = item;
  }
}

function newpotion() {
  var potion = rund(41);
  debug("newpotion(): created: " + potionname[potprob[potion]]);
  return potprob[potion];
}


// TODO  quaffpotion, readscroll, eatcookie are all very similar
function act_quaffpotion(index) {
  var useindex = getIndexFromChar(index);
  var item = player.inventory[useindex];
  if (item != null && item.matches(OPOTION)) {
    player.inventory[useindex] = null;
    quaffpotion(item);
  } else {
    if (item == null) {
      //debug(useindex);
      if (index == '*' || index == ' ') {
        if (!IN_STORE) {
          showinventory(true, act_quaffpotion, showquaff, false, false);
        } else {
          IN_STORE = false;
          paint();
        }
        nomove = 1;
        return;
      }

      if (useindex >= 0 && useindex < 26) {
        updateLog(`  You don't have item ${index}!`);
      }
      if (useindex <= -1) {
        appendLog(` cancelled`);
      }
    } else {
      updateLog(`  You can't quaff that!`);
    }
  }
  IN_STORE = false;
  return 1;
}



/*
 * function to drink a potion
 *
 * Also used to perform the action of a potion without quaffing a potion (see
 * invisible capability when drinking from a fountain).
 */
function quaffpotion(potion, set_known) {
  /* check for within bounds */
  if (potion == null)
    return;

  /*
   * if player is to know this potion (really quaffing one), make it
   * known
   */
  if (set_known) {
    learnPotion(potion);
  }

  switch (potion.arg) {
    case 0:
      /* sleep */
      updateLog("  You fall asleep. . .");
      var sleeplen = rnd(11) - (player.CONSTITUTION >> 2) + 2;
      while (--sleeplen > 0) {
        parse2();
        nap(1000);
      }
      updateLog("  You woke up!");
      break;

    case 1:
      /* healing */
      if (player.HP == player.HPMAX) {
        player.raisemhp(1);
      } else {
        player.raisehp(rnd(20) + 20 + player.LEVEL);
      }
      updateLog("  You feel better");
      break;

    case 2:
      /* raise level */
      player.raiselevel();
      player.raisemhp(1);
      updateLog("  Suddenly, you feel much more skillful!");
      break;

    case 3:
      /* increase ability */
      switch (rund(6)) {
        case 0:
          player.STRENGTH++;
          break;
        case 1:
          player.INTELLIGENCE++;
          break;
        case 2:
          player.WISDOM++;
          break;
        case 3:
          player.CONSTITUTION++;
          break;
        case 4:
          player.DEXTERITY++;
          break;
        case 5:
          player.CHARISMA++;
          break;
      };
      updateLog("  You feel strange for a moment");
      break;

    case 4:
      /* wisdom */
      player.WISDOM += rnd(2);
      updateLog("  You feel more self confident!");
      break;

    case 5:
      /* strength */
      player.STRENGTH = Math.max(12, player.STRENGTH + 1);
      updateLog("  Wow!  You feel great!");
      break;

    case 6:
      /* charisma */
      player.CHARISMA++;
      updateLog("  Your charm went up by one!");
      break;

    case 7:
      /* dizziness */
      player.STRENGTH = Math.max(3, player.STRENGTH - 1);
      updateLog("  You become dizzy!");
      break;

    case 8:
      /* intelligence */
      player.INTELLIGENCE++;
      updateLog("  Your intelligence went up by one!");
      break;

    case 9:
      /* object detection */
      updateLog("  You sense the presence of objects!");
      nap(1000);
      if (player.BLINDCOUNT > 0)
        return;
      for (var i = 0; i < MAXX; i++)
        for (var j = 0; j < MAXY; j++) {
          var item = getItem(i, j);
          if (item.carry &&
            !item.isGem() &&
            !item.matches(OLARNEYE) &&
            !item.matches(OGOLDPILE)) {
            player.level.know[i][j] = HAVESEEN;
            show1cell(i, j);
          }
        }
      showplayer();
      break;

    case 10:
      /* monster detection */
      updateLog("  You detect the presence of monsters!");
      nap(1000);
      if (player.BLINDCOUNT > 0)
        return;
      for (var i = 0; i < MAXX; i++)
        for (var j = 0; j < MAXY; j++) {
          var monster = monsterAt(i, j);
          if (monster != null && (monster.getChar() != OEMPTY.char)) {
            player.level.know[i][j] = HAVESEEN;
            show1cell(i, j);
          }
        }
      break;

    case 11:
      /* potion of forgetfulness */
      updateLog("  You stagger for a moment . .");
      for (var i = 0; i < MAXX; i++)
        for (var j = 0; j < MAXY; j++) {
          player.level.know[i][j] = 0;
          nap(1000);
        }
        //draws(0, MAXX, 0, MAXY);
      break;

    case 12:
      /* water */
      updateLog("  This potion has no taste to it");
      break;

    case 13:
      /* blindness */
      player.BLINDCOUNT += 500;
      updateLog("  You can't see anything!");
      break;

    case 14:
      player.CONFUSE += 20 + rnd(9);
      updateLog("  You feel confused");
      break;

    case 15:
      if (player.HERO == 0) {
        player.STRENGTH += 11;
        player.INTELLIGENCE += 11;
        player.WISDOM += 11;
        player.CONSTITUTION += 11;
        player.DEXTERITY += 11;
        player.CHARISMA += 11;
      }
      player.HERO += 250;
      updateLog("  WOW!!!  You feel Super-fantastic!!!");
      break;

    case 16:
      player.CONSTITUTION++;
      updateLog("  You have a greater intestinal constitude!");
      break;

    case 17:
      if (player.GIANTSTR == 0)
        player.STREXTRA += 21;
      player.GIANTSTR += 700;
      updateLog("  You now have incredibly bulging muscles!!!");
      break;

    case 18:
      player.FIRERESISTANCE += 1000;
      updateLog("  You feel a chill run up your spine!");
      break;

    case 19:
      updateLog("  You feel greedy . . .");
      nap(1000);
      if (player.BLINDCOUNT > 0)
        return;
      for (var i = 0; i < MAXX; i++)
        for (var j = 0; j < MAXY; j++) {
          var item = getItem(i, j);
          if (item.isGem() || item.matches(OLARNEYE) || item.matches(OGOLDPILE)) {
            player.level.know[i][j] = HAVESEEN;
            show1cell(i, j);
          }
        }
      showplayer();
      break;

    case 20:
      /* instant healing */
      lprcat("  You feel all better now!");
      player.HP = player.HPMAX;
      break;

    case 21:
      /* cure dianthroritis */
      updateLog("  You don't seem to be affected");
      break;

    case 22:
      /* poison */
      player.HALFDAM += 200 + rnd(200);
      updateLog("  You feel a sickness engulf you");
      break;

    case 23:
      /* see invisible */
      player.SEEINVISIBLE += rnd(1000) + 400;
      monsterlist[INVISIBLESTALKER].char = 'I';
      updateLog("  You feel your vision sharpen");
      break;
  };
}
