todo:
- Thrift Shop
- view inventory
- warn player that back button will kill the game
- drop gold
- random mazes (especially on L1)
- traps
- monster rooms
- monster special attacks
- spells: sph, alt
- College
- Home
- make sure difficulty > 0 is fully implemented
- winning
- volcanic shaft pack weight check
- LRS

bugs:
- altars are badly broken
- monsters move before missile spells are complete
- missile char stays visible sometimes
- monsters don't advance after range attacks (probably due to 2x monster move "fix")
- cell shows in previous location when descending H -> V1
- monsters can get trapped on edge of screen in wizard mode
- cells not revealed when blind
- monster identification when blind is unreliable
- extra newline in omnidirect spells
- going up/down stairs can drop you onto a closed door

rename:
- player.level.items[][] -> item
- player.level.monsters[][] -> monster
- player.level.know -> know
- getItem(x,y) -> itemAt(x,y)
