todo:
+ if a player has more than one top-10 score, the scoreboard will have one too few entries
- wall spacing is different on different browsers:
  - detect browser? http://stackoverflow.com/questions/14633947/alternative-css-font-settings-for-different-browsers
- walls look ugly on windows
+ closed window alert is annoying -> create alert-on-close option?
+ update build number in version commmand
- minify
- look for TODO/HACK
- checkpoints are choppy
  - save checkpoint in a thread?
  - break LEVELS into 14 sections & only save on level change
- log gtime/rmst properly on scoreboard
- update wikipedia
- nap & show monster movement during when falling asleep
- merge hash into saved state
- add gzip compression to nginx
- separate gold & bankaccount on scoreboard
- scoreboard instructions on line 23/24 are pushed down too far by 1


bugs:
+ shift+numpad doesn't work (with numlock on?)
+ test hitting ESC everywhere
- rothe/poltergeist/vampire should be born awake -> should they move during stealth?
- casting sph twice in the same direction will always kill the player
- parsing < and > in lprcat() isn't perfect, especially with newlines, and tags at EOL
- multiple 'you have been slain' messages if you get killed by more than 1 monster
  - or waterlord hitting & getting with gusher
- ie & safari don't like the '`' character // wontfix


extras:
+ cloud save via password
+ nerf the book and chest in the store to only be sellable for purchase price?
- put platinum dragon beside eye of larn
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
- callback nomenclature & functions could be improved
- napping
- IN_STORE
- updateLog
- oldx, oldy
- files for item actions (throne, altar, fountain, etc)
- all data in one file
- rename object.js to item.js
