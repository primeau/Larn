todo:
- shift-arrow to open door?
- put platinum dragon beside eye of larn
- warn player that back button, window close will kill the game
- drop gold
- auto-pickup
- random mazes (especially on L1)
- traps
- monster rooms
- monster special attacks
- spells: sph, alt
- Home
- make sure difficulty > 0 is fully implemented
- winning
- volcanic shaft pack weight check
- LRS

bugs:
- altars are badly broken
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
- going up/down stairs can drop you onto a closed door
- bank messages aren't printed out
- store messages aren't printed out
- object detection showed an empty dot? also treasure fining?
- enter and exit building is counted as 2 moves

rename:
- player.level.items[][] -> item
- player.level.monsters[][] -> monster
- player.level.know -> know
- getItem(x,y) -> itemAt(x,y)
