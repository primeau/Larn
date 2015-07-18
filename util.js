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
  debug("TODO: util.beep()");
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

function getnumberinput(key) {
  if (key == ENTER) {
    if (keyboard_input_callback != null) {
      var done = keyboard_input_callback(KEYBOARD_INPUT);
      if (done == 1) {
        keyboard_input_callback = null;
        KEYBOARD_INPUT = "";
        return 1;
      } else {
        KEYBOARD_INPUT = "";
        return 0;
      }
    }
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
    }
    // debug("getnumberinput(): " + KEYBOARD_INPUT);
    return 0;
  }
}


String.prototype.nextChar = function(i) {
  var n = i | 1;
  return String.fromCharCode(this.charCodeAt(0) + n);
}


String.prototype.prevChar = function(i) {
  var n = i | 1;
  return String.fromCharCode(this.charCodeAt(0) - n);
}
