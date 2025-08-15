todo
====
- Ularn todo
  - check all 1.6.3 code
  - check scorePUT
  - change retro font cookie
  - search for ULARN TODO
  - eye of larn appraisal in bank
- url for scoreboard
- yearly high scoreboard
- show 'play again' link after death
- add play links or links back to larn.org in more places (esp LarnTV)
- click / farlook to identify object (amiga is done, todo: hack and classic mode)
- dim text for items in store that are too expensive
- add current date/time to bug report form
- drop out of order frames - current fix in index.js doesn't seem to be working
- scoreboard visitors - use movesmade, not mobuls
- blindness - don't show dots, don't identify items (there is a gem/scroll/potion/book here) ok if picked up though because that's too hard to deal with (or maybe set the item ID to be negative if blind?)
* new favicon? dragon? random monster?
* help wiki (items/scrolls/potions/features/monsters/etc)
* new video to add: https://larn.org/beta/tv/?gameid=lysnwvbhx8 
  - diff 0 win with illiterate/thirsty conducts
* print save / reload game time
- ularn: if an invisible demon steps on a wall, should it show a dungeon floor tile, or a wall tile? --> wall tile!
- if error writing savegame due to space issues, delete all backup cookies
- record elapsed game time, total time, number of saves
- eye of larn pickup/drop message with proper naps inbetween messages (harder than expected the first time around)
- should smart monsters be able to walk around sleeping monsters?
- cheater beater:
  - re-implement cheater checker from larn source
  - add filtering for cheater high scores
  - silently don't record cheat high scores
  - another cheater: meesa/DooDoo
  - serverside known cheaters list
  - check fs for games from localhost/file:



code/infrastructure todos
=========================
- delete realtime_larn binding on cloudflare
- keep track of all durablesessions created to be able to delete later
- Project: cleaning up old high scores in s3
  x read high score gameids from dynamo
  x Load files for those gameids from s3 larn-movies to new bucket
  x Create fail through to pass gameid searches to larn-movies to new high-scores bucket
  x Set lifecycle to 1 year for larn-movies s3 bucket
  - schedule script to copy new high scores to larn_highscores s3 bucket
  - switch from movie_test to movie lambda for prod version
  - eventually something to clean highscores bucket?
- async/await for keyboard input?
- idea: use createElement for all rendering?
- refactor: move everything out of data, put methods for the use of the thing in the object
   - object: take() | cancarry() | drop() | use() | thingtoprintwhensteppingonit() | lookforobjectaction() | u/larn/hackname | name, type, color
   - book | mle(1) | 
   - scroll | pulverization(15) | 
   - weapon | dagger(1) | +5
- use fewer globals!
  - get rid of scores.ONLINE
  - put all globals into globals.json with info about which files use it
  - put all player related functions/vars into player object
  - most references to player.level should be replaced with functions
- move hosting from netlify to:
  - github actions: no -> can't have AWS keys in public github
  - cloudflare pages?
- javascript build versioning?
- delete google analytics account
- use https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon to replace rollbar? feature tracking
  - debug/checkpoint/savegame
  - regular saving
  - mobile games
  - games started / finished
- use goatcounter campaigns to measure
  - games started
  - games finished
  - mobile game
  - tv usage
  - savegame/checkpoint
- create a new gamesplayed worker to see a graph of usage 
- set lifecycle rules for dynamo tv lists to replace scheduled cleaning script?
- put each played game listing in database, then list is just latest N. saves having to run a cleanup script
* durable objects are expensive! 
  - replace with EC2 server?
  - replace with queues?
  1 Requests include all incoming HTTP requests, WebSocket messages, and alarm invocations. There is no charge for outgoing WebSocket messages, nor for incoming WebSocket protocol pings
  2 Application level auto-response messages handled by state.setWebSocketAutoResponse() will not incur additional wall-clock time, and so they will not be charged.
  3 Duration is billed in wall-clock time as long as the Object is active, but is shared across all requests active on an Object at once. Once your Object finishes responding to all requests, it will stop incurring duration charges. Calling accept() on a WebSocket in an Object will incur duration charges for the entire time the WebSocket is connected. If you prefer, use state.acceptWebSocket() instead, which will stop incurring duration charges once all event handlers finish running.
  4 Duration billing charges for the 128 MB of memory your Durable Object is allocated, regardless of actual usage. If your account creates many instances of a single Durable Object class, Durable Objects may run in the same isolate on the same physical machine and share the 128 MB of memory. These Durable Objects are still billed as if they are allocated a full 128 MB of memory.
  - WebSocket Hibernation: When using a Durable Object on the server side of a WebSocket connection, consider using the Hibernatable WebSockets API. The Hibernatable WebSockets API allows a Durable Object that is not currently running an event handler (such as handling a WebSocket message, HTTP request, or alarms) to be removed from memory while keeping its WebSockets connected (“hibernation”). A Durable Object that hibernates will not incur billable Duration (GB-sec) charges. For applications with many long-lived Durable Objects and periodic WebSocket messages or events, using the Hibernatable WebSockets API can measurably reduce billable duration.



extras
======
- slight dim on store font for stuff you can’t afford
- wash at fountain clears itching
- "dungeon of the week"
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
- repeat function, especially at altars
- move command ("m")
- stainless shield ~5k gold +1|2 ac
- ularn: widget of spine tingling
- ularn: lantern radiates light out from hero for x spaces?
- conducts
  - needs extra code
    - pacifist: no wielded weapon / should be when lasthitmonst = null, not when numkilled = 0
    - one direction: never go down a set of stairs twice (or re-enter volcano/dungeon)
    - unbanked/cheapskate/goldless: never enter bank, store, thrift shop, school, use gold (no praying)
    - unadorned: never wear a ring / amulet
    - racer: if you see downward stairs, you must take them
  - need starting option:
    - nudist: never wear armour (rings are ok)
    - paci(fists): never wield a weapon
    - zen: blind from birth (remove curse, school, cbl won't fix)
    - aggravating: permanent aggravate monsters (and remove curse won't fix)



bugs
====
* larntv sorting is broken on brave vs firefox
* amiga tv replays seem really slow even on 8x speed
* memory leak on windows chrome (and maybe more browsers?)
  - delete rolls after they are sent to server, no need to keep them
  - delete old frames from framebuffer
* TypeError: player.level.know[l] is undefined (mmove())
* Cannot read properties of null (reading 'items') (itemAt())
* last hit monster still chases from a distance if dumb
- amiga replay link on game over is broken
- long user names aren't truncated on the start screen
- retro font mode isn't properly monospaced in mac/safari
- courier new tv games are a little too wide
- close dexterity loophole? ask rtwod about it
- clear() creates an extra empty frame (ie during show inventory)
  - same for cl_up() cl_down() and others?
  - instead paint from start, and clear to end of line, and then to end of screen
- fix interactions between haste self / haste monster / half-speed monsters (check 1.6.3 hastestep)
  * HAS + PER bug slow monsters (H,x,r,etc) move every moves, or totally paralyzed?
  - monster.isSlow, and different way to decide when to move
  - half speed monster should move at full speed with haste monster on
- closing a door (from on top of the door) when a monster is in the spot you were
  just in drops you back on the monsters spot. the monster reappears when you move.
- arrow buttons on help screen are truncated in amiga mode
- amiga: you owe <strike>1234</strike> in taxes
- there are a bunch of 404's for the older source code in history.html
  * add links to locally hosted copies
- blindness
  - black tile when opening door when blind
  - when blind, a monster from an unknown tile will reveal the tile its standing on during attack
  - when blind, killing a monster shouldn't reveal gold dropped, or anything else?
- rothe/poltergeist/vampire are born awake -> should they move during stealth?
- monster movement isn't shown after falling asleep
- casting sph twice in the same direction will always kill the player
- While Haste Self is active, hitting a monster with a projectile causes said monster to move once at normal speed
- game over scoreboard can't load current game (but can load all others) 
  - it's because most recent game probably isn't a high score and isn't recorded in local winners/losers cache
  - or it's because it's a new-ish player and there's a `+` in the gameID for fs



hardmode ideas
==============
- can only wield actual weapons
- prevent wield and wear at the same time
- altar donation aren't just 10%, min 50
- stop time doesn't prevent falling in pits, hitting traps
- demons don't respect stealth, hold is less effective
- guardians are never asleep 
- reduce blessed ularn item sale prices
- get potion -> permanent aggravate monsters (be sure to disable remove curse)
- if aggravate always get gnome king at throne
- curses last longer
- stat reduction multiplier on E10/15 and v3/5 (more spells fail etc)
- can't stack spells/scrolls/potions (ie can't read expanded awareness twice in a row)
- more damage from traps etc