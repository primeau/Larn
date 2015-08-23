"use strict";

const ESC = 27;
const ENTER = 13;
const SPACE = 32;
const DEL_CODE = 8;
const TAB = 9;
const DEL = "___DELETE___";

var blocking_callback;
var non_blocking_callback;
var keyboard_input_callback;


function parseEvent(e, keyDown, keyUp) {
  var code = e.which;
  //console.log(`parseEvent(): got: ${code}: ${keyDown} ${keyUp} ${e.key}`);
  if (keyDown) { // to capture ESC key etc
    if (code == ESC || code == TAB || code == ENTER || code == DEL_CODE || code == SPACE || code >= 37 && code <= 40) {
      e.preventDefault(); // prevent scrolling on page
      mainloop(e);
    } else {
    //  console.log("parseEvent.keydown(): ignoring: " + code);
    }
  } else if (keyUp) {
    //console.log("parseEvent.keyup(): ignoring: " + code);
  } else {
    if (code < 37 || code > 40) {
      mainloop(e);
    } else {
      //console.log("parseEvent.keypress(): ignoring: " + code);
    }
  }
}



function setCharCallback(func, blocking) {
  if (blocking) {
    blocking_callback = func;
  } else {
    non_blocking_callback = func;
  }
  nomove = 1;
}



function setTextCallback(func) {
  blocking_callback = gettextinput;
  keyboard_input_callback = func;
}



function setNumberCallback(func, allowAsterisk) {
  if (allowAsterisk)
    blocking_callback = getnumberinput;
  else
    blocking_callback = getonlynumberinput;
  keyboard_input_callback = func;
}



//const diroffx = { 0,  0, 1,  0, -1,  1, -1, 1, -1 };
//const diroffy = { 0,  1, 0, -1,  0, -1, -1, 1,  1 };

function parseDirectionKeys(key, code) {
  var dir = 0;
  if (key == 'y' || key == 'Y' || code == 55) { // UP,LEFT
    dir = 6;
  } else if (key == 'k' || key == 'K' || code == 56 || code == 38) { // NORTH
    dir = 3;
  } else if (key == 'u' || key == 'U' || code == 57) { // UP,RIGHT
    dir = 5;
  } else if (key == 'h' || key == 'H' || code == 52 || code == 37) { // LEFT
    dir = 4;
  } else if (key == 'l' || key == 'L' || code == 54 || code == 39) { // RIGHT
    dir = 2;
  } else if (key == 'b' || key == 'B' || code == 49) { // DOWN,LEFT
    dir = 8;
  } else if (key == 'j' || key == 'J' || code == 50 || code == 40) { // DOWN
    dir = 1;
  } else if (key == 'n' || key == 'N' || code == 51) { // DOWN, RIGHT
    dir = 7;
  }
  return dir;

}
