"use strict";


/************************************************/
/* never, ever, never use a code formatter here */
/************************************************/


/* number of items in the dnd inventory table   */
const MAXITM = 83;



var DNDItem = function DNDItem(price, itemId, arg, qty) {
  this.price = price;
  this.itemId = itemId;
  this.arg = arg;
  this.qty = qty;
}



const STORE_INVENTORY = [
/* cost    name                arg  how many */
  [20,     OLEATHER.id,         0,  3],
  [100,    OSTUDLEATHER.id,     0,  2],
  [400,    ORING.id,            0,  2],
  [850,    OCHAIN.id,           0,  2],
  [2200,   OSPLINT.id,          0,  1],
  [4000,   OPLATE.id,           0,  1],
  [9000,   OPLATEARMOR.id,      0,  1],
  [26000,  OSSPLATE.id,         0,  1],
  [1500,   OSHIELD.id,          0,  1],
  [20,     ODAGGER.id,          0,  3],
  [200,    OSPEAR.id,           0,  3],
  [800,    OFLAIL.id,           0,  2],
  [1500,   OBATTLEAXE.id,       0,  2],
  [4500,   OLONGSWORD.id,       0,  2],
  [10000,  O2SWORD.id,          0,  2],
  [50000,  OSWORD.id,           0,  1],
  [165000, OLANCE.id,           0,  1],
  [60000,  OSWORDofSLASHING.id, 0,  0],
  [100000, OHAMMER.id,          0,  0],
  [1500,   OPROTRING.id,        1,  1],
  [850,    OSTRRING.id,         1,  1],
  [1200,   ODEXRING.id,         1,  1],
  [1200,   OCLEVERRING.id,      1,  1],
  [1800,   OENERGYRING.id,      0,  1],
  [1250,   ODAMRING.id,         0,  1],
  [2200,   OREGENRING.id,       0,  1],
  [10000,  ORINGOFEXTRA.id,     0,  1],
  [2800,   OBELT.id,            0,  1],
  [4000,   OAMULET.id,          0,  1],
  [65000,  OORBOFDRAGON.id,     0,  0],
  [55000,  OSPIRITSCARAB.id,    0,  0],
  [50000,  OCUBEofUNDEAD.id,    0,  0],
  [60000,  ONOTHEFT.id,         0,  0],
  [5900,   OCHEST.id,           6,  1],
  [2000,   OBOOK.id,            8,  1],
  [100,    OCOOKIE.id,          0,  3],
  [200,    OPOTION.id,          0,  6],
  [900,    OPOTION.id,          1,  5],
  [5200,   OPOTION.id,          2,  1],
  [1000,   OPOTION.id,          3,  2],
  [500,    OPOTION.id,          4,  2],
  [1500,   OPOTION.id,          5,  2],
  [700,    OPOTION.id,          6,  1],
  [300,    OPOTION.id,          7,  7],
  [2000,   OPOTION.id,          8,  1],
  [500,    OPOTION.id,          9,  1],
  [800,    OPOTION.id,          10, 1],
  [300,    OPOTION.id,          11, 3],
  [200,    OPOTION.id,          12, 5],
  [400,    OPOTION.id,          13, 3],
  [350,    OPOTION.id,          14, 2],
  [5200,   OPOTION.id,          15, 1],
  [900,    OPOTION.id,          16, 2],
  [2000,   OPOTION.id,          17, 2],
  [2200,   OPOTION.id,          18, 4],
  [800,    OPOTION.id,          19, 6],
  [3700,   OPOTION.id,          20, 3],
  [500,    OPOTION.id,          22, 1],
  [1500,   OPOTION.id,          23, 3],
  [1000,   OSCROLL.id,          0,  2],
  [1250,   OSCROLL.id,          1,  2],
  [600,    OSCROLL.id,          2,  4],
  [100,    OSCROLL.id,          3,  4],
  [1000,   OSCROLL.id,          4,  3],
  [2000,   OSCROLL.id,          5,  2],
  [1100,   OSCROLL.id,          6,  1],
  [5000,   OSCROLL.id,          7,  2],
  [2000,   OSCROLL.id,          8,  2],
  [2500,   OSCROLL.id,          9,  4],
  [200,    OSCROLL.id,          10, 5],
  [300,    OSCROLL.id,          11, 3],
  [3400,   OSCROLL.id,          12, 1],
  [3400,   OSCROLL.id,          13, 1],
  [3000,   OSCROLL.id,          14, 2],
  [4000,   OSCROLL.id,          15, 2],
  [5000,   OSCROLL.id,          16, 2],
  [10000,  OSCROLL.id,          17, 1],
  [5000,   OSCROLL.id,          18, 1],
  [3400,   OSCROLL.id,          19, 2],
  [2200,   OSCROLL.id,          20, 3],
  [39000,  OSCROLL.id,          21, 0],
  [6100,   OSCROLL.id,          22, 1],
  [30000,  OSCROLL.id,          23, 0]
];