"use strict";


const KNOWNOT = 0x00;
const HAVESEEN = 0x1;
const KNOWHERE = 0x2;
const KNOWALL = (HAVESEEN | KNOWHERE);





// TODO!
function bot_linex() {}

/*
    bottomline()

    now for the bottom line of the display
 */
// TODO!
function bottomline() {
  recalc();
  // TODO: lots

  cursor(1, 18);

  lprcat(player.getStatString());
  lprc("\n");

  for (var logindex = 0; logindex < LOG.length; logindex++) {
    cltoeoln();
    lprcat(LOG[logindex] + "\n");
  }

  var doc = document.getElementById("STATS");
  if (doc != null)
    document.getElementById("STATS").innerHTML = DEBUG_STATS ? game_stats() : "";
}


const blank = "          ";

// TODO!
function botsideline(stat, name, line) {
  cursor(70, line + 1);
  if (stat > 0) lprcat(name);
  else lprcat(blank);
}

// TODO!
function botside() {
  var line = 0;
  botsideline(player.STEALTH, "stealth", line++);
  botsideline(player.UNDEADPRO, "undead pro", line++);
  botsideline(player.SPIRITPRO, "spirit pro", line++);
  botsideline(player.CHARMCOUNT, "Charm", line++);
  botsideline(player.TIMESTOP, "Time Stop", line++);
  botsideline(player.HOLDMONST, "Hold Monst", line++);
  botsideline(player.GIANTSTR, "Giant Str", line++);
  botsideline(player.FIRERESISTANCE, "Fire Resit", line++);
  botsideline(player.DEXCOUNT, "Dexterity", line++);
  botsideline(player.STRCOUNT, "Strength", line++);
  botsideline(player.SCAREMONST, "Scare", line++);
  botsideline(player.HASTESELF, "Haste Self", line++);
  botsideline(player.CANCELLATION, "Cancel", line++);
  botsideline(player.INVISIBILITY, "Invisible", line++);
  botsideline(player.ALTPRO, "Protect 3", line++);
  botsideline(player.PROTECTIONTIME, "Protect 2", line++);
  botsideline(player.WTW, "Wall-Walk", line++);
}


/*
JRP this is very different from the original code
I was lazy when it came to only partially drawing the screen
and relied on fully repainting everything every move, which
breaks how blindness works. I actually like this behaviour
better, so you're stuck with it.
*/
function drawscreen() {

  clear();

  var know = player.level.know;

  /* When we show a spot of the dungeon, we have 4 cases:
  squares we know nothing about
  - know == 0
  squares we've been at and still know whats there
  - know == KNOWALL (== KNOWHERE | HAVESEEN)
  squares we've been at, but don't still recall because
  something else happened there.
  - know == HAVESEEN
  squares we recall, but haven't been at (an error condition)
  - know == KNOWHERE */

  var blind = player.BLINDCOUNT > 0;

  for (var j = 0; j < MAXY; j++) {
    cursor(1, 1 + j);

    for (var i = 0; i < MAXX; i++) {
      if (know[i][j] == 0) {
        lprc(' ');
      } else if (know[i][j] & HAVESEEN) {
        if (i == player.x && j == player.y) {
          lprc(player.char);
          continue;
        }
        var monster = monsterAt(i, j);
        var item = getItem(i, j);
        if (monster && know[i][j] & KNOWHERE) {
          if (blind)
            lprc(item.getChar())
          else
            lprc(monster.getChar());
        } else {
          if (blind)
            item.matches(OWALL) ? lprc(OWALL.getChar()) : lprc(item.getChar())
          else
            lprc(item.getChar());
        }
      } else {
        lprc(' ');
        //mitem[i][j] = item[i][j] = 0;
      }
    }
  }
}



/* subroutine to display a cell location on the screen */
/* JRP this is quite different from the original, see drawscreen */
function showcell(x, y) {
  if (IN_STORE) return; // TODO HACK

  var blind = player.BLINDCOUNT > 0;

  var minx, maxx, miny, maxy, i, j, m;

  if (blind) {
    minx = x;
    maxx = x;
    miny = y;
    maxy = y;
  } else if (player.AWARENESS > 0) {
    minx = x - 3;
    maxx = x + 3;
    miny = y - 3;
    maxy = y + 3;
  } else {
    minx = x - 1;
    maxx = x + 1;
    miny = y - 1;
    maxy = y + 1;
  }

  minx = vx(minx);
  maxx = vx(maxx);
  miny = vy(miny);
  maxy = vy(maxy);

  var know = player.level.know;

  for (j = miny; j <= maxy; j++) {
    for (m = minx; m <= maxx; m++) {
      if ((know[m][j] & KNOWHERE) == 0) {
        x = maxx;
        while (know[x][j] & KNOWHERE)
          --x;
        for (i = m; i <= x; i++) {
          know[i][j] = KNOWALL;
        }
        m = maxx;
      }
    }
  }

}



/*
    this routine shows only the spot that is given it.  the spaces around
    these coordinated are not shown
    used in godirect() in monster.c for missile weapons display
 */
/* JRP this is quite different from the original, see drawscreen */
function show1cell(x, y) {
  player.level.know[x][y] = KNOWALL;
}



/*
    moveplayer(dir)

    subroutine to move the player from one room to another
    returns 0 if can't move in that direction or hit a monster or on an object
    else returns 1
    nomove is set to 1 to stop the next move (inadvertent monsters hitting
    players when walking into walls) if player walks off screen or into wall
 */

const diroffx = [0, 0, 1, 0, -1, 1, -1, 1, -1];
const diroffy = [0, 1, 0, -1, 0, -1, -1, 1, 1];

/*  from = present room #  direction =
        [1-north] [2-east] [3-south] [4-west]
        [5-northeast] [6-northwest] [7-southeast] [8-southwest]
        if direction=0, don't move--just show where he is */
function moveplayer(dir) {

  if (player.CONFUSE) {
    if (level < rnd(30)) {
      dir = rund(9); /*if confused any dir*/
    }
  }

  var k = player.x + diroffx[dir];
  var m = player.y + diroffy[dir];

  if (k < 0 || k >= MAXX || m < 0 || m >= MAXY) {
    nomove = 1;
    return (0);
  }

  var item = player.level.items[k][m];
  var monster = player.level.monsters[k][m];

  /* prevent the player from moving onto a wall, or a closed door when
     in command mode, unless the character has Walk-Through-Walls.
   */
  if ((item.matches(OCLOSEDDOOR) || item.matches(OWALL)) && player.WTW == 0) {
    nomove = 1;
    return (0);
  }

  if (item.matches(OHOMEENTRANCE)) {
    newcavelevel(0);
    moveNear(OENTRANCE, false);
    return 0;
  }

  /* hit a monster
   */
  if (monster) {
    hitmonster(k, m);
    return (0);
  }

  /* check for the player ignoring an altar when in command mode.
   */
  if (getItem(player.x, player.y).matches(OALTAR) && !prayed) {
    updateLog("  You have ignored the altar!");
    act_ignore_altar();
  }
  prayed = 0;

  lastpx = player.x;
  lastpy = player.y;
  player.x = k;
  player.y = m;

  if (!item.matches(OEMPTY) &&
    !item.matches(OTRAPARROWIV) && !item.matches(OIVTELETRAP) &&
    !item.matches(OIVDARTRAP) && !item.matches(OIVTRAPDOOR)) {
    return (0);
  } else {
    return (1);
  }
}



// move near an item, or on top of it if possible
function moveNear(item, exact) {
  // find the item
  for (var x = 0; x < MAXX; x++) {
    for (var y = 0; y < MAXY; y++) {
      if (isItem(x, y, item)) {
        //debug("movenear: found: " + item.id + " at " + xy(x, y));
        positionplayer(x, y, exact);
        return true;
      }
    }
  }
  debug("movenear: NOT FOUND: " + item.id);
  return false;
} // movenear



var PAGE_COUNT = 1;
const NO_MORE = "nomore";

/*
 *  function to show what magic items have been discovered thus far
 *  enter with -1 for just spells, anything else will give scrolls & potions
 */
function seemagic(onlyspells) {
  IN_STORE = true;

  if (onlyspells) {
    cl_up(79, ((knownSpells.length + 2) / 3 + 4)); /* lines needed for display */
  } else {
    clear();
  }

  cursor(1, 1);

  var buffer = [];

  var spellstring = "  The magic spells you have discovered thus far:";
  var spellfunc = function(spell, buffer) {
    return padString(`${spell} ${spelname[spelcode.indexOf(spell)]}`, -26);
  }
  printknown(spellstring, knownSpells, spellfunc, buffer, true);

  if (!onlyspells) {
    var scrollstring = "  The magic scrolls you have found to date are:";
    var scrollfunc = function(scroll) {
      return padString(`${scrollname[scroll.arg]}`, -26);
    }
    printknown(scrollstring, knownScrolls, scrollfunc, buffer, true);

    var potionstring = "  The magic potions you have found to date are:";
    var potionfunc = function(potion) {
      return padString(`${potionname[potion.arg]}`, -26);
    }
    printknown(potionstring, knownPotions, potionfunc, buffer, false);
  }

  const max = 20;
  if (buffer.length <= max) PAGE_COUNT = 1;
  var startindex = (PAGE_COUNT - 1) * max;
  var endindex = startindex == 0 ? Math.min(max, buffer.length) : buffer.length;
  for (var i = startindex; i < endindex; i++) {
    lprcat(buffer[i] + '\n');
  }
  if (buffer.length <= max || PAGE_COUNT == 2) {
    PAGE_COUNT = NO_MORE;
  }
  if (!onlyspells) lprcat('\n');
  lprcat("Press <b>space</b> to continue \n");
}



function printknown(firstline, itemlist, printfunc, buffer, extra) {
  var sorted_list = itemlist.slice().sort();
  buffer.push(firstline);
  buffer.push("");
  var line = "";
  var count = 0;
  for (var i = 0; i < sorted_list.length; i++) {
    var item = sorted_list[i];
    if (item) {
      line += printfunc(item);
      if (++count % 3 == 0) {
        buffer.push(line);
        line = "";
      }
    }
  }
  if (count % 3 != 0) {
    buffer.push(line);
  }
  if (count == 0) {
    buffer.push("...");
  }
  if (extra) buffer.push("");
}



function parse_see_all(key) {
  nomove = 1;
  if (PAGE_COUNT == NO_MORE) key = ESC;
  if (key == ESC) {
    PAGE_COUNT = 1;
    return exitbuilding();
  }
  if (key == ' ') {
    PAGE_COUNT = 2;
    seemagic(false);
    return 0;
  }
}


function parse_see_spells(key) {
  nomove = 1;
  if (key == ESC || key == ' ') {
    PAGE_COUNT = 1;
    setCharCallback(cast, true);
    return exitbuilding();
  }
}




function updateLog(text) {
  if (DEBUG_OUTPUT) {
    //console.log(`LARN: ${text}`);
  }
  LOG.push(text);
  if (LOG.length > LOG_SIZE) {
    LOG.shift();
  }
}



function appendLog(text) {
  var newText;
  if (text == DEL) {
    newText = LOG.pop();
    newText = newText.substring(0, newText.length - 1);
  } else {
    newText = LOG.pop() + text;
  }
  updateLog(newText);
}
