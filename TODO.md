todo:
- wall spacing is different on different browsers:
  - detect browser? http://stackoverflow.com/questions/14633947/alternative-css-font-settings-for-different-browsers
- walls look ugly on windows
- closed window alert is a bit annoying
  - check for gameover
- use mousetrap to parse special keys, parse() for the rest
- update build number in version commmand
- minify
- look for TODO/HACK
- checkpoints are choppy
  - save checkpoint in a thread?
  - break LEVELS into 14 sections & only save on level change
- test aggravate monster (should disable stealth too?)
- test haste monsters
- scoreboard to show inventory, other player info
- update wikipedia
- nap & show monster movement during when falling asleep


bugs:
+ disable home/end/pgup/pgdown default
+ shift+numpad doesn't work
+ bank, deposit, escape -> nothing happens
+ altar, pray, escape -> nothing happens
* drop gold, escape -> NaN gold!

+ hitting ESC on game start/deposit/withdrawal prints 27, backspace deletes one too many chars
- rothe/poltergeist/vampire should be born awake -> should they move during stealth?
- casting sph twice in the same direction will always kill the player
- parsing < and > in lprcat() isn't perfect, especially with newlines, and tags at EOL
- multiple 'you have been slain' messages if you get killed by more than 1 monster
- ie & safari don't like the '`' character


extras:
- global scoreboard, use hmac to secure?
- put platinum dragon beside eye of larn
- secure save game (save hash key in a cookie)
- highlight changed attributes
- color (mcolor/ocolor)
- improve smart monster movement beyond existing algorithm which gets stuck sometimes
- add larn 12.4.4 to repo
  - https://sites.google.com/site/edenicholas/roguelikes/win32-larn
  - patch pit bug // BUGFIX
  - patch smart monster movement // UPGRADE
- ipad support
- more authentic font
- shift-arrow to open door?


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
- oldx, oldy
