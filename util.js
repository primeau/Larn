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


function xy(x, y) {
  return `(${x},${y})`;
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
    lprc(key);
    return getinput_done();
  } else if (key == DEL) {
    appendLog(key);
    var num = KEYBOARD_INPUT + "";
    num = num.substring(0, num.length - 1);
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
      appendLog(key);
      //lprc(key);
    }
    // debug("getnumberinput(): " + KEYBOARD_INPUT);
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
