"use strict";

const OWALL         = new Item("OWALL",    "\u2592", "a wall");
const OEMPTY        = new Item("OEMPTY",        ".", "empty space");
const OSTAIRSDOWN   = new Item("OSTAIRSDOWN",   ">", "a staircase going down");
const OSTAIRSUP     = new Item("OSTAIRSUP",     "<", "a staircase going up");
const OENTRANCE     = new Item("OENTRANCE",     "E", "the dungeon entrance");
const OHOMEENTRANCE = new Item("OHOMEENTRANCE", ".", "exit to home level");
const OVOLUP        = new Item("OVOLUP",        "V", "the base of a volcanic shaft");
const OVOLDOWN      = new Item("OVOLDOWN",      "V", "a volcanic shaft leaning downward");

function Item(id, char, name) {
    this.id = id;
    this.char = char;
    this.name = name;
}

function createObject(item) {
  var newItem = Object.create(Item);
  newItem.id = item.id;
  newItem.char = item.char;
  newItem.name = item.name;
  return newItem;
}

function isItem(x, y, compareItem) {
  var levelItem = player.level.items[x][y];
  if (levelItem.id == compareItem.id) {
    return true;
  } else {
    return false;
  }
}


var Item = {
  id: null,
  char: "💩",
  name: null,
}
