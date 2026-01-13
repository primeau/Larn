'use strict';

let cursorx = 1;
let cursory = 1;

let display = initGrid(80, 24);

const START_MARK = `<mark>`;
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
    if (str.indexOf(START_BOLD, i) === i) starttag = START_BOLD;
    else if (str.indexOf(START_MARK, i) === i) starttag = START_MARK;
    else if (str.indexOf(START_DIM, i) === i) starttag = START_DIM;
    else if (str.indexOf(START_STRIKE, i) === i) starttag = START_STRIKE;
    else if (str.indexOf(START_ITALIC, i) === i) starttag = START_ITALIC;
    else if (str.indexOf(START_UNDERLINE, i) === i) starttag = START_UNDERLINE;
    else if (str.indexOf(START_HREF, i) === i) {
      // <a href='link'>text</a> (must use ' not ")
      starttag = str.slice(i, str.indexOf('>', i) + 1);
    }
    else if (str.indexOf(START_FONT, i) === i) {
      // <font color='red'>
      starttag = str.slice(i, str.indexOf('>', i) + 1);
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
    
    if (str.indexOf(END_BOLD, i+1) === i+1) endtag = END_BOLD;
    else if (str.indexOf(END_MARK, i+1) === i+1) endtag = END_MARK;
    else if (str.indexOf(END_DIM, i+1) === i+1) endtag = END_DIM;
    else if (str.indexOf(END_STRIKE, i+1) === i+1) endtag = END_STRIKE;
    else if (str.indexOf(END_ITALIC, i+1) === i+1) endtag = END_ITALIC;
    else if (str.indexOf(END_UNDERLINE, i+1) === i+1) endtag = END_UNDERLINE;
    else if (str.indexOf(END_FONT, i+1) === i+1) endtag = END_FONT;
    else if (str.indexOf(END_HREF, i+1) === i+1) endtag = END_HREF;
    
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
