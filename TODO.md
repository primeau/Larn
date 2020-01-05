One thing that was askew in your initial implementation was flex: 95%
If you're only after flex-grow, use the property directly rather than through the shorthand flex. Then it becomes easier to spot that flex-grow doesn't take % in but relative integer weights (1, 2, 3...)

ULARN:
- gender selection
- character class selection
- scoreboard
- helpfile
- colors on/off
- winner messages
- can you get back stolen items? YES -> int stealsomething
  -- give all monsters inventory
  -- player.take, monster.take
  -- start monsters with gold and items in inventory
  -- remove stupid something() function
  -- try to not break savegames
- monster.isSlow, and different way to decide when to move
- monster.canfly, hashead?
- lucifer not visible even when carrying eye? 
- mimic
- amiga icons: magic items, demons & lucifer, elevator
- make sure ULARN ? x : y is wrapped in ()
- search for ULARN TODO
- eye of larn appraisal in bank
- need to redo all movement code to make hand of fear / scare monsters work
- async/await for keyboard input?
- update babel to support async/await for nap()
- eye of larn pickup/drop message
- Dealer McDopes
- OANNIHILATION?
- OHANDofFEAR
- OSPHTALISMAN
- DEMONPRINCE, LUCIFER (drain life etc)
- update spoilers doc
- Who are you?
- Pick a character class...
- So, what are ya?
check
- makeplayer()
- scprob[], potprob[]
- header.h
- newobject(lev, i)
- makemonst
- ostairs
- player.c, player.j
- movemonst.c
- regen.c
- sphere.c
- sethard()



todo:
- check chrome audit tab
- colors for dragons? other monsters
- config page
  - color monsters, artifacts, etc
  - walls as block, #, or joined ascii
  - beep
  - nonap
  - keyboard hints
- "sorry, no mobile" message for larn.html
- warn if changing names because it's annoying on the scoreboard
- click / farlook to identify object
- show time in side inventory
- Save id to name and name to id map


bugs:
* lots of monsters walking through wall. is there a problem with movesmart()?
* HAS + PER bug slow monsters (H,x,r,etc) move every moves, or totally paralyzed?
* fall through bottomless trap door on E15 drops you into V1
- casting SPH against an outer wall kills the player 3 times. that seems excessive
- closing a door (from on top of the door) when a monster is in the spot you were
  just in drops you back on the monsters spot. the monster reappears when you move.
- can't load game stats from local scoreboard (can't find game sdkjfhsdfkj)
- half speed monsters don't move with HAS on opposite move
- arrow buttons on help screen are truncated in amiga mode
- take and a few other commands use a turn even if nothing is there to be taken
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
