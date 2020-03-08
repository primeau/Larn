'use strict';


/************************************************/
/* never, ever, never use a code formatter here */
/************************************************/


/* The maximum spell num to be learnt from a book found on each dungeon level */
var splev;
const LARN_splev = [1, 4, 9, 14, 18, 22, 26, 29, 33, 36, 38, 38, 38, 38, 38];
const ULARN_splev = [1, 4, 7, 11, 15, 20, 24, 28, 30, 32, 33, 34, 35, 36, 37, 38, 38, 38, 38, 38, 38];



const spelcode = [
  `pro`, `mle`, `dex`,
  `sle`, `chm`, `ssp`,
  `web`, `str`, `enl`,
  `hel`, `cbl`, `cre`,
  `pha`, `inv`, `bal`,
  `cld`, `ply`, `can`,
  `has`, `ckl`, `vpr`,
  `dry`, `lit`, `drl`,
  `glo`, `flo`, `fgr`,
  `sca`, `hld`, `stp`,
  `tel`, `mfi`, `mkw`,
  `sph`, `gen`, `sum`, 
  `wtw`, `alt`, `per`
];



const spelname = [
  `protection`,             `magic missile`,    `dexterity`,
  `sleep`,                  `charm monster`,    `sonic spear`,
  `web`,                    `strength`,         `enlightenment`,
  `healing`,                `cure blindness`,   `create monster`,
  `phantasmal forces`,      `invisibility`,     `fireball`,
  `cold`,                   `polymorph`,        `cancellation`,
  `haste self`,             `cloud kill`,       `vaporize rock`,
  `dehydration`,            `lightning`,        `drain life`,
  `invulnerability`,        `flood`,            `finger of death`,
  `scare monster`,          `hold monster`,     `time stop`,
  `teleport away`,          `magic fire`,       `make a wall`,
  `sphere of annihilation`, `genocide`,         `summon demon`,     
  `walk through walls`,     `alter reality`,    `permanence`,
];



const speldescript = [
  /* 1 */
  `Generates a +2 protection field`,
  `Creates and hurls a magic missile equivalent to a +1 magic arrow`,
  `Adds +2 to the caster's dexterity`,
  `Causes some monsters to go to sleep`,
  `Some monsters may be awed at your magnificence`,
  `Causes the caster's hands to emit a screeching sound`,
  /* 7 */
  `Causes strands of sticky thread to entangle an enemy`,
  `Adds +2 to the caster's strength for a short term`,
  `The caster becomes aware of things in the vicinity`,
  `Restores some of the caster's health`,
  `Restores sight to one so unfortunate as to be blinded`,
  `Creates a monster near the caster`,
  `Creates illusions which, if believed, cause monsters to die`,
  `The caster becomes invisible`,
  /* 15 */
  `Makes a ball of fire that burns what it hits`,
  `Sends forth a cone of cold which freezes whatever it touches`,
  `You can find out what this does for yourself`,
  `Negates the ability of a monster to use its special abilities`,
  `Speeds up the caster's movements`,
  `Creates a fog of poisonous gas which kills all that is within it`,
  `Changes rock to air`,
  /* 22 */
  `Dries up water in the immediate vicinity`,
  `Causes the caster's fingers to emit lightning bolts`,
  `Subtracts hit points from both the caster and monster`,
  `This globe helps to protect the player from physical attack`,
  `Creates a deluge of water, flooding the immediate chamber`,
  `A holy spell calling on your god to back you up`,
  /* 28 */
  `Terrifies the monster so that it may not hit the caster`,
  `Freezes monsters in their tracks`,
  `All movement in the caverns ceases for a limited duration`,
  `Moves a particular monster around in the dungeon (hopefully away from you)`,
  `Creates a curtain of fire around the caster`,
  /* 33 */
  `Makes a wall in the specified place`,
  `Anything caught in this sphere is instantly killed. Warning: dangerous`,
  `Eliminates a species of monster from the game -- use sparingly`,
  `Summons a demon who may help you out`,
  `Allows the player to walk through walls for a short period of time`,
  `God only knows what this will do`,
  `Makes a character's spell permanent, i.e. protection, strength, etc.`,
];


var spelweird;

const LARN_spelweird = [
/*                      p m d s c s    w s e h c c p i    b c p c h c v    d l d g f f    s h s t m m    s g s w a p */
/*                      r l e l h s    e t n e b r h n    a l l a a k p    r i r l l g    c l t e f k    p e u t l e */
/*                      o e x e m p    b r l l l e a v    l d y n s l r    y t l o o r    a d p l i w    h n m w t r */

/*            bat */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*          gnome */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*      hobgoblin */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*         jackal */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*         kobold */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],

/*            orc */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   4,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*          snake */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*giant centipede */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*         jaculi */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*     troglodyte */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],

/*      giant ant */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*   floating eye */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*     leprechaun */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*          nymph */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*         quasit */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],

/*   rust monster */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   4,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*         zombie */ [  0,0,0,8,0,4,   0,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   4,0,0,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*   assassin bug */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*        bugbear */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*     hell hound */ [  0,6,0,0,0,0,   12,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],

/*     ice lizard */ [  0,0,0,0,0,0,   11,0,0,0,0,0,0,0,  0,15,0,0,0,0,0,  0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*        centaur */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*          troll */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   4,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*           yeti */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,15,0,0,0,0,0,  0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*   white dragon */ [  0,0,0,0,0,0,   0,0,0,0,0,0,14,0,  0,15,0,0,0,0,0,  4,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],

/*            elf */ [  0,0,0,0,0,0,   0,0,0,0,0,0,14,5,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*gelatinous cube */ [  0,0,0,0,0,0,   2,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   0,0,0,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*      metamorph */ [  0,13,0,0,0,0,  2,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   4,0,0,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*         vortex */ [  0,13,0,0,0,10, 1,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*         ziller */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],

/*   violet fungi */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*         wraith */ [  0,0,0,8,0,4,   0,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   4,0,0,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*      forvalaka */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*      lama nobe */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*        osequip */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],

/*          rothe */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*           xorn */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   4,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*        vampire */ [  0,0,0,8,0,4,   0,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   0,0,0,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*invisiblestalker*/ [  0,0,0,0,0,0,   1,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*    poltergeist */ [  0,13,0,8,0,4,  1,0,0,0,0,0,0,0,   0,4,0,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,0,   0,0,0,0,0,0 ],

/* disenchantress */ [  0,0,0,8,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*shambling mound */ [  0,0,0,0,0,10,  0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*    yellow mold */ [  0,0,0,8,0,0,   1,0,0,0,0,0,4,0,   0,0,0,0,0,4,0,   0,0,0,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*     umber hulk */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*     gnome king */ [  0,7,0,0,3,0,   0,0,0,0,0,0,0,5,   0,0,9,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],

/*          mimic */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*     water lord */ [  0,13,0,8,3,4,  1,0,0,0,0,0,0,0,   0,0,9,0,0,4,0,   0,0,0,0,16,4,  0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*  bronze dragon */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*   green dragon */ [  0,7,0,0,0,0,   11,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*    purple worm */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],

/*          xvart */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*    spirit naga */ [  0,13,0,8,3,4,  1,0,0,0,0,0,0,5,   0,4,9,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*  silver dragon */ [  0,6,0,9,0,0,   12,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*platinum dragon */ [  0,7,0,9,0,0,   11,0,0,0,0,0,14,0, 0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*   green urchin */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],
/*     red dragon */ [  0,6,0,0,0,0,   12,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 ],

/*                      p m d s c s    w s e h c c p i    b c p c h c v    d l d g f f    s h s t m m    s g s w a p */
/*                      r l e l h s    e t n e b r h n    a l l a a k p    r i r l l g    c l t e f k    p e u t l e */
/*                      o e x e m p    b r l l l e a v    l d y n s l r    y t l o o r    a d p l i w    h n m w t r */

/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,9,4,0,   9,0,0,0,0,0 ],
/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,9,4,0,   9,0,0,0,0,0 ],
/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,9,4,0,   9,0,0,0,0,0 ],
/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,9,4,0,   9,0,0,0,0,0 ],
/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,9,4,0,   9,0,0,0,0,0 ],
/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,9,4,0,   9,0,0,0,0,0 ],
/*     demon lord */ [  0,7,0,4,3,0,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   0,0,0,9,4,0,   9,0,0,0,0,0 ],
/*   demon prince */ [  0,7,0,4,3,9,   1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   3,0,0,9,4,0,   9,0,17,0,0,0 ]
 ];



 const ULARN_spelweird = [

/*                      p m d s c s    w s e h c c p i    b c p c h c v    d l d g f f    s h s t m m    s g s w a p */
/*                      r l e l h s    e t n e b r h n    a l l a a k p    r i r l l g    c l t e f k    p e u t l e */
/*                      o e x e m p    b r l l l e a v    l d y n s l r    y t l o o r    a d p l i w    h n m w t r */

/*        lemming */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*          gnome */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*      hobgoblin */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*         jackal */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*         kobold */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],

/*            orc */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*          snake */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*giant centipede */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*         jaculi */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*     troglodyte */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],

/*      giant ant */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*   floating eye */ [  0,0,0,8,0,10,  0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*     leprechaun */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*          nymph */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*         quasit */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],

/*   rust monster */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*         zombie */ [  0,0,0,8,0,4,   0,0,0,0,0,0,4,0,   0,0,0,0,0,4,0,   4,0,4,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*   assassin bug */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*        bugbear */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*     hell hound */ [  0,6,0,0,0,0,   12,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],

/*     ice lizard */ [  0,0,0,0,0,0,   11,0,0,0,0,0,0,0,  0,15,0,0,0,0,0,  0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*        centaur */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*          troll */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   4,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*           yeti */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,15,0,0,0,0,0,  0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*   white dragon */ [  0,0,0,0,0,0,   0,0,0,0,0,0,14,0,  0,15,0,0,0,0,0,  4,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],

/*            elf */ [  0,0,0,0,0,0,   0,0,0,0,0,0,14,5,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*gelatinous cube */ [  0,13,0,8,0,10, 2,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   0,0,0,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*      metamorph */ [  0,13,0,0,0,0,  2,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   4,0,0,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*         vortex */ [  0,13,0,0,0,10, 1,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   4,0,0,0,4,4,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*         ziller */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],

/*   violet fungi */ [  0,0,0,8,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*         wraith */ [  0,13,0,8,0,4,  0,0,0,0,0,0,14,0,  0,0,0,0,0,4,0,   4,0,4,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*      forvalaka */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*      lama nobe */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*        osequip */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*          rothe */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*           xorn */ [  0,7,0,8,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   4,0,0,0,4,4,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*        vampire */ [  0,0,0,0,0,4,   2,0,0,0,0,0,14,0,  0,0,0,0,0,4,0,   0,0,4,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*invisiblestalker*/ [  0,0,0,0,0,0,   1,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*    poltergeist */ [  0,13,0,8,0,4,  1,0,0,0,0,0,0,0,   0,4,0,0,0,4,0,   4,0,4,0,4,4,   0,0,0,0,0,0,   0,0,0,0,0,0 	],

/* disenchantress */ [  0,0,0,8,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*shambling mound */ [  0,0,0,0,0,10,  0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*    yellow mold */ [  0,0,0,8,0,10,  1,0,0,0,0,0,0,0,   0,0,0,0,0,4,0,   0,0,0,0,0,4,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*     umber hulk */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,5,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*     gnome king */ [  0,7,0,0,3,0,   0,0,0,0,0,0,0,5,   0,0,9,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],

/*          mimic */ [  0,0,0,0,0,0,   2,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*     water lord */ [  0,13,0,8,3,4,  1,0,0,0,0,0,0,0,   0,0,9,0,0,4,0,   0,0,0,0,16,4,  0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*  bronze dragon */ [  0,7,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*   green dragon */ [  0,7,0,0,0,0,   11,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*    purple worm */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],

/*          xvart */ [  0,13,0,0,0,0,  0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,4,4,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*    spirit naga */ [  0,13,0,8,3,4,  1,0,0,0,0,0,14,5,  0,4,9,0,0,4,0,   4,0,4,0,4,4,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*  silver dragon */ [  0,6,0,9,0,0,   12,0,0,0,0,0,0,0,  0,0,9,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*platinum dragon */ [  0,7,0,9,0,0,   11,0,0,0,0,0,14,0, 0,0,9,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*   green urchin */ [  0,0,0,0,0,0,   0,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],
/*     red dragon */ [  0,6,0,0,0,0,   12,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0,   0,0,0,0,0,0 	],

/*                      p m d s c s    w s e h c c p i    b c p c h c v    d l d g f f    s h s t m m    s g s w a p */
/*                      r l e l h s    e t n e b r h n    a l l a a k p    r i r l l g    c l t e f k    p e u t l e */
/*                      o e x e m p    b r l l l e a v    l d y n s l r    y t l o o r    a d p l i w    h n m w t r */

/*     demon lord */ [  0,13,0,8,3,10, 1,0,0,0,0,0,14,5,  0,0,9,0,0,4,0,   4,0,9,0,4,4,   3,0,0,9,4,0,   9,0,0,0,0,0 	],
/*     demon lord */ [  0,13,0,8,3,10, 1,0,0,0,0,0,14,5,  0,0,9,0,0,4,0,   4,0,9,0,4,4,   3,0,0,9,4,0,   9,0,0,0,0,0 	],
/*     demon lord */ [  0,13,0,8,3,10, 1,0,0,0,0,0,14,5,  0,0,9,0,0,4,0,   4,0,9,0,4,4,   3,0,0,9,4,0,   9,0,0,0,0,0 	],
/*     demon lord */ [  0,13,0,8,3,10, 1,0,0,0,0,0,14,5,  0,0,9,0,0,4,0,   4,0,9,0,4,4,   3,0,0,9,4,0,   9,0,0,0,0,0 	],
/*     demon lord */ [  0,13,0,8,3,10, 1,0,0,0,0,0,14,5,  0,0,9,0,0,4,0,   4,0,9,0,4,4,   3,0,0,9,4,0,   9,0,0,0,0,0 	],
/*     demon lord */ [  0,13,0,8,3,10, 1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   3,0,0,9,4,0,   9,0,0,0,0,0 	],
/*     demon lord */ [  0,13,0,8,3,10, 1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,0,0,4,4,   3,0,0,9,4,0,   9,0,0,0,0,0 	],
/*   demon prince */ [  0,13,0,8,3,10, 1,0,0,0,0,0,14,5,  0,0,4,0,0,4,0,   4,0,4,0,4,4,   3,0,0,9,4,0,   9,0,0,0,0,0 	],
/*God of Hellfire */ [  0,13,0,8,3,10, 1,0,0,0,0,0,14,5,  18,0,9,0,0,4,0,  4,18,4,0,4,4,  3,0,0,9,4,0,   9,0,17,0,0,0 ]
];




 // JRP i would love to use arrow functions here, but it's way too new of a feature
var spelmes = [ 
/*  0 */ ``, /* spell has no effect on the monster */
/*  1 */ function(monster) { return `the web had no effect on the ${monster}`; },
/*  2 */ function(monster) { return `the ${monster} changed shape to avoid the web`; },
/*  3 */ function(monster) { return `the ${monster} isn't afraid of you`; },
/*  4 */ function(monster) { return `the ${monster} isn't affected`; },
/*  5 */ function(monster) { return `the ${monster} can see you with its infravision`; },
/*  6 */ function(monster) { return `the ${monster} vaporizes your missile`; },
/*  7 */ function(monster) { return `your missile bounces off the ${monster}`; },
/*  8 */ function(monster) { return `the ${monster} doesn't sleep`; },
/*  9 */ function(monster) { return `the ${monster} resists`; },
/* 10 */ function(monster) { return `the ${monster} can't hear the noise`; },
/* 11 */ function(monster) { return `the ${monster}'s tail cuts it free of the web`; },
/* 12 */ function(monster) { return `the ${monster} burns through the web`; },
/* 13 */ function(monster) { return `your missiles pass right through the ${monster}`; },
/* 14 */ function(monster) { return `the ${monster} sees through your illusions`; },
/* 15 */ function(monster) { return `the ${monster} loves the cold!`; },
/* 16 */ function(monster) { return `the ${monster} loves the water!`; },
/* 17 */ function(monster) { return `the demon is terrified of the ${monster}!`; },
/* 18 */ function(monster) { return `the ${monster} loves fire and lightning!`; },
 ];



const MLE = 1;
const SLE = 3;
const SSP = 5;
const WEB = 6;
const PHA = 12;
const BAL = 14;
const CLD = 15;
const PLY = 16;
const DRY = 21;
const LIT = 22;
const DRL = 23;
const FGR = 26;
const TEL = 30;
const MKW = 32;
const GEN = 34;
const SUM = 35;
const ALT = 37;
const PER = 38;



const attackmessage = [];
attackmessage[MLE] = function(monster, i) { return `  Your missile${(player.LEVEL >= 2) ? `s` : ``} hit the ${monster}`; };
attackmessage[SLE] = function(monster, i) { return `  While the ${monster} slept, you smashed it ${i} times`; };
attackmessage[SSP] = function(monster, i) { return `  The sound damages the ${monster}`; };
attackmessage[WEB] = function(monster, i) { return `  While the ${monster} is entangled, you hit ${i} times`; };
attackmessage[PHA] = function(monster, i) { return `  The ${monster} believed!`; };
attackmessage[BAL] = function(monster, i) { return `  The fireball hits the ${monster}`; };
attackmessage[CLD] = function(monster, i) { return `  Your cone of cold strikes the ${monster}`; };
attackmessage[DRY] = function(monster, i) { return `  The ${monster} shrivels up`; };
attackmessage[LIT] = function(monster, i) { return `  A lightning bolt hits the ${monster}`; };
attackmessage[DRL] = function(monster, i) { return ``;  };
attackmessage[FGR] = function(monster, i) { return `  The ${monster}'s heart stopped`; };
attackmessage[SUM] = function(monster, i) { return `  The demon strikes at the ${monster}`; };
