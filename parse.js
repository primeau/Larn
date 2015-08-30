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
  if (key == 'space') key = ' ';
  if (key == 'tab') return false;
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



//const diroffx = { 0,  0, 1,  0, -1,  1, -1, 1, -1 };
//const diroffy = { 0,  1, 0, -1,  0, -1, -1, 1,  1 };
function parseDirectionKeys(key, code) {
  var dir = 0;
  if (key == 'y' || key == 'Y' || key == 'home') { // UP,LEFT
    dir = 6;
  } else if (key == 'k' || key == 'K' || key == 'up') { // NORTH
    dir = 3;
  } else if (key == 'u' || key == 'U' || key == 'pageup') { // UP,RIGHT
    dir = 5;
  } else if (key == 'h' || key == 'H' || key == 'left') { // LEFT
    dir = 4;
  } else if (key == 'l' || key == 'L' || key == 'right') { // RIGHT
    dir = 2;
  } else if (key == 'b' || key == 'B' || key == 'end') { // DOWN,LEFT
    dir = 8;
  } else if (key == 'j' || key == 'J' || key == 'down') { // DOWN
    dir = 1;
  } else if (key == 'n' || key == 'N' || key == 'pagedown') { // DOWN, RIGHT
    dir = 7;
  }
  return dir;
}
