"use strict";


var dndcount = 0;
var dnditm = 0;

/* number of items in the dnd inventory table   */
const MAXITM = 83;



/*
    function for the dnd store
 */
function dnd_2hed() {
  lprcat("Welcome to the Larn Thrift Shoppe.  We stock many items explorers find useful");
  lprcat(" in their adventures.  Feel free to browse to your hearts content.");
  lprcat("Also be advised, if you break 'em, you pay for 'em.");
}

function dnd_hed() {
  for (var i = dnditm; i < 26 + dnditm; i++) {
    dnditem(i);
  }
  cursor(50, 18);
  lprcat("You have ");
}

function dndstore() {
  dnditm = 0;
  nosignal = 1; /* disable signals */
  clear();
  dnd_2hed();
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

  dnd_hed();

  while (1) {
    cursor(59, 18);
    lprintf("%d gold pieces", (long) c[GOLD]);
    cltoeoln();
    cl_dn(1, 20); /* erase to eod */
    lprcat("\nEnter your transaction [");
    standout("space");
    lprcat(" for more, ");
    standout("escape");
    lprcat(" to leave]? ");
    i = 0;
    while ((i < 'a' || i > 'z') && (i != ' ') && (i != '\33') && (i != 12)) i = ttgetch();
    if (i == 12) {
      clear();
      dnd_2hed();
      dnd_hed();
    } else if (i == '\33') {
      drawscreen();
      nosignal = 0; /* enable signals */
      return;
    } else if (i == ' ') {
      cl_dn(1, 4);
      if ((dnditm += 26) >= MAXITM) {
        dnditm = 0;
      }
      dnd_hed();
    } else { /* buy something */
      lprc(i); /* echo the byte */
      i += dnditm - 'a';
      if (i >= MAXITM) {
        outofstock();
      } else
      if (itm[i].qty <= 0) {
        outofstock();
      } else
      if (pocketfull()) {
        handsfull();
      } else
      if (c[GOLD] < (long) itm[i].price * 10) {
        nogold();
      } else {
        if (itm[i].mem != 0) * itm[i].mem[itm[i].arg] = ' ';
        c[GOLD] -= (long) itm[i].price * 10;
        itm[i].qty--;
        take(itm[i].obj, itm[i].arg);
        if (itm[i].qty == 0) dnditem(i);
        nap(1001);
      }
    }

  }
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
function dnditem(i) {
  register int j, k;
  if (i >= MAXITM) return;
  cursor((j = (i & 1) * 40 + 1), (k = ((i % 26) >> 1) + 5));
  if (itm[i].qty == 0) {
    lprintf("%39s", "");
    return;
  }
  lprintf("%c) ", (i % 26) + 'a');
  if (itm[i].obj == OPOTION) {
    lprcat("potion of ");
    lprintf("%s", & potionname[itm[i].arg][1]);
  } else if (itm[i].obj == OSCROLL) {
    lprcat("scroll of ");
    lprintf("%s", & scrollname[itm[i].arg][1]);
  } else lprintf("%s", objectname[itm[i].obj]);
  cursor(j + 31, k);
  lprintf("%6d", (long) itm[i].price * 10);
}
