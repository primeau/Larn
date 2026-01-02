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



function initGrid(width, height, defaultValue) {
  let grid = new Array(width);
  for (let x = 0; x < width; x++) {
    grid[x] = new Array(height);
    for (let y = 0; y < height; y++) {
      grid[x][y] = defaultValue;
    }
  }
  return grid;
}



const ROLLBAR_ERROR = `ERROR`;
const ROLLBAR_INFO = `INFO`;
const ROLLBAR_DEBUG = `DEBUG`;
const ROLLBAR_WARN = `WARN`;
let ROLLBAR_COUNT = 0;
function doRollbar(notificationLevel, eventTitle, eventDetail) {
  try {
    eventTitle = `${BUILD} ${GAMENAME} ${eventTitle}`;
    if (ROLLBAR_COUNT++ < 50 && Rollbar) {
      if (notificationLevel === ROLLBAR_ERROR) {
        Rollbar.error(eventTitle, { detail: `${eventDetail}` });
      } else if (notificationLevel === ROLLBAR_INFO) {
        Rollbar.info(eventTitle, { detail: `${eventDetail}` });
      } else if (notificationLevel === ROLLBAR_DEBUG) {
        Rollbar.debug(eventTitle, { detail: `${eventDetail}` });
      } else if (notificationLevel === ROLLBAR_WARN) {
        Rollbar.warning(eventTitle, { detail: `${eventDetail}` });
      }
      if (ROLLBAR_COUNT === 50) {
        console.error(`Rollbar event limit reached`);
        Rollbar.debug(`Rollbar event limit reached`, { detail: `${eventDetail}` });
      }
    }
  } catch (error) {
    console.error(`doRollbar caught: ${error}`);
  }
  finally {
    console.log(`ROLLBAR_${notificationLevel}: ${eventTitle}, ${eventDetail}`)
  }
}



function debug(...args) {
  if (DEBUG_OUTPUT) {
    console.log(`DEBUG:`, ...args);
    //updateLog(`DEBUG: ${text}`);
  }
}



var KEYBOARD_INPUT = ``;
let MAX_INPUT_LENGTH = 24;



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



function setMaxInputLength(len) {
  MAX_INPUT_LENGTH = Math.max(1, len);
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
    if (KEYBOARD_INPUT.length < MAX_INPUT_LENGTH) {
      KEYBOARD_INPUT += key;
      echo(key);
    }
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



Storage.prototype.setObject = function (key, value) {
  value = JSON.stringify(value);

  /* compress if it's big */
  if (value.length > 5000) {
    /* store a record that the data is compressed */
    this.setItem(key, COMPRESSED_DATA);
    /* create a new key that will store the compressed data */
    key = key + COMPRESSED_DATA;
    /* try to do the compression in a worker outside of the main thread */
    // WORKER STEP 1 - localStorageCompressionWorker
    if (localStorageCompressionWorker) {
      localStorageCompressionWorker.postMessage([key, value, `UTF16`, `localstorage`]);
    } else {
      // no compression worker
      value = LZString.compressToUTF16(value);
      this.setItem(key, value);
    }
  }
  else {
    // not compressed
    this.setItem(key, value);
  }
}

// WORKER STEP 3 - localStorageCompressionWorker
function localStorageCompressionCallback(event) {
  let key = event.data[0];
  let value = event.data[1];
  localStorage.setItem(key, value);
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





var images = null; // used for 'amiga_mode'



function loadImages(location) {
  if (!location) location = `img/`;
  images = [];

  console.log(`loading images`);

  var img;
  img = `${location}player.png`;
  images[img] = createImage(img);
  for (let objectIndex = 0; objectIndex <= 100; objectIndex++) {
    img = `${location}o${objectIndex}.png`;
    images[img] = createImage(img);
  }
  for (let monsterIndex = 0; monsterIndex <= 65; monsterIndex++) {
    img = `${location}m${monsterIndex}.png`;
    images[img] = createImage(img);
  }
  for (let wallIndex = 0; wallIndex <= 30; wallIndex += 2) {
    img = `${location}w${wallIndex}.png`;
    images[img] = createImage(img);
  }
}



function createImage(src) {
  // console.log(`loading: ` + src);
  var image = new Image();
  image.onload = function () {
    // console.log(`loaded: ` + src);
  }
  image.src = src;
  return image;
}



async function loadFonts() {
  // make sure fonts are loaded before rendering anything
  // if we don't wait for this, the main screen will end up
  // being a different font
  await document.fonts.load(`12px dos437`);
  await document.fonts.load(`12px modern`);
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
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement(`canvas`));
  const context = canvas.getContext(`2d`);
  context.font = bold ? font : `bold ` + font;
  const metrics = context.measureText(text);
  return metrics.width;
}



function computeFontSize(fontFamily, spriteWidth, spacing) {
  let fontSize = spriteWidth;
  let font = `${fontSize}px ${fontFamily}`;

  do {
    fontSize += 0.1;
    font = `${fontSize}px ${fontFamily}`;
  }
  while (getTextWidth(`X`, font, false) + spacing < spriteWidth);

  fontSize *= 10; // for some cleaner numbers
  fontSize = Math.floor(fontSize);
  fontSize /= 10;

  // console.log(`spritew`, spriteWidth, `fontsize`, fontSize);
  // updateLog(`spritew` + ": " + spriteWidth + " " + `fontsize` + ": " + fontSize);
  return fontSize;
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



function updateMessage(message) {
  if (!document) return;
  let el = document.getElementById(`LARN_LIST`);
  if (el) el.innerHTML = message;
}



function isTouch() {
  return ('ontouchstart' in window || navigator.maxTouchPoints) != 0;
}

var mobileString = ``;
function isMobile() {
  // if (forceMobileDisabled) return false;

  // user agent method
  // this doesn't detect iPads on firefox and safari
  let uaMobile = /Android|iPhone|iPad|webOS|Mobi|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // touchpoints method
  // also catches touchscreen laptops - do not use
  // (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) 

  // window orientation method
  // deprecated, but detects iPads on safari and firefox
  let orMobile = window.orientation !== undefined;

  // media query method
  // doesn't detect ipad in chrome/firefox/safari, but maybe works for other things?
  let mqMobile = false;
  try {
    if (document.getElementsByTagName('body')[0]) {
      mqMobile = window.getComputedStyle(document.getElementsByTagName('body')[0]).getPropertyValue('content').indexOf('mobile') !== -1;
    }
  } catch (error) {
  }

  // not supported in firefox yet!
  // navigator.userAgentData.mobile 

  mobileString = `ua:${uaMobile} or:${orMobile} mq:${mqMobile}`;

  return uaMobile || orMobile || mqMobile;
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
  // window.screen flips in the emulator, but not on device, so i don't know what to trust for non-apple devices
  // reference: https://www.ios-resolution.com/
  // heuristic: ipads are all 768x1024 or higher, phones are all 428x926 or lower
  return isMobile() && window.screen.height < 1024 && window.screen.width < 1024;
}

function isTablet() {
  return isMobile() && !isPhone();
}

function isLocal() {
  // it's ok to not consider the '' case as local because isFile() will
  // handle it where we need it (mostly enabling rollbar), and isLocal() 
  // is used to decide when to enable debug mode, which i don't want 
  // people seeing when they use larn_local.html from a file

  return location.hostname === 'localhost'; 
  // return location.hostname === 'localhost' || location.hostname === ''; 
}

function isFile() {
  return location.protocol === 'file:';
}

// needed because gotw games start with LEVELS[i] being fully explored but hidden
function isLevelVisited(lev) {
  if (EXPLORED_LEVELS[lev]) return true;
  if (!LEVELS[lev] || !LEVELS[lev].know) return false;
  for (let y = 0; y < MAXY; y++) {
    for (let x = 0; x < MAXX; x++) {
      if (LEVELS[lev].know[x][y] && LEVELS[lev].know[x][y] !== KNOWNOT) {
        EXPLORED_LEVELS[lev] = true;
        return true;
      }
    }
  }
  return false;
}

// duplicated from cf_tools.mjs
function getISOWeekDate(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d;
}

// duplicated from cf_tools.mjs
function getISOYear(date) {
  return getISOWeekDate(date).getUTCFullYear();
}

// duplicated from cf_tools.mjs
function getISOWeek(date) {
  const d = getISOWeekDate(date);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}