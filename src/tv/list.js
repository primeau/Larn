'use strict';

function compareGames(a, b) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  // sort by date
  if (a.createdAt == b.createdAt) return 0;
  return a.createdAt < b.createdAt ? 1 : -1;
}



function displayRecordings(games) {
  const headerText = `<b>      Date      Score  Diff  Mobuls  Player                   Fate</b><br><hr>`;
  let larnHeader = `<b>Larn:</b>\n\n${headerText}`;
  let ularnHeader = `\n<b>Ularn:</b>\n\n${headerText}`;
  document.getElementById(`LARN_LIST`).innerHTML = larnHeader;
  document.getElementById(`ULARN_LIST`).innerHTML = ularnHeader;

  games.sort(compareGames);
  games.forEach(item => addListItem(item));

  console.log(`displayRecordings: loaded ${games.length}`);
}



function addListItem(game) {

  if (!game) {
    console.log(`addlistItem(): null game`);
    return;
  }

  let datestring = new Date(game.createdAt).toLocaleString().split(",")[0];
  let score = `${padString(datestring, 10)}${padString(Number(game.score).toLocaleString(), 11)}${padString(``+game.hardlev, 6)}${padString(`${game.timeused}`, 8)}  ${padString(game.who, -25)}${padString(`${game.what} on ${game.level}`, -40)}`;
  //${padString(`${game.frames}`, 6)}  ${padString(game.gameID, -10)}`;

  let br = document.createElement('br');

  const url = location.origin + location.pathname;

  let linkText = document.createTextNode(score);
  let link = document.createElement('a');
  link.appendChild(linkText);
  link.title = "click to replay this game";
  link.href = `${url}?gameid=${game.gameID}`;

  if (game.ularn) {
    document.getElementById(`ULARN_LIST`).appendChild(link);
    document.getElementById(`ULARN_LIST`).appendChild(br);
  } else {
    document.getElementById(`LARN_LIST`).appendChild(link);
    document.getElementById(`LARN_LIST`).appendChild(br);
  }

}