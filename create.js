"use strict";


/*
    subroutine to put an object into an empty room
 *  uses a random walk
*/
function fillroom(what, arg) {
  var safe = 100;
  var x = rnd(MAXX - 2);
  var y = rnd(MAXY - 2);
  //debug(`fillroom: ${x},${y} ${player.level.items[x][y]}`);
  while (!isItem(x, y, OEMPTY)) {
    x += rnd(3) - 2;
    y += rnd(3) - 2;
    if (x > MAXX - 2) x = 1;
    if (x < 1) x = MAXX - 2;
    if (y > MAXY - 2) y = 1;
    if (y < 1) y = MAXY - 2;
    //debug("fillroom(): safe=" + safe + ": " + x + "," + y + "=" + newItem.char);
    if (safe-- == 0) {
      debug("fillroom: SAFETY!");
      break;
    }
  }
  var newItem = createObject(what, arg);
  player.level.items[x][y] = newItem;
  //debug(`fillroom(): ${newItem}`);
  //debug("fillroom(): safe=" + safe + " " + x + "," + y + " " + player.level.items[x][y].char + " -> " + newItem.char + "(" + newItem.arg + ")");
}


/*
    subroutine to fill in a number of objects of the same kind
 */
function fillmroom(n, what, arg) {
  for (var i = 0; i < n; i++) {
    fillroom(what, arg);
  }
}

function froom(n, itm, arg) {
  if (rnd(151) < n) {
    fillroom(itm, arg);
  }
}



/*
 ***********
    MAKE_OBJECT
 ***********
    subroutine to create the objects in the maze for the given level
 */
function makeobject(level) {

  debug("makeobject: making objects for level " + level.depth);

  if (level.depth == 0) {
    fillroom(OENTRANCE, 0);  /*  entrance to dungeon         */
    fillroom(ODNDSTORE, 0);  /*  the DND STORE               */
    // fillroom(OSCHOOL, 0);    /*  college of Larn             */
    fillroom(OBANK, 0);      /*  1st national bank of larn   */
    fillroom(OVOLDOWN, 0);   /*  volcano shaft to temple     */
    // fillroom(OHOME, 0);      /*  the players home & family   */
    // fillroom(OTRADEPOST, 0); /*  the trading post            */
    // fillroom(OLRS, 0);       /*  the larn revenue service    */
    return;
  }

  if (level.depth == 1) {
    level.items[Math.floor(MAXX / 2)][MAXY - 1] = createObject(OHOMEENTRANCE);
  }
  if (level.depth != 0 && level.depth != 13) {
    fillroom(OSTAIRSDOWN, 0);
  }
  if (level.depth != 0 && level.depth != 11) {
    fillroom(OSTAIRSUP, 0);
  }
  if (level.depth == 11) {
    fillroom(OVOLUP, 0);
  }

  fillmroom(rund(3), OPIT, 0);
  fillmroom(rund(3), OFOUNTAIN, 0);
  fillmroom(rund(2), OMIRROR, 0);
  fillmroom(rund(2), OTHRONE, 0);
  fillmroom(rund(3), OALTAR, 0);
  fillmroom(rund(3), OSTATUE, 0);

  for (var numgold = rnd(12) + 11; numgold > 0; numgold--)
    fillroom(OGOLDPILE, 12 * rnd(level.depth + 1) + (level.depth << 3) + 10);
  for (var numpotions = rnd(4) + 3; numpotions > 0; numpotions--)
    fillroom(OPOTION, newpotion());
  for (var numscrolls = rnd(5) + 3; numscrolls > 0; numscrolls--)
    fillroom(OSCROLL, newscroll());

  froom(2, ORING, 0); /* a ring mail          */
  froom(1, OSTUDLEATHER, 0); /* a studded leather    */
  froom(3, OSPLINT, 0); /* a splint mail        */
  froom(5, OSHIELD, rund(3)); /* a shield             */
  froom(2, OBATTLEAXE, rund(3)); /* a battle axe         */
  froom(5, OLONGSWORD, rund(3)); /* a long sword         */
  froom(5, OFLAIL, rund(3)); /* a flail              */
  froom(4, OREGENRING, rund(3)); /* ring of regeneration */
  froom(1, OPROTRING, rund(3)); /* ring of protection   */
  froom(2, OSTRRING, 1 + rnd(3)); /* ring of strength     */
  froom(7, OSPEAR, rnd(5)); /* a spear              */
  froom(3, OORBOFDRAGON, 0); /* orb of dragon slaying*/
  froom(4, OSPIRITSCARAB, 0); /* scarab of negate spirit*/
  froom(4, OCUBEofUNDEAD, 0); /* cube of undead control   */
  froom(2, ORINGOFEXTRA, 0); /* ring of extra regen      */
  froom(3, ONOTHEFT, 0); /* device of antitheft      */
  froom(2, OSWORDofSLASHING, 0); /* sword of slashing */
  if (player.BESSMANN == 0) {
    froom(4, OHAMMER, 0); /*Bessman's flailing hammer*/
    player.BESSMANN = 1;
  }
  if (player.HARDGAME < 3 || (rnd(4) == 3)) {
    if (level.depth > 3) {
      froom(3, OSWORD, 3); /* sunsword + 3         */
      froom(5, O2SWORD, rnd(4)); /* a two handed sword */
      froom(3, OBELT, 4); /* belt of striking     */
      froom(3, OENERGYRING, 3); /* energy ring          */
      froom(4, OPLATE, 5); /* platemail + 5        */
      froom(3, OCLEVERRING, 1 + rnd(2)); /* ring of cleverness */
    }
  }

  if (level.depth <= 10) {
    let j = level.depth;
    fillmroom(rund(2), ODIAMOND, rnd(10 * j + 1) + 10);
    fillmroom(rund(2), ORUBY, rnd(6 * j + 1) + 6);
    fillmroom(rund(2), OEMERALD, rnd(4 * j + 1) + 4);
    fillmroom(rund(2), OSAPPHIRE, rnd(3 * j + 1) + 2);
  }

} // makeobject()



/*
    subroutine to put monsters into an empty room without walls or other
    monsters
 */
function fillmonst(what) {
  var monster = createNewMonster(what);
  for (var trys = 5; trys > 0; --trys) /* max # of creation attempts */ {
    var x = rnd(MAXX - 2);
    var y = rnd(MAXY - 2);
    //debug(`fillmonst: ${x},${y} ${player.level.items[x][y]}`);
    if ((player.level.items[x][y].matches(OEMPTY)) && //
      (player.level.monsters[x][y] == null) && //
      ((player.x != x) || (player.y != y))) {
      player.level.monsters[x][y] = monster;
      // know[x][y] &= ~KNOWHERE; //TODO what is this for?
      // hitp[x][y] = monster[what].hitpoints;
      return (0);
    }
  }
  return (-1); /* creation failure */
}


/*
    creates an entire set of monsters for a level
    must be done when entering a new level
    if sethp(1) then wipe out old monsters else leave them there
 */
function sethp(flg) {
  // TODO
  // if (flg) {
  //   for (i = 0; i < MAXY; i++) {
  //     for (j = 0; j < MAXX; j++) {
  //       stealth[j][i] = 0;
  //     }
  //   }
  // }

  if (player.level.depth == 0) {
    player.TELEFLAG = 0;
    return;
  } /* if teleported and found level 1 then know level we are on */
  var nummonsters;
  if (flg) {
    nummonsters = rnd(12) + 2 + (player.level.depth >> 1);
  } else {
    nummonsters = (player.level.depth >> 1) + 1;
  }
  for (var i = 0; i < nummonsters; i++) {
    fillmonst(makemonst(player.level.depth));
  }
}
