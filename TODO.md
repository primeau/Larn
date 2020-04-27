One thing that was askew in your initial implementation was flex: 95%
If you're only after flex-grow, use the property directly rather than through the shorthand flex. Then it becomes easier to spot that flex-grow doesn't take % in but relative integer weights (1, 2, 3...)

ULARN 12.5.0:
- update README.spoilers doc
- eye of larn appraisal in bank
- search for ULARN TODO
- "you have found" vs "you find"
- check all 1.6.3 code
- prevent wield and wear at the same time
- should running increase gtime?
- explain that . drops gold
- should smart monsters be able to walk around sleeping monsters?
- when blind, killing a monster shouldn't reveal gold dropped, or anything else?
- retro font mode isn't properly monospaced in mac/safari

python -m SimpleHTTPServer 8000
http://localhost:8000/larn_local.html
file:///Users/jay/Dropbox/Desktop/LARN/JLarn/larn/larn_local.html?ularn=true


Navigator.cookieEnabled Read only
Returns false if setting a cookie will be ignored and true otherwise.
if (!navigator.cookieEnabled) { 
  // The browser does not support or is blocking cookies from being set.
}
Navigator.onLine Read only
Returns a Boolean indicating whether the browser is working online.
window.addEventListener('offline', function(e) { console.log('offline'); });
window.addEventListener('online', function(e) { console.log('online'); });

ULARN 12.5.1
- crumble altars faster? 1/20?
- make +9 items worth less? cap out around 116k (v3 chest in Larn)?
- fix interactions between haste self / haste monster / half-speed monsters (check 1.6.3 hastestep)
  * HAS + PER bug slow monsters (H,x,r,etc) move every moves, or totally paralyzed?
  - monster.isSlow, and different way to decide when to move
- async/await for keyboard input?
- update babel to support async/await for nap()
- amiga mode: unseen walls should be flat
- widget of spine tingling 
- life preserver
- just pray option at altar
- wash at fountain clears itching

todo:
- check chrome audit tab
- "sorry, no mobile" message for larn.html
- warn if changing names because it's annoying on the scoreboard
- click / farlook to identify object (hack and classic mode)
- show time in side inventory
- Save id to name and name to id map
- update history
- help wiki (items/scrolls/potions/features/monsters/etc)
- most references to player.level should be replaced with functions
- allow hitting escape while naps are happening (interrupt settimeout?)
  - make buying / selling items etc faster 
- eye of larn pickup/drop message with proper naps inbetween messages (harder than expected the first time around)
- repeat function
- move command


bugs:
* lots of monsters walking through wall. (fixed?)
  - was this due to smart ripple[] not being cleared?
* fall down pit, area around player isn't exposed
   - only when player doesn't fall down on the first 'try'
* long user names aren't truncated on the start screen
- closing a door (from on top of the door) when a monster is in the spot you were
  just in drops you back on the monsters spot. the monster reappears when you move.
- can't load game stats from local scoreboard (can't find game sdkjfhsdfkj)
- arrow buttons on help screen are truncated in amiga mode
- amiga mode: strikethrough missing on taxes owing after victory
- blindness
  - black tile when opening door when blind
  - when blind, a monster from an unknown tile will reveal the tile its standing on during attack
- rothe/poltergeist/vampire are born awake -> should they move during stealth?
- monster movement isn't shown after falling asleep
- casting sph twice in the same direction will always kill the player


extras:
- url for scoreboard
- mle bounce off demon
- no teleport away for demon
- colors for dragons? other monsters
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
- ipad support
- show other actions ("you have desecrated at the altar!" etc)
- add support for other wizard mode passwords
- give notification given when haste, aggravate monsters subsides (no?)
- start new game without reloading
- copy local scores to global
- color (mcolor/ocolor)
- beep support
- stats on most dangerous monster, level, moves/kills/spells ratio
  - win/death ratio per difficulty
- speedrun mode
- lantern - radiates light out from hero for x spaces?


hardmode ideas:
- can only wield actual weapons
- prevent wield and wear at the same time
- altar donation aren't just 10%, min 50
- stop time doesn't prevent falling in pits
- demons don't respect stealth, hold is less effective
- guardians are never asleep 
- reduce blessed ularn item sale prices