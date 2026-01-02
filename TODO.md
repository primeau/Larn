
10 year retrospective
=====================
- top 10 players
- top 10 types of death (or histogram of all - especially dumb ones)
- dumb deaths while carrying potion
- top 10 fastest wins (moves)
- games played graph
- most dangerous level



todo
====
- General
  - rest until full health or full spells
  - Show inventory slots in “i” mode
  - move command ("m")
  - add current date/time to bug report form
  - show other actions ("you have desecrated at the altar!" etc)
  - beep support
  - show 'play again' link after death
  - add play links or links back to larn.org in more places
  - record elapsed game time, total time, number of saves
  - cloud save via password
  - game start/end stats
  - config page
    - colors on/off
    - keyboard hints
    - walls as block or joined ascii
    - no-beep
    - no-nap
    - player tile
    - monster tile / names
  - if error writing savegame due to space issues, delete all backup cookies
- Ularn
  - check all 1.6.3 code
  - change retro font cookie
  - eye of larn appraisal in bank
  - if an invisible demon steps on a wall, should it show a dungeon floor tile, or a wall tile?
- GOTW
  * REJECT SUBMITTED GAMES AFTER TIME CUTOFF
  - show correct special items created list on score/index.html -> done: should be visible in mid feb
  - chests and books from statues are still random
  - Add moves to gotw visitor scores?
- LarnTV
   - add option to view completed games stats from larntv
   - Only limit scrubbing for non deflated amiga games
   - drop out of order frames - current fix in index.js doesn't seem to be working
- mobile
  - Two columns for iPad inventory drop etc?
  - nonap or 200ms max
  - dim buttons in store for things you can't afford?
- scoreboard
  - save this week/last week etc instead of item value?
  - scoreboard visitors - use movesmade, not mobuls
- website
  - new favicon? dragon? random monster?
  - new video to add: https://larn.org/beta/tv/?gameid=lysnwvbhx8 (diff 0 win with illiterate/thirsty conducts)




code/infrastructure todos
=========================
* schedule script to copy new high scores to larn_highscores s3 bucket
* CF: Workers KV -> larn_tv_watchers -> KV Pairs looks like it might be massive
* how to continuously migrate winning s3 game files from movies to highscores folder
* FIGURE OUT HOW TO MOVE SCORES_n tables INTO OTHER DATABASES --> 10GB LIMIT
- move tv and score into separate repos
- turn off logging for activity requests
- gamesession: durable object use is wrong? env vs state (see codereview.md)
- replace requests table with new one with primary key
  - duplicate ip's in requests table
  - select * from requests order by numRequests DESC limit 100
- log cloudflare errors to rollbar -> https://docs.rollbar.com/reference/getting-started-1
- keep track of all durablesessions created to be able to delete later
- Project: cleaning up old high scores in s3
  x read high score gameids from dynamo
  x Load files for those gameids from s3 larn-movies to new bucket
  x Create fail through to pass gameid searches to larn-movies to new high-scores bucket
  x Set lifecycle to 1 year for larn-movies s3 bucket
  - switch from movie_test to movie lambda for prod version
  - eventually something to clean highscores bucket?
  - with R1 can we just set lifecycle to keep all winning games?
- async/await for keyboard input?
- refactor inventory --> inventory.js
- get rid of mazemode?
- idea: use createElement for all rendering?
- refactor: move everything out of data, put methods for the use of the thing in the object
  - object: take() | cancarry() | drop() | use() | thingtoprintwhensteppingonit() | lookforobjectaction() | u/larn/hackname | name, type, color
  - book | mle(1) |
  - scroll | pulverization(15) |
  - weapon | dagger(1) | +5
- use fewer globals!
  - put all globals into globals.json with info about which files use it
  - put all player related functions/vars into player object
- move hosting from netlify to:
  - github actions: no -> can't have AWS keys in public github
  - cloudflare pages?
- javascript build versioning?
- record build number in save game
- auto-update build number somehow
- delete google analytics account
- use goatcounter campaigns to measure
  - debug/checkpoint/savegame
  - games started / finished
  - mobile game
  - tv usage
- put each played game listing in database, then list is just latest N. saves having to run a cleanup script
* durable objects are expensive!
  - replace with EC2 server? -> no, moving everything to cloudflare
  - replace with CF queues?
    1 Requests include all incoming HTTP requests, WebSocket messages, and alarm invocations. There is no charge for outgoing WebSocket messages, nor for incoming WebSocket protocol pings
    2 Application level auto-response messages handled by state.setWebSocketAutoResponse() will not incur additional wall-clock time, and so they will not be charged.
    3 Duration is billed in wall-clock time as long as the Object is active, but is shared across all requests active on an Object at once. Once your Object finishes responding to all requests, it will stop incurring duration charges. Calling accept() on a WebSocket in an Object will incur duration charges for the entire time the WebSocket is connected. If you prefer, use state.acceptWebSocket() instead, which will stop incurring duration charges once all event handlers finish running.
    4 Duration billing charges for the 128 MB of memory your Durable Object is allocated, regardless of actual usage. If your account creates many instances of a single Durable Object class, Durable Objects may run in the same isolate on the same physical machine and share the 128 MB of memory. These Durable Objects are still billed as if they are allocated a full 128 MB of memory.
  - WebSocket Hibernation: When using a Durable Object on the server side of a WebSocket connection, consider using the Hibernatable WebSockets API. The Hibernatable WebSockets API allows a Durable Object that is not currently running an event handler (such as handling a WebSocket message, HTTP request, or alarms) to be removed from memory while keeping its WebSockets connected (“hibernation”). A Durable Object that hibernates will not incur billable Duration (GB-sec) charges. For applications with many long-lived Durable Objects and periodic WebSocket messages or events, using the Hibernatable WebSockets API can measurably reduce billable duration.



extras
======
- wash at fountain clears itching
- allow smart monsters to walk around sleeping monsters
- blindness - don't show dots, don't identify items (there is a gem/scroll/potion/book here) ok if picked up though because that's too hard to deal with (or maybe set the item ID to be negative if blind?)
- stainless shield ~5k gold +1|2 ac
- ularn: widget of spine tingling: see monster moving outside view
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
* fix interactions between haste self / haste monster / half-speed monsters (check 1.6.3 hastestep)
  - HAS + PER bug slow monsters (H,x,r,etc) move every moves, or totally paralyzed?
  * monster.isSlow, and different way to decide when to move
  * half speed monster should move at full speed with haste monster on
- iPad version crashes when network connection lost
- Lockups on iPad in localhost mode. Maybe related to number of moves?
- amiga tv replays seem really slow even on 8x speed
- player hit themselves with own magic by moving into mle spell? [video: hitbymagic.mov]
- player.level = null
  - TypeError: player.level.know[l] is undefined (mmove())
  - Cannot read properties of null (reading 'items') (itemAt())
  - can't access property "items", player.level is null
-  offline
   can't access property "frames", this.recording is undefined
   can't access property "items", player.level is null
   ... > input#Font: modern.variablebutton[type="button"][name="Font: modern"]
- last hit monster still chases from a distance if dumb
- fonts
  - retro font mode isn't properly monospaced in mac/safari
  - courier new tv games are a little too wide
- close dexterity loophole? ask rtwod about it
- clear() creates an extra empty frame (ie during show inventory)
  - same for cl_up() cl_down() and others?
  - instead paint from start, and clear to end of line, and then to end of screen
* closing a door (from on top of the door) when a monster is in the spot you were
  just in drops you back on the monsters spot. the monster reappears when you move.
* there are a bunch of 404's for the older source code in history.html
  - add links to locally hosted copies
* blindness
  - black tile when opening door when blind
  - when blind, a monster from an unknown tile will reveal the tile its standing on during attack
  - when blind, killing a monster shouldn't reveal gold dropped, or anything else?
* monster movement isn't shown after falling asleep
* casting sph twice in the same direction will always kill the player
* While Haste Self is active, hitting a monster with a projectile causes said monster to move once at normal speed
- USED_MAZES should be saved to prevent canned levels from being reused
- 1000x: The resource <URL> was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally



hardmode ideas
==============
- can only wield actual weapons
- prevent wield and wear at the same time
- altar donation aren't just 10%, min 50
- altars crumble faster
- stop time doesn't prevent falling in pits, hitting traps
- demons don't respect stealth, hold is less effective
- stealth/hld doesn't work when carrying eye/potion
- guardians are never asleep
- reduce blessed ularn item sale prices
- get potion -> permanent aggravate monsters (be sure to disable remove curse)
- if aggravate always get gnome king at throne
- curses last longer
- stat reduction multiplier on E10/15 and v3/5 (more spells fail etc)
- can't stack spells/scrolls/potions (ie can't read expanded awareness twice in a row)
- more damage from traps etc



larn 2.0 ideas
==============
- hex maze version



RELEASE CHECKLIST
=================
- larn_config
  - enable_devmode == false
  - cf_local == false
  - cloudflare_read == false
  - cloudflare_write == TRUE
- cf_config
  - cf_local == false
- highscores
  - writes to aws
  - writes to cf
  - read highscores during game
  - read at death
- scores
  - writes to aws
  - writes to cf
- tv
  - live list
  - completed list
  - watch live
  - watch recorded
- gameplay
  - scrolls, books, potions
  - fountains, statues, chests, doors