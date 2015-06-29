"use strict";


function rnd(value) {
  return Math.floor(Math.random() * value);
};




  function debug(text) {

    if (DEBUG_OUTPUT) {
      console.log("DEBUG: " + text);
      updateLog("DEBUG: " + text);
    }

  }
