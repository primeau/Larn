'use strict';


/*
    For command mode.  Perform opening an object (door, chest).
*/
function open_something(direction) {

  if (direction == 0) {
    updateLog(``);
    return 1;
  }

  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];

  var item = itemAt(x, y);

  if (!item) {
    updateLog(`  There is nothing to open!`);
    return 1;
  }

  if (item.matches(OOPENDOOR)) {
    updateLog(`  The door is already open!`);
    beep();
    return 1;
  } else if (item.matches(OCHEST)) {
    act_open_chest(x, y);
    return 1;
  } else if (item.matches(OCLOSEDDOOR)) {
    act_open_door(x, y);
    return 1;
  } else {
    updateLog(`  You can't open that!`);
    beep();
    return 1;
  }

}




/*
    Performs the act of opening a chest.

    Parameters:   x,y location of the chest to open.
    Assumptions:  cursors() has been called previously
*/
function act_open_chest(x, y) {
  var chest = itemAt(x, y);
  if (!chest.matches(OCHEST)) {
    return;
  }
  if (rnd(101) < 40) {
    updateLog(`  The chest explodes as you open it`);
    beep();
    var i = rnd(10);
    lastnum = 281; /* killed by an exploding chest */
    updateLog(`  You suffer ${i} hit points damage!`);
    if (i > 0) {
      player.losehp(i);
      //bottomhp();
    }
    switch (rnd(10)) /* see if he gets a curse */ {
      case 1:
        player.ITCHING += rnd(1000) + 100;
        updateLog(`  You feel an irritation spread over your skin!`);
        beep();
        break;

      case 2:
        player.CLUMSINESS += rnd(1600) + 200;
        updateLog(`  You begin to lose hand to eye coordination!`);
        beep();
        break;

      case 3:
        player.HALFDAM += rnd(1600) + 200;
        beep();
        updateLog(`  A sickness engulfs you!`);
        break;
    };
    player.level.items[x][y] = OEMPTY; /* destroy the chest */
    player.level.know[x][y] = 0;
    if (rnd(100) < 69) {
      creategem(true); /* gems from the chest */
    }
    dropgold(rnd(110 * chest.arg + 200), true);
    for (i = 0; i < rnd(4); i++) {
      something(chest.arg + 2, true);
    }
  } else
    updateLog(`  Nothing happens`);
  return;
}



/*
    Perform the actions common to command and prompt mode when opening a
    door.  Assumes cursors().

    Parameters:     the X,Y location of the door to open.
    Return value:   TRUE if successful in opening the door, false if not.
*/
function act_open_door(x, y) {
  var door = itemAt(x, y);
  if (!door.matches(OCLOSEDDOOR)) {
    return;
  }
  if (rnd(11) < 7) {
    switch (door.arg) {
      case 6:
        updateLog(`  The door makes an awful groan, but remains stuck`);
        player.AGGRAVATE += rnd(400);
        break;

      case 7:
        updateLog(`  You are jolted by an electric shock `);
        lastnum = 274; /* fried by an electric shock */
        player.losehp(rnd(20));
        break;

      case 8:
        updateLog(`  You feel drained`);
        player.loselevel();
        break;

      case 9:
        updateLog(`  You suddenly feel weaker `);
        player.setStrength(player.STRENGTH - 1);
        break;

      default:
        updateLog(`  The door doesn't budge`);
        return (0);
        break;
    }
  } else {
    updateLog(`  The door opens`);
    player.level.know[x][y] = 0;
    player.level.items[x][y] = createObject(OOPENDOOR);
    return (1);
  }
}



/*
    For command mode.  Perform the action of closing something (door).
*/
function close_something(direction) {
  cursors();

  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];

  var item = itemAt(x, y);

  if (!item) {
    updateLog(`  There is nothing to close!`);
    return 1;
  }

  /* get direction of object to close.  test 'closeability' of object
     indicated.
  */
  if (item.matches(OCLOSEDDOOR)) {
    updateLog(`  The door is already closed!`);
    beep();
  } else if (item.matches(OOPENDOOR)) {
    if (monsterAt(x, y)) {
      updateLog(`  There's a monster in the way!`);
      return;
    }
    player.level.items[x][y] = createObject(OCLOSEDDOOR, 0);
    player.level.know[x][y] = 0;
    if (direction == 0) {
      player.x = lastpx;
      player.y = lastpy;
    }

  } else {
    updateLog(`  You can't close that!`);
    beep();
  }
  return 1;
}



function outfortune() {
  updateLog(`The cookie was delicious.`);
  if (player.BLINDCOUNT)
    return;
    
  // lazy load fortunes
  if (!FORTUNES) 
    FORTUNES = COMMON_FORTUNES.concat(ULARN ? ULARN_FORTUNES : LARN_FORTUNES);

  var fortune = FORTUNES[rund(FORTUNES.length)];
  updateLog(`Inside you find a scrap of paper that says:`);
  updateLog(`  ${fortune}`);
}


// TODO  quaffpotion, readscroll, eatcookie are all very similar
function act_eatcookie(index) {
  var useindex = getIndexFromChar(index);
  var item = player.inventory[useindex];
  if (item && item.matches(OCOOKIE)) {
    player.inventory[useindex] = null;
    outfortune();
  } else {
    if (!item) {
      //debug(useindex);

      if (index == '*' || index == ' ' || index == 'I') {
        if (mazeMode) {
          showinventory(true, act_eatcookie, showeat, false, false, true);
        } else {
          setMazeMode(true);
        }
        nomove = 1;
        return;
      }

      if (useindex >= 0 && useindex < 26) {
        updateLog(`  You don't have item ${index}!`);
      }
      if (useindex <= -1) {
        appendLog(` cancelled`);
        nomove = 1;
      }
    } else {
      updateLog(`  You can't eat that!`);
    }
  }
  setMazeMode(true);
  return 1;
}
