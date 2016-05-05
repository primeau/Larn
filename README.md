[You can play Larn here](http://prim.io/larn/ "You can play Larn here")


JS LARN version 12.4.5
======================

Introduction
------------

LARN is a dungeon type adventure game similar in concept to HACK, ROGUE
or MORIA, but with a different feel and winning criteria.


History and Other Information
-----------------------------
Noah Morgan originally created LARN 12.0 and released the UNIX
version to the USENET in 1986.  Don Kneller ported the UNIX
version to MSDOS (both IBM PCs and DEC Rainbows).

Other contributors from this era include:
- James McNamara: UNIX install notes, source and patch distribution
- Fred Fish: Termcap support for VMS port
- Daniel Kegel: Enhanced ansi terminal decoding for DOS
- Alexander Perry: Port for Linux 2.x kernel and GCC 3.x

Kevin Routley contributed various LARN enhancements. Version 12.1 had
a limited distribution. Version 12.2 was distributed to the Usenet
community. Version 12.3 was the last version released by Kevin.

Someone made 12.4 through 12.4.2, possibly copx according to
roguebasin. Edwin Denicholas took 12.4 alpha 2 and caressed it into
12.4.3 for Win32. Verson 12.4.4 includes a bugfix from Joe Neff.

Other editions of Larn have been distributed by others, namely
LARN13, Ultra-Larn, and NLarn.

This is a JavaScript port of Larn, by Jason Primeau. It primarily uses
the 12.4.4 codebase and includes a couple of small fixes, a global scoreboard,
and minor updates to balance the game at higher difficulties, bumping the
version number to 12.4.5.

I hope you enjoy this version of LARN.

[Larn's version history can be found here](https://github.com/primeau/Larn/blob/master/history.md "Larn's version history can be found here")


WIZARD mode
-----------
There is a WIZARD mode for testing features of the game.  To get into WIZARD
mode, type in an underscore '_' and answer the prompt for the password with
'pvnert(x)' (do not enter the quotes).  Wizards are non-scoring characters that
get magic mapping, everlasting expanded awareness and one of every object in
the game.

Since it's easy to lose your game due to a browser crash, accidental back
button press, or closed tab, there are 2 new 'wizard' passwords. Using the
password 'checkpoint' will load a backup of a checkpoint file, and 'savegame'
will resurrect a previous save game. Obviously this can be used to cheat,
but it was already pretty easy to cheat before. Be honorable, always.


License
-------
If you can profit from this code, I will be sincerely impressed.
