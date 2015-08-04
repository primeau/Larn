"use strict";

function outfortune() {
  updateLog("The cookie was delicious.");
  if (player.BLINDCOUNT)
    return;
  var fortune = ftn[rund(ftn.length)];
  updateLog("Inside you find a scrap of paper that says:");
  updateLog(`  ${fortune}`);
}


// TODO  quaffpotion, readscroll, eatcookie are all very similar
function act_eatcookie(index) {
  var useindex = getIndexFromChar(index);
  var item = player.inventory[useindex];
  if (item != null && item.matches(OCOOKIE)) {
    player.inventory[useindex] = null;
    outfortune();
  } else {
    if (item == null) {
      //debug(useindex);

      if (index == '*' || index == ' ') {
        if (!IN_STORE) {
          showinventory(true, act_eatcookie, showeat, false, false);
        }
        else {
          IN_STORE = false;
          paint();
        }
        nomove = 1;
        return;
      }

      if (useindex >= 0 && useindex < 26) {
        updateLog(`  You don't have item ${index}!`);
      }
      if (useindex <= -1) {
          appendLog(` cancelled`);
      }
    } else {
      updateLog(`  You can't eat that!`);
    }
  }
  IN_STORE = false;
  return 1;
}


const ftn = [
  `Gem value = gem * 2 ^ perfection`,
  `Sitting down can have unexpected results`,
  `Don't pry into the affairs of others`,
  `Drinking can be hazardous to your health`,
  `Beware of the gusher!`,
  `Some monsters are greedy`,
  `Nymphs have light fingers`,
  `Try kissing a disenchantress!`,
  `The Eye of Larn improves with time`,
  `Hammers and brains don't mix`,
  `What does a potion of cure dianthroritis taste like?`,
  `Hit point gain/loss when raising a level depends on constitution`,
  `Healing a mighty wizard can be exhilarating`,
  `Be sure to pay your taxes`,
  `Are Vampires afraid of something?`,
  `Some dragons can fly`,
  `Dost thou strive for perfection?`,
  `Patience is a virtue, unless your daughter dies`,
  `What does the Eye of Larn see in its guardian?`,
  `A level 25 player casts like crazy!`,
  `Energy rings affect spell regeneration`,
  `My, aren't you clever!`,
  `Difficulty affects regeneration`,
  `Control of the pesty spirits is most helpful`,
  `Don't fall into a bottomless pit`,
  `Dexterity allows you to carry more`,
  `You can get 2 points of WC for the price of one`,
  `Never enter the dungeon naked! The monsters will laugh at you!`,
  `Did someone put itching powder in your armor?`,
  `You klutz!`,
  `Avoid opening doors. You never know whats on the other side.`,
  `Infinite regeneration ---> temptation`,
  `The greatest weapon in the game has not the highest Weapon Class`,
  `You can't buy the most powerful scroll`,
  `Identify things before you use them`,
  `There's more than one way through a wall`,
];
