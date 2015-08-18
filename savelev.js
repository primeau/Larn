"use strict";

function getlevel(depth) {
  player.level = LEVELS[depth];
  // TODO this is where we could assign global item/monster/know arrays
}

function savelevel() {
  // TODO
}




function loadPlayer(saved) {
  player.x = saved.x;
  player.y = saved.y;
  debug("player depth: " + saved.level.depth);
  for (var i = 0; i < 26 ; i++) {
  //  player.inventory[i] = saved.inventory[i] ? createObject(saved.inventory[i]) : null;
  }
  return saved.level.depth; // HACK
}
