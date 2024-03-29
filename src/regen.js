'use strict';

/* subroutine to regenerate player hp and spells */
function regen() {

  if (!player) return;
  
  player.MOVESMADE++;

  /* for stop time spell */
  if (player.TIMESTOP > 0) {
    if (player.updateTimeStop(-1) <= 0) recalc();
    return;
  }

  // is this where gtime should be incremented?
  
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

  if (player.COKED) {
    if (--player.COKED <= 0) {
      player.setStrength(player.STRENGTH - 34);
      player.setIntelligence(player.INTELLIGENCE - 34);
      player.setWisdom(player.WISDOM - 34);
      player.setConstitution(player.CONSTITUTION - 34);
      player.setDexterity(player.DEXTERITY - 34);
      player.setCharisma(player.CHARISMA - 34);
    }
  }

  if (player.STEALTH)        player.updateStealth(-1);
  if (player.UNDEADPRO)      player.updateUndeadPro(-1);
  if (player.SPIRITPRO)      player.updateSpiritPro(-1);
  if (player.CHARMCOUNT)     player.updateCharmCount(-1);
  if (player.HOLDMONST)      player.updateHoldMonst(-1);
  if (player.FIRERESISTANCE) player.updateFireResistance(-1);
  if (player.SCAREMONST)     player.updateScareMonst(-1);
  if (player.HASTESELF)      player.updateHasteSelf(-1);
  if (player.CANCELLATION)   player.updateCancellation(-1);
  if (player.INVISIBILITY)   player.updateInvisibility(-1);
  if (player.WTW)            player.updateWTW(-1);

  if (player.GIANTSTR)       player.updateGiantStr(-1);
  if (player.DEXCOUNT)       player.updateDexCount(-1);
  if (player.STRCOUNT)       player.updateStrCount(-1);
  if (player.ALTPRO)         player.updateAltPro(-1);
  if (player.PROTECTIONTIME) player.updateProtectionTime(-1);

  if (player.GLOBE)          if (--player.GLOBE <= 0)          player.setMoreDefenses(player.MOREDEFENSES - 10);
  if (player.BLINDCOUNT)     if (--player.BLINDCOUNT <= 0)     updateLog(`The blindness lifts${period}`);
  if (player.CONFUSE)        if (--player.CONFUSE <= 0)        updateLog(`You regain your senses${period}`);
  if (player.HALFDAM)        if (--player.HALFDAM <= 0)        updateLog(`You now feel better${period}`);

  if (player.AGGRAVATE)      --player.AGGRAVATE;
  if (player.AWARENESS)      if (!isCarrying(OORB)) --player.AWARENESS;
  if (player.HASTEMONST)     --player.HASTEMONST;

  if (player.SEEINVISIBLE) {
    if (ULARN) {
      if (isCarrying(OAMULET)) {
         /* See inv doesn't wear off if player has amulet of invisibility */
        player.SEEINVISIBLE++;
      }
    }
    if (--player.SEEINVISIBLE <= 0) {
      if (!player.BLINDCOUNT) {
        updateLog(`You feel your vision return to normal${period}`);
      }
    }
  }

  if (player.ITCHING) {
    if (player.ITCHING > 1)
      if ((player.WEAR) || (player.SHIELD))
        if (rnd(100) < 50) {
          player.WEAR = null;
          player.SHIELD = null;
          updateLog(`The hysteria of itching forces you to remove your armor!`);
        }
    if (--player.ITCHING <= 0) {
      updateLog(`You now feel the irritation subside!`);
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
      updateLog(`You now feel less awkward!`);
    }
  }

}
