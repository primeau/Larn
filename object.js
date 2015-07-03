"use strict";

const OWALL = new Item("OWALL", "▒", "a wall");
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
const OSTATUE = new Item("OSTATUE", "&", "a great marble statue");
const OPOTION = new Item("OPOTION", "!", "a magic potion");
const OSCROLL = new Item("OSCROLL", "?", "a magic scroll");

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

function itemAt(x, y) {
  var item = player.level.items[x][y];
  if (item.id == OPOTION.id) {
    return item;
  } else if (item.id == OSCROLL.id) {
    return item;
  }
  return null;
}

var Item = {
  id: null,
  char: "💩",
  name: null,
  arg: null,

  matches: function(item) {
    return (this.id == item.id);
  },

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
  var item = player.level.items[player.x][player.y];

  if (isItem(player.x, player.y, OEMPTY)) return;

  if (isItem(player.x, player.y, OGOLDPILE)) {
    updateLog("You have found some gold!");
    updateLog("It is worth " + item.arg + "!");
    player.GOLD += item.arg;
    forget();
  }

  if (item.matches(OPOTION)) {
    if (do_ident) {
      updateLog("You have found a magic potion");
      if (isKnownPotion(item) || DEBUG_KNOW_ALL) {
        appendLog(" of " + potionname[item.arg]);
      }
    }
    if (do_pickup) {
      updateLog("TODO: object.lookforobject(): take potion");
      //   if (take(OPOTION, j) == 0)
      //     forget();
    }
    if (do_action) {
      opotion(item);
    }
  }

  if (item.matches(OSCROLL)) {
    if (do_ident) {
      updateLog("You have found a magic scroll");
      if (isKnownScroll(item) || DEBUG_KNOW_ALL) {
        appendLog(" of " + scrollname[item.arg]);
      }
    }
    if (do_pickup) {
      updateLog("TODO: object.lookforobject(): take scroll");
      //         if (take(OSCROLL, j) == 0)
      //                 forget();
    }
    if (do_action) {
      oscroll(item);
    }
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

  if (isItem(player.x, player.y, OSTATUE)) {
    if (nearbymonst())
      return;
    if (do_ident)
      updateLog("You are standing in front of a statue");
  }

} // lookforobject


function opit() {
  if (rnd(101) < 81) {
    if (rnd(70) > 9 * player.DEXTERITY - player.packweight() || rnd(101) < 5) {
      if (player.level.depth == 10 || player.level.depth >= 13) {
        obottomless();
      } else {
        var damage;
        if (rnd(101) < 20) {
          damage = 0;
          updateLog("You fell into a pit!  Your fall is cushioned by an unknown force");
        } else {
          damage = rnd(player.level.depth * 3 + 3);
          updateLog("You fell into a pit!  You suffer " + damage + " hit points damage");
          lastnum = 261;
          /* if hero dies scoreboard will say so */
        }
        player.losehp(damage);
        nap(2000);
        newcavelevel(player.level.depth + 1);
      }
    }
  }
}

function obottomless() {
  updateLog("You fell into a bottomless pit!");
  beep();
  nap(3000);
  died(262);
}

function nearbymonst() {
  debug("TODO: nearbymonst()");
  return false;
}

function forget() {
  player.level.items[player.x][player.y] = createObject(OEMPTY);
}
