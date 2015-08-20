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



function echo(key) {
  if (IN_STORE) {
    lprc(key);
  } else {
    appendLog(key);
  }
}



function gettextinput(key) {
  var match = function(key) {
    return isalpha(key) || isnum(key);
  }
  return getinput(key, match);
}



function getonlynumberinput(key) {
  var match = function(key) {
    return isalpha(key) || isnum(key);
  }
  return getinput(key, match);
}



function getnumberinput(key) {
  var match = function(key) {
    return isnum(key);
  }
  var extra = function(key) {
    if (key == '*') {
      KEYBOARD_INPUT = key;
      echo(key);
      return getinput_done();
    }
    else {
        return 0;
    }
  }
  return getinput(key, match, extra);
}



function getinput(key, match, extra) {
  if (key == ENTER) {
    return getinput_done();
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



function isnum(str) {
  str = String(str);
  return str.match(/^[0-9]+$/);
}



Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}



Storage.prototype.getObject = function(key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
}
