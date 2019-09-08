'use strict';


function positionplayer(x, y, exact) {
  if (x == null) x = player.x;
  if (y == null) y = player.y;
  if (exact == null) exact = false;

  // short circuit for moving to exact location
  var distance = 0;
  if (exact && canMove(x, y)) {
    player.x = x;
    player.y = y;
    //debug(`positionplayer: (` + distance + `) got ` + xy(x, y));
    player.level.know[player.x][player.y] = KNOWALL;
    return true;
  }

  // try 20 times to be 1 step away, then 2 steps, etc...
  distance = 1;
  var maxTries = 20;
  var numTries = maxTries;
  while (distance < 10) {
    while (numTries-- > 0) {
      var newx = x + (rnd(3) - 2) * distance;
      var newy = y + (rnd(3) - 2) * distance;
      // debug(`positionplayer: (` + distance + `) try ` + newx + `,` + newy);
      if ((newx != x || newy != y)) {
        if (canMove(newx, newy)) {
          player.x = newx;
          player.y = newy;
          player.level.know[player.x][player.y] = KNOWALL;
          //debug(`positionplayer: (` + distance + `) got ` + newx + `,` + newy);
          return true;
        }
      }
    }
    numTries = maxTries;
    distance++;
  }

  debug(`positionplayer: couldn't place player`);
  return false;
}



function canMove(x, y) {
  if (x < 0) return false;
  if (x >= MAXX) return false;
  if (y < 0) return false;
  if (y >= MAXY) return false;
  var item = itemAt(x, y);
  return (!item.matches(OWALL) && !item.matches(OCLOSEDDOOR) && !monsterAt(x, y));
}



/*
    recalc()    function to recalculate the weapon and armor class of the player
 */
function recalc() {
  var oldAC = player.AC;
  var oldWC = player.WCLASS;

  player.WCLASS = 0;
  player.AC = 0;

  var armor, weapon, extra;
  if (player.WEAR) {
    armor = player.WEAR;
    extra = armor.arg;
    if (armor.matches(OSHIELD)) player.AC = 2 + extra;
    if (armor.matches(OLEATHER)) player.AC = 2 + extra;
    if (armor.matches(OSTUDLEATHER)) player.AC = 3 + extra;
    if (armor.matches(ORING)) player.AC = 5 + extra;
    if (armor.matches(OCHAIN)) player.AC = 6 + extra;
    if (armor.matches(OSPLINT)) player.AC = 7 + extra;
    if (armor.matches(OPLATE)) player.AC = 9 + extra;
    if (armor.matches(OPLATEARMOR)) player.AC = 10 + extra;
    if (armor.matches(OSSPLATE)) player.AC = 12 + extra;
    if (armor.matches(OELVENCHAIN)) player.AC = 15 + extra;
  }
  if (player.SHIELD && player.SHIELD.matches(OSHIELD)) {
    player.AC += 2 + player.SHIELD.arg;
  }
  player.AC += player.MOREDEFENSES;

  if (player.WIELD) {
    weapon = player.WIELD;
    extra = weapon.arg;
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
    var item = player.inventory[i];
    if (!item)
      continue;

    if (item.matches(OBELT)) player.WCLASS += ((item.arg << 1)) + 2;

    /*  now for regeneration abilities based on rings   */
    if (item.matches(OPROTRING)) player.AC += item.arg + 1;
    if (item.matches(ODAMRING)) player.WCLASS += item.arg + 1;
    if (item.matches(OREGENRING)) player.REGEN += item.arg + 1;
    if (item.matches(ORINGOFEXTRA)) player.REGEN += 5 * (item.arg + 1);
    if (item.matches(OENERGYRING)) player.ENERGY += item.arg + 1;
  }

  // 12.4.5: prevent negative WC and AC
  player.WCLASS = Math.max(0, player.WCLASS);
  player.AC = Math.max(0, player.AC);

  if (oldAC != player.AC) changedAC = millis();
  if (oldWC != player.WCLASS) changedWC = millis();
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
 * function to ask --more--. If the user enters a space, returns 0.  If user
 * enters Escape, returns 1.  If user enters alphabetic, then returns that
 *  value.
 */
function more(select_allowed) {
  cltoeoln();
  lprcat(`Press <b>space</b> to continue`);

  if (select_allowed) {
    lprcat(`, <b>escape</b> to cancel, letter to select: `);
  }
}



/*
    function to enchant armor player is currently wearing
 */
function enchantarmor(rusty_only) {
  var armor;

  if (player.WEAR) {
    armor = player.WEAR;
  } else if (player.SHIELD) {
    armor = player.SHIELD;
  } else {
    cursors();
    beep();
    if (!rusty_only) updateLog(`  You feel a sense of loss`);
    return false;
  }
  if (!armor.matches(OSCROLL) && !armor.matches(OPOTION)) {
    if (rusty_only && armor.arg >= 0) {
      return false; // fountains should only improve negative stats
    }
    armor.arg++;
    return true;
  }
  return false;
}

/*
    function to enchant a weapon presently being wielded
 */
function enchweapon(rusty_only) {
  var weapon = player.WIELD;
  if (!weapon) {
    cursors();
    beep();
    if (!rusty_only) updateLog(`  You feel a sense of loss`);
    return false;
  }
  if (!weapon.matches(OSCROLL) && !weapon.matches(OPOTION)) {
    if (rusty_only && weapon.arg >= 0) {
      return false; // fountains should only improve negative stats
    }
    weapon.arg++;
    if (weapon.matches(OCLEVERRING))
      player.setIntelligence(player.INTELLIGENCE + 1);
    else
    if (weapon.matches(OSTRRING))
      player.setStrExtra(player.STREXTRA + 1);
    else
    if (weapon.matches(ODEXRING))
      player.setDexterity(player.DEXTERITY + 1);

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
      if (monsterAt(tmp, tmp2)) return (true); /* if monster nearby */
  return (false);
}



function nearbymonsters() {
  var near = [];
  for (var x = player.x - 1; x < player.x + 2; x++) {
    for (var y = player.y - 1; y < player.y + 2; y++) {
      var monster = monsterAt(x, y);
      if (monster) {
        near.push(monster);
      }
    }
  }
  return near;
}



function nearPlayer(item) {
  for (var tmpx = vx(player.x - 1); tmpx < vx(player.x + 2); tmpx++)
    for (var tmpy = vy(player.y - 1); tmpy < vy(player.y + 2); tmpy++)
      if (itemAt(tmpx, tmpy).matches(item)) return true;
  return false;
}



/*
    makemonst(lev)
        int lev;

    function to return monster number for a randomly selected monster
        for the given cave level
 */
function makemonst(lev) {
  var x, tmp;
  if (lev < 1) {
    lev = 1;
  } else if (lev > 12) {
    lev = 12;
  }

  if (lev < 5) {
    x = monstlevel[lev - 1];
    if (x == 0) x = 1;
    tmp = rnd(x);
  } else {
    x = monstlevel[lev - 1] - monstlevel[lev - 4];
    if (x == 0) x = 1;
    tmp = rnd(x) + monstlevel[lev - 4];
  }

  while (isGenocided(tmp) && tmp < monsterlist.length - 1)
    tmp++; /* genocided? */
  return (tmp);
}



/*
 * function to steal an item from the players pockets
 * returns 1 if steals something else returns 0
 */
function stealsomething() {
  var j = 100;
  for (;;) {
    var i = rund(26);
    var item = player.inventory[i];
    if (item && item !== player.WIELD && item !== player.WEAR && item !== player.SHIELD) {
      updateLog(`  ${getCharFromIndex(i)}) ${item}`);
      player.adjustcvalues(item, false);
      player.inventory[i] = null;
      return 1;
    }
    if (--j <= 0) return 0;
  }
}



/* function to return 1 is player carrys nothing else return 0 */
function emptyhanded() {
  for (var i = 0; i < 26; i++) {
    var item = player.inventory[i];
    if (item && item !== player.WIELD && item !== player.WEAR && item !== player.SHIELD) {
      return 0;
    }
  }
  return 1;
}



/*
    function to calculate the pack weight of the player
    returns the number of pounds the player is carrying
 */
// TODO: this could go into a new object.weight field
function packweight() {
  var weight = player.GOLD / 1000;
  for (var i = 0; i < player.inventory.length; i++) {
    var item = player.inventory[i];
    if (!item) continue;
    switch (item.id) {
      case OSSPLATE.id:
      case OPLATEARMOR.id:
        weight += 40;
        break;
      case OPLATE.id:
        weight += 35;
        break;
      case OHAMMER.id:
        weight += 30;
        break;
      case OSPLINT.id:
        weight += 26;
        break;
      case OSWORDofSLASHING.id:
        weight += (ULARN ? 15 : 23);
        break;
      case OCHAIN.id:
      case OBATTLEAXE.id:
      case O2SWORD.id:
        weight += 23;
        break;
      case OLONGSWORD.id:
      case OSWORD.id:
      case ORING.id:
      case OFLAIL.id:
        weight += 20;
        break;
      case OELVENCHAIN.id:
      case OLANCE.id:
      case OSLAYER.id:
      case OVORPAL.id:
      case OSTUDLEATHER.id:
        weight += 15;
        break;
      case OLEATHER.id:
      case OSPEAR.id:
        weight += 8;
        break;
      case OORBOFDRAGON.id:
      case OBELT.id:
        weight += 4;
        break;
      case OSHIELD.id:
        weight += 7;
        break;
      case OCHEST.id:
        weight += 30 + item.arg;
        break;
      default:
        weight++;
        break;
    };
  }
  return (weight);
}
