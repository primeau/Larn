todo:
- spells: sph
- help screens
- intro screen
- save game
- warn player that back button, window close will kill the game
- make sure difficulty > 0 is fully implemented
- scoreboard
- auto-pickup
- LRS
- add larn 12.4 to repo, and patch pit bug

extras:
- shift-arrow to open door?
- put platinum dragon beside eye of larn
- global scoreboard, use hmac to secure?
- improve smart monster movement beyond existing algorithm which gets stuck sometimes

bugs:
* rapidly withdrawing 1 gold from bank adds a 1 to the end of player.GOLD
    - need to do one more action before leaving bank?
* blindness is generally broken
    - go blind, move to a known place, kill a monster = black spot
    - cells not revealed when blind
    - monster identification when blind is unreliable
- if you delete numbers (in bank, etc) to 0, you can't enter new numbers
- is interest being paid correctly?
- exiting bank before a deposit/withdraw/etc message is done locks the keyboard
- strextra can get out of balance? caused by heroism/giant strength
- pressing ! at home after winning in cheat mode does wierd things
? altars are broken?
? monsters 'disappear' infrequently when moving over specific squares
? should lit 'discover' beyond where player has seen?
? missile char stays visible sometimes
? monsters can get trapped on edge of screen in wizard mode
? cell shows in previous location when descending H -> V1

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
- updateLog
- yrepcount
