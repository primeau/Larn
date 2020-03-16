'use strict';

var cursorx = 1;
var cursory = 1;

var display = initGrid(80, 24);



function lprintf(str, width) {
  if (width != null) {
    lprcat(padString(str, width));
  } else {
    lprcat(str);
  }
}


var START_MARK = `<mark>`;
var END_MARK = `</mark>`;
var START_BOLD = `<b>`;
var END_BOLD = `</b>`;



function lprint(str) {
  lprcat(str);
  blt();
}



function lprcat(str, width) {
  DEBUG_LPRCAT++;
  if (width) {
    lprintf(str, width);
    return;
  }

  // Some people, when confronted with a problem, think, “I know,
  // I'll use regular expressions.” Now they have two problems.

  var markup = null;
  var len = str.length;

  for (var i = 0; i < len; i++) {
    var c = str[i];

    if (c === '<') {
      if (str.substr(i, 3).toLowerCase() === START_BOLD) {
        markup = START_BOLD;
        i += 2;
        if (amiga_mode) {
          continue;
        } else {
          c = START_BOLD;
        }
      } else if (str.substr(i, 4).toLowerCase() === END_BOLD) {
        markup = null;
        i += 3;
        if (amiga_mode) {
          continue;
        } else {
          let diff = 1;
          if (cursorx > 80) diff = cursorx - 80;
          cursorx -= diff;
          c = str.substr(i - 3 - diff, diff) + END_BOLD;
        }
      } else if (str.substr(i, 6).toLowerCase() === START_MARK) {
        markup = START_MARK;
        i += 5;
        if (amiga_mode) {
          continue;
        } else {
          c = START_MARK;
        }
      } else if (str.substr(i, 7).toLowerCase() === END_MARK) {
        markup = null;
        i += 6;
        if (amiga_mode) {
          continue;
        } else {
          let diff = 1;
          if (cursorx > 80) diff = cursorx - 80;
          cursorx -= diff;
          c = str.substr(i - 6 - diff, diff) + END_MARK;
        }
      }
    }

    lprc(c, markup);

  }
}



function cursor(x, y) {
  cursorx = x;
  cursory = y;
}



function cursors() {
  cursor(1, 24);
}



function lprc(ch, markup) {
  DEBUG_LPRC++;

  if (ch == '\b') {
    cursorx--;
    os_put_font(' ', cursorx - 1, cursory - 1);
  } else if (ch == '\n') {
    cursorx = 1;
    cursory++;
  } else {
    // var n = 1;
    // if (ch == '\t') {
    //   ch = ' ';
    //   n = 4;
    // }
    // while (n--) {
    os_put_font(ch, cursorx - 1, cursory - 1, markup);
    cursorx++;
    // }
  }
}


var HACK_URL_TEXT = `url`;

function os_put_font(ch, x, y, markup) {
  if (x >= 0 && x < 80 && y >= 0 && y < 24) {
    if (!amiga_mode) {

      if (DEBUG_PROXIMITY) {
        if (!screen[x] || !screen[x][y] || screen[x][y] == 127 || screen[x][y] == 0) {
          // do nothing
        } else {
          if (!monsterAt(x, y)) {
            ch = (screen[x][y] < 10) ? `` + screen[x][y] : `` + (screen[x][y] % 10);
          }
          else {
            ch = `<b>${ch}</b>`;
          }
        }
        if (x == player.x && y == player.y) ch = `<b>#</b>`;
      }

      display[x][y] = ch;

      // TODO: setup for not repainting in text mode
      // TODO: need to update io.js:os_put_font(), display.js:blt(), larn.js:play()
      // TODO: this will break scoreboard rendering
      if (altrender) {
        setChar(x, y, ch, markup);
      }

    } else {
      // HACK HACk HAck Hack hack
      if (ch.substring(0, 3) === HACK_URL_TEXT) {
        setImage(x, y, ch);
      } else {
        setChar(x, y, ch, markup);
      }
    }
  }
}



function clear() {
  cl_dn(1, 1);
}



function cltoeoln() {
  var x = cursorx;
  var n = 80 + 1 - x;
  while (n-- > 0) {
    lprc(' ', null);
    setImage(80 - n - 1, cursory - 1, OUNKNOWN.getChar());
  }
  cursorx = x;
}



function cl_up(x, y) {
  for (var i = 1; i <= y; i++) {
    cursor(1, i);
    cltoeoln();
  }
  cursor(x, y);
}



function cl_dn(x, y) {
  for (var i = y; i <= 24; i++) {
    cursor(1, i);
    cltoeoln();
  }
  cursor(x, y);
}



function lflush() {
  LOG = Array(LOG_SAVE_SIZE).join(' ').split('');
}
