"use strict";


/*
    For command mode.  Perform the action of closing something (door).
*/
function close_something(direction) {
  // if (direction == 0) {
  //   updateLog("");
  //   return 1;
  // }

  cursors();

  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];

  var item = getItem(x, y);

  if (item == null) {
    updateLog("  There is nothing to close!");
    return 1;
  }

  /* get direction of object to close.  test 'closeability' of object
     indicated.
  */
  if (item.matches(OCLOSEDDOOR)) {
    updateLog("  The door is already closed!");
    beep();
  } else if (item.matches(OOPENDOOR)) {
    if (monsterAt(x, y) != null) {
      updateLog("  There's a monster in the way!");
      return;
    }
    player.level.items[x][y] = createObject(OCLOSEDDOOR, 0);
    player.level.know[x][y] = 0;
    if (direction == 0) {
      player.x = lastpx;
      player.y = lastpy;
    }

  } else {
    updateLog("  You can't close that!");
    beep();
  }
  return 1;
}



/*
    For command mode.  Perform opening an object (door, chest).
*/
function open_something(direction) {

  if (direction == 0) {
    updateLog("");
    return 1;
  }

  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];

  var item = getItem(x, y);

  if (item == null) {
    updateLog("  There is nothing to open!");
    return 1;
  }

  if (item.matches(OOPENDOOR)) {
    updateLog("  The door is already open!");
    beep();
    return 1;
  } else if (item.matches(OCHEST)) {
    act_open_chest(x, y);
    return 1;
  } else if (item.matches(OCLOSEDDOOR)) {
    act_open_door(x, y);
    return 1;
  } else {
    updateLog("  You can't open that!");
    beep();
    return 1;
  }

}



/*
    a subroutine to raise or lower character levels
    if x > 0 they are raised   if x < 0 they are lowered
*/
function fntchange(how) {
  //lprc('\n');
  how = how / Math.abs(how);
  switch (rnd(9)) {
    case 1:
      updateLog("  Your strength");
      player.STRENGTH = Math.max(3, player.STRENGTH + how);
      fch(how);
      break;
    case 2:
      updateLog("  Your intelligence");
      player.INTELLIGENCE = Math.max(3, player.INTELLIGENCE + how);
      fch(how);
      break;
    case 3:
      updateLog("  Your wisdom");
      player.WISDOM = Math.max(3, player.WISDOM + how);
      fch(how);
      break;
    case 4:
      updateLog("  Your constitution");
      player.CONSTITUTION = Math.max(3, player.CONSTITUTION + how);
      fch(how);
      break;
    case 5:
      updateLog("  Your dexterity");
      player.DEXTERITY = Math.max(3, player.DEXTERITY + how);
      fch(how);
      break;
    case 6:
      updateLog("Your charm");
      player.CHARISMA = Math.max(3, player.CHARISMA + how);
      fch(how);
      break;
    case 7:
      var j = rnd(level + 1);
      if (how < 0) {
        updateLog(`  You lose ${j} hit point`);
        if (j > 1) {
          appendLog("s!");
        } else {
          appendLog('!');
        }
        player.losemhp(j);
      } else {
        updateLog(`  You gain ${j} hit point`);
        if (j > 1) {
          appendLog("s!");
        } else {
          appendLog('!');
        }
        player.raisemhp(j);
      }
      //bottomline();
      break;

    case 8:
      var j = rnd(level + 1);
      if (how > 0) {
        updateLog(`  You just gained ${j} spell`);
        if (j > 1) {
          appendLog("s!");
        } else {
          appendLog('!');
        }
        player.raisemspells(j);
      } else {
        updateLog(`  You just lost ${j} spell`);
        if (j > 1) {
          appendLog("s!");
        } else {
          appendLog('!');
        }
        player.losemspells(j);
      }
      //bottomline();
      break;

    case 9:
      var j = 5 * rnd((level + 1) * (level + 1));
      if (how < 0) {
        updateLog(`  You just lost ${j} experience point`);
        if (j > 1) {
          appendLog("s!");
        } else {
          appendLog('!');
        }
        player.loseexperience(j);
      } else {
        updateLog(`  You just gained ${j} experience point`);
        if (j > 1) {
          appendLog("s!");
        } else {
          appendLog('!');
        }
        player.raiseexperience(j);
      }
      break;
  }
  //cursors();
}



/*
    subroutine to process an up/down of a character attribute for ofountain
*/
function fch(how) {
  if (how < 0) {
    appendLog(" went down by one!");
  } else {
    appendLog(" went up by one!");
  }
  //bottomline();
}



/*
    For command mode.  Perform drinking at a fountain.
*/
function drink_fountain() {
  //cursors();
  var item = getItem(player.x, player.y);
  if (item.matches(ODEADFOUNTAIN)) {
    updateLog("There is no water to drink!");
  } else if (!item.matches(OFOUNTAIN)) {
    updateLog("I see no fountain to drink from here!");
  } else {
    act_drink_fountain();
  }
  return;
}



/*
    For command mode.  Perform washing (tidying up) at a fountain.
*/
function wash_fountain() {
  //cursors();
  var item = getItem(player.x, player.y);
  if (item.matches(ODEADFOUNTAIN)) {
    updateLog("There is no water to wash in!");
  } else if (!item.matches(OFOUNTAIN)) {
    updateLog("I see no fountain to wash at here!");
  } else {
    act_wash_fountain();
  }
  return;
}


/*
    For command mode.  Perform entering a building.
*/
function enter() {
  // cursors() ;

  debug("enter(): entering a building");
  IN_STORE = true;

  var building = getItem(player.x, player.y);
  if (building.matches(OSCHOOL)) {
    oschool();
    return;
  }
  if (building.matches(OBANK)) {
    obank();
    return;
  }
  if (building.matches(OBANK2)) {
    obank2();
    return;
  }
  if (building.matches(ODNDSTORE)) {
    dndstore();
    return;
  }
  if (building.matches(OENTRANCE)) {
    IN_STORE = false;
    /* place player in front of entrance on level 1.  newcavelevel()
       prevents player from landing on a monster/object.
    */
    player.x = 33;
    player.y = MAXY - 2;
    newcavelevel(1);
    player.level.know[33][MAXY - 1] = KNOWALL;
    player.level.monsters[33][MAXY - 1] = null;
    //draws( 0, MAXX, 0, MAXY );
    showcell(player.x, player.y); /* to show around player */
    bot_linex();
    return;
  }
  if (building.matches(OTRADEPOST)) {
    otradepost();
    return;
  }
  if (building.matches(OLRS)) {
    olrs();
    return;
  }
  if (building.matches(OHOME)) {
    ohome();
    return;
  }

  debug("enter(): no building here");
  IN_STORE = false;

  updateLog("There is no place to enter here!");

}



/* For command mode. Perform removal of gems from a jeweled throne */
function remove_gems() {
  cursors();
  var item = getItem(player.x, player.y);
  if (item.matches(ODEADTHRONE)) {
    updateLog("There are no gems to remove!");
  } else if (item.matches(OTHRONE)) {
    act_remove_gems(item.arg);
  } else {
    updateLog("I see no throne here to remove gems from!");
  }
}



/*
    For command mode.  Perform sitting on a throne.
*/
function sit_on_throne() {
  cursors();
  var item = getItem(player.x, player.y);
  if (item.matches(OTHRONE) || item.matches(ODEADTHRONE)) {
    act_sit_throne(item.arg);
  } else {
    updateLog("I see no throne to sit on here!");
  }
}



/*
For command mode.  Checks that player is actually standing at a set up
up stairs or volcanic shaft.
*/
function up_stairs() {
  var item = getItem(player.x, player.y);

  if (item.matches(OSTAIRSDOWN)) {
    updateLog("The stairs don't go up!");
    dropflag = 1;
  }

  else if (item.matches(OVOLUP))
    act_up_shaft();

  else if (!item.matches(OSTAIRSUP)) {
    updateLog("I see no way to go up here!");
    dropflag = 1;
  }

  else
    act_up_stairs();
}



/*
For command mode.  Checks that player is actually standing at a set of
down stairs or volcanic shaft.
*/
function down_stairs() {
  var item = getItem(player.x, player.y);

  if (item.matches(OSTAIRSUP)) {
    updateLog("The stairs don't go down!");
    dropflag = 1;
  }


  else if (item.matches(OVOLDOWN))
    act_down_shaft();

  else if (!item.matches(OSTAIRSDOWN)) {
    updateLog("I see no way to go down here!");
    dropflag = 1;
  }

  else
    act_down_stairs();
}
