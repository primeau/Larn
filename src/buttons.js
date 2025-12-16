'use strict';

// use max-height and overflow: scroll sizing to make button area scroll and not larn div above
// possibly use max-width somewhere too?

// repaint needed after viewing score and then closing
// repaint needed on orientation change
// game over high score inventory view is a mess
// test lineheight in tv


let buttonCache = new Map();

let ACTIONS = `ACTIONS`;
let KEYPAD = `KEYPAD`;
let KEYBOARD = `KEYBOARD`;
let CONTEXT = `CONTEXT`;
let HELP = `HELP`;
let RUN = `RUN`;

let FIXED = `button`;
let VARIABLE = `variablebutton`;
let NARROW = `narrowbutton`;

// common buttons
let BUTTON_DEL = setButton(null, `BUTTON_DEL`, VARIABLE, DEL, `DEL`);
let BUTTON_EXIT = setButton(null, `BUTTON_EXIT`, VARIABLE, ESC, `leave`);
let BUTTON_CANCEL = setButton(null, `BUTTON_CANCEL`, VARIABLE, ESC, `cancel`);
let BUTTON_CONTINUE = setButton(ACTIONS, `BUTTON_CONTINUE`, VARIABLE, SPACE, `continue`);
let BUTTON_YES = setButton(null, `BUTTON_YES`, FIXED, `y`, `yes`);
let BUTTON_NO = setButton(null, `BUTTON_NO`, FIXED, `n`, `no`);
let BUTTON_RUN = setButton(null, `BUTTON_RUN`, `verticalbutton`, null, `run`);
let BUTTON_RUN_INITIALIZED = false;

// let currentsize = 0; // for debugging button cache

//
// 
// Figure out which buttons should be showing, and add them to the screen
//
//
function setButtons() {

  clearButtons();

  if (napping) return;

  if (!isMobile()) {
    if (player && mazeMode) {
      helpButtons(HELP);
    }
    return;
  }

  // if (buttonCache.size != currentsize) {
  //   console.log(`cache size`, buttonCache.size);
  //   currentsize = buttonCache.size;
  // };

  if (!game_started) {
    startupButtons();
    return;
  }

  if (blocking_callback === endgame) {
    setButton(ACTIONS, `BUTTON_ENDGAME`, VARIABLE, ENTER, `view scoreboard`);
    return;
  }

  if (mazeMode) {
    if (blocking_callback === parseQuit) {
      setButton(ACTIONS, `BUTTON_NO`);
      setButton(ACTIONS, `BUTTON_YES`);
      return;
    }

    // casting a spell
    if (blocking_callback === cast) {
      spellListButtons(spelcode);
      return;
    }

    // wish for spell after rubbing brass lamp
    if (blocking_callback === wish) {
      spellListButtons(spelcode, true);
      return;
    }

    // donate at altar
    if (keyboard_input_callback === act_donation_pray) {
      setButton(ACTIONS, `BUTTON_CANCEL`);
      numberKeyboard(KEYBOARD, `donate`, true, true);
      return;
    }

    // drop gold
    if (keyboard_input_callback === drop_object_gold) {
      setButton(ACTIONS, `BUTTON_CANCEL`);
      numberKeyboard(KEYBOARD, `drop`);
      return;
    }

    // genocide
    if (blocking_callback === genmonst) {
      setButton(KEYBOARD, `BUTTON_CAPS_GEN`, VARIABLE, CAPS, `CAPS`);
      newButtonRow(KEYBOARD);
      keyboardButtons(KEYBOARD, UPPERCASE);
      return;
    }

    let inventoryAction = false;

    inventoryAction |= inventoryActionButtons(drop_object, showall);
    inventoryAction |= inventoryActionButtons(act_quaffpotion, showquaff);
    inventoryAction |= inventoryActionButtons(act_read_something, showread);
    inventoryAction |= inventoryActionButtons(act_eatcookie, showeat);
    inventoryAction |= inventoryActionButtons(wear, showwear);
    inventoryAction |= inventoryActionButtons(wield, showallwield);
    if (inventoryAction) {
      return;
    }

    inventoryButtons();

    movementButtons();

    contextButtons();

    helpButtons(HELP);

  } // END MAZEMODE
  else {
    nonMazeButtons();
  }

}



function clearButtons() {
  let div = document.getElementById(HELP);
  if (div) while (div.firstChild) div.firstChild.remove();

  div = document.getElementById(ACTIONS);
  if (div) while (div.firstChild) div.firstChild.remove();

  div = document.getElementById(KEYPAD);
  if (div) while (div.firstChild) div.firstChild.remove();

  div = document.getElementById(RUN);
  if (div) while (div.firstChild) div.firstChild.remove();

  div = document.getElementById(CONTEXT);
  if (div) while (div.firstChild) div.firstChild.remove();

  div = document.getElementById(KEYBOARD);
  if (div) while (div.firstChild) div.firstChild.remove();
}



function setButtonFontSize(size) {
  let mobileDevice = isMobile();
  if (mobileDevice) size += 6;
  else size = Math.max(12, size - 10);
  buttonCache.forEach(button => {
    if (button && button.style) {
      button.style.fontSize = `${size}px`;
      if (!mobileDevice) button.style.padding = `0px`; // see also: setButton()
      if (!mobileDevice) button.style.paddingLeft = `5px`; // see also: setButton()
      if (!mobileDevice) button.style.paddingRight = `5px`; // see also: setButton()
    }
  });
}



function getButton(cacheKey) {
  return buttonCache.get(cacheKey);
}



function newButtonRow(target, height) {
  let row = document.createElement(`br`);
  if (height) row.style.fontSize = `${height}px`;
  document.getElementById(target).appendChild(row);
}



//
//
// get a button, put it on screen
//
//
function setButton(location, cacheKey, style, key, label, repeat, width, height, gap) {
  let button = buttonCache.get(cacheKey);

  if (!button) {
    button = createButton(key, label, repeat, style);
    if (!gap) gap = 12;
    button.style.marginRight = `${gap}px`;
    button.style.marginBottom = `${gap}px`;
    let pad = isMobile() ? 10 : 5;
    button.style.padding = `${pad}px`;

    buttonCache.set(cacheKey, button);
  }

  if (!key) key = button.key;
  if (!label) label = button.value;
  button.key = key;
  button.value = label;
  button.disabled = false;

  if (document.body) {
    button.style.font = document.body.style.font;
    button.style.fontFamily = document.body.style.fontFamily;
  }

  if (width) button.style.width = `${width}px`;
  if (height) button.style.height = `${height}px`

  if (location && document.getElementById(location)) {
    document.getElementById(location).appendChild(button);
  }
  return button;
}




// 
//
// create a button
//
//
function createButton(key, label, repeat, style) {
  let button = document.createElement(`input`);
  button.setAttribute(`type`, `button`);
  button.key = key;
  button.id = label;
  button.name = label;
  button.value = label;
  button.repeat = repeat;

  button.className = style ? style : FIXED;

  if (repeat) {
    if (isTouch()) {
      button.addEventListener(`touchstart`, buttonClicked);
      button.addEventListener(`touchend`, larnmouseup);
      document.ontouchend = larnmouseup;
    } else {
      button.addEventListener(`mousedown`, buttonClicked);
      button.onmouseup = larnmouseup; // to prevent issues with dragging offscreen
      document.onmouseup = larnmouseup; // to prevent issues with dragging offscreen
    }
  } else {
    button.addEventListener(`click`, buttonClicked);
  }

  document.addEventListener(`dblclick`, preventDoubleClick);

  return button;
}



//
//
// BUTTON EVENTS
//
//

let MOUSE_DOWN_EVENT;
let MOUSE_EVENTS = 0;
let MAX_EVENTS = 80; // built in safety

function buttonClicked(event) {
  event.preventDefault();

  let keyPress = event.srcElement.key;
  if (keyPress === null) { console.log(`null keypress`); return; }

  if (event.srcElement.repeat) {
    if (BUTTON_RUN.isRunning) keyPress = keyPress.toUpperCase();
    larnmousedown(keyPress);
  } else {
    if (event.srcElement.keyboardOverride) {
      KEYBOARD_INPUT = event.srcElement.keyboardOverride;
      event.srcElement.keyboardOverride = null;
    }
    mousetrap(null, keyPress);
  }
}

function larnmousedown(key) {
  let LAST_MOUSE_BUTTON = key;
  mousetrap(null, LAST_MOUSE_BUTTON);
  MOUSE_DOWN_EVENT = setInterval(
    function () {
      if (MOUSE_EVENTS++ > 4) {
        mousetrap(null, LAST_MOUSE_BUTTON);
        if (MOUSE_EVENTS > MAX_EVENTS) {
          console.log(`clearing repeat mouse action`);
          larnmouseup();
        }
      }
    }, 50
  );
}

function larnmouseup() {
  clearInterval(MOUSE_DOWN_EVENT);
  MOUSE_EVENTS = 0;
}

function preventDoubleClick(event) {
  event.preventDefault();
}



//
//
// BUILDING BUTTONS and other buttons when not in a maze
//
//
function nonMazeButtons() {

  // viewing scoreboard
  if (blocking_callback === bound_exitscores) {
    setButton(ACTIONS, `BUTTON_EXIT_SCORE`, VARIABLE, ESC, `exit`);
    setButton(KEYBOARD, `BUTTON_NEXT`, VARIABLE, SPACE, `next page`);
    return;
  }

  // viewing discovered items
  if (blocking_callback === parse_see_all) {
    setButton(ACTIONS, `BUTTON_CONTINUE`);
    return;
  }

  // view inventory
  if (blocking_callback === parse_inventory) {
    setButton(ACTIONS, `BUTTON_CONTINUE`);
    return;
  }

  let item = itemAt(player.x, player.y);

  // home
  if (item.matches(OHOME)) {
    // winner
    if (blocking_callback === win) {
      setButton(ACTIONS, `BUTTON_ENTER_ENDGAME`, VARIABLE, ENTER, `continue`);
      return;
    }
    // doesn't have potion (too late is handled in blockingcallback == endgame case)
    var hasPotion = isCarrying(createObject(OPOTION, 21));
    var inTime = gtime <= TIMELIMIT;
    if (!hasPotion && inTime) setButton(ACTIONS, `BUTTON_EXIT`);
    return;
  }

  // bank
  if (item.matches(OBANK) || item.matches(OBANK2)) {
    if (blocking_callback === bank_parse) {
      setButton(ACTIONS, `BUTTON_EXIT`);
      setButton(KEYBOARD, `BUTTON_DEPOSIT`, VARIABLE, `d`, `deposit`).disabled = (player.GOLD === 0);
      newButtonRow(KEYBOARD);
      setButton(KEYBOARD, `BUTTON_WITHDRAW`, VARIABLE, `w`, `withdraw`).disabled = (player.BANKACCOUNT === 0);
      newButtonRow(KEYBOARD);
      setButton(KEYBOARD, `BUTTON_SELL`, VARIABLE, `s`, `sell`).disabled = !isCarryingGem();
    }
    if (keyboard_input_callback === bank_deposit) {
      setButton(ACTIONS, `BUTTON_CANCEL`);
      numberKeyboard(KEYBOARD, `deposit`);
    }
    if (keyboard_input_callback === bank_withdraw) {
      setButton(ACTIONS, `BUTTON_CANCEL`);
      numberKeyboard(KEYBOARD, `withdraw`);
    }
    if (blocking_callback === bank_sell) {
      setButton(ACTIONS, `BUTTON_CANCEL`);
      setButton(KEYBOARD, `BUTTON_SELL_ALL`, VARIABLE, `*`, `sell all`);
      newButtonRow(KEYBOARD);

      let numbuttons = 0;
      for (let i = 0; i < player.inventory.length; i++) {
        let obj = player.inventory[i];
        if (obj) {
          if (obj.isGem() || obj.matches(OLARNEYE)) {
            let label = getCharFromIndex(i);
            setButton(KEYBOARD, `BUTTON_SELL_${label}`, NARROW, label, label);
            if (++numbuttons % 9 === 0) newButtonRow(ACTIONS);
          }
        }
      }
    }
    return;
  }

  // LRS
  if (item.matches(OLRS)) {
    if (blocking_callback === parse_lrs) {
      setButton(ACTIONS, `BUTTON_EXIT`);
      setButton(KEYBOARD, `BUTTON_PAY_TAXES`, VARIABLE, `p`, `pay taxes`);
    } else if (keyboard_input_callback === parse_lrs_pay) {
      setButton(ACTIONS, `BUTTON_CANCEL`);
      numberKeyboard(KEYBOARD, `pay`);
    }
    return;
  }

  // store
  if (item.matches(ODNDSTORE)) {
    if (blocking_callback === dnd_parse) {
      setButton(ACTIONS, `BUTTON_EXIT`);
      setButton(KEYBOARD, `BUTTON_NEXT_PAGE`, VARIABLE, SPACE, `next page`);
      newButtonRow(KEYBOARD);

      keyboardButtons(KEYBOARD, false, false, false, false);
      for (let key = `a`, i = 0; i < 26; i++, key = key.nextChar()) {
        let count = dnd_item[dndindex + i];
        let outofstock = count ? count.qty === 0 : true;
        getButton(`BUTTON_QWERTY_${key}`).disabled = outofstock;
      }

    }
    return;
  }

  // school
  if (item.matches(OSCHOOL)) {
    setButton(ACTIONS, `BUTTON_EXIT`);
    if (blocking_callback === parse_class) {
      for (let key = `a`, i = 0; i < 8; i++, key = key.nextChar()) {
        setButton(KEYBOARD, `BUTTON_ALPHA_${key}`, NARROW, key, key).disabled = course[i];
      }
    }
    return;
  }

  // trading post
  if (item.matches(OTRADEPOST)) {
    if (blocking_callback === parse_tradepost) {
      setButton(ACTIONS, `BUTTON_EXIT`);
      // let numbuttons = 0;
      for (let i = 0; i < player.inventory.length; i++) {
        let obj = player.inventory[i];
        if (obj) {
          if (obj.matches(OPOTION) && !isKnownPotion(obj) || obj.matches(OSCROLL) && !isKnownScroll(obj)) continue;
          let label = getCharFromIndex(i);
          setButton(KEYBOARD, `BUTTON_TRADE_${label}`, NARROW, label, label);
          // if (++numbuttons % 9 === 0) newButtonRow(KEYBOARD);
        }
      }
    }
    if (blocking_callback === parse_sellitem) {
      setButton(ACTIONS, `BUTTON_NO`);
      newButtonRow(ACTIONS);
      setButton(ACTIONS, `BUTTON_YES`);
    }
    return;
  }

  // dealer mcdopes
  if (item.matches(OPAD)) {
    if (blocking_callback === parse_mcdopes) {
      setButton(ACTIONS, `BUTTON_EXIT`);
      for (let key = `a`, i = 0; i < 5; i++, key = key.nextChar()) {
        setButton(KEYBOARD, `BUTTON_ALPHA_${key}`, NARROW, key, key).disabled = !drug[i];
      }
    }
    return;
  }

}



//
//
// NUMBER KEY BUTTONS
//
//
function numberButtons(location) {
  for (let i = 1; i < 10; i++) {
    setButton(location, `BUTTON_NUMBER_${i}`, NARROW, i, i);
  }
  setButton(location, `BUTTON_NUMBER_0`, NARROW, 0, 0);
}

function numberKeyboard(location, label, showpercent, showfifty) {
  let num = KEYBOARD_INPUT ? KEYBOARD_INPUT : `0`;

  setButton(location, `BUTTON_NUMBER_TYPED_${num}`, VARIABLE, ENTER, `${label} ${num}`);
  setButton(location, `BUTTON_NUMBER_ALL`, VARIABLE, `*`, `${label} all`).disabled = KEYBOARD_INPUT != ``;

  if (showpercent && player.GOLD > 500) {
    setButton(location, `BUTTON_TEN_PERCENT`, VARIABLE, ENTER, `${label} 10%`).disabled = KEYBOARD_INPUT === ``;
    setButton(location, `BUTTON_TEN_PERCENT`).keyboardOverride = `${Math.ceil(player.GOLD / 10)}`;
  } else if (showfifty && player.GOLD > 50) {
    setButton(location, `BUTTON_FIFTY_GOLD`, VARIABLE, ENTER, `${label} 50`).disabled = KEYBOARD_INPUT === ``;
    setButton(location, `BUTTON_FIFTY_GOLD`).keyboardOverride = `50`;
  }

  setButton(location, `BUTTON_DEL`).disabled = KEYBOARD_INPUT === ``;
  newButtonRow(location);
  numberButtons(location);
}



//
//
// ALPHABET KEY BUTTONS
//
//
function keyboardButtons(location, uppercase, usecaps, usespace, usedel) {
  let keyboard_keys = [`qwertyuiop`, `asdfghjkl`, `zxcvbnm`];

  let addgaps = true;

  if (isPhone() && !isHorizontal()) {
    keyboard_keys = [`abcdefghijklmnopqrstuvwxyz`];
    addgaps = false;
  }

  for (let row = 0; row < keyboard_keys.length; row++) {
    let keys = keyboard_keys[row];
    for (let i = 0; i < keys.length; i++) {
      let key = keys.charAt(i);
      if (uppercase) key = key.toUpperCase();
      setButton(location, `BUTTON_QWERTY_${key}`, NARROW, key, key);
    }
    newButtonRow(location);
  }

  let abutton = uppercase ? getButton(`BUTTON_QWERTY_A`) : getButton(`BUTTON_QWERTY_a`);
  let zbutton = uppercase ? getButton(`BUTTON_QWERTY_Z`) : getButton(`BUTTON_QWERTY_z`);
  let buttonw = Number(getComputedStyle(abutton).width.split(`px`)[0]) + 20;

  if (addgaps) {
    abutton.style.marginLeft = buttonw / 2 + `px`;
    zbutton.style.marginLeft = buttonw + `px`;
  }

  if (usecaps) {
    setButton(location, `BUTTON_CAPS`, VARIABLE, CAPS, `CAPS`);
    if (addgaps) getButton(`BUTTON_CAPS`).style.marginLeft = buttonw * 1.5 + `px`;
  }
  if (usespace) {
    setButton(location, `BUTTON_SPACE_KEY`, VARIABLE, SPACE, `space`).style.paddingLeft = `50px`;
    setButton(location, `BUTTON_SPACE_KEY`, VARIABLE, SPACE, `space`).style.paddingRight = `50px`;
  }
  if (usedel) {
    setButton(location, `BUTTON_DEL`);
  }
}



//
//
// CHARACTER CREATION / WINNER BUTTONS
//
//
function startupButtons() {
  if (!isMobile()) return;

  // letters to winner
  if (blocking_callback === letter2 ||
    blocking_callback === letter3 ||
    blocking_callback === letter4 ||
    blocking_callback === letter5 ||
    blocking_callback === letter6 ||
    blocking_callback === setdiff && winnerHardlev
  ) {
    setButton(KEYBOARD, `BUTTON_CONTINUE`);
    return;
  }

  // set name
  if (keyboard_input_callback === setname) {
    let name = KEYBOARD_INPUT ? KEYBOARD_INPUT : logname;
    setButton(KEYBOARD, `BUTTON_NAME`, VARIABLE, ENTER, `Name: ${name}`);
    newButtonRow(KEYBOARD);
    keyboardButtons(KEYBOARD, UPPERCASE, true, true, true);
  }

  // set character class
  else if (blocking_callback === setclass) {
    let charclass = KEYBOARD_INPUT ? KEYBOARD_INPUT : player.char_picked;
    setButton(KEYBOARD, `BUTTON_CHAR`, VARIABLE, ENTER, `Class: ${charclass}`);
    newButtonRow(KEYBOARD);
    setButton(KEYBOARD, `BUTTON_OGRE`, VARIABLE, `a`, `Ogre`);
    setButton(KEYBOARD, `BUTTON_WIZARD`, VARIABLE, `b`, `Wizard`);
    setButton(KEYBOARD, `BUTTON_KLINGON`, VARIABLE, `c`, `Klingon`);
    setButton(KEYBOARD, `BUTTON_ELF`, VARIABLE, `d`, `Elf`);
    setButton(KEYBOARD, `BUTTON_ROGUE`, VARIABLE, `e`, `Rogue`);
    setButton(KEYBOARD, `BUTTON_ADVENTURER`, VARIABLE, `f`, `Adventurer`);
    setButton(KEYBOARD, `BUTTON_DWARF`, VARIABLE, `g`, `Dwarf`);
    setButton(KEYBOARD, `BUTTON_RAMBO`, VARIABLE, `h`, `Rambo`);
  }

  // set gender
  else if (blocking_callback === setgender) {
    let gender = KEYBOARD_INPUT ? KEYBOARD_INPUT : player.gender;
    setButton(KEYBOARD, `BUTTON_GENDER`, VARIABLE, ENTER, `Gender: ${gender}`);
    newButtonRow(KEYBOARD);
    setButton(KEYBOARD, `BUTTON_MALE`, VARIABLE, `a`, `Male`);
    setButton(KEYBOARD, `BUTTON_FEMALE`, VARIABLE, `b`, `Female`);
    setButton(KEYBOARD, `BUTTON_OTHER`, VARIABLE, `c`, `I prefer to not be defined by traditional gender norms`);
  }

  // set difficulty
  else if (keyboard_input_callback === setdiff) {
    let num = KEYBOARD_INPUT ? KEYBOARD_INPUT : getDifficulty();
    setButton(KEYBOARD, `BUTTON_NUMBER_TYPED_${num}`, VARIABLE, ENTER, `Difficulty: ${num}`);
    setButton(KEYBOARD, `BUTTON_DEL`).disabled = KEYBOARD_INPUT === ``;
    newButtonRow(KEYBOARD);
    numberButtons(KEYBOARD);
  }
}



//
//
// INVENTORY ACTION BUTTONS
//
//
function inventoryButtons() {
  let item = itemAt(player.x, player.y);

  // view inventory
  setButton(ACTIONS, `BUTTON_INVENTORY_VIEW`, VARIABLE, `i`, `inventory`);
  newButtonRow(ACTIONS);
  // cast
  setButton(ACTIONS, `BUTTON_CAST`, VARIABLE, `c`, `cast`).disabled = (player.SPELLS === 0);
  // read
  if ((isCarryingBook() || isCarryingScroll()) && (!item.matches(OBOOK) && !item.matches(OSCROLL))) {
    newButtonRow(ACTIONS);
    setButton(ACTIONS, `BUTTON_READ`, VARIABLE, `r`, `read`);
  }
  // quaff
  if (isCarryingPotion() && !item.matches(OPOTION)) {
    newButtonRow(ACTIONS);
    setButton(ACTIONS, `BUTTON_QUAFF`, VARIABLE, `q`, `quaff`);
  }
  // wield
  if (isCarryingWeapon() && !item.isWeapon()) {
    newButtonRow(ACTIONS);
    setButton(ACTIONS, `BUTTON_WIELD`, VARIABLE, `w`, `wield`);
  }
  // wear
  if (isCarryingArmor() && !item.isArmor()) {
    newButtonRow(ACTIONS);
    setButton(ACTIONS, `BUTTON_WEAR`, VARIABLE, `W`, `wear`);
  }
  // eat
  if (isCarryingCookie() & !item.matches(OCOOKIE)) {
    newButtonRow(ACTIONS);
    setButton(ACTIONS, `BUTTON_EAT`, VARIABLE, `e`, `eat`);
  }
}



function inventoryActionButtons(callback, filter) {

  if (blocking_callback === callback) {
    setButton(ACTIONS, `BUTTON_CANCEL`);

    if (callback === wear) {
      if (player.SHIELD) {
        setButton(KEYBOARD, `BUTTON_REMOVE_SHIELD`, VARIABLE, `-`, `remove shield`);
        newButtonRow(KEYBOARD);
      } else if (player.WEAR) {
        setButton(KEYBOARD, `BUTTON_REMOVE_ARMOR`, VARIABLE, `-`, `remove armor`);
        newButtonRow(KEYBOARD);
      }
    } else if (callback === wield) {
      if (player.WIELD) {
        setButton(KEYBOARD, `BUTTON_REMOVE_WEAPON`, VARIABLE, `-`, `unwield weapon`);
        newButtonRow(KEYBOARD);
      }
    }

    let inv = showinventory(false, null, filter, false, false, false);

    for (let i = 0; i < inv.length; i++) {
      let params = inv[i];
      setButton(KEYBOARD, `BUTTON_${params[0]}${params[1]}`, VARIABLE, params[0], `${params[0]}) ${params[1]}`);
      newButtonRow(KEYBOARD);
    }

    if (callback === drop_object) {
      setButton(KEYBOARD, `BUTTON_DROP_GOLD`, VARIABLE, `.`, `.) some gold`);
    }

    return true;
  }
  return false;
}



//
//
// KEYPAD BUTTONS
//
//
function movementButtons() {

  let elw = Math.min(getElementWidth(KEYPAD), getElementHeight(KEYPAD));
  let buttongap = 3;
  let buttonsize = (elw - buttongap * 3) / 3;

  setButton(KEYPAD, `BUTTON_UP_LEFT`, FIXED, `y`, `↖`, true, buttonsize, buttonsize, buttongap).disabled = !canMoveButton(player.x - 1, player.y - 1);
  setButton(KEYPAD, `BUTTON_UP`, FIXED, `k`, `↑`, true, buttonsize, buttonsize, buttongap).disabled = !canMoveButton(player.x, player.y - 1);
  setButton(KEYPAD, `BUTTON_UP_RIGHT`, FIXED, `u`, `↗`, true, buttonsize, buttonsize, buttongap).disabled = !canMoveButton(player.x + 1, player.y - 1);
  newButtonRow(KEYPAD, buttongap);
  setButton(KEYPAD, `BUTTON_LEFT`, FIXED, `h`, `←`, true, buttonsize, buttonsize, buttongap).disabled = !canMoveButton(player.x - 1, player.y);
  setButton(KEYPAD, `BUTTON_NOMOVE`, FIXED, `.`, `.`, true, buttonsize, buttonsize, buttongap);
  setButton(KEYPAD, `BUTTON_RIGHT`, FIXED, `l`, `→`, true, buttonsize, buttonsize, buttongap).disabled = !canMoveButton(player.x + 1, player.y);
  newButtonRow(KEYPAD, buttongap);
  setButton(KEYPAD, `BUTTON_DOWN_LEFT`, FIXED, `b`, `↙`, true, buttonsize, buttonsize, buttongap).disabled = !canMoveButton(player.x - 1, player.y + 1);
  setButton(KEYPAD, `BUTTON_DOWN`, FIXED, `j`, `↓`, true, buttonsize, buttonsize, buttongap).disabled = !canMoveButton(player.x, player.y + 1);
  setButton(KEYPAD, `BUTTON_DOWN_RIGHT`, FIXED, `n`, `↘`, true, buttonsize, buttonsize, buttongap).disabled = !canMoveButton(player.x + 1, player.y + 1);

  if (!BUTTON_RUN_INITIALIZED) {
    BUTTON_RUN_INITIALIZED = true;
    if (isTouch()) {
      BUTTON_RUN.removeEventListener(`touchstart`, buttonClicked);
      BUTTON_RUN.removeEventListener(`touchend`, larnmouseup);
      BUTTON_RUN.addEventListener(`touchstart`, startRun);
      BUTTON_RUN.addEventListener(`touchend`, endRun);
      BUTTON_RUN.addEventListener(`touchcancel`, endRun);
    } else {
      BUTTON_RUN.removeEventListener(`mousedown`, buttonClicked);
      BUTTON_RUN.removeEventListener(`click`, buttonClicked);
      BUTTON_RUN.addEventListener(`mouseup`, toggleRun);
    }
    endRun();
  }
  setButton(RUN, `BUTTON_RUN`, `verticalbutton`, null, BUTTON_RUN.value, false, null, buttonsize);
}

function canMoveButton(x, y) {
  if (blocking_callback === getdirectioninput) return true;
  var item = itemAt(x, y);
  return (item && (player.WTW != 0 || !item.matches(OWALL) && !item.matches(OCLOSEDDOOR)));
}

function startRun() {
  BUTTON_RUN.isRunning = true;
  BUTTON_RUN.value = `Choose Direction`;
};

function endRun() {
  BUTTON_RUN.isRunning = false;
  BUTTON_RUN.value = `Hold to Run`;
};

function toggleRun() {
  if (BUTTON_RUN.isRunning) endRun();
  else startRun();
}




//
//
// CONTEXT BUTTONS
//
//
function contextButtons() {

  let item = itemAt(player.x, player.y);
  if (!item) return;

  if (canTake(item)) {
    setButton(CONTEXT, `BUTTON_TAKE`, VARIABLE, `t`, `take`).disabled = pocketfull();
    newButtonRow(CONTEXT);
  } else if (
    item.matches(OEMPTY) ||
    item.matches(OPIT) ||
    item.matches(OIVDARTRAP) ||
    item.matches(OIVTELETRAP) ||
    item.matches(OIVTRAPDOOR) ||
    item.matches(OTRAPARROWIV)) {
    if (!pocketempty() || player.GOLD != 0) {
      setButton(CONTEXT, `BUTTON_DROP`, VARIABLE, `d`, `drop`);
      newButtonRow(CONTEXT);
    }
  } else if (item.matches(OVOLUP)) {
    setButton(CONTEXT, `BUTTON_UPVOL`, VARIABLE, `<`, `climb up`);
    newButtonRow(CONTEXT);
  } else if (item.matches(OVOLDOWN)) {
    setButton(CONTEXT, `BUTTON_DOWNVOL`, VARIABLE, `>`, `climb down`);
    newButtonRow(CONTEXT);
  } else if (item.isStore()) {
    setButton(CONTEXT, `BUTTON_ENTER_BUILDING`, VARIABLE, `E`, `go inside`);
    newButtonRow(CONTEXT);
  } else if (item.matches(OSTAIRSUP)) {
    setButton(CONTEXT, `BUTTON_UPSTAIRS`, VARIABLE, `<`, `go up`);
    newButtonRow(CONTEXT);
  } else if (item.matches(OSTAIRSDOWN)) {
    setButton(CONTEXT, `BUTTON_DOWNSTAIRS`, VARIABLE, `>`, `go down`);
    newButtonRow(CONTEXT);
  }

  if (item.matches(OBOOK) || item.matches(OSCROLL)) {
    setButton(CONTEXT, `BUTTON_READ`, VARIABLE, `r`, `read`);
    newButtonRow(CONTEXT);
  }

  if (item.matches(OPOTION)) {
    setButton(CONTEXT, `BUTTON_QUAFF`, VARIABLE, `q`, `quaff`);
    newButtonRow(CONTEXT);
  } else if (item.isArmor()) {
    setButton(CONTEXT, `BUTTON_WEAR`, VARIABLE, `W`, `wear`);
    newButtonRow(CONTEXT);
  } else if (item.isWeapon()) {
    setButton(CONTEXT, `BUTTON_WIELD`, VARIABLE, `w`, `wield`);
    newButtonRow(CONTEXT);
  } else if (item.matches(OCOOKIE)) {
    setButton(CONTEXT, `BUTTON_EAT`, VARIABLE, `e`, `eat`);
    newButtonRow(CONTEXT);
  } else if (item.matches(OBRASSLAMP)) {
    setButton(CONTEXT, `BUTTON_RUB`, VARIABLE, `R`, `rub`);
    newButtonRow(CONTEXT);
  } else if (item.isDrug()) {
    if (item.matches(OCOKE)) setButton(CONTEXT, `BUTTON_SNORT`, VARIABLE, `s`, `snort`);
    if (item.matches(OSHROOMS)) setButton(CONTEXT, `BUTTON_EAT_DRUG`, VARIABLE, `e`, `eat`);
    if (item.matches(OHASH)) setButton(CONTEXT, `BUTTON_SMOKE`, VARIABLE, `s`, `smoke`);
    if (item.matches(OACID)) setButton(CONTEXT, `BUTTON_EAT_DRUG`, VARIABLE, `e`, `eat`);
    if (item.matches(OSPEED)) setButton(CONTEXT, `BUTTON_SNORT`, VARIABLE, `s`, `snort`);
    newButtonRow(CONTEXT);
  }

  if (item.matches(OFOUNTAIN)) {
    setButton(CONTEXT, `BUTTON_FOUNTAIN_DRINK`, VARIABLE, `D`, `drink`);
    newButtonRow(CONTEXT);
    setButton(CONTEXT, `BUTTON_FOUNTAIN_TIDY`, VARIABLE, `f`, `tidy up`);
    newButtonRow(CONTEXT);
  } else if (item.matches(OTHRONE)) {
    setButton(CONTEXT, `BUTTON_THRONE_PRY`, VARIABLE, `R`, `pry gems`);
    newButtonRow(CONTEXT);
    setButton(CONTEXT, `BUTTON_THRONE_SIT`, VARIABLE, `s`, `sit down`);
    newButtonRow(CONTEXT);
  } else if (item.matches(ODEADTHRONE)) {
    setButton(CONTEXT, `BUTTON_THRONE_SIT`, VARIABLE, `s`, `sit down`);
    newButtonRow(CONTEXT);
  } else if (item.matches(OALTAR)) {
    setButton(CONTEXT, `BUTTON_ALTAR_PRAY`, VARIABLE, `p`, `donate`);
    newButtonRow(CONTEXT);
    setButton(CONTEXT, `BUTTON_ALTAR_DESECRATE`, VARIABLE, `A`, `desecrate`);
    newButtonRow(CONTEXT);
  }

  if (item.matches(OCLOSEDDOOR) || nearPlayer(OCLOSEDDOOR) || nearPlayer(OCHEST)) {
    setButton(CONTEXT, `BUTTON_OPEN`, VARIABLE, `o`, `open`);
    newButtonRow(CONTEXT);
  }

  if (item.matches(OOPENDOOR) || nearPlayer(OOPENDOOR)) {
    setButton(CONTEXT, `BUTTON_CLOSE`, VARIABLE, `C`, `close`);
    newButtonRow(CONTEXT);
  }

  if (nearPlayer(OTRAPDOOR) || nearPlayer(ODARTRAP) || nearPlayer(OTRAPARROW) || nearPlayer(OTELEPORTER) || nearPlayer(OELEVATORUP) || nearPlayer(OELEVATORDOWN)) {
    setButton(CONTEXT, `BUTTON_IDTRAPS`, VARIABLE, `^`, `identify trap`);
    newButtonRow(CONTEXT);
  }

  setButton(CONTEXT, `BUTTON_INVENTORY_FULL`, VARIABLE, `I`, `known items`);
  newButtonRow(CONTEXT);
  setButton(CONTEXT, `BUTTON_PACKWEIGHT`, VARIABLE, `g`, `pack weight`);
  newButtonRow(CONTEXT);
  if (player.LEVEL >= 10) setButton(CONTEXT, `BUTTON_TELEPORT`, VARIABLE, `Z`, `teleport`);
}



// 
//
//
// SPELL LIST BUTTONS
//
//
function spellListButtons(source, exclude) {
  setButton(ACTIONS, `BUTTON_CANCEL`);
  let larnw = (getComputedStyle(document.getElementById(`LARN`)).width.split(`px`)[0]);
  let cw = 0;
  for (let spellIndex = 0; spellIndex < source.length; spellIndex++) {
    let pass = player.knownSpells[spellIndex];
    if (exclude) pass = !pass;
    if (pass) {
      let cacheKey = `BUTTON_${spelcode[spellIndex]}`;
      // need to add the button before we can compute style
      let button = setButton(KEYBOARD, cacheKey, VARIABLE, spelcode[spellIndex], spelname[spellIndex]);
      let buttonw = Number(getComputedStyle(button).width.split(`px`)[0]) + 12;
      cw += buttonw;
      if (cw > larnw) {
        document.getElementById(KEYBOARD).removeChild(button);
        // newButtonRow(KEYBOARD);
        setButton(KEYBOARD, cacheKey);
        cw = buttonw;
      }
    }
  }
}



//
//
// BOTTOM HELP BUTTONS
//
//
function helpButtons(location) {
  let mobileDevice = isMobile();

  setButton(location, `BUTTON_SHOW_CONFIG`, VARIABLE, `⚙️`, `⚙️`);
  if (showConfigButtons) {
    if (!mobileDevice) setButton(location, `BUTTON_HELP`, VARIABLE, `?`, `Help`);
    let hintsLabel = keyboard_hints ? `on` : `off`;
    let pickupLabel = auto_pickup ? `on` : `off`;
    let inventoryLabel = side_inventory ? `on` : `off`;
    let boldLabel = bold_objects ? `on` : `off`;
    let colorLabel = show_color ? `on` : `off`;
    let retroLabel = retro_mode ? `DOS` : `modern`;
    if (amiga_mode) retroLabel = retro_mode ? `Amiga 500` : `Amiga 1200`;
    if (!mobileDevice) setButton(location, `BUTTON_HINTS`, VARIABLE, `!`, `Keyboard hints: ${hintsLabel}`);
    setButton(location, `BUTTON_PICKUP`, VARIABLE, `@`, `Auto-pickup: ${pickupLabel}`);
    if (!mobileDevice) setButton(location, `BUTTON_INVENTORY`, VARIABLE, `#`, `Inventory: ${inventoryLabel}`);
    if (!mobileDevice && !amiga_mode) setButton(location, `BUTTON_COLOR`, VARIABLE, `$`, `Color: ${colorLabel}`);
    if (!mobileDevice && !amiga_mode) setButton(location, `BUTTON_BOLD`, VARIABLE, `%`, `Bold: ${boldLabel}`);
    if (!mobileDevice) setButton(location, `BUTTON_FONT`, VARIABLE, `{`, `Font: ${retroLabel}`);
    if (mobileDevice) setButton(location, `BUTTON_SAVE`, VARIABLE, `S`, `Save`);
    if (mobileDevice) setButton(location, `BUTTON_SCORES`, VARIABLE, `z`, `Scores`);
    if (mobileDevice) setButton(location, `BUTTON_QUIT`, VARIABLE, `Q`, `Quit`);
    setButton(location, `BUTTON_BUGS`, VARIABLE, `🐞`, `Report 🐞`);
    // if (mobileDevice) setButton(location, `BUTTON_DISABLE_BUTTONS`, VARIABLE, `cmd+alt+#`, `Hide Buttons`);
  }
}
