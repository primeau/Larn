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


function debug(text) {
  if (DEBUG_OUTPUT) {
    console.log("DEBUG: " + text);
    updateLog("DEBUG: " + text);
  }
}
