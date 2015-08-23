"use strict";

var DEBUG_STATS = false;
var DEBUG_OUTPUT = false;
var DEBUG_STAIRS_EVERYWHERE = false;
var DEBUG_KNOW_ALL = false;
var DEBUG_IMMORTAL = false;
var DEBUG_PAINT = 0;
var DEBUG_LPRCAT = 0;
var DEBUG_LPRC = 0;
var DEBUG_PROXIMITY = false;


var Larn = {
  run: function() {
    document.onkeypress = this.keyPress;
    document.onkeydown = this.keyDown;
    //document.onkeyup = this.keyUp;
    welcome();
  },

  // http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
  keyPress: function(e) {
    e = e || window.event;
    parseEvent(e, false, false);
  }, // KEYPRESS

  keyDown: function(e) {
    e = e || window.event;
    parseEvent(e, true, false);
  }, // KEYDOWN

  keyUp: function(e) {
    e = e || window.event;
    parseEvent(e, false, true);
  }, // KEYUP

}; // LARN OBJECT



function parseDebug(key) {
  //
  // DEBUGGING SHORTCUTS
  //
  if (/*key == '0' || */ key == '`') {
    DEBUG_STATS = !DEBUG_STATS;
    nomove = 1;
    updateLog("DEBUG_STATS: " + DEBUG_STATS);
  }
  if (key == '0' || key == '1') {
    DEBUG_OUTPUT = !DEBUG_OUTPUT;
    nomove = 1;
    updateLog("DEBUG_OUTPUT: " + DEBUG_OUTPUT);
  }
  if (key == '0' || key == '2') {
    nomove = 1;
    player.WTW = player.WTW == 0 ? 100000 : 0;
    updateLog("DEBUG_WALK_THROUGH_WALLS: " + (player.WTW > 0));
  }
  if (key == '0' || key == '3') {
    nomove = 1;
    DEBUG_STAIRS_EVERYWHERE = !DEBUG_STAIRS_EVERYWHERE;
    updateLog("DEBUG_STAIRS_EVERYWHERE: " + DEBUG_STAIRS_EVERYWHERE);
  }
  if (key == '0' || key == '4') {
    nomove = 1;
    DEBUG_KNOW_ALL = !DEBUG_KNOW_ALL;
    wizard = DEBUG_KNOW_ALL;
    if (DEBUG_KNOW_ALL) {
      for (var potioni = 0; potioni < potionname.length; potioni++) {
        var potion = createObject(OPOTION, potioni);
        player.level.items[potioni][0] = potion;
      }
      for (var scrolli = 0; scrolli < scrollname.length; scrolli++) {
        var scroll = createObject(OSCROLL, scrolli);
        player.level.items[potioni + scrolli][0] = scroll;
      }
      var weaponi = 0;
      player.level.items[weaponi++][MAXY - 1] = createObject(ODAGGER);
      player.level.items[weaponi++][MAXY - 1] = createObject(OBELT);
      player.level.items[weaponi++][MAXY - 1] = createObject(OSPEAR);
      player.level.items[weaponi++][MAXY - 1] = createObject(OFLAIL);
      player.level.items[weaponi++][MAXY - 1] = createObject(OBATTLEAXE);
      player.level.items[weaponi++][MAXY - 1] = createObject(OLANCE);
      player.level.items[weaponi++][MAXY - 1] = createObject(OLONGSWORD);
      player.level.items[weaponi++][MAXY - 1] = createObject(O2SWORD);
      player.level.items[weaponi++][MAXY - 1] = createObject(OSWORD);
      player.level.items[weaponi++][MAXY - 1] = createObject(OSWORDofSLASHING);
      player.level.items[weaponi++][MAXY - 1] = createObject(OHAMMER);
      var armori = weaponi;
      player.level.items[armori++][MAXY - 1] = createObject(OSHIELD);
      player.level.items[armori++][MAXY - 1] = createObject(OLEATHER);
      player.level.items[armori++][MAXY - 1] = createObject(OSTUDLEATHER);
      player.level.items[armori++][MAXY - 1] = createObject(ORING);
      player.level.items[armori++][MAXY - 1] = createObject(OCHAIN);
      player.level.items[armori++][MAXY - 1] = createObject(OSPLINT);
      player.level.items[armori++][MAXY - 1] = createObject(OPLATE);
      player.level.items[armori++][MAXY - 1] = createObject(OPLATEARMOR);
      player.level.items[armori++][MAXY - 1] = createObject(OSSPLATE);

      player.level.items[armori++][MAXY - 1] = createObject(ODAMRING);
      player.level.items[armori++][MAXY - 1] = createObject(ODEXRING);
      player.level.items[armori++][MAXY - 1] = createObject(OSTRRING);
      player.level.items[armori++][MAXY - 1] = createObject(OENERGYRING);
      player.level.items[armori++][MAXY - 1] = createObject(OCLEVERRING);
      player.level.items[armori++][MAXY - 1] = createObject(OPROTRING);
      player.level.items[armori++][MAXY - 1] = createObject(OREGENRING);
      player.level.items[armori++][MAXY - 1] = createObject(ORINGOFEXTRA);

      player.level.items[armori++][MAXY - 1] = createObject(OSPIRITSCARAB);
      player.level.items[armori++][MAXY - 1] = createObject(OCUBEofUNDEAD);
      player.level.items[armori++][MAXY - 1] = createObject(ONOTHEFT);
      player.level.items[armori++][MAXY - 1] = createObject(OORBOFDRAGON);

      player.level.items[armori++][MAXY - 1] = createObject(OLARNEYE);
      player.level.items[armori++][MAXY - 1] = createObject(OEMERALD, 20);
      player.level.items[armori++][MAXY - 1] = createObject(OSAPPHIRE, 15);
      player.level.items[armori++][MAXY - 1] = createObject(ODIAMOND, 10);
      player.level.items[armori++][MAXY - 1] = createObject(ORUBY, 5);

      player.level.items[armori++][MAXY - 1] = createObject(OALTAR);
      player.level.items[armori++][MAXY - 1] = createObject(OTHRONE);
      player.level.items[armori++][MAXY - 1] = createObject(OFOUNTAIN);
      player.level.items[armori++][MAXY - 1] = createObject(OMIRROR);
      player.level.items[armori++][MAXY - 1] = createObject(OCHEST);

    }
    updateLog("DEBUG_KNOW_ALL: " + DEBUG_KNOW_ALL);
  }
  if (key == '0' || key == '5') {
    nomove = 1;
    if (player.STEALTH <= 0) {
      updateLog("DEBUG: FREEZING MONSTERS");
      player.HOLDMONST = 100000;
      player.STEALTH = 100000;
    } else {
      updateLog("DEBUG: UNFREEZING MONSTERS");
      player.HOLDMONST = 0;
      player.STEALTH = 0;
    }
  }
  if (key == '0' || key == '6') {
    nomove = 1;
    if (player.AWARENESS <= 0) {
      updateLog("DEBUG: EXPANDED AWARENESS++");
      player.AWARENESS = 100000;
    } else {
      updateLog("DEBUG: EXPANDED AWARENESS--");
      player.AWARENESS = 0;
    }
  }
  if ( /*key == '0' ||*/ key == '7') {
    nomove = 1;
    DEBUG_IMMORTAL = !DEBUG_IMMORTAL;
    updateLog("DEBUG: IMMORTAL: " + DEBUG_IMMORTAL);
  }
  if (key == '8') {
    nomove = 1;
    DEBUG_PROXIMITY = !DEBUG_PROXIMITY;
    if (!DEBUG_PROXIMITY) IN_STORE = false;
    updateLog("DEBUG: PROXIMITY: " + DEBUG_PROXIMITY);
    paint();
  }
  if (key == '0') {
    nomove = 1;
    player.WEAR = null;
    player.inventory[0] = createObject(OLANCE, 25);
    player.WIELD = player.inventory[0];
    player.inventory[1] = createObject(OPROTRING, 50);
    player.GOLD = 250000;
    player.STRENGTH = 70;
    player.INTELLIGENCE = 70;
    player.WISDOM = 70;
    player.CONSTITUTION = 70;
    player.DEXTERITY = 70;
    player.CHARISMA = 70;
    player.AWARENESS = 100000;
    player.raiseexperience(6000000 - player.EXPERIENCE);

    for (var i = 0; i < spelcode.length; i++) {
      learnSpell(spelcode[i]);
    }


  }
}
