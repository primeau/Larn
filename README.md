# JS LARN Version 12.5.2


## Play Online
[You can play Larn online at larn.org](https://larn.org "You can play Larn online here")


## To Play Locally 
- [download a zipfile of the repository](https://github.com/primeau/Larn/archive/refs/heads/master.zip "download a zipfile of the repository")
- open larn_local.html in your browser and play
- viewing the scoreboard and recording high scores won't work


## Build Instructions For Development
```
$ git clone https://github.com/primeau/Larn.git
$ cd Larn
$ npm install
$ npm run build
$ python3 -m http.server 8000
$ http://localhost:8000/dist/larn/larn.html

```

## Introduction

LARN is a dungeon type adventure game similar in concept to HACK, ROGUE
or MORIA, but with a different feel and winning criteria.


## History and Other Information
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
12.4.3 for Win32. Version 12.4.4 includes a bugfix from Joe Neff.

Ularn was written in 1987 by Phil Cordier at UC Santa Cruz. 
Version 1.5.1 was released by David Richerby and future 1.5.x versions
were developed by Josh Brandt. Version 1.6 was a Windows 32 conversion 
and refactor by Julian Olds. Ularn is currently maintained by Josh Bressers.

Other editions of Larn have been distributed by others, namely
LARN13, dLarn, NLarn, ReLarn, and XLarn.

JSLarn 12.5.2 is a JavaScript port of Larn and Ularn, by Jason Primeau. 
It primarily references the Larn 12.4.4 and Ularn 1.5.4 codebases but takes 
inspiration from other versions as well. It includes bug fixes, a global 
scoreboard, watching live replays, mobile support and updates to balance the
game at higher difficulties.

I hope you enjoy this version of LARN.

[Larn's version history can be found here](https://github.com/primeau/Larn/blob/master/history.md "Larn's version history can be found here")


## WIZARD mode
There is a WIZARD mode for testing features of the game.  To get into WIZARD
mode, type in an underscore '_' and answer the prompt for the password with
'`pvnert(x)`' (do not enter the quotes).  Wizards are non-scoring characters that
get magic mapping, everlasting expanded awareness and one of every object in
the game.

Since it's easy to lose your game due to a browser crash, accidental back
button press, or closed tab, there are 2 new 'wizard' passwords. Using the
password 'checkpoint' will load a backup of a checkpoint file, and 'savegame'
will resurrect a previous save game. These games are excluded from the 
scoreboard due to rampant cheating. 


## Acknowledgements

Many thanks to BrowserStack for supporting this open source project with a free
license to improve cross-browser support.

[![BrowserStack](https://larn.org/browserstack.png)](https://www.browserstack.com/)
