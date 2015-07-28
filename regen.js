"use strict";

/* subroutine to regenerate player hp and spells */
function regen() {
  var flag;

  /* for stop time spell */
  if (player.TIMESTOP > 0) {
    if (--player.TIMESTOP <= 0) recalc();
    return;
  }

  flag = 0;

  if (player.STRENGTH < 3) {
    player.STRENGTH = 3;
    flag = 1;
  }

  if (player.HP != player.HPMAX) {
    if (player.REGENCOUNTER-- <= 0) /* regenerate hit points */ {
      player.REGENCOUNTER = 22 + (player.HARDGAME << 1) - player.LEVEL;
      if ((player.HP += player.REGEN) > player.HPMAX) player.HP = player.HPMAX;
    }
  }

  /* regenerate spells */
  if (player.SPELLS < player.SPELLMAX) {
    if (player.ECOUNTER-- <= 0) {
      player.ECOUNTER = 100 + 4 * (player.HARDGAME - player.LEVEL - player.ENERGY);
      player.SPELLS++;
    }
  }

  if (player.HERO>0)            if (--player.HERO <= 0) {
    player.STRENGTH -= 10;
    player.INTELLIGENCE -= 10;
    player.WISDOM -= 10;
    player.CONSTITUTION -= 10;
    player.DEXTERITY -= 10;
    player.CHARISMA -= 10;
    flag = 1;
  }
  if (player.ALTPRO>0)          if (--player.ALTPRO <= 0)           {player.MOREDEFENSES -= 3; flag = 1;}
  if (player.PROTECTIONTIME>0)  if (--player.PROTECTIONTIME <= 0)   {player.MOREDEFENSES -= 2; flag = 1;}
  if (player.DEXCOUNT>0)        if (--player.DEXCOUNT <= 0)         {player.DEXTERITY -= 3; flag = 1;}
  if (player.STRCOUNT>0)        if (--player.STRCOUNT <= 0)         {player.STREXTRA -= 3; flag = 1;}
  if (player.BLINDCOUNT>0)      if (--player.BLINDCOUNT <= 0)       {cursors(); updateLog("The blindness lifts");}
  if (player.CONFUSE>0)         if (--player.CONFUSE <= 0)          {cursors(); updateLog("You regain your senses");}
  if (player.GIANTSTR>0)        if (--player.GIANTSTR <= 0)         {player.STREXTRA -= 20; flag = 1;}
  if (player.CHARMCOUNT>0)      if ((--player.CHARMCOUNT) <= 0)     flag = 1;
  if (player.INVISIBILITY>0)    if ((--player.INVISIBILITY) <= 0)   flag = 1;
  if (player.CANCELLATION>0)    if ((--player.CANCELLATION) <= 0)   flag = 1;
  if (player.WTW>0)             if ((--player.WTW) <= 0)            flag = 1;
  if (player.HASTESELF>0)       if ((--player.HASTESELF) <= 0)      flag = 1;
  if (player.AGGRAVATE>0)       --player.AGGRAVATE;
  if (player.SCAREMONST>0)      if ((--player.SCAREMONST) <= 0)     flag = 1;
  if (player.STEALTH>0)         if ((--player.STEALTH) <= 0)        flag = 1;
  if (player.AWARENESS>0)       --player.AWARENESS;
  if (player.HOLDMONST>0)       if ((--player.HOLDMONST) <= 0)      flag = 1;
  if (player.HASTEMONST>0)      --player.HASTEMONST;
  if (player.FIRERESISTANCE>0)  if ((--player.FIRERESISTANCE) <= 0) flag = 1;
  if (player.GLOBE>0)           if (--player.GLOBE <= 0)            {player.MOREDEFENSES -= 10; flag = 1;}
  if (player.SPIRITPRO>0)       if (--player.SPIRITPRO <= 0)        flag = 1;
  if (player.UNDEADPRO>0)       if (--player.UNDEADPRO <= 0)        flag = 1;
  if (player.HALFDAM>0)         if (--player.HALFDAM <= 0)          {cursors(); updateLog("You now feel better");}

  if (player.SEEINVISIBLE > 0) {
    if (--player.SEEINVISIBLE <= 0) {
      monsterlist[INVISIBLESTALKER].char = OEMPTY.char;
      if (!player.BLINDCOUNT) {
        drawscreen();
        cursors();
        updateLog("You feel your vision return to normal");
      }
    }
  }

  if (player.ITCHING > 0) {
    if (player.ITCHING > 1)
      if ((player.WEAR != null) || (player.SHIELD != null))
        if (rnd(100) < 50) {
          player.WEAR = null;
          player.SHIELD = null;
          cursors();
          updateLog("The hysteria of itching forces you to remove your armor!");
          recalc();
        }
    if (--player.ITCHING <= 0) {
      cursors();
      updateLog("You now feel the irritation subside!");
    }
  }


  if (player.CLUMSINESS > 0) {
    if (player.WIELD != null)
      if (player.CLUMSINESS > 1)
        if (getItem(player.x, player.y).matches(OEMPTY)) /* only if nothing there */
          if (rnd(100) < 33) /* drop your weapon due to clumsiness */
            drop_object(player.WIELD);

    if (--player.CLUMSINESS <= 0) {
      cursors();
      updateLog("You now feel less awkward!");
    }
  }

  if (flag) {
    recalc();
  }

}
