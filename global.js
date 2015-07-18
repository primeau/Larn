"use strict";

/*
    function to create a gem on a square near the player
 */
function creategem() {
  var i, j;
  switch (rnd(4)) {
    case 1:
      i = ODIAMOND;
      j = 50;
      break;
    case 2:
      i = ORUBY;
      j = 40;
      break;
    case 3:
      i = OEMERALD;
      j = 30;
      break;
    default:
      i = OSAPPHIRE;
      j = 20;
      break;
  };
  createitem(i, rnd(j) + j / 10);
}


/*
    function to enchant armor player is currently wearing
 */
function enchantarmor() {
  var tmp;

  if (player.WEAR != null) {
    tmp = player.WEAR;
  } else if (player.SHIELD != null) {
    tmp = player.SHIELD;
  } else {
    cursors();
    beep();
    lprcat("You feel a sense of loss");
    return;
  }
  if (!tmp.matches(OSCROLL) && !tmp.matches(OPOTION)) {
    tmp.arg++;
    bottomline();
  }
}

/*
    function to enchant a weapon presently being wielded
 */
function enchweapon() {
  if (player.WIELD == null) {
    cursors();
    beep();
    lprcat("You feel a sense of loss");
    return;
  }
  var tmp = player.WIELD;
  if (!tmp.matches(OSCROLL) && !tmp.matches(OPOTION)) {
    tmp.arg++;
    // TODO
    // if (tmp.matches(OCLEVERRING)) player.INTELLIGENCE++;
    // else
    // if (tmp.matches(OSTRRING)) player.STREXTRA++;
    // else
    // if (tmp.matches(ODEXRING)) player.DEXTERITY++;
    bottomline();
  }
}


/*
    function to return 1 if a monster is next to the player else returns 0
 */
function nearbymonst() {
  for (var tmp = player.x - 1; tmp < player.x + 2; tmp++)
    for (var tmp2 = player.y - 1; tmp2 < player.y + 2; tmp2++)
      if (monsterAt(tmp, tmp2) != null) return (true); /* if monster nearby */
  return (false);
}


/*
    makemonst(lev)
        int lev;

    function to return monster number for a randomly selected monster
        for the given cave level
 */
function makemonst(lev) {
  var tmp;
  if (lev < 1)
    lev = 1;
  if (lev > 12)
    lev = 12;
  if (lev < 5)
  //tmp = rnd((x = monstlevel[lev - 1]) ? x : 1);
    tmp = rnd(monstlevel[lev - 1]);
  else
  //tmp = rnd((x = monstlevel[lev - 1] - monstlevel[lev - 4]) ? x : 1) + monstlevel[lev - 4];
    tmp = rnd(monstlevel[lev - 1] - monstlevel[lev - 4]) + monstlevel[lev - 4];

  while (monsterlist[tmp].genocided && tmp < monsterlist.length - 1)
    tmp++; /* genocided? */
  debug("makemonst: " + lev + " -> " + tmp + " " + monsterlist[tmp]);
  return (tmp);
}
