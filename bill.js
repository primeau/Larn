'use strict';


var highestScore;

/*
BUG: if a player wins at a lower/same difficulty, with a lower
score, this will indicate more taxes are due. On the other hand,
taxes don't need to be paid, so I'm ignoring it.
*/
function readmail() {
  var scores = localStorageGetObject('winners', []).sort(sortScore);
  highestScore = getHighScore(scores, logname);
  var gold = 0;
  if (highestScore) gold = highestScore.score;
  letter1(gold);
}



/*
 *  function to create the tax bill for the user
 */
function letter1(gold) {
  clear();

  lprcat(`<b>From:</b> The LRS (${GAMENAME} Revenue Service)`);
  if (ULARN) lprcat(` &ltlrs@ularn.com&gt`);
  lprcat(`\n`);
  lprcat(`\n<b>Subject:</b> Undeclared income\n`);

  lprcat(`\n   We heard you survived the caverns of ${GAMENAME}. Let me be the`);
  lprcat(`\nfirst to congratulate you on your success. It is quite a feat.`);
  lprcat(`\nIt must also have been very profitable for you.`);
  lprcat(`\n\n   The Dungeon Master has informed us that you brought`);
  lprcat(`\n${Number(gold).toLocaleString()} gold pieces back with you from your journey. As the`);
  lprcat(`\ncounty of ${GAMENAME} is in dire need of funds, we have spared no time`);
  lprcat(`\nin preparing your tax bill. You owe <strike>${Math.round(gold * TAXRATE).toLocaleString()}</strike> 0 gold pieces as`);
  lprcat(`\nof this notice, and is due within 5 days. Failure to pay will`);
  lprcat(`\nmean penalties. Once again, congratulations, We look forward`);
  lprcat(`\nto your future successful expeditions.\n`);

  cursors();
  lprcat(`                --- press <b>space</b> to continue ---\n`);
  setCharCallback(letter2);

  return (1);
}



function letter2(key) {

  let letter2title = `Champion`;
  if (getLetterGender() === `Male`) letter2title = `Knight`;
  if (getLetterGender() === `Female`) letter2title = `Lady`;

  if (key != ' ') return 0;

  clear();

  lprcat(`<b>From:</b> His Majesty King Wilfred of Larndom`);
  if (ULARN) lprcat(` &ltwilfred@ularn.com&gt`);
  lprcat(`\n`);
  lprcat(`\n<b>Subject:</b> A noble deed\n`);

  lprcat(`\n   I have heard of your magnificent feat, and I, King Wilfred,`);
  lprcat(`\nforthwith declare today to be a national holiday. Furthermore,`);
  lprcat(`\nhence three days, Ye be invited to the castle to receive the`);
  lprcat(`\nhonour of ${letter2title} of the realm. Upon thy name shall it be written. . .`);
  lprcat(`\nBravery and courage be yours.`);
  lprcat(`\nMay you live in happiness forevermore . . .\n`);

  cursors();
  lprcat(`                --- press <b>space</b> to continue ---\n`);
  setCharCallback(letter3);

  return (1);
}



function letter3(key) {

  let letter3insult = `Jerk`;
  if (getLetterGender() === `Male`) letter3insult = `Bastard`;
  if (getLetterGender() === `Female`) letter3insult = `Bitch`;

  if (key != ' ') return 0;

  clear();

  lprcat(`<b>From:</b> Count Endelford`);
  if (ULARN) lprcat(` &ltendelford@ularn.com&gt`);
  lprcat(`\n`);
  lprcat(`\n<b>Subject:</b> You ${letter3insult}!\n`);

  lprcat(`\n   I heard (from sources) of your journey. Congratulations!`);
  lprcat(`\nYou ${letter3insult}! With several attempts I have yet to endure the`);
  lprcat(` caves,\nand you, a nobody, makes the journey! From this time`);
  lprcat(` onward, bewarned\nupon our meeting you shall pay the price!\n`);

  cursors();
  lprcat(`                --- press <b>space</b> to continue ---\n`);
  setCharCallback(letter4);

  return (1);
}



function letter4(key) {

  if (key != ' ') return 0;

  clear();

  lprcat(`<b>From:</b> Mainair, Duke of Larnty`);
  if (ULARN) lprcat(` &ltmainair@ularn.com&gt`);
  lprcat(`\n`);
  lprcat(`\n<b>Subject:</b> High Praise\n`);

  lprcat(`\n   With a certainty a hero I declare to be amongst us! A nod of`);
  lprcat(`\nfavour I send to thee. Me thinks Count Endelford this day of`);
  lprcat(`\nright breath'eth fire as of dragon of whom ye are slayer. I`);
  lprcat(`\nyearn to behold his anger and jealously. Should ye choose to`);
  lprcat(`\nunleash some of thy wealth upon those who be unfortunate, I,`);
  lprcat(`\nDuke Mainair, Shall equal thy gift also.\n`);

  cursors();
  lprcat(`                --- press <b>space</b> to continue ---\n`);
  setCharCallback(letter5);

  return (1);
}



function letter5(key) {

  let letter5plea = `person's`;
  if (getLetterGender() === `Male`) letter5plea = `man's`;
  if (getLetterGender() === `Female`) letter5plea = `woman's`;

  if (key != ' ') return 0;

  clear();

  lprcat(`<b>From:</b> St. Mary's Children's Home`);
  if (ULARN) lprcat(` &ltstmarys@ularn.com&gt`);
  lprcat(`\n`);
  lprcat(`\n<b>Subject:</b> These poor children\n`);

  lprcat(`\n   News of your great conquests has spread to all of Larndom.`);
  lprcat(`\nMight I have a moment of a great ${letter5plea} time. We here at St.`);
  lprcat(`\nMary's Children's Home are very poor, and many children are`);
  lprcat(`\nstarving. Disease is widespread and very often fatal without`);
  lprcat(`\ngood food. Could you possibly find it in your heart to help us`);
  lprcat(`\nin our plight? Whatever you could give will help much.`);
  lprcat(`\n(your gift is tax deductible)\n`);

  cursors();
  lprcat(`                --- press <b>space</b> to continue ---\n`);
  setCharCallback(letter6);

  return (1);
}



function letter6(key) {

  let letter6disease = `Cancer`;
  if (ULARN) letter6disease = `Dianthroritis`

  if (key != ' ') return 0;

  clear();

  lprcat(`<b>From:</b> The National ${letter6disease} Society of ${GAMENAME}`);
  if (ULARN) lprcat(` &ltnds@ularn.com&gt`);
  lprcat(`\n`);
  lprcat(`\n<b>Subject:</b> Hope\n`);

  lprcat(`\n   Congratulations on your successful expedition. We are sure much`);
  lprcat(`\ncourage and determination were needed on your quest. There are`);
  lprcat(`\nmany though, that could never hope to undertake such a journey`);
  lprcat(`\ndue to an enfeebling disease -- ${letter6disease}. We at the National`);
  lprcat(`\n${letter6disease} Society of ${GAMENAME} wish to appeal to your philanthropy in`);
  lprcat(`\norder to save many good people -- possibly even yourself a few`);
  lprcat(`\nyears from now. Much work needs to be done in researching this`);
  lprcat(`\ndreaded disease, and you can help today. Could you please see it`);
  lprcat(`\nin your heart to give generously? Your continued good health`);
  lprcat(`\ncan be your everlasting reward.\n`);

  cursors();
  lprcat(`                --- press <b>space</b> to continue ---\n`);

  if (ULARN) {
    setCharCallback(setdiff);
  } else {
    setCharCallback(startgame);
  }

  return (1);
}



function getLetterGender() {
  var gender = localStorageGetObject('gender') || 'Male';
  if (!ULARN) gender = `Male`;
  return gender;
}