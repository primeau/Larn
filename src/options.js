'use strict';

let LAST_KEY_PRESSED = ``;
const MAX_TEXT_LENGTH = 699;

const wallOptions = [`▒`, `#`, `Single Line ASCII`, `Single Line ASCII (modern)`, `Double Line ASCII`];
//                         0    1    2    3    4    5    6    7    8    9    10   11   12   13   14   15   16   17   18   19   20   21   22   23   24   25   26   27   28   29   30   31   32 
const blockWalls =        ['▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒', '▒'];
const octalthorpeWalls =  ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'];
const singleAsciiModern = ['○', '.', '╵', '.', '╶', '.', '╰', '.', '╷', '.', '│', '.', '╭', '.', '├', '.', '╴', '.', '╯', '.', '─', '.', '┴', '.', '╮', '.', '┤', '.', '┬', '.', '┼', '.', '.'];  
const singleAsciiWalls =  ['│', '.', '│', '.', '─', '.', '└', '.', '│', '.', '│', '.', '┌', '.', '├', '.', '─', '.', '┘', '.', '─', '.', '┴', '.', '┐', '.', '┤', '.', '┬', '.', '┼', '.', '.'];  
const doubleAsciiWalls =  ['║', '.', '║', '.', '═', '.', '╚', '.', '║', '.', '║', '.', '╔', '.', '╠', '.', '═', '.', '╝', '.', '═', '.', '╩', '.', '╗', '.', '╣', '.', '╦', '.', '╬', '.', '.'];  
const WALLS = [blockWalls, octalthorpeWalls, singleAsciiWalls, singleAsciiModern, doubleAsciiWalls];

const mouseOptions = [`left click`, `double click`, `shift-click`, `right click`, `none`];
const MOUSE_LEFT_CLICK = 0;
const MOUSE_DOUBLE_CLICK = 1;
const MOUSE_SHIFT_CLICK = 2;
const MOUSE_RIGHT_CLICK = 3;
const MOUSE_NONE = 4;

const exploreFightOptions = [`Never attack`, `Simple monsters`, `All monsters`];
const EXPLORE_FIGHT_NONE = 0;
const EXPLORE_FIGHT_BASIC = 1;
const EXPLORE_FIGHT_ALL = 2;

const explorePickupOptions = [`None`, `Gold`, `Only good`, `All`];
const EXPLORE_PICKUP_NONE = 0;
const EXPLORE_PICKUP_GOLD = 1;
const EXPLORE_PICKUP_GOOD = 2;
const EXPLORE_PICKUP_ALL = 3;

const exploreHPOptions = [`Stop when hit`, `100%`, `75%`, `50%`, `25%`, `Fight to the Death`];
const EXPLORE_HP_ANY_HIT = 0;
const EXPLORE_HP_100 = 1;
const EXPLORE_HP_75 = 2;
const EXPLORE_HP_50 = 3;
const EXPLORE_HP_25 = 4;
const EXPLORE_HP_TO_THE_DEATH = 5;

// Preference Registry
// Each entry declares:
//   key          — localStorage key string
//   hotkey       — the letter key used in parse_options() to activate this preference
//   amiga_hidden — [optional] true if the option is hidden when amiga_mode is on
//   context      — [optional] string[] of screen where this pref is shown (e.g. ['options'], ['explore']); shown everywhere if absent
//   def          — default value (primitive; safe to use at options.js parse time)
//   defFn        — [optional] () => default; for values not defined at parse time
//   value        — live storage for the preference (owned by the entry, not a global)
//   get()        — returns the current live value
//   set(v)       — applies value + side effects; does NOT save
//
// Usage:
//   getPref(name)         — return the current value of a preference
//   setPref(name, value)  — apply a new value and persist to localStorage
//   loadPreference(name)  — load + apply one preference from localStorage
//   loadPreferences()     — load + apply all preferences (call at startup)

const PREFS = {
  // not shown on options screen
  showConfigButtons:{ key: 'showConfigButtons', 
                      def: true, value: true,
                      get() { return this.value; }, 
                      set(v) { this.value = v; } },
  
  // shown on options screen
  player_char:      { key: 'player_char', amiga_hidden: true, context: ['options'],
                      hotkey: 'P', label: 'Player Character', def: null, // NO VALUE: uses player.char
                      get: () => player?.char ?? null,  
                      set: v => { setPlayerChar(v); },
                      display: () => player.getChar(),
                      action: () => { document.addEventListener(`paste`, onOptionsPasteEvent); drawEditPlayerWindow(player.getChar()); return 1; } },
  floor_char:       { key: 'floor_char', amiga_hidden: true, context: ['options'],
                      hotkey: 'F', label: 'Floor Character', def: OEMPTY_DEFAULT_CHAR, value: OEMPTY_DEFAULT_CHAR,
                      get() { return this.value; },
                      set(v) {
                        if (!v || !v.length) v = OEMPTY_DEFAULT_CHAR;
                        this.value = v;
                        setObjectChar(OEMPTY, v);
                        setObjectChar(OIVDARTRAP, v);
                        setObjectChar(OIVTELETRAP, v);
                        setObjectChar(OTRAPARROWIV, v);
                        setObjectChar(OIVTRAPDOOR, v);
                      },
                      display() { return OEMPTY.char; },
                      action() { document.addEventListener(`paste`, onOptionsPasteEvent); drawEditFloorWindow(OEMPTY.char); return 1; } },
  wall_char:        { key: 'wall_char', amiga_hidden: true, context: ['options'], 
                      hotkey: 'W', label: 'Wall Character', def: 0, value: 0,
                      get() { return this.value; },
                      set(v) { if (v == null || v < 0 || v >= WALLS.length) v = 0; this.value = v; },
                      display() { return wallOptions[this.value]; },
                      action() { setPref('wall_char', (this.value + 1) % WALLS.length); print_options(); return 0; } },

  keyboard_hints:   { key: 'keyboard_hints', context: ['options'],
                      hotkey: 'K', label: 'Keyboard Hints', def: true, value: true,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return this.value ? `on` : `off`; },
                      action() { setPref('keyboard_hints', !this.value); print_options(); return 0; } },
  auto_pickup:      { key: 'auto_pickup', context: ['options'],
                      hotkey: 'A', label: 'Auto Pickup', def: false, value: false,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return this.value ? `on` : `off`; },
                      action() { setPref('auto_pickup', !this.value); print_options(); return 0; } },
  side_inventory:   { key: 'side_inventory', context: ['options'],
                      hotkey: 'I', label: 'Inventory', def: true, value: true,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return this.value ? `on` : `off`; },
                      action() { setPref('side_inventory', !this.value); print_options(); return 0; } },
  show_color:       { key: 'show_color', amiga_hidden: true, context: ['options'],
                      hotkey: 'O', label: 'Object Color', def: true, value: true,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return this.value ? `on` : `off`; },
                      action() { setPref('show_color', !this.value); print_options(); return 0; } },
  log_color:        { key: 'log_color', context: ['options'],
                      hotkey: 'L', label: 'Log Color', def: true, value: true,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return this.value ? `on` : `off`; },
                      action() { setPref('log_color', !this.value); print_options(); return 0; } },
  bold_objects:     { key: 'bold_objects', amiga_hidden: true, context: ['options'],
                      hotkey: 'B', label: 'Bold Objects', def: true, value: true,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return this.value ? `on` : `off`; },
                      action() { setPref('bold_objects', !this.value); print_options(); return 0; } },
  original_objects: { key: 'original_objects', amiga_hidden: true, context: ['options'],
                      hotkey: 'D', label: 'Dungeon Objects', def: true, value: true,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return this.value ? `Larn` : `Hack`; },
                      action() { setPref('original_objects', !this.value); print_options(); return 0; } },
  retro_mode:       { key: 'retro_mode', context: ['options'],
                      hotkey: 'T', label: 'Text Font', def: true, value: true,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return amiga_mode ? (this.value ? `Amiga 500` : `Amiga 1200`) : (this.value ? `DOS` : `Modern`); },
                      action() { setPref('retro_mode', !this.value); print_options(); return 0; } },
  no_intro:         { key: 'no_intro', context: ['options'],
                      hotkey: 'S', label: 'Skip Intro', def: false, value: false,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return this.value ? `on` : `off`; },
                      action() { setPref('no_intro', !this.value); print_options(); return 0; } },
  identify_button:  { key: 'identify_button', context: ['options'],
                      hotkey: 'V', label: 'View Object', def: MOUSE_LEFT_CLICK, value: MOUSE_LEFT_CLICK,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return mouseOptions[this.value]; },
                      action() { setPref('identify_button', (this.value + 1) % mouseOptions.length); print_options(); initHelpPages(); return 0; } },
  travel_button:    { key: 'travel_button', context: ['options'],
                      hotkey: 'G', label: 'Go to Object', def: MOUSE_DOUBLE_CLICK, value: MOUSE_DOUBLE_CLICK,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return mouseOptions[this.value]; },
                      action() { setPref('travel_button', (this.value + 1) % mouseOptions.length); print_options(); initHelpPages(); return 0; } },

  custom_monsters:  { key: 'custom_monsters', context: ['options'],
                      hotkey: 'M', label: 'Monster Names', defFn: () => [], value: [],
                      get() { return this.value; },
                      set(v) { this.value = v ?? []; updateCustomMonsters(this.value); },
                      action() { document.addEventListener(`paste`, onMonsterPasteEvent); drawEditMonstersWindow(this.value?.map((pair) => `${pair[0]}:${pair[1]}`).join(`, `)); return 1; } },
 
  // not a preference, but used to trigger auto explore options window from main screen
  explore_menu:  { key: 'explore_menu', context: ['options'], 
                      hotkey: 'E', label: 'Explore / Travel Options Menu', def: false, value: false,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return `explore_menu`; },
                      action() { drawExploreModeWindow(); return 1; } },
  explore_toggle:   { key: 'explore_toggle', context: ['explore'], 
                      hotkey: 'X', label: 'X Auto Explore', def: false, value: false,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return this.value ? `enabled` : `disabled`; },
                      action() { setPref('explore_toggle', !this.value); initHelpPages(); drawExploreModeWindow(); return 0; } },
  explore_object:   { key: 'explore_object', context: ['explore'], 
                      hotkey: 'G', label: 'G Travel to Object', def: false, value: false,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return this.value ? `enabled` : `disabled`; },
                      action() { setPref('explore_object', !this.value); initHelpPages(); drawExploreModeWindow(); return 0; } },
  explore_stairs:   { key: 'explore_stairs', context: ['explore'], 
                      hotkey: '{', label: '{ Travel to Stairs', def: false, value: false,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return this.value ? `enabled` : `disabled`; },
                      action() { setPref('explore_stairs', !this.value); initHelpPages(); drawExploreModeWindow(); return 0; } },
  explore_pray:     { key: 'explore_pray', context: ['explore'], 
                      hotkey: 'A', label: 'Altars', def: false, value: false,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return this.value ? `Autopray` : `Avoid`; },
                      action() { setPref('explore_pray', !this.value); drawExploreModeWindow(); return 0; } },
  explore_pickup:   { key: 'explore_pickup', context: ['explore'], 
                      hotkey: 'T', label: 'Take objects', def: EXPLORE_PICKUP_NONE, value: EXPLORE_PICKUP_NONE,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return explorePickupOptions[this.value]; },
                      action() { setPref('explore_pickup', (this.value + 1) % explorePickupOptions.length); drawExploreModeWindow(); return 0; } },
  explore_fight:    { key: 'explore_fight', context: ['explore'], 
                      hotkey: 'F', label: 'Fight', def: EXPLORE_FIGHT_NONE, value: EXPLORE_FIGHT_NONE,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return exploreFightOptions[this.value]; },
                      action() { setPref('explore_fight', (this.value + 1) % exploreFightOptions.length); drawExploreModeWindow(); return 0; } },
  explore_hp_limit: { key: 'explore_hp_limit', context: ['explore'], 
                      hotkey: 'L', label: 'Low HP Limit', def: EXPLORE_HP_ANY_HIT, value: EXPLORE_HP_ANY_HIT,
                      get() { return this.value; }, 
                      set(v) { this.value = v; },
                      display() { return exploreHPOptions[this.value]; },
                      action() { setPref('explore_hp_limit', (this.value + 1) % exploreHPOptions.length); drawExploreModeWindow(); return 0; } },
};

function loadPreference(name) {
  const pref = PREFS[name];
  if (!pref) return;
  const defaultValue = 'defFn' in pref ? pref.defFn() : pref.def;
  pref.set(localStorageGetObject(pref.key, defaultValue));
}

function loadPreferences() {
  for (const name of Object.keys(PREFS)) loadPreference(name);
}

function getPref(name) {
  return PREFS[name]?.get();
}

function setPref(name, value) {
  const pref = PREFS[name];
  if (!pref) return;
  pref.set(value);
  localStorageSetObject(pref.key, pref.get());
}

function overridePref(name, value) {
  PREFS[name]?.set(value);
}

function getPreferenceValues() {
  const values = {};
  for (const name in PREFS) {
    if ('value' in PREFS[name]) {
      // skip player_char which reads from player.char
      values[name] = getPref(name);
    }
  }
  return values;
}

function loadSavedPreferences(saved) {
  if (!saved) return;
  for (const name in saved) {
    if (PREFS[name] && 'value' in PREFS[name] && saved[name] !== undefined) {
      setPref(name, saved[name]);
    }
  }
}

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// MAIN OPTIONS SCREEN                                            //
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
function print_options() {
  mazeMode = false;
  setCharCallback(parse_options);

  const leftCol = 1;
  const rightCol = 35;
  clear();
  lprcat(`                                  <b>Game Options</b>\n\n`);

  cursor(leftCol, cursory);
  if (!amiga_mode) lprcat(`${prefLabel('player_char')}: ${PREFS.player_char.display()}\n`);
  if (!amiga_mode) lprcat(`${prefLabel('floor_char')}:  ${PREFS.floor_char.display()}\n`);
  if (!amiga_mode) lprcat(`${prefLabel('wall_char')}:   ${PREFS.wall_char.display()}\n\n`);

  const row2 = cursory;
  cursor(leftCol, cursory);
  lprcat(`${prefLabel('keyboard_hints')}:   ${PREFS.keyboard_hints.display()}\n`);
  lprcat(`${prefLabel('auto_pickup')}:      ${PREFS.auto_pickup.display()}\n`);
  lprcat(`${prefLabel('side_inventory')}:        ${PREFS.side_inventory.display()}\n`);
  if (!amiga_mode) lprcat(`${prefLabel('show_color')}:     ${PREFS.show_color.display()}\n`);
  lprcat(`${prefLabel('log_color')}:        ${PREFS.log_color.display()}\n`);
  if (!amiga_mode) lprcat(`${prefLabel('bold_objects')}:     ${PREFS.bold_objects.display()}\n`);
  if (!amiga_mode) lprcat(`${prefLabel('original_objects')}:  ${PREFS.original_objects.display()}\n`);
  lprcat(`${prefLabel('retro_mode')}:        ${PREFS.retro_mode.display()}\n`);

  lprcat(`\n`);
  if (amiga_mode) lprcat(`\n`);
  lprcat(`${prefLabel('custom_monsters')}:`);

  let monsterString = `no custom monsters`;
  const custom_monsters = getPref('custom_monsters') ?? [];
  if (custom_monsters.length > 0) {
    monsterString = custom_monsters.map((name) => name[1]).join(`, `);
  }

  let textindex = 0;
  let textwidth = 55;
  let y = cursory;
  while (textindex < monsterString.length && y <= 22) {
    cursor(21, y++);
    lprcat(monsterString.substring(textindex, textindex + textwidth));
    textindex += textwidth;
  }
  if (cursorx == textwidth + 21 && cursory == 22) {
    cursor(textwidth + 7, 22);
    lprcat(` ... and more!`);
  }

  cursor(rightCol, row2);
  lprcat(`${prefLabel('explore_menu')}\n\n`);
  cursor(rightCol, cursory);
  lprcat(`${prefLabel('no_intro')}:     ${PREFS.no_intro.display()}\n\n`);
  cursor(rightCol, cursory);
  lprcat(`${prefLabel('identify_button')}:    ${PREFS.identify_button.display()}\n`);
  cursor(rightCol, cursory);
  lprcat(`${prefLabel('travel_button')}:   ${PREFS.travel_button.display()}\n`);

  cursors();
  lprcat(`      Press a letter to edit | <b>backspace</b> restore defaults | <b>escape</b> to exit`);
  blt();
}

function parse_options(key) {
  if (key == ESC) {
    nomove = 1;
    return exitbuilding();
  }
  if (key == DEL) {
    for (const [name, pref] of Object.entries(PREFS)) {
      if (pref.context?.includes('options')) {
        const defaultValue = 'defFn' in pref ? pref.defFn() : pref.def;
        setPref(name, defaultValue);
      }
    }
    initHelpPages();
    print_options();
    return 0;
  }
  return parseHotkey(key, 'options');
}

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// SUPPORT FUNCTIONS                                              //
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function parseHotkey(key, context) {
  const lk = key.toUpperCase();
  for (const pref of Object.values(PREFS)) {
    if (!pref.hotkey || pref.hotkey !== lk) continue;
    if (pref.amiga_hidden && amiga_mode) continue;
    const ctx = pref.context ?? ['options'];
    if (!ctx.includes(context)) continue;
    return pref.action();
  }
  return 0;
}

// Wraps the first occurrence of the hotkey letter in the label with (<b>X</b>)
function prefLabel(name) {
  const p = PREFS[name];
  const idx = p.label.toLowerCase().indexOf(p.hotkey.toLowerCase());
  if (idx === -1) return `(<b>${p.hotkey}</b>) ${p.label}`;
  return p.label.slice(0, idx) + `(<b>${p.hotkey}</b>)` + p.label.slice(idx + 1);
}

function drawEditObjectWindow(title, label, currentChar, parseCallback) {
  let top = 1;
  setCharCallback(parseCallback);
  drawBox(10, top, 60, 10);
  cursor(11, top + 1);
  lprcat(title);
  cursor(15, top + 3);
  lprcat(`${label}: `);
  lprc(currentChar); // handle html tags
  blinken(cursorx, cursory, 39);
  cursor(16, top + 8);
  lprcat(`<b>enter</b> save | <b>backspace</b> default | <b>escape</b> cancel`);
  blt();
}

function drawBox(startx, starty, width, height) {
  const wc = amiga_mode ? 2 : getPref('wall_char');
  cursor(startx, starty);
  lprcat(`${WALLS[wc][12]}`);
  lprcat(`${WALLS[wc][20]}`.repeat(width - 2));
  lprcat(`${WALLS[wc][24]}`);
  for (let y = 1; y < height - 1; y++) {
    cursor(startx, starty + y);
    lprcat(`${WALLS[wc][10]}`);
    lprcat(` `.repeat(width - 2));
    lprcat(`${WALLS[wc][10]}`);
  }
  cursor(startx, starty + height - 1);
  lprcat(`${WALLS[wc][6]}`);
  lprcat(`${WALLS[wc][20]}`.repeat(width - 2));
  lprcat(`${WALLS[wc][18]}`);
}

function backToOptions() {
  document.removeEventListener(`paste`, onOptionsPasteEvent);
  document.removeEventListener(`paste`, onMonsterPasteEvent);
  clearKeyPressEventListener();
  clearBlinkingCursor();
  print_options();
  return 1;
}

function setObjectChar(item, newChar) {
  if (!item) return;
  if (newChar?.length === 1) {
    item.char = newChar;
    item.hackchar = newChar;
    item.ularnchar = newChar;
  }
}

function onOptionsPasteEvent(event) {
  const pastedData = (event?.clipboardData || window?.clipboardData).getData(`text`);
  if (blocking_callback) blocking_callback(pastedData);
  else if (keyboard_input_callback) keyboard_input_callback(pastedData);
}

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// EDIT PLAYER CHAR                                               //
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function drawEditPlayerWindow(key) {
  drawEditObjectWindow(`                      <b>Set Player Char</b>`, `Player Char`, key, parse_player_char);
}

function parse_player_char(key) {
  if (key == ESC) {
    return backToOptions();
  }
  if (key == ENTER) {
    setPref('player_char', LAST_KEY_PRESSED);
    return backToOptions();
  }
  if (key == DEL) {
    let currentPlayerChar = player.getChar();
    player.char = null;
    drawEditPlayerWindow(player.getChar());
    LAST_KEY_PRESSED = null;
    player.char = currentPlayerChar;
    return 0;
  }
  key = key.charAt(0);
  drawEditPlayerWindow(key);
  LAST_KEY_PRESSED = key;
  return 0;
}

function setPlayerChar(newChar) {
  if (player && (newChar === null || newChar.length === 1)) {
    player.char = newChar;
  }
}

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// EDIT FLOOR CHAR                                                //
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function drawEditFloorWindow(key) {
  drawEditObjectWindow(`                       <b>Set Floor Char</b>`, `Floor Char`, key, parse_floor_char);
}

function parse_floor_char(key) {
  if (key == ESC) {
    return backToOptions();
  }
  if (key == ENTER) {
    setPref('floor_char', LAST_KEY_PRESSED);
    return backToOptions();
  }
  if (key == DEL) {
    drawEditFloorWindow(OEMPTY_DEFAULT_CHAR);
    LAST_KEY_PRESSED = OEMPTY_DEFAULT_CHAR;
    return 0;
  }
  key = key.charAt(0);
  drawEditFloorWindow(key);
  LAST_KEY_PRESSED = key;
  return 0;
}

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// EDIT AUTO EXPLORE                                              //
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function drawExploreModeWindow() {
  let top = 1;
  setCharCallback(parse_explore_mode);
  drawBox(10, top, 60, 14);
  cursor(11, top + 1);
  lprcat(`                   <b>Explore / Travel Options</b>`);
  cursor(13, top + 3);
  lprcat(`${prefLabel('explore_toggle')}:       ${PREFS.explore_toggle.display()}`);
  cursor(13, top + 4);
  lprcat(`${prefLabel('explore_stairs')}:   ${PREFS.explore_stairs.display()}`);
  cursor(13, top + 5);
  lprcat(`${prefLabel('explore_object')}:   ${PREFS.explore_object.display()}`);
  cursor(13, top + 7);
  lprcat(`${prefLabel('explore_pickup')}:         ${PREFS.explore_pickup.display()}`);
  cursor(13, top + 8);
  lprcat(`${prefLabel('explore_pray')}:               ${PREFS.explore_pray.display()}`);
  cursor(13, top + 9);
  lprcat(`${prefLabel('explore_fight')}:                ${PREFS.explore_fight.display()}`);
  cursor(13, top + 10);
  lprcat(`${prefLabel('explore_hp_limit')}:         ${PREFS.explore_hp_limit.display()}`);

  cursor(17, top + 12);
  lprcat(`<b>backspace</b> restore defaults | <b>escape</b> to go back`);
  blt();
}

function parse_explore_mode(key) {
  if (key == ESC) {
    return backToOptions();
  }
  if (key == DEL) {
    for (const [name, pref] of Object.entries(PREFS)) {
      if (pref.context?.includes('explore')) {
        const defaultValue = 'defFn' in pref ? pref.defFn() : pref.def;
        setPref(name, defaultValue);
      }
    }
    initHelpPages();
    drawExploreModeWindow();
    return 0;
  }
  return parseHotkey(key, 'explore');
}

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// EDIT CUSTOM MONSTERS                                           //
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function redrawMonsterWindow(key) {
  drawEditMonstersWindow(KEYBOARD_INPUT);
}

function drawEditMonstersWindow(monsterString) {
  if (!monsterString) {
    monsterString = ``;
  }
  setKeyPressEventListener(redrawMonsterWindow);
  setTextCallback(parse_monster_list, MAX_TEXT_LENGTH);
  KEYBOARD_INPUT = monsterString;

  let top = 1;
  let bottom = 24;
  drawBox(10, top, 60, bottom - top + 1);
  cursor(31, top + 1);
  lprcat(`<b>Customize Monsters</b>`);
  cursor(20, bottom - 1);
  lprcat(`<b>enter</b> save | <b>blank</b> default | <b>escape</b> cancel`);
  cursor(15, top + 3);
  lprcat(`Format: A:aardvark, B:basilisk, p:Prince of Gems ...`);
  cursor(15, top + 4);
  lprcat(`        Pasting from clipboard is supported.`);
  cursor(15, top + 5);
  lprcat(`        Names are limited to 24 characters.`);
  cursor(15, top + 7);

  let textindex = 0;
  let textwidth = 50;
  let y = cursory;
  while (textindex < monsterString.length) {
    cursor(15, y++);
    lprcat(monsterString.substring(textindex, textindex + textwidth));
    textindex += textwidth;
  }
  blinken(cursorx - monsterString.length, cursory, 1);
  blt();
  return 0;
}

function parse_monster_list(text, fromPaste) {
  if (text == ESC) {
    return backToOptions();
  }
  if (fromPaste) {
    drawEditMonstersWindow(text); // clobber existing text
    return 0;
  } else {
    setMonsterNames(text);
    return backToOptions();
  }
}

function filterMonsterInput(input) {
  return input.replace(/[^a-zA-Z0-9:,.?!^\- ]/g, ``);
}

function onMonsterPasteEvent(event) {
  const pastedData = (event.clipboardData || window.clipboardData).getData(`text`);
  // console.log(`monster paste:`, pastedData);
  const cleanedData = filterMonsterInput(pastedData);
  parse_monster_list(cleanedData.substring(0, MAX_TEXT_LENGTH), true); // clobber existing text
}

function setMonsterNames(monsterString) {
  // console.log(`setMonsterNames called with value:`, monsterString);
  const monsters = [];

  const seenFirstLetters = new Set();
  for (const pairString of monsterString?.split(`,`) ?? []) {
    let pair = pairString.split(`:`);
    if (pair.length !== 2) continue;
    let firstLetter = pair[0].trim().charAt(0);
    let monsterName = pair[1].trim().substring(0, 24);
    if (firstLetter.length === 0 || monsterName.length === 0) continue;
    if (seenFirstLetters.has(firstLetter)) continue;
    seenFirstLetters.add(firstLetter);

    monsters.push([firstLetter, monsterName]);
  }

  setPref('custom_monsters', monsters);
}

function updateCustomMonsters(customList) {
  // clear any old custom settings
  monsterlist = ULARN ? structuredClone(ULARN_monsterlist) : structuredClone(LARN_monsterlist);
  // restore back to Monster objects
  for (const monster of monsterlist) {
    Object.setPrototypeOf(monster, Monster.prototype);
  }

  // Check if customList is iterable before attempting to iterate
  if (!Array.isArray(customList)) {
    return;
  }

  for (let customPair of customList) {
    if (!Array.isArray(customPair) || customPair.length < 2) continue;
    for (let monster of monsterlist) {
      if (monster.char === customPair[0]) {
        console.log(`renaming ${monster.desc} to '${customPair[1]}'`);
        monster.desc = customPair[1].substring(0, 24);
        break;
      }
    }
  }
}
