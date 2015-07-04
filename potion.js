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
var potprob = [
  0, 0, 1, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 9, 9, 9,
  10, 10, 10, 11, 11, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 19,
  20, 20, 22, 22, 23, 23
];

/*  name array for magic potions    */
var potionname = [
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
function opotion(potion_or_key) {
  var potion;
  var key;
  if (potion_or_key instanceof Item.constructor) {
    potion = potion_or_key;
    //debug("opotion(): got potion: " + potion);
  }
  else {
    key = potion_or_key;
    //debug("opotion(): got key: " + key);
  }
  if (drink_take_ignore_potion == false) {
    updateLog("Do you (d) drink it, (t) take it, or (i) ignore it?");
    drink_take_ignore_potion = true; // signal to parse function
    return;
  } else {
    var potion = itemAt(player.x, player.y);
    if (potion == null) {
      debug("opotion: couldn't find it!");
      drink_take_ignore_potion = false;
      return;
    }
    switch (key) {
      //case '\33': TODO capture ESC key too
      case 'i':
        updateLog("ignore");
        drink_take_ignore_potion = false;
        return;

      case 'd':
        updateLog("drink");
        forget(); /* destroy potion  */
        quaffpotion(potion, true);
        drink_take_ignore_potion = false;
        return;

      case 't':
        updateLog("take");
        if (take(potion)) {
          forget(); // remove from board
        }
        drink_take_ignore_potion = false;
        return;
    };
  }
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
      updateLog("You feel better");
      if (player.HP == player.HPMAX) {
        player.raisemhp(1);
      } else {
        player.raisehp(rnd(20) + 20 + player.level);
      }
      break;

    case 2: // raise level
      updateLog("Suddenly, you feel much more skillful!");
      player.raiselevel();
      player.raisemhp(1);
      return;

    case 3: // increase ability
      updateLog("You feel strange for a moment");
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
      break;

    case 4: // wisdom
      updateLog("You feel more self confident!");
      player.WISDOM += rnd(2);
      break;

    case 5: // strength
      updateLog("Wow!  You feel great!");
      player.STRENGTH = Math.max(12, player.STRENGTH + 1);
      break;

    case 6: // charisma
      updateLog("Your charm went up by one!");
      player.CHARISMA++;
      break;

    case 7: // dizziness
      updateLog("You become dizzy!");
      player.STRENGTH = Math.max(3, player.STRENGTH - 1);
      break;

    case 8: // intelligence
      updateLog("Your intelligence went up by one!");
      player.INTELLIGENCE++;
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
      updateLog("TODO: quaffpotion(): blindness");
      // lprcat("\nYou can't see anything!"); /* blindness */
      // c[BLINDCOUNT] += 500;
      return;

    case 14:
      updateLog("TODO: quaffpotion(): confusion");
      // lprcat("\nYou feel confused");
      // c[CONFUSE] += 20 + rnd(9);
      return;

    case 15:
      updateLog("TODO: quaffpotion(): heroism");
      // lprcat("\nWOW!!!  You feel Super-fantastic!!!");
      // if (c[HERO] == 0)
      //   for (i = 0; i < 6; i++)
      //     c[i] += 11;
      // c[HERO] += 250;
      break;

    case 16:
      updateLog("You have a greater intestinal constitude!");
      player.CONSTITUTION++;
      break;

    case 17:
      updateLog("TODO: quaffpotion(): giant strength");
      // lprcat("\nYou now have incredibly bulging muscles!!!");
      // if (c[GIANTSTR] == 0)
      //   c[STREXTRA] += 21;
      // c[GIANTSTR] += 700;
      break;

    case 18:
      updateLog("TODO: quaffpotion(): fire resistance");
      // lprcat("\nYou feel a chill run up your spine!");
      // c[FIRERESISTANCE] += 1000;
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
      updateLog("TODO: quaffpotion(): poison");
      // lprcat("\nYou feel a sickness engulf you"); /* poison */
      // c[HALFDAM] += 200 + rnd(200);
      return;

    case 23:
      updateLog("TODO: quaffpotion(): see invisible");
      // lprcat("\nYou feel your vision sharpen"); /* see invisible */
      // c[SEEINVISIBLE] += rnd(1000) + 400;
      // monstnamelist[INVISIBLESTALKER] = 'I';
      return;
  };
  player.level.paint(); /* show new stats      */
  return;
}
