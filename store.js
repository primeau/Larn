'use strict';

/*
    For command mode.  Perform entering a building.
*/
function enter() {
  // cursors() ;

  debug(`enter(): entering a building`);
  mazeMode = false;

  var building = itemAt(player.x, player.y);
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
    dungeon();
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
  if (building.matches(OVOLUP)) {
    act_up_shaft();
    return;
  }
  if (building.matches(OVOLDOWN)) {
    act_down_shaft();
    return;
  }
  if (building.matches(OPAD)) {
    updateLog(`You try the door, but it's locked. Maybe another time.`);
    setMazeMode(true);
    return;
  }

  debug(`enter(): no building here`);
  setMazeMode(true);

  updateLog(`There is no place to enter here!`);

}








/*
 *
 *
 * Dungeon Entrance
 *
 *
 */
function dungeon() {
  setMazeMode(true);
  /* place player in front of entrance on level 1.  newcavelevel()
     prevents player from landing on a monster/object.
  */
  player.x = 33;
  player.y = MAXY - 2;
  newcavelevel(1);
  player.level.know[33][MAXY - 1] = KNOWALL;
  player.level.monsters[33][MAXY - 1] = null;
  //draws( 0, MAXX, 0, MAXY );
  showcell(player.x, player.y); /* to show around player */
}









/*
 *
 *
 * DnD Store
 *
 *
 */
var dndindex = 0;

function dndstore() {

  initpricelist();

  /*
   * Easter Egg #2 -- recreate the DOS Larn 12.0 experience for Rob
   */
  if (logname === 'Rob the Warrior of Doom') {
    if (dndindex == 0) clear();
    cursor(1, 1);
  } else {
    clear(); // this is the correct behaviour
  }

  lprcat(`Welcome to the ${GAMENAME} Thrift Shoppe.  We stock many items explorers find useful\n`);
  lprcat(`in their adventures.  Feel free to browse to your hearts content.\n`);
  lprcat(`Also be advised, if you break 'em, you pay for 'em.`);

  for (var i = dndindex; i < 26 + dndindex; i++) {
    dnditem(i);
  }

  updategold();

  setCharCallback(dnd_parse);
}



function updategold() {
  cursor(50, 19);
  lprcat(`You have ${Number(player.GOLD).toLocaleString()} gold pieces`);
  cltoeoln();
  //cl_dn(1, 20); /* erase to eod */
  lprcat(`\n\nEnter your transaction [<b>space</b> for next page, <b>escape</b> to leave] `);
}



function dnd_parse(key) {
  if (key == ESC) {
    dndindex = 0;
    return exitbuilding();
  }

  if (key == ' ') {
    if ((dndindex += 26) >= MAXITM) {
      dndindex = 0;
    }
    dndstore();
    return 0;
  }

  if (!isalpha(key)) {
    return 0;
  }

  var i = getIndexFromChar(key);

  if (i >= 0 && i <= 26) {
    i += dndindex;
    if (i >= MAXITM) {
      storemessage(`Sorry, but we are out of that item.`, 700);
    } else if (dnd_item[i].qty <= 0) {
      storemessage(`Sorry, but we are out of that item.`, 700);
    } else if (pocketfull()) {
      storemessage(`You can't carry anything more!`, 700);
    } else if (player.GOLD < dnd_item[i].price) {
      storemessage(`You don't have enough gold to pay for that!`, 700);
    } else {
      player.setGold(player.GOLD - dnd_item[i].price);
      dnd_item[i].qty--;
      var boughtItem = createObject(dnd_item[i].itemId, dnd_item[i].arg);
      take(boughtItem);
      var invindex = getCharFromIndex(player.inventory.indexOf(boughtItem));
      if (boughtItem.matches(OSCROLL)) learnScroll(boughtItem);
      if (boughtItem.matches(OPOTION)) learnPotion(boughtItem);

      /*
        v12.4.5:
        to balance the game on higher difficulties the chest and book
        from the store are special and are reduced in resale value and
        quality as difficulty goes up
      */
      if (boughtItem.matches(OBOOK) || boughtItem.matches(OCHEST)) {
        boughtItem.arg = Math.max(1, boughtItem.arg - getDifficulty());
      }

      storemessage(`  You pick up: ${invindex}) ${boughtItem}`, 1000);
      if (dnd_item[i].qty == 0) dnditem(i);
      updategold();
      lprc(key); /* echo the byte */
      //nap(1001);
      return 0;
    }
  } else {
    return 0;
  }
}



/*
    dnditem(index)

    to print the item list;  used in dndstore() enter with the index into itm
 */
function dnditem(i) {
  var j, k, price;
  if (i < 0 || i >= MAXITM) return;

  cursor((j = (i & 1) * 40 + 1), (k = ((i % 26) >> 1) + 5));

  if (dnd_item[i].qty == 0) {
    lprintf(``, 39);
    return;
  }

  var item = createObject(dnd_item[i].itemId, dnd_item[i].arg);
  lprcat(`${getCharFromIndex(i%26)}) `);

  if (item.matches(OPOTION)) lprintf(`${item.toString(true).substring(8)}`);
  else if (item.matches(OSCROLL)) lprintf(`${item.toString(true).substring(8)}`);
  else lprcat(`${item.toString(true)}`);

  cursor(j + 31, k);

  price = dnd_item[i].price;

  lprintf(price.toString(), 6);
}









/*
 *
 *
 * The Bank of Larn
 *
 *
 */
function obank() {
  banktitle(`Welcome to the First National Bank of ${GAMENAME}.`);
}


function obank2() {
  banktitle(`Welcome to the ${ULARN ? 8 : 5}th level branch office of the First National Bank of ${GAMENAME}.`);
  /* because we state the level in the title, clear the '?' in the
     level display at the bottom, if the user teleported.
  */
  player.TELEFLAG = 0;
}


function banktitle(str) {
  clear();
  lprcat(str);
  lprcat(`\n\n   Gemstone                 Appraisal      Gemstone                 Appraisal`);
  obanksub();
  paint();
}


var gemorder = []; /* the reference to screen location for each gem */
var gemvalue = []; /* the appraisal of the gems */

function obanksub() {
  gemorder = [];
  gemvalue = [];

  ointerest(); /* credit any needed interest */

  var i, k;
  for (i = 0, k = 0; i < 26; i++) {
    var item = player.inventory[i];
    if (item && (item.isGem() || item.matches(OLARNEYE))) {
      if (item.matches(OLARNEYE)) {
        gemvalue[i] = Math.max(50000, 250000 - ((gtime * 7) / 100) * 100);
      } else {
        gemvalue[i] = (255 & item.arg) * 100;
      }
      gemorder[i] = k;
      cursor((k % 2) * 40 + 1, (k >> 1) + 4);
      lprcat(`${getCharFromIndex(i)}) ${item}`);
      cursor((k % 2) * 40 + 32, (k >> 1) + 4);
      lprintf(`${gemvalue[i]}`, 6);
      k++;
    } else {
      /* make sure player can't sell non-existant gems */
      gemvalue[i] = 0;
      gemorder[i] = 0;
    }
  }

  bank_print_gold();

  cl_dn(1, 21);
  lprcat(`\nYour wish? [(<b>d</b>) deposit, (<b>w</b>) withdraw, (<b>s</b>) sell a stone, or <b>escape</b>] `);

  setCharCallback(bank_parse);
}



function bank_print_gold() {
  cursor(31, 17);
  cltoeoln();
  lprcat(`You have ${Number(player.BANKACCOUNT).toLocaleString()} gold pieces in the bank`);
  cursor(31, 18);
  cltoeoln();
  lprcat(`You have ${Number(player.GOLD).toLocaleString()} gold pieces`);
  if (player.BANKACCOUNT + player.GOLD >= 500000)
    lprcat(`\n\nNote: Larndom law states that only deposits under 500,000gp can earn interest`);
}



function bank_parse(key) {
  if (key == ESC) {
    return exitbuilding();
  }

  if (key == 'd') {
    lprcat(`deposit\n`);
    cltoeoln();
    lprcat(`How much? [<b>*</b> for all] `);
    setNumberCallback(bank_deposit, true);
  }

  if (key == 'w') {
    lprcat(`withdraw\n`);
    cltoeoln();
    lprcat(`How much? [<b>*</b> for all] `);
    setNumberCallback(bank_withdraw, true);
  }

  if (key == 's') {
    lprcat(`sell\n`);
    cltoeoln();
    lprcat(`Which stone would you like to sell? [<b>*</b> for all] `);
    setCharCallback(bank_sell);
  }
}



function bankmessage(str, duration) {
  if (mazeMode) return;

  if (duration == ``)
    cl_dn(1, 23);
  else
    cl_dn(1, 24);
  bank_print_gold();
  cursor(1, 24);
  lprcat(str);
  cursor(73, 22);
  cltoeoln();

  setCharCallback(bank_parse);

  blt();

  napping = false;

  if (duration && duration != 0) {
    napping = true;
    setTimeout(bankmessage, duration, ``, 0);
  }
}



function bank_deposit(amt) {
  if (amt == ESC) {
    bankmessage(`  cancelled`, 700);
    return 1;
  }

  if (amt == '*') {
    amt = player.GOLD;
  }

  amt = Number(amt);

  if (amt < 0) {
    bankmessage(`Sorry, but we can't take negative gold!`, 700);
  } else if (amt > player.GOLD) {
    bankmessage(`You don't have that much.`, 700);
  } else {
    player.setGold(player.GOLD - amt);
    player.BANKACCOUNT += amt;
    bankmessage(``, 700);
  }
  return 1;
}



function bank_withdraw(amt) {
  if (amt == ESC) {
    bankmessage(`  cancelled`, 700);
    return 1;
  }

  if (amt == '*') {
    amt = player.BANKACCOUNT;
  }

  amt = Number(amt);

  if (amt < 0) {
    bankmessage(`Sorry, but we don't have any negative gold!`, 700);
  } else if (amt > player.BANKACCOUNT) {
    bankmessage(`You don't have that much in the bank!`, 700);
  } else {
    player.setGold(player.GOLD + amt);
    player.BANKACCOUNT -= amt;
    bankmessage(``, 700);
  }
  return 1;
}



function bank_sell(key) {
  if (key == ESC) {
    bankmessage(`  cancelled`, 700);
  } else if (key == '*') {
    var gems_sold = false;
    for (i = 0; i < 26; i++) {
      if (gemvalue[i]) {
        gems_sold = true;
        player.setGold(player.GOLD + gemvalue[i]);
        player.inventory[i] = null;
        gemvalue[i] = 0;
        var k = gemorder[i];
        cursor((k % 2) * 40 + 1, (k >> 1) + 4);
        lprintf(``, 39);
        bankmessage(``, 700);
      }
    }
    if (!gems_sold) {
      bankmessage(`You have no gems to sell!`, 700);
    }
  } else {
    var i = getIndexFromChar(key);
    if (i >= 0 && i <= 26) {
      if (gemvalue[i] == 0) {
        bankmessage(`Item ${getCharFromIndex(i)} is not a gemstone!`, 700);
      } else {
        player.setGold(player.GOLD + gemvalue[i]);
        player.inventory[i] = null;
        gemvalue[i] = 0;
        var k = gemorder[i];
        cursor((k % 2) * 40 + 1, (k >> 1) + 4);
        lprintf(``, 39);
        bankmessage(``, 700);
      }
    }
  }
  return 1;
}



/* function to put interest on your bank account */
function ointerest() {
  if (player.BANKACCOUNT < 0) player.BANKACCOUNT = 0;

  if (player.BANKACCOUNT > 0 && player.BANKACCOUNT < 500000) {
    var i = elapsedtime() - lasttime; /* # mobuls elapsed */
    while (i-- > 0 && player.BANKACCOUNT < 500000) {
      player.BANKACCOUNT += player.BANKACCOUNT / 250;
    }
    /* interest limit */
    player.BANKACCOUNT = Math.min(500000, player.BANKACCOUNT);
  }

  lasttime = elapsedtime();

  player.BANKACCOUNT = Math.floor(player.BANKACCOUNT);
}








/*
 *
 *
 * Trading Post
 *
 *
 */
var tradorder = [];

function otradiven() {
  var iven = player.inventory;
  var i = 0;
  var j = 0;
  /* Print user's iventory like bank */
  for (; i < 26; i++) {
    var item = iven[i];
    if (item) {
      cursor((j % 2) * 40 + 1, (j >> 1) + 8);
      tradorder[i] = 0; /* init position on screen to zero */

      if (item.matches(OPOTION) && !isKnownPotion(item) ||
        item.matches(OSCROLL) && !isKnownScroll(item)) {
        // can't sell unknown stuff
        continue;
      }
      tradorder[i] = j++; /* will display only if identified */
      var fancy = !item.isRing() && item != player.WIELD && item != player.WEAR && item != player.SHIELD;
      var itemDescription = `${getCharFromIndex(i)}) ${item.toString(fancy)}`.substring(0,39);
      lprcat(itemDescription);

    } else {
      tradorder[i] = 0; /* make sure order array is clear */
    }
  } // for
}


function otradepost() {
  setCharCallback(parse_tradepost);
  initpricelist();

  clear();

  lprcat(`Welcome to the ${GAMENAME} Trading Post. We buy items that explorers no longer find\n`);
  lprcat(`useful. Since the condition of the items you bring in is not certain,\n`);
  lprcat(`and we incur great expense in reconditioning the items, we usually pay\n`);
  lprcat(`only 20% of their value were they to be new. If the items are badly\n`);
  lprcat(`damaged, we will pay only 10% of their new value.\n\n`);

  lprcat(`Here are the items we would be willing to buy from you:\n`);

  otradiven();

  cl_dn(1, 21);

  lprcat(`\nWhat item do you want to sell to us? [Press <b>escape</b> to leave] `);
}



function cleartradiven(i) {
  var j = tradorder[i];
  cursor((j % 2) * 40 + 1, (j >> 1) + 8);
  lprintf(` `, 39);
  tradorder[i] = 0;
}



function parse_tradepost(key) {
  if (key == ESC) {
    return exitbuilding();
  }

  if (!isalpha(key)) {
    return 0;
  }

  var value = 0;
  var i = getIndexFromChar(key);

  //cursor(62, 22);
  //lprc(key);

  if (i >= 0 && i <= 26) {
    var item = player.inventory[i];
    if (!item) {
      storemessage(`You don't have item ${key}!`, 700);
      //nap(2000);
      return 0;
    }
    if (item.matches(OSCROLL) && !isKnownScroll(item) ||
      item.matches(OPOTION) && !isKnownPotion(item)) {
      storemessage(`Sorry, we can't accept unidentified objects`, 700);
      //nap(2000);
      return 0;
    }
    if (item.isGem()) {
      value = 20 * (item.arg & 255);
    } //
    else if (item.matches(OLARNEYE)) {
      value = Math.max(10000, 50000 - (((gtime * 7) / 100) * 20));
    } //
    else {
      var found = MAXITM;
      for (var j = 0; j < MAXITM; j++) {
        if (dnd_item[j].itemId == item.id) {
          found = j;
          break;
        }
      }
      if (found == MAXITM) {
        storemessage(`Sorry, we can't accept unidentified objects`, 700);
        //nap(2000);
        return 0;
      }
      if (item.matches(OSCROLL) || item.matches(OPOTION)) {
        value = 0.2 * dnd_item[j + item.arg].price;
      } else {
        var izarg = item.arg;
        value = 0.1 * dnd_item[j].price;

        /* appreciate if a +n object */
        if (izarg >= 0) {
          value *= 2;
        }
        while ((izarg-- > 0) && ((value = 14 * (67 + value) / 10) < 500000));
      }
    }
  } else {
    storemessage(`Sorry, but we are not authorized to accept that item`, 700);
    return 0;
  }

  /* we have now found the value of the item, and dealt with any error
  cases. print the object's value, let the user sell it */
  value = Math.floor(value);
  storemessage(`Item (${key}) is worth ${value} gold pieces to us. Do you want to sell it?`);

  itemToSell = [];
  itemToSell[SELL_PRICE] = value;
  itemToSell[SELL_ITEM] = item;

  setCharCallback(parse_sellitem);
}



var itemToSell = null; // GLOBAL
const SELL_PRICE = 0;
const SELL_ITEM = 1;


function parse_sellitem(key) {
  if (key == ESC || key == 'N' || key == 'n') {
    cursor(63 + itemToSell[SELL_PRICE].toString().length, 24);
    setCharCallback(parse_tradepost);
    lprcat(`no thanks`);
    //nap(500);

    napping = true;
    setTimeout(storemessage, 700, ``);
    itemToSell = null;
    return 1;
  }
  if (key == 'Y' || key == 'y') {
    cursor(63 + itemToSell[SELL_PRICE].toString().length, 24);
    setCharCallback(parse_tradepost);
    lprcat(`yes`);

    napping = true;
    setTimeout(storemessage, 700, ``);
    player.setGold(player.GOLD + itemToSell[SELL_PRICE]);
    if (player.WEAR === itemToSell[SELL_ITEM]) player.WEAR = null;
    if (player.WIELD === itemToSell[SELL_ITEM]) player.WIELD = null;
    if (player.SHIELD === itemToSell[SELL_ITEM]) player.SHIELD = null;
    player.adjustcvalues(itemToSell[SELL_ITEM], false);
    var index = player.inventory.indexOf(itemToSell[SELL_ITEM]);
    player.inventory[index] = null;
    cleartradiven(index);
    itemToSell = null;
    return 1;
  }
  return 0;
}








/*
 *
 *
 * College of Larn
 *
 *
 */
const coursetime = [10, 15, 10, 20, 10, 10, 10, 5];

function oschool() {
  setCharCallback(parse_class);
  napping = false;

  printclasses();

  cl_dn(1, 19);
  cursor(1, 20);
  lprcat(`What is your choice? [Press <b>escape</b> to leave] `);

  blt();
}



function printclasses() {
  cl_up(1, 18);
  cursor(1, 1);
  lprcat(`The College of ${GAMENAME} offers the exciting opportunity of higher education to\n`);
  lprcat(`all inhabitants of the caves. Here is the class schedule:\n\n\n`);
  lprcat(`\t\t    Course Name               Time Needed\n\n`);

  if (!course[0]) lprcat(`\t\ta)  Fighter Training I          10 mobuls`);
  lprc('\n');
  if (!course[1]) lprcat(`\t\tb)  Fighter Training II         15 mobuls`);
  lprc('\n');
  if (!course[2]) lprcat(`\t\tc)  Introduction to Wizardry    10 mobuls`);
  lprc('\n');
  if (!course[3]) lprcat(`\t\td)  Applied Wizardry            20 mobuls`);
  lprc('\n');
  if (!course[4]) lprcat(`\t\te)  Behavioral Psychology       10 mobuls`);
  lprc('\n');
  if (!course[5]) lprcat(`\t\tf)  Faith for Today             10 mobuls`);
  lprc('\n');
  if (!course[6]) lprcat(`\t\tg)  Contemporary Dance          10 mobuls`);
  lprc('\n');
  if (!course[7]) lprcat(`\t\th)  History of ${GAMENAME}${ULARN ? `` : ` `}             5 mobuls`);

  lprcat(`\n\n\t\tAll courses cost 250 gold pieces`);
  cursor(30, 18);
  lprcat(`You are presently carrying ${Number(player.GOLD).toLocaleString()} gold pieces`);
}



function parse_class(key) {
  if (key == ESC) {
    return exitbuilding();
  }

  var naptime = 700;

  if (!isalpha(key)) return 0;

  lprc(`${key}`);

  var i = getIndexFromChar(key);

  cursor(1, 21);

  if (i < 0 || i >= 8 || course[i]) {
    lprcat(`\nSorry, but that class is filled`);
  } else if (player.GOLD < 250) {
    lprcat(`\nYou don't have enough gold to pay for that!`);
  } else {
    player.setGold(player.GOLD - 250);
    var time_used = 0;

    switch (key) {
      case 'a':
        player.setStrength(player.STRENGTH + 2);
        player.setConstitution(player.CONSTITUTION + 1);
        lprcat(`\nYou feel stronger!`);
        break;

      case 'b':
        if (!course[0]) {
          player.setGold(player.GOLD + 250);
          time_used = -10000;
          lprcat(`\nSorry, but this class has a prerequisite of Fighter Training I`);
          break;
        }
        player.setStrength(player.STRENGTH + 2);
        player.setConstitution(player.CONSTITUTION + 2);
        lprcat(`\nYou feel much stronger!`);
        break;

      case 'c':
        player.setIntelligence(player.INTELLIGENCE + 2);
        lprcat(`\nThe task before you now seems more attainable!`);
        break;

      case 'd':
        if (!course[2]) {
          player.setGold(player.GOLD + 250);
          time_used = -10000;
          lprcat(`\nSorry, but this class has a prerequisite of Introduction to Wizardry`);
          break;
        }
        player.setIntelligence(player.INTELLIGENCE + 2);
        lprcat(`\nThe task before you now seems very attainable!`);
        break;

      case 'e':
        player.setCharisma(player.CHARISMA + 3);
        lprcat(`\nYou now feel like a born leader!`);
        break;

      case 'f':
        player.setWisdom(player.WISDOM + 2);
        lprcat(`\nYou now feel more confident that you can find the potion in time!`);
        break;

      case 'g':
        player.setDexterity(player.DEXTERITY + 3);
        lprcat(`\nYou feel like dancing!`);
        break;

      case 'h':
        player.setIntelligence(player.INTELLIGENCE + 1);
        lprcat(`\nYour instructor told you that the Eye of Larn is rumored to be guarded`);
        lprcat(`\nby a platinum dragon who possesses psionic abilities`);
        break;
    }

    time_used += coursetime[i] * 100;

    if (time_used > 0) {
      gtime += time_used;
      course[i] = 1; /* remember that he has taken that course */
      player.raisehp(player.HPMAX - player.HP);
      player.setSpells(player.SPELLMAX); /* he regenerated */
      if (player.BLINDCOUNT) player.BLINDCOUNT = 1; /* cure blindness too! */
      if (player.CONFUSE) player.CONFUSE = 1; /* end confusion */
      adjtime(time_used); /* adjust parameters for time change */
      naptime += 200;
    }
  }

  printclasses();
  blt();

  setTimeout(oschool, naptime);
  napping = true;
  return 0;
}








/*
 *
 *
 * Home
 *
 *
 */
function ohome() {

  dropflag = 1;

  setCharCallback(parse_home);

  for (var i = 0; i < 26; i++) {
    var item = player.inventory[i];
    if (item && item.matches(OPOTION) && item.arg == 21) {
      //iven[i] = 0; /* remove from inventory */
      if (gtime > TIMELIMIT) {
        setMazeMode(true);
        updateLog(`Congratulations. You found a potion of cure dianthroritis. Frankly, no one`);
        updateLog(`thought you could do it. Boy! Did you surprise them! The doctor has the sad`);
        updateLog(`duty to inform you that your daughter died before your return. There was`);
        updateLog(`nothing that could be done without the potion.`);
        died(269, false); /* failed */
        return;
      } else {
        setMazeMode(true);
        updateLog(`Congratulations. You found a potion of cure dianthroritis. Frankly, no one`);
        updateLog(`thought you could do it. Boy! Did you surprise them! The doctor is now`);
        updateLog(`administering the potion, and in a few moments your daughter should be well`);
        updateLog(`on her way to recovery.`);

        updateLog(`Press <b>enter</b> to continue: `);

        setCharCallback(win);
        return;
      }
    }
  }

  if (gtime > TIMELIMIT) {
    setMazeMode(true);
    updateLog(`Welcome home ${logname}.`);
    updateLog(`The latest word from the doctor is not good.`);
    updateLog(`The doctor has the sad duty to inform you that your daughter died! You didn't`);
    updateLog(`make it in time. There was nothing that could be done without the potion.`);
    died(269, false); /* failed */
    return;
  }

  clear();

  cursor(1, 7);

  lprcat(`\tWelcome home ${logname}.`);
  lprcat(`\n\n\tThe latest word from the doctor is not good.`);
  lprcat(`\n\n\tThe diagnosis is confirmed as dianthroritis. The doctor guesses that`);
  lprcat(`\n\tyour daughter has only ${timeleft()} mobuls left in this world. It's up to you,`);
  lprcat(`\n\t${logname}, to find the only hope for your daughter, the`);
  lprcat(`\n\tvery rare potion of cure dianthroritis. It is rumored that only deep`);
  lprcat(`\n\tin the depths of the caves can this potion be found.`);

  lprcat(`\n\n\tPress <b>escape</b> to leave: `);

  paint();

}

function parse_home(key) {
  if (key == ESC && !GAMEOVER) {
    return exitbuilding();
  }
}

function win(key) {
  if (key != ENTER) {
    return 0;
  }

  napping = true;
  updateLog(``);
  updateLog(``);
  updateLog(``);
  updateLog(``);
  updateLog(``);
  updateLog(`The potion is `);

  setTimeout(function() {
    appendLog(`working!`);
    paint();
    setTimeout(function() {
      updateLog(``);
      updateLog(``);
      updateLog(`The doctor thinks that your daughter will recover in a few days.`);
      paint();
      setTimeout(function() {
        updateLog(`Congratulations!`);
        paint();
        napping = false;
        died(263, false); /* a winner! */
      }, 1000);
    }, 1500);
  }, 2000);

  return 1;
}








/*
 *
 *
 * for the Larn Revenue Service
 *
 *
 */
function parse_lrs(key) {
  if (key == ESC) {
    return exitbuilding();
  }
  if (key == 'p') {
    setNumberCallback(parse_lrs_pay, true);
    lprcat(`pay taxes\nHow much? `);
  }
}



function parse_lrs_pay(amount) {
  amount = Number(amount);

  if (amount > player.GOLD) {
    lprcat(`\n  You don't have that much\n`);
  } else {
    amount = paytaxes(amount);
    player.setGold(player.GOLD - amount);
    lprcat(`\n  You pay ${amount} gold pieces\n`);
  }

  setTimeout(olrs, 700);
}



function olrs() {

  setCharCallback(parse_lrs);

  clear();

  cursor(1, 4);
  lprcat(`Welcome to the ${GAMENAME} Revenue Service district office  `);

  cursor(1, 6);
  if (outstanding_taxes > 0) {
    lprcat(`You presently owe ${outstanding_taxes} gold pieces in taxes  `);
  } else {
    lprcat(`You do not owe us any taxes           `);
  }

  cursor(1, 8);
  if (player.GOLD > 0) {
    lprcat(`You have ${Number(player.GOLD).toLocaleString()} gold pieces    `);
  } else {
    lprcat(`You have no gold pieces  `);
  }

  cursor(1, 20);
  lprcat(`How can we help you? [(<b>p</b>) pay taxes, or <b>escape</b>] `);

  blt();
}








/*
 *
 *
 * COMMON
 *
 *
 */
function exitbuilding() {
  setMazeMode(true);
  return 1;
}



function storemessage(str, duration) {
  if (mazeMode) return;
  cursors();
  cltoeoln();
  lprcat(str);
  cursor(59, 21);
  blt();
  napping = false;
  if (duration && duration != 0) {
    napping = true;
    setTimeout(storemessage, duration, ``, 0);
  }
}



function initpricelist() {
  if (!dnd_item) {
    dnd_item = [];
    for (var i = 0; i < STORE_INVENTORY.length; i++) {
      var tmp = STORE_INVENTORY[i];
      dnd_item[i] = new DNDItem(tmp[0], tmp[1], tmp[2], tmp[3]);
    }
  }
}
