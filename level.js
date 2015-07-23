"use strict";

const MAXX = 67;
const MAXY = 17;

var Level = {

  depth: -1,
  items: [],
  monsters: [],

  create: function(depth) {
    var mazeTemplate = createRandomMaze(depth);

    this.items = initGrid(MAXX, MAXY);
    this.monsters = initGrid(MAXX, MAXY);

    this.depth = depth;

    let wall = createObject(OWALL); // TODO THIS IS BECAUSE I AM DUMB AND DON'T UNDERSTAND OBJECTS
    let empty = createObject(OEMPTY); // TODO THIS IS BECAUSE I AM DUMB AND DON'T UNDERSTAND OBJECTS

    for (var x = 0; x < MAXX; x++) {
      for (var y = 0; y < MAXY; y++) {
        switch (mazeTemplate[x][y]) {
          case '#':
            // this.items[x][y] = createObject(OWALL); //
            // this.items[x][y] = OWALL; // TODO: this is what I should do
            this.items[x][y] = wall; // TODO
            break;
          case 'D':
            this.items[x][y] = createObject(OCLOSEDDOOR, rnd(30));
            break;
          case '-':
            this.items[x][y] = newobject(depth + 1);
            debug(`- ${this.items[x][y]}`);
            break;
          case '.':
            if (depth < MAXLEVEL) break;
            this.monsters[x][y] = createNewMonster(makemonst(depth + 1));
            debug(`. ${this.monsters[x][y]}`);
            break;
          case '~':
            if (depth != MAXLEVEL - 1) break;
            this.items[x][y] = createObject(OLARNEYE);
            this.monsters[x][y] = createNewMonster(rund(8) + DEMONLORD);
            debug(`~ ${this.items[x][y]}`);
            debug(`~ ${this.monsters[x][y]}`);
            break;
          case '!':
            if (depth != MAXLEVEL + MAXVLEVEL - 1) break;
            this.items[x][y] = createObject(OPOTION, 21);
            this.monsters[x][y] = createNewMonster(DEMONPRINCE);
            debug(`! ${this.items[x][y]}`);
            debug(`! ${this.monsters[x][y]}`);
            break;
        } // switch
        if (this.items[x][y] == null)
        // this.items[x][y] = createObject(OEMPTY);
        // this.items[x][y] = OEMPTY; // TODO
          this.items[x][y] = empty; // TODO
      } // for
    } // for
  }, // create


  paint: function() {

    if (IN_STORE) {
      drawstore();
    } else {
      drawmaze();
    }

  },


}; // Level


// TODO!
function bot_linex() {}

//TODO!
function drawscreen() {
  player.level.paint();
}

function drawstore() {

  var output = "";

  for (var y = 0; y < 24; y++) {
    for (var x = 0; x < 80; x++) {
      output += display[x][y] != null ? display[x][y] : ' ';
    } // inner for
    output += "\n";
  } // outer for

  document.getElementById("LARN").innerHTML = output;

  var doc = document.getElementById("STATS");
  if (doc != null)
    document.getElementById("STATS").innerHTML = DEBUG_STATS ? game_stats() : "";


}



function drawmaze() {
  var level = player.level;
  var output = "";

  cursor(1, 1);
  for (var y = 0; y < MAXY; y++) {
    for (var x = 0; x < MAXX; x++) {
      // HACK
      // HACK
      // HACK
      if (x != player.x || y != player.y) {
        if (level.monsters[x][y] != null) {
          lprc(monsterlist[level.monsters[x][y].arg].char);
        } else {
          //debug(`drawmaze: ${x},${y} ${player.level.items[x][y]}`);
          lprc(level.items[x][y].char);
        }
      } else {
        lprc(`▓`); // http://www.iam.uni-bonn.de/~alt/html/unicode_172.html
      }
      // HACK
      // HACK
      // HACK
    } // inner for
    lprc("\n");
  } // outer for

  bottomline();

  // TODO: move to bottomline()?
  lprcat(player.getStatString());
  lprc("\n");

  for (var logindex = 0; logindex < LOG.length; logindex++) {
    cltoeoln();
    lprcat(LOG[logindex] + "\n");
  }

  drawstore();

  //document.getElementById("LARN").innerHTML = output;

  var doc = document.getElementById("STATS");
  if (doc != null)
    document.getElementById("STATS").innerHTML = DEBUG_STATS ? game_stats() : "";
}


/*
    newcavelevel(level)
    int level;

    function to enter a new level.  This routine must be called anytime the
    player changes levels.  If that level is unknown it will be created.
TODO    A new set of monsters will be created for a new level, and existing
    levels will get a few more monsters.
TODO    Note that it is here we remove genocided monsters from the present level.
 */


function newcavelevel(depth) {

  let beenhere = LEVELS[depth] instanceof Level.constructor;

  if (beenhere) {
    savelevel(); /* put the level back into storage  */
  }
  //level = depth; /* get the new level and put in working storage */
  if (beenhere) {
    getlevel(depth);
    sethp(false);
    // positionplayer();
    positionplayer(player.x, player.y, true);
    //checkgen(); TODO
    player.level.paint();
    return;
  }

  // TODO
  // /* fill in new level
  //  */
  // for (i = 0; i < MAXY; i++)
  //   for (j = 0; j < MAXX; j++)
  //     know[j][i] = mitem[j][i] = 0;

  // TODO
  // makemaze(x);
  // makeobject(x);
  // beenhere[x] = 1;
  // sethp(1);
  // positionplayer();
  // checkgen(); /* wipe out any genocided monsters */

  // TODO
  // if (wizard || x == 0)
  //   for (j = 0; j < MAXY; j++)
  //     for (i = 0; i < MAXX; i++)
  //       know[i][j] = KNOWALL;

  var newLevel = Object.create(Level);
  newLevel.create(depth);
  LEVELS[depth] = newLevel;
  player.level = LEVELS[depth];
  sethp(true);
  makeobject(newLevel);
  positionplayer(player.x, player.y, true);

  player.level.paint();
}
