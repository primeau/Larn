'use strict';

function saveGame(isCheckPoint) {

  if (NOCOOKIES) {
    if (!isCheckPoint)
    updateLog(`Cookies are disabled, games cannot be loaded or saved`);
    return;
  }

  if (wizard || cheat) {
    if (isCheckPoint) {
      // console.log(`not saving wizard/cheater checkpoint`);
      return;
    }
  }

  var saveName = isCheckPoint ? 'checkpoint' : logname;

  // START HACK to not store player.level
  var x = player.level;
  player.level = null;

  var state = new GameState();
  var bytes;

  /* v304 -- i've decided to remove the automatic reloading checkpoint feature
     for accidentally closed windows because it's too easy to cheat.
     if a game is lost it still can be restored with the 'checkpoint command'
  */
  if (saveName != 'checkpoint') {
    localStorageSetObject(saveName, state);
  }

  /* save an emergency backup */
  localStorageSetObject(saveName + 'backup', state);

  var hash = forge.md.sha512.create();
  hash.update(bytes = JSON.stringify(state));

  player.level = x;
  // END HACK to not store player.level

  if (!isCheckPoint) {
    updateLog(`Game saved. ${Number(bytes.length).toLocaleString()} bytes written.`);
  }

  // console.log(JSON.stringify(state));
  // console.log(`saved hash: ` + hash.digest().toHex());
  localStorageSetObject('hash', hash.digest().toHex());
}



function loadSavedGame(savedState, isCheckPoint) {
  if (!savedState) {
    updateLog(`Sorry, I can't find your save game file!`);
    return;
  }

  loadState(savedState);

  // check for cheaters:
  // 1. hash everything important
  // 2. load the saved hash
  // 3. are they the same?
  var hash = forge.md.sha512.create();
  hash.update(JSON.stringify(savedState));
  // console.log(JSON.stringify(savedState));

  // console.log(`computed hash: ` + hash.digest().toHex());

  var savedHash = localStorageGetObject('hash', []);
  // console.log(`saved hash: ` + savedHash);

  cheat = cheat || hash.digest().toHex() != savedHash;
  console.log(`cheater? ` + cheat);

  if (isCheckPoint) {
    updateLog(`Did you quit accidentally? I restored your last game just in case.`);
  } else {
    updateLog(`Welcome back. (Your save file has now been been deleted)`);
  }

  /* v304 -- disabling cheating funcionality for now. It's really more
     of a tool for me to check for savegame consistency at this point
  */
  if (cheat) {
    // updateLog(`Have you been cheating?`);
    updateLog(`*** Hey, you should tell <b>eye@larn.org</b> about this game`);
    updateLog(`    ${GAMENAME} thinks you're cheating (but you're probably not)`);
    cheat = false;
  }

  /* clear the saved game file */
  localStorageRemoveItem(logname);
  localStorageRemoveItem('checkpoint');

}



function loadState(state) {
  var savedLevels = state.LEVELS;
  loadLevels(savedLevels);

  var savedLog = state.LOG;
  LOG = savedLog;

  var savedPlayer = state.player;
  player = loadPlayer(savedPlayer);

  player.level = LEVELS[state.level];

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

  if (amiga_mode) {
    amiga_mode = false;
    original_objects = false;
    eventToggleMode(null, null, true);
  }

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
  newPlayer.PAD = saved.PAD;
  newPlayer.ELEVDOWN = saved.ELEVDOWN;
  newPlayer.ELEVUP = saved.ELEVUP;

  newPlayer.MOVESMADE = saved.MOVESMADE;
  newPlayer.SPELLSCAST = saved.SPELLSCAST;
  newPlayer.MONSTKILLED = saved.MONSTKILLED;

  newPlayer.hasPickedUpPotion = saved.hasPickedUpPotion;

  return newPlayer;
}
