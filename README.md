todo:
- warn player that back button, window close will kill the game
- save game
- drop gold
- random mazes (especially on L1)
- traps
- monster rooms
- monster special attacks
- spells: sph, alt
- make sure difficulty > 0 is fully implemented
- life protection
- scoreboard
- volcanic shaft pack weight check
- auto-pickup
- LRS

extras:
- shift-arrow to open door?
- put platinum dragon beside eye of larn
- non_blocking isn't used any more
bugs:
* monsters aren't hitting back :(
* altars are badly broken
* rapidly withdrawing 1 gold from bank adds a 1 to the end of player.GOLD
  - need to do one more action before leaving bank?
- monsters 'disappear' infrequently when moving over specific squares
  - if you (re?)discover the square, they will always be visible again
- cast lit at throne - gnome king == black spot
- should lit 'discover' beyond where player has seen?
- is interest being paid correctly?
- monsters move before missile spells are complete
- missile char stays visible sometimes
- monsters don't advance after range attacks (probably due to 2x monster move "fix")
- it looks like sometimes monster still attack twice
- cell shows in previous location when descending H -> V1
- monsters can get trapped on edge of screen in wizard mode
- cells not revealed when blind
- monster identification when blind is unreliable
- extra newline in omnidirect spells
- going up/down stairs can drop you onto a closed door, monster
- object detection showed an empty dot? also treasure fining?
- enter and exit building is counted as 2 moves
- if you delete numbers (in bank, etc) to 0, you can't enter new numbers
- go blind, move to a known place, kill a monster = black spot

rename:
- player.level.items[][] -> item
- player.level.monsters[][] -> monster
- player.level.know -> know
- getItem(x,y) -> itemAt(x,y)
