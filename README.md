todo:
* warn player that back button, window close will kill the game
* scoreboard
* disable debugging shortcuts
* wizard mode
* firefox / ie / safari support
* clear saved game after loading, death
- prompt if they have a saved game and ask to load or show how to reload
- tighten up bottomline() printing
- update build number in version commmand
- nap & show monster movement during when falling asleep
- auto-pickup
- secure save game (save hash key in a cookie)
- store logname and last difficulty to use as defaults, also haswon, taxes
- add player, levels to gamestate for saving
- move known* to player

extras:
- hack-style characters
- change drink at fountain to F?
- highlight changed attributes
- color (mcolor/ocolor)
- put platinum dragon beside eye of larn
- global scoreboard, use hmac to secure?
- shift-arrow to open door?
- improve smart monster movement beyond existing algorithm which gets stuck sometimes
- add larn 12.4 to repo, and patch pit bug
- ipad support

bugs:
* game hangs going down stairs???? debug mode only???
* blindness is generally broken
    - go blind, move to a known place, kill a monster = black spot
    - cells not revealed when blind
    - monster identification when blind is unreliable
* interest accumulates at bank immediately after leaving/returning
- hitting ESC during deposit/withdrawal prints 27, backspace deletes one too many chars
- strextra can get out of balance? caused by heroism/giant strength
- casting sph twice in the same direction will always kill the player
- parsing < and > in lprcat() isn't perfect, especially with newlines, and tags at EOL
? altars are broken?
? should lit 'discover' beyond where player has seen?
? rapidly withdrawing 1 gold from bank adds a 1 to the end of player.GOLD
    - need to do one more action before leaving bank?

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
