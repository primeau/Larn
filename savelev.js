"use strict";

// function parseLoadSavedGame(key) {
//   nomove = 1;
//   if (key == ESC || key == 'n' || key == 'N') {
//     appendLog(" cancelled");
//     return 1;
//   }
//   if (key == 'y' || key == 'Y') {
//     loadSavedGame();
//     return 1;
//   } else {
//     return 0;
//   }
// }



function saveGame(isCheckPoint) {

  if (wizard || cheat) {
    if (isCheckPoint) {
      console.log("not saving wizard/cheater checkpoint");
      return;
    }
    else {
        //updateLog("Wizards and cheaters don't get to save their games");
        //return;
    }
  }


  var saveName = isCheckPoint ? 'checkpoint' : logname;

  // var hmac = forge.random.getBytesSync(128);
  // localStorage.setItem('hmac', hmac);

  // START HACK TODO to not store player.level
  var x = player.level;
  player.level = null;

  var state = new GameState();
  var bytes;

  localStorage.setObject(saveName, state);

  /* save an emergency backup */
  localStorage.setObject(saveName + 'backup', state);

  var hash = forge.md.sha512.create();
  hash.update(bytes = JSON.stringify(state));

  player.level = x;
  // END HACK TODO to not store player.level

  if (isCheckPoint) {
    var pad = 67 - LOG[LOG.length - 1].length;

    appendLog(padString('*', pad));
  } else {
    updateLog(`Game saved. ${Number(bytes.length).toLocaleString()} bytes written.`);
  }

  console.log("saved hash: " + hash.digest().toHex());
  localStorage.setItem('hmac', hash.digest().toHex());
}



function loadSavedGame(savedState, isCheckPoint) {
  // var hmac = localStorage.getItem('hmac');
  // console.log(forge.util.bytesToHex(hmac));

  if (!savedState) {
    updateLog("Sorry, I can't find your save game file!");
    return;
  }

  loadState(savedState);

  // check for cheaters:
  // 1. hash everything important
  // 2. load the saved hash
  // 3. are they the same?
  var hash = forge.md.sha512.create();
  hash.update(JSON.stringify(savedState));

  console.log("computed hash: " + hash.digest().toHex());

  var savedHash = localStorage.getItem('hmac', hash);
  console.log("saved hash: " + savedHash);

  cheat = hash.digest().toHex() != savedHash;
  console.log("cheater? " + cheat);

  if (isCheckPoint) {
    updateLog("Welcome back. I saved your game for you. (Your backup file has now been deleted)");
  } else {
    updateLog("Welcome back. (Your save file has now been been deleted)");
  }

  if (cheat) {
    updateLog("Have you been cheating?");
    // TODO enforce this
  }

  /* clear the saved game file */
  localStorage.removeItem(logname);
  localStorage.removeItem('checkpoint');

}



function loadState(state) {
  var savedLevels = state.LEVELS;
  loadLevels(savedLevels);

  var savedLog = state.LOG;
  LOG = savedLog;

  var savedPlayer = state.player;
  loadPlayer(savedPlayer);

  player.level = LEVELS[state.level];

  newsphereflag = state.newsphereflag;
  GAME_OVER = state.GAME_OVER;
  IN_STORE = state.IN_STORE;
  napping = state.napping;
  knownPotions = state.knownPotions;
  knownScrolls = state.knownScrolls;
  knownSpells = state.knownSpells;
  original_objects = state.original_objects;

  logname = state.logname;
  cheat = state.cheat;
  level = state.level;
  wizard = state.wizard;
  gtime = state.gtime;
  HARDGAME = state.HARDGAME;
  lastmonst = state.lastmonst;
  lastnum = state.lastnum;
  hitflag = state.hitflag;
  hit2flag = state.hit2flag;
  hit3flag = state.hit3flag;
  lastpx = state.lastpx;
  lastpy = state.lastpy;
  lasthx = state.lasthx;
  lasthy = state.lasthy;
  prayed = state.prayed;
  oldx = state.oldx;
  oldy = state.oldy;
  course = state.course;
  outstanding_taxes = state.outstanding_taxes;
  dropflag = state.dropflag;
  rmst = state.rmst;
  nomove = state.nomove;
  viewflag = state.viewflag;
  lasttime = state.lasttime;
  w1x = state.w1x;
  w1y = state.w1y;
  spheres = state.spheres;
  auto_pickup = state.auto_pickup;
}



function loadLevels(savedLevels) {
  for (var lev = 0; lev < 14; lev++) {
    if (!savedLevels[lev]) {
      LEVELS[lev] = null;
      continue;
    }
    console.log(`loading: ${lev}`);
    var tempLev = savedLevels[lev];
    var items = tempLev.items;
    var monsters = tempLev.monsters;
    for (var x = 0; x < MAXX; x++) {
      for (var y = 0; y < MAXY; y++) {
        items[x][y] = createObject(items[x][y]);
        monsters[x][y] = createMonster(monsters[x][y]);
      }
    }
    LEVELS[lev] = Object.create(Level);
    LEVELS[lev].items = items;
    LEVELS[lev].monsters = monsters;
    LEVELS[lev].know = tempLev.know;
  }
}



function loadPlayer(saved) {
  player.WEAR = null;
  player.WIELD = null;
  player.SHIELD = null;

  for (var i = 0; i < 26; i++) {
    var item = saved.inventory[i];
    player.inventory[i] = item ? createObject(item) : null;
    if (!item) continue;
    if (saved.SHIELD && saved.SHIELD.id == item.id && saved.SHIELD.arg == item.arg) player.SHIELD = player.inventory[i];
    if (saved.WIELD && saved.WIELD.id == item.id && saved.WIELD.arg == item.arg) player.WIELD = player.inventory[i];
    if (saved.WEAR && saved.WEAR.id == item.id && saved.WEAR.arg == item.arg) player.WEAR = player.inventory[i];
  }

  player.char = saved.char;

  player.x = saved.x;
  player.y = saved.y;

  HARDGAME = saved.HARDGAME;

  player.STRENGTH = saved.STRENGTH;
  player.INTELLIGENCE = saved.INTELLIGENCE;
  player.WISDOM = saved.WISDOM;
  player.CONSTITUTION = saved.CONSTITUTION;
  player.DEXTERITY = saved.DEXTERITY;
  player.CHARISMA = saved.CHARISMA;
  player.HPMAX = saved.HPMAX;
  player.HP = saved.HP;
  player.GOLD = saved.GOLD;
  player.EXPERIENCE = saved.EXPERIENCE;
  player.LEVEL = saved.LEVEL;
  player.REGEN = saved.REGEN;
  player.WCLASS = saved.WCLASS;
  player.AC = saved.AC;
  player.BANKACCOUNT = saved.BANKACCOUNT;
  player.SPELLMAX = saved.SPELLMAX;
  player.SPELLS = saved.SPELLS;
  player.ENERGY = saved.ENERGY;
  player.ECOUNTER = saved.ECOUNTER;
  player.MOREDEFENSES = saved.MOREDEFENSES;
  player.PROTECTIONTIME = saved.PROTECTIONTIME;
  player.REGENCOUNTER = saved.REGENCOUNTER;
  player.MOREDAM = saved.MOREDAM;
  player.DEXCOUNT = saved.DEXCOUNT;
  player.STRCOUNT = saved.STRCOUNT;
  player.BLINDCOUNT = saved.BLINDCOUNT;
  player.CONFUSE = saved.CONFUSE;
  player.ALTPRO = saved.ALTPRO;
  player.HERO = saved.HERO;
  player.CHARMCOUNT = saved.CHARMCOUNT;
  player.INVISIBILITY = saved.INVISIBILITY;
  player.CANCELLATION = saved.CANCELLATION;
  player.HASTESELF = saved.HASTESELF;
  player.AGGRAVATE = saved.AGGRAVATE;
  player.GLOBE = saved.GLOBE;
  player.TELEFLAG = saved.TELEFLAG;
  player.SLAYING = saved.SLAYING;
  player.NEGATESPIRIT = saved.NEGATESPIRIT;
  player.SCAREMONST = saved.SCAREMONST;
  player.AWARENESS = saved.AWARENESS;
  player.HOLDMONST = saved.HOLDMONST;
  player.TIMESTOP = saved.TIMESTOP;
  player.HASTEMONST = saved.HASTEMONST;
  player.CUBEofUNDEAD = saved.CUBEofUNDEAD;
  player.GIANTSTR = saved.GIANTSTR;
  player.FIRERESISTANCE = saved.FIRERESISTANCE;
  player.BESSMANN = saved.BESSMANN;
  player.NOTHEFT = saved.NOTHEFT;
  player.SPIRITPRO = saved.SPIRITPRO;
  player.UNDEADPRO = saved.UNDEADPRO;
  player.STEALTH = saved.STEALTH;
  player.ITCHING = saved.ITCHING;
  player.LAUGHING = saved.LAUGHING;
  player.DRAINSTRENGTH = saved.DRAINSTRENGTH;
  player.CLUMSINESS = saved.CLUMSINESS;
  player.INFEEBLEMENT = saved.INFEEBLEMENT;
  player.HALFDAM = saved.HALFDAM;
  player.SEEINVISIBLE = saved.SEEINVISIBLE;
  player.WTW = saved.WTW;
  player.STREXTRA = saved.STREXTRA;
  player.LIFEPROT = saved.LIFEPROT;

  player.MOVESMADE = saved.MOVESMADE;
  player.SPELLSCAST = saved.SPELLSCAST;
  player.MONSTKILLED = saved.MONSTKILLED;

}
