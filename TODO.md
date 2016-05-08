bugs:
* no recovery if scoreboard hangs when loading
+ closed window alert is annoying -> create alert-on-close option?
- after winner (or losing?) with high score, newest score is also shown at bottom of board
- the game won't start in safari private browsing mode
- scoreboard request from parse can probably be done as one request
- amiga mode
  - strikethrough missing on taxes owing after victory
  - viewing scoreboard resets to classic mode
- blindness
  - black tile when opening door when blind
  - when blind, a monster from an unknown tile will reveal the tile its standing on during attack
+ smart monsters can walk over pits stop when standing on them?
- rothe/poltergeist/vampire are born awake -> should they move during stealth?
- monster movement isn't shown after falling asleep
- casting sph twice in the same direction will always kill the player
- readmail() can report wrong gold/tax status (related to having a higher local score)
- checkpoints are choppy
  - save checkpoint in a thread?
  - break LEVELS into 14 sections & only save on level change


extras:
* add store value of inventory to score to save people from having to sell everything at the end of a winning game
+ prevent stairs/shaft from being in treasure rooms
+ prevent volcano access when player level < 10(?)
  - "Alas, descending into the volcanic shaft is too challenging right now"
  - If < level 10 and we go with V0 idea: "you feel like you don't belong here" upon descent
- game start/end stats
- no notification given when haste monsters, aggravate subsides
- cloud save via password
- log all deaths?
- start new game without reloading
- copy local scores to global
- nerf stealth based on difficulty?
- put platinum dragon beside eye of larn
- color (mcolor/ocolor)
- improve smart monster movement beyond existing algorithm which gets stuck sometimes
- ipad support
- more authentic font
- 'you got the dirt off!' should remove 1 negative armor class for armor / shield
- beep support
- 'twitch' mode to broadcast and watch games (webrtc?)
- url for scoreboard
- stats on most dangerous monster, level, moves/kills/spells ratio
- hall of fame and bad luck scoreboards
* theres a way to pvnert, look around, then reload and not be 'cheating'


todo:
+ build process
  + update build number in version command
  + minify
  + babel
  + jshint?
  + parse cloud code
- update wikipedia, roguebasin, temple of the roguelike


rename/refactor:
- remove player.level, also very confusing with also having player.LEVEL
- callback nomenclature & functions could be improved
- rename object.js to item.js
- look for TODO/HACK


build:
- install homebrew:  # (no) ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
- install npm/node:  # (no) brew install node
- install npm/node:  # (yes) https://nodejs.org/en/
- install babel:     # npm install -g babel
- install eslint:    # npm install -g eslint
                     # npm install -g babel-eslint
- watch files:       # babel --watch JLarn/ --out-dir JLarn-out/
- copy files:        # scp -P 1911 *.js ../JLarn/*.html jay@prim.io:/usr/share/nginx/html/larn
- commit changes:    # git commit -a -m "Our Hero has a nicer scoreboard"
- push to github     # git push origin master


parse:
- set up account key on parse.com
- install parse developer CLI:  # curl -s https://www.parse.com/downloads/cloud_code/installer.sh
- install account key:          # parse configure accountkey -d
- initialize:                   # parse new (then select 'e'xisting)
- start auto-deply tool         # parse develop larn


node / express / mongo
npm install -g express-generator


atom:
'.editor':
  'ctrl-alt-cmd-down': 'git-diff:move-to-next-diff'
  'ctrl-alt-cmd-up': 'git-diff:move-to-previous-diff'
