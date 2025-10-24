'use strict';

/* if (ULARN) This game is bad for you. It is evil. It will rot your brain. */

/* create new game */
function welcome() {

  clear();

  lflush();

  createLevelNames();

  amiga_mode = PARAMS.mode && PARAMS.mode == `amiga` || false;
  retro_mode = localStorageGetObject('retro', true);
  setMode(amiga_mode, retro_mode, original_objects);
  
  initHelpPages();

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

  showConfigButtons = localStorageGetObject(`showConfigButtons`, true);

  var nameString = `Welcome to ${GAMENAME}. Please enter your name [<b>${logname}</b>]: `;

  let chastizing = `* Please use only one name to leave room on the scoreboard for others`;
  setDiv(`FOOTER`, chastizing);

  lprcat(nameString);
  blinken(nameString.length - 5, 24);

  player = new Player(); // gender and character class are set later on
  initKeyBindings(); // wait until last moment to set key bindings

  if (!no_intro) {
    setTextCallback(setname, 24);
  } else {
    setname(logname);
  }

  updateRB();

  paint();
}



function createLevelNames() {
  LEVELNAMES.push(`H`);
  for (let i = 1; i < MAXLEVEL; i++) {
    LEVELNAMES.push(`${i}`);
  }
  for (let i = 0; i < MAXVLEVEL; i++) {
    LEVELNAMES.push(`V${i + 1}`);
  }
}



function setname(name) {
  debug(`setname(): ${name}`);

  setDiv(`FOOTER`, ``);

  // Our Hero could have no name, but this is not Braavos
  name = name.trim();

  if (name == ESC || name == '') {
    name = logname;
  }

  if (name) {
    logname = name.substring(0, 24);
    localStorageSetObject('logname', logname);
  }

  cursors();
  cltoeoln();

  var saveddata = GOTW ? null : localStorageGetObject(logname);
  var checkpoint;

  var winner = false;
  var savegame = false;

  /* if saveddata.winner == true or saveddata == 'winner', player won last time around */
  /* otherwise if saveddata exits, it's the save game file */
  if (saveddata != null) {
    winner = saveddata.winner;
    if (winner == null) winner = (saveddata == `winner`); /* backwards compatibility */
    savegame = !winner;
  }
  /* check for a checkpoint file */
  else {
    checkpoint = GOTW ? null : localStorageGetObject('checkpoint');
  }

  // console.log(`winner == ` + winner);
  // console.log(`savegame == ` + savegame);
  // console.log(`checkpoint == ` + (checkpoint != null));

  var diff = Number(localStorageGetObject('difficulty') || 0);
  setDifficulty(diff);

  if (no_intro) {
    setclass(`Adventurer`);
    return 1;
  }

  if (winner) {
    clearBlinkingCursor();
    readmail();
    localStorageRemoveItem(logname); /* clear the mail flag */
    return 1;
  } else if (savegame || checkpoint) {
    if (savegame) {
      loadSavedGame(saveddata, false);
    } else {
      loadSavedGame(checkpoint, true);
    }
    clearBlinkingCursor(); // clear after setting name and loading savegame
    setGameDifficulty(getDifficulty());

    return 1;
  } else {
    var difficultyString = `What difficulty would you like to play? [<b>${getDifficulty()}</b>]: `;
    lprcat(difficultyString);
    blinken(difficultyString.length - 5, 24);

    setNumberCallback(setdiff, false, 3);
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
  setDifficulty(Math.min(128, hard));

  // console.log(`setting difficulty: ` + getDifficulty());

  var i;
  var k = getDifficulty();
  if (getDifficulty() > 0)
    for (var j = 0; j < monsterlist.length; j++) {
      var monster = monsterlist[j];

      /* JRP we don't need to worry about blowing int boundaries
         so we can keep making things harder as difficulty goes up */
      i = ((6 + k) * monster.hitpoints + 1) / 6;
      if (!ULARN) monster.hitpoints = Math.min(32767, Math.round(i));
      monster.hitpoints = Math.round(i);

      i = ((6 + k) * monster.damage + 1) / 5;
      if (!ULARN) monster.damage = Math.min(127, Math.round(i));
      monster.damage = Math.round(i);

      i = (10 * monster.gold) / (10 + k);
      monster.gold = Math.min(32767, Math.round(i));
      monster.gold = Math.round(i);

      i = monster.armorclass - k;
      monster.armorclass = Math.max(-127, Math.round(i));
      monster.armorclass = Math.round(i);

      i = (7 * monster.experience) / (7 + k) + 1;
      monster.experience = Math.max(1, Math.round(i));
      monster.experience = Math.round(i);

      //console.log(`${monster.char}: hp:${monster.hitpoints}, d:${monster.damage}, g:${monster.gold}, ac:${monster.armorclass}, x:${monster.experience}`);
    }
}



/*
makeplayer()

subroutine to create the player and the players attributes
this is called at the beginning of a game and at no other time
*/
function makeplayer(x, y) {

  /* much of this work has been moved elsewhere */
  // player = new Player();

  /* always know cure dianthroritis */
  learnPotion(createObject(OPOTION, 21));

  player.x = x || rnd(MAXX - 2);
  player.y = y || rnd(MAXY - 2);

  recalc();
  changedWC = 0; // don't highlight AC & WC on game start
  changedAC = 0;
}



function initFS() {
  try {
    var gameNum = localStorageGetObject('gameNum', 0) + 1;
    localStorageSetObject('gameNum', gameNum);
    if (gameNum <= 5 || getDifficulty() > 15 || rnd(100) < 3 || isMobile()) {
      dofs = true;
      console.log('dofs: ' + gameNum + ' ' + dofs + ' ' + getDifficulty());
    }

    if (dofs) {
      fsfunc();
      var userVars = {
        'displayName': logname,
        'playerID_str': playerID,
        'gameID_str': gameID,
        'gameNum_int': gameNum,
      };
      console.log(`fs`, userVars);
      FS.identify(playerID, userVars);
    }
  } catch (e) {
    console.error(`caught: ${e}`);
  }
}



function initRB() {
  try {
    if (Rollbar) Rollbar.configure({
      enabled: (location.hostname !== 'localhost' && location.hostname !== ''),
      payload: {
        code_version: `${BUILD}`,
        client: {
          javascript: {
            code_version: `${BUILD}`,
          }
        }
      }
    });
  } catch (error) {
    console.error(`initRB caught: ${error}`);
  }
}



function updateRB() {
  try {
    if (Rollbar) Rollbar.configure({
      payload: {
        person: {
          id: logname
        },
        custom: {
          playerID: playerID,
          gameID: gameID
        }
      }
    });
  } catch (error) {
    console.error(`updateRB caught: ${error}`);
  }
}


let gotIP = false;
function setIP(ip) {
  if (gotIP) return;
  // console.log(`ip:`, ip);
  playerIP = ip;
  gotIP = true;
}



function setdiff(hard) {
  debug(`setdiff(): ${hard}`);

  // clear the blinking cursor after setting difficulty
  clearBlinkingCursor();

  /* force difficulty to be one harder */
  if (winnerHardlev) {
    /* these are very ambiguous method names -- sorry. */
    setDifficulty(winnerHardlev);
    setGameDifficulty(getDifficulty());
  } else {
    setGameDifficulty(hard);
  }

  if (ULARN && !no_intro) {
    clear();
    lprcat(`The Addiction of Ularn\n\n`);
    lprcat(`     Pick a character class...\n\n`);
    lprcat(`     a)  Ogre          Exceptional strength, but thick as a brick\n`);
    lprcat(`     b)  Wizard        Smart, good at magic, but very weak\n`);
    lprcat(`     c)  Klingon       Strong and average IQ, but unwise & very ugly\n`);
    lprcat(`     d)  Elf           OK at magic, but a mediocre fighter\n`);
    lprcat(`     e)  Rogue         Nimble and smart, but only average strength\n`);
    lprcat(`     f)  Adventurer    Jack of all trades, master of none\n`);
    lprcat(`     g)  Dwarf         Strong and healthy, but not good at magic\n`);
    lprcat(`     h)  Rambo         Bad at everything, but has a Lance of Death\n`);
    cursors();

    player.char_picked = localStorageGetObject('character_class') || 'Adventurer';

    lprcat(`So, what are ya? [<b>${player.char_picked}</b>]:`);
    lflush();
    blinken(player.char_picked.length + 23, 24);
    setCharCallback(setclass);
  } else {
    setclass(`Adventurer`); /* default to Adventurer for regular Larn */
    return true;
  }

}



function setclass(classpick) {
  debug(`setclass(): ${classpick}`);

  let characterClass;

  if (classpick === `a` || classpick === `Ogre`) {
    characterClass = `Ogre`;
  } else if (classpick === `b` || classpick === `Wizard`) {
    characterClass = `Wizard`;
  } else if (classpick === `c` || classpick === `Klingon`) {
    characterClass = `Klingon`;
  } else if (classpick === `d` || classpick === `Elf`) {
    characterClass = `Elf`;
  } else if (classpick === `e` || classpick === `Rogue`) {
    characterClass = `Rogue`;
  } else if (classpick === `f` || classpick === `Adventurer`) {
    characterClass = `Adventurer`;
  } else if (classpick === `g` || classpick === `Dwarf`) {
    characterClass = `Dwarf`;
  } else if (classpick === `h` || classpick === `Rambo`) {
    characterClass = `Rambo`;
  } else if (classpick === ENTER) {
    characterClass = player.char_picked; /* default to the one set from local storage */
  }

  if (characterClass) {
    player.setCharacterClass(characterClass);
    recalc();
    changedWC = 0; // don't highlight AC & WC on game start
    changedAC = 0;

    if (ULARN && !no_intro) {
      localStorageSetObject('character_class', characterClass);
      clear();
      lprcat(`The Addiction of Ularn\n\n`);
      lprcat(`     Pick a gender...\n\n`);
      lprcat(`     a)  Male\n`);
      lprcat(`     b)  Female\n`);
      lprcat(`     c)  I prefer to not be defined by traditional gender norms\n`);
      cursors();

      player.gender = localStorageGetObject('gender') || 'Male';

      lprcat(`So, what are ya? [<b>${player.gender}</b>]:`);
      lflush();
      blinken(player.gender.length + 23, 24);
      setCharCallback(setgender);
    } else {
      setgender(`Male`);
      return true;
    }
  } else {
    return false;
  }
}



function setgender(genderpick) {
  debug(`setgender(): ${genderpick}`);

  let gender;

  if (genderpick === `a` || genderpick === `Male`) {
    gender = `Male`;
  } else if (genderpick === `b` || genderpick === `Female`) {
    gender = `Female`;
  } else if (genderpick === `c` || genderpick === `Other`) {
    gender = `Other`;
  } else if (genderpick === ENTER) {
    gender = player.gender; /* default to the one set from local storage */
  }

  if (gender) {
    player.setGender(gender);
    if (ULARN) {
      localStorageSetObject('gender', gender);
    }
    startgame();
    clearBlinkingCursor();
    return true;
  } else {
    return false;
  }

}



async function startgame() {
  let startx, starty, extraMessage;
  if (GOTW) {
    let gotwData = await downloadGOTW();
    if (gotwData.status === 200) {
      console.log(`startgame(): gotw downloaded:`, gotwData.LEVELS.length);
      loadLevels(gotwData.LEVELS);
      startx = gotwData.player.x;
      starty = gotwData.player.y;
      extraMessage = `You have ${timeLeft()} to finish this game`;
    } else {    
      GOTW = false;
      if (gotwData.status === 451) {
        extraMessage = `Count Endelford insists on only one attempt per week: switching to a normal game`;
      } else if (gotwData.status === 404) {
        extraMessage = `Count Endelford is still preparing this week's game: switching to a normal game`;
      } else {
        extraMessage = `Error fetching this week's game: switching to a normal game`;
      }
      const url = new URL(window.location.href);
      url.searchParams.delete('gotw');
      window.history.replaceState({}, document.title, url.toString());
    }
  }

  initFS();

  makeplayer(startx, starty); /*  make the character that will play  */

  newcavelevel(0); /*  make the dungeon */

  lflush();

  var introMessage = `Welcome to ${GAMENAME}, ${logname} -- Press <b>?</b> for help`;
  updateLog(introMessage);

  if (extraMessage) updateLog(extraMessage);

  if (!GOTW && !navigator.cookieEnabled) {
    updateLog(`Are cookies disabled? You may not be able to save your game!`);
  }

  showcell(player.x, player.y);

  GAMEOVER = false;
  setMazeMode(true);
  game_started = true;

  if (ENABLE_DEVMODE) {
    enableDevmode();
  }

  onResize();
  paint();

  return 1;
}

function timeLeft() {
  const now = new Date();
  const nextSunday = new Date();
  
  // Set to next Sunday at midnight UTC
  nextSunday.setUTCDate(now.getUTCDate() + (7 - now.getUTCDay()) % 7);
  nextSunday.setUTCHours(23, 59, 59, 0);
  const timeDiff = nextSunday.getTime() - now.getTime();
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} days, ${hours} hours, and ${minutes} minutes`;
}

/*****************************************************************************/
/*****************************************************************************/
/*****************************************************************************/



let GLOBAL_TIMEOUT; // used for setTimeouts that can be interrupted by the main loop



/*
  JRP
  since we're running in a event-driven system we need to
  turn the original main loop a little bit inside-out
*/
function mainloop(e, key) {

  if (napping) {
    debug(`napping`);
    if (GLOBAL_TIMEOUT) {
      clearTimeout(GLOBAL_TIMEOUT);
      GLOBAL_TIMEOUT = null;
      napping = false;
    } else {
      return;
    }
  }

  nomove = 0;

  parse(e, key);

  if (nomove == 1) {
    paint();
    return;
  }

  if (!game_started) {
    debug(`mainloop: game not started`);
    return;
  }

  if (!player) {
    doRollbar(ROLLBAR_DEBUG, `mainloop !player`, `gtime=${gtime} e=${e} key=${key}`);
    return;
  }

  regen(); /* regenerate hp and spells */
  randmonst();


  /*
   * JRP: this is where the old main loop starts and end
   */


  /* see if there is an object here. */
  if (dropflag == 0) {
    lookforobject(true, auto_pickup);
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
  /*
   v12.4.5 - fix for monsters chasing the player even when time is stopped
   */
  if (player.TIMESTOP <= 0) {
    if (player.HASTEMONST) {
      movemonst();
    }
    movemonst(); /* move the monsters */
    randmonst();
  }
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

  if (password === ESC) {
    appendLog(` cancelled${period}`);
    return 1;
  }

  if (GOTW) {
    updateLog(`Surprise! You're dead!`);
    died(DIED_CHEATER, false);
    return 1;
  }

  if (password === 'checkpoint') {
    doRollbar(ROLLBAR_WARN, `checkpoint`, `who=${logname} playerID=${playerID} diff=${getDifficulty()} gameID=${gameID}`);

    var checkpoint = localStorageGetObject('checkpointbackup');
    let error = localStorageSetObject('checkpoint', checkpoint);
    if (!error) {
      updateLog(`Reload to restart from backup checkpoint. High scores will not be recorded.`);
    } else {
      updateLog(`Sorry, no checkpoint found (or cookies are disabled)`);
      updateLog(`${error}`);
    }
    return 1;
  }

  if (password === 'savegame') {
    doRollbar(ROLLBAR_WARN, `savegame`, `who=${logname} playerID=${playerID} diff=${getDifficulty()} gameID=${gameID}`);

    var savegame = localStorageGetObject(logname + 'backup');
    let error = localStorageSetObject(logname, savegame);
    if (!error) {
      updateLog(`Reload to restart from backup save game. High scores will not be recorded.`);
    } else {
      updateLog(`Sorry, no backup save game found (or cookies are disabled)`);
      updateLog(`${error}`);
    }
    return 1;
  }

  if (password === 'debug') {
    doRollbar(ROLLBAR_WARN, `debug who=${logname}`, `playerID=${playerID} diff=${getDifficulty()} gameID=${gameID}`);

    updateLog(`debugging shortcuts enabled`);
    enableDebug();
    return 1;
  }

  if (password.length == 10 || password.length == 11) {
    updateLog(`trying to load game ` + password);
    dbQueryLoadGame(password);
    return 1;
  }

  // there have been many wizard passwords over the years
  let wizardPasswords = [`pvnert(x)`, `frobozz`, `fizban`, `main(){}`, `amiga`];

  if (wizardPasswords.includes(password)) {
    //updateLog(`disabling wizard mode`);
    wizard = 1;

    player.TELEFLAG = 0;

    player.setStrength(70);
    player.setIntelligence(70);
    player.setWisdom(70);
    player.setConstitution(70);
    player.setDexterity(70);
    player.setCharisma(70);

    player.inventory[0] = null;
    player.inventory[1] = null;
    var startLance = createObject(OLANCE, 25);
    var startRing = createObject(OPROTRING, 50);
    take(startLance);
    take(startRing);
    if (ULARN) take(createObject(OSLAYER));
    player.WEAR = null;
    player.WIELD = startLance;

    player.raiseexperience(6000000);
    player.AWARENESS = 100000;

    for (let i = 0; i < spelcode.length; i++) {
      learnSpell(spelcode[i]);
    }

    player.setGold(250000);

    if (player.level) {
      for (let i = 0; i < MAXY; i++)
        for (let j = 0; j < MAXX; j++)
          player.level.know[j][i] = KNOWALL;

      for (var scrolli = 0; scrolli < SCROLL_NAMES.length; scrolli++) {
        var scroll = createObject(OSCROLL, scrolli);
        learnScroll(scroll);
        setItem(scrolli, 0, scroll);
      }

      for (var potioni = MAXX - 1; potioni > MAXX - 1 - POTION_NAMES.length; potioni--) {
        var potion = createObject(OPOTION, MAXX - 1 - potioni);
        learnPotion(potion);
        setItem(potioni, 0, potion);
      }

      var ix = 0;
      var iy = 1;
      var wizi = 0;
      while (iy < MAXY) {
        if (itemlist[++wizi]) {
          setItem(ix, iy++, itemlist[wizi]);
          if (!ULARN) {
            if (wizi == OORB.id) --iy;
            if (wizi == OELEVATORUP.id) --iy;
            if (wizi == OELEVATORDOWN.id) --iy;
          }
        }
      }
      while (++ix < MAXX - 1) {
        if (itemlist[++wizi]) {
          setItem(ix, iy - 1, itemlist[wizi]);
          if (!ULARN && wizi >= OCOOKIE.id) break;
        } else --ix;
      }

      if (ULARN) {
        // 101 items now
        while (wizi < OLIFEPRESERVER.id) {
          var wizitem = itemlist[++wizi];
          if (wizitem && wizitem != OHOMEENTRANCE && wizitem != OUNKNOWN)
            setItem(ix, --iy, wizitem);
        }
      }

    }
  } else {
    updateLog(`Sorry${period}`);
    return 1;
  }


  return 1;
}