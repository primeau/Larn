"use strict";


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
    wait_for_open_input = true;
    return;
  }

  if (direction == 0) {
    updateLog("");
    wait_for_open_input = false;
    return false;
  }

  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];

  var item = itemAt(x,y);

  if (item == null) {
    updateLog("There is nothing to open!");
    wait_for_open_input = false;
    return;
  }

  if (item.matches(OOPENDOOR)) {
    updateLog("The door is already open!");
    beep();
    wait_for_open_input = false;
    return false;
  }
  // case OCHEST:
  //   act_open_chest(x, y);
  //   break;
  else if (item.matches(OCLOSEDDOOR)) {
    act_open_door(x, y);
    wait_for_open_input = false;
    return true;

  } else {
    updateLog("You can't open that!");
    beep();
    wait_for_open_input = false;
    return false;
  }

}
