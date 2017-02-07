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
+ always show inventory, knows scrolls, potions, spells
- add support for other wizard mode passwords
- game start/end stats
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
