"use strict";

// never, ever, never use a code formatter here


const splev = [1, 4, 9, 14, 18, 22, 26, 29, 32, 35, 37, 37, 37, 37, 37];



const spelcode = [
  "pro", "mle", "dex", "sle", "chm", "ssp",
  "web", "str", "enl", "hel", "cbl", "cre", "pha", "inv",
  "bal", "cld", "ply", "can", "has", "ckl", "vpr",
  "dry", "lit", "drl", "glo", "flo", "fgr",
  "sca", "hld", "stp", "tel", "mfi", /* 31 */
  "sph", "gen", "sum", "wtw", "alt", "per"
];



const spelname = [
  "protection", "magic missile", "dexterity",
  "sleep", "charm monster", "sonic spear",
  "web", "strength", "enlightenment",
  "healing", "cure blindness", "create monster",
  "phantasmal forces", "invisibility",
  "fireball", "cold", "polymorph",
  "cancellation", "haste self", "cloud kill",
  "vaporize rock",
  "dehydration", "lightning", "drain life",
  "invulnerability", "flood", "finger of death",
  "scare monster", "hold monster", "time stop",
  "teleport away", "magic fire",
  "sphere of annihilation", "genocide", "summon demon",
  "walk through walls", "alter reality", "permanence",
];



const speldescript = [
  /* 1 */
  "generates a +2 protection field",
  "creates and hurls a magic missile equivalent to a +1 magic arrow",
  "adds +2 to the caster's dexterity",
  "causes some monsters to go to sleep",
  "some monsters may be awed at your magnificence",
  "causes your hands to emit a screeching sound toward what they point",
  /* 7 */
  "causes strands of sticky thread to entangle an enemy",
  "adds +2 to the caster's strength for a short term",
  "the caster becomes aware of things in the vicinity",
  "restores some hp to the caster",
  "restores sight to one so unfortunate as to be blinded",
  "creates a monster near the caster appropriate for the location",
  "creates illusions, and if believed, monsters die",
  "the caster becomes invisible",
  /* 15 */
  "makes a ball of fire that burns on what it hits",
  "sends forth a cone of cold which freezes what it touches",
  "you can find out what this does for yourself",
  "negates the ability of a monster to use its special abilities",
  "speeds up the caster's movements",
  "creates a fog of poisonous gas which kills all that is within it",
  "this changes rock to air",
  /* 22 */
  "dries up water in the immediate vicinity",
  "your finger will emit a lightning bolt when this spell is cast",
  "subtracts hit points from both you and a monster",
  "this globe helps to protect the player from physical attack",
  "this creates an avalanche of H2O to flood the immediate chamber",
  "this is a holy spell and calls upon your god to back you up",
  /* 28 */
  "terrifies the monster so that hopefully it won't hit the magic user",
  "the monster is frozen in its tracks if this is successful",
  "all movement in the caverns ceases for a limited duration",
  "moves a particular monster around in the dungeon (hopefully away from you)",
  "this causes a curtain of fire to appear all around you",
  /* 33 */
  "anything caught in this sphere is instantly killed.  Warning -- dangerous",
  "eliminates a species of monster from the game -- use sparingly",
  "summons a demon who hopefully helps you out",
  "allows the player to walk through walls for a short period of time",
  "god only knows what this will do",
  "makes a character spell permanent, i. e. protection, strength, etc.",
];



const spelweird = [
/*                      p m d s c s    w s e h c c p i    b c p c h c v    d l d g f f    s h s t m    s g s w a p */
/*                      r l e l h s    e t n e b r h n    a l l a a k p    r i r l l g    c l t e f    p e u t l e */
/*                      o e x e m p    b r l l l e a v    l d y n s l r    y t l o o r    a d p l i    h n m w t r */


/*            bat */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*          gnome */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*      hobgoblin */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*         jackal */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*         kobold */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],

/*            orc */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   4,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*          snake */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*giant centipede */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*         jaculi */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*     troglodyte */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],

/*      giant ant */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*   floating eye */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*     leprechaun */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*          nymph */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*         quasit */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],

/*   rust monster */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   4,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*         zombie */ [  0,0,0,8,0,4,   0,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   4,0,0,0,0,4,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*   assassin bug */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*        bugbear */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*     hell hound */ [  0,6,0,0,0,0,   12,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],

/*     ice lizard */ [  0,0,0,0,0,0,   11,0,0,0,0,0,0,0,  0,15,0,0,0,0,0,  0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*        centaur */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*          troll */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   4,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*           yeti */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,15,0,0,0,0,0,  0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*   white dragon */ [  0,0,0,0,0,0,   0,0,0,0,0,0,14,0,  0,15,0,0,0,0,0,  4,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],

/*            elf */ [  0,0,0,0,0,0,   0,0,0,0,0,0,14,5,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*gelatinous cube */ [  0,0,0,0,0,0,   2,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   0,0,0,0,0,4,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*      metamorph */ [  0,13,0,0,0,0,  2,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   4,0,0,0,0,4,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*         vortex */ [  0,13,0,0,0,10, 1,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*         ziller */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],

/*   violet fungi */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*         wraith */ [  0,0,0,8,0,4,   0,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   4,0,0,0,0,4,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*      forvalaka */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*      lama nobe */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*        osequip */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],

/*          rothe */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*           xorn */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   4,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*        vampire */ [  0,0,0,8,0,4,   0,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   0,0,0,0,0,4,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*invisible staker*/ [  0,0,0,0,0,0,   1,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*    poltergeist */ [  0,13,0,8,0,4,  1,0,0,0,0,0,0,0,   0,4,0,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,   0,0,0,0,0,0 ],

/* disenchantress */ [  0,0,0,8,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*shambling mound */ [  0,0,0,0,0,10,  0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*    yellow mold */ [  0,0,0,8,0,0,   1,0,0,0,0,0,4,0,   0,0,0,0,0,4,0,   0,0,0,0,0,4,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*     umber hulk */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*     gnome king */ [  0,7,0,0,3,0,   0,0,0,0,0,0,0,5,   0,0,9,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],

/*          mimic */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*     water lord */ [  0,13,0,8,3,4,  1,0,0,0,0,0,0,0,   0,0,9,0,0,4,0,   0,0,0,0,16,4,  0,0,0,0,0,   0,0,0,0,0,0 ],
/*  bronze dragon */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*   green dragon */ [  0,7,0,0,0,0,   11,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*    purple worm */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],

/*          xvart */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*    spirit naga */ [  0,13,0,8,3,4,  1,0,0,0,0,0,0,5,   0,4,9,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*  silver dragon */ [  0,6,0,9,0,0,   12,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*platinum dragon */ [  0,7,0,9,0,0,   11,0,0,0,0,0,14,0, 0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*   green urchin */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],
/*     red dragon */ [  0,6,0,0,0,0,   12,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,0 ],

/*                      p m d s c s    w s e h c c p i    b c p c h c v    d l d g f f    s h s t m    s g s w a p */
/*                      r l e l h s    e t n e b r h n    a l l a a k p    r i r l l g    c l t e f    p e u t l e */
/*                      o e x e m p    b r l l l e a v    l d y n s l r    y t l o o r    a d p l i    h n m w t r */

/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,   9,0,0,0,0,0 ],
/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,   9,0,0,0,0,0 ],
/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,   9,0,0,0,0,0 ],
/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,   9,0,0,0,0,0 ],
/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,   9,0,0,0,0,0 ],
/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,   9,0,0,0,0,0 ],
/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,   9,0,0,0,0,0 ],
/*   demon prince */ [  0,7,0,4,3,9,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   4,0,0,0,4,   9,0,0,0,0,0 ]

 ];

var spelmes = [ ``,
/*  1 */    function(monster) { return `the web had no effect on the ${monster}`; },
/*  2 */    function(monster) { return `the ${monster} changed shape to avoid the web`; },
/*  3 */    function(monster) { return `the ${monster} isn't afraid of you`; },
/*  4 */    function(monster) { return `the ${monster} isn't affected`; },
/*  5 */    function(monster) { return `the ${monster} can see you with his infravision`; },
/*  6 */    function(monster) { return `the ${monster} vaporizes your missile`; },
/*  7 */    function(monster) { return `your missile bounces off the ${monster}`; },
/*  8 */    function(monster) { return `the ${monster} doesn't sleep`; },
/*  9 */    function(monster) { return `the ${monster} resists`; },
/* 10 */    function(monster) { return `the ${monster} can't hear the noise`; },
/* 11 */    function(monster) { return `the ${monster}'s tail cuts it free of the web`; },
/* 12 */    function(monster) { return `the ${monster} burns through the web`; },
/* 13 */    function(monster) { return `your missiles pass right through the ${monster}`; },
/* 14 */    function(monster) { return `the ${monster} sees through your illusions`; },
/* 15 */    function(monster) { return `the ${monster} loves the cold!`; },
/* 16 */    function(monster) { return `the ${monster} loves the water!`; },
 ];
