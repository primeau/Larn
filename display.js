'use strict';


const KNOWNOT = 0x00;
const HAVESEEN = 0x1;
const KNOWHERE = 0x2;
const KNOWALL = (HAVESEEN | KNOWHERE);



function paint() {
  if (mazeMode) {
    drawmaze();
    botside();
    bottomline();
  }

  printStats();
  blt();

  DEBUG_PAINT++;
}



function blt() {
  if (amiga_mode) {
    // do nothing
  } else {
    // TODO: setup for not repainting in text mode
    // TODO: need to update io.js:os_put_font(), display.js:blt(), larn.js:play()
    // TODO: this will break scoreboard rendering
    if (altrender) {
      // do nothing
    }
    else {
      bltDocument();
    }
  }
}



let alternativeDisplay;
function detachDisplay() {
  display = null;
  alternativeDisplay = ` `;
}

function bltDocument() {
  var output = alternativeDisplay;
  if (!output) {
    output = ``;
    for (var y = 0; y < 24; y++) {
      for (var x = 0; x < 80; x++) {
        output += display[x][y] != null ? display[x][y] : ' ';
      } // inner for
      output += `\n`;
    } // outer for
  }
  setDiv(`LARN`, output);
}



function setMazeMode(mode) {
  mazeMode = mode;
  clear();
  paint();
}



function setChar(x, y, c, markup) {
  setDiv(`${x},${y}`, c, markup);
}



function createDiv(x, y, w, h) {
  if (!w) w = 12;
  if (!h) h = w * 2;
  var callback = ``;
  if (mobile) {
    var key = `.`;
    if (x < 22 && y <= 5) key = `y`;
    else if (x <= 44 && y <= 5) key = `k`;
    else if (x <= 67 && y <= 5) key = `u`;
    else if (x < 22 && y <= 11) key = `h`;
    else if (x <= 44 && y <= 11) key = `.`;
    else if (x <= 67 && y <= 11) key = `l`;
    else if (x < 22 && y <= 16) key = `b`;
    else if (x <= 44 && y <= 16) key = `j`;
    else if (x <= 67 && y <= 16) key = `n`;
    callback = ` onclick='mousetrap(null, "${key}")'`;
  }
  return `<div id='${x},${y}' class='image' style="width:${w}px; height:${h}px;"${callback}> </div>`;
}



function setDiv(id, data, markup) {
  var div = document.getElementById(id);
  if (div) {
    // optimization:
    // most of the time, we're just repainting the same data into each div.
    // therefore, only repaint when the data is different, or there
    // is a BOLD being applied where there wasn't one before
    //
    // START_MARK is still a special snowflake for amiga mode though
    if (data === div.innerHTML && markup != START_MARK) {
      if (markup != START_BOLD && div.style.fontWeight == 'normal' ||
        markup == START_BOLD && div.style.fontWeight == 'bold') {
        return;
      }
    }
    // else {
    //   console.log("DATA: " + data);
    //   console.log("DOC:  " + doc.innerHTML);
    // }
    div.innerHTML = data;
    if (markup == START_BOLD) {
      div.style.fontWeight = 'bold';
    } else if (markup == START_MARK) {
      // probably would be better to set a different bg and font color
      // doc.style.color = markup == 'highlight' ? 'green' : 'lightgrey';
      div.innerHTML = `<mark>${data}</mark>`;
    } else {
      div.style.fontWeight = 'normal';
    }
  } else {
    console.log(`null document: ${id}`);
  }
}



function setImage(x, y, img) {
  if (!amiga_mode) return;
  var doc = document.getElementById(`${x},${y}`); // CACHE THIS?
  if (doc) {
    // OPTIMIZATION: don't set bg image if it's the same
    // this prevents things from being really slow in firefox
    if (doc.style.backgroundImage === img) {
      return;
    }
    //  else {
    //    console.log(doc.style.backgroundImage, img);
    //  }

    if (img) {
      doc.style.backgroundImage = img;
    }
    doc.innerHTML = ` `;
  } else {
    console.log(`setImage: null doc at ${x},${y}`);
  }
}



function onResize() {
  setMode(amiga_mode, retro_mode, original_objects);
}



function setMode(amiga, retro, original) {

  amiga_mode = amiga;
  retro_mode = retro;
  original_objects = original;
  let spriteWidth = computeSpriteWidth();

  // modern font settings
  let fontSize = spriteWidth * 1.66;
  let fontFamily = `Courier New`;
  let textColour = `lightgrey`;
  let letterSpacing = `normal`;

  // retro mode settings
  if (retro_mode) {
    fontSize = spriteWidth * 1.88;
    fontFamily = `dos437`;
    textColour = `#ABABAB`;
    letterSpacing = '-1px';
  }

  // change to amiga font for amiga graphics
  if (amiga_mode) {
    fontSize = spriteWidth * 1.66;
    fontFamily = retro_mode ? `amiga500` : `amiga1200`;
    textColour = `lightgrey`;
    letterSpacing = `normal`;
    original_objects = true;
    let ele = document.getElementById('0,0');
    if (!ele) {
      /* first time */
      for (var y = 0; y < 24; y++) {
        for (var x = 0; x < 80; x++) {
            display[x][y] = createDiv(x, y, spriteWidth, spriteWidth * 2);
        }
      }
      bltDocument();
    } else {
      /* update divs if the size has changed */
      if (`${spriteWidth}px` != ele.style.width) {
        let divs = document.getElementsByClassName('image');
        for (let index = 0; index < divs.length; index++) {
          const div = divs[index];
          div.style.width = `${spriteWidth}px`;
          div.style.height = `${spriteWidth * 2}px`;
        }
      }
    }
    if (!images) {
      loadImages();
    }
  }

  let font = `${fontSize}px ${fontFamily}`;

  document.body.style.font = font;
  document.body.style.fontFamily = fontFamily;
  document.body.style.color = textColour;
  document.body.style.letterSpacing = letterSpacing;

  setButtons();

  /* todo, later */
  // let buttons = document.getElementsByClassName('variablebutton');
  // for (let index = 0; index < buttons.length; index++) {
  //   // buttons[index].style.fontFamily = fontFamily;
  //   buttons[index].style.font = font;
  //   buttons[index].style.fontSize = 12;
  // }
  // buttons = document.getElementsByClassName('button');
  // for (let index = 0; index < buttons.length; index++) {
  //   buttons[index].style.font = font;
  //   buttons[index].style.fontSize = 12;
  //   // buttons[index].style.fontFamily = fontFamily;
  // }

  paint();

}



function computeSpriteWidth() {
  var browserWidth = window.innerWidth;
  var browserHeight = window.innerHeight;

  /* we are working with fixed width fonts, so this is a lot less complicated
     "a) a magic potion of cure dianthroritis" -> 39 characters
     width: 80 for game area, 39 for side inventory, 75 pixels buffer
     height: 24 for game area, 125 pixel buffer
  */
  let rawSpriteW = (browserWidth - 75) / (80 + (side_inventory ? 39 : 0));
  let rawSpriteH = (browserHeight - 125) / 24;

  let spriteWidth = Math.min(rawSpriteW, rawSpriteH / 2);
  // spriteWidth *= 10;
  spriteWidth = Math.floor(spriteWidth); // chrome needs whole numbers to have smooth amiga graphics
  // spriteWidth /= 10;
  spriteWidth = Math.max(10, spriteWidth);

  // console.log(`spriteWidth`, spriteWidth);

  return spriteWidth;
}



function printStats() {
  let stats = ``;
  if (!player) return;
  if (DEBUG_STATS) {
    stats = debug_stats();
  }
  else {
    if (game_started && side_inventory) {
      stats = game_stats(player);
    }
  }
  setDiv(`STATS`, stats);
}



function bottomline() {
  cursor(1, 18);
  lprcat(`${player.getStatString()}\n`);

  for (var logindex = LOG_SAVE_SIZE - LOG_SIZE; logindex < LOG.length; logindex++) {
    // less pretty code but more efficient for amiga mode, especially in firefox
    lprcat(`${LOG[logindex]}`);
    cltoeoln();
    lprcat(`\n`);
  }
}



function botside() {
  var line = 1;
  botsideline(player.STEALTH, `Stealth`, line++, changedStealth);
  botsideline(player.UNDEADPRO, `Undead Pro`, line++, changedUndeadPro);
  botsideline(player.SPIRITPRO, `Spirit Pro`, line++, changedSpiritPro);
  botsideline(player.CHARMCOUNT, `Charm`, line++, changedCharmCount);
  botsideline(player.TIMESTOP, `Time Stop`, line++, changedTimeStop);
  botsideline(player.HOLDMONST, `Hold Monst`, line++, changedHoldMonst);
  botsideline(player.GIANTSTR, `Giant Str`, line++, changedGiantStr);
  botsideline(player.FIRERESISTANCE, `Fire Resit`, line++, changedFireResistance);
  botsideline(player.DEXCOUNT, `Dexterity`, line++, changedDexCount);
  botsideline(player.STRCOUNT, `Strength`, line++, changedStrCount);
  botsideline(player.SCAREMONST, `Scare`, line++, changedScareMonst);
  botsideline(player.HASTESELF, `Haste Self`, line++, changedHasteSelf);
  botsideline(player.CANCELLATION, `Cancel`, line++, changedCancellation);
  botsideline(player.INVISIBILITY, `Invisible`, line++, changedInvisibility);
  var altProLabel = `Protect ` + (ULARN ? `5` : `3`);
  botsideline(player.ALTPRO, altProLabel, line++, changedAltPro);
  botsideline(player.PROTECTIONTIME, `Protect 2`, line++, changedProtectionTime);
  botsideline(player.WTW, `Wall-Walk`, line++, changedWTW);
}



const blank = `          `;

function botsideline(stat, name, line, bold) {
  cursor(70, line);
  var str = padString(stat > 0 ? name : blank, -1, bold);
  lprcat(str);
}



/*
JRP this is very different from the original code
I was lazy when it came to only partially drawing the screen
and relied on fully repainting everything every move, which
breaks how blindness works. I actually like this behaviour
better, so you're stuck with it.
*/
function drawmaze() {

  if (!amiga_mode)
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
        lprc(OUNKNOWN.getChar(), i, j);
      } else if (know[i][j] & HAVESEEN) {
        if (i == player.x && j == player.y) {
          lprc(player.getChar(), i, j);
          continue;
        }
        var monster = monsterAt(i, j);
        var item = itemAt(i, j);
        if (monster && know[i][j] & KNOWHERE) {
          if (blind)
            lprc(item.getChar(), i, j);
          else
            lprc(monster.getChar(), i, j);
        } else {
          // if (blind)
          //   item.matches(OWALL) ? lprc(OWALL.getChar()) : lprc(item.getChar())
          // else
          lprc(item.getChar(), i, j);
        }
      } else {
        lprc(OUNKNOWN.getChar(), i, j);
      }
    }
  }
}



/* subroutine to display a cell location on the screen */
/* JRP this is quite different from the original, see drawmaze */
function showcell(x, y) {
  if (!mazeMode) return;

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
/* JRP this is quite different from the original, see drawmaze */
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
    if (player.LEVEL < rnd(30)) {
      dir = rund(9); /*if confused any dir*/
    }
  }

  var k = player.x + diroffx[dir];
  var m = player.y + diroffy[dir];

  if (k < 0 || k >= MAXX || m < 0 || m >= MAXY) {
    nomove = 1;
    return (0);
  }

  var item = itemAt(k, m);
  var monster = monsterAt(k, m);

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

  /* hit a monster */
  if (monster) {
    hitmonster(k, m);
    return (0);
  }

  /* check for the player ignoring an altar when in command mode. */
  if (player.TIMESTOP == 0 && itemAt(player.x, player.y).matches(OALTAR) && !prayed) {
    updateLog(`  You have ignored the altar!`);
    act_ignore_altar(player.x, player.y);
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
      if (itemAt(x, y).matches(item)) {
        //debug(`movenear: found: ` + item.id + ` at ` + xy(x, y));
        positionplayer(x, y, exact);
        return true;
      }
    }
  }
  debug(`movenear: NOT FOUND: ` + item.id);
  return false;
}



var PAGE_COUNT = 1;
const NO_MORE = `nomore`;

/*
 *  function to show what magic items have been discovered thus far
 *  enter with -1 for just spells, anything else will give scrolls & potions
 */
function seemagic(onlyspells, allspells) {
  mazeMode = false;

  var spelldata = player.knownSpells;
  if (allspells) spelldata = spelcode;

  if (onlyspells) {
    cl_up(79, ((spelldata.length + 2) / 3 + 4)); /* lines needed for display */
  } else {
    clear();
  }

  cursor(1, 1);

  var buffer = [];

  var spellstring = `  The magic spells you have discovered thus far:`;
  if (allspells) spellstring = `Available spells are:`;
  var spellfunc = function (spell, buffer) {
    return padString(`${spell} ${spelname[spelcode.indexOf(spell)]}`, -26);
  }
  printknown(spellstring, spelldata, spellfunc, buffer, true);

  if (!onlyspells) {
    var scrollstring = `  The magic scrolls you have found to date are:`;
    var scrollfunc = function (scroll) {
      return padString(`${SCROLL_NAMES[scroll.arg]}`, -26);
    }
    printknown(scrollstring, player.knownScrolls, scrollfunc, buffer, true);

    var potionstring = `  The magic potions you have found to date are:`;
    var potionfunc = function (potion) {
      return padString(`${POTION_NAMES[potion.arg]}`, -26);
    }
    printknown(potionstring, player.knownPotions, potionfunc, buffer, false);
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
  lprcat(`Press <b>space</b> to continue \n`);
}



function printknown(firstline, itemlist, printfunc, buffer, extra) {
  var sorted_list = itemlist.slice().sort();
  buffer.push(firstline);
  buffer.push(``);
  var line = ``;
  var count = 0;
  for (var i = 0; i < sorted_list.length; i++) {
    var item = sorted_list[i];
    if (item) {
      line += printfunc(item);
      if (++count % 3 == 0) {
        buffer.push(line);
        line = ``;
      }
    }
  }
  if (count % 3 != 0) {
    buffer.push(line);
  }
  if (count == 0) {
    buffer.push(`...`);
  }
  if (extra) buffer.push(``);
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
    setCharCallback(cast);
    return exitbuilding();
  }
}



function updateLog(text, hint) {

  // BUGFIX FOR PUTTING EMPTY STRINGS INTO DYNAMO
  if (text == ``) text = ` `;

  if (DEBUG_OUTPUT) {
    console.log(`LARN: ${text} ${hint ? hint : ``}`);
  }
  if (!LOG) return;
  if (keyboard_hints && hint) {
    text = `${text} ${hint}`;
  }
  LOG.push(text);
  if (LOG.length > LOG_SAVE_SIZE) {
    LOG.shift();
  }
}



function appendLog(text) {
  var newText;
  if (text == DEL) {
    newText = deleteLog();
    newText = newText.substring(0, newText.length - 1);
  } else {
    newText = deleteLog() + text;
  }
  updateLog(newText);
}



function deleteLog() {
  if (!LOG) return;
  return LOG.pop();
}



/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 * 
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 * 
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
function getTextWidth(text, font) {
  // re-use canvas object for better performance
  var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  var context = canvas.getContext("2d");
  context.font = font;
  var metrics = context.measureText(text);
  return metrics.width;
}



function onMouseClick(event) {
  try {

    let xy, x, y;

    if (amiga_mode) {
      if (!event.target.attributes.id) return; // clicking outside the 80,24 window
      xy = event.target.attributes.id.value.split(`,`);
      x = xy[0];
      y = xy[1];
    } else {

      return;

      /*
      // this is too unreliable to ship
      let el = document.getElementById('LARN');
      let style = window.getComputedStyle(el, null).getPropertyValue('font-size');
      let fontSize = parseFloat(style);
      let fontWidth = getTextWidth("0", fontSize + 'pt dos');
      // console.log(`fontwidth: ${fontWidth} fontSize: ${fontSize}`);

      // console.log(event.layerX, event.layerY);
      // console.log(event.clientX, event.clientY);

      let offx = 25; // event.target.offsetLeft;
      let offy = 25; // event.target.offsetTop);
      // let offx = event.target.offsetLeft;
      // let offy = event.target.offsetTop;
      console.log(offx, offy);
      
      let clickX = event.clientX - offx;
      let clickY = event.clientY - offy;
      // console.log(`clickX`, clickX, `clickY`, clickY);

      x = clickX / fontWidth;
      y = clickY / fontSize;
      console.log(x, y);

      let weirdHackX = (66/59.52);
      let weirdHackY = (16/18.45);
      x = Math.floor((clickX / fontWidth) * weirdHackX);
      y = Math.floor((clickY / fontSize) * weirdHackY);
      */

    }

    let monster = monsterAt(x, y);
    let item = itemAt(x, y);

    if (!item) return; // clicking outside the 67,17 maze

    let description = ``;
    let prefix = `It's `;
    let sayEmpty = false;

    // console.log(event);
    // console.log(x, y);
    // updateLog(`${x}, ${y}`);

    if (monster) {
      // no help for invisible monsters or if you're blind
      sayEmpty = !monster.isVisible() || player.BLINDCOUNT > 0;
    }

    if (sayEmpty) monster = null; // what monster?

    if (!player.level.know[x][y]) {
      description = `a mystery`;
    } else if (x == player.x && y == player.y) {
      description = `our Hero`;
    } else if (monster) {
      description = monster.toString();
      if (monster.matches(MIMIC)) description = monsterlist[monster.mimicarg].toString();
      let firstChar = description.substring(0, 1).toLocaleLowerCase();
      prefix = `It's a `;
      if (`aeiou`.indexOf(firstChar) >= 0) prefix = `It's an `;
    } else if (sayEmpty || item.matches(OIVDARTRAP) || item.matches(OIVTELETRAP) || item.matches(OIVTRAPDOOR) || item.matches(OTRAPARROWIV)) {
      description = OEMPTY.desc;
    } else {
      description = item.getDescription();
    }

    description = prefix + description;
    updateLog(description);
    paint();
  } catch (error) {
    console.log(`onMouseClick`, error);
  }
}