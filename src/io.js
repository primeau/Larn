'use strict';

let cursorx = 1;
let cursory = 1;

let display = initGrid(80, 24);

const START_MARK = `<mark style='background-color:`;
const END_MARK = `</mark>`;
const START_BOLD = `<b>`;
const END_BOLD = `</b>`;
const START_DIM = `<dim>`;
const END_DIM = `</dim>`;
const START_STRIKE = `<s>`;
const END_STRIKE = `</s>`;
const START_ITALIC = `<i>`;
const END_ITALIC = `</i>`;
const START_UNDERLINE = `<u>`;
const END_UNDERLINE = `</u>`;
const START_HREF = `<a href=`;
const END_HREF = `</a>`;
const START_FONT = `<font color=`;
const END_FONT = `</font>`;



function startMark(color=``) {
  if (color === ``) color = `lightgrey`;
  return `${START_MARK}${color}'>`;
}



function wrapMark(str, color=``) {
  return `${startMark(color)}${str}${END_MARK}`;
}



function startFont(color) {
  return `${START_FONT}'${color}'>`;
}



function wrapFont(str, color) {
  return `${startFont(color)}${str}${END_FONT}`;
}



function startHref(href) {
  return `${START_HREF}'${href}'>`;
}



function wrapHref(str, href) {
  return `${startHref(href)}${str}${END_HREF}`;
}



function lprint(str) {
  lprcat(str);
  blt();
}


// changes in this function may affect display.js:setDiv()
function lprcat(str) {
  DEBUG_LPRCAT++;

  if (alternativeDisplay) {
    alternativeDisplay += str;
    return;
  }

  let amigaMarkup = null;
  
  for (let i = 0; i < str.length; i++) {
    let c = str[i];

    let starttag = null;
    let endtag = null;

    // check for opening/closing markup tags. tags must be handled because 
    // they will use up characters in display[][] even though they aren't visible
    for (const tag of [START_BOLD, START_DIM, START_STRIKE, START_ITALIC, START_UNDERLINE, START_HREF, START_FONT, START_MARK]) {
      if (str.indexOf(tag, i) === i) {
        starttag = str.slice(i, str.indexOf('>', i) + 1);
        break;
      }
    }

    if (starttag) {
      i += starttag.length;
      if (amiga_mode) {
        amigaMarkup = starttag; // apply markup until enddtag found
        c = str[i];
      } else {
        c = starttag + str[i]; // print start tag with first char
      }
      // debug(`lprcat(): ${starttag}:${c}`)
    }
    
    for (const tag of [END_BOLD, END_DIM, END_STRIKE, END_ITALIC, END_UNDERLINE, END_HREF, END_FONT, END_MARK]) {
      if (str.indexOf(tag, i+1) === i+1) {
        endtag = tag;
        break;
      }
    }
    
    if (endtag) {
      if (amiga_mode) {
        i += endtag.length; // skip over end tag
      } else {
        if (cursorx > 80) {
          debug(`lprcat(): line wrap at col 80 before endtag:${endtag}`);
          cursorx = 80;
        }
        c += endtag; // print last char with end tag
        i += endtag.length;
      }
      // debug(`lprcat(): ${endtag}:${c}`)
    }

    lprc(c, amigaMarkup);
    if (endtag) amigaMarkup = null;
  }
}



function lprc(ch, markup) {
  DEBUG_LPRC++;

  if (alternativeDisplay) {
    alternativeDisplay += ch;
    return;
  }

  if (ch == '\b') {
    cursorx--;
    os_put_font(' ', cursorx - 1, cursory - 1);
  } else if (ch == '\n') {
    cursorx = 1;
    cursory++;
  } else {
    os_put_font(ch, cursorx - 1, cursory - 1, markup);
    cursorx++;
  }
}



function os_put_font(ch, x, y, markup) {
  if (x >= 0 && x < 80 && y >= 0 && y < 24) {
    if (amiga_mode) {
      ch = `${ch}`; // workaround: amiga larn bank buttons are numbers, not strings

      // HACK HACk HAck Hack hack
      const HACK_URL_TEXT = `url`;
      if (ch.substring(0, 3) === HACK_URL_TEXT) {
        setImage(x, y, ch);
      } else {
        setChar(x, y, ch, markup);
      }
    } else {
      // if (DEBUG_PROXIMITY) {
      //   if (!screen[x] || !screen[x][y] || screen[x][y] == 127 || screen[x][y] == 0) {
      //     // do nothing
      //   } else {
      //     if (!monsterAt(x, y)) {
      //       ch = (screen[x][y] < 10) ? `` + screen[x][y] : `` + (screen[x][y] % 10);
      //     }
      //     else {
      //       ch = `<b>${ch}</b>`;
      //     }
      //   }
      //   if (x == player.x && y == player.y) ch = `<b>#</b>`;
      // }
      display[x][y] = ch;
    }
  }
}



function cursor(x, y) {
  cursorx = x;
  cursory = y;
}



function cursors() {
  cursor(1, 24);
}



function clear() {
  cl_dn(1, 1);
}



function cltoeoln() {
  const x = cursorx;
  let n = 80 + 1 - x;
  while (n-- > 0) {
    lprc(' ');
    setImage(80 - n - 1, cursory - 1, OUNKNOWN.getChar());
  }
  cursorx = x;
}



function cl_up(x, y) {
  for (let i = 1; i <= y; i++) {
    cursor(1, i);
    cltoeoln();
  }
  cursor(x, y);
}



function cl_dn(x, y) {
  for (let i = y; i <= 24; i++) {
    cursor(1, i);
    cltoeoln();
  }
  cursor(x, y);
}
