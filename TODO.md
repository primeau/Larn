
Ularn 12.5.0:
- check all 1.6.3 code
- check scorePUT
- change retro font cookie
- update savegame test endpoint eventually
- retro font mode isn't properly monospaced in mac/safari

Ularn 12.5.1
- search for ULARN TODO
- eye of larn appraisal in bank
- widget of spine tingling
- lantern radiates light out from hero for x spaces?

Ularn balance ideas:
- crumble altars faster? 1/20?
- make +9 items worth less? cap out around 116k (v3 chest in Larn)?

todo:
- warn if changing names because it's annoying on the scoreboard
- help wiki (items/scrolls/potions/features/monsters/etc)
- click / farlook to identify object (hack and classic mode)
- mobile support

- Navigator.cookieEnabled Read only
   Returns false if setting a cookie will be ignored and true otherwise.
   if (!navigator.cookieEnabled) { 
     // The browser does not support or is blocking cookies from being set. 
   }
- Navigator.onLine Read only
   Returns a Boolean indicating whether the browser is working online.
   window.addEventListener('offline', function(e) { console.log('offline'); });
   window.addEventListener('online', function(e) { console.log('online'); });
- async/await for keyboard input?
- update babel to support async/await for nap()
- amiga mode: unseen walls should be flat
- check chrome audit tab
- "sorry, no mobile" message for larn.html
- show time in side inventory
- Save id to name and name to id map
- most references to player.level should be replaced with functions
- allow hitting escape while naps are happening (interrupt settimeout?)
  - make buying / selling items etc faster 
- eye of larn pickup/drop message with proper naps inbetween messages (harder than expected the first time around)
- should smart monsters be able to walk around sleeping monsters?
- cheater beater:
  - re-implement cheater checker from larn source
  - add filtering for cheater high scores
  - another cheater: meesa/DooDoo
  - serverside known cheaters list
  - check fs for games from localhost/file:
- get rid of player.level

extras:
- wash at fountain clears itching
- url for scoreboard
- config page
  - colors on/off
  - keyboard hints
  - walls as block or joined ascii
  - no-beep
  - no-nap
  - player tile
  - monster tile / names
- cloud save via password
- game start/end stats
- show other actions ("you have desecrated at the altar!" etc)
- give notification given when haste, aggravate monsters subsides (no?)
- beep support
- speedrun mode
- repeat function
- move command

bugs:
* last hit monster still chases from a distance if dumb
* larn (not ularn) post win: start with no spells, diff is still 0, next game has spells
* lots of monsters walking through walls (fixed?)
  - was this due to smart ripple[] not being cleared?
* fall down pit, area around player isn't exposed
   - only when player doesn't fall down on the first 'try'
* long user names aren't truncated on the start screen
- brief flash of some other font when starting game
- fix interactions between haste self / haste monster / half-speed monsters (check 1.6.3 hastestep)
  * HAS + PER bug slow monsters (H,x,r,etc) move every moves, or totally paralyzed?
  - monster.isSlow, and different way to decide when to move
  - half speed monster should move at full speed with haste monster on
- closing a door (from on top of the door) when a monster is in the spot you were
  just in drops you back on the monsters spot. the monster reappears when you move.
- can't load game stats from local scoreboard (can't find game sdkjfhsdfkj)
- arrow buttons on help screen are truncated in amiga mode
- amiga: you owe <strike>1234</strike> in taxes
- amiga: gap between maze and spells isn't cleared on loading saved game
- blindness
  - black tile when opening door when blind
  - when blind, a monster from an unknown tile will reveal the tile its standing on during attack
  - when blind, killing a monster shouldn't reveal gold dropped, or anything else?
  - rothe/poltergeist/vampire are born awake -> should they move during stealth?
- monster movement isn't shown after falling asleep
- casting sph twice in the same direction will always kill the player

hardmode ideas:
- can only wield actual weapons
- prevent wield and wear at the same time
- altar donation aren't just 10%, min 50
- stop time doesn't prevent falling in pits, hitting traps
- demons don't respect stealth, hold is less effective
- guardians are never asleep 
- reduce blessed ularn item sale prices


Jay@80.209.166.82 / 20200506 / Asdfgh01

python -m SimpleHTTPServer 8000
http://localhost:8000/larn_local.html
file:///Users/jay/Dropbox/Desktop/LARN/JLarn/larn/larn_local.html?ularn=true

