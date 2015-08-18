"use strict";

var yrepcount = 0; // TODO deprecate

// TODO

/*
    function to set the desired hardness
    enter with hard= -1 for default hardness, else any desired hardness
 */
function sethard(hard) {
  //     register int    j,k;
  //     long        i;
  //     struct monst    *mp;
  //
  //     j=c[HARDGAME]; hashewon();
  //     if (restorflag==0)  /* don't set c[HARDGAME] if restoring game */
  //         {
  //         if (hard >= 0) c[HARDGAME]= hard;
  //         }
  //     else c[HARDGAME]=j; /* set c[HARDGAME] to proper value if restoring game */
  //
  //     if (k=c[HARDGAME])
  //       for (j=0; j<=MAXMONST+8; j++) {
  //         mp = &monster[j];
  //         i = ((6+k) * mp->hitpoints + 1)/6;
  //         mp->hitpoints = (i<0) ? 32767 : i;
  //         i = ((6+k) * mp->damage + 1) / 5;
  //         mp->damage = (i>127) ? 127 : i;
  //         i = (10 * mp->gold)/(10+k);
  //         mp->gold = (i>32767) ? 32767 : i;
  //         i = mp->armorclass - k;
  //         mp->armorclass = (i< -127) ? -127 : i;
  //         i = (7*mp->experience)/(7+k) + 1;
  //         mp->experience = (i<=0) ? 1 : i;
  //     }
}
