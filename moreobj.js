"use strict";

/*
    subroutine to process a throne object
*/
function othrone(key) {
  var item = getItem(player.x, player.y);
  var isdead = item.matches(ODEADTHRONE);
  switch (key) {
    case ESC:
    case 'i':
      appendLog(" ignore");
      return;
    case 'p':
      if (!isdead) {
        appendLog(" pry off");
        act_remove_gems(item.arg);
      }
      return;
    case 's':
      appendLog(" sit down");
      act_sit_throne(item.arg);
      return;
  };
}



/*
    For command mode.  Perform opening an object (door, chest).
*/
function open_something(direction) {

  /* check for confusion. */
  if (player.CONFUSE > 0) {
    updateLog("You're too confused!");
    beep();
    return;
  }

  // /* check for player standing on a chest.  If he is, prompt for and
  //    let him open it.  If player ESCs from prompt, quit the Open
  //    command.
  // */
  // if (item[playerx][playery] == OCHEST) {
  //   var tempc; /* result of prompting to open a chest */
  //   lprcat("There is a chest here.  Open it?");
  //   if ((tempc = getyn()) == 'y') {
  //     act_open_chest(playerx, playery);
  //     dropflag = 1; /* prevent player from picking back up if fail */
  //     return;
  //   } else if (tempc != 'n')
  //     return;
  // }


  if (direction == null) {
    updateLog("In What Direction? ");
    wait_for_open_direction = true;
    return;
  }

  if (direction == 0) {
    updateLog("");
    wait_for_open_direction = false;
    return false;
  }

  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];

  var item = getItem(x, y);

  if (item == null) {
    updateLog("There is nothing to open!");
    wait_for_open_direction = false;
    return;
  }

  if (item.matches(OOPENDOOR)) {
    updateLog("The door is already open!");
    beep();
    wait_for_open_direction = false;
    return false;
  }
  // case OCHEST:
  //   act_open_chest(x, y);
  //   break;
  else if (item.matches(OCLOSEDDOOR)) {
    act_open_door(x, y);
    wait_for_open_direction = false;
    return true;

  } else {
    updateLog("You can't open that!");
    beep();
    wait_for_open_direction = false;
    return false;
  }

}


/*
    process a fountain object
*/
function ofountain(key) {
  var item = getItem(player.x, player.y);
  switch (key) {
    case ESC:
    case 'i':
      ignore();
      return;

    case 'D':
      act_drink_fountain();
      return;

    case 'T':
      act_wash_fountain();
      return;
  };
}


/*
    a subroutine to raise or lower character levels
    if x > 0 they are raised   if x < 0 they are lowered
*/
function fntchange(how) {
  //lprc('\n');
  how = how / Math.abs(how);
  switch (rnd(9)) {
    case 1:
      lprcat("Your strength");
      player.STRENGTH = Math.max(3, player.STRENGTH + how);
      fch(how);
      break;
    case 2:
      lprcat("Your intelligence");
      player.INTELLIGENCE = Math.max(3, player.INTELLIGENCE + how);
      fch(how);
      break;
    case 3:
      lprcat("Your wisdom");
      player.WISDOM = Math.max(3, player.WISDOM + how);
      fch(how);
      break;
    case 4:
      lprcat("Your constitution");
      player.CONSTITUTION = Math.max(3, player.CONSTITUTION + how);
      fch(how);
      break;
    case 5:
      lprcat("Your dexterity");
      player.DEXTERITY = Math.max(3, player.DEXTERITY + how);
      fch(how);
      break;
    case 6:
      lprcat("Your charm");
      player.CHARISMA = Math.max(3, player.CHARISMA + how);
      fch(how);
      break;
    case 7:
      var j = rnd(player.level.depth + 1);
      if (how < 0) {
        updateLog(`You lose ${j} hit point`);
        if (j > 1) {
          appendLog("s!");
        } else {
          appendLog('!');
        }
        player.losemhp(j);
      } else {
        updateLog(`You gain ${j} hit point`);
        if (j > 1) {
          appendLog("s!");
        } else {
          appendLog('!');
        }
        player.raisemhp(j);
      }
      //bottomline();
      break;

    case 8:
      var j = rnd(player.level.depth + 1);
      if (how > 0) {
        updateLog(`You just gained ${j} spell`);
        if (j > 1) {
          appendLog("s!");
        } else {
          appendLog('!');
        }
        player.raisemspells(j);
      } else {
        updateLog(`You just lost ${j} spell`);
        if (j > 1) {
          appendLog("s!");
        } else {
          appendLog('!');
        }
        player.losemspells(j);
      }
      //bottomline();
      break;

    case 9:
      var j = 5 * rnd((player.level.depth + 1) * (player.level.depth + 1));
      if (how < 0) {
        updateLog(`You just lost ${j} experience point`);
        if (j > 1) {
          appendLog("s!");
        } else {
          appendLog('!');
        }
        player.loseexperience(j);
      } else {
        updateLog(`You just gained ${j} experience point`);
        if (j > 1) {
          appendLog("s!");
        } else {
          appendLog('!');
        }
        player.raiseexperience(j);
      }
      break;
  }
  //cursors();
}

/*
    subroutine to process an up/down of a character attribute for ofountain
*/
function fch(how) {
  if (how < 0) {
    appendLog(" went down by one!");
  } else {
    appendLog(" went up by one!");
  }
  //bottomline();
}

/*
    For command mode.  Perform drinking at a fountain.
*/
function drink_fountain() {
  //cursors();
  var item = getItem(player.x, player.y);
  if (item.matches(ODEADFOUNTAIN)) {
    lprcat("There is no water to drink!");
  } else if (!item.matches(OFOUNTAIN)) {
    lprcat("I see no fountain to drink from here!");
  } else
    act_drink_fountain();
  return;
}

/*
    For command mode.  Perform washing (tidying up) at a fountain.
*/
function wash_fountain() {
  //cursors();
  var item = getItem(player.x, player.y);
  if (item.matches(ODEADFOUNTAIN)) {
    lprcat("There is no water to wash in!");
  } else if (!item.matches(OFOUNTAIN)) {
    lprcat("I see no fountain to wash at here!");
  } else
    act_wash_fountain();
  return;
}


/*
    For command mode.  Perform entering a building.
*/
function enter() {
  // cursors() ;
  var building = getItem(player.x, player.y);
  if (building.matches(OSCHOOL)) {
    oschool();
    return;
  }
  if (building.matches(OBANK)) {
    obank();
    return;
  }
  if (building.matches(OBANK2)) {
    obank2();
    return;
  }
  if (building.matches(ODNDSTORE)) {
    dndstore();
    return;
  }
  if (building.matches(OENTRANCE)) {
    /* place player in front of entrance on level 1.  newcavelevel()
       prevents player from landing on a monster/object.
    */
    player.x = 33;
    player.y = MAXY - 2;
    newcavelevel(1);
    //know[33][MAXY - 1] = KNOWALL ; // TODO
    player.level.monsters[33][MAXY - 1] = null;
    //draws( 0, MAXX, 0, MAXY );
    //showcell(playerx, playery);         /* to show around player */
    bot_linex();
    return;
  }
  if (building.matches(OTRADEPOST)) {
    otradepost();
    return;
  }
  if (building.matches(OLRS)) {
    olrs();
    return;
  }
  if (building.matches(OHOME)) {
    ohome();
    return;
  }

  updateLog("There is no place to enter here!\n");

}
