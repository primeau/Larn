"use strict";

/* create new game */
function welcome() {
  IN_STORE = true;
  clear();
  cursor(1, 1);
  lprcat(helppages[0]);
  cursors();
  lprcat("Welcome to Larn. Please enter your name: ");
  setTextCallback(setname);
  blt();
}



function setname(name) {
  if (name)
    logname = name;

  cursors();
  cltoeoln();
  lprcat("What difficulty would you like to play? [default 0] ");
  setNumberCallback(setdifficulty, false);
  return 0;
}



function setdifficulty(hard) {
  IN_STORE = false;

  sethard(Number(hard)); /* set up the desired difficulty */

  makeplayer(); /*  make the character that will play  */

  newcavelevel(0); /*  make the dungeon */

  /* Display their mail if they've just won the previous game */
  //checkmail(); // TODO

  updateLog(`Welcome to Larn, ${logname} -- Press <b>?</b> for help`);
  drawscreen(); /*  show the initial dungeon */

  /*
   * init previous player position to be current position, so we don't
   * reveal any stuff on the screen prematurely.
   */
  oldx = player.x;
  oldy = player.y;

  return 1;
}



/*
makeplayer()

subroutine to create the player and the players attributes
this is called at the beginning of a game and at no other time
*/
function makeplayer() {
  player = new Player();

  /* he knows protection, magic missile */
  learnSpell("pro");
  learnSpell("mle");

  /* always know cure dianthroritis */
  learnPotion(createObject(OPOTION, 21));

  if (HARDGAME <= 0) {
    player.inventory[0] = createObject(OLEATHER);
    player.inventory[1] = createObject(ODAGGER);
    player.WEAR = player.inventory[0];
    player.WIELD = player.inventory[1];
  }

  player.x = rnd(MAXX - 2);
  player.y = rnd(MAXY - 2);

  recalc();

  // newcavelevel(0);
  //
  // regen();
  //
  // showcell(player.x, player.y);
  //
  // paint();

}



/*
    function to set the desired hardness
    enter with hard= -1 for default hardness, else any desired hardness
 */
function sethard(hard) {
  HARDGAME = Math.max(0, hard);

  // hashewon(); TODO

  var i;
  var k = HARDGAME;
  if (HARDGAME)
    for (var j = 0; j < monsterlist.length; j++) {
      var monster = monsterlist[j];
      var before;

      /* JRP we don't need to worry about blowing int boundaries
         so we can keep making things harder as difficulty goes up */
      i = ((6 + k) * monster.hitpoints + 1) / 6;
      //monster.hitpoints = Math.min(32767, Math.round(i));
      monster.hitpoints = Math.round(i);

      i = ((6 + k) * monster.damage + 1) / 5;
      //monster.damage = Math.min(127, Math.round(i));
      monster.damage = Math.round(i);

      i = (10 * monster.gold) / (10 + k);
      //monster.gold = Math.min(32767, Math.round(i));
      monster.gold = Math.round(i);

      i = monster.armorclass - k;
      //monster.armorclass = Math.max(-127, Math.round(i));
      monster.armorclass = Math.round(i);

      i = (7 * monster.experience) / (7 + k) + 1;
      //monster.experience = Math.max(1, Math.round(i));
      monster.experience = Math.round(i);

      //console.log(`${monster.char}: hp:${monster.hitpoints}, d:${monster.damage}, g:${monster.gold}, ac:${monster.armorclass}, x:${monster.experience}`);
    }
}



/*
  JRP
  since we're running in a event-driven system we need to
  turn the original main loop a little bit inside-out
*/
function mainloop(e) {

  if (napping) {
    debug("napping");
    return;
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
      /* JRP: larn12.4 start spheres 1 extra space away,
      uncomment the code below to prevent that */
      // if (!newsphereflag) {
      movsphere();
      // } else {
      //   newsphereflag = false;
      // }

      if (hitflag == 0) {
        if (player.HASTEMONST) {
          movemonst();
        }
        movemonst();
      }
    }
  }

  /* show stuff around the player */
  // TODO
  if (viewflag == 0)
    showcell(player.x, player.y);
  else
    viewflag = 0;

  hitflag = 0;
  hit3flag = 0;
  bot_linex(); /* update bottom line */

  showplayer(); // JRP NEW (was in yylex())

  paint();
}







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

  var newx = player.x; // TODO needed?
  var newy = player.y;

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
  // DO NOTHING
  //
  if (key == ' ' || code == ESC) {
    nomove = 1;
    return;
  }

  //
  // STAY HERE
  //
  if (key == '.') {
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
      setCharCallback(drop_object, true);
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
        setCharCallback(act_eatcookie, true);
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
    cursors();
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
        setCharCallback(act_quaffpotion, true); // TODO this should fall through?
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
        setCharCallback(act_read_something, true);
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
    // lookforobject( false, true, false ); // TODO???
    if (take(item)) {
      forget(); // remove from board
    } else {
      nomove = 1;
    }
    return;
  }

  //
  // version
  //
  if (key == 'v') {
    updateLog(`JS Larn, Version 12.4.4 build 137 -- Difficulty ${HARDGAME}`);
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
      setCharCallback(wield, true);
    }
    return;
  }

  // TODO z - show scores

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
  // REMOVE GEMS
  //
  if (key == 'G') {
    remove_gems();
    dropflag = 1;
    return;
  }

  //
  // list spells and scrolls
  //
  if (key == 'I') {
    seemagic(false);
    setCharCallback(parse_see_all, true);
    return;
  }

  //
  // outstanding taxes
  //
  if (key == 'P') {
    cursors();
    nomove = 1;
    if (outstanding_taxes > 0)
      updateLog(`You presently owe ${outstanding_taxes} gold pieces in taxes`);
    else
      updateLog("You do not owe any taxes");
    return;
  }

  // TODO? Q - quit

  //
  // load saved game
  //
  if (key == 'R') {
    nomove = 1;
    setCharCallback(parseLoadSavedGame, true);
    updateLog("Do you want to load your saved game [<b>y</b>/<b>n</b>] ? ")
    return;
  }

  //
  // S - save game
  //
  if (key == 'S') {
    nomove = 1;
    saveGame();
    return;
  }

  //
  // take off armor
  //
  if (key == 'T') {
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
    if (item.isArmor()) {
      wear(item);
    } else {
      updateLog("What do you want to wear [<b>space</b> to view] ? ");
      setCharCallback(wear, true);
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
  // UP LEVEL // TODO MAKE LESS COMPLICATED
  //
  else if (key == '<') { // UP STAIRS
    if (isItem(newx, newy, OSTAIRSUP)) {
      newcavelevel(level - 1);
      //positionplayer(newx, newy, true);
    } else if (isItem(newx, newy, OVOLUP)) {
      act_up_shaft();
      return;
    } else if (DEBUG_STAIRS_EVERYWHERE) {
      nomove = 1;
      if (level == 0) {
        // do nothing
      } else if (level == 1) {
        debug("STAIRS_EVERYWHERE: going to home level");
        newcavelevel(0);
        moveNear(OENTRANCE, false);
      } else if (level == 11) {
        debug("STAIRS_EVERYWHERE: climbing up volcanic shaft");
        act_up_shaft();
        return;
      } else {
        debug("STAIRS_EVERYWHERE: climbing up stairs");
        moveNear(OSTAIRSUP, true);
        newcavelevel(level - 1);
        return;
      }
    } else if (isItem(newx, newy, OSTAIRSDOWN)) {
      updateLog("The stairs don't go up!");
    } else if (!isItem(newx, newy, OSTAIRSUP) || !isItem(newx, newy, OVOLUP)) {
      // we can only go up stairs, or volcanic shaft leading upward
      updateLog("I see no way to go up here!");
    }
    return;
  }

  //
  // DOWN LEVEL // TODO MAKE LESS COMPLICATED
  //
  else if (key == '>') { // DOWN STAIRS
    if (isItem(newx, newy, OSTAIRSDOWN)) {
      newcavelevel(level + 1);
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
      if (level == 0) {
        debug("STAIRS_EVERYWHERE: entering dungeon");
        newcavelevel(level + 1);
        return;
      } else if (level != 10 && level != 13) {
        debug("STAIRS_EVERYWHERE: climbing down stairs");
        moveNear(OSTAIRSDOWN, true);
        newcavelevel(level + 1);
        return;
      }
    } else if (isItem(newx, newy, OSTAIRSUP)) {
      updateLog("The stairs don't go down!");
    } else if (!isItem(newx, newy, OSTAIRSDOWN) || !isItem(newx, newy, OVOLDOWN)) {
      updateLog("I see no way to go down here!");
    }
    return;
  }

  //
  // identify traps
  //
  if (key == '^') {
    var flag = 0;
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

  //
  // look at object
  //
  if (key == ':') {
    /* identify, don't pick up or prompt for action */
    lookforobject(true, false, false);
    nomove = 1; /* assumes look takes no time */
    return;
  }

  // TODO @ - toggle auto pickup

  //
  // help screen
  //
  if (key == '?') {
    var currentpage = 0;

    function parse_help(key) {
      if (key == ESC) {
        return exitbuilding();
      } else if (key == ' ') {
        print_help();
      }
    }

    function print_help() {
      IN_STORE = true;
      clear();
      cursor(1, 1);
      if (++currentpage > helppages.length - 1) {
        currentpage = 1;
      }
      lprcat(helppages[currentpage]);
      cursors();
      lprcat("              ---- Press <b>space</b> for more help, <b>escape</b> to exit  ----");

      blt();
    }
    setCharCallback(parse_help, true);
    print_help();
    return;
  }

  //
  // wizard mode
  //
  if (key == '_') {
    nomove = 1;
    wizard = 1; /* disable to easily test win condition */

    player.STRENGTH = 70;
    player.INTELLIGENCE = 70;
    player.WISDOM = 70;
    player.CONSTITUTION = 70;
    player.DEXTERITY = 70;
    player.CHARISMA = 70;

    player.WEAR = null;
    player.inventory[0] = createObject(OLANCE, 25);
    player.WIELD = player.inventory[0];
    player.inventory[1] = createObject(OPROTRING, 50);

    player.raiseexperience(6000000);
    player.AWARENESS = 100000;

    for (var i = 0; i < MAXY; i++)
      for (var j = 0; j < MAXX; j++)
        player.level.know[j][i] = KNOWALL;

    for (var i = 0; i < spelcode.length; i++) {
      learnSpell(spelcode[i]);
    }

    for (var scrolli = 0; scrolli < scrollname.length; scrolli++) {
      var scroll = createObject(OSCROLL, scrolli);
      learnScroll(scroll);
      player.level.items[scrolli][0] = scroll;
    }

    for (var potioni = MAXX - 1; potioni > MAXX - 1 - potionname.length; potioni--) {
      var potion = createObject(OPOTION, MAXX - 1 - potioni);
      learnPotion(potion);
      player.level.items[potioni][0] = potion;
    }


    for (i = 1; i < MAXY; i++) {
      //var item = createObject()
      //player.level.items[0][i] = item;
    }
    for (i = MAXY; i < MAXY + MAXX; i++) {
      //var item = createObject()
      //player.level.items[i - MAXY][MAXY - 1] = item;
    }
    for (i = MAXX + MAXY; i < MAXOBJECT; i++) {
      //var item = createObject()
      //player.level.items[MAXX - 1][i - MAXX - MAXY] = item;
    }

    player.GOLD = 250000;
    return;
  }



  parseDebug(key);

} // parse
/*****************************************************************************/
/*****************************************************************************/
/*****************************************************************************/



function parse2() {
  if (player.HASTEMONST > 0) {
    movemonst();
  }
  movemonst(); /* move the monsters */
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



/*
    subroutine to randomly create monsters if needed
 */
function randmonst() {
  if (player.TIMESTOP) return; /*  don't make monsters if time is stopped  */
  if (--rmst <= 0) {
    rmst = 120 - (level << 2);
    fillmonst(makemonst(level));
  }
}
