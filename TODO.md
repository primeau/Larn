bugs:
* hit monster from beyond range, it may not chase in the right dir, or may get stuck
* red wizard demon prince bug?
* can't load most recent game if you go to scoreboard too fast
* warn if changing names because it's annoying on the scoreboard
* monsters will follow when running with STP
* 1/2 move monsters (Hobgoblins, etc) sometimes follow 1:1 when running
* better inventory layout, font selection with react?
* arrow buttons on help screen are truncated in amiga mode
+ player killed with range spell should drop gold/items beside corpse, not player
* take and a few other commands use a turn even if nothing is there to be taken
* thrift shoppe re-orders list after sale?
* quit doesn't work?
* amiga mode: viewing scoreboard resets to classic mode (partially fixed)
* local games show as winner and loser?

* no recovery if scoreboard hangs when loading
- scoreboard request from parse can probably be done as one request
  - should just have a dedicated scoreboard table
- amiga mode: strikethrough missing on taxes owing after victory
- blindness
  - black tile when opening door when blind
  - when blind, a monster from an unknown tile will reveal the tile its standing on during attack
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
- add store value of inventory to score to save people from having to sell everything at the end of a winning game
- url for scoreboard
- cloud save via password
- start new game without reloading
- copy local scores to global
- color (mcolor/ocolor)
- ipad support
- more authentic font
- beep support
- stats on most dangerous monster, level, moves/kills/spells ratio
  - win/death ratio per difficulty
- hall of fame and bad luck scoreboards
