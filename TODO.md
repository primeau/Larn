todo:
- google analytics
- wall spacing is different on different browsers
  - use canvas or webgl instead?
  - flexbox?
+ closed window alert is annoying -> create alert-on-close option?
+ switch to github pages?
+ build process
  + update build number in version commmand
  + minify
  + babel
- add gzip compression to nginx
- update wikipedia
- look for TODO/HACK
- checkpoints are choppy
  - save checkpoint in a thread?
  - break LEVELS into 14 sections & only save on level change
- scoreboard instructions on line 23/24 are pushed down too far by 1
- allow 5 key to stand still
- record levels visited on scoreboard


bugs:
* winning score not recorded??
+ sph does crazy things when you go up/down stairs
+ when blind, a monster from an unknown tile will reveal the tile its standing on during attack
- rothe/poltergeist/vampire are born awake -> should they move during stealth?
- gtime/rmst isn't properly displayed on scoreboard
- monster movement isn't shown after falling asleep
- casting sph twice in the same direction will always kill the player
- parsing < and > in lprcat() isn't perfect, especially with newlines, and tags at EOL
- multiple 'you have been slain' messages if you get killed by more than 1 monster
  - or waterlord hitting & getting with gusher (or other special attacks)
- readmail() can report wrong gold/tax status
- player depth isn't reported correctly in the save game details printout



build:
- install homebrew:  # (no) ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
- install npm/node:  # (no) brew install node
- install npm/node:  # (yes) https://nodejs.org/en/
- install babel:     # npm install -g babel
- install jslint:    # npm install -g jslint
- watch files:       # babel --watch JLarn/ --out-dir JLarn-lib/
- copy files:        # scp -P 1911 *.js ../JLarn/*.html jay@prim.io:/usr/share/nginx/html/larn
- commit changes:    # git commit -a -m "Our Hero has a nicer scoreboard"
- push to github     # git push origin master


parse:
- set up account key on parse.com
- install parse developer CLI:  # curl -s https://www.parse.com/downloads/cloud_code/installer.sh
- install account key:          # parse configure accountkey -d
- initialize:                   # parse new (they select 'e'xisting)
- start auto-deply tool         # parse develop larn


atom:
'.editor':
  'ctrl-alt-cmd-down': 'git-diff:move-to-next-diff'
  'ctrl-alt-cmd-up': 'git-diff:move-to-previous-diff'


extras:
- view data on current / finished game
- game start/end stats
- cloud save via password
- amiga-style images
- start new game without reloading
- copy local scores to global
- nerf the book and chest in the store to only be sellable for purchase price?
  - use negative arg special case to give book,chest same level
- put platinum dragon beside eye of larn
- highlight changed attributes
- color (mcolor/ocolor)
- improve smart monster movement beyond existing algorithm which gets stuck sometimes
- add larn 12.4.4 to repo
  - https://sites.google.com/site/edenicholas/roguelikes/win32-larn
  - patch pit bug // BUGFIX
  - patch smart monster movement // UPGRADE
- ipad support
- more authentic font
- shift-arrow to open door?


rename/refactor:
- remove player.level
- callback nomenclature & functions could be improved
- code variable in parse(), mainloop() is vestigal
- rename object.js to item.js
