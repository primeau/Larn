"use strict";

function getlevel(depth) {
  player.level = LEVELS[depth];
  // TODO player is where we could assign global item/monster/know arrays
}

function savelevel() {
  // TODO
}



function findObject(item) {

}


function loadPlayer(saved) {

  player.WEAR = null;
  player.WIELD = null;
  player.SHIELD = null;

  for (var i = 0; i < 26; i++) {
    var item = saved.inventory[i];
    player.inventory[i] = item ? createObject(item) : null;
    if (!item) continue;
    if (saved.SHIELD && saved.SHIELD.id == item.id && saved.SHIELD.arg == item.arg) player.SHIELD = player.inventory[i];
    if (saved.WIELD && saved.WIELD.id == item.id && saved.WIELD.arg == item.arg) player.WIELD = player.inventory[i];
    if (saved.WEAR && saved.WEAR.id == item.id && saved.WEAR.arg == item.arg) player.WEAR = player.inventory[i];
  }

  player.char = saved.char;

  player.x = saved.x;
  player.y = saved.y;

  //player.level = saved.level;
  player.STRENGTH = saved.STRENGTH;
  player.INTELLIGENCE = saved.INTELLIGENCE;
  player.WISDOM = saved.WISDOM;
  player.CONSTITUTION = saved.CONSTITUTION;
  player.DEXTERITY = saved.DEXTERITY;
  player.CHARISMA = saved.CHARISMA;
  player.HPMAX = saved.HPMAX;
  player.HP = saved.HP;
  player.GOLD = saved.GOLD;
  player.EXPERIENCE = saved.EXPERIENCE;
  player.LEVEL = saved.LEVEL;
  player.REGEN = saved.REGEN;
  player.WCLASS = saved.WCLASS;
  player.AC = saved.AC;
  player.BANKACCOUNT = saved.BANKACCOUNT;
  player.SPELLMAX = saved.SPELLMAX;
  player.SPELLS = saved.SPELLS;
  player.ENERGY = saved.ENERGY;
  player.ECOUNTER = saved.ECOUNTER;
  player.MOREDEFENSES = saved.MOREDEFENSES;
  player.PROTECTIONTIME = saved.PROTECTIONTIME;
  player.REGENCOUNTER = saved.REGENCOUNTER;
  player.MOREDAM = saved.MOREDAM;
  player.DEXCOUNT = saved.DEXCOUNT;
  player.STRCOUNT = saved.STRCOUNT;
  player.BLINDCOUNT = saved.BLINDCOUNT;
  player.CONFUSE = saved.CONFUSE;
  player.ALTPRO = saved.ALTPRO;
  player.HERO = saved.HERO;
  player.CHARMCOUNT = saved.CHARMCOUNT;
  player.INVISIBILITY = saved.INVISIBILITY;
  player.CANCELLATION = saved.CANCELLATION;
  player.HASTESELF = saved.HASTESELF;
  player.AGGRAVATE = saved.AGGRAVATE;
  player.GLOBE = saved.GLOBE;
  player.TELEFLAG = saved.TELEFLAG;
  player.SLAYING = saved.SLAYING;
  player.NEGATESPIRIT = saved.NEGATESPIRIT;
  player.SCAREMONST = saved.SCAREMONST;
  player.AWARENESS = saved.AWARENESS;
  player.HOLDMONST = saved.HOLDMONST;
  player.TIMESTOP = saved.TIMESTOP;
  player.HASTEMONST = saved.HASTEMONST;
  player.CUBEofUNDEAD = saved.CUBEofUNDEAD;
  player.GIANTSTR = saved.GIANTSTR;
  player.FIRERESISTANCE = saved.FIRERESISTANCE;
  player.BESSMANN = saved.BESSMANN;
  player.NOTHEFT = saved.NOTHEFT;
  player.HARDGAME = saved.HARDGAME;
  player.MONSTKILLED = saved.MONSTKILLED;
  player.SPIRITPRO = saved.SPIRITPRO;
  player.UNDEADPRO = saved.UNDEADPRO;
  player.STEALTH = saved.STEALTH;
  player.ITCHING = saved.ITCHING;
  player.LAUGHING = saved.LAUGHING;
  player.DRAINSTRENGTH = saved.DRAINSTRENGTH;
  player.CLUMSINESS = saved.CLUMSINESS;
  player.INFEEBLEMENT = saved.INFEEBLEMENT;
  player.HALFDAM = saved.HALFDAM;
  player.SEEINVISIBLE = saved.SEEINVISIBLE;
  player.WTW = saved.WTW;
  player.STREXTRA = saved.STREXTRA;
  player.LIFEPROT = saved.LIFEPROT;

  return saved.level.depth; // HACK
}
