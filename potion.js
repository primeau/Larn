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


var knownPotions = [potionname[21]]; // always know cure dianthroritis

function isKnown(item) {
  if (item.matches(OPOTION)) {
    if (knownPotions.indexOf(item.atr) >= 0) {
      return true;
    }
  }
  return false;
}

function learnItem(item) {
  if (item.matches(OPOTION)) {
    knownPotions.push(item.atr);
  }
}

function newpotion() {
  var potion = rund(41);
  debug("newpotion(): created: " + potionname[potprob[potion]]);
  return potprob[potion];
}


/*
 * function to process a potion
 */
function opotion(pot) {
  if (drink_take_ignore_potion == false) {
    updateLog("Do you (d) drink it, (t) take it, or (i) ignore it?");
    drink_take_ignore_potion = true; // signal to parse function
    return;
  } else {
    switch (pot) {
      case '\33':
      case 'i':
        updateLog("ignore");
        drink_take_ignore_potion = false;
        return;

      case 'd':
        updateLog("drink");
        forget(); /* destroy potion  */
        //quaffpotion(pot, TRUE);
        drink_take_ignore_potion = false;
        return;

      case 't':
        updateLog("take");
        if (take(OPOTION, pot)) {
          forget();
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
function quaffpotion(pot, set_known) {
  var i, j, k;

  /* check for within bounds */
  if (pot < 0 || pot >= MAXPOTION)
    return;

  /*
   * if player is to know this potion (really quaffing one), make it
   * known
   */
  if (set_known)
    potionname[pot][0] = ' ';

  switch (pot) {
    case 0:
      lprcat("\nYou fall asleep. . .");
      i = rnd(11) - (c[CONSTITUTION] >> 2) + 2;
      while (--i > 0) {
        parse2();
        nap(1000);
      }
      cursors();
      lprcat("\nYou woke up!");
      return;

    case 1:
      lprcat("\nYou feel better");
      if (c[HP] == c[HPMAX])
        raisemhp(1);
      else
      if ((c[HP] += rnd(20) + 20 + c[LEVEL]) > c[HPMAX])
        c[HP] = c[HPMAX];
      break;

    case 2:
      lprcat("\nSuddenly, you feel much more skillful!");
      raiselevel();
      raisemhp(1);
      return;

    case 3:
      lprcat("\nYou feel strange for a moment");
      c[rund(6)]++;
      break;

    case 4:
      lprcat("\nYou feel more self confident!");
      c[WISDOM] += rnd(2);
      break;

    case 5:
      lprcat("\nWow!  You feel great!");
      if (c[STRENGTH] < 12)
        c[STRENGTH] = 12;
      else
        c[STRENGTH]++;
      break;

    case 6:
      lprcat("\nYour charm went up by one!");
      c[CHARISMA]++;
      break;

    case 7:
      lprcat("\nYou become dizzy!");
      if (--c[STRENGTH] < 3)
        c[STRENGTH] = 3;
      break;

    case 8:
      lprcat("\nYour intelligence went up by one!");
      c[INTELLIGENCE]++;
      break;

    case 9:
      lprcat("\nYou sense the presence of objects!");
      nap(1000);
      if (c[BLINDCOUNT])
        return;
      for (i = 0; i < MAXY; i++)
        for (j = 0; j < MAXX; j++)
          switch (item[j][i]) {
            case OPLATE:
            case OCHAIN:
            case OLEATHER:
            case ORING:
            case OSTUDLEATHER:
            case OSPLINT:
            case OPLATEARMOR:
            case OSSPLATE:
            case OSHIELD:
            case OSWORDofSLASHING:
            case OHAMMER:
            case OSWORD:
            case O2SWORD:
            case OSPEAR:
            case ODAGGER:
            case OBATTLEAXE:
            case OLONGSWORD:
            case OFLAIL:
            case OLANCE:
            case ORINGOFEXTRA:
            case OREGENRING:
            case OPROTRING:
            case OENERGYRING:
            case ODEXRING:
            case OSTRRING:
            case OCLEVERRING:
            case ODAMRING:
            case OBELT:
            case OSCROLL:
            case OPOTION:
            case OBOOK:
            case OCHEST:
            case OAMULET:
            case OORBOFDRAGON:
            case OSPIRITSCARAB:
            case OCUBEofUNDEAD:
            case ONOTHEFT:
            case OCOOKIE:
              know[j][i] = HAVESEEN;
              show1cell(j, i);
              break;
          }
      showplayer();
      return;

    case 10:
      /* monster detection */
      lprcat("\nYou detect the presence of monsters!");
      nap(1000);
      if (c[BLINDCOUNT])
        return;
      for (i = 0; i < MAXY; i++)
        for (j = 0; j < MAXX; j++)
          if (mitem[j][i] && (monstnamelist[mitem[j][i]] != floorc)) {
            know[j][i] = HAVESEEN;
            show1cell(j, i);
          }
      return;

    case 11:
      lprcat("\nYou stagger for a moment . .");
      for (i = 0; i < MAXY; i++)
        for (j = 0; j < MAXX; j++)
          know[j][i] = 0;
      nap(1000);
      draws(0, MAXX, 0, MAXY); /* potion of forgetfulness */
      return;

    case 12:
      lprcat("\nThis potion has no taste to it");
      return;

    case 13:
      lprcat("\nYou can't see anything!"); /* blindness */
      c[BLINDCOUNT] += 500;
      return;

    case 14:
      lprcat("\nYou feel confused");
      c[CONFUSE] += 20 + rnd(9);
      return;

    case 15:
      lprcat("\nWOW!!!  You feel Super-fantastic!!!");
      if (c[HERO] == 0)
        for (i = 0; i < 6; i++)
          c[i] += 11;
      c[HERO] += 250;
      break;

    case 16:
      lprcat("\nYou have a greater intestinal constitude!");
      c[CONSTITUTION]++;
      break;

    case 17:
      lprcat("\nYou now have incredibly bulging muscles!!!");
      if (c[GIANTSTR] == 0)
        c[STREXTRA] += 21;
      c[GIANTSTR] += 700;
      break;

    case 18:
      lprcat("\nYou feel a chill run up your spine!");
      c[FIRERESISTANCE] += 1000;
      break;

    case 19:
      lprcat("\nYou feel greedy . . .");
      nap(1000);
      if (c[BLINDCOUNT])
        return;
      for (i = 0; i < MAXY; i++)
        for (j = 0; j < MAXX; j++) {
          k = item[j][i];
          if ((k == ODIAMOND) ||
            (k == ORUBY) ||
            (k == OEMERALD) ||
            (k == OMAXGOLD) ||
            (k == OSAPPHIRE) ||
            (k == OLARNEYE) ||
            (k == OGOLDPILE)) {
            know[j][i] = HAVESEEN;
            show1cell(j, i);
          }
        }
      showplayer();
      return;

    case 20:
      c[HP] = c[HPMAX];
      break; /* instant healing */

    case 21:
      lprcat("\nYou don't seem to be affected");
      return; /* cure dianthroritis */

    case 22:
      lprcat("\nYou feel a sickness engulf you"); /* poison */
      c[HALFDAM] += 200 + rnd(200);
      return;

    case 23:
      lprcat("\nYou feel your vision sharpen"); /* see invisible */
      c[SEEINVISIBLE] += rnd(1000) + 400;
      monstnamelist[INVISIBLESTALKER] = 'I';
      return;
  };
  bottomline(); /* show new stats      */
  return;
}
