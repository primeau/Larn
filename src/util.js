'use strict';

/*
 * generate random numbers 1<=rnd(N)<=N
 */
function rnd(value) {
  return Math.floor(Math.random() * value + 1);
}



/*
 * generate random numbers 0<=rund(N)<=N-1
 */
function rund(value) {
  return Math.floor(Math.random() * value);
}



/*
 *  vxy(x,y)       Routine to verify/fix coordinates for being within bounds
 *      int *x,*y;
 *
 *  Function to verify x & y are within the bounds for a level
 *  If *x or *y is not within the absolute bounds for a level, fix them so that
 *    they are on the level.
 */
function vxy(x, y) {
  x = vx(x);
  y = vy(y);
  return [x, y];
}

function vx(x) {
  x = Math.max(0, x);
  x = Math.min(MAXX - 1, x);
  return x;
}

function vy(y) {
  y = Math.max(0, y);
  y = Math.min(MAXY - 1, y);
  return y;
}



function beep() {
  // TODO
}



function initGrid(width, height) {
  var grid = new Array(width);
  for (var x = 0; x < width; x++) {
    grid[x] = new Array(height);
    grid[x] = new Array(height);
  }
  return grid;
}



function debug(text) {
  if (DEBUG_OUTPUT) {
    console.log(`DEBUG: ${text}`);
    //updateLog(`DEBUG: ${text}`);
  }
}



var KEYBOARD_INPUT = ``;



function prepare_direction_event(direction_event) {
  setCharCallback(getdirectioninput);
  keyboard_input_callback = direction_event;
  updateLog(`  In what direction? `);
}




function getdirectioninput(key, code) {
  //debug(`getdirectioninput: ${key} ${code}`);
  if (key == ESC) {
    appendLog(` cancelled${period}`);
    nomove = 1;
    keyboard_input_callback = null;
    return 1;
  }
  var direction = parseDirectionKeys(key, code);
  if (direction == 0) {
    return 0;
  }
  //debug(`getdirectioninput: ${direction}`);
  if (keyboard_input_callback) {
    //debug(`getdirectioninput: ${keyboard_input_callback.name}`);
    keyboard_input_callback(direction);
  }
  keyboard_input_callback = null;
  return 1;
}



function echo(key) {
  if (!mazeMode) {
    lprc(key);
  } else {
    appendLog(key);
  }
}



function getTextInput(key) {
  var match = function (key) {
    //return isalpha(key) || isnum(key);
    return isextra(key);
  }
  return getInput(key, match);
}



function getNumberInput(key) {
  var match = function (key) {
    //return isalpha(key) || isnum(key);
    return isnum(key);
  }
  return getInput(key, match);
}



function getNumberOrAsterisk(key) {
  var match = function (key) {
    return isnum(key);
  }
  var extra = function (key) {
    if (key == '*' && KEYBOARD_INPUT.length == 0) { // only if it's the first char
      KEYBOARD_INPUT = key;
      echo(key);
      return getInput_done();
    } else {
      return 0;
    }
  }
  return getInput(key, match, extra);
}



function getInput(key, match, extra) {
  if (key == ESC) {
    KEYBOARD_INPUT = key;
    return getInput_done();
  }
  if (key == ENTER) {
    return getInput_done();
  }
  if (key == DEL) {
    if (KEYBOARD_INPUT.length > 0) {
      KEYBOARD_INPUT = KEYBOARD_INPUT.slice(0, -1);
      echo(`\b`);
    }
    return 0;
  }
  if (match(key)) {
    KEYBOARD_INPUT += key;
    echo(key);
    return 0;
  }
  if (extra) {
    return extra(key);
  }
}



function getInput_done() {
  var done = 0;
  if (keyboard_input_callback) {
    done = keyboard_input_callback(KEYBOARD_INPUT);
    if (done == 1) {
      keyboard_input_callback = null;
    }
  }
  KEYBOARD_INPUT = ``;
  return done;
}



var BLINKENCURSOR;
var BLINKEN = true;
const BLINKENCHAR = `_`;

function blinken(x, y) {

  if (isMobile()) return;

  clearBlinkingCursor();
  BLINKENCURSOR = setInterval(
    function () {
      var xpos = x + KEYBOARD_INPUT.length;
      cursor(xpos, y);
      lprc(BLINKEN ? ` ` : BLINKENCHAR);
      cltoeoln();
      cursor(xpos, y);
      BLINKEN = !BLINKEN;
      paint();
    }, 250
  );
}


function clearBlinkingCursor() {
  clearInterval(BLINKENCURSOR);
  BLINKEN = true;  // prevent blinking cursor from creating tons of duplicate frames
}


String.prototype.nextChar = function (i) {
  var n = (i == null) ? 1 : i;
  return String.fromCharCode(this.charCodeAt(0) + n);
}



String.prototype.prevChar = function (i) {
  var n = (i == null) ? 1 : i;
  return String.fromCharCode(this.charCodeAt(0) - n);
}



function getCharFromIndex(i) {
  return 'a'.nextChar(i);
}



function getIndexFromChar(char) {
  if (char == ESC) {
    return -1;
  }
  if (!isalpha(char)) {
    return -1;
  }
  var acode = `a`.charCodeAt(0);
  var dropcode = char.charCodeAt(0);
  var dropIndex = dropcode - acode;
  return dropIndex;
}



function elapsedtime() {
  return Math.floor(gtime / 100);
}



function timeleft() {
  return Math.floor((TIMELIMIT - gtime) / 100);
}



function isalpha(str) {
  str = String(str);
  return str.length == 1 && str.match(/^[A-Za-z]+$/);

  // //TODO this doesn't account for many other special keys (left, right, etc)
  // var isSpecialChar = false;
  // isSpecialChar |= (str === ESC);
  // isSpecialChar |= (str === ENTER);
  // isSpecialChar |= (str === SPACE);
  // isSpecialChar |= (str === TAB);
  // isSpecialChar |= (str === DEL);
  // return !isSpecialChar && str.match(/^[A-Za-z]+$/);

}



function isextra(str) {
  str = String(str);
  return str.length == 1; // allow anything?
}



function isnum(str) {
  str = String(str);
  return str.length == 1 && str.match(/^[0-9]+$/);
}



function pad(str, width, bold) {
  return padString(`` + str, width, bold);
}



const HIGHLIGHT_DELAY = 700; // left align with -width, otherwise right align
function padString(str, width, lastHighlightTime) {
  if (!str) return Array(Math.abs(width)).join(` `);
  if (!width || width == 0) return str;
  var now = millis();
  var numspaces = Math.max(0, Math.abs(width) + 1 - str.length);
  var spaces = Array(numspaces).join(` `);
  var shouldHighlight = ((now - lastHighlightTime) < HIGHLIGHT_DELAY);
  var highlightStart = shouldHighlight ? START_MARK : ``;
  var highlightEnd = shouldHighlight ? END_MARK : ``;

  if (width < 0) {
    return `${highlightStart}${str}${highlightEnd}${spaces}`;
  } else {
    return `${spaces}${highlightStart}${str}${highlightEnd}`;
  }
}



function millis() {
  return Date.now();
}



function compareArrays(a1, a2) {
  if (!a1 && !a2) return true;
  return a1 && a2 && a1.length == a2.length && a1.every((v, i) => v === a2[i]);
}


const COMPRESSED_DATA = `_COMPRESSED`;


/* compressionWorker callback to compress large files to be written to localstorage */
function onCompressed(event) {
  let key = event.data[0];
  let value = event.data[1];
  debug(`onCompressed: compression end size: ${key} ${value.length}`);
  localStorage.setItem(key, value);
}


Storage.prototype.setObject = function (key, value) {
  value = JSON.stringify(value);

  let usedWorker = false;

  /* compress if it's big */
  if (value.length > 25000) {
    /* store a record that the data is compressed */
    this.setItem(key, COMPRESSED_DATA);
    /* create a new key that will store the compressed data */
    key = key + COMPRESSED_DATA;
    debug(`setObject: compression start size: ${value.length}`);
    /* try to do the compression in a worker outside of the main thread */
    if (compressionWorker) {
      usedWorker = true;
      /* send the data to the worker (which will call back via onCompressed()) */
      compressionWorker.postMessage([key, value]);
    } else {
      value = LZString.compressToUTF16(value);
      debug(`setObject: compression end size: ${value.length}`);
    }
  }

  /* if the web worker couldn't be found, then write the data from here */
  if (!usedWorker) {
    this.setItem(key, value);
  }
}

function localStorageSetObject(key, value) {
  if (ULARN) key += `_ularn`;
  try {
    // console.log(`setObject: ${key} ${value}`);
    localStorage.setObject(key, value);
  } catch (err) {
    console.log(`setObject: ${err}`);
    return err;
  }
}



Storage.prototype.getObject = function (key) {
  var value = this.getItem(key);
  /* decompress if it's big */
  if (value === COMPRESSED_DATA) {
    value = this.getItem(key + COMPRESSED_DATA);
    if (value) {
      console.log('getObject: start size', value.length);
      value = LZString.decompressFromUTF16(value);
      console.log('getObject: end size', value.length);
    }
  }
  return value && JSON.parse(value);
}

function localStorageGetObject(key, failValue) {
  if (ULARN) key += `_ularn`;
  try {
    // console.log(`getObject: ${key}`);
    var retrievedObject = localStorage.getObject(key);
    if (retrievedObject === false) return false;
    return retrievedObject || failValue;
  } catch (err) {
    console.log(`getObject: "${key}" ${err}`);
    return failValue;
  }
}



function localStorageRemoveItem(key) {
  if (ULARN) key += `_ularn`;
  try {
    console.log(`removeItem: ${key}`);
    localStorage.removeItem(key);
    localStorage.removeItem(key + COMPRESSED_DATA);
  } catch (err) {
    console.log(`removeItem: ${err}`);
  }
}



function loadURLParameters() {
  // internet explorer doesn't support "URLSearchParams" yet
  let urlParams = {};
  location.search.substr(1).split("&").forEach(function (item) {
    urlParams[item.split("=")[0]] = item.split("=")[1]
  });
  console.log(`url parameters`, urlParams);
  return urlParams;
}



/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 * 
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 * 
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
function getTextWidth(text, font, bold) {
  var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  var context = canvas.getContext(`2d`);
  if (bold) font = `bold ` + font;
  context.font = font;
  var metrics = context.measureText(text);
  return metrics.width;
}



function getElementWidth(el) {
  if (!el) return 0;
  // return (getComputedStyle(document.getElementById(el)).width.split(`px`)[0]);
  return document.getElementById(el).getBoundingClientRect().width;
}

function getElementHeight(el) {
  if (!el) return 0;
  return (getComputedStyle(document.getElementById(el)).height.split(`px`)[0]);
}



function isTouch() {
  return ('ontouchstart' in window || navigator.maxTouchPoints) != 0;
}

function isMobile() {
  return isTouch();
}

function isDesktop() {
  return !isMobile();
}

function isHorizontal() {
  return window.innerWidth >= window.innerHeight;
}

function isVertical() {
  return !isHorizontal();
}

function isPhone() {

  // this has proven to be unreliable -- my ipad get recognized as a phone when using innerwidth
  // and window.screen flips in the emulator, but not on device, so i don't know what to trust for non-apple devices
  // reference: https://www.ios-resolution.com/
  // heuristic: ipads are all 768x1024 or higher, phones are all 428x926 or lower
  // isVertical() && window.screen.width < 768 ||  (ipad w768 x h1024); 
  // isHorizontal() && window.screen.height < 768) (ipad w768 x h1024); 
  // isVertical() && window.innerWidth < 768 ||    (ipad w768 x h908, iphone )
  // isHorizontal() && window.innerHeight < 768)   (ipad w1024x h752);


  /* real world number for an old ipad, an ihpone 13 pro max
  IPAD
  horizontal screen 768x1024
  vertical screen 768x1024
  horizontal inner 1024x653
  vertical inner 768x909

  IPAD
  horizontal screen  428 926 
  vertical screen 428 926
  horizontal inner 832 368
  vertical inner 435 759

  */

  // // this is only going to recognize iphones...
  // return isMobile() && navigator.userAgent.toLowerCase().includes(`phone`);

  return isMobile() && window.screen.height < 1024;


}

function isTablet() {
  return isMobile() && !isPhone();
}