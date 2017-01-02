bugs:
* no recovery if scoreboard hangs when loading
+ closed window alert is annoying -> create alert-on-close option?
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
- game start/end stats
- prevent 'trapped in solid rock' after casting WTW
- give notification given when haste, aggravate monsters subsides
- improve smart monster movement beyond existing algorithm which gets stuck sometimes
+ add store value of inventory to score to save people from having to sell everything at the end of a winning game
+ prevent stairs/shaft from being in treasure rooms
- url for scoreboard
- cloud save via password
- start new game without reloading
- copy local scores to global
- color (mcolor/ocolor)
- ipad support
- more authentic font
- beep support
- 'twitch' mode to broadcast and watch games (webrtc?)
- stats on most dangerous monster, level, moves/kills/spells ratio
- hall of fame and bad luck scoreboards
* theres a way to pvnert, look around, then reload and not be 'cheating'


todo:
+ build process
  + update build number in version command
  + minify
  + babel
  + jshint?
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


atom: keymap.cson
'.editor':
  'ctrl-alt-cmd-down': 'git-diff:move-to-next-diff'
  'ctrl-alt-cmd-up': 'git-diff:move-to-previous-diff'
