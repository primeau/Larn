'use strict';

const VERSION = '12.5.0';
const BUILD = '509';

const ENABLE_DEVMODE = false;  // this must be set to false for production releases

var ULARN = false; // are we playing LARN or ULARN?

var DEBUG_STATS = false;
var DEBUG_OUTPUT = false;
var DEBUG_STAIRS_EVERYWHERE = false;
var DEBUG_KNOW_ALL = false;
var DEBUG_NO_MONSTERS = false;
var DEBUG_PAINT = 0;
var DEBUG_LPRCAT = 0;
var DEBUG_LPRC = 0;
var DEBUG_PROXIMITY = false;

var dofs = false; /* use fullstory */
var lambda; /* AWS lambda database handle */
let compressionWorker; /* web worker to compress save games outside of main thread */
let workersAvailable = window.location.protocol != `file:`; /* can't read file:// */

async function play() {

  console.log(`${gameID}`);

  // this role only has access to invoke the lambda score function 
  AWS.config.accessKeyId = "AWS_CONFIG_ACCESSKEYID";
  AWS.config.secretAccessKey = "AWS_CONFIG_SECRETACCESSKEY";

  // real credentials are set here, and not committed
  try {
    initLambdaCredentials();
  } catch (error) {
    console.error(`not loading aws credentials: ${error}`);
  }

  lambda = new AWS.Lambda({
    region: 'us-east-1',
    apiVersion: '2015-03-31'
  });

  initRB();

  initKeyBindings();

  document.addEventListener('click', onMouseClick);
  window.addEventListener('resize', onResize);

  if (window.Worker && workersAvailable) {
    compressionWorker = new Worker('worker.js');
    compressionWorker.onmessage = onCompressed;
  }

  /* warn the player that closing their window will kill the game */
  if (location.hostname === 'localhost' || location.hostname === '') {
    enableDebug();
  } else {
    window.onbeforeunload = confirmExit;
  }

  // TODO: setup for not repainting in text mode
  // TODO: need to update io.js:os_put_font(), display.js:blt(), larn.js:play()
  // TODO: this will break scoreboard rendering
  if (altrender) {
    for (var y = 0; y < 24; y++) {
      for (var x = 0; x < 80; x++) {
        display[x][y] = createDiv(x, y);
      }
    }

    if (!images) {
      loadImages();
    }

    bltDocument();
  }

  PARAMS = loadURLParameters();

  no_intro = PARAMS.nointro ? PARAMS.nointro == `true` : false;
  ULARN = PARAMS.ularn ? PARAMS.ularn == `true` : false;

  setGameConfig();

  await loadFonts();

  if (PARAMS.score) {
    // unfinished scoreboard loading feature
    player = new Player();
    loadScores(null, true, true);
  } else {
    welcome(); // show welcome screen, start the game
  }

}



async function loadFonts() {
  // make sure fonts are loaded before rendering anything
  // if we don't wait for this, the main screen will end up
  // being a different font
  const testfont = `12px modern`;
  await document.fonts.load(testfont);
}



function confirmExit() {
  if (!GAMEOVER)
    return `Are you sure? Your game will be lost!`;
}



function initKeyBindings() {
  Mousetrap.bind('.', mousetrap); // stay here
  Mousetrap.bind(',', mousetrap); // take
  Mousetrap.bind('<', mousetrap); // go up
  Mousetrap.bind('>', mousetrap); // go down
  Mousetrap.bind('^', mousetrap); // identify traps
  Mousetrap.bind('!', mousetrap); // keyboard hints
  Mousetrap.bind('@', mousetrap); // auto-pickup
  Mousetrap.bind('#', mousetrap); // inventory 
  Mousetrap.bind('{', mousetrap); // retro fonts
  Mousetrap.bind('}', mousetrap); // classic/hack/amiga 
  Mousetrap.bind('?', mousetrap); // help
  Mousetrap.bind('_', mousetrap); // password
  Mousetrap.bind('-', mousetrap); // disarm 
  Mousetrap.bind('+', mousetrap); // load games via password
  Mousetrap.bind('cmd+alt+@', reportBug); // report bug

  Mousetrap.bind(['(', ')'], mousetrap); // allow () for pvnert(x)

  //Mousetrap.bind('enter', mousetrap);
  Mousetrap.bind('tab', mousetrap); // so we can block default browser action
  Mousetrap.bind('return', mousetrap);
  Mousetrap.bind('escape', mousetrap);
  //Mousetrap.bind('del', mousetrap);
  Mousetrap.bind('backspace', mousetrap);
  Mousetrap.bind('space', mousetrap);

  Mousetrap.bind(['up', 'shift+up'], mousetrap);
  Mousetrap.bind(['down', 'shift+down'], mousetrap);
  Mousetrap.bind(['left', 'shift+left'], mousetrap);
  Mousetrap.bind(['right', 'shift+right'], mousetrap);
  Mousetrap.bind(['pageup', 'shift+pageup'], mousetrap);
  Mousetrap.bind(['pagedown', 'shift+pagedown'], mousetrap);
  Mousetrap.bind(['home', 'shift+home'], mousetrap);
  Mousetrap.bind(['end', 'shift+end'], mousetrap);

  Mousetrap.bind(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'], mousetrap);
  Mousetrap.bind(['n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'], mousetrap);

  Mousetrap.bind(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'], mousetrap);
  Mousetrap.bind(['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], mousetrap);

  Mousetrap.bind('*', mousetrap);
  Mousetrap.bind(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], mousetrap);
}



function enableDebug() {
  debug_used = 1;
  document.body.style.backgroundColor = "#002222";
  console.log(`DEBUG_MODE: ON`);
  Mousetrap.bind('alt+`', eventToggleDebugStats);
  Mousetrap.bind('alt+1', eventToggleDebugOutput);
  Mousetrap.bind('alt+2', eventToggleDebugWTW);
  Mousetrap.bind('alt+3', eventToggleDebugStairs);
  Mousetrap.bind('alt+4', eventToggleDebugKnowAll);
  Mousetrap.bind('alt+5', eventToggleDebugStealth);
  Mousetrap.bind('alt+6', eventToggleDebugAwareness);
  Mousetrap.bind('alt+7', eventToggleDebugImmortal);
  Mousetrap.bind('alt+8', eventMagicMap);
  Mousetrap.bind('alt+9', eventEngolden);
  Mousetrap.bind('alt+0', eventToggleDebugNoMonsters);
  Mousetrap.bind('alt+-', eventToggleDebugProximity);
}



function reportBug() {
  let email = `eye@larn.org`;
  let subject = `${logname} found a bug in Larn`;
  let body_message = `
[Thanks for reporting a bug, please add as much info as you can here]

---- Other useful info ----:
version:${VERSION} 
build:${BUILD}
name:${logname}
playerID:${playerID}
gameID:${gameID}
amiga_mode:${amiga_mode}
retro_mode:${retro_mode}
original_objects:${original_objects}
cookies:${navigator.cookieEnabled}
host:${location.hostname}
params:${JSON.stringify(loadURLParameters())}
screen dimensions:${window.screen.width},${window.screen.height}
browser dimensions:${window.innerWidth},${window.innerHeight}

GAMEOVER:${GAMEOVER}
game_started:${game_started}
mazeMode:${mazeMode}
napping:${napping}
keyboard_hints:${keyboard_hints}
auto_pickup:${auto_pickup}
side_inventory:${side_inventory}
show_color:${show_color}
bold_objects:${bold_objects}
genocide:${genocide}
debug_used:${debug_used}
cheat:${cheat}
level:${level}
wizard:${wizard}
gtime:${gtime}
HARDGAME:${HARDGAME}
lastmonst:${lastmonst}
lastnum:${lastnum}
hitflag:${hitflag}
playerx:${player ? player.x : "NA"}
playery:${player ? player.y : "NA"}
lastpx:${lastpx}
lastpy:${lastpy}
lasthx:${lasthx}
lasthy:${lasthy}
prayed:${prayed}
dropflag:${dropflag}
rmst:${rmst}
viewflag:${viewflag}
lasttime:${lasttime}

bottomline:${player ? player.getStatString() : "NA"}
useragent:${navigator.userAgent}
  `;
  // window.location.href = "mailto:mail@domain.tld"; // this opens in same window which would be bad
  var mailto_link = 'mailto:' + email + '?subject=' + subject + '&body=' + encodeURIComponent(body_message);
  window.open(mailto_link, 'emailWindow');
}



function eventToggleDebugStats() {
  nomove = 1;
  debug_used = 1;
  DEBUG_STATS = !DEBUG_STATS;
  updateLog(`DEBUG_STATS: ${DEBUG_STATS}`);
  paint();
}



function eventToggleDebugOutput() {
  nomove = 1;
  debug_used = 1;
  DEBUG_OUTPUT = !DEBUG_OUTPUT;
  updateLog(`DEBUG_OUTPUT: ${DEBUG_OUTPUT}`);
  paint();
}



function eventToggleDebugWTW() {
  nomove = 1;
  debug_used = 1;
  player.updateWTW(player.WTW == 0 ? 100000 : -player.WTW);
  updateLog(`DEBUG_WALK_THROUGH_WALLS: ${(player.WTW > 0)}`);
  paint();
}



function eventToggleDebugStairs() {
  nomove = 1;
  debug_used = 1;
  DEBUG_STAIRS_EVERYWHERE = !DEBUG_STAIRS_EVERYWHERE;
  updateLog(`DEBUG_STAIRS_EVERYWHERE: ${DEBUG_STAIRS_EVERYWHERE}`);
  paint();
}



function eventToggleDebugKnowAll() {
  nomove = 1;
  debug_used = 1;
  DEBUG_KNOW_ALL = true;
  learnAll();
  updateLog(`DEBUG_KNOW_ALL: ${DEBUG_KNOW_ALL}`);
  paint();
}



function learnAll() {
  for (let i = 0; i < spelcode.length; i++) {
    learnSpell(spelcode[i]);
  }
  for (let i = 0; i < SCROLL_NAMES.length; i++) {
    learnScroll(createObject(OSCROLL, i));
  }
  for (let i = 0; i < POTION_NAMES.length; i++) {
    learnPotion(createObject(OPOTION, i));
  }
}



function eventToggleDebugStealth() {
  nomove = 1;
  debug_used = 1;
  if (player.STEALTH <= 0) {
    player.updateHoldMonst(100000);
    player.updateStealth(100000);
    updateLog(`DEBUG: FREEZING MONSTERS`);
  } else {
    player.updateHoldMonst(-player.HOLDMONST);
    player.updateStealth(-player.STEALTH);
    updateLog(`DEBUG: UNFREEZING MONSTERS`);
  }
  paint();
}



function eventToggleDebugAwareness() {
  nomove = 1;
  debug_used = 1;
  if (player.AWARENESS <= 0) {
    player.AWARENESS = 100000;
    updateLog(`DEBUG: EXPANDED AWARENESS++`);
  } else {
    player.AWARENESS = 0;
    updateLog(`DEBUG: EXPANDED AWARENESS--`);
  }
  paint();
}



function eventMagicMap() {
  nomove = 1;
  debug_used = 1;
  read_scroll(createObject(OSCROLL, 15));
  paint();
}



function eventEngolden() {
  nomove = 1;
  debug_used = 1;
  player.GOLD += 250000;
  paint();
}



function eventToggleDebugImmortal() {
  nomove = 1;
  debug_used = 1;
  if (player.LIFEPROT <= 0) {
    player.LIFEPROT = 100000;
    updateLog(`DEBUG: LIFE PROTECTION++`);
  } else {
    player.LIFEPROT = 0;
    updateLog(`DEBUG: LIFE PROTECTION--`);
  }
  paint();
}



function eventToggleDebugNoMonsters() {
  nomove = 1;
  debug_used = 1;
  DEBUG_NO_MONSTERS = !DEBUG_NO_MONSTERS;
  updateLog(`DEBUG: NO MONSTERS: ${DEBUG_NO_MONSTERS}`);
  paint();
}



function eventToggleDebugProximity() {
  nomove = 1;
  debug_used = 1;
  DEBUG_PROXIMITY = !DEBUG_PROXIMITY;
  updateLog(`DEBUG: PROXIMITY: ${DEBUG_PROXIMITY}`);
  paint();
}