"use strict";

/* subroutine to regenerate player hp and spells */
function regen() {
  player.MOVESMADE++;

  /* for stop time spell */
  if (player.TIMESTOP > 0) {
    if (--player.TIMESTOP <= 0) recalc();
    return;
  }

  if (player.STRENGTH < 3) {
    player.setStrength(3);
  }

  if (player.HP != player.HPMAX) {
    if (player.REGENCOUNTER-- <= 0) /* regenerate hit points */ {
      player.REGENCOUNTER = 22 + (getDifficulty() << 1) - player.LEVEL;
      player.raisehp(player.REGEN);
    }
  }

  /* regenerate spells */
  if (player.SPELLS < player.SPELLMAX) {
    if (player.ECOUNTER-- <= 0) {
      player.ECOUNTER = 100 + 4 * (getDifficulty() - player.LEVEL - player.ENERGY);
      player.setSpells(player.SPELLS + 1);
    }
  }

  if (player.HERO) {
    if (--player.HERO <= 0) {
      player.setStrength(player.STRENGTH - 10);
      player.setIntelligence(player.INTELLIGENCE - 10);
      player.setWisdom(player.WISDOM - 10);
      player.setConstitution(player.CONSTITUTION - 10);
      player.setDexterity(player.DEXTERITY - 10);
      player.setCharisma(player.CHARISMA - 10);
    }
  }

  if (player.PROTECTIONTIME) if (--player.PROTECTIONTIME <= 0) player.setMoreDefenses(player.MOREDEFENSES - 2);
  if (player.ALTPRO)         if (--player.ALTPRO <= 0)         player.setMoreDefenses(player.MOREDEFENSES - 3);
  if (player.GLOBE)          if (--player.GLOBE <= 0)          player.setMoreDefenses(player.MOREDEFENSES - 10);
  if (player.DEXCOUNT)       if (--player.DEXCOUNT <= 0)       player.setDexterity(player.DEXTERITY - 3);
  if (player.STRCOUNT)       if (--player.STRCOUNT <= 0)       player.setStrExtra(player.STREXTRA - 3);
  if (player.GIANTSTR)       if (--player.GIANTSTR <= 0)       player.setStrExtra(STREXTRA - 20);
  if (player.BLINDCOUNT)     if (--player.BLINDCOUNT <= 0)     updateLog("The blindness lifts");
  if (player.CONFUSE)        if (--player.CONFUSE <= 0)        updateLog("You regain your senses");
  if (player.HALFDAM)        if (--player.HALFDAM <= 0)        updateLog("You now feel better");

  if (player.CHARMCOUNT)     --player.CHARMCOUNT;
  if (player.INVISIBILITY)   --player.INVISIBILITY;
  if (player.CANCELLATION)   --player.CANCELLATION;
  if (player.WTW)            --player.WTW;
  if (player.HASTESELF)      --player.HASTESELF;
  if (player.AGGRAVATE)      --player.AGGRAVATE;
  if (player.SCAREMONST)     --player.SCAREMONST;
  if (player.STEALTH)        --player.STEALTH;
  if (player.AWARENESS)      --player.AWARENESS;
  if (player.HOLDMONST)      --player.HOLDMONST;
  if (player.HASTEMONST)     --player.HASTEMONST;
  if (player.FIRERESISTANCE) --player.FIRERESISTANCE;
  if (player.SPIRITPRO)      --player.SPIRITPRO
  if (player.UNDEADPRO)      --player.UNDEADPRO

  if (player.SEEINVISIBLE) {
    if (--player.SEEINVISIBLE <= 0) {
      monsterlist[INVISIBLESTALKER].char = OEMPTY.char;
      if (!player.BLINDCOUNT) {
        updateLog("You feel your vision return to normal");
      }
    }
  }

  if (player.ITCHING) {
    if (player.ITCHING > 1)
      if ((player.WEAR) || (player.SHIELD))
        if (rnd(100) < 50) {
          player.WEAR = null;
          player.SHIELD = null;
          updateLog("The hysteria of itching forces you to remove your armor!");
        }
    if (--player.ITCHING <= 0) {
      updateLog("You now feel the irritation subside!");
    }
  }

  if (player.CLUMSINESS) {
    if (player.WIELD)
      if (player.CLUMSINESS > 1)
        if (itemAt(player.x, player.y).matches(OEMPTY)) /* only if nothing there */
          if (rnd(100) < 33) {/* drop your weapon due to clumsiness */
            var dropindex = getCharFromIndex(player.inventory.indexOf(player.WIELD));
            drop_object(dropindex);
          }
    if (--player.CLUMSINESS <= 0) {
      updateLog("You now feel less awkward!");
    }
  }

}
