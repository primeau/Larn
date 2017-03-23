bugs:

* amiga mode: viewing scoreboard resets to classic mode (partially fixed)
? inventory stays on screen after d,space,*
+ player killed with range spell should drop gold/items beside corpse, not player
* no recovery if scoreboard hangs when loading
+ closed window alert is annoying -> create alert-on-close option?
- scoreboard request from parse can probably be done as one request
- amiga mode: strikethrough missing on taxes owing after victory
- blindness
  - black tile when opening door when blind
  - when blind, a monster from an unknown tile will reveal the tile its standing on during attack
+ smart monsters can walk over pits stop when standing on them?
- rothe/poltergeist/vampire are born awake -> should they move during stealth?
- monster movement isn't shown after falling asleep
- casting sph twice in the same direction will always kill the player
- readmail() can report wrong gold/tax status (related to having a higher local score)


extras:
* click to identify object
* show other actions ("you have desecrated at the altar!" etc)
- add support for other wizard mode passwords
- game start/end stats
- give notification given when haste, aggravate monsters subsides (no?)
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
- stats on most dangerous monster, level, moves/kills/spells ratio
- hall of fame and bad luck scoreboards
