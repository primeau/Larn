'use strict';

const OVERWRITE = 0;        // place at x,y and overwrite whatever is there
const EXACT_OR_SCATTER = 1; // place at x,y if possible, otherwise scatter
const SCATTER = 2;          // place somewhere around x,y, but not at x,y

let Level = {
  items: [],
  monsters: [],
  know: [],
}; // Level
