'use strict';

/* if (ULARN) This game is bad for you. It is evil. It will rot your brain. */

/* create new game */
function welcome() {

  clear();

  lflush();

  createLevelNames();

  initHelpPages();
  lprcat(helppages[0]);
  cursors();

  logname = localStorageGetObject('logname', logname);

  var tmpID = Math.random().toString(36).substr(2, 5);
  playerID = localStorageGetObject('playerID', tmpID);
  localStorageSetObject('playerID', playerID);

  // this is probably their first game, turn on keyboard_hints
  if (playerID === tmpID) {
    newplayer = true;
    keyboard_hints = true;
  }

  var nameString = `Welcome to ${GAMENAME}. Please enter your name [<b>${logname}</b>]: `;

  // if (!newplayer)
  //   nameString = `(Please stick to one name!)`;

  lprcat(nameString);
  blinken(nameString.length - 5, 24);

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
  for (let i = 1; i < MAXLEVEL; i++) {
    LEVELNAMES.push(`${i}`);
  }
  for (let i = 0; i < MAXVLEVEL; i++) {
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

  cursors();
  cltoeoln();

  var saveddata = localStorageGetObject(logname);
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
    checkpoint = localStorageGetObject('checkpoint');
  }

  // console.log(`winner == ` + winner);
  // console.log(`savegame == ` + savegame);
  // console.log(`checkpoint == ` + (checkpoint != null));

  var diff = Number(localStorageGetObject('difficulty') || 0);
  setDifficulty(diff);

  player = new Player(); /* gender and character class are set later on */

  if (no_intro) {
    startgame(getDifficulty());
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

    setNumberCallback(setdiff, false);
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
  function makeplayer() {

  /* much of this work has been moved elsewhere */
  // player = new Player();

  /* always know cure dianthroritis */
  learnPotion(createObject(OPOTION, 21));

  player.x = rnd(MAXX - 2);
  player.y = rnd(MAXY - 2);

  recalc();
  changedWC = 0; // don't highlight AC & WC on game start
  changedAC = 0;
}



function initFS() {
  try {
    var gameNum = localStorageGetObject('gameNum', 0) + 1;
    localStorageSetObject('gameNum', gameNum);
    if (gameNum <= 5 || getDifficulty() > 3) {
      dofs = true;
      console.log('dofs: ' + gameNum + ' ' + dofs + ' ' + getDifficulty());
    }

    if (dofs) {
      fsfunc();
      var userVars = {
        'displayName': logname,
        'playerID_str': playerID,
        'gameNum_int': gameNum,
      };
      console.log(`fs`, userVars);
      FS.identify(playerID, userVars);
    }
  } catch (e) {
    console.error(`caught: ${e}`);
  }
}



function getIP() {
  try {
    fetch(`https://www.cloudflare.com/cdn-cgi/trace`).then(function (response) {
      response.text().then(function (text) {
        var tmp = text.split(`\n`)[2];
        playerIP = tmp.split(`=`)[1];
      });
    });
  } catch (e) {
    console.error(`caught: ${e}`);
  }
}



function setdiff(hard) {

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

  if (ULARN) {
    clear();
    lprcat(`The Addiction of Ularn\n\n`);
    lprcat(`\tPick a character class...\n\n`);
    lprcat(`\ta)  Ogre          Exceptional strength, but thick as a brick\n`);
    lprcat(`\tb)  Wizard        Smart, good at magic, but very weak\n`);
    lprcat(`\tc)  Klingon       Strong and average IQ, but unwise & very ugly\n`);
    lprcat(`\td)  Elf           OK at magic, but a mediocre fighter\n`);
    lprcat(`\te)  Rogue         Nimble and smart, but only average strength\n`);
    lprcat(`\tf)  Adventurer    Jack of all trades, master of none\n`);
    lprcat(`\tg)  Dwarf         Strong and healthy, but not good at magic\n`);
    lprcat(`\th)  Rambo         Bad at everything, but has a Lance of Death\n`);
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

    if (ULARN) {
      localStorageSetObject('character_class', characterClass);
      clear();
      lprcat(`The Addiction of Ularn\n\n`);
      lprcat(`\tPick a gender...\n\n`);
      lprcat(`\ta)  Male\n`);
      lprcat(`\tb)  Female\n`);
      lprcat(`\tc)  I prefer to not be defined by traditional gender norms\n`);
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
    startgame(getDifficulty());
    clearBlinkingCursor();
    return true;
  } else {
    return false;
  }

}



function startgame(hard) {

  initFS();
  getIP();

  makeplayer(); /*  make the character that will play  */

  newcavelevel(0); /*  make the dungeon */

  lflush();

  var introMessage = `Welcome to ${GAMENAME}, ${logname} -- Press <b>?</b> for help`;
  updateLog(introMessage);

  if (NOCOOKIES) {
    updateLog(`Cookies are disabled, games cannot be loaded or saved`);
  }

  setAmigaMode();

  showcell(player.x, player.y);

  GAMEOVER = false;
  setMazeMode(true);
  side_inventory = true;

  //DEVMODE();

  return 1;
}



function DEVMODE() {
    // enableDebug();
    // eventToggleDebugWTW();
    // eventToggleDebugStairs();
    // eventToggleDebugOutput();
    // eventToggleDebugKnowAll();
    // eventToggleDebugStats();
    // eventToggleDebugImmortal();
    // eventToggleDebugAwareness();
    // player.updateStealth(100000);
    // keyboard_hints = true;
    // wizardmode(`pvnert(x)`);
    player.GOLD = 1000001;

    // var startShield = createObject(OSHIELD);
    // take(startShield);
    take(createObject(OLARNEYE));
    take(createObject(ONOTHEFT));
    take(createObject(OSPHTALISMAN));
    // var startDagger = createObject(ODAGGER, -9);
    // var startSlayer = createObject(OSLAYER);
    // var startVorpy = createObject(OVORPAL);
    // take(startDagger);
    // take(startSlayer);
    // take(startVorpy);
    // player.WIELD = startVorpy;
    // player.SHIELD = startShield;
    take(createObject(OPOTION, 21));
    // take(createObject(OBRASSLAMP));
    // gtime = 0;

    // auto_pickup = true;

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



// /**
//  * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
//  * 
//  * @param {String} text The text to be rendered.
//  * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
//  * 
//  * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
//  */
// function getTextWidth(text, font) {
//   // re-use canvas object for better performance
//   var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
//   var context = canvas.getContext("2d");
//   context.font = font;
//   var metrics = context.measureText(text);
//   return metrics.width;
// }



// function makeItFit() {

//   var el = document.getElementById('LARN');
//   var style = window.getComputedStyle(el, null).getPropertyValue('font-size');
//   var fontSize = parseFloat(style); 
//   // now you have a proper float for the font size (yes, it can be a float, not just an integer)

//   var browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
//   var browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

//   fontSize = parseFloat(100);
//   var safe = 100;
//   var fontWidth = getTextWidth("0", fontSize + 'pt dos');
//   // while (fontWidth * 80.0 < browserWidth) {
//   //   fontWidth = getTextWidth("0", fontSize + 'pt dos');
//   //   fontSize += 0.1;
//   //   el.style.fontSize = (fontSize) + 'px';
//   //   //console.log("+W", fontWidth, fontWidth*80.0, browserWidth, fontSize);
//   //   if (safe-- < 0) return;
//   // }

//   // safe = 100;
//   // if (fontWidth * 80.0 > browserWidth) {
//   //   fontWidth = getTextWidth("0", fontSize + 'pt dos');
//   //   fontSize -= 0.1;
//   //   el.style.fontSize = (fontSize) + 'px';
//   //   //console.log("-W", fontWidth, fontWidth*80.0, browserWidth, fontSize);
//   //   if (safe-- < 0) return;
//   // }

//     var suggestedSize = Math.max(10, ((browserHeight-100) / 24.0));
// console.log(suggestedSize, fontSize);
//     suggestedSize = Math.min(suggestedSize, fontSize);
//     el.style.fontSize = (suggestedSize-1) + 'px';

// }

/*
  JRP
  since we're running in a event-driven system we need to
  turn the original main loop a little bit inside-out
*/
function mainloop(key) {

  // makeItFit();

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

  if (password.length == 10 || password.length == 11) {
    updateLog(`trying to load game ` + password);
    dbQueryLoadGame(password);
    return 1;
  }

  // other valid passwords to add in the future
  // main(){}
  // frobozz
  if (password === 'pvnert(x)') {
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
        player.level.items[scrolli][0] = scroll;
      }

      for (var potioni = MAXX - 1; potioni > MAXX - 1 - POTION_NAMES.length; potioni--) {
        var potion = createObject(OPOTION, MAXX - 1 - potioni);
        learnPotion(potion);
        player.level.items[potioni][0] = potion;
      }

      var ix = 0;
      var iy = 0;
      var wizi = 0;
      while (wizi < MAXY) {
        if (itemlist[++wizi])
          player.level.items[ix][++iy] = createObject(itemlist[wizi]);
      }
      --wizi;
      while (++ix < MAXX - 1) {
        if (itemlist[++wizi])
          player.level.items[ix][iy - 1] = createObject(itemlist[wizi]);
        else --ix;
      }

      // 100 items now
      while (wizi < OPAD.id) {
        var wizitem = itemlist[++wizi];
        if (wizitem && wizitem != OHOMEENTRANCE && wizitem != OUNKNOWN)
          player.level.items[ix][--iy] = createObject(wizitem);
      }

    }
  } else {
    updateLog(`Sorry`);
    return 1;
  }


  return 1;
}