'use strict';

let completedGames;
let gamesInProgress;



function initList() {
  document.getElementById(`TV_LARN`).innerHTML = `<h3>LarnTV: Select a game to watch below</h3>`;
  if (navigator.onLine) {
    updateMessage(`(loading)`);
  } else {
    updateMessage(`offline!`);
    return;
  }

  let inprogress = createRadio(`isComplete`, `Games in Progress`, `inprogress`, radioChanged);
  let completed = createRadio(`isComplete`, `Completed Games`, `completed`, radioChanged);
  if (ENABLE_RECORDING_REALTIME) {
    completed.checked = localStorageGetObject(`larntv_select_completed`, true);
    inprogress.checked = !completed.checked;
  } else {
    completed.checked = true;
  }

  let showLarn = createRadio(`gameType`, `Larn`, `showLarn`, radioChanged);
  let showUlarn = createRadio(`gameType`, `Ularn`, `showUlarn`, radioChanged);
  showLarn.checked = localStorageGetObject(`larntv_select_larn`, true);
  showUlarn.checked = !showLarn.checked;

  let body = document.getElementById('TV_FOOTER');
  if (!body) return;
  while (body.firstChild) {
    body.firstChild.remove();
  }

  if (ENABLE_RECORDING_REALTIME) {
    body.appendChild(completed);
    body.appendChild(completed.label);
    body.appendChild(document.createTextNode(" "));
    body.appendChild(inprogress);
    body.appendChild(inprogress.label);
    body.appendChild(document.createElement('p'));
  }

  body.appendChild(showLarn);
  body.appendChild(showLarn.label);
  body.appendChild(document.createTextNode(" "));
  body.appendChild(showUlarn);
  body.appendChild(showUlarn.label);
  body.appendChild(document.createElement('p'));
}



function createRadio(group, label, id, listener) {
  let radio = document.createElement(`input`);
  radio.setAttribute(`type`, `radio`);
  radio.setAttribute(`name`, group);
  radio.id = id;
  radio.addEventListener('change', listener);
  let radioLabel = document.createElement('label');
  radioLabel.htmlFor = id;
  radioLabel.innerHTML = label;
  radio.label = radioLabel;
  return radio;
}



function radioChanged() {
  let completedRadio = document.getElementById(`completed`);
  let completed = completedRadio ? completedRadio.checked : true;
  let larn = document.getElementById(`showLarn`).checked;

  localStorageSetObject(`larntv_select_completed`, completed);
  localStorageSetObject(`larntv_select_larn`, larn);

  displayRecordings(completed, larn);
}



function compareGames(a, b, lastUpdate) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  // sort by date
  if (lastUpdate) {
    if (a.updateTime == b.updateTime) return 0;
    return a.updateTime < b.updateTime ? 1 : -1;

  } else {
    if (a.createdAt == b.createdAt) return 0;
    return a.createdAt < b.createdAt ? 1 : -1;
  }
}



function setRecordings(games) {
  let completedRadio = document.getElementById(`completed`);
  let completed = completedRadio ? completedRadio.checked : true;
  let larn = document.getElementById(`showLarn`).checked;
  completedGames = games[0];
  gamesInProgress = games[1];
  displayRecordings(completed, larn);
}



function displayRecordings(completed, larn) {
  let headerText = `<b> Last Update  Diff  Mobuls  Player                   Progress</b><br><hr>`;
  if (completed) {
    headerText = `<b>      Date      Score  Diff  Mobuls  Player                   Fate</b><br><hr>`;
  }

  document.getElementById(`LARN_LIST`).innerHTML = headerText;

  let games = completed ? completedGames : gamesInProgress;

  if (!games) {
    console.log(`no games loaded`);
    return;
  }
  games.sort(compareGames, completed);

  // // todo
  // if (games.length > 0) {
  //   games.forEach(item => addListItem(item, completed, larn));
  // } else {
  //   document.getElementById(`LARN_LIST`).innerHTML = `no games found`;
  // }

  games.forEach(item => addListItem(item, completed, larn));
}



function addListItem(game, completed, larn) {

  if (!game) {
    console.log(`addlistItem(): null game`);
    return;
  }

  if (larn && game.ularn) return;
  if (!larn && !game.ularn) return;
  // if (!completed && game.updateTime < Date.now() - 2 * 60 * 60 * 1000) return;

  let score;
  if (completed) {
    let datestring = new Date(game.createdAt).toLocaleString().split(",")[0];
    score = `${padString(datestring, 10)}${padString(Number(game.score).toLocaleString(), 11)}${padString(``+game.hardlev, 6)}${padString(`${game.timeused}`, 8)}  ${padString(game.who, -25)}${padString(`${game.what} on ${game.level}`, -40)}`;
    //${padString(`${game.frames}`, 6)}  ${padString(game.gameID, -10)}`;
  } else {
    let datestring = new Date(game.updateTime).toLocaleString().split(",")[1];
    score = `${padString(datestring, 12)}${padString(``+game.hardlev, 6)}${padString(`${game.timeused}`, 8)}  ${padString(game.who, -25)}${padString(`${game.explored}`, -57)}`;
  }

  let br = document.createElement('br');

  const url = location.origin + location.pathname;

  let linkText = document.createTextNode(score);
  let link = document.createElement('a');
  link.appendChild(linkText);
  link.title = "click to replay this game";
  link.href = `${url}?gameid=${game.gameID}`;

  document.getElementById(`LARN_LIST`).appendChild(link);
  document.getElementById(`LARN_LIST`).appendChild(br);
}