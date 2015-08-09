todo:
- monster rooms
- traps
- show known spells while casting
- view known spells, potions, scrolls
- help screens
- intro screen
- warn player that back button, window close will kill the game
- save game
- take off armor
- wield '-'
- random mazes (especially on L1)
- spells: sph, alt, gen
- make sure difficulty > 0 is fully implemented
- scoreboard
- volcanic shaft pack weight check
- auto-pickup
- LRS

extras:
- shift-arrow to open door?
- put platinum dragon beside eye of larn
- global scoreboard, use hmac to secure?

bugs:
* rapidly withdrawing 1 gold from bank adds a 1 to the end of player.GOLD
  - need to do one more action before leaving bank?
* monsters move before missile spells are complete
- altars are broken?
- monsters 'disappear' infrequently when moving over specific squares
  - if you (re?)discover the square, they will always be visible again
- should lit 'discover' beyond where player has seen?
- is interest being paid correctly?
- missile char stays visible sometimes
- cell shows in previous location when descending H -> V1
- monsters can get trapped on edge of screen in wizard mode
- going up/down stairs can drop you onto a closed door, monster
- if you delete numbers (in bank, etc) to 0, you can't enter new numbers
- blindness is generally broken
  - go blind, move to a known place, kill a monster = black spot
  - cells not revealed when blind
  - monster identification when blind is unreliable
- no zzzzap you have been teleported?
- show what was worn/wielded?
- exiting bank before a deposit/withdraw/etc message is done locks the keyboard
- strextra can get out of balance?

rename/refactor:
- player.level.items[][] -> item
- player.level.monsters[][] -> monster
- player.level.know -> know
- item() -> return item at player.x/y
- arg() -> return item.arg at player.x/y
- monst() -> monster at player.x/y
- know(var) -> set know[][] at player.x/y
- getItem(x,y) -> itemAt(x,y)
- non_blocking isn't used any more
- callback nomenclature & functions could be improved
- napping
- IN_STORE
