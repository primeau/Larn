"use strict";

var dropflag = 0; /* if 1 then don't lookforobject() next round */
var rmst = 120; /* random monster creation counter */
var nomove = 0; /* if (nomove) then don't count next iteration as a move */
var viewflag = 0; /* if viewflag then we have done a 99 stay here and don't showcell in the main loop */

var napping = false; // prevent keyboard input while a nap event is happening

/*
    subroutine to randomly create monsters if needed
 */
function randmonst() {
  if (player.TIMESTOP) return; /*  don't make monsters if time is stopped  */
  if (--rmst <= 0) {
    rmst = 120 - (player.level.depth << 2);
    fillmonst(makemonst(player.level.depth));
  }
}


/*****************************************************************************/
/*****************************************************************************/
/*****************************************************************************/
/*
  JRP
  since we're running in a event-driven system we need to
  turn the original main loop a little bit inside-out
*/
function mainloop(e) {

  if (napping) {
    return;
  }

  if (hit3flag) {
    //lflushall(); // TODO what is this for?
  }

  nomove = 0;

  parse(e);

  if (nomove == 1) {
    paint();
    return;
  }

  regen(); /*  regenerate hp and spells            */
  randmonst();

  // JRP: this is the end of the old main loop

  /* see if there is an object here.

     If in prompt mode, identify and prompt; else
     identify, pickup if ( auto pickup and not move-no-pickup ),
     never prompt.
  */
  if (dropflag == 0) {
    // if (prompt_mode)
    lookforobject(true, false, true);
    // else
    //   lookforobject(true, (auto_pickup && !move_no_pickup), false);
  } else {
    dropflag = 0; /* don't show it just dropped an item */
  }

  /* handle global activity
     update game time, move spheres, move walls, move monsters
     all the stuff affected by TIMESTOP and HASTESELF
  */
  if (player.TIMESTOP <= 0) {
    if (player.HASTESELF == 0 || (player.HASTESELF & 1) == 0) {
      gtime++;
      // movsphere(); // TODO
      if (hitflag == 0) {
        if (player.HASTEMONST) {
          movemonst();
        }
        movemonst();
      }
    }
  }

  /* show stuff around the player
   */
  // TODO
  if (viewflag == 0)
    showcell(player.x, player.y);
  else
    viewflag = 0;

  if (hit3flag) {
    //lflushall();
  }
  hitflag = 0;
  hit3flag = 0;
  bot_linex(); /* update bottom line */

  showplayer(); // JRP NEW (was in yylex())

  paint();
}
/*****************************************************************************/
/*****************************************************************************/
/*****************************************************************************/







var DEBUG_STATS = false;
var DEBUG_OUTPUT = false;
var DEBUG_STAIRS_EVERYWHERE = false;
var DEBUG_KNOW_ALL = false;
var DEBUG_IMMORTAL = false;
var DEBUG_PAINT = 0;
var DEBUG_LPRCAT = 0;
var DEBUG_LPRC = 0;
var DEBUG_PROXIMITY = false;

/*****************************************************************************/
/*****************************************************************************/
/*****************************************************************************/
function parse(e) {

  var code = e.which;
  var key = String.fromCharCode(code);

  if (e.which == undefined) {
    key = e;
  }

  // if (blocking_callback != null)
  // debug("blocking: " + blocking_callback.name);
  // if (non_blocking_callback != null)
  // debug("non_blocking: " + non_blocking_callback.name);
  // if (keyboard_input_callback != null)
  // debug("keyboard_input_callback: " + keyboard_input_callback.name);
  //
  // debug(`parse(): got: ${code}: ${key}`);

  if (code == ENTER) {
    key = ENTER;
  }
  if (code == DEL_CODE) {
    key = DEL;
  }

  var newx = player.x;
  var newy = player.y;

  if (blocking_callback != null) {
    //debug(blocking_callback.name + ": ");
    var before = blocking_callback.name;
    let done = blocking_callback(code == ESC ? ESC : key, code);
    var after = blocking_callback.name;
    //debug(blocking_callback.name + ": " + done);

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

  if (non_blocking_callback != null) {
    non_blocking_callback(code == ESC ? ESC : key, code);
    non_blocking_callback = null;
  }

  var item = getItem(player.x, player.y);


  //
  // MOVE PLAYER
  //
  var dir = parseDirectionKeys(key, code);
  if (dir > 0) {
    if (e.shiftKey) {
      run(dir);
    } else {
      moveplayer(dir);
    }
    return;
  }

  //
  // STAY HERE
  //
  if (key == '.') {
    if (yrepcount)
      viewflag = 1;
    return;
  }

  //
  // CAST A SPELL
  //
  if (key == 'c') {
    yrepcount = 0;
    pre_cast();
    return;
  }

  //
  // DROP
  //
  if (key == 'd') {
    yrepcount = 0;
    if (player.TIMESTOP == 0) {
      updateLog("What do you want to drop [Space to view] ? ");
      setCharCallback(drop_object, true);
    }
    return;
  }

  //
  // EAT COOKIE
  //
  if (key == 'e') {
    yrepcount = 0;
    if (player.TIMESTOP == 0)
      if (item.matches(OCOOKIE)) {
        outfortune();
        forget();
      } else {
        updateLog("What do you want to eat [Space to view] ? ");
        setCharCallback(act_eatcookie, true);
      }
    return;
  }

  //
  // EAT COOKIE
  //
  if (key == 'g') {
    yrepcount = 0;
    cursors();
    updateLog(`The stuff you are carrying presently weighs ${Math.round(packweight())} pounds`);
    return;
  }

  //
  // INVENTORY
  //
  if (key == 'i') {
    yrepcount = 0;
    nomove = 1;
    showinventory(false, parse_inventory, showall, true, true);
    return;
  }

  //
  // PRAY
  //
  if (key == 'p') {
    yrepcount = 0;
    pray_at_altar();
    dropflag = 1;
    prayed = 1;
    return;
  }

  //
  // quaff
  //
  if (key == 'q') {
    yrepcount = 0;
    if (player.TIMESTOP == 0)
      if (item.matches(OPOTION)) {
        forget();
        quaffpotion(item, true);
      } else {
        updateLog("What do you want to quaff [Space to view] ? ");
        setCharCallback(act_quaffpotion, true); // TODO this should fall through?
      }
    return;
  }

  //
  // read
  //
  if (key == 'r') {
    yrepcount = 0;
    if (player.BLINDCOUNT > 0) {
      cursors();
      updateLog("You can't read anything when you're blind!");
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
        updateLog("What do you want to read [Space to view] ? ");
        setCharCallback(act_read_something, true);
      }
    }
    return;
  }

  //
  // sit on throne
  //
  if (key == 's') {
    yrepcount = 0;
    sit_on_throne();
    dropflag = 1;
    return;
  }

  //
  // TIDY UP AT FOUNTAIN
  //
  if (key == 'f') {
    yrepcount = 0;
    wash_fountain(null);
    dropflag = 1;
    return;
  }

  // TODO version

  //
  // WIELD
  //
  if (key == 'w') {
    yrepcount = 0;
    if (item.canWield()) {
      wield(item);
    } else {
      updateLog("What do you want to wield (-) for nothing [Space to view] ? ");
      setCharCallback(wield, true);
    }
    return;
  }

  //
  // DESECRATE
  //
  if (key == 'A') {
    yrepcount = 0;
    desecrate_altar();
    dropflag = 1;
    return;
  }

  //
  // CLOSE DOOR
  //
  if (key == 'C') {
    yrepcount = 0;
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
    yrepcount = 0;
    drink_fountain(null);
    dropflag = 1;
    return;
  }

  //
  // ENTER A BUILDING
  //
  if (key == 'E') {
    yrepcount = 0;
    enter();
    return;
  }

  //
  // list spells and scrolls
  //
  if (key == 'I') {
    yrepcount = 0;
    seemagic(false);
    setCharCallback(parse_see_all, true);
    return;
  }

  //
  // OPEN (in a direction)
  //
  if (key == 'O' || key == 'o') {
    yrepcount = 0;
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

  // TODO P - outstanding taxes
  // TODO? Q - quit

  //
  // REMOVE GEMS
  //
  if (key == 'R') {
    yrepcount = 0;
    remove_gems();
    dropflag = 1;
    return;
  }

  // TODO S - save game


  //
  // take off armor
  //
  if (key == 'T') {
    yrepcount = 0;
    if (player.SHIELD) {
      player.SHIELD = null;
      updateLog("Your shield is off");
      //bottomline();
    } else
    if (player.WEAR) {
      player.WEAR = null;
      updateLog("Your armor is off");
      //bottomline();
    } else
      updateLog("You aren't wearing anything");
    return;
  }

  //
  // WEAR
  //
  if (key == 'W') {
    yrepcount = 0;
    if (item.isArmor()) {
      wear(item);
    } else {
      updateLog("What do you want to wear [Space to view] ? ");
      setCharCallback(wear, true);
    }
    return;
  }

  //
  // TELEPORT
  //
  if (key == 'Z') {
    yrepcount = 0;
    if (player.LEVEL > 9) {
      oteleport(1);
      return;
    }
    cursors();
    updateLog("As yet, you don't have enough experience to use teleportation");
    return;
  }

  //
  // SPACE
  //
  if (key == ' ') {
    yrepcount = 0;
    nomove = 1;
  }


  // <
  // >


  // TODO ? - help screen

  //
  // PICK UP
  //
  if (key == ',' || key == 't') {
    yrepcount = 0;
    /* pickup, don't identify or prompt for action */
    // lookforobject( false, true, false ); // TODO???
    if (take(item)) {
      forget(); // remove from board
    } else {
      nomove = 1;
    }
    return;
  }

  //
  // /* look at object */
  //
  if (key == ':') {
    yrepcount = 0;
    /* identify, don't pick up or prompt for action */
    lookforobject(true, false, false);
    nomove = 1; /* assumes look takes no time */
    return;
  }

  // TODO @ - toggle auto pickup
  // TODO / - identify object / monster

  //
  // /* identify traps */
  //
  if (key == '^') {
    var flag = yrepcount = 0;
    for (var j = vy(player.y - 1); j < vy(player.y + 2); j++) {
      for (var i = vx(player.x - 1); i < vx(player.x + 2); i++) {
        var trap = getItem(i, j);
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



  // TODO _ - wizard id



  //
  // UP LEVEL // TODO MAKE LESS COMPLICATED
  //
  else if (key == '<') { // UP STAIRS
    if (isItem(newx, newy, OSTAIRSUP)) {
      newcavelevel(player.level.depth - 1);
      //positionplayer(newx, newy, true);
    } else if (isItem(newx, newy, OVOLUP)) {
      act_up_shaft();
      return;
    } else if (DEBUG_STAIRS_EVERYWHERE) {
      nomove = 1;
      if (player.level.depth == 0) {
        // do nothing
      } else if (player.level.depth == 1) {
        debug("STAIRS_EVERYWHERE: going to home level");
        newcavelevel(0);
        moveNear(OENTRANCE, false);
      } else if (player.level.depth == 11) {
        debug("STAIRS_EVERYWHERE: climbing up volcanic shaft");
        act_up_shaft();
        return;
      } else {
        debug("STAIRS_EVERYWHERE: climbing up stairs");
        moveNear(OSTAIRSUP, true);
        newcavelevel(player.level.depth - 1);
        return;
      }
    } else if (isItem(newx, newy, OSTAIRSDOWN)) {
      updateLog("The stairs don't go up!");
    } else if (!isItem(newx, newy, OSTAIRSUP) || !isItem(newx, newy, OVOLUP)) {
      // we can only go up stairs, or volcanic shaft leading upward
      updateLog("I see no way to go up here!");
    }
  }

  //
  // DOWN LEVEL // TODO MAKE LESS COMPLICATED
  //
  else if (key == '>') { // DOWN STAIRS
    if (isItem(newx, newy, OSTAIRSDOWN)) {
      newcavelevel(player.level.depth + 1);
      //positionplayer(newx, newy, true);
    } else if (isItem(newx, newy, OVOLDOWN)) {
      act_down_shaft();
      return;
    } else if (isItem(newx, newy, OENTRANCE)) {
      // updateLog("Entering Dungeon");
      // player.x = Math.floor(MAXX / 2);
      // player.y = MAXY - 2;
      // newcavelevel(1);
    } else if (DEBUG_STAIRS_EVERYWHERE) {
      nomove = 1;
      if (player.level.depth == 0) {
        debug("STAIRS_EVERYWHERE: entering dungeon");
        newcavelevel(player.level.depth + 1);
        return;
      } else if (player.level.depth != 10 && player.level.depth != 13) {
        debug("STAIRS_EVERYWHERE: climbing down stairs");
        moveNear(OSTAIRSDOWN, true);
        newcavelevel(player.level.depth + 1);
        return;
      }
    } else if (isItem(newx, newy, OSTAIRSUP)) {
      updateLog("The stairs don't go down!");
    } else if (!isItem(newx, newy, OSTAIRSDOWN) || !isItem(newx, newy, OVOLDOWN)) {
      updateLog("I see no way to go down here!");
    }

  }

  //
  // DEBUGGING SHORTCUTS
  //
  if (key == 'V') { // CLIMB IN/OUT OF VOLCANO
    if (player.level.depth == 0 && DEBUG_STAIRS_EVERYWHERE) {
      nomove = 1;
      debug("STAIRS_EVERYWHERE: entering volcano");
      moveNear(OVOLDOWN, true);
      act_down_shaft();
      return;
    }
  }
  if (key == 'X' || key == '~') {
    DEBUG_STATS = !DEBUG_STATS;
    nomove = 1;
    updateLog("DEBUG_STATS: " + DEBUG_STATS);
  }
  if (key == 'X' || key == '!') {
    DEBUG_OUTPUT = !DEBUG_OUTPUT;
    nomove = 1;
    updateLog("DEBUG_OUTPUT: " + DEBUG_OUTPUT);
  }
  if (key == 'X' || key == '@') {
    nomove = 1;
    player.WTW = player.WTW == 0 ? 100000 : 0;
    updateLog("DEBUG_WALK_THROUGH_WALLS: " + (player.WTW > 0));
  }
  if (key == 'X' || key == '#') {
    nomove = 1;
    DEBUG_STAIRS_EVERYWHERE = !DEBUG_STAIRS_EVERYWHERE;
    updateLog("DEBUG_STAIRS_EVERYWHERE: " + DEBUG_STAIRS_EVERYWHERE);
  }
  if (key == 'X' || key == '$') {
    nomove = 1;
    DEBUG_KNOW_ALL = !DEBUG_KNOW_ALL;
    wizard = DEBUG_KNOW_ALL;
    if (DEBUG_KNOW_ALL) {
      for (var potioni = 0; potioni < potionname.length; potioni++) {
        var potion = createObject(OPOTION, potioni);
        player.level.items[potioni][0] = potion;
      }
      for (var scrolli = 0; scrolli < scrollname.length; scrolli++) {
        var scroll = createObject(OSCROLL, scrolli);
        player.level.items[potioni + scrolli][0] = scroll;
      }
      var weaponi = 0;
      player.level.items[weaponi++][MAXY - 1] = createObject(ODAGGER);
      player.level.items[weaponi++][MAXY - 1] = createObject(OBELT);
      player.level.items[weaponi++][MAXY - 1] = createObject(OSPEAR);
      player.level.items[weaponi++][MAXY - 1] = createObject(OFLAIL);
      player.level.items[weaponi++][MAXY - 1] = createObject(OBATTLEAXE);
      player.level.items[weaponi++][MAXY - 1] = createObject(OLANCE);
      player.level.items[weaponi++][MAXY - 1] = createObject(OLONGSWORD);
      player.level.items[weaponi++][MAXY - 1] = createObject(O2SWORD);
      player.level.items[weaponi++][MAXY - 1] = createObject(OSWORD);
      player.level.items[weaponi++][MAXY - 1] = createObject(OSWORDofSLASHING);
      player.level.items[weaponi++][MAXY - 1] = createObject(OHAMMER);
      var armori = weaponi;
      player.level.items[armori++][MAXY - 1] = createObject(OSHIELD);
      player.level.items[armori++][MAXY - 1] = createObject(OLEATHER);
      player.level.items[armori++][MAXY - 1] = createObject(OSTUDLEATHER);
      player.level.items[armori++][MAXY - 1] = createObject(ORING);
      player.level.items[armori++][MAXY - 1] = createObject(OCHAIN);
      player.level.items[armori++][MAXY - 1] = createObject(OSPLINT);
      player.level.items[armori++][MAXY - 1] = createObject(OPLATE);
      player.level.items[armori++][MAXY - 1] = createObject(OPLATEARMOR);
      player.level.items[armori++][MAXY - 1] = createObject(OSSPLATE);

      player.level.items[armori++][MAXY - 1] = createObject(ODAMRING);
      player.level.items[armori++][MAXY - 1] = createObject(ODEXRING);
      player.level.items[armori++][MAXY - 1] = createObject(OSTRRING);
      player.level.items[armori++][MAXY - 1] = createObject(OENERGYRING);
      player.level.items[armori++][MAXY - 1] = createObject(OCLEVERRING);
      player.level.items[armori++][MAXY - 1] = createObject(OPROTRING);
      player.level.items[armori++][MAXY - 1] = createObject(OREGENRING);
      player.level.items[armori++][MAXY - 1] = createObject(ORINGOFEXTRA);

      player.level.items[armori++][MAXY - 1] = createObject(OSPIRITSCARAB);
      player.level.items[armori++][MAXY - 1] = createObject(OCUBEofUNDEAD);
      player.level.items[armori++][MAXY - 1] = createObject(ONOTHEFT);
      player.level.items[armori++][MAXY - 1] = createObject(OORBOFDRAGON);

      player.level.items[armori++][MAXY - 1] = createObject(OLARNEYE);
      player.level.items[armori++][MAXY - 1] = createObject(OEMERALD, 20);
      player.level.items[armori++][MAXY - 1] = createObject(OSAPPHIRE, 15);
      player.level.items[armori++][MAXY - 1] = createObject(ODIAMOND, 10);
      player.level.items[armori++][MAXY - 1] = createObject(ORUBY, 5);

      player.level.items[armori++][MAXY - 1] = createObject(OALTAR);
      player.level.items[armori++][MAXY - 1] = createObject(OTHRONE);
      player.level.items[armori++][MAXY - 1] = createObject(OFOUNTAIN);
      player.level.items[armori++][MAXY - 1] = createObject(OMIRROR);
      player.level.items[armori++][MAXY - 1] = createObject(OCHEST);

    }
    updateLog("DEBUG_KNOW_ALL: " + DEBUG_KNOW_ALL);
  }
  if (key == 'X' || key == '^') {
    nomove = 1;
    if (player.STEALTH <= 0) {
      updateLog("DEBUG: FREEZING MONSTERS");
      player.HOLDMONST = 100000;
      player.STEALTH = 100000;
    } else {
      updateLog("DEBUG: UNFREEZING MONSTERS");
      player.HOLDMONST = 0;
      player.STEALTH = 0;
    }
  }
  if ( /*key == 'X' ||*/ key == '+') {
    nomove = 1;
    DEBUG_IMMORTAL = !DEBUG_IMMORTAL;
    updateLog("DEBUG: IMMORTAL: " + DEBUG_IMMORTAL);
  }
  if (key == '`') {
    nomove = 1;
    if (player.AWARENESS <= 0) {
      updateLog("DEBUG: EXPANDED AWARENESS++");
      player.AWARENESS = 100000;
    } else {
      updateLog("DEBUG: EXPANDED AWARENESS--");
      player.AWARENESS = 0;
    }
  }
  if (key == ')') {
    nomove = 1;
    DEBUG_PROXIMITY = !DEBUG_PROXIMITY;
    if (!DEBUG_PROXIMITY) IN_STORE = false;
    updateLog("DEBUG: PROXIMITY: " + DEBUG_PROXIMITY);
    paint();
  }
  if (key == 'X') {
    nomove = 1;
    player.WEAR = null;
    player.inventory[0] = createObject(OLANCE, 25);
    player.WIELD = player.inventory[0];
    player.inventory[1] = createObject(OPROTRING, 50);
    player.STEALTH = 0;
    player.GOLD = 250000;
    player.STRENGTH = 70;
    player.INTELLIGENCE = 70;
    player.WISDOM = 70;
    player.CONSTITUTION = 70;
    player.DEXTERITY = 70;
    player.CHARISMA = 70;
    player.AWARENESS = 100000;
    player.raiseexperience(6000000 - player.EXPERIENCE);

    for (var i = 0; i < spelcode.length; i++) {
      learnSpell(spelcode[i]);
    }


  }
} // parse
/*****************************************************************************/
/*****************************************************************************/
/*****************************************************************************/









function parse2() {
  if (player.HASTEMONST > 0) {
    movemonst();
  }
  movemonst(); /* move the monsters       */
  randmonst();
  regen();
}



function run(dir) {
  var i = 1;
  while (i == 1) {
    i = moveplayer(dir);
    if (i > 0) {
      parse2();
    }
    if (hitflag == 1) {
      i = 0;
    }
    if (i != 0) {
      showcell(player.x, player.y);
    }
  }
}
