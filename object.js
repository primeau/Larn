"use strict";

const OWALL = new Item("OWALL", "\u2592", "a wall");
const OEMPTY = new Item("OEMPTY", ".", "empty space");
const OSTAIRSDOWN = new Item("OSTAIRSDOWN", ">", "a staircase going down");
const OSTAIRSUP = new Item("OSTAIRSUP", "<", "a staircase going up");
const OENTRANCE = new Item("OENTRANCE", "E", "the dungeon entrance");
const OHOMEENTRANCE = new Item("OHOMEENTRANCE", ".", "exit to home level");
const OVOLUP = new Item("OVOLUP", "V", "the base of a volcanic shaft");
const OVOLDOWN = new Item("OVOLDOWN", "V", "a volcanic shaft leaning downward");
const OGOLDPILE = new Item("OGOLDPILE", "*", "some gold", 0);
const OPIT = new Item("OPIT", "P", "a pit");
const OMIRROR = new Item("MIRROR", "M", "a mirror");

// TODO Item types?
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
    player.level.items[player.x][player.y] = createObject(OEMPTY);
  }

  if (isItem(player.x, player.y, OPIT)) {
    updateLog("You're standing at the top of a pit");
    opit();
  }

  if (isItem(player.x, player.y, OMIRROR)) {
    if (nearbymonst())
      return;
    if (do_ident)
      updateLog("There is a mirror here");
  }

} // lookforobject


function opit() {
  var damage;
  if (rnd(101) < 81)
    if (rnd(70) > 9 * player.DEXTERITY - player.packweight() || rnd(101) < 5)
      if (player.level.depth == 10) {
        obottomless();
      } else if (player.level.depth == 13) {
    obottomless();
  } else {
    if (rnd(101) < 20) {
      damage = 0;
      updateLog("You fell into a pit!  Your fall is cushioned by an unknown force");
    } else {
      damage = rnd(player.level.depth * 3 + 3);
      updateLog("You fell into a pit!  You suffer " + damage + " hit points damage");
      lastnum = 261;
      /* if he dies scoreboard will say so */
    }
    player.losehp(damage);
    nap(2000);
    newcavelevel(player.level.depth + 1);
  }
}

function obottomless() {
  updateLog("You fell into a bottomless pit!");
  beep();
  nap(3000);
  died(262);
}

function nearbymonst() {
  debug("TODO: NEARBYMONST");
  return false;
}
