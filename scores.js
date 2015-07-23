"use strict";

/*
 *  died(x)     Subroutine to record who played larn, and what the score was
 *      int x;
 *
 *  if x < 0 then don't show scores
 *  died() never returns! (unless c[LIFEPROT] and a reincarnatable death!)
 *
 *      < 256   killed by the monster number
 *      256     quit
 *      257     suspended
 *      258     self - annihilated
 *      259     shot by an arrow
 *      260     hit by a dart
 *      261     fell into a pit
 *      262     fell into a bottomless pit
 *      263     a winner
 *      264     trapped in solid rock
 *      265     killed by a missing save file
 *      266     killed by an old save file
 *      267     caught by the greedy cheater checker trap
 *      268     killed by a protected save file
 *      269     killed his family and killed himself
 *      270     erased by a wayward finger
 *      271     fell through a bottomless trap door
 *      272     fell through a trap door
 *      273     drank some poisonous water
 *      274     fried by an electric shock
 *      275     slipped on a volcano shaft
 *      276     killed by a stupid act of frustration
 *      277     attacked by a revolting demon
 *      278     hit by his own magic
 *      279     demolished by an unseen attacker
 *      280     fell into the dreadful sleep
 *      281     killed by an exploding chest
 *      282     killed by a missing maze data file
 *      283     killed by a sphere of annihilation
 *      284     died a post mortem death
 *      285     malloc() failure
 *      300     quick quit -- don't put on scoreboard
 */
function died(reason) {
  debug("died(): " + reason);
}
