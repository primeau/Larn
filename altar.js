'use strict';


/* For command mode. Perform the act of descecrating an altar */
function desecrate_altar() {
  cursors();
  if (itemAt(player.x, player.y).matches(OALTAR)) {
    act_desecrate_altar();
  } else {
    updateLog(`I see no altar to desecrate here!`);
  }
}



/* For command mode. Perform the act of praying at an altar */
function pray_at_altar() {
  cursors();
  if (!itemAt(player.x, player.y).matches(OALTAR)) {
    updateLog(`I see no altar to pray at here!`);
  } else {
    updateLog(`  How much do you donate? `);
    setNumberCallback(act_donation_pray, true);
    nomove = 1;
  }
}



/*
    Perform the actions associated with praying at an altar and giving a
    donation.
*/
function act_donation_pray(offering) {
  if (offering == ESC) {
    appendLog(` cancelled`);
    nomove = 1;
    prayed = 0;
    return 1;
  }

  if (offering == '*') {
    offering = player.GOLD;
  }
  offering = Number(offering);

  /* Player donates more gold than they have.  Loop back around so
   player can't escape the altar for free. */
  if (offering > player.GOLD) {
    updateLog(`  You don't have that much!`);
    prayed = 0;
    dropflag = 1;
    return 1;
  }

  /* make giving zero gold equivalent to 'just pray'ing.  Allows player to
     'just pray' in command mode, without having to add yet another command. */
  if (offering == 0) {
    // // for testing
    // var outcome;
    // var cnt = 0;
    // while(outcome != 'crumble') {
    //   outcome = act_just_pray();
    //   cnt++;
    //   if (outcome) console.log(cnt, outcome);
    // }
    act_just_pray();
    dropflag = 1;
    prayed = 1;
    return 1;
  }

  if (player.GOLD >= offering) {
    prayed = 1;
    dropflag = 1;

    var oneTenth = player.GOLD / 10;
    player.setGold(player.GOLD - offering);

    if (ULARN) {
      // less than 10% of post offering gold 
      if (offering < (player.GOLD / 10) && rnd(60) < 30) {
        updateLog(`Cheapskate! The Gods are insulted by such a tiny offering!`);
        forget(); /*  remember to destroy the altar   */
        // ularn does NOT appreciate cheapskates
        createmonster(DEMONPRINCE);
        player.AGGRAVATE += 1500;
        return 1;
      }
      // less than 10% of original gold
      else if (offering < oneTenth || offering < rnd(50)) {
        createmonster(makemonst(level + 2));
        player.AGGRAVATE += 500;
        return 1;
      }
      //
      else {
        var p = rund(16);
        if (p < 4) {
          updateLog("Thank you.");
          return 1;
        } else if (p < 6) {
          enchantarmor(ENCH_ALTAR);
          enchantarmor(ENCH_ALTAR);
        } else if (p < 8) {
          enchweapon(ENCH_ALTAR);
          enchweapon(ENCH_ALTAR);
        } else {
          act_prayer_heard();
        }

        /*
         v12.4.5 - prevents our hero from buying too many +AC/WC
         */
        if (rnd(43) == 13) {
          crumble_altar();
        }

        return 1;
      }
    } // end ULARN
    else {
      //if player gave less than 10% of _original_ gold, make a monster
      if (offering < oneTenth || offering < rnd(50)) {
        createmonster(makemonst(level + 1));
        player.AGGRAVATE += 200;
        return 1;
      }
      if (rnd(101) > 50) {
        act_prayer_heard();
        return 1;
      }
      if (rnd(43) == 5) {
        enchantarmor(ENCH_ALTAR);
        return 1;
      }
      if (rnd(43) == 8) {
        enchweapon(ENCH_ALTAR);
        return 1;
      }

      /*
       v12.4.5 - prevents our hero from buying too many +AC/WC
       */
      if (rnd(43) == 13) {
        crumble_altar();
        return 1;
      }

      updateLog(`  Thank You.`);
      return 1;

    }
  }

}



/*
    Performs the actions associated with 'just praying' at the altar.  Called
    when the user responds 'just pray' when in prompt mode, or enters 0 to
    the money prompt when praying.
*/
function act_just_pray() {

  /*
   v12.4.5 - prevents our hero from getting too many free +AC/WC
   */
  if (rnd(43) == 10) {
    crumble_altar();
    return 'crumble';
  }

  if (ULARN) {
    var p = rund(100);
    if (p < 12) {
      createmonster(makemonst(level + 2));
    } else if (p < 17) {
      enchweapon(ENCH_ALTAR);
    } else if (p < 22) {
      enchantarmor(ENCH_ALTAR);
    } else if (p < 27) {
      act_prayer_heard();
    } else {
      updateLog(`  Nothing happens`);
    }
  } else {
    if (rnd(100) < 75) {
      updateLog(`  Nothing happens`);
    } else if (rnd(43) == 10) {
      enchantarmor(ENCH_ALTAR);
      return 'ac';
    } else if (rnd(43) == 10) {
      if (player.WIELD) {
        updateLog(`  You feel your weapon vibrate for a moment`);
      }
      enchweapon();
      return 'wc';
    } else {
      createmonster(makemonst(level + 1));
    }
    return;
  }

}



/*
    Perform the actions associated with Altar desecration.
*/
function act_desecrate_altar() {
  if (rnd(100) < 60) {
    var monstBoost = ULARN ? 3 : 2;
    createmonster(makemonst(level + monstBoost) + 8);
    player.AGGRAVATE += 2500;
  } else if (ULARN && rnd(100) < 5) {
    player.raiselevel();
  } else if (rnd(101) < 30) {
    crumble_altar();
  } else
    updateLog(`  Nothing happens`);
  return;
}


/*
  Destroys the Altar
*/
function crumble_altar() {
  updateLog(`  The altar crumbles into a pile of dust before your eyes`);
  forget(); /*  remember to destroy the altar   */
}



/*
    Performs the act of ignoring an altar.

    Assumptions:  cursors() has been called.
*/
function act_ignore_altar(x, y) {
  if (rnd(100) < 30) {
    var monstBoost = ULARN ? 2 : 1;
    createmonster(makemonst(level + monstBoost), x, y);
    player.AGGRAVATE += rnd(450);
  } else
    updateLog(`  Nothing happens`);
  return;
}



/*
    function to cast a +3 protection on the player
 */
function act_prayer_heard() {
  updateLog(`  You have been heard!`);
  var protime;
  if (ULARN) {
    protime = 800;
  } else {
    protime = 500;
  }
  player.updateAltPro(protime); /* protection field */
}