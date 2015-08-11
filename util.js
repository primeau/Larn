"use strict";

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



function beep() {
  //debug("TODO: util.beep()");
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


var KEYBOARD_INPUT = "";



function prepare_direction_event(direction_event) {
  setCharCallback(getdirectioninput, true);
  keyboard_input_callback = direction_event;
  updateLog("  In what direction? ");
}




function getdirectioninput(key, code) {
  //debug(`getdirectioninput: ${key} ${code}`);
  if (key == ESC) {
    // TODO anything else?
    appendLog(" cancelled");
    keyboard_input_callback = null;
    return 1;
  }
  var direction = parseDirectionKeys(key, code);
  if (direction == 0) {
    return 0;
  }
  //debug(`getdirectioninput: ${direction}`);
  if (keyboard_input_callback != null) {
    //debug(`getdirectioninput: ${keyboard_input_callback.name}`);
    keyboard_input_callback(direction);
  }
  keyboard_input_callback = null;
  return 1;
}



function getnumberinput(key) {
  if (key == ENTER) {
    return getinput_done();
  } else if (key == '*') {
    KEYBOARD_INPUT = key;
    if (IN_STORE)
      lprc(key);
    else
      appendLog(key);
    return getinput_done();
  } else if (key == DEL) {
    var num = KEYBOARD_INPUT + "";
    num = num.substring(0, num.length - 1);
    //debug(num.length);
    if (num.length > 0) {
      if (IN_STORE) {
        lprc(`\b`);
      } else
        appendLog(`\b`);
    }
    KEYBOARD_INPUT = Number(num);
    //debug("getnumberinput(): " + KEYBOARD_INPUT);
    return 0;
  } else if (key >= '0' && key <= '9') {
    var original_number = KEYBOARD_INPUT;
    var new_string = KEYBOARD_INPUT + key;
    KEYBOARD_INPUT = Number(new_string);
    if (new_string != KEYBOARD_INPUT.toString()) { // prevent NaN etc
      KEYBOARD_INPUT = original_number;
    } else {
      if (IN_STORE)
        lprc(key);
      else
        appendLog(key);
    }
    //debug("getnumberinput(): " + KEYBOARD_INPUT);
    return 0;
  }
}

function getinput_done() {
  var done = 0;
  if (keyboard_input_callback != null) {
    done = keyboard_input_callback(KEYBOARD_INPUT);
    if (done == 1) {
      keyboard_input_callback = null;
    }
  }
  KEYBOARD_INPUT = "";
  return done;
}


String.prototype.nextChar = function(i) {
  var n = (i == null) ? 1 : i;
  return String.fromCharCode(this.charCodeAt(0) + n);
}


String.prototype.prevChar = function(i) {
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
  var acode = "a".charCodeAt(0);
  var dropcode = char.charCodeAt(0);
  var dropIndex = dropcode - acode;
  return dropIndex;
}



function elapsedtime() {
  return Math.round(gtime / 100);
}



function timeleft() {
  return Math.round((TIMELIMIT - gtime) / 100);
}



function isalpha(str) {
    str = String(str);
    return str.match(/^[A-Za-z]+$/);
}
