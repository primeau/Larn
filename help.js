'use strict';

const helppages = [];

var currentpage = 0;



function parse_help(key) {
  nomove = 1;
  if (key == ESC) {
    return exitbuilding();
  } else if (key == ' ') {
    print_help();
  }
}



function print_help() {
  mazeMode = false;

  clear();

  if (++currentpage > helppages.length - 1) {
    currentpage = 1;
  }
  lprcat(helppages[currentpage]);
  cursors();
  lprcat(`              ---- Press <b>space</b> for more help, <b>escape</b> to exit ----`);

  blt();
}

function initHelpPages() {

helppages[0] =
    `Welcome to the game of ${GAMENAME}. At this moment, you face a great problem.\n\
Your daughter has contracted a strange disease, and none of your home remedies\n\
seem to have any effect. You sense that she is in mortal danger, and you must\n\
try to save her. Time ago you heard of a land of great danger and opportunity.\n\
Perhaps here is the solution you need.\n\
\n\
    It has been said that there once was a great magician who called himself\n\
Polinneaus. Many years ago, after having many miraculous successes, Polinneaus\n\
retired to the caverns of ${GAMENAME}, where he devoted most of his time to the\n\
creation of magic. Rumors have it that one day Polinneaus set out to dispel\n\
an attacking army in a forest some distance to the north. It is believed that\n\
here he met his demise.\n\
\n\
    The caverns of ${GAMENAME}, it is thought, must be magnificent in design,\n\
and contain much magic and treasure. One option you have is to undertake a\n\
journey into these caverns.\n\
\n\
\n\
    Good Luck!  You're going to need it!\n\
`;

helppages[1] =
`                      <b>Help File for The Caverns of ${GAMENAME}</b>                 \n\
                                                                          shift+\n\
 y|Y  move|run northwest  k|K  move|run up    u|U  move|run northeast      ↖↑↗  \n\
 h|H  move|run left        .   stay here      l|L  move|run right         ←    →\n\
 b|B  move|run southwest  j|J  move|run down  n|N  move|run southeast      ↙↓↘  \n\
                                                                          to run\n\
                              A  desecrate an altar       <  go up stairs       \n\
  c  cast a spell             C  close a door             >  go down stairs     \n\
  d  drop an item             D  drink at a fountain                            \n\
  e  eat something            E  enter a store, dungeon   ^  identify a trap    \n\
  f  tidy up at a fountain       or volcanic shaft        :  look at object you \n\
  g  get present pack weight                                 are standing on    \n\
  i  inventory your pockets   I  list all known items                           \n\
  o  open a door or chest                                 !  toggle key hints   \n\
  p  pray at an altar         P  give tax status          @  toggle auto-pickup \n\
  q  quaff a potion           Q  quit the game            #  toggle inventory   \n\
  r  read a scroll or book    R  remove gems from throne                        \n\
  s  sit on a throne          S  save the game            }  toggle between     \n\
  t  take an item             T  take off armor              classic, hack,     \n\
  v  print program version                                   and amiga graphics \n\
  w  wield a weapon           W  wear armor                                     \n\
  z  show scores              Z  teleport yourself        ?  this help screen   \n\
  `;


helppages[2] =
`                                <b>Special Notes</b> \n\
\n\
When dropping gold, if you type '<b>*</b>' as your amount, all your gold is dropped.\n\
In general, typing in '<b>*</b>' means all of what you're interested in. This is true\n\
when visiting the bank, or when contributing at altars.\n\
\n\
When in the store, trading post, school, or home, an <b>escape</b> will get you out.\n\
\n\
When casting a spell, if you need a list of spells you can cast, type <b>space</b> \n\
at any time and the available list of spells will be shown.\n\
\n\
When an inventory list is on the screen from a drop, quaff, read, or similar\n\
command, you can type the letter of the object that you wish to act apon,\n\
without having to type a space to get back to the prompt.\n\
\n\
If NumLock is off, the Keypad functions in the obvious way for movement. Hold\n\
Shift when pressing any direction on the Keypad to run in that direction. The\n\
5 key on the Keypad is the same as 'stay here', which really means skip your\n\
turn.\n\
`;

helppages[3] =
`                     <b>Background Information for ${GAMENAME}</b> \n\
\n\
    Welcome to the game of ${GAMENAME}. At this moment, you face a great problem.\n\
Your daughter has contracted a strange disease, and none of your home remedies\n\
seem to have any effect. You sense that she is in mortal danger, and you must\n\
try to save her. Time ago you heard of a land of great danger and opportunity.\n\
Perhaps here is the solution you need.\n\
\n\
    It has been said that there once was a great magician who called himself\n\
Polinneaus. Many years ago, after having many miraculous successes, Polinneaus\n\
retired to the caverns of ${GAMENAME}, where he devoted most of his time to the\n\
creation of magic. Rumors have it that one day Polinneaus set out to dispel\n\
an attacking army in a forest some distance to the north. It is believed that\n\
here he met his demise.\n\
\n\
    The caverns of ${GAMENAME}, it is thought, must be magnificent in design,\n\
and contain much magic and treasure. One option you have is to undertake a\n\
journey into these caverns.\n\
\n\
    Good Luck!  You're going to need it!\n\
`;

helppages[4] =
`                 <b>Explanation of the ${GAMENAME} scoreboard facility</b> \n\
\n\
${GAMENAME} supports TWO scoreboards, one for winners, and one for deceased\n\
characters. Each player (by the name entered when you start the game)\n\
is allowed one slot on each scoreboard. This design helps ensure that \n\
frequent players of ${GAMENAME} do not hog the scoreboard, and gives more\n\
players a chance for glory. Level of difficulty is also noted on the\n\
scoreboards, and this takes precedence over score for determining what\n\
entry is on the scoreboard. For example: if 'Yar, the Bug Slayer' has\n\
a score of 128003 on the scoreboard at diff 0, then a game at diff 1\n\
and a score of 4112 would replace the previous entry on the scoreboard.\n\
Note that when a player dies, the inventory is stored in the scoreboard\n\
so that everyone can see what items the player had at the time of death.\n\
`;

}