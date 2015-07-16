"use strict";

/*
    function to create a gem on a square near the player
 */
function creategem() {
  var i, j;
  switch (rnd(4)) {
    case 1:
      i = ODIAMOND;
      j = 50;
      break;
    case 2:
      i = ORUBY;
      j = 40;
      break;
    case 3:
      i = OEMERALD;
      j = 30;
      break;
    default:
      i = OSAPPHIRE;
      j = 20;
      break;
  };
  createitem(i, rnd(j) + j / 10);
}


/*
    function to return 1 if a monster is next to the player else returns 0
 */
function nearbymonst() {
  for (var tmp = player.x - 1; tmp < player.x + 2; tmp++)
    for (var tmp2 = player.y - 1; tmp2 < player.y + 2; tmp2++)
      if (monsterAt(tmp, tmp2) != null) return (true); /* if monster nearby */
  return (false);
}
