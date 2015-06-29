"use strict";

const OSTAIRSDOWN   = new Item(">", "a staircase going down");
const OSTAIRSUP     = new Item("<", "a staircase going up");
const OENTRANCE     = new Item("E", "the dungeon entrance");
const OHOMEENTRANCE = new Item("#", "exit to home level");
const OWALL         = new Item("\u2592", "a wall");
const OEMPTY        = new Item(".", "empty space");

function Item(char, name) {
    this.char = char;
    this.name = name;
}

function createObject(item) {
  var newItem = Object.create(Item);
  newItem.char = item.char;
  newItem.name = item.name;
  return newItem;
}

var Item = {
  char: "💩",
  name: "UNDEF",
}
