'use strict';

const ESC = 'escape';
const ENTER = 'return';
const SPACE = 'space';
const TAB = 'tab';
const DEL = `backspace`;
const CAPS = `CAPS`;
var UPPERCASE = false;



var blocking_callback;
var keyboard_input_callback;



// var BLOCKING = false;
// var ASYNC_KEYBOARD_EVENT_LISTENER;

// function waitForKeypress(KEY) {
//   BLOCKING = true; // only need to do 1 
//   //Mousetrap.reset(); // of these things
//   KEYBOARD_INPUT = ``;
//   debug(`waitforkeypress ` + KEY);
//   return new Promise((resolve, reject) => {
//     addEventListener('keydown', ASYNC_KEYBOARD_EVENT_LISTENER = function (event) {
//       var key = event.key;
//       if (event.which == 8) { // 8 == backspace
//         // if(!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly ){
//         event.preventDefault();
//         key = DEL;
//         // }
//       }
//       var got = getTextInput(key);
//       debug(`keylistener key=${key} got=${got} input=${KEYBOARD_INPUT}`);
//       if (BLOCKING && (key == ENTER || key == KEY)) {
//         removeEventListener('keydown', ASYNC_KEYBOARD_EVENT_LISTENER);
//         BLOCKING = false; // also only need to do
//         //initKeyBindings(); // one of these things
//         resolve(KEYBOARD_INPUT);
//         KEYBOARD_INPUT = ``;
//         debug(`DONE`);
//       }
//     });
//   });
// }



function mousetrap(e, key) {

  // if (BLOCKING) {
  //   debug(`blocking mousetrap: ` + BLOCKING);
  //   return;
  // }

  // debug(`mousetrap: ` + key);
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
  if (key == 7 || key == 'y' || key == 'Y' || key.indexOf('home') >= 0) { // UP,LEFT
    dir = 6;
  } else if (key == 9 || key == 'u' || key == 'U' || key.indexOf('pageup') >= 0) { // UP,RIGHT
    dir = 5;
  } else if (key == 8 || key == 'k' || key == 'K' || key.indexOf('up') >= 0) { // NORTH
    dir = 3;
  } else if (key == 4 || key == 'h' || key == 'H' || key.indexOf('left') >= 0) { // LEFT
    dir = 4;
  } else if (key == 6 || key == 'l' || key == 'L' || key.indexOf('right') >= 0) { // RIGHT
    dir = 2;
  } else if (key == 1 || key == 'b' || key == 'B' || key.indexOf('end') >= 0) { // DOWN,LEFT
    dir = 8;
  } else if (key == 3 || key == 'n' || key == 'N' || key.indexOf('pagedown') >= 0) { // DOWN, RIGHT
    dir = 7;
  } else if (key == 2 || key == 'j' || key == 'J' || key.indexOf('down') >= 0) { // DOWN
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
  // debug(`keyboard_input_callback: ` + keyboard_input_callback.name);

  //
  // upper/lower case keyboard input for mobile
  //
  if (key == CAPS) {
    nomove = 1;
    UPPERCASE = !UPPERCASE;
    return;
  }


  if (blocking_callback) {
    // debug(blocking_callback.name + `: `);
    var before = blocking_callback;
    var done = blocking_callback(key);

    // dumb hack until everything gets moved to async/await
    var isPromise = Promise.resolve(done) == done;
    if (isPromise) {
      debug('parse: ispromise');
      return;
    }

    var after = blocking_callback;
    // debug(blocking_callback.name + `: ` + done);

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
      updateLog(`What do you want to drop [<b>space</b> to view] ? `);
      setCharCallback(drop_object);
    }
    return;
  }

  //
  // EAT COOKIE
  //
  if (key == 'E' || key == 'e') {
    if (item.isStore()) {
      enter();
      return;
    }
    if (player.TIMESTOP == 0) {
      if (item.matches(OCOOKIE)) {
        outfortune();
        forget();
      } 
      else if (item.matches(OSHROOMS)) {
        eatShrooms();
        forget();
      } 
      else if (item.matches(OACID)) {
        dropAcid();
        forget();
      } 
      else {
        updateLog(`What do you want to eat [<b>space</b> to view] ? `);
        setCharCallback(act_eatcookie);
      }
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
    showinventory(false, parse_inventory, showall, true, true, true);
    return;
  }

  //
  // OPEN (in a direction)
  //
  if (key == 'o' || key == 'O') {
    /* check for confusion. */
    if (player.CONFUSE > 0) {
      updateLog(`You're too confused!`);
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
      if (nearPlayer(OCLOSEDDOOR) || nearPlayer(OCHEST)) {
        prepare_direction_event(open_something);
      } else {
        updateLog(`There is nothing to open!`);
        nomove = 1;
      }
    }
    dropflag = 1;
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
        updateLog(`What do you want to quaff [<b>space</b> to view] ? `);
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
      updateLog(`You can't read anything when you're blind!`);
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
        updateLog(`What do you want to read [<b>space</b> to view] ? `);
        setCharCallback(act_read_something);
      }
    }
    return;
  }

  //
  // sit on throne
  //
  if (key == 's') {
    if (player.TIMESTOP == 0) {
      if (item.matches(OSPEED)) {
        doSpeed();
        forget();
      } 
      else if (item.matches(OHASH)) {
        smokeHash();
        forget();
      } 
      else if (item.matches(OCOKE)) {
        doCoke();
        forget();
      } 
      else {
        sit_on_throne();
        dropflag = 1;
      }
    }
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
    var larnString = ULARN ? `The Addiction of JS Ularn` : `JS Larn`;
    updateLog(`${larnString}, Version ${VERSION} Build ${BUILD}`);
    updateLog(`  ${logname}`);
    if (ULARN) appendLog(`, ${player.char_picked}`);
    if (ULARN) appendLog(`, ${player.gender}`); 
    appendLog(`, Difficulty ${getDifficulty()}`); 
    if (debug_used) updateLog(`  Debug`);
    if (wizard) updateLog(`  Wizard`);
    if (cheat) updateLog(`  Cheater`);
    return;
  }

  //
  // WIELD
  //
  if (key == 'w') {
    if (item.isWeapon()) {
      wield(item);
    } else {
      updateLog(`What do you want to wield (-) for nothing [<b>space</b> to view] ? `);
      setCharCallback(wield);
    }
    return;
  }

  //
  // show scores
  //
  if (key == 'z') {
    nomove = 1;
    loadScores(null, true, false);
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
      updateLog(`You're too confused!`);
      beep();
      return;
    }
    if (item.matches(OOPENDOOR)) {
      close_something(0);
      return;
    } else {
      if (nearPlayer(OOPENDOOR)) {
        prepare_direction_event(close_something);
      } else {
        updateLog(`There is nothing to close!`);
        nomove = 1;
      }
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
  if (key == 'E' || key == 'e' || key == ENTER) {
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
      updateLog(`You do not owe any taxes`);
    return;
  }

  //
  // Q - quit
  //
  if (key == 'Q') {
    nomove = 1;
    setCharCallback(parseQuit);
    updateLog(`Do you really want to quit (all progress will be lost) [<b>y</b>/<b>n</b>] ? `)
    return;
  }

  function parseQuit(key) {
    nomove = 1;
    if (key == ESC || key == 'n' || key == 'N') {
      appendLog(` no`);
      return 1;
    }
    if (key == 'y' || key == 'Y') {
      appendLog(` yes`);
      died(DIED_QUITTER, false); /* a quitter */
      return 1;
    }
    return 0;
  }

  //
  // REMOVE GEMS
  //
  if (key == 'R') {
    if (item.matches(OBRASSLAMP)) {
      act_rub_lamp();
    } else {
      remove_gems();
    }
    dropflag = 1;
    return;
  }



  //
  // S - save game
  //
  if (key == 'S') {
    nomove = 1;
    saveGame();
    if (!NOCOOKIES) died(DIED_SAVED_GAME, false); /* saved game */
    return;
  }

  //
  // take off armor
  //
  if (key == 'T') {
    if (player.SHIELD) {
      player.SHIELD = null;
      updateLog(`Your shield is off`);
    } else
    if (player.WEAR) {
      player.WEAR = null;
      updateLog(`Your armor is off`);
    } else
      updateLog(`You aren't wearing anything`);
      nomove = 1;
    return;
  }

  //
  // WEAR
  //
  if (key == 'W') {
    if (item.isArmor()) {
      wear(item);
    } else {
      updateLog(`What do you want to wear [<b>space</b> to view] ? `);
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
    updateLog(`As yet, you don't have enough experience to use teleportation`);
    return;
  }

  //
  // UP STAIRS
  //
  if (key == '<') {

    if (DEBUG_STAIRS_EVERYWHERE) {
      if (level == MAXLEVEL) {
        newcavelevel(0);
        return;
      }
      if (level != 0) {
        newcavelevel(level - 1);
        return;
      }
    }

    up_stairs();

    return;
  }

  //
  // DOWN STAIRS
  //
  if (key == '>') {

    if (DEBUG_STAIRS_EVERYWHERE) {
      if (!item.matches(OVOLDOWN) && level != DBOTTOM && level != VBOTTOM) {
        newcavelevel(level + 1);
        return;
      }
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
          case OELEVATORUP.id:
          case OELEVATORDOWN.id:
            updateLog(`It's ${trap}`);
            flag++;
        }
      }
    }
    if (flag == 0)
      updateLog(`No traps are visible`);
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
  // toggle extra keyboard help mode
  //
  if (key == '!') {
    nomove = 1;
    keyboard_hints = !keyboard_hints;
    updateLog(`Keyboard hints: ${keyboard_hints ? `on` : `off`}`);
    if (keyboard_hints)
      lookforobject(true, false, false);
    return;
  }

  // toggle auto pickup
  if (key == '@') {
    nomove = 1;
    auto_pickup = !auto_pickup;
    updateLog(`Auto-pickup: ${auto_pickup ? `on` : `off`}`);
    return;
  }

  // toggle inventory on right side
  if (key == '#') {
    nomove = 1;
    side_inventory = !side_inventory;
    updateLog(`Inventory view: ${side_inventory ? `on` : `off`}`);
    return;
  }

  //
  // toggle color
  //
  if (key == '$') {
    nomove = 1;
    show_color = !show_color;
    updateLog(`Colors: ${show_color ? `on` : `off`}`);
    return;
  }

  //
  // toggle bold
  //
  if (key == '%') {
    nomove = 1;
    bold_objects = !bold_objects;
    updateLog(`Bold objects: ${bold_objects ? `on` : `off`}`);
    return;
  }

  //
  // wizard mode
  //
  if (key == '_') {
    nomove = 1;
    updateLog(`Enter Password: `);
    setTextCallback(wizardmode);
    return;
  }

  // if we get here, it's an invalid key, and shouldn't take any time
  nomove = 1;

}