'use strict';

function saveGame(isCheckPoint) {
  /*
     START HACK to not store player.level
  */
  var x = player.level;
  player.level = null;

  let error;
  let state = new GameState(true);

  try {
    // manually saving game
    if (!isCheckPoint) {
      error = localStorageSetObject(logname, state);
    }

    /* 
      save checkpointbackup, or an emergency backup which can 
      be restored via new wizard passwords 

      v511 -- checkpoints and savegame backups were being badly 
      abused (1000's/day) by a player for high scores. now these 
      games won't be recorded
    */
    state.cheat = true;
    let saveName = isCheckPoint ? 'checkpoint' : logname;
    localStorageSetObject(saveName + 'backup', state);
  } catch (error) {
    console.log(`saveGame(): caught: ${error}`);
  }

  let bytes = JSON.stringify(state);

  /*
     END HACK to not store player.level
  */
  player.level = x;

  if (!isCheckPoint) {
    if (!error) {
      updateLog(`Game saved. ${Number(bytes.length).toLocaleString()} bytes written.`);
    } else {
      updateLog(`${error}`);
      updateLog(`Sorry, your game couldn't be saved! Are cookies disabled?`);
      return false;
    }
  }

  return true;
}



function loadSavedGame(savedState, isCheckPoint) {
  if (!savedState) {
    updateLog(`Sorry, your saved game can't be found!`);
    return;
  }

  loadState(savedState);

  /* 
    save game integrity check (mostly for development)
    1) stringify saved state
    2) stringify current state that was loaded from saved state
    3) compare
  */

  // we don't save player.level in savegames, so remove it until later
  let x = player.level;
  player.level = null;

  let savedStateString = JSON.stringify(savedState);
  let currentState = new GameState(false);
  let currentStateString = JSON.stringify(currentState);

  let difftool = new diff_match_patch();
  let diff = difftool.diff_main(savedStateString, currentStateString);
  difftool.diff_cleanupSemantic(diff);

  // reload player.level
  player.level = x;

  // failed integrity check
  if (diff.length != 1) {

    // Rollbar chokes on large messages, and these could get up to 500k+
    // truncate down to what actually matters
    try {
      let errorMessage = `${BUILD} ${GAMENAME} ${logname} failed integrity check, current.length:${currentStateString.length}, saved.length:${savedStateString.length} diff=\n`;
      for (let index = 0; index < diff.length; index++) {
        let fragment = diff[index][1];
        if (fragment.length > 200) {
          fragment = `${fragment.substring(0, 100)}\n   ...\n   ${fragment.substring(fragment.length - 100)}`;
        }
        errorMessage += `${index}: ${fragment}\n`;
      }
      console.log(`${errorMessage}`);
      Rollbar.error(`${errorMessage}`);
    } catch (error) {
      console.log(`failed integrity check: caught: ${error}`);
    }
  }

  /* delete / clear the saved game file */
  // console.log(`NOT DELETING SAVE GAME`);
  localStorageRemoveItem(logname);
  localStorageRemoveItem('checkpoint');

  if (isCheckPoint) {
    updateLog(`Did you quit accidentally? Your last game has been restored just in case`);
  } else {
    updateLog(`Welcome back. (Your save file has now been been deleted)`);
  }

  game_started = true;

  onResize();

}



function loadState(state) {
  var savedLevels = state.LEVELS;
  loadLevels(savedLevels);

  var savedLog = state.LOG;
  LOG = savedLog;

  var savedPlayer = state.player;
  player = loadPlayer(savedPlayer);

  player.level = LEVELS[state.level];

  setRecordingInfo(state.recording);

  newsphereflag = state.newsphereflag;
  GAMEOVER = state.GAMEOVER;
  mazeMode = state.mazeMode;
  napping = state.napping;
  original_objects = state.original_objects;
  keyboard_hints = state.keyboard_hints;
  auto_pickup = state.auto_pickup;
  side_inventory = state.side_inventory;
  show_color = state.show_color;
  bold_objects = state.bold_objects;
  dnd_item = state.dnd_item;
  genocide = state.genocide;
  amiga_mode = state.amiga_mode;
  gameID = state.gameID;

  setMode(amiga_mode, retro_mode, original_objects);

  debug_used = state.debug_used;

  logname = state.logname;
  cheat = state.cheat;
  level = state.level;
  wizard = state.wizard;
  gtime = state.gtime;
  setDifficulty(state.HARDGAME);
  lastmonst = state.lastmonst;
  lastnum = state.lastnum;
  hitflag = state.hitflag;
  lastpx = state.lastpx;
  lastpy = state.lastpy;
  lasthx = state.lasthx;
  lasthy = state.lasthy;
  prayed = state.prayed;
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
}



function loadLevels(savedLevels) {
  for (var lev = 0; lev < MAXLEVEL + MAXVLEVEL; lev++) {
    if (!savedLevels[lev]) {
      LEVELS[lev] = null;
      continue;
    }
    debug(`loading: ${lev}`);
    var tempLev = savedLevels[lev];
    var items = initGrid(MAXX, MAXY);
    var monsters = initGrid(MAXX, MAXY);
    for (var x = 0; x < MAXX; x++) {
      for (var y = 0; y < MAXY; y++) {
        items[x][y] = createObject(tempLev.items[x][y]);
        monsters[x][y] = createMonster(tempLev.monsters[x][y]);
      }
    }
    LEVELS[lev] = Object.create(Level);
    LEVELS[lev].items = items;
    LEVELS[lev].monsters = monsters;
    LEVELS[lev].know = tempLev.know;
  }
}



function loadPlayer(saved) {
  var newPlayer = new Player();

  newPlayer.WEAR = null;
  newPlayer.WIELD = null;
  newPlayer.SHIELD = null;

  for (var i = 0; i < 26; i++) {
    var item = saved.inventory[i];
    newPlayer.inventory[i] = item ? createObject(item) : null;
    if (!item) continue;
    if (saved.SHIELD && saved.SHIELD.id == item.id && saved.SHIELD.arg == item.arg) newPlayer.SHIELD = newPlayer.inventory[i];
    if (saved.WIELD && saved.WIELD.id == item.id && saved.WIELD.arg == item.arg) newPlayer.WIELD = newPlayer.inventory[i];
    if (saved.WEAR && saved.WEAR.id == item.id && saved.WEAR.arg == item.arg) newPlayer.WEAR = newPlayer.inventory[i];
  }

  newPlayer.gender = saved.gender;
  newPlayer.char_picked = saved.char_picked;
  newPlayer.ramboflag = saved.ramboflag;

  newPlayer.knownPotions = saved.knownPotions;
  newPlayer.knownScrolls = saved.knownScrolls;
  newPlayer.knownSpells = saved.knownSpells;

  newPlayer.char = saved.char;

  newPlayer.x = saved.x;
  newPlayer.y = saved.y;

  newPlayer.STRENGTH = saved.STRENGTH;
  newPlayer.START_STRENGTH = saved.START_STRENGTH;
  newPlayer.INTELLIGENCE = saved.INTELLIGENCE;
  newPlayer.WISDOM = saved.WISDOM;
  newPlayer.CONSTITUTION = saved.CONSTITUTION;
  newPlayer.DEXTERITY = saved.DEXTERITY;
  newPlayer.CHARISMA = saved.CHARISMA;
  newPlayer.HPMAX = saved.HPMAX;
  newPlayer.HP = saved.HP;
  newPlayer.GOLD = saved.GOLD;
  newPlayer.EXPERIENCE = saved.EXPERIENCE;
  newPlayer.LEVEL = saved.LEVEL;
  newPlayer.REGEN = saved.REGEN;
  newPlayer.WCLASS = saved.WCLASS;
  newPlayer.AC = saved.AC;
  newPlayer.BANKACCOUNT = saved.BANKACCOUNT;
  newPlayer.SPELLMAX = saved.SPELLMAX;
  newPlayer.SPELLS = saved.SPELLS;
  newPlayer.ENERGY = saved.ENERGY;
  newPlayer.ECOUNTER = saved.ECOUNTER;
  newPlayer.MOREDEFENSES = saved.MOREDEFENSES;
  newPlayer.PROTECTIONTIME = saved.PROTECTIONTIME;
  newPlayer.REGENCOUNTER = saved.REGENCOUNTER;
  newPlayer.MOREDAM = saved.MOREDAM;
  newPlayer.DEXCOUNT = saved.DEXCOUNT;
  newPlayer.STRCOUNT = saved.STRCOUNT;
  newPlayer.BLINDCOUNT = saved.BLINDCOUNT;
  newPlayer.CONFUSE = saved.CONFUSE;
  newPlayer.ALTPRO = saved.ALTPRO;
  newPlayer.HERO = saved.HERO;
  newPlayer.COKED = saved.COKED;
  newPlayer.CHARMCOUNT = saved.CHARMCOUNT;
  newPlayer.INVISIBILITY = saved.INVISIBILITY;
  newPlayer.CANCELLATION = saved.CANCELLATION;
  newPlayer.HASTESELF = saved.HASTESELF;
  newPlayer.AGGRAVATE = saved.AGGRAVATE;
  newPlayer.GLOBE = saved.GLOBE;
  newPlayer.TELEFLAG = saved.TELEFLAG;
  newPlayer.SCAREMONST = saved.SCAREMONST;
  newPlayer.AWARENESS = saved.AWARENESS;
  newPlayer.HOLDMONST = saved.HOLDMONST;
  newPlayer.TIMESTOP = saved.TIMESTOP;
  newPlayer.HASTEMONST = saved.HASTEMONST;
  newPlayer.GIANTSTR = saved.GIANTSTR;
  newPlayer.FIRERESISTANCE = saved.FIRERESISTANCE;
  newPlayer.SPIRITPRO = saved.SPIRITPRO;
  newPlayer.UNDEADPRO = saved.UNDEADPRO;
  newPlayer.STEALTH = saved.STEALTH;
  newPlayer.ITCHING = saved.ITCHING;
  newPlayer.LAUGHING = saved.LAUGHING;
  newPlayer.DRAINSTRENGTH = saved.DRAINSTRENGTH;
  newPlayer.CLUMSINESS = saved.CLUMSINESS;
  newPlayer.INFEEBLEMENT = saved.INFEEBLEMENT;
  newPlayer.HALFDAM = saved.HALFDAM;
  newPlayer.SEEINVISIBLE = saved.SEEINVISIBLE;
  newPlayer.WTW = saved.WTW;
  newPlayer.STREXTRA = saved.STREXTRA;
  newPlayer.LIFEPROT = saved.LIFEPROT;

  // ULARN save all the special items
  newPlayer.LAMP = saved.LAMP;
  newPlayer.WAND = saved.WAND;
  newPlayer.SLAYING = saved.SLAYING;
  newPlayer.NEGATESPIRIT = saved.NEGATESPIRIT;
  newPlayer.CUBEofUNDEAD = saved.CUBEofUNDEAD;
  newPlayer.NOTHEFT = saved.NOTHEFT;
  newPlayer.TALISMAN = saved.TALISMAN;
  newPlayer.HAND = saved.HAND;
  newPlayer.ORB = saved.ORB;
  newPlayer.ELVEN = saved.ELVEN;
  newPlayer.SLASH = saved.SLASH;
  newPlayer.BESSMANNINTEL = saved.BESSMANNINTEL;
  newPlayer.BESSMANN = saved.BESSMANN;
  newPlayer.SLAY = saved.SLAY;
  newPlayer.VORPAL = saved.VORPAL;
  newPlayer.STAFF = saved.STAFF;
  newPlayer.PRESERVER = saved.PRESERVER;
  newPlayer.PAD = saved.PAD;
  newPlayer.ELEVDOWN = saved.ELEVDOWN;
  newPlayer.ELEVUP = saved.ELEVUP;

  newPlayer.MOVESMADE = saved.MOVESMADE;
  newPlayer.SPELLSCAST = saved.SPELLSCAST;
  newPlayer.MONSTKILLED = saved.MONSTKILLED;

  newPlayer.hasPickedUpPotion = saved.hasPickedUpPotion;

  return newPlayer;
}