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

const tags = [
  { start: START_BOLD,      end: END_BOLD },
  { start: START_FONT,      end: END_FONT },
  { start: START_MARK,      end: END_MARK },
  { start: START_DIM,       end: END_DIM },
  { start: START_STRIKE,    end: END_STRIKE },
  { start: START_ITALIC,    end: END_ITALIC },
  { start: START_UNDERLINE, end: END_UNDERLINE },
  { start: START_HREF,      end: END_HREF },
];



function highlightText(str, color) {
  if (!color) color = `lightgrey`;
  return `${START_MARK}${color}'>${str}${END_MARK}`;
}



function colorText(str, color) {
  if (!color) color = `lightgrey`;
  return `${START_FONT}'${color}'>${str}${END_FONT}`;
}



function linkText(str, href) {
  return `${START_HREF}'${href}'>${str}${END_HREF}`;
}



function lprint(str) {
  lprcat(str);
  blt();
}


// changes in this function may affect display.js:setDiv()
//
// this function is used for both amiga and non-amiga modes, and handles nested tags
//
// tags must be handled because they will use up characters in display[][] even though they aren't visible
//
// amiga_mode: input: "<b>abc</b>" output: "<b>a</b>", "<b>b</b>", "<b>c</b>"
// non-amiga:  input: "<b>abc</b>" output: "<b>a", "b", "c</b>"
function lprcat(str) {
  DEBUG_LPRCAT++;
  if (alternativeDisplay) {
    alternativeDisplay += str;
  } else if (amiga_mode) {
    lprcatAmiga(str);
  } else {
    lprcatStandard(str);
  }
}



function lprcatAmiga(str) {
  const tagStack = [];
  let activeWrappers = { start: ``, end: `` };
  let i = 0;

  while (i < str.length) {
    const openingTag = matchOpeningTagAt(str, i);
    if (openingTag) {
      tagStack.push({ start: openingTag.fullStartTag, end: openingTag.endTag });
      activeWrappers = rebuildTagWrappers(tagStack);
      i = openingTag.nextIndex;
      continue;
    }

    const closingTag = matchClosingTagAt(str, i);
    if (closingTag) {
      if (removeLastMatchingTag(tagStack, closingTag, (entry) => entry.end)) {
        activeWrappers = rebuildTagWrappers(tagStack);
      }
      i += closingTag.length;
      continue;
    }

    if (tagStack.length === 0) {
      lprc(str[i]);
    } else {
      lprc(`${activeWrappers.start}${str[i]}${activeWrappers.end}`);
    }

    i++;
  }
}



function lprcatStandard(str) {
  // Buffer the rendered cells so closing tags can be attached to the most recent
  // visible character instead of consuming another screen column.
  const rendered = [];
  const tagStack = [];
  let pendingPrefix = ``;
  let i = 0;

  while (i < str.length) {
    const openingTag = matchOpeningTagAt(str, i);
    if (openingTag) {
      pendingPrefix += openingTag.fullStartTag;
      tagStack.push(openingTag.endTag);
      i = openingTag.nextIndex;
      continue;
    }

    const closingTag = matchClosingTagAt(str, i);
    if (closingTag) {
      appendClosingTagToRendered(rendered, closingTag);

      removeLastMatchingTag(tagStack, closingTag);

      // If an entire styled segment had no visible chars, clear stale prefixes.
      if (rendered.length === 0 && tagStack.length === 0) {
        pendingPrefix = ``;
      }

      i += closingTag.length;
      continue;
    }

    let c = str[i];
    if (pendingPrefix) {
      c = pendingPrefix + c;
      pendingPrefix = ``;
    }
    rendered.push(c);
    i++;
  }

  closeRemainingRenderedTags(rendered, tagStack);

  for (const ch of rendered) {
    lprc(ch);
  }
}



function rebuildTagWrappers(tagStack) {
  if (tagStack.length === 0) {
    return { start: ``, end: `` };
  }

  const startTags = new Array(tagStack.length);
  const endTags = new Array(tagStack.length);

  for (let i = 0; i < tagStack.length; i++) {
    startTags[i] = tagStack[i].start;
    endTags[tagStack.length - 1 - i] = tagStack[i].end;
  }

  return {
    start: startTags.join(``),
    end: endTags.join(``),
  };
}



function appendClosingTagToRendered(rendered, endTag) {
  if (rendered.length === 0) return;

  // A pending wrap can leave cursorx past the visible edge even though the tag
  // itself should still attach to the last rendered cell.
  if (cursorx > 80) {
    debug(`lprcat(): line wrap at col 80 before endtag:${endTag}`);
    cursorx = 80;
  }

  rendered[rendered.length - 1] += endTag;
}



function closeRemainingRenderedTags(rendered, tagStack) {
  if (rendered.length === 0 || tagStack.length === 0) return;

  while (tagStack.length > 0) {
    rendered[rendered.length - 1] += tagStack.pop();
  }
}



function matchOpeningTagAt(str, index) {
  for (const tag of tags) {
    if (!str.startsWith(tag.start, index)) continue;

    const gt = str.indexOf('>', index);
    if (gt === -1) return null;

    return {
      fullStartTag: str.slice(index, gt + 1),
      endTag: tag.end,
      nextIndex: gt + 1,
    };
  }

  return null;
}


function matchClosingTagAt(str, index) {
  for (const tag of tags) {
    if (str.startsWith(tag.end, index)) return tag.end;
  }
  return null;
}


function removeLastMatchingTag(stack, endTag, getEndTag) {
  for (let i = stack.length - 1; i >= 0; i--) {
    const value = getEndTag ? getEndTag(stack[i]) : stack[i];
    if (value !== endTag) continue;
    stack.splice(i, 1);
    return true;
  }
  return false;
}



function lprc(ch) {
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
    os_put_font(ch, cursorx - 1, cursory - 1);
    cursorx++;
  }
}



function os_put_font(ch, x, y) {
  if (x >= 0 && x < 80 && y >= 0 && y < 24) {
    if (amiga_mode) {
      ch = `${ch}`; // workaround: amiga larn bank buttons are numbers, not strings

      // HACK HACk HAck Hack hack
      const HACK_URL_TEXT = `url`;
      if (ch.substring(0, 3) === HACK_URL_TEXT) {
        setImage(x, y, ch);
      } else {
        setChar(x, y, ch);
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
