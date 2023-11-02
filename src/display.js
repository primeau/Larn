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

  printStats(); // todo this should probably move
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
    } else {
      bltDocument();
    }
  }

  onResize();

  if (BLINKEN) { // prevent blinking cursor from creating tons of duplicate frames
    let divs = {};
    divs.LARN = document.getElementById(`LARN`).innerHTML;
    divs.STATS = document.getElementById(`STATS`).innerHTML;
    recordFrame(divs, createLocalScore);
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
  if (!w) w = 12; // change this for altrender?
  if (!h) h = w * 2;
  // TODO: this can be more efficient!
  return `<div id='${x},${y}' class='image' style="width:${w}px; height:${h}px; "> </div>`;
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



class Box {
  constructor(left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }
}

function setSize(element, box) {
  // wacky way to allow mixed units
  element.style.left = isNaN(box.left) ? box.left : box.left + `vw`;
  element.style.top = isNaN(box.top) ? box.top : box.top + `vh`;
  element.style.width = isNaN(box.width) ? box.width : box.width + `vw`;
  element.style.height = isNaN(box.height) ? box.height : box.height + `vh`;
}



function onResize(event) {

  setButtons();

  let emptyBox = new Box(0, 0, 0, 0);
  let margin = 1;

  let larn = document.getElementById(`LARN`);
  let directionButtons = document.getElementById(KEYPAD);
  let inventoryButtons = document.getElementById(ACTIONS);
  let contextButtons = document.getElementById(CONTEXT);
  let runButton = document.getElementById(RUN);
  let helpButtons = document.getElementById(HELP);
  let chastize = document.getElementById(`FOOTER`);
  let inventory = document.getElementById(`STATS`);
  let keyboard = document.getElementById(KEYBOARD);

  // desktop mode is default layout
  let inventoryW = side_inventory ? 35 : 0;
  let larnBox = new Box(margin, margin, 100 - margin * 2 - inventoryW, 95);
  let inventoryBox = new Box(larnBox.left + larnBox.width, larnBox.top, 100 - larnBox.width - margin * 2, larnBox.height);
  let chastizeBox = new Box(margin, 95, 100 - margin * 2, 4);
  let helpBox = new Box(margin, 95, larnBox.width + inventoryW, 4);
  let runBox = emptyBox;
  let directionBox = emptyBox;
  let contextBox = emptyBox;
  let invButtonsBox = emptyBox;
  let keyboardBox = emptyBox;


  if (isTablet()) {
    if (isHorizontal()) {
      side_inventory = true;
      inventoryW = 35;
      inventoryBox = new Box(margin + 100 - inventoryW, margin, inventoryW - margin * 2, 50);
      inventory.style.maxHeight = `30%`;
    }
    if (isVertical()) {
      side_inventory = false;
      inventoryW = 0;
      inventoryBox = new Box(margin, 60, 100 - margin * 2, 0);
    }
    chastizeBox = new Box(margin, 93, 97, 4);
    helpBox = new Box(margin, 93, 97, 4);
    larnBox = new Box(margin, margin, 100 - margin * 2 - inventoryW, 50);
    let directionH = isHorizontal() ? `25vw` : `25vw`;
    runBox = new Box(100 - margin, larnBox.top + larnBox.height + margin * 2, directionH, 5);
    directionBox = new Box(margin, runBox.top, directionH, directionH);
    contextBox = new Box(`27vw`, runBox.top, 15, 0);
    invButtonsBox = new Box(isHorizontal() ? `78vw` : `72vw`, runBox.top, contextBox.width, 0);
    keyboardBox = new Box(isHorizontal() ? margin : 10, larnBox.height + margin + 5, 80, directionH);
  }
  else if (isPhone()) {
    margin = `3px`;
    side_inventory = false;
    inventoryBox = emptyBox;
    if (isHorizontal()) {
      directionBox = new Box(margin, margin, `25vw`, `25vw`);
      contextBox = new Box(margin, `27vw`, 15, 0);
      larnBox = new Box(`27vw`, margin, 52, 66);
      runBox = new Box(99, margin, `87vh`, 10);
      invButtonsBox = new Box(79, margin, 15, 0);
      keyboardBox = new Box(20, 67, 75, 25);
      chastizeBox = new Box(margin, 91, 97, 4);
      helpBox = new Box(margin, 91, 97, 4);
    }
    if (isVertical()) {
      directionBox = new Box(margin, 31, 73, 25);
      contextBox = new Box(margin, 58, 15, 0);
      larnBox = new Box(margin, margin, 98, 30);
      runBox = new Box(99, 31, `25vh`, 10);
      invButtonsBox = new Box(68, 58, 15, 0);
      keyboardBox = new Box(5, 62, 90, 25);
      chastizeBox = new Box(margin, 97, 98, 4);
      helpBox = new Box(margin, 97, 98, 4);
    }
  } else /* isDesktop() */ {
  }

  if (directionButtons && directionButtons.childElementCount == 0) directionBox = emptyBox;
  if (contextButtons && contextButtons.childElementCount == 0) contextBox = emptyBox;
  if (inventoryButtons && inventoryButtons.childElementCount == 0) invButtonsBox = emptyBox;
  if (runButton && runButton.childElementCount == 0) runBox = emptyBox;
  if (keyboard && keyboard.childElementCount == 0) keyboardBox = emptyBox;
  if (chastize && chastize.innerHTML == ``) chastizeBox = emptyBox;

  // basic larn
  setSize(larn, larnBox);
  setSize(inventory, inventoryBox);
  setSize(chastize, chastizeBox);
  setSize(helpButtons, helpBox);
  // mobile larn
  setSize(keyboard, keyboardBox);
  setSize(inventoryButtons, invButtonsBox);
  setSize(contextButtons, contextBox);
  setSize(directionButtons, directionBox);
  setSize(runButton, runBox);

  setMode(amiga_mode, retro_mode, original_objects);
}



function setMode(amiga, retro, original) {

  // console.log(amiga, retro, original);

  if (isMobile()) {
    retro = false; // force modern font for mobile devices because the retro font isn't great
  }

  if (amiga && isRecording()) stopRecording();

  amiga_mode = amiga;
  retro_mode = retro;
  original_objects = original;

  // bold fonts are wider than regular fonts on Safari
  // Courier New is OK, but many are not
  // TODO: still need to solve this better for dos437
  const testtext = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
  let testfont = `12px modern`;
  let isBoldWider = getTextWidth(testtext, testfont, true) != getTextWidth(testtext, testfont, false);

  // console.log(getTextWidth(testtext, testfont, true), getTextWidth(testtext, testfont, false), isBoldWider);

  // modern font settings
  // let widthMultiple = isBoldWider ? 1.66 : 1.71;
  let heightMultiple = 1.93;
  let fontFamily = isBoldWider ? `Courier New` : `modern`;
  let textColour = `lightgrey`;
  let letterSpacing = `normal`;
  let spacing = 0;

  // retro mode settings
  if (retro_mode) {
    testfont = `12px dos437`;
    isBoldWider = getTextWidth(testtext, testfont, true) != getTextWidth(testtext, testfont, false);
    // widthMultiple = 1.88;
    heightMultiple = 1.9;
    fontFamily = isBoldWider ? `Courier New` : `dos437`;
    textColour = `#ABABAB`;
    letterSpacing = '-1px';
    spacing = -1;
  }

  // change to amiga font for amiga graphics
  let spriteWidth = computeSpriteWidth();
  if (amiga_mode) {
    // widthMultiple = 1.66;
    heightMultiple = 2;
    fontFamily = retro_mode ? `amiga500` : `amiga1200`;
    textColour = `lightgrey`;
    letterSpacing = `normal`;
    spacing = 0;
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

  let fontSize = amiga_mode ? spriteWidth * 2 : computeFontSize(fontFamily, spriteWidth, spacing);
  let lineHeight = `${spriteWidth * heightMultiple}px`;

  let font = `${fontSize}px ${fontFamily}`;

  document.body.style.font = font;
  document.body.style.fontFamily = fontFamily;
  document.body.style.color = textColour;
  document.body.style.letterSpacing = letterSpacing;
  document.body.style.lineHeight = lineHeight;

  setButtonFontSize(fontSize);

  try {
    if (!styleUploaded) {
      styleUploaded = true;
      let larnStyle = {};
      let larnElement = document.getElementById(`LARN`);
      larnStyle.font = getComputedStyle(larnElement).font;
      larnStyle.fontFamily = getComputedStyle(larnElement).fontFamily;
      larnStyle.color = getComputedStyle(larnElement).color;
      larnStyle.letterSpacing = getComputedStyle(larnElement).letterSpacing;
      // larnStyle.widthMultiple = widthMultiple;
      larnStyle.widthMultiple = 1.88; // this seems like a mistake
      larnStyle.heightMultiple = heightMultiple;
      uploadStyle(larnStyle);
    }
  } catch (error) {
    console.error(`failed to upload style`, error)
  }

}

let styleUploaded = false;



function computeSpriteWidth() {
  var larnWidth = getElementWidth(`LARN`);
  var larnHeight = getElementHeight(`LARN`);

  if (larnWidth === 0) {
    larnWidth = window.innerWidth;
    larnHeight = window.innerHeight;
  }

  // updateLog(`csw: browser=` + Math.floor(browserWidth) + `,` + Math.floor(browserHeight) +
  // ` window=` + window.screen.width + `,` + window.screen.height);

  /* we are working with fixed width fonts, so this is a lot less complicated
     a) a magic potion of cure dianthroritis -> 39 characters
     width: 80 for game area, 39 for side inventory
     height: 24 for game area
  */
  let rawSpriteW = (larnWidth) / 80;
  let rawSpriteH = (larnHeight) / 24;

  let spriteWidth = Math.min(rawSpriteW, rawSpriteH / 2); // take height into account
  if (amiga_mode) spriteWidth = Math.floor(spriteWidth); // chrome needs whole numbers to have smooth amiga graphics

  return Math.max(4, spriteWidth);
}



function computeFontSize(fontFamily, spriteWidth, spacing) {
  let fontSize = spriteWidth;
  let font = `${fontSize}px ${fontFamily}`;

  do {
    fontSize += 0.1;
    font = `${fontSize}px ${fontFamily}`;
  }
  while (getTextWidth(`X`, font, false) + spacing < spriteWidth);

  fontSize *= 10; // for some cleaner numbers
  fontSize = Math.floor(fontSize);
  fontSize /= 10;

  // console.log(`spritew`, spriteWidth, `fontsize`, fontSize);
  // updateLog(`spritew` + ": " + spriteWidth + " " + `fontsize` + ": " + fontSize);
  return fontSize;
}



function printStats() {
  let stats = ``;
  if (!player) return;
  if (DEBUG_STATS) {
    stats = debug_stats();
  } else {
    if (game_started && side_inventory) {
      stats = game_stats(player);
    }
  }
  if (!side_inventory) stats = ``;
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
  cursor(68, line);
  lprcat(padString(`  `));
  lprcat(padString(stat > 0 ? name : blank, -1, bold));
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

  // ?? rollbar implies that item is null sometimes and fails on matches()

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
  if (keyboard_hints && hint && !isMobile()) {
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



function onMouseClick(event) {
  try {

    let xy, x, y;

    if (!player) return;

    if (amiga_mode) {
      if (!event.target.attributes.id) return; // clicking outside the 80,24 window
      xy = event.target.attributes.id.value.split(`,`);
      x = xy[0];
      y = xy[1];
    } else {

      return;

      /*

      new idea: don't forget about linespacing stuff in setMode

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
      if (ULARN && monster.matches(MIMIC)) description = monsterlist[monster.mimicarg].toString();
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