"use strict";


/*
    bottomline()

    now for the bottom line of the display
 */
function bottomline() {
  player.recalc();
  // TODO: lots
}


const blank = "          ";
function botsideline(stat, name, line) {
  cursor(70, line + 1);
  if (stat > 0) lprcat(name);
  else lprcat(blank);
}

function botside() {
  var line = 0;
  botsideline(player.STEALTH, "stealth", line++);
  botsideline(player.UNDEADPRO, "undead pro", line++);
  botsideline(player.SPIRITPRO, "spirit pro", line++);
  botsideline(player.CHARMCOUNT, "Charm", line++);
  botsideline(player.TIMESTOP, "Time Stop", line++);
  botsideline(player.HOLDMONST, "Hold Monst", line++);
  botsideline(player.GIANTSTR, "Giant Str", line++);
  botsideline(player.FIRERESISTANCE, "Fire Resit", line++);
  botsideline(player.DEXCOUNT, "Dexterity", line++);
  botsideline(player.STRCOUNT, "Strength", line++);
  botsideline(player.SCAREMONST, "Scare", line++);
  botsideline(player.HASTESELF, "Haste Self", line++);
  botsideline(player.CANCELLATION, "Cancel", line++);
  botsideline(player.INVISIBILITY, "Invisible", line++);
  botsideline(player.ALTPRO, "Protect 3", line++);
  botsideline(player.PROTECTIONTIME, "Protect 2", line++);
  botsideline(player.WTW, "Wall-Walk", line++);
}
