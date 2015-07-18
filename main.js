"use strict";

/*
    subroutine to get a number from the player
    and allow * to mean return amt, else return the number entered
 */
// unsigned long readnum(mx) {
//   register int i;
//   register unsigned long amt = 0;
//
//   sncbr();
//   /* allow him to say * for all gold
//    */
//   if ((i = ttgetch()) == '*')
//     amt = mx;
//   else
//   /* read chars into buffer, deleting when requested */
//     while (i != '\n') {
//     if (i == '\033') {
//       scbr();
//       lprcat(" aborted");
//       return (0);
//     }
//     if ((i <= '9') && (i >= '0') && (amt < 999999999))
//       amt = amt * 10 + i - '0';
//     if ((i == '\010') || (i == '\177'))
//       amt = (long)(amt / 10);
//     i = ttgetch();
//   }
//   scbr();
//   return (amt);
// }
