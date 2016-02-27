todo:
- wall spacing is different on different browsers
+ closed window alert is annoying -> create alert-on-close option?
+ switch to github pages?
+ build process
  + update build number in version command
  + minify
  + babel
  + jshint?
  + parse cloud code
- add gzip compression to nginx
- update wikipedia, roguebasin, temple of the roguelike
- look for TODO/HACK
- scoreboard request from parse can probably be done as one request


bugs:
- having two toggle keys for amiga / classic / hack is confusing
* no move should register when a non-functional key is pressed (ie 't' on an empty square, or 'm')
* no recovery if scoreboard hangs when loading
+ amiga mode
  - wall spacing is different on different browsers
  - invisible stalker / see invisible is broken
  - missile spells distort the row the player is on
  - demons are the wrong sized empty tile
     - potion line 301: Uncaught TypeError: Cannot read property 'img/m65.png' of null
     - regen line 73: Uncaught TypeError: Cannot read property 'img/o0.png' of null
  - strikethrough missing on taxes owing after victory
  - wall graphics are wrong when blind
  - can't click for details on scoreboard
  - many font/spacing issues in text
  - &lt, &gt on help menu
- black tile when opening door when blind
+ smart monsters who can walk over pits stop when standing on them
- after winner (or losing?) with high score, newest score is also shown at bottom of board
+ when blind, a monster from an unknown tile will reveal the tile its standing on during attack
- rothe/poltergeist/vampire are born awake -> should they move during stealth?
- monster movement isn't shown after falling asleep
- casting sph twice in the same direction will always kill the player
- parsing < and > in lprcat() isn't perfect, especially with newlines, and tags at EOL
- readmail() can report wrong gold/tax status
- checkpoints are choppy
  - save checkpoint in a thread?
  - break LEVELS into 14 sections & only save on level change


extras:
* add store value of inventory to score to save people from having to sell everything at the end of a winning game
+ prevent stairs/shaft from being in treasure rooms
- prevent volcano access when player level < 10(?)
- game start/end stats
- no notification when haste monsters, aggravate subsides
- cloud save via password
- start new game without reloading
- copy local scores to global
- nerf the book and chest in the store to only be sellable for purchase price?
  - use negative arg special case to give book, chest same level
- nerf stealth based on difficulty?
- put platinum dragon beside eye of larn
- color (mcolor/ocolor)
- improve smart monster movement beyond existing algorithm which gets stuck sometimes
- ipad support
- more authentic font
- 'you got the dirt off!' should remove negative armor class for armor / shield
- beep support
- 'twitch' mode to broadcast and watch games (webrtc?)
- altars should crumble to dust after too many prayer to prevent too many +AC/WC
- url for scoreboard
- stats on most dangerous monster, level, moves/kills/spells ratio
- hall of fame and bad luck scoreboards


rename/refactor:
- remove player.level
- callback nomenclature & functions could be improved
- rename object.js to item.js


build:
- install homebrew:  # (no) ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
- install npm/node:  # (no) brew install node
- install npm/node:  # (yes) https://nodejs.org/en/
- install babel:     # npm install -g babel
- install eslint:    # npm install -g eslint
                     # npm install -g babel-eslint
- watch files:       # babel --watch JLarn/ --out-dir JLarn-lib/
- copy files:        # scp -P 1911 *.js ../JLarn/*.html jay@prim.io:/usr/share/nginx/html/larn
- commit changes:    # git commit -a -m "Our Hero has a nicer scoreboard"
- push to github     # git push origin master


parse:
- set up account key on parse.com
- install parse developer CLI:  # curl -s https://www.parse.com/downloads/cloud_code/installer.sh
- install account key:          # parse configure accountkey -d
- initialize:                   # parse new (then select 'e'xisting)
- start auto-deply tool         # parse develop larn


atom:
'.editor':
  'ctrl-alt-cmd-down': 'git-diff:move-to-next-diff'
  'ctrl-alt-cmd-up': 'git-diff:move-to-previous-diff'
