"use strict";



/* number of items in the dnd inventory table   */
const MAXITM = 83;

var DND_Item = function DND_Item(price, itemId, arg, qty) {
  this.price = price;
  this.itemId = itemId;
  this.arg = arg;
  this.qty = qty;
}

var _itm = [
  /* cost      iven name    iven arg   how
      gp        iven[]      ivenarg[]  many */
  [20, OLEATHER.id, 0, 3],
  [100, OSTUDLEATHER.id, 0, 2],
  [400, ORING.id, 0, 2],
  [850, OCHAIN.id, 0, 2],
  [2200, OSPLINT.id, 0, 1],
  [4000, OPLATE.id, 0, 1],
  [9000, OPLATEARMOR.id, 0, 1],
  [26000, OSSPLATE.id, 0, 1],
  [1500, OSHIELD.id, 0, 1],
  [20, ODAGGER.id, 0, 3],
  [200, OSPEAR.id, 0, 3],
  [800, OFLAIL.id, 0, 2],
  [1500, OBATTLEAXE.id, 0, 2],
  [4500, OLONGSWORD.id, 0, 2],
  [10000, O2SWORD.id, 0, 2],
  [50000, OSWORD.id, 0, 1],
  [165000, OLANCE.id, 0, 1],
  [60000, OSWORDofSLASHING.id, 0, 0],
  [100000, OHAMMER.id, 0, 0],
  [1500, OPROTRING.id, 1, 1],
  [850, OSTRRING.id, 1, 1],
  [1200, ODEXRING.id, 1, 1],
  [1200, OCLEVERRING.id, 1, 1],
  [1800, OENERGYRING.id, 0, 1],
  [1250, ODAMRING.id, 0, 1],
  [2200, OREGENRING.id, 0, 1],
  [10000, ORINGOFEXTRA.id, 0, 1],
  [2800, OBELT.id, 0, 1],
  [4000, OAMULET.id, 0, 1],
  [65000, OORBOFDRAGON.id, 0, 0],
  [55000, OSPIRITSCARAB.id, 0, 0],
  [50000, OCUBEofUNDEAD.id, 0, 0],
  [60000, ONOTHEFT.id, 0, 0],
  [5900, OCHEST.id, 6, 1],
  [2000, OBOOK.id, 8, 1],
  [100, OCOOKIE.id, 0, 3],
  [200, OPOTION.id, 0, 6],
  [900, OPOTION.id, 1, 5],
  [5200, OPOTION.id, 2, 1],
  [1000, OPOTION.id, 3, 2],
  [500, OPOTION.id, 4, 2],
  [1500, OPOTION.id, 5, 2],
  [700, OPOTION.id, 6, 1],
  [300, OPOTION.id, 7, 7],
  [2000, OPOTION.id, 8, 1],
  [500, OPOTION.id, 9, 1],
  [800, OPOTION.id, 10, 1],
  [300, OPOTION.id, 11, 3],
  [200, OPOTION.id, 12, 5],
  [400, OPOTION.id, 13, 3],
  [350, OPOTION.id, 14, 2],
  [5200, OPOTION.id, 15, 1],
  [900, OPOTION.id, 16, 2],
  [2000, OPOTION.id, 17, 2],
  [2200, OPOTION.id, 18, 4],
  [800, OPOTION.id, 19, 6],
  [3700, OPOTION.id, 20, 3],
  [500, OPOTION.id, 22, 1],
  [1500, OPOTION.id, 23, 3],
  [1000, OSCROLL.id, 0, 2],
  [1250, OSCROLL.id, 1, 2],
  [600, OSCROLL.id, 2, 4],
  [100, OSCROLL.id, 3, 4],
  [1000, OSCROLL.id, 4, 3],
  [2000, OSCROLL.id, 5, 2],
  [1100, OSCROLL.id, 6, 1],
  [5000, OSCROLL.id, 7, 2],
  [2000, OSCROLL.id, 8, 2],
  [2500, OSCROLL.id, 9, 4],
  [200, OSCROLL.id, 10, 5],
  [300, OSCROLL.id, 11, 3],
  [3400, OSCROLL.id, 12, 1],
  [3400, OSCROLL.id, 13, 1],
  [3000, OSCROLL.id, 14, 2],
  [4000, OSCROLL.id, 15, 2],
  [5000, OSCROLL.id, 16, 2],
  [10000, OSCROLL.id, 17, 1],
  [5000, OSCROLL.id, 18, 1],
  [3400, OSCROLL.id, 19, 2],
  [2200, OSCROLL.id, 20, 3],
  [39000, OSCROLL.id, 21, 0],
  [6100, OSCROLL.id, 22, 1],
  [30000, OSCROLL, 23, 0]
];



/*
 *
 *
 * DND STORE
 *
 *
 */

var dndindex = 0;

function dndstore() {

  initpricelist();

  clear();

  lprcat("Welcome to the Larn Thrift Shoppe.  We stock many items explorers find useful\n");
  lprcat("in their adventures.  Feel free to browse to your hearts content.\n");
  lprcat("Also be advised, if you break 'em, you pay for 'em.");

  // TODO
  // if (outstanding_taxes > 0) {
  //   lprcat("\n\nThe Larn Revenue Service has ordered us to not do business with tax evaders.\n");
  //   beep();
  //   lprintf("They have also told us that you owe %d gp in back taxes, and as we must\n", (long) outstanding_taxes);
  //   lprcat("comply with the law, we cannot serve you at this time.  Soo Sorry.\n");
  //   cursors();
  //   lprcat("\nPress ");
  //   standout("escape");
  //   lprcat(" to leave: ");
  //   lflush();
  //   i = 0;
  //   while (i != '\33') i = ttgetch();
  //   drawscreen();
  //   nosignal = 0; /* enable signals */
  //   return;
  // }

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
  lprcat("\n\nEnter your transaction [<b>space</b> for more, <b>escape</b> to leave] ");
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
      storemessage("Sorry, but we are out of that item.", 700);
    } else if (dnd_item[i].qty <= 0) {
      storemessage("Sorry, but we are out of that item.", 700);
    } else if (pocketfull()) {
      storemessage("You can't carry anything more!", 700);
    } else if (player.GOLD < dnd_item[i].price) {
      storemessage("You don't have enough gold to pay for that!", 700);
    } else {
      player.GOLD -= dnd_item[i].price;
      dnd_item[i].qty--;
      var boughtItem = createObject(dnd_item[i].itemId, dnd_item[i].arg);
      take(boughtItem);
      var invindex = getCharFromIndex(player.inventory.indexOf(boughtItem));
      if (boughtItem.matches(OSCROLL)) learnScroll(boughtItem);
      if (boughtItem.matches(OPOTION)) learnPotion(boughtItem);
      storemessage(`  You pick up: ${invindex}) ${boughtItem}`, 1000);
      if (dnd_item[i].qty == 0) dnditem(i);
      updategold();
      lprc(key); /* echo the byte */
      nap(1001);
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
    lprintf("", 39);
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
 * BANK
 *
 *
 */



/*
 *  for the first national bank of Larn
 */

function obank() {
  banktitle("Welcome to the First National Bank of Larn.");
}


function obank2() {
  banktitle("Welcome to the 5th level branch office of the First National Bank of Larn.");
  /* because we state the level in the title, clear the '?' in the
     level display at the bottom, if the user teleported.
  */
  player.TELEFLAG = 0;
}


function banktitle(str) {
  clear();
  lprcat(str);
  // TODO
  // if (outstanding_taxes > 0) {
  //   register int i;
  //   lprcat("\n\nThe Larn Revenue Service has ordered that your account be frozen until all\n");
  //   beep();
  //   lprintf("levied taxes have been paid.  They have also told us that you owe %d gp in\n", (long) outstanding_taxes);
  //   lprcat("taxes, and we must comply with them. We cannot serve you at this time.  Sorry.\n");
  //   lprcat("We suggest you go to the LRS office and pay your taxes.\n");
  //   cursors();
  //   lprcat("\nPress ");
  //   standout("escape");
  //   lprcat(" to leave: ");
  //   lflush();
  //   i = 0;
  //   while (i != '\33') i = ttgetch();
  //   drawscreen();
  //   nosignal = 0; /* enable signals */
  //   return;
  // }
  lprcat("\n\n   Gemstone                 Appraisal      Gemstone                 Appraisal");
  obanksub();
  //drawscreen();
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
    if (item != null && (item.isGem() || item.matches(OLARNEYE))) {
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
  lprcat("\nYour wish? [(<b>d</b>) deposit, (<b>w</b>) withdraw, (<b>s</b>) sell a stone, or <b>escape</b>] ");

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
    lprcat("\n\nNote: Larndom law states that only deposits under 500,000gp can earn interest");
}



function bank_parse(key) {
  if (key == ESC) {
    return exitbuilding();
  }

  if (key == 'd') {
    lprcat("deposit\n");
    cltoeoln();
    lprcat("How much? [<b>*</b> for all] ");
    setNumberCallback(bank_deposit, true);
  }

  if (key == 'w') {
    lprcat("withdraw\n");
    cltoeoln();
    lprcat("How much? [<b>*</b> for all] ");
    setNumberCallback(bank_withdraw, true);
  }

  if (key == 's') {
    lprcat("sell\n");
    cltoeoln();
    lprcat("Which stone would you like to sell? [<b>*</b> for all] ");
    setCharCallback(bank_sell);
  }
}



function bankmessage(str, duration) { //TODO convert to storemessage?
  if (!IN_STORE) return;

  if (duration == "")
    cl_dn(1, 23);
  else
    cl_dn(1, 24);
  bank_print_gold();
  cursor(1, 24);
  lprcat(str);
  cursor(69, 22);
  cltoeoln();

  setCharCallback(bank_parse);

  blt();

  napping = false;

  if (duration != null && duration != 0) {
    napping = true;
    setTimeout(bankmessage, duration, "", 0);
  }
}



function bank_deposit(amt) {
  if (amt == ESC) {
    bankmessage("  cancelled", 700);
    return 0;
  }

  if (amt == '*') {
    amt = player.GOLD;
  }

  amt = Number(amt);

  if (amt < 0) {
    bankmessage("Sorry, but we can't take negative gold!", 700);
  } else if (amt > player.GOLD) {
    bankmessage("You don't have that much.", 700);
  } else {
    player.GOLD -= amt;
    player.BANKACCOUNT += amt;
    bankmessage("", 700);
  }
  return 0;
}



function bank_withdraw(amt) {
  if (amt == ESC) {
    bankmessage("  cancelled", 700);
    return 0;
  }

  if (amt == '*') {
    amt = player.BANKACCOUNT;
  }

  amt = Number(amt);

  if (amt < 0) {
    bankmessage("Sorry, but we don't have any negative gold!", 700);
  } else if (amt > player.BANKACCOUNT) {
    bankmessage("You don't have that much in the bank!", 700);
  } else {
    player.GOLD += amt;
    player.BANKACCOUNT -= amt;
    bankmessage("", 700);
  }
  return 0;
}



function bank_sell(key) {
  if (key == ESC) {
    bankmessage("  cancelled", 700);
  } else if (key == '*') {
    var gems_sold = false;
    for (i = 0; i < 26; i++) {
      if (gemvalue[i]) {
        gems_sold = true;
        player.GOLD += gemvalue[i];
        player.inventory[i] = null;
        gemvalue[i] = 0;
        var k = gemorder[i];
        cursor((k % 2) * 40 + 1, (k >> 1) + 4);
        lprintf("", 39);
        bankmessage("", 700);
      }
    }
    if (!gems_sold) {
      bankmessage("You have no gems to sell!", 700);
    }
  } else {
    var i = getIndexFromChar(key);
    if (i >= 0 && i <= 26) {
      if (gemvalue[i] == 0) {
        bankmessage(`Item ${getCharFromIndex(i)} is not a gemstone!`, 700);
      } else {
        player.GOLD += gemvalue[i];
        player.inventory[i] = null;
        gemvalue[i] = 0;
        var k = gemorder[i];
        cursor((k % 2) * 40 + 1, (k >> 1) + 4);
        lprintf("", 39);
        bankmessage("", 700);
      }
    }
  }
  return 0;
}



/* function to put interest on your bank account */
function ointerest() { // TODO IS THIS WORKING?
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
 * TRADING POST
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
      var fancy = !item.isRing();
      lprcat(`${getCharFromIndex(i)}) ${item.toString(fancy)}`);

    } else {
      tradorder[i] = 0; /* make sure order array is clear */
    }
  } // for
}


function otradepost() {
  setCharCallback(parse_tradepost);
  initpricelist();

  clear();

  lprcat("Welcome to the Larn Trading Post. We buy items that explorers no longer find\n");
  lprcat("useful. Since the condition of the items you bring in is not certain,\n");
  lprcat("and we incur great expense in reconditioning the items, we usually pay\n");
  lprcat("only 20% of their value were they to be new. If the items are badly\n");
  lprcat("damaged, we will pay only 10% of their new value.\n\n");

  lprcat("Here are the items we would be willing to buy from you:\n");

  otradiven();

  cl_dn(1, 21);

  lprcat("\nWhat item do you want to sell to us? [Press <b>escape</b> to leave] ");
}



function cleartradiven(i) {
  var j = tradorder[i];
  cursor((j % 2) * 40 + 1, (j >> 1) + 8);
  lprintf(" ", 39);
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
    if (item == null) {
      storemessage(`You don't have item ${key}!`, 700);
      //nap(2000);
      return 0;
    }
    if (item.matches(OSCROLL) && !isKnownScroll(item) ||
      item.matches(OPOTION) && !isKnownPotion(item)) {
      storemessage("Sorry, we can't accept unidentified objects", 700);
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
        storemessage("Sorry, we can't accept unidentified objects", 700);
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
    storemessage("Sorry, but we are not authorized to accept that item", 700);
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
    lprcat("no thanks");
    //nap(500);

    napping = true;
    setTimeout(storemessage, 700, "");
    itemToSell = null;
    return 1;
  }
  if (key == 'Y' || key == 'y') {
    cursor(63 + itemToSell[SELL_PRICE].toString().length, 24);
    setCharCallback(parse_tradepost);
    lprcat("yes");

    napping = true;
    setTimeout(storemessage, 700, "");
    player.GOLD += itemToSell[SELL_PRICE];
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
 * SCHOOL
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
  lprcat("What is your choice? [Press <b>escape</b> to leave] ");

  blt();
}



function printclasses() {
  cl_up(1, 18);
  cursor(1, 1);
  lprcat("The College of Larn offers the exciting opportunity of higher education to\n");
  lprcat("all inhabitants of the caves. Here is the class schedule:\n\n\n");
  lprcat("\t\t    Course Name               Time Needed\n\n");

  if (course[0] == null) lprcat("\t\ta)  Fighter Training I          10 mobuls");
  lprc('\n');
  if (course[1] == null) lprcat("\t\tb)  Fighter Training II         15 mobuls");
  lprc('\n');
  if (course[2] == null) lprcat("\t\tc)  Introduction to Wizardry    10 mobuls");
  lprc('\n');
  if (course[3] == null) lprcat("\t\td)  Applied Wizardry            20 mobuls");
  lprc('\n');
  if (course[4] == null) lprcat("\t\te)  Behavioral Psychology       10 mobuls");
  lprc('\n');
  if (course[5] == null) lprcat("\t\tf)  Faith for Today             10 mobuls");
  lprc('\n');
  if (course[6] == null) lprcat("\t\tg)  Contemporary Dance          10 mobuls");
  lprc('\n');
  if (course[7] == null) lprcat("\t\th)  History of Larn              5 mobuls");

  lprcat("\n\n\t\tAll courses cost 250 gold pieces");
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

  if (i < 0 || i >= 8 || course[i] != null) {
    lprcat("\nSorry, but that class is filled");
  } else if (player.GOLD < 250) {
    lprcat("\nYou don't have enough gold to pay for that!");
  } else {
    player.GOLD -= 250;
    var time_used = 0;

    switch (key) {
      case 'a':
        player.STRENGTH += 2;
        player.CONSTITUTION++;
        lprcat("\nYou feel stronger!");
        break;

      case 'b':
        if (course[0] == null) {
          player.GOLD += 250;
          time_used = -10000;
          lprcat("\nSorry, but this class has a prerequisite of Fighter Training I");
          break;
        }
        player.STRENGTH += 2;
        player.CONSTITUTION += 2;
        lprcat("\nYou feel much stronger!");
        break;

      case 'c':
        player.INTELLIGENCE += 2;
        lprcat("\nThe task before you now seems more attainable!");
        break;

      case 'd':
        if (course[2] == null) {
          player.GOLD += 250;
          time_used = -10000;
          lprcat("\nSorry, but this class has a prerequisite of Introduction to Wizardry");
          break;
        }
        player.INTELLIGENCE += 2;
        lprcat("\nThe task before you now seems very attainable!");
        break;

      case 'e':
        player.CHARISMA += 3;
        lprcat("\nYou now feel like a born leader!");
        break;

      case 'f':
        player.WISDOM += 2;
        lprcat("\nYou now feel more confident that you can find the potion in time!");
        break;

      case 'g':
        player.DEXTERITY += 3;
        lprcat("\nYou feel like dancing!");
        break;

      case 'h':
        player.INTELLIGENCE++;
        lprcat("\nYour instructor told you that the Eye of Larn is rumored to be guarded");
        lprcat("\nby a platinum dragon who possesses psionic abilities");
        break;
    }

    time_used += coursetime[i] * 100;

    if (time_used > 0) {
      gtime += time_used;
      course[i] = 1; /* remember that he has taken that course */
      player.HP = player.HPMAX;
      player.SPELLS = player.SPELLMAX; /* he regenerated */
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







function ohome() {

  dropflag = 1;

  setCharCallback(parse_home);

  for (var i = 0; i < 26; i++) {
    var item = player.inventory[i];
    if (item != null && item.matches(OPOTION) && item.arg == 21) {
      //iven[i] = 0; /* remove from inventory */
      if (gtime > TIMELIMIT) {
        IN_STORE = false; // HACK?
        updateLog("Congratulations. You found a potion of cure dianthroritis. Frankly, no one");
        updateLog("thought you could do it. Boy! Did you surprise them! The doctor has the sad");
        updateLog("duty to inform you that your daughter died before your return. There was");
        updateLog("nothing that could be done without the potion.");
        died(269, false);
        return;
      } else {
        IN_STORE = false; // HACK?
        updateLog("Congratulations. You found a potion of cure dianthroritis. Frankly, no one");
        updateLog("thought you could do it. Boy! Did you surprise them! The doctor is now");
        updateLog("administering the potion, and in a few moments your daughter should be well");
        updateLog("on her way to recovery.");

        updateLog("Press <b>enter</b> to continue: ");

        setCharCallback(win);
        return;
      }
    }
  }

  if (gtime > TIMELIMIT) {
    IN_STORE = false; // HACK?
    updateLog(`Welcome home ${logname}.`);
    updateLog("The latest word from the doctor is not good.");
    updateLog("The doctor has the sad duty to inform you that your daughter died! You didn't");
    updateLog("make it in time. There was nothing that could be done without the potion.");
    died(269, false);
    return;
  }

  clear();

  cursor(1, 7);

  lprcat(`\tWelcome home ${logname}.`);
  lprcat("\n\n\tThe latest word from the doctor is not good.");
  lprcat("\n\n\tThe diagnosis is confirmed as dianthroritis. The doctor guesses that");
  lprcat(`\n\tyour daughter has only ${timeleft()} mobuls left in this world. It's up to you,`);
  lprcat(`\n\t${logname}, to find the only hope for your daughter, the`);
  lprcat("\n\tvery rare potion of cure dianthroritis. It is rumored that only deep");
  lprcat("\n\tin the depths of the caves can this potion be found.");

  lprcat("\n\n\tPress <b>escape</b> to leave: ");

  paint();

}

function parse_home(key) {
  if (key == ESC && !GAME_OVER) {
    return exitbuilding();
  }
}

function win(key) {
  if (key != ENTER) {
    return 0;
  }

  napping = true;
  updateLog("");
  updateLog("");
  updateLog("");
  updateLog("");
  updateLog("");
  updateLog("The potion is ");

  setTimeout(function() {
    appendLog("working!");
    paint();
    setTimeout(function() {
      updateLog("");
      updateLog("");
      updateLog("The doctor thinks that your daughter will recover in a few days.");
      paint();
      setTimeout(function() {
        updateLog("Congratulations!");
        paint();
        napping = false;
        died(263, false);
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
    lprcat("pay taxes\nHow much? ");
  }
}



function parse_lrs_pay(amount) {
  amount = Number(amount);

  if (amount > player.GOLD) {
    lprcat("\n  You don't have that much\n");
  } else {
    amount = paytaxes(amount);
    player.GOLD -= amount;
    lprcat(`\n  You pay ${amount} gold pieces\n`);
  }

  setTimeout(olrs, 700);
}



function olrs() {

  setCharCallback(parse_lrs);

  clear();

  cursor(1, 4);
  lprcat("Welcome to the Larn Revenue Service district office  ");

  cursor(1, 6);
  if (outstanding_taxes > 0) {
    lprcat(`You presently owe ${outstanding_taxes} gold pieces in taxes  `);
  } else {
    lprcat("You do not owe us any taxes           ");
  }

  cursor(1, 8);
  if (player.GOLD > 0) {
    lprcat(`You have ${Number(player.GOLD).toLocaleString()} gold pieces    `);
  } else {
    lprcat("You have no gold pieces  ");
  }

  cursor(1, 20);
  lprcat("How can we help you? [(<b>p</b>) pay taxes, or <b>escape</b>] ");

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
  IN_STORE = false;
  clear();
  //drawscreen();
  paint();
  return 1;
}



function storemessage(str, duration) {
  if (!IN_STORE) return;

  cursors();
  cltoeoln();
  lprcat(str);
  cursor(59, 21);

  blt();

  napping = false;

  if (duration != null && duration != 0) {
    napping = true;
    setTimeout(storemessage, duration, "", 0);
  }
}



function initpricelist() {
  if (dnd_item == null) {
    dnd_item = [];
    for (var i = 0; i < _itm.length; i++) {
      dnd_item[i] = new DND_Item(_itm[i][0], _itm[i][1], _itm[i][2], _itm[i][3]);
    }
  }
}
