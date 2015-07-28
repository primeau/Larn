"use strict";





/*
    recalc()    function to recalculate the weapon and armor class of the player
 */
function recalc() {
  player.WCLASS = 0;
  player.AC = 0;

  if (player.WEAR != null) {
    let armor = player.WEAR;
    let extra = armor.arg;
    if (armor.matches(OSHIELD)) player.AC = 2 + extra;
    if (armor.matches(OLEATHER)) player.AC = 2 + extra;
    if (armor.matches(OSTUDLEATHER)) player.AC = 3 + extra;
    if (armor.matches(ORING)) player.AC = 5 + extra;
    if (armor.matches(OCHAIN)) player.AC = 6 + extra;
    if (armor.matches(OSPLINT)) player.AC = 7 + extra;
    if (armor.matches(OPLATE)) player.AC = 9 + extra;
    if (armor.matches(OPLATEARMOR)) player.AC = 10 + extra;
    if (armor.matches(OSSPLATE)) player.AC = 12 + extra;
  }
  if (player.SHIELD != null && player.SHIELD.matches(OSHIELD)) {
    player.AC += 2 + player.SHIELD.arg;
  }
  player.AC += player.MOREDEFENSES;

  if (player.WIELD != null) {
    let weapon = player.WIELD;
    let extra = weapon.arg;
    if (weapon.matches(ODAGGER)) player.WCLASS = 3 + extra;
    if (weapon.matches(OBELT)) player.WCLASS = 7 + extra;
    if (weapon.matches(OSHIELD)) player.WCLASS = 8 + extra;
    if (weapon.matches(OSPEAR)) player.WCLASS = 10 + extra;
    if (weapon.matches(OFLAIL)) player.WCLASS = 14 + extra;
    if (weapon.matches(OBATTLEAXE)) player.WCLASS = 17 + extra;
    if (weapon.matches(OLANCE)) player.WCLASS = 19 + extra;
    if (weapon.matches(OLONGSWORD)) player.WCLASS = 22 + extra;
    if (weapon.matches(O2SWORD)) player.WCLASS = 26 + extra;
    if (weapon.matches(OSWORD)) player.WCLASS = 32 + extra;
    if (weapon.matches(OSWORDofSLASHING)) player.WCLASS = 30 + extra;
    if (weapon.matches(OHAMMER)) player.WCLASS = 35 + extra;
  }
  player.WCLASS += player.MOREDAM;

  player.REGEN = 1;
  player.ENERGY = 0;

  for (var i = 0; i < player.inventory.length; i++) {
    let item = player.inventory[i];
    if (item == null)
      continue;

    if (item.matches(OBELT)) player.WCLASS += ((item.arg << 1)) + 2;

    /*  now for regeneration abilities based on rings   */
    if (item.matches(OPROTRING)) player.AC += item.arg + 1;
    if (item.matches(ODAMRING)) player.WCLASS += item.arg + 1;
    if (item.matches(OREGENRING)) player.REGEN += item.arg + 1;
    if (item.matches(ORINGOFEXTRA)) player.REGEN += 5 * (item.arg + 1);
    if (item.matches(OENERGYRING)) player.ENERGY += item.arg + 1;
  }
}



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
    updateLog("You feel a sense of loss");
    return false;
  }
  if (!tmp.matches(OSCROLL) && !tmp.matches(OPOTION)) {
    tmp.arg++;
    bottomline();
    return true;
  }
  return false;
}

/*
    function to enchant a weapon presently being wielded
 */
function enchweapon() {
  var tmp = player.WIELD;
  if (tmp == null) {
    cursors();
    beep();
    updateLog("You feel a sense of loss");
    return false;
  }
  if (!tmp.matches(OSCROLL) && !tmp.matches(OPOTION)) {
    tmp.arg++;
    // TODO
    // if (tmp.matches(OCLEVERRING)) player.INTELLIGENCE++;
    // else
    // if (tmp.matches(OSTRRING)) player.STREXTRA++;
    // else
    // if (tmp.matches(ODEXRING)) player.DEXTERITY++;
    bottomline();
    return true;
  }
  return false;
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
