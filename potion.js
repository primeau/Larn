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


var knownPotions = [21]; // always know cure dianthroritis

function isKnownPotion(item) {
  // debug("isKnownPotion(): " + item.arg);
  // debug("isKnownPotion(): " + knownPotions);
  if (item.matches(OPOTION)) {
    if (knownPotions.indexOf(item.arg) >= 0) {
      return true;
    }
  }
  return false;
}

function learnPotion(item) {
  // debug("learnPotion(): " + item.arg);
  // debug("learnPotion(): " + knownPotions);
  if (item.matches(OPOTION)) {
    knownPotions.push(item.arg);
  }
}

function newpotion() {
  var potion = rund(41);
  debug("newpotion(): created: " + potionname[potprob[potion]]);
  return potprob[potion];
}


/*
 * function to process a potion. or a keypress related
 */
function opotion(key) {
  var potion = getItem(player.x, player.y);
  if (potion == null) {
    debug("opotion: couldn't find it!");
    return;
  }
  switch (key) {
    case ESC:
    case 'i':
      appendLog(" ignore");
      return;

    case 'q':
      appendLog(" quaff");
      forget(); /* destroy potion  */
      quaffpotion(potion, true);
      return;

    case 't':
      appendLog(" take");
      if (take(potion)) {
        forget(); // remove from board
      }
      return;
  };
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
    case 0: // sleep
      updateLog("You fall asleep. . .");
      var sleeplen = rnd(11) - (player.CONSTITUTION >> 2) + 2;
      while (--sleeplen > 0) {
        parse2();
        nap(1000);
      }
      updateLog("You woke up!");
      return;

    case 1: // healing
      if (player.HP == player.HPMAX) {
        player.raisemhp(1);
      } else {
        player.raisehp(rnd(20) + 20 + player.LEVEL);
      }
      updateLog("You feel better");
      break;

    case 2: // raise level
      player.raiselevel();
      player.raisemhp(1);
      updateLog("Suddenly, you feel much more skillful!");
      return;

    case 3: // increase ability
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
      updateLog("You feel strange for a moment");
      break;

    case 4: // wisdom
      player.WISDOM += rnd(2);
      updateLog("You feel more self confident!");
      break;

    case 5: // strength
      player.STRENGTH = Math.max(12, player.STRENGTH + 1);
      updateLog("Wow!  You feel great!");
      break;

    case 6: // charisma
      player.CHARISMA++;
      updateLog("Your charm went up by one!");
      break;

    case 7: // dizziness
      player.STRENGTH = Math.max(3, player.STRENGTH - 1);
      updateLog("You become dizzy!");
      break;

    case 8: // intelligence
      player.INTELLIGENCE++;
      updateLog("Your intelligence went up by one!");
      break;

    case 9:
      updateLog("TODO: quaffpotion(): object detection");
      // updateLog("You sense the presence of objects!");
      // nap(1000);
      // if (c[BLINDCOUNT])
      //   return;
      // for (i = 0; i < MAXY; i++)
      //   for (j = 0; j < MAXX; j++)
      //     switch (item[j][i]) {
      //       case OPLATE:
      //       case OCHAIN:
      //       case OLEATHER:
      //       case ORING:
      //       case OSTUDLEATHER:
      //       case OSPLINT:
      //       case OPLATEARMOR:
      //       case OSSPLATE:
      //       case OSHIELD:
      //       case OSWORDofSLASHING:
      //       case OHAMMER:
      //       case OSWORD:
      //       case O2SWORD:
      //       case OSPEAR:
      //       case ODAGGER:
      //       case OBATTLEAXE:
      //       case OLONGSWORD:
      //       case OFLAIL:
      //       case OLANCE:
      //       case ORINGOFEXTRA:
      //       case OREGENRING:
      //       case OPROTRING:
      //       case OENERGYRING:
      //       case ODEXRING:
      //       case OSTRRING:
      //       case OCLEVERRING:
      //       case ODAMRING:
      //       case OBELT:
      //       case OSCROLL:
      //       case OPOTION:
      //       case OBOOK:
      //       case OCHEST:
      //       case OAMULET:
      //       case OORBOFDRAGON:
      //       case OSPIRITSCARAB:
      //       case OCUBEofUNDEAD:
      //       case ONOTHEFT:
      //       case OCOOKIE:
      //         know[j][i] = HAVESEEN;
      //         show1cell(j, i);
      //         break;
      //     }
      // showplayer();
      return;

    case 10:
      /* monster detection */
      updateLog("TODO: quaffpotion(): monster detection");
      // updateLog("You detect the presence of monsters!");
      // nap(1000);
      // if (c[BLINDCOUNT])
      //   return;
      // for (i = 0; i < MAXY; i++)
      //   for (j = 0; j < MAXX; j++)
      //     if (mitem[j][i] && (monstnamelist[mitem[j][i]] != floorc)) {
      //       know[j][i] = HAVESEEN;
      //       show1cell(j, i);
      //     }
      return;

    case 11:
      updateLog("TODO: quaffpotion(): forgetfulness");
      // lprcat("\nYou stagger for a moment . .");
      // for (i = 0; i < MAXY; i++)
      //   for (j = 0; j < MAXX; j++)
      //     know[j][i] = 0;
      // nap(1000);
      // draws(0, MAXX, 0, MAXY); /* potion of forgetfulness */
      return;

    case 12: // water
      updateLog("This potion has no taste to it");
      return;

    case 13:
      updateLog("You can't see anything!"); /* blindness */
      player.BLINDCOUNT += 500;
      return;

    case 14:
      lprcat("You feel confused");
      player.CONFUSE += 20 + rnd(9);
      return;

    case 15:
      updateLog("WOW!!!  You feel Super-fantastic!!!");
      if (player.HERO == 0) {
        player.STRENGTH += 11;
        player.INTELLIGENCE += 11;
        player.WISDOM += 11;
        player.CONSTITUTION += 11;
        player.DEXTERITY += 11;
        player.CHARISMA += 11;
      }
      player.HERO += 250;
      break;

    case 16:
      player.CONSTITUTION++;
      updateLog("You have a greater intestinal constitude!");
      break;

    case 17:
      updateLog("You now have incredibly bulging muscles!!!");
      if (player.GIANTSTR == 0)
        player.STREXTRA += 21;
      player.GIANTSTR += 700;
      break;

    case 18:
      player.FIRERESISTANCE += 1000;
      updateLog("You feel a chill run up your spine!");
      break;

    case 19:
      updateLog("TODO: quaffpotion(): treasure finding");
      // lprcat("\nYou feel greedy . . .");
      // nap(1000);
      // if (c[BLINDCOUNT])
      //   return;
      // for (i = 0; i < MAXY; i++)
      //   for (j = 0; j < MAXX; j++) {
      //     k = item[j][i];
      //     if ((k == ODIAMOND) ||
      //       (k == ORUBY) ||
      //       (k == OEMERALD) ||
      //       (k == OMAXGOLD) ||
      //       (k == OSAPPHIRE) ||
      //       (k == OLARNEYE) ||
      //       (k == OGOLDPILE)) {
      //       know[j][i] = HAVESEEN;
      //       show1cell(j, i);
      //     }
      //   }
      // showplayer();
      return;

    case 20: // instant healing
      player.HP = player.HPMAX;
      break;

    case 21: // cure dianthroritis
      updateLog("You don't seem to be affected");
      return;

    case 22:
      player.HALFDAM += 200 + rnd(200);
      updateLog("You feel a sickness engulf you"); /* poison */
      return;

    case 23:
      lprcat("\nYou feel your vision sharpen"); /* see invisible */
      player.SEEINVISIBLE += rnd(1000) + 400;
      monsterlist[INVISIBLESTALKER].char = 'I';
      return;
  };
  player.level.paint(); /* show new stats      */
  return;
}
