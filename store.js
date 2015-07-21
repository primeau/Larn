"use strict";


var dndcount = 0;
var dnditm = 0;

/* number of items in the dnd inventory table   */
const MAXITM = 83;


var DND_Item = function DND_Item(price, item, qty) {
  this.price = price;
  this.item = item;
  this.qty = qty;
}

DND_Item.prototype = {
    price: 0,
    item: null,
    qty: 0,
  }

var dnd_item = null;

var _itm = [
/* cost      iven name    iven arg   how
    gp        iven[]      ivenarg[]  many */
  [ 20,      OLEATHER,       0,      3   ],
  [ 100,     OSTUDLEATHER,   0,      2   ],
  [ 400,     ORING,          0,      2   ],
  [ 850,     OCHAIN,         0,      2   ],
  [ 2200,    OSPLINT,        0,      1   ],
  [ 4000,    OPLATE,         0,      1   ],
  [ 9000,    OPLATEARMOR,    0,      1   ],
  [ 26000,   OSSPLATE,       0,      1   ],
  [ 1500,    OSHIELD,        0,      1   ],
  [ 20,      ODAGGER,        0,      3   ],
  [ 200,     OSPEAR,         0,      3   ],
  [ 800,     OFLAIL,         0,      2   ],
  [ 1500,    OBATTLEAXE,     0,      2   ],
  [ 4500,    OLONGSWORD,     0,      2   ],
  [ 10000,   O2SWORD,        0,      2   ],
  [ 50000,   OSWORD,         0,      1   ],
  [ 165000,  OLANCE,         0,      1   ],
  [ 60000, OSWORDofSLASHING, 0,      0   ],
  [ 100000,  OHAMMER,        0,      0   ],
  [ 1500,    OPROTRING,      1,      1   ],
  [ 850,     OSTRRING,       1,      1   ],
  [ 1200,    ODEXRING,       1,      1   ],
  [ 1200,    OCLEVERRING,    1,      1   ],
  [ 1800,    OENERGYRING,    0,      1   ],
  [ 1250,    ODAMRING,       0,      1   ],
  [ 2200,    OREGENRING,     0,      1   ],
  [ 10000,   ORINGOFEXTRA,   0,      1   ],
  [ 2800,    OBELT,          0,      1   ],
  [ 4000,    OAMULET,        0,      1   ],
  [ 65000,   OORBOFDRAGON,   0,      0   ],
  [ 55000,   OSPIRITSCARAB,  0,      0   ],
  [ 50000,   OCUBEofUNDEAD,  0,      0   ],
  [ 60000,   ONOTHEFT,       0,      0   ],
  [ 5900,    OCHEST,         6,      1   ],
  [ 2000,    OBOOK,          8,      1   ],
  [ 100,     OCOOKIE,        0,      3   ],
  [ 200,     OPOTION,        0,      6   ],
  [ 900,     OPOTION,        1,      5   ],
  [ 5200,    OPOTION,        2,      1   ],
  [ 1000,    OPOTION,        3,      2   ],
  [ 500,     OPOTION,        4,      2   ],
  [ 1500,    OPOTION,        5,      2   ],
  [ 700,     OPOTION,        6,      1   ],
  [ 300,     OPOTION,        7,      7   ],
  [ 2000,    OPOTION,        8,      1   ],
  [ 500,     OPOTION,        9,      1   ],
  [ 800,     OPOTION,        10,     1   ],
  [ 300,     OPOTION,        11,     3   ],
  [ 200,     OPOTION,        12,     5   ],
  [ 400,     OPOTION,        13,     3   ],
  [ 350,     OPOTION,        14,     2   ],
  [ 5200,    OPOTION,        15,     1   ],
  [ 900,     OPOTION,        16,     2   ],
  [ 2000,    OPOTION,        17,     2   ],
  [ 2200,    OPOTION,        18,     4   ],
  [ 800,     OPOTION,        19,     6   ],
  [ 3700,    OPOTION,        20,     3   ],
  [ 500,     OPOTION,        22,     1   ],
  [ 1500,    OPOTION,        23,     3   ],
  [ 1000,    OSCROLL,        0,      2   ],
  [ 1250,    OSCROLL,        1,      2   ],
  [ 600,     OSCROLL,        2,      4   ],
  [ 100,     OSCROLL,        3,      4   ],
  [ 1000,    OSCROLL,        4,      3   ],
  [ 2000,    OSCROLL,        5,      2   ],
  [ 1100,    OSCROLL,        6,      1   ],
  [ 5000,    OSCROLL,        7,      2   ],
  [ 2000,    OSCROLL,        8,      2   ],
  [ 2500,    OSCROLL,        9,      4   ],
  [ 200,     OSCROLL,        10,     5   ],
  [ 300,     OSCROLL,        11,     3   ],
  [ 3400,    OSCROLL,        12,     1   ],
  [ 3400,    OSCROLL,        13,     1   ],
  [ 3000,    OSCROLL,        14,     2   ],
  [ 4000,    OSCROLL,        15,     2   ],
  [ 5000,    OSCROLL,        16,     2   ],
  [ 10000,   OSCROLL,        17,     1   ],
  [ 5000,    OSCROLL,        18,     1   ],
  [ 3400,    OSCROLL,        19,     2   ],
  [ 2200,    OSCROLL,        20,     3   ],
  [ 39000,   OSCROLL,        21,     0   ],
  [ 6100,    OSCROLL,        22,     1   ],
  [ 30000,   OSCROLL,        23,     0   ]
 ];



/*
    function for the dnd store
 */

function dndstore() {

  if (dnd_item == null) {
      dnd_item = [];
      for (var i = 0; i < _itm.length; i++) {
        dnd_item[i] = new DND_Item(_itm[i][0], createObject(_itm[i][1], _itm[i][2]), _itm[i][3]);
      }
  }


  dnditm = 0;
  clear();
  lprcat("Welcome to the Larn Thrift Shoppe.  We stock many items explorers find useful\n");
  lprcat(" in their adventures.  Feel free to browse to your hearts content.\n");
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


  // while (1) {

    for (var i = dnditm; i < 26 + dnditm; i++) {
      dnditem(i);
    }

    cursor(50, 18);
    lprcat(`You have ${player.GOLD} gold pieces`);
    cltoeoln();
    cl_dn(1, 20); /* erase to eod */
    lprcat("\nEnter your transaction [");
    standout("space");
    lprcat(" for more, ");
    standout("escape");
    lprcat(" to leave]? ");
    i = 0;
    // while ((i < 'a' || i > 'z') && (i != ' ') && (i != ESC) && (i != 12)) i = ttgetch();
    // // if (i == 12) {
    // //   clear();
    // //   dnd_2hed();
    // //   dnd_hed();
    // // } else
    // if (i == ESC) {
    //   drawscreen();
    //   return;
    // } else if (i == ' ') {
    //   cl_dn(1, 4);
    //   if ((dnditm += 26) >= MAXITM) {
    //     dnditm = 0;
    //   }
    // } else { /* buy something */
    //   lprc(i); /* echo the byte */
    //   i += dnditm - 'a';
    //   if (i >= MAXITM) {
    //     outofstock();
    //   } else if (itm[i].qty <= 0) {
    //     outofstock();
    //   } else if (pocketfull()) {
    //     handsfull();
    //   } else if (player.GOLD < itm[i].price) {
    //     nogold();
    //   } else {
    //     //if (itm[i].mem != 0) * itm[i].mem[itm[i].arg] = ' ';
    //     player.GOLD -= itm[i].price;
    //     itm[i].qty--;
    //     var boughtItem = createObject(itm[i].obj, itm[i].arg);
    //     take(boughtItem); // TODO???
    //     if (boughtItem.matches(OSCROLL)) learnScroll(boughtItem);
    //     if (boughtItem.matches(OPOTION)) learnPotion(boughtItem);
    //     if (itm[i].qty == 0) dnditem(i);
    //     nap(1001);
    //   }
    // }

  // }
}


/*
    function for the players hands are full
 */
function handsfull() {
  lprcat("You can't carry anything more!");
  lflush();
  nap(2200);
}

function outofstock() {
  lprcat("Sorry, but we are out of that item.");
  lflush();
  nap(2200);
}

function nogold() {
  lprcat("You don't have enough gold to pay for that!");
  lflush();
  nap(2200);
}


/*
    dnditem(index)

    to print the item list;  used in dndstore() enter with the index into itm
 */
 function dnditem(i)
 {
   var j, k, price;

   if (i >= MAXITM) return;

   cursor((j = (i & 1) * 40 + 1) , (k = ((i % 26) >> 1) + 5));

   //TODOif (dnd_item_qty[i] == 0) {lprintf("%39s", ""); return;}

   lprintf(`${(i % 26) + 'a'})`);

        if (dnd_item[i].obj == OPOTION) lprintf(`potion of ${dnd_item[i].arg}`);
   else if (dnd_item[i].obj == OSCROLL) lprintf(`scroll of ${dnd_item[i].arg}`);
   else lprintf(`${dnd_item[i].item}`);

   cursor(j + 31, k);

   price = dnd_item[i].price;

   lprintf(`${price}`);
 }
