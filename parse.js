"use strict";

const ESC = 'escape';
const ENTER = 'return';
const SPACE = 'space';
const TAB = 'tab';
const DEL = "backspace";



var blocking_callback;
var keyboard_input_callback;



function mousetrap(e, key) {
  //console.log("mousetrap: " + key);
  if (key == SPACE) key = ' ';
  if (key == TAB) return false;
  mainloop(key);
  return false; // disable default browser behaviour
}



function setCharCallback(func) {
  blocking_callback = func;
  nomove = 1;
}



function setTextCallback(func) {
  blocking_callback = getTextInput;
  keyboard_input_callback = func;
}



function setNumberCallback(func, allowAsterisk) {
  if (allowAsterisk)
    blocking_callback = getNumberOrAsterisk;
  else
    blocking_callback = getNumberInput;
  keyboard_input_callback = func;
}



function shouldRun(key) {
    var run = key.indexOf('shift+') >= 0 || key.match(/[YKUHLBJN]/);
    return run;
}



//const diroffx = { 0,  0, 1,  0, -1,  1, -1, 1, -1 };
//const diroffy = { 0,  1, 0, -1,  0, -1, -1, 1,  1 };
function parseDirectionKeys(key) {
  var dir = 0;
  if (key == 'y' || key == 'Y' || key.indexOf('home') >= 0) { // UP,LEFT
    dir = 6;
  } else if (key == 'u' || key == 'U' || key.indexOf('pageup') >= 0) { // UP,RIGHT
    dir = 5;
  } else if (key == 'k' || key == 'K' || key.indexOf('up') >= 0) { // NORTH
    dir = 3;
  } else if (key == 'h' || key == 'H' || key.indexOf('left') >= 0) { // LEFT
    dir = 4;
  } else if (key == 'l' || key == 'L' || key.indexOf('right') >= 0) { // RIGHT
    dir = 2;
  } else if (key == 'b' || key == 'B' || key.indexOf('end') >= 0) { // DOWN,LEFT
    dir = 8;
  } else if (key == 'n' || key == 'N' || key.indexOf('pagedown') >= 0) { // DOWN, RIGHT
    dir = 7;
  } else if (key == 'j' || key == 'J' || key.indexOf('down') >= 0) { // DOWN
    dir = 1;
  }
  return dir;
}



/*****************************************************************************/
/*****************************************************************************/
/*****************************************************************************/



function parse(key) {
  // console.log(`parse(): got: ${key}`);

  // if (keyboard_input_callback)
  // debug("keyboard_input_callback: " + keyboard_input_callback.name);

  if (blocking_callback) {
    // debug(blocking_callback.name + ": ");
    var before = blocking_callback.name;
    var done = blocking_callback(key);
    var after = blocking_callback.name;
    // debug(blocking_callback.name + ": " + done);

    // if a blocking callback assigns a new one, we're not done yet
    // i think i have created my own special callback hell
    if (before == after && done) {
      blocking_callback = null;
    }
    if (!done) {
      nomove = 1;
    }
    return;
  }

  var item = itemAt(player.x, player.y);



  //
  // MOVE PLAYER
  //
  var dir = parseDirectionKeys(key);
  if (dir > 0) {
    if (shouldRun(key)) {
      run(dir);
    } else {
      moveplayer(dir);
    }
    return;
  }



  //
  // DO NOTHING
  //
  if (key == ' ') {
    nomove = 1;
    return;
  }

  //
  // STAY HERE
  //
  if (key == '.' || key == '5') {
    viewflag = 1;
    return;
  }

  //
  // CAST A SPELL
  //
  if (key == 'c') {
    pre_cast();
    return;
  }

  //
  // DROP
  //
  if (key == 'd') {
    if (player.TIMESTOP == 0) {
      updateLog("What do you want to drop [<b>space</b> to view] ? ");
      setCharCallback(drop_object);
    }
    return;
  }

  //
  // EAT COOKIE
  //
  if (key == 'e') {
    if (player.TIMESTOP == 0)
      if (item.matches(OCOOKIE)) {
        outfortune();
        forget();
      } else {
        updateLog("What do you want to eat [<b>space</b> to view] ? ");
        setCharCallback(act_eatcookie);
      }
    return;
  }

  //
  // TIDY UP AT FOUNTAIN
  //
  if (key == 'f') {
    wash_fountain(null);
    dropflag = 1;
    return;
  }

  //
  // PACK WEIGHT
  //
  if (key == 'g') {
    nomove = 1;
    updateLog(`The stuff you are carrying presently weighs ${Math.round(packweight())} pounds`);
    return;
  }

  //
  // INVENTORY
  //
  if (key == 'i') {
    nomove = 1;
    showinventory(false, parse_inventory, showall, true, true);
    return;
  }

  //
  // OPEN (in a direction)
  //
  if (key == 'o' || key == 'O') {
    /* check for confusion. */
    if (player.CONFUSE > 0) {
      updateLog("You're too confused!");
      beep();
      return;
    }
    /* check for player standing on a chest.  If he is, prompt for and
       let him open it.  If player ESCs from prompt, quit the Open
       command.
    */
    if (item.matches(OCHEST)) {
      act_open_chest(player.x, player.y);
      dropflag = 1; /* prevent player from picking back up if fail */
      return;
    } else {
      prepare_direction_event(open_something, true);
    }
    return;
  }

  //
  // PRAY
  //
  if (key == 'p') {
    pray_at_altar();
    dropflag = 1;
    prayed = 1;
    return;
  }

  //
  // quaff
  //
  if (key == 'q') {
    if (player.TIMESTOP == 0)
      if (item.matches(OPOTION)) {
        forget();
        quaffpotion(item, true);
      } else {
        updateLog("What do you want to quaff [<b>space</b> to view] ? ");
        setCharCallback(act_quaffpotion);
      }
    return;
  }

  //
  // read
  //
  if (key == 'r') {
    if (player.BLINDCOUNT > 0) {
      cursors();
      updateLog("You can't read anything when you're blind!");
      dropflag = 1;
    }
    //
    else if (player.TIMESTOP == 0) {
      if (item.matches(OBOOK)) {
        readbook(item);
        forget();
      } else if (item.matches(OSCROLL)) {
        forget();
        read_scroll(item);
      } else {
        updateLog("What do you want to read [<b>space</b> to view] ? ");
        setCharCallback(act_read_something);
      }
    }
    return;
  }

  //
  // sit on throne
  //
  if (key == 's') {
    sit_on_throne();
    dropflag = 1;
    return;
  }

  //
  // PICK UP
  //
  if (key == 't' || key == ',') {
    /* pickup, don't identify or prompt for action */
    lookforobject(false, true, false);
    return;
  }

  //
  // version
  //
  if (key == 'v') {
    nomove = 1;
    updateLog(`JS Larn, Version 12.4.5 build 201 -- Difficulty ${getDifficulty()}`);
    if (wizard) updateLog(" Wizard");
    if (cheat) updateLog(" Cheater");
    return;
  }

  //
  // WIELD
  //
  if (key == 'w') {
    if (item.canWield()) {
      wield(item);
    } else {
      updateLog("What do you want to wield (-) for nothing [<b>space</b> to view] ? ");
      setCharCallback(wield);
    }
    return;
  }

  //
  // show scores
  //
  if (key == 'z') {
    nomove = 1;
    loadScores();
  }

  //
  // DESECRATE
  //
  if (key == 'A') {
    desecrate_altar();
    dropflag = 1;
    return;
  }

  //
  // CLOSE DOOR
  //
  if (key == 'C') {
    /* check for confusion. */
    if (player.CONFUSE > 0) {
      updateLog("You're too confused!");
      beep();
      return;
    }
    if (item.matches(OOPENDOOR)) {
      close_something(0);
      return;
    } else {
      prepare_direction_event(close_something, true);
      dropflag = 1;
      return;
    }
  }

  //
  // DRINK FROM FOUNTAIN
  //
  if (key == 'D') {
    drink_fountain(null);
    dropflag = 1;
    return;
  }

  //
  // ENTER A BUILDING
  //
  if (key == 'E') {
    enter();
    return;
  }

  //
  // list spells and scrolls
  //
  if (key == 'I') {
    nomove = 1;
    seemagic(false);
    setCharCallback(parse_see_all);
    return;
  }

  //
  // outstanding taxes
  //
  if (key == 'P') {
    nomove = 1;
    if (outstanding_taxes > 0)
      updateLog(`You presently owe ${outstanding_taxes} gold pieces in taxes`);
    else
      updateLog("You do not owe any taxes");
    return;
  }

  //
  // Q - quit
  //
  if (key == 'Q') {
    nomove = 1;
    setCharCallback(parseQuit);
    updateLog("Do you really want to quit (all progress will be lost) [<b>y</b>/<b>n</b>] ? ")
    return;
  }

  function parseQuit(key) {
    nomove = 1;
    if (key == ESC || key == 'n' || key == 'N') {
      appendLog(" no");
      return 1;
    }
    if (key == 'y' || key == 'Y') {
      appendLog(" yes");
      died(286, false); /* a quitter */
      return 1;
    }
    return 0;
  }

  //
  // REMOVE GEMS
  //
  if (key == 'R') {
    remove_gems();
    dropflag = 1;
    return;
  }

  //
  // S - save game
  //
  if (key == 'S') {
    nomove = 1;
    saveGame();
    died(287, false); /* saved game */
    return;
  }

  //
  // take off armor
  //
  if (key == 'T') {
    if (player.SHIELD) {
      player.SHIELD = null;
      updateLog("Your shield is off");
    } else
    if (player.WEAR) {
      player.WEAR = null;
      updateLog("Your armor is off");
    } else
      updateLog("You aren't wearing anything");
    return;
  }

  //
  // WEAR
  //
  if (key == 'W') {
    if (item.isArmor()) {
      wear(item);
    } else {
      updateLog("What do you want to wear [<b>space</b> to view] ? ");
      setCharCallback(wear);
    }
    return;
  }

  //
  // TELEPORT
  //
  if (key == 'Z') {
    if (player.LEVEL > 9) {
      oteleport(1);
      return;
    }
    cursors();
    updateLog("As yet, you don't have enough experience to use teleportation");
    return;
  }

  //
  // UP STAIRS
  //
  if (key == '<') {

    if (DEBUG_STAIRS_EVERYWHERE) {
      if (level == 11)
        moveNear(OVOLUP, true)
      else if (level == 1) {
        newcavelevel(0);
        moveNear(OENTRANCE, true);
      } else if (level != 0)
        moveNear(OSTAIRSUP, true);
    }

    up_stairs();

    return;
  }

  //
  // DOWN STAIRS
  //
  if (key == '>') {

    if (DEBUG_STAIRS_EVERYWHERE) {
      if (!item.matches(OVOLDOWN) && level == 0) {
        moveNear(OENTRANCE, true);
        enter();
      } else if (level != 0 && level != 10 && level != 13)
        moveNear(OSTAIRSDOWN, true)
    }

    down_stairs();

    return;
  }

  //
  // identify traps
  //
  if (key == '^') {
    var flag = 0;
    for (var j = vy(player.y - 1); j < vy(player.y + 2); j++) {
      for (var i = vx(player.x - 1); i < vx(player.x + 2); i++) {
        var trap = itemAt(i, j);
        switch (trap.id) {
          case OTRAPDOOR.id:
          case ODARTRAP.id:
          case OTRAPARROW.id:
          case OTELEPORTER.id:
          case OPIT.id:
            updateLog(`It's ${trap}`);
            flag++;
        };
      }
    }
    if (flag == 0)
      updateLog("No traps are visible");
    return;
  }

  //
  // look at object
  //
  if (key == ':') {
    nomove = 1; /* assumes look takes no time */
    /* identify, don't pick up or prompt for action */
    lookforobject(true, false, false);
    return;
  }

  // toggle auto pickup
  if (key == '@') {
    nomove = 1;
    auto_pickup = !auto_pickup;
    updateLog(`Auto-pickup: ${auto_pickup ? "on" : "off"}`);
    return;
  }

  //
  // help screen
  //
  if (key == '?') {
    nomove = 1;
    currentpage = 0;
    setCharCallback(parse_help);
    print_help();
    return;
  }

  //
  // wizard mode
  //
  if (key == '_') {
    nomove = 1;
    updateLog("Enter Password: ");
    setTextCallback(wizardmode);
    return;
  }

}
