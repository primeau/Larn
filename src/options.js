'use strict';

// let newMonsterNames = [`BAAAT`, `Hobbled Goblin`, `GNOOOOOOOME`, `KOBOOOOOLD`, `SNAAAAAKE`, `Orc of the Mists`, `Troll of the Hills`, `Cyclops of the Mountains`, `Prince of Gems`, `demigordon`];

let LAST_KEY_PRESSED = ``;
const MAX_TEXT_LENGTH = 699;

function print_options() {
  mazeMode = false;
  setCharCallback(parse_options);

  // from buttons.js:helpbuttons()
  let hintsLabel = keyboard_hints ? `on` : `off`;
  let pickupLabel = auto_pickup ? `on` : `off`;
  let inventoryLabel = side_inventory ? `on` : `off`;
  let boldLabel = bold_objects ? `on` : `off`;
  let objectColorLabel = show_color ? `on` : `off`;
  let logColorLabel = log_color ? `on` : `off`;
  let retroLabel = retro_mode ? `DOS` : `Modern`;
  let dungeonLabel = original_objects ? `Larn` : `Hack`;
  if (amiga_mode) retroLabel = retro_mode ? `Amiga 500` : `Amiga 1200`;
  let skipLabel = no_intro ? `on` : `off`;

  clear();
  lprcat(`                                  <b>Game Options</b>\n\n`);

  if (!amiga_mode) lprcat(`(<b>P</b>)layer Character: ${player.getChar()}\n`);
  if (!amiga_mode) lprcat(`(<b>F</b>)loor Character:  ${OEMPTY.char}\n`);
  if (!amiga_mode) lprcat(`(<b>W</b>)all Character:   ${wallOptions[wall_char]}\n\n`);

  lprcat(`(<b>K</b>)eyboard Hints:   ${hintsLabel}\n`);
  lprcat(`(<b>A</b>)uto Pickup:      ${pickupLabel}\n`);
  lprcat(`(<b>I</b>)nventory:        ${inventoryLabel}\n`);
  if (!amiga_mode) lprcat(`(<b>O</b>)bject Color:     ${objectColorLabel}\n`);
  lprcat(`(<b>L</b>)og Color:        ${logColorLabel}\n`);
  if (!amiga_mode) lprcat(`(<b>B</b>)old Objects:     ${boldLabel}\n`);
  if (!amiga_mode) lprcat(`(<b>D</b>)ungeon Objects:  ${dungeonLabel}\n`);
  lprcat(`(<b>T</b>)ext Font:        ${retroLabel}\n\n`);
  lprcat(`(<b>S</b>)kip Intro:       ${skipLabel}\n\n`);
  lprcat(`(<b>M</b>)onster Names:`);

  let monsterString = ``;
  if (custom_monsters.length > 0) {
    monsterString = custom_monsters
      .map((name) => {
        return name[1];
      })
      .join(`, `);
  } else {
    monsterString = `no custom monsters`;
  }

  let textindex = 0;
  let textwidth = 44;
  let y = cursory;
  while (textindex < monsterString.length && y <= 22) {
    cursor(21, y++);
    lprcat(monsterString.substring(textindex, textindex + textwidth));
    textindex += textwidth;
  }
  if (cursorx == 65 && cursory == 22) {
    cursor(51, 22);
    lprcat(` ... and more!`);
  }

  cursors();
  lprcat(`              ----  Press a letter to edit, <b>escape</b> to exit  ----`);
  blt();
}

function parse_options(key) {
  // console.log(`parse_options: key=${key}`);
  if (key == ESC) {
    nomove = 1;
    return exitbuilding();
  }
  if (key.toLowerCase() == `p`) {
    document.addEventListener(`paste`, onOptionsPasteEvent);
    drawEditPlayerWindow(player.getChar());
    return 1;
  }
  if (key.toLowerCase() == `f`) {
    document.addEventListener(`paste`, onOptionsPasteEvent);
    drawEditFloorWindow(OEMPTY.char);
    return 1;
  }
  if (key.toLowerCase() == `m`) {
    document.addEventListener(`paste`, onMonsterPasteEvent);
    const monsterString = custom_monsters.map((pair) => `${pair[0]}:${pair[1]}`).join(`, `);
    drawEditMonstersWindow(monsterString);
    return 1;
  }
  if (key.toLowerCase() == `w`) {
    wall_char += 1;
    if (wall_char >= WALLS.length) wall_char = 0;
    setWallChar(wall_char);
    print_options();
    return 0;
  }
  if (key.toLowerCase() == `k`) {
    keyboard_hints = !keyboard_hints;
    localStorageSetObject(`keyboard_hints`, keyboard_hints);
    print_options();
    return 0;
  }
  if (key.toLowerCase() == `a`) {
    auto_pickup = !auto_pickup;
    localStorageSetObject(`auto_pickup`, auto_pickup);
    print_options();
    return 0;
  }
  if (key.toLowerCase() == `i`) {
    side_inventory = !side_inventory;
    localStorageSetObject(`side_inventory`, side_inventory);
    print_options();
    return 0;
  }
  if (key.toLowerCase() == `o`) {
    show_color = !show_color;
    localStorageSetObject(`show_color`, show_color);
    print_options();
    return 0;
  }
  if (key.toLowerCase() == `l`) {
    log_color = !log_color;
    localStorageSetObject(`log_color`, log_color);
    print_options();
    return 0;
  }
  if (key.toLowerCase() == `b`) {
    bold_objects = !bold_objects;
    localStorageSetObject(`bold_objects`, bold_objects);
    print_options();
    return 0;
  }
  if (key.toLowerCase() == `d`) {
    original_objects = !original_objects;
    localStorageSetObject(`original_objects`, original_objects);
    print_options();
    return 0;
  }
  if (key.toLowerCase() == `t`) {
    retro_mode = !retro_mode;
    localStorageSetObject(`retro` /* NOT retro_mode */, retro_mode);
    print_options();
    return 0;
  }
  if (key.toLowerCase() == `s`) {
    no_intro = !no_intro;
    localStorageSetObject(`no_intro`, no_intro);
    print_options();
    return 0;
  }
  return 0;
}

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// SUPPORT FUNCTIONS                                              //
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

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
  cursor(startx, starty);
  lprcat(`${WALLS[wall_char][12]}`);
  lprcat(`${WALLS[wall_char][20]}`.repeat(width - 2));
  lprcat(`${WALLS[wall_char][24]}`);
  for (let y = 1; y < height - 1; y++) {
    cursor(startx, starty + y);
    lprcat(`${WALLS[wall_char][10]}`);
    lprcat(` `.repeat(width - 2));
    lprcat(`${WALLS[wall_char][10]}`);
  }
  cursor(startx, starty + height - 1);
  lprcat(`${WALLS[wall_char][6]}`);
  lprcat(`${WALLS[wall_char][20]}`.repeat(width - 2));
  lprcat(`${WALLS[wall_char][18]}`);
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
// PLAYER CHAR                                                    //
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
    setPlayerChar(LAST_KEY_PRESSED);
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
  // if (player && newChar?.length === 1) {
  if (player) {
    player.char = newChar;
    localStorageSetObject(`player_char`, player.char);
  }
}

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// WALL CHAR                                                      //
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function setWallChar(newChar) {
  wall_char = newChar;
  localStorageSetObject(`wall_char`, wall_char);
}

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// FLOOR CHAR                                                     //
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
    setFloorChar(LAST_KEY_PRESSED);
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

function setFloorChar(newChar) {
  // console.log(`setFloorChar called with value:`, newChar);
  if (!newChar || newChar.length === 0) {
    // console.log(`setFloorChar: resetting to default char`, newChar);
    newChar = OEMPTY_DEFAULT_CHAR;
  }
  floor_char = newChar;
  setObjectChar(OEMPTY, newChar);
  setObjectChar(OIVDARTRAP, newChar);
  setObjectChar(OIVTELETRAP, newChar);
  setObjectChar(OTRAPARROWIV, newChar);
  setObjectChar(OIVTRAPDOOR, newChar);
  localStorageSetObject(`floor_char`, floor_char);
}

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// CUSTOM MONSTERS                                                //
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function redrawMonsterWindow(key) {
  drawEditMonstersWindow(KEYBOARD_INPUT);
}

function drawEditMonstersWindow(monsterString) {
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
  return input.replace(/[^a-zA-Z0-9,:,.?!^\- ]/g, ``);
}

function onMonsterPasteEvent(event) {
  const pastedData = (event.clipboardData || window.clipboardData).getData(`text`);
  // console.log(`monster paste:`, pastedData);
  const cleanedData = filterMonsterInput(pastedData);
  parse_monster_list(cleanedData.substring(0, MAX_TEXT_LENGTH), true); // clobber existing text
}

function setMonsterNames(monsterString) {
  // console.log(`setMonsterNames called with value:`, monsterString);
  custom_monsters = [];

  const seenFirstLetters = new Set();
  let tempCustom = monsterString?.split(`,`);
  for (let i = 0; i < tempCustom?.length; i++) {
    let pairString = tempCustom[i];
    // console.log(pairString);
    let pair = pairString.split(`:`);
    if (pair.length !== 2) continue;
    let firstLetter = pair[0].trim().charAt(0);
    let monsterName = pair[1].trim().substring(0, 24);
    if (firstLetter.length === 0 || monsterName.length === 0) continue;
    if (seenFirstLetters.has(firstLetter)) continue;
    seenFirstLetters.add(firstLetter);

    custom_monsters.push([firstLetter, monsterName]);
  }

  updateCustomMonsters(custom_monsters);

  localStorageSetObject(`custom_monsters`, custom_monsters);
  // console.log(`Updated custom_monsters:`, custom_monsters);
}

function updateCustomMonsters(customList) {
  // clear any old custom settings
  monsterlist = ULARN ? structuredClone(ULARN_monsterlist) : structuredClone(LARN_monsterlist);
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

// function editKeyboardHints(currentSetting) {
//   editBooleanOption(`<b>Toggle Keyboard Hints</b>`, `Keyboard Hints`, currentSetting, parse_keyboard_hints);
// }

// function editBooleanOption(title, label, currentSetting, parseCallback) {
//   setCharCallback(parseCallback);
//   drawBox(10, 1, 60, 10);
//   cursor(30, 2);
//   lprcat(title);
//   cursor(15, 4);
//   let settingText = currentSetting ? `on` : `off`;
//   lprcat(`${label}: ${settingText}`);
//   blinken(cursorx, cursory);
//   cursor(15, 9);
//   lprcat(`<b>space</b> toggle | <b>enter</b> save | <b>escape</b> cancel`);
//   blt();
// }

// function parse_keyboard_hints(key) {
//   if (key == ESC) {
//     return backToOptions();
//   }
//   if (key == ENTER) {
//     keyboard_hints = LAST_KEY_PRESSED;
//     localStorageSetObject(`keyboard_hints`, keyboard_hints);
//     return backToOptions();
//   }
//   if (key == ` `) {
//     keyboard_hints = !keyboard_hints;
//     LAST_KEY_PRESSED = keyboard_hints;
//     editKeyboardHints(keyboard_hints);
//     return 0;
//   }
// }
