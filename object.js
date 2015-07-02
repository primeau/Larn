"use strict";

const OWALL         = new Item("OWALL",    "\u2592", "a wall"                               );
const OEMPTY        = new Item("OEMPTY",        ".", "empty space"                          );
const OSTAIRSDOWN   = new Item("OSTAIRSDOWN",   ">", "a staircase going down"               );
const OSTAIRSUP     = new Item("OSTAIRSUP",     "<", "a staircase going up"                 );
const OENTRANCE     = new Item("OENTRANCE",     "E", "the dungeon entrance"                 );
const OHOMEENTRANCE = new Item("OHOMEENTRANCE", ".", "exit to home level"                   );
const OVOLUP        = new Item("OVOLUP",        "V", "the base of a volcanic shaft"         );
const OVOLDOWN      = new Item("OVOLDOWN",      "V", "a volcanic shaft leaning downward"    );
const OGOLDPILE     = new Item("OGOLDPILE",     "*", "some gold",                           0);

// types?
// characters (player, monster) 1 per square
// items (scrolls potions gold) 1 per square
// fundamental (doors, walls) no charaters/items

function Item(id, char, name, arg) {
    this.id = id;
    this.char = char;
    this.name = name;
    this.arg = arg;
}

function createObject(item) {
  var newItem = Object.create(Item);
  newItem.id = item.id;
  newItem.char = item.char;
  newItem.name = item.name;
  newItem.arg = item.arg;
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
  arg: null,
}


function lookforobject(do_ident, do_pickup, do_action) {
    // do_ident;   /* identify item: T/F */
    // do_pickup;  /* pickup item:   T/F */
    // do_action;  /* prompt for actions on object: T/F */

//
//     // /* can't find objects if time is stopped    */
//     // if (c[TIMESTOP])
//     //     return;
//
     var i = player.level.items[player.x][player.y];

     if (isItem(player.x, player.y, OEMPTY)) return;

     if (isItem(player.x, player.y, OGOLDPILE)) {
       updateLog("You have found some gold!");
       updateLog("It is worth " + i.arg + "!");
       player.GOLD += i.arg;
       i = null;
     }
//
//     i = item[playerx][playery];
//     if (i == 0)
//         return;
//     j = iarg[playerx][playery];
//     showcell(playerx, playery);
//     cursors();
//     yrepcount = 0;
//     switch (i)
//     {
//     case OGOLDPILE:
//     case OMAXGOLD:
//     case OKGOLD:
//     case ODGOLD:
//         lprcat("\n\nYou have found some gold!");
//         ogold(i);
//         break;
}
