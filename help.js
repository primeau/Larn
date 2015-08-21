"use strict";

const helppages = [];

helppages[0] =
    "Welcome to the game of Larn.  At this moment, you face a great problem.\n\
Your daughter has contracted a strange disease, and none of your home remedies\n\
seem to have any effect.  You sense that she is in mortal danger, and you must\n\
try to save her.  Time ago you heard of a land of great danger and opportunity.\n\
Perhaps here is the solution you need.\n\
\n\
    It has been said that there once was a great magician who called himself\n\
Polinneaus.  Many years ago, after having many miraculous successes, Polinneaus\n\
retired to the caverns of Larn, where he devoted most of his time to the\n\
creation of magic.   Rumors have it that one day Polinneaus set out to dispel\n\
an attacking army in a forest some distance to the north.  It is believed that\n\
here he met his demise.\n\
\n\
    The caverns of Larn, it is thought, must be magnificent in design,\n\
and contain much magic and treasure.  One option you have is to undertake a\n\
journey into these caverns.\n\
\n\
\n\
    Good Luck!  You're going to need it!\n\
";

helppages[1] =
"                      <b>Help File for The Caverns of Larn</b>               \n\
                                                                              \n\
 y|Y  move|run northwest     k|K  move|run up            u|U  move|run northeast\n\
 h|H  move|run left           .   stay here              l|L  move|run right    \n\
 b|B  move|run southwest     j|J  move|run down          n|N  move|run southeast\n\
                                                                              \n\
                              A  desecrate an altar       &lt  go up stairs or\n\
  c  cast a spell             C  close a door                volcanic shaft   \n\
  d  drop an item             D  drink at a fountain                          \n\
  e  eat something            E  enter a store, dungeon   &gt  go down stairs or\n\
  f  tidy up at a fountain                                   volcanic shaft   \n\
  g  get present pack weight  G  remove gems from throne                      \n\
  i  inventory your pockets   I  list all known items     ^  identify a trap  \n\
  o  open a door or chest                                                     \n\
  p  pray at an altar         P  give tax status          :  look at object you\n\
  q  quaff a potion           Q  <strike>quit the game</strike>               are standing on\n\
  r  read a scroll            R  restore a saved game                         \n\
  s  sit on a throne          S  save the game            @  <strike>toggle auto-pickup</strike> \n\
  t  take an item             T  take off armor                               \n\
  v  print program version                                                    \n\
  w  wield a weapon           W  wear armor                                   \n\
  z  <strike>show scores</strike>              Z  teleport yourself        ?  this help screen \n\
  ";


helppages[2] =
"                                <b>Special Notes</b> \n\
\n\
When dropping gold, if you type '<b>*</b>' as your amount, all your gold gets dropped.\n\
In general, typing in '<b>*</b>' means all of what your interested in.  This is true\n\
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
5 key on the Keypad is the same as \"stay here\", which really means skip your\n\
turn.\n\
";

helppages[3] =
"                     <b>Background Information for Larn</b> \n\
\n\
    Welcome to the game of Larn.  At this moment, you face a great problem.\n\
Your daughter has contracted a strange disease, and none of your home remedies\n\
seem to have any effect.  You sense that she is in mortal danger, and you must\n\
try to save her.  Time ago you heard of a land of great danger and opportunity.\n\
Perhaps here is the solution you need.\n\
\n\
    It has been said that there once was a great magician who called himself\n\
Polinneaus.  Many years ago, after having many miraculous successes, Polinneaus\n\
retired to the caverns of Larn, where he devoted most of his time to the\n\
creation of magic.   Rumors have it that one day Polinneaus set out to dispel\n\
an attacking army in a forest some distance to the north.  It is believed that\n\
here he met his demise.\n\
\n\
    The caverns of Larn, it is thought, must be magnificent in design,\n\
and contain much magic and treasure.  One option you have is to undertake a\n\
journey into these caverns.\n\
\n\
    Good Luck!  You're going to need it!\n\
";

helppages[4] =
"                 <b>Explanation of the Larn scoreboard facility</b> \n\
\n\
    Larn supports TWO scoreboards, one for winners, and one for deceased\n\
characters.  Each player (by the name entered when you start the game)\n\
is allowed one slot on each scoreboard, if the score is in the top ten for\n\
that scoreboard.  This design helps insure that frequent players of Larn\n\
do not hog the scoreboard, and gives more players a chance for glory.  Level\n\
of difficulty is also noted on the scoreboards, and this takes precedence\n\
over score for determining what entry is on the scoreboard.  For example:\n\
if \"Yar, the Bug Slayer\" has a score of 128003 on the scoreboard at diff 0,\n\
then a game at diff 1 and a score of 4112 would replace the previous\n\
entry on the scoreboard.  Note that when a player dies, the inventory is\n\
stored in the scoreboard so that everyone can see what items the player had\n\
at the time of death.\n\
";
