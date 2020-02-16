One thing that was askew in your initial implementation was flex: 95%
If you're only after flex-grow, use the property directly rather than through the shorthand flex. Then it becomes easier to spot that flex-grow doesn't take % in but relative integer weights (1, 2, 3...)

ULARN:
- SUPPORT FOR OLDER BROWSERS
- scoreboard
- Dealer McDopes
- OHANDofFEAR
- update README.spoilers doc
- can you get back stolen items? YES -> int stealsomething()
  -- give all monsters inventory
  -- player.take, monster.take
  -- start monsters with gold and items in inventory
  -- remove stupid something() function
  -- try to not break savegames
- monster.isSlow, and different way to decide when to move
- monster.canfly, hashead?
- mimic
- amiga icons: magic items, demons & lucifer, elevator
- replace "." objects with larger dots
- eye of larn appraisal in bank
- need to redo all movement code to make hand of fear / scare monsters work
- async/await for keyboard input?
- update babel to support async/await for nap()
- eye of larn pickup/drop message
- why is bessman:1 for every old game?
- make sure ULARN ? x : y is wrapped in ()
- search for ULARN TODO
- player.raiseexperience (x)
check
- movemonst.c
- make sure gender seletion works for winning/losing conditions on scoreboard



todo:
- check chrome audit tab
- colors for dragons? other monsters
- config page
  - color monsters, artifacts, etc
  - colors on/off
  - walls as block, #, or joined ascii
  - no-beep
  - no-nap
  - keyboard hints
- "sorry, no mobile" message for larn.html
- warn if changing names because it's annoying on the scoreboard
- click / farlook to identify object
- show time in side inventory
- Save id to name and name to id map
- update history
- beep()
- help wiki (items/scrolls/potions/features/monsters/etc)
- most referenced to player.level should be replaced with functions
- what happens with haste self and haste monster at the same time?
- allow hitting escape while naps are happening (interrupt settimeout?)
- store local games with gameid



bugs:
* lots of monsters walking through wall. is there a problem with movesmart()?
* HAS + PER bug slow monsters (H,x,r,etc) move every moves, or totally paralyzed?
- closing a door (from on top of the door) when a monster is in the spot you were
  just in drops you back on the monsters spot. the monster reappears when you move.
- can't load game stats from local scoreboard (can't find game sdkjfhsdfkj)
- half speed monsters don't move with HAS on opposite move
- arrow buttons on help screen are truncated in amiga mode
- amiga mode: viewing scoreboard resets to classic mode (partially fixed)
- last local game shows as winner and loser
- better inventory layout, font selection with react?
- amiga mode: strikethrough missing on taxes owing after victory
- blindness
  - black tile when opening door when blind
  - when blind, a monster from an unknown tile will reveal the tile its standing on during attack
- rothe/poltergeist/vampire are born awake -> should they move during stealth?
- monster movement isn't shown after falling asleep
- casting sph twice in the same direction will always kill the player
- readmail() can report wrong gold/tax status (related to having a higher local score)


extras:
- url for scoreboard
- mle bounce off demon
- cloud save via password
- game start/end stats
- ipad support
- show other actions ("you have desecrated at the altar!" etc)
- add support for other wizard mode passwords
- give notification given when haste, aggravate monsters subsides (no?)
- start new game without reloading
- copy local scores to global
- color (mcolor/ocolor)
- more authentic font
- beep support
- stats on most dangerous monster, level, moves/kills/spells ratio
  - win/death ratio per difficulty
- speedrun mode
