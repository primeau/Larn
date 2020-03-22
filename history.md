
JS U/Larn 12.5.0 (currently beta)
----------------
Added Ularn functionality. Primarily follows the 1.5 codebase with some 
inspiration from 1.6. Maintains the new/balance/fix items of version 12.4.5 
where it seems to make sense.


JS Larn 12.4.5
--------------
Ported to JavaScript. Gameplay is intended to be identical to version 12.4.4,
with the following updates:

1. [new] A global scoreboard has been added to the game. A local scoreboard
is also available for offline games.

1. [new] Added an Amiga-style graphics option with help and encouragement of
Christoper Yewchuck.

1. [new] The LRS is still present, but it's no longer necessary to pay taxes
because it was so easy to work around in the original game.

1. [new] Washing at a fountain can clean negative weapon or armor class.

1. [new] Monsters that pick your pocket and disappear can now be found
elsewhere on the same level.

1. [new] The Sword of Slashing doesn't rust.

1. [new] Stolen items can be recovered if you can find the monster again.

1. [balance] 'Smart' monsters in a closed room never moved. Now they follow
player movement, except for demons, who stand guard to protect the Eye of Larn
and potion of cure Dianthroritis.

1. [balance] Players could donate or 'just pray' their way into unreasonable
WC/AC gains. Now altars will randomly crumble to dust.

1. [balance] The list of things the player can wield is considerably shorter.

1. [balance] The chest and book at the store decline in quality as difficulty
goes up.

1. [balance] The scroll of Stealth was much too powerful. Now there is a chance
a monster will notice when the player passes too closely. Affects difficulty 2
and higher.

1. [balance] Selling items is blocked once the potion has been picked up to
prevent player from inflating their score by selling epic items.   

1. [balance] Demons can no longer be teleported.

1. [fix] It's possible to fall into a pit again. This was broken in 12.4.

1. [fix] The last hit monster would chase the player from across the maze after
teleporting away. This bug could also cause other monsters to become 'possessed'
and move very erratically in rare situations.

1. [fix] Leather and stainless plate armor could be dulled when used as a
weapon against rusting monsters. Thanks to Will Oprisko for finding this one.

1. [fix] Half-speed monsters (Hobgoblins, Ice Monsters, etc) didn't move
properly when the player was running.

1. [fix] After casting Stop Time, monsters would still chase the player when
running. 

1. [fix] Bessman's Flailing Hammer could only be created on the first level
of the dungeon.

1. [fix]/[new] You can drop gold onto an existing pile of gold now.

1. [fix]/[new] When a monster is killed with a ranged attack, loot will now be 
dropped beside the corpse instead of the player.

1. [un-fix] The history lesson from the College of Larn says that the Eye
of Larn is protected by a Platinum Dragon, which wasn't the case in the original
version of Larn. I changed it to be true for a while, but it unbalanced the
game too much. For anyone who died at the hands of a Platinum Dragon while
questing for the Eye, I'm sorry.


Larn 12.4.4
-----------
Joe Neff found a bug where known spells weren't being saved correctly. Fixed.


Larn 12.4.3
-----------
Win32 only. Depends on PDCurses. Name entered at character creation is now used
for scoreboard. Keypad + Shift run supported. All chars used for numerics in
codebasw are now ints. Basic work converting to stdlib + curses instead of
the awkward terminal hacks. Very much a work in progress.


Larn 12.4
---------
ANSIfication, ported to Curses, arrow key support,
message system fix, game over confirmation prompt,
removal of platform-specific cruft, removal of most options,
name/sex prompt, ...


Larn 12.3.1
-----------
Prompted by Pat Ryan, fix a bug in the dropobj() code in main.c that
allowed the player to drop a negative amount of gold.  In the process, fix
the backwards carriage return logic when printing the error response.
Document the new SIG_RETURNS_INT #define introduced by Bill Randle when the
software was posted.
Prompted by Lasse Oestergaard, guard against out-of-bound array references
in movem.c when on the Home level.  Also fixed a bug where a 'smart' monster
would fail to move towards the player when the player was on the boundary.
Prompted by Mitch Gorman, make the EXTRA #define compile and work under
MS-DOS.


Larn 12.3 - SPOILER ALERT!
--------------------------
1. The player's position is now marked with an ampersand, instead of just with
   the cursor.

2. The 'G' command ("give the stairs a kick") has been removed.  Since you can
   tell the stairs apart (as opposed to the original Larn 12.0), this command
   doesn't make sense anymore.

3. The 'V' command has been removed and its information incorporated into the
   'v' command.

4. An idea from Ultra-Larn: when the player enters the 5th level branch of the
   bank after teleporting, the '?' in the level display is changed to a '5'.

5. Larn -? can be used to print command line arguments.

6. The player is no longer positioned near the shaft of the volcano when
   climbing down to the first volcano level.

7. A couple of pauses were eliminated, making some actions very fast now.

8. The player can no longer escape punishment by donating more gold then he
   possesses when praying at the altar.

9. When performing an action and doing an inventory list, a character typed at
   the "press space for more" prompt is taken as the inventory item to select.
   That is, if you say 'q' for quaff, '*' to see all the potions you can quaff,
   Larn used to require that you type a space before you could select a potion,
   causing the list to disappear.  You can now select an item in the list while
   the list is displayed.  You can also use Escape and Return in place of a
   space.

10. The spells/potions/scrolls inventory ('I' command) are now sorted.

11. The '/' command has been added, to allow the user to identify objects.
    You can choose to either type a character or move the cursor around to
    select a character to identify (a la Hack).  The only limitation is that
    characters that have several objects (weapons, gems, dragons, etc) display
    all the matching object names.

12. The potion of gold detection has been changed into the potion of object
    detection.  It will find scrolls, books, potions, weapons, armor, and
    artifacts.  If you have an old savefile, all gold detection potions get
    turned into object detection potions.

13. It is now possible to find rings of cleverness in the dungeon.

14. It is now possible for killed monsters to drop splint mail, battle axes,
    cookies, and rings of cleverness.

15. Source cleanup, reduction in the size of the executable and the memory
    required, performance improvements.

16. Fix problems with positioning the player when entering or leaving the
    dungeon.  You will no longer find yourself on the opposite side of the
    town level when leaving the dungeon.  You will no longer be able to enter
    the dungeon on top of a monster.

17. Prevented monsters from moving into the dungeon entrance, causing them to
    be destroyed when the player exits the dungeon.  The top dungeon level now
    has the dungeon entrance character where there used to be a space.

18. If you are standing on a chest and try and open it, you will no longer pick
    it up immediately if you have auto-pickup on.

19. Added the capability to add comments to the options file.

20. Fixed the bug where a missing options file prevented anything from being
    displayed.

21. There is now a visible repeat count when greater than 10 (a la Hack).  You
    can also edit the repeat count.

22. The 'm' command has been added to move onto an object without picking it
    up (a la Hack).

23. Fixed a problem where the a) item in the inventory couldn't be dulled.

25. Allow a space between '-o' and the option filename.

26. Fix possible errors when looking at the inventory.

27. Prevent the player from changing levels into a level from the maze file with
    a space that had no means of exit.


Larn 12.2 - SPOILER ALERT!
--------------------------
1.  Add messages to improve feedback to the user.

2.  Improved screen drawing performance again.

3.  Flying monsters (bats, floating eyes) are no longer affected by traps.

4.  Added HACK-like objects, with 'original-objects' option.

5.  Added 'bold-objects' option.

6.  Fixed a bug where the game would apparently 'hang' for a long period of
    time, especially just after killing a monster with a missile spell.

7.  Prevented invulnerability when doing VPR on a throne or altar.

8.  Scrolls of pulverization now have the same affect when directed against
    an altar or fountain as they did directed against a throne.  VPR spell
    cause a waterlord to appear when used near a fountain.

9.  Added the '@' command and 'auto-pickup' option.

10. Added 'prompt-on-objects' option.

11. Improved monster movement performance again.

12. You can now wield '-' to unwield your weapon.

13. Waterlords can now be found in the dungeon, not just when washing at a
    fountain.

14. The Eye of Larn can now be sold in the Trading Post.

15. Spells can now bounce off mirrors at an angle.


Larn 12.1 - SPOILER ALERT!
--------------------------
1.  When drinking at a fountain, "improved sight" caused the "see invisible"
    potion to be known by the player.  The player must now identify the potion
    in the usual manner.

2.  Falling through a pit told you the damage you received, but falling through
    a trap door did not.  Made trap doors act the same as pits.

3.  If you dropped a ring of dexterity/strength/cleverness that had been dulled
    to a negative amount, the corresponding stat was permanently increased.  No
    longer.

4.  The potion of monster location would show invisible monsters as the floor
    character on new levels.  Now prevented.

5.  Selling all your gems at the bank could destroy items in your inventory.

6.  Monster creation was being allowed on closed doors.  This was particularly
    a problem with treasure rooms, since it meant that a monster much too
    powerful for the player to handle was loose in the maze.  Monsters cannot
    now be created on closed doors.

7.  When entering a number (when entering gold amounts) you could not use the
    backspace key to delete digits.  Fixed.

8.  To make it more convenient when selling items in the Larn Trading Post, a
    display of those items in the players inventory that can be sold has been
    added.

9.  Performance of the display has been improved slightly.

10. Monster movement has been improved for large numbers of monsters.  It is
    somewhat better on PC's, even with aggravation.

11. I have added new mazes to LARN.MAZ.

12. A Rogue-like command mode has been added, and is the default.  The
    version 12.0 prompting mode has been preserved for those who like it,
    accessible via a command line option.  Command letters have been added
    to provide the ability to perform all the same actions as the prompt mode.
    The help file and command line help have been updated.  When in command
    mode, the player will automatically pick up objects, and can read, quaff,
    eat, look at, and pick up objects that you are standing on.

    In order to implement the new commands, the A and D commands from version
    12.0 have been changed.  They are now ^A and I.  For consistancy, to see
    the list of known spells at the spell prompt, 'I' also shows all known
    spells.
