'use strict';


/* create new game */
function welcome() {

  clear();

  lflush();

  createLevelNames();

  lprcat(helppages[0]);
  cursors();

  logname = localStorageGetObject('logname', logname);

  var tmpID = Math.random().toString(36).substr(2, 5);
  playerID = localStorageGetObject('playerID', tmpID);
  localStorageSetObject('playerID', playerID);

  // this is probably their first game, turn on keyboard_hints
  if (playerID === tmpID) {
      keyboard_hints = true;
  }

  lprcat(`Welcome to Larn. Please enter your name [<b>${logname}</b>]: `);

  if (!no_intro) {
    setTextCallback(setname);
    setButtons();
  } else {
    setname(logname);
  }

  blt();
}



function createLevelNames() {
  LEVELNAMES.push(`H`);
  for (var i = 1; i < MAXLEVEL; i++) {
    LEVELNAMES.push(`${i}`);
  }
  for (var i = 0; i < MAXVLEVEL; i++) {
    LEVELNAMES.push(`V${i+1}`);
  }
}



function setname(name) {

  // Our Hero could have no name, but this is not Braavos
  name = name.trim();

  if (name == ESC || name == '') {
    name = logname;
  }

  if (name) {
    logname = name.substring(0, 24);
    localStorageSetObject('logname', logname);
  }

  if (location.hostname != 'localhost') {
    FS.identify(playerID, { displayName: logname });
  }

  cursors();
  cltoeoln();

  var saveddata = localStorageGetObject(logname);
  var checkpoint;

  var winner = false;
  var savegame = false;

  /* if saveddata == winner, player won last time around */
  /* otherwise if saveddata exits, it's the save game file */
  if (saveddata != null) {
    winner = saveddata == `winner`;
    savegame = !winner;
  }
  /* check for a checkpoint file */
  else {
    checkpoint = localStorageGetObject('checkpoint');
  }

  // console.log(`winner == ` + winner);
  // console.log(`savegame == ` + savegame);
  // console.log(`checkpoint == ` + (checkpoint != null));

  var diff = Number(localStorageGetObject('difficulty') || 0);
  setDifficulty(diff);

  if (getDifficulty() == null || getDifficulty() == `` || isNaN(Number(getDifficulty()))) {
    // console.log(`HARDGAME == ${getDifficulty()}, setting to 0`);
    setDifficulty(0);
  }

  if (no_intro) {
    startgame(getDifficulty());
    return 0;
  }

  if (winner) {
    // force difficulty to be one harder
    setDifficulty(getDifficulty() + 1);
    readmail();
    // clear the mail flag
    localStorageRemoveItem(logname);
  } else if (savegame || checkpoint) {
    player = new Player();
    if (savegame) {
      loadSavedGame(saveddata, false);
    } else {
      loadSavedGame(checkpoint, true);
    }

    setGameDifficulty(getDifficulty());

    return 1;
  } else {
    lprcat(`What difficulty would you like to play? [<b>${getDifficulty()}</b>] `);
    setNumberCallback(startgame, false);
  }
  return 0;
}



function setGameDifficulty(hard) {
  if (hard == null || hard == `` || isNaN(Number(hard))) {
    // console.log(`hard == ${hard}, setting to ${getDifficulty()}`);
    hard = getDifficulty(); // use the default we set in setname
  }

  sethard(hard); /* set up the desired difficulty */

  localStorageSetObject('difficulty', getDifficulty());
}



/*
    function to set the desired hardness
    enter with hard= -1 for default hardness, else any desired hardness
 */
function sethard(hard) {

  hard = Number(hard);
  if (isNaN(hard)) {
    console.log(`error setting difficulty, defaulting to 0`);
    hard = 0;
  }

  setDifficulty(Math.max(0, hard));

  // console.log(`setting difficulty: ` + getDifficulty());

  var i;
  var k = getDifficulty();
  if (getDifficulty() > 0)
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
  learnSpell(`pro`);
  learnSpell(`mle`);

  /* always know cure dianthroritis */
  learnPotion(createObject(OPOTION, 21));

  if (getDifficulty() <= 0) {
    var startLeather = createObject(OLEATHER);
    var startDagger = createObject(ODAGGER);
    take(startLeather);
    take(startDagger);
    player.WEAR = startLeather;
    player.WIELD = startDagger;
  }

  player.x = rnd(MAXX - 2);
  player.y = rnd(MAXY - 2);

  // eventToggleDebugWTW();
  // eventToggleDebugStairs();
  // eventToggleDebugOutput();
  // // eventToggleDebugKnowAll();
  // eventToggleDebugStats();
  // eventToggleDebugImmortal();
  // auto_pickup = true;
  // // player.LEVEL = 25;
  // wizardmode(`pvnert(x)`);
  // // for (var i = 2; i < 26; i+=2) {
  // //   take(createObject(OSCROLL, rnd(5)));
  // //   take(createObject(OPOTION, rnd(5)));
  // // }
  // // player.updateHoldMonst(100000);
  // player.updateStealth(100000);
  // // player.updateAltPro(100000);
  // // player.updateTimeStop(10);
  // // player.updateGiantStr(100000);
  // // player.updateDexCount(100000);
  // // player.updateUndeadPro(100000);
  // // player.updateStrCount(100000);
  // // player.updateSpiritPro(100000);
  // // player.updateCharmCount(100000);
  // // player.updateHasteSelf(100000);
  // // player.updateProtectionTime(100000);
  // // player.updateCancellation(100000);
  // // player.updateScareMonst(100000);
  // // player.updateInvisibility(100000);
  // // player.updateFireResistance(100000);

  recalc();
  changedWC = 0; // don't highlight AC & WC on game start
  changedAC = 0;
}



function startgame(hard) {
  if (highestScore) {
    /* these are very ambiguous method names -- sorry. */
    setDifficulty(highestScore.hardlev + 1);
    setGameDifficulty(getDifficulty());
  } else {
    setGameDifficulty(hard);
  }

  makeplayer(); /*  make the character that will play  */

  newcavelevel(0); /*  make the dungeon */

  lflush();
  updateLog(`Welcome to Larn, ${logname} -- Press <b>?</b> for help`);
  updateLog(`Press <b>e</b> to enter buildings and the dungeon`);
  if (NOCOOKIES) {
    updateLog(`Cookies are disabled, games cannot be loaded or saved`);
  }

  setAmigaMode();

  showcell(player.x, player.y);

  GAMEOVER = false;
  setMazeMode(true);

  return 1;
}



function setAmigaMode() {
    if (PARAMS.mode && PARAMS.mode == `amiga`) {
        console.log(`switching to Amiga mode`);
        amiga_mode = false;
        original_objects = false;
        eventToggleMode(null, null, true);
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
function mainloop(key) {

  if (napping) {
    debug(`napping`);
    return;
  }

  nomove = 0;

  parse(key);

  setButtons();

  if (nomove == 1) {
    paint();
    return;
  }

  regen(); /* regenerate hp and spells */
  randmonst();


  /*
   * JRP: this is where the old main loop starts and end
   */


  /* see if there is an object here. */
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
  if (viewflag == 0)
    showcell(player.x, player.y);

  viewflag = 0;
  hitflag = 0;

  if (gtime >= 400 && gtime % 400 == 0) {
    saveGame(true);
  }

  recalc();

  paint();
}



/*****************************************************************************/
/*****************************************************************************/
/*****************************************************************************/



function parse2() {
  if (player.HASTEMONST) {
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



function wizardmode(password) {

  if (password === 'checkpoint') {
    updateLog(`reload to restart from backup checkpoint`);
    var checkpoint = localStorageGetObject('checkpointbackup');
    localStorageSetObject('checkpoint', checkpoint);
    return 1;
  }

  if (password === 'savegame') {
    updateLog(`reload to restart from backup save game`);
    var savegame = localStorageGetObject(logname + 'backup');
    localStorageSetObject(logname, savegame);
    return 1;
  }

  if (password === 'debug') {
    updateLog(`debugging shortcuts enabled`);
    enableDebug();
    return 1;
  }

  if (password.length == 10) {
    updateLog(`trying to load game ` + password);
    dbQueryLoadGame(password);
    return 1;
  }

  if (password !== 'pvnert(x)') {
    updateLog(`Sorry`);
    return 1;
  }

  //updateLog(`disabling wizard mode`);
  wizard = 1;

  player.TELEFLAG = 0;

  player.setStrength(70);
  player.setIntelligence(70);
  player.setWisdom(70);
  player.setConstitution(70);
  player.setDexterity(70);
  player.setCharisma(70);

  player.WEAR = null;
  player.inventory[0] = createObject(OLANCE, 25);
  player.WIELD = player.inventory[0];
  player.inventory[1] = createObject(OPROTRING, 50);

  player.raiseexperience(6000000);
  player.AWARENESS = 100000;

  for (var i = 0; i < spelcode.length; i++) {
    learnSpell(spelcode[i]);
  }

  player.setGold(250000);

  if (player.level) {
    for (var i = 0; i < MAXY; i++)
      for (var j = 0; j < MAXX; j++)
        player.level.know[j][i] = KNOWALL;

    for (var scrolli = 0; scrolli < SCROLL_NAMES.length; scrolli++) {
      var scroll = createObject(OSCROLL, scrolli);
      learnScroll(scroll);
      player.level.items[scrolli][0] = scroll;
    }

    for (var potioni = MAXX - 1; potioni > MAXX - 1 - POTION_NAMES.length; potioni--) {
      var potion = createObject(OPOTION, MAXX - 1 - potioni);
      learnPotion(potion);
      player.level.items[potioni][0] = potion;
    }

    var ix = 0;
    var iy = 0;
    var xmod = 0;
    var ymod = 1;
    for (var i = 0; i < itemlist.length; i++) {
      if (itemlist[i]) player.level.items[ix += xmod][iy += ymod] = createObject(itemlist[i]);
      if (i == MAXY - 1) {
        ix = 1
        iy = MAXY - 1;
        xmod = 1;
        ymod = 0;
      }
    }
  }

  return 1;
}
