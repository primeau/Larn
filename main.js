"use strict";

/* create new game */
function welcome() {
  IN_STORE = true;
  clear();
  cursor(1, 1);
  lprcat(helppages[0]);
  cursors();

  logname = localStorage.getObject('logname') || "Adventurer";

  lprcat(`Welcome to Larn. Please enter your name [<b>${logname}</b>]: `);
  setTextCallback(setname);
  blt();
}



function setname(name) {
  if (name) {
    logname = name.substring(0, 19);
    localStorage.setObject('logname', logname);
  }

  cursors();
  cltoeoln();

  var saveddata = localStorage.getObject(logname);
  var checkpoint;

  var winner = false;
  var savegame = false;

  /* if saveddata == winner, player won last time around */
  /* otherwise if saveddata exits, it's the save game file */
  if (saveddata != null) {
    winner = saveddata == "winner";
    savegame = !winner;
  }
  /* check for a checkpoint file */
  else {
    checkpoint = localStorage.getObject('checkpoint');
  }

  console.log("winner == " + winner);
  console.log("savegame == " + savegame);
  console.log("checkpoint == " + (checkpoint != null));

  HARDGAME = localStorage.getObject('difficulty') || 0;

  if (winner) {
    // force difficulty to be one harder
    HARDGAME += 1;
    readmail();
    // clear the mail flag
    localStorage.removeItem(logname);
  } else if (savegame || checkpoint) {
    player = new Player();
    if (savegame)
      loadSavedGame(saveddata, false);
    else
      loadSavedGame(checkpoint, true);
    setdifficulty(HARDGAME);
    return 1;
  } else {
    lprcat(`What difficulty would you like to play? [<b>${HARDGAME}</b>] `);
    setNumberCallback(startgame, false);
  }
  return 0;
}



function startgame(hard) {

  if (highestScore) {
    HARDGAME = highestScore.hardlev + 1;
    setdifficulty(HARDGAME);
  } else {
    setdifficulty(hard);
  }

  makeplayer(); /*  make the character that will play  */

  newcavelevel(0); /*  make the dungeon */

  IN_STORE = false;

  updateLog(`Welcome to Larn, ${logname} -- Press <b>?</b> for help`);

  // regen();

  showcell(player.x, player.y);

  //drawscreen(); /*  show the initial dungeon */
  paint();

  /*
   * init previous player position to be current position, so we don't
   * reveal any stuff on the screen prematurely.
   */
  oldx = player.x;
  oldy = player.y;

  return 1;
}



function setdifficulty(hard) {
  if (hard == "") {
    hard = HARDGAME; // use the default we set in setname
  }

  sethard(Number(hard)); /* set up the desired difficulty */

  localStorage.setObject('difficulty', HARDGAME);

  return 1;
}



/*
    function to set the desired hardness
    enter with hard= -1 for default hardness, else any desired hardness
 */
function sethard(hard) {

  HARDGAME = Math.max(0, hard);

  console.log("setting difficulty: " + HARDGAME);

  // hashewon(); TODO

  var i;
  var k = HARDGAME;
  if (HARDGAME)
    for (var j = 0; j < monsterlist.length; j++) {
      var monster = monsterlist[j];

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
    lookforobject(true, auto_pickup, false);
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
  // if (viewflag == 0)
  showcell(player.x, player.y);
  //else
  //   viewflag = 0;

  hitflag = 0;
  hit3flag = 0;
  bot_linex(); /* update bottom line */


  if (gtime >= 400 && gtime % 100 == 0) {
    saveGame(true);
  }


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
  //console.log(`parse(): got: ${code}: ${key}`);

  if (code == ENTER) {
    key = ENTER;
  }
  if (code == DEL_CODE) {
    key = DEL;
  }

  if (blocking_callback != null) {
    //debug(blocking_callback.name + ": ");
    var before = blocking_callback.name;
    var done = blocking_callback(code == ESC ? ESC : key, code);
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
    lookforobject(false, true, false);
    return;
  }

  //
  // version
  //
  if (key == 'v') {
    nomove = 1;
    updateLog(`JS Larn, Version 12.4.4 build 158 -- Difficulty ${HARDGAME}`);
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
    setCharCallback(parse_see_all, true);
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
    setCharCallback(parseQuit, true);
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
      died(286, false);
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

  // //
  // // load saved game
  // //
  // if (key == 'G') {
  //   nomove = 1;
  //   setCharCallback(parseLoadSavedGame, true);
  //   updateLog("Do you want to load your saved game [<b>y</b>/<b>n</b>] ? ")
  //   return;
  // }

  //
  // S - save game
  //
  if (key == 'S') {
    nomove = 1;
    saveGame();
    died(287, false);
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

  else if (key == '<') { // UP STAIRS

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

  else if (key == '>') { // DOWN STAIRS

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
    setCharCallback(parse_help, true);
    print_help();
    return;
  }

  //
  // wizard mode
  //
  if (key == '_') {
    nomove = 1;
    updateLog("Enter Password: ");
    setTextCallback(wizardmode, true);
    return;
  }

} // parse
/*****************************************************************************/
/*****************************************************************************/
/*****************************************************************************/



function wizardmode(password) {

  if (password === 'checkpoint') {
    updateLog("reload to restart from backup checkpoint");
    var checkpoint = localStorage.getItem('checkpointbackup');
    localStorage.setItem('checkpoint', checkpoint);
    return 1;
  }

  if (password === 'savegame') {
    updateLog("reload to restart from backup save game");
    var savegame = localStorage.getItem(logname + 'backup');
    localStorage.setItem(logname, savegame);
    return 1;
  }

  if (password === 'debug') {
    updateLog("debugging shortcuts enabled");
    enableDebug();
    return 1;
  }

  //  if (password !== 'pvnert(x)') {
  if (password !== 'pvnert') {
    updateLog("Sorry");
    return 1;
  }

  wizard = 1;

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

  var ix = 0;
  var iy = 1;
  player.level.items[ix][iy++] = createObject(OEMPTY);
  player.level.items[ix][iy++] = createObject(OALTAR);
  player.level.items[ix][iy++] = createObject(OTHRONE);
  player.level.items[ix][iy++] = createObject(OPIT);
  player.level.items[ix][iy++] = createObject(OSTAIRSUP);
  player.level.items[ix][iy++] = createObject(OFOUNTAIN);
  player.level.items[ix][iy++] = createObject(OTELEPORTER);
  player.level.items[ix][iy++] = createObject(OSCHOOL);
  player.level.items[ix][iy++] = createObject(OMIRROR);
  player.level.items[ix][iy++] = createObject(ODNDSTORE);
  player.level.items[ix][iy++] = createObject(OSTAIRSDOWN);
  player.level.items[ix][iy++] = createObject(OBANK2);
  player.level.items[ix][iy++] = createObject(OBANK);
  player.level.items[ix][iy++] = createObject(ODEADFOUNTAIN);
  player.level.items[ix][iy++] = createObject(OGOLDPILE);
  player.level.items[ix][iy++] = createObject(OHOMEENTRANCE);

  ix = 1
  iy = MAXY - 1;
  player.level.items[ix++][iy] = createObject(OOPENDOOR);
  player.level.items[ix++][iy] = createObject(OCLOSEDDOOR);
  player.level.items[ix++][iy] = createObject(OWALL);
  player.level.items[ix++][iy] = createObject(OLARNEYE);
  player.level.items[ix++][iy] = createObject(OPLATE);
  player.level.items[ix++][iy] = createObject(OCHAIN);
  player.level.items[ix++][iy] = createObject(OLEATHER);
  player.level.items[ix++][iy] = createObject(OSWORDofSLASHING);
  player.level.items[ix++][iy] = createObject(OHAMMER);
  player.level.items[ix++][iy] = createObject(OSWORD);
  player.level.items[ix++][iy] = createObject(O2SWORD);
  player.level.items[ix++][iy] = createObject(OSPEAR);
  player.level.items[ix++][iy] = createObject(ODAGGER);
  player.level.items[ix++][iy] = createObject(ORINGOFEXTRA);
  player.level.items[ix++][iy] = createObject(OREGENRING);
  player.level.items[ix++][iy] = createObject(OPROTRING);
  player.level.items[ix++][iy] = createObject(OENERGYRING);
  player.level.items[ix++][iy] = createObject(ODEXRING);
  player.level.items[ix++][iy] = createObject(OSTRRING);
  player.level.items[ix++][iy] = createObject(OCLEVERRING);
  player.level.items[ix++][iy] = createObject(ODAMRING);
  player.level.items[ix++][iy] = createObject(OBELT);
  player.level.items[ix++][iy] = createObject(OBOOK);
  player.level.items[ix++][iy] = createObject(OCHEST);
  player.level.items[ix++][iy] = createObject(OAMULET);
  player.level.items[ix++][iy] = createObject(OORBOFDRAGON);
  player.level.items[ix++][iy] = createObject(OSPIRITSCARAB);
  player.level.items[ix++][iy] = createObject(OCUBEofUNDEAD);
  player.level.items[ix++][iy] = createObject(ONOTHEFT);
  player.level.items[ix++][iy] = createObject(ODIAMOND);
  player.level.items[ix++][iy] = createObject(ORUBY);
  player.level.items[ix++][iy] = createObject(OEMERALD);
  player.level.items[ix++][iy] = createObject(OSAPPHIRE);
  player.level.items[ix++][iy] = createObject(OENTRANCE);
  player.level.items[ix++][iy] = createObject(OVOLDOWN);
  player.level.items[ix++][iy] = createObject(OVOLUP);
  player.level.items[ix++][iy] = createObject(OBATTLEAXE);
  player.level.items[ix++][iy] = createObject(OLONGSWORD);
  player.level.items[ix++][iy] = createObject(OFLAIL);
  player.level.items[ix++][iy] = createObject(ORING);
  player.level.items[ix++][iy] = createObject(OSTUDLEATHER);
  player.level.items[ix++][iy] = createObject(OSPLINT);
  player.level.items[ix++][iy] = createObject(OSSPLATE);
  player.level.items[ix++][iy] = createObject(OLANCE);
  player.level.items[ix++][iy] = createObject(OTRAPARROW);
  player.level.items[ix++][iy] = createObject(OTRAPARROWIV);
  player.level.items[ix++][iy] = createObject(OSHIELD);
  player.level.items[ix++][iy] = createObject(OHOME);
  player.level.items[ix++][iy] = createObject(OIVDARTRAP);
  player.level.items[ix++][iy] = createObject(ODARTRAP);
  player.level.items[ix++][iy] = createObject(OTRAPDOOR);
  player.level.items[ix++][iy] = createObject(OIVTRAPDOOR);
  player.level.items[ix++][iy] = createObject(OTRADEPOST);
  player.level.items[ix++][iy] = createObject(OIVTELETRAP);
  player.level.items[ix++][iy] = createObject(ODEADTHRONE);
  player.level.items[ix++][iy] = createObject(OLRS);
  player.level.items[ix++][iy] = createObject(OANNIHILATION);
  player.level.items[ix++][iy] = createObject(OCOOKIE);

  player.GOLD = 250000;
  return 1;
}


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
