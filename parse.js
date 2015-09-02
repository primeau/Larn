"use strict";

const ESC = 'escape';
const ENTER = 'return';
const SPACE = 'space';
const TAB = 'tab';
const DEL = "backspace";



var blocking_callback;
var keyboard_input_callback;



function mousetrap(e, key) {
  //console.log("mousetrap: " + key);
  if (key == SPACE) key = ' ';
  if (key == TAB) return false;
  mainloop(key);
  return false; // disable default browser behaviour
}



function setCharCallback(func) {
  blocking_callback = func;
  nomove = 1;
}



function setTextCallback(func) {
  blocking_callback = getTextInput;
  keyboard_input_callback = func;
}



function setNumberCallback(func, allowAsterisk) {
  if (allowAsterisk)
    blocking_callback = getNumberOrAsterisk;
  else
    blocking_callback = getNumberInput;
  keyboard_input_callback = func;
}


function shouldRun(key) {
    var run = key.indexOf('shift+') >= 0 || key.match(/[YKUHLBJN]/);
    return run;
}


//const diroffx = { 0,  0, 1,  0, -1,  1, -1, 1, -1 };
//const diroffy = { 0,  1, 0, -1,  0, -1, -1, 1,  1 };
function parseDirectionKeys(key, code) {
  var dir = 0;
  if (key == 'y' || key == 'Y' || key.indexOf('home') >= 0) { // UP,LEFT
    dir = 6;
  } else if (key == 'k' || key == 'K' || key.indexOf('up') >= 0) { // NORTH
    dir = 3;
  } else if (key == 'u' || key == 'U' || key.indexOf('pageup') >= 0) { // UP,RIGHT
    dir = 5;
  } else if (key == 'h' || key == 'H' || key.indexOf('left') >= 0) { // LEFT
    dir = 4;
  } else if (key == 'l' || key == 'L' || key.indexOf('right') >= 0) { // RIGHT
    dir = 2;
  } else if (key == 'b' || key == 'B' || key.indexOf('end') >= 0) { // DOWN,LEFT
    dir = 8;
  } else if (key == 'j' || key == 'J' || key.indexOf('down') >= 0) { // DOWN
    dir = 1;
  } else if (key == 'n' || key == 'N' || key.indexOf('pagedown') >= 0) { // DOWN, RIGHT
    dir = 7;
  }
  return dir;
}
