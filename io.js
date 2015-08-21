"use strict";

var cursorx = 1;
var cursory = 1;

var current_attr = null;


var display = initGrid(80, 24);

function lprintf(str, width) {
  if (width != null) {
    lprcat(padString(str, width));
  } else {
    lprcat(str);
  }
}



function padString(str, width) {
  if (width == null || width == 0) return str;
  var spaces = Array(Math.abs(width) + 1 - str.length).join(" ");
  if (width < 0) {
    return str + spaces;
  } else {
    return spaces + str;
  }
}



function lprcat(str, width) {

  if (width) {
    lprintf(str, width);
    return;
  }
  DEBUG_LPRCAT++;

  // if (messages_on && cursory == 24) play_message_sound(str);
  // int save_attr = current_attr;
  // if (messages_on && cursory >= 20 && cursory <= 24) current_attr = MESSAGE_ATTR;

  var len = str.length;
  var tag = false;
  var tagstring = "";
  var endtag = false;
  for (var i = 0; i < len; i++) {
    var c = str[i];
    var newline = (c == '\n');
    if (c == '<') {
      tag = true;
    }
    if (tag) {
      tagstring += c;
      if (c == '>' || newline) {
        endtag = true;
        if (!newline) continue;
        if (i != len - 1) continue; // close tag if at end of string
      }
      if (endtag) {
        endtag = false;
        tag = false;
        lprc(tagstring);
        tagstring = "";
      }
    } else {
      lprc(str[i]);
    }
  } // current_attr = save_attr;
}



function cursor(x, y) {
  cursorx = x;
  cursory = y;
}



function cursors() {
  cursor(1, 24);
}


var messages_on = false;

function lprc(ch) {

  DEBUG_LPRC++;

  if (ch == '\b') {
    cursorx--;
    os_put_font(' ', current_attr, cursorx - 1, cursory - 1);
  } else if (ch == '\n') {
    cursorx = 1;
    if (cursory == 24 && messages_on) os_scroll_down(20 - 1, 24 - 1); //TODO
    else cursory++;
  } else {
    var n = 1;

    // if (ch == '\t') {
    //   ch = ' ';
    //   n = 4;
    // }

    // while (n--) {
    os_put_font(ch, current_attr, cursorx - 1, cursory - 1);
    cursorx++;
    // }
  }
}


function os_scroll_down(x1, x2) {
  // TODO
}



function os_put_font(ch, attr, x, y) {
  if (x >= 0 && x < 80 && y >= 0 && y < 24)
  // CharAttr1[80 * y + x] = (ch & 255) | ((attr & 255) << 8);
  // display[80 * y + x] = ch;
    display[x][y] = ch;
}



function clear() {
  // TODO
  // if (messages_on) {
  //   messages_on = 0;
  //   os_save_restore_area(0, 0, 20 - 1, 80 - 1, 24 - 1);
  //   messages_saved = 1;
  // }

  for (var y = 1; y <= 24; y++) {
    var n = 80;
    cursor(1, y);
    while (n--) lprc(' ');
  }
  cursor(1, 1);
}


function cltoeoln() {
  var x = cursorx;
  var n = 80 + 1 - x;
  while (n-- > 0) lprc(' ');
  cursorx = x;
}


function cl_up(x, y) {
  for (var i = 1; i <= y; i++) {
    var n = 80;
    cursor(1, i);
    while (n--) lprc(' ');
  }
  cursor(x, y);
}



function cl_dn(x, y) {
  for (var i = y; i <= 24; i++) {
    var n = 80;
    cursor(1, i);
    while (n--) lprc(' ');
  }
  cursor(x, y);
}



function lflush() {
  LOG = [""];
}
