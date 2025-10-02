'use strict';

let recordedGamesList;
let liveGamesList;



function initList() {
  document.getElementById(`TV_LARN`).innerHTML = `<h3>LarnTV: Select a game to watch below</h3>`;
  if (navigator.onLine) {
    updateMessage(`(loading)`);
  } else {
    updateMessage(`offline!`);
    return;
  }

  let inprogress = createRadio(`isComplete`, `Live`, `inprogress`, radioChanged);
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

  let showWinners = createCheckbox(`Winners`, `showWinners`, boxChecked);
  let showVisitors = createCheckbox(`Visitors`, `showVisitors`, boxChecked);
  showWinners.checked = localStorageGetObject(`larntv_select_winners`, true);
  showVisitors.checked = localStorageGetObject(`larntv_select_visitors`, true);

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
  body.appendChild(document.createTextNode(" "));
  body.appendChild(showWinners);
  body.appendChild(showWinners.label);
  body.appendChild(document.createTextNode(" "));
  body.appendChild(showVisitors);
  body.appendChild(showVisitors.label);
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
  radio.style.cursor = `pointer`;
  radioLabel.style.cursor = `pointer`;
  return radio;
}



function createCheckbox(label, id, listener) {
  let check = document.createElement('input');
  check.setAttribute('type', 'checkbox');
  check.checked = false;
  check.id = id;
  check.name = id;
  check.addEventListener('change', listener);
  let checkLabel = document.createElement('label');
  checkLabel.htmlFor = id;
  checkLabel.innerHTML = label;
  check.label = checkLabel;
  check.style.cursor = `pointer`;
  checkLabel.style.cursor = `pointer`;
  return check;
}



function radioChanged() {
  let completedRadio = document.getElementById(`completed`);
  let completed = completedRadio ? completedRadio.checked : true;
  let larn = document.getElementById(`showLarn`).checked;

  let winnersBox = document.getElementById(`showWinners`);
  let winners = winnersBox ? winnersBox.checked : true;
  let visitorsBox = document.getElementById(`showVisitors`);
  let visitors = visitorsBox ? visitorsBox.checked : true;

  let displayStyle = completed ? `inline` : `none`;
  document.getElementById(`showLarn`).style.display = displayStyle;
  document.getElementById(`showLarn`).label.style.display = displayStyle;
  document.getElementById(`showUlarn`).style.display = displayStyle;
  document.getElementById(`showUlarn`).label.style.display = displayStyle;
  document.getElementById(`showWinners`).style.display = displayStyle;
  document.getElementById(`showWinners`).label.style.display = displayStyle;
  document.getElementById(`showVisitors`).style.display = displayStyle;
  document.getElementById(`showVisitors`).label.style.display = displayStyle;


  localStorageSetObject(`larntv_select_completed`, completed);
  localStorageSetObject(`larntv_select_larn`, larn);
  localStorageSetObject(`larntv_select_winners`, winners);
  localStorageSetObject(`larntv_select_visitors`, visitors);

  displayRecordings(completed, larn, winners, visitors);
}



function boxChecked() {
  radioChanged();
}


function sortTime(a, b) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return b.createdAt - a.createdAt;
}

function sortName(a, b) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  const whoA = a.who.toUpperCase();
  const whoB = b.who.toUpperCase();
  if (whoA < whoB) {
    return -1;
  }
  if (whoA > whoB) {
    return 1;
  }
  // names must be equal
  return b.createdAt - a.createdAt;
}



function recordedGamesLoaded(games) {
  if (CLOUDFLARE_READ) {
    recordedGamesList = games; // if reading from CF
  } else {
    if (games && games[0]) recordedGamesList = games[0]; // if reading from AWS
  }
  radioChanged();
}



function liveGamesLoaded(games) {
  liveGamesList = games;
  radioChanged();
}



function displayRecordings(completed, larn, winners, visitors) {
  let headerText = `<b> Player                    Explored                                    Difficulty  Mobuls  Last Update </b><br><hr>`;
  if (completed) {
    headerText = `<b>      Date      Score  Diff  Mobuls  Player                   Fate</b><br><hr>`;
  }

  document.getElementById(`LARN_LIST`).innerHTML = headerText;

  let games = completed ? recordedGamesList : liveGamesList;

  if (!games) {
    console.log(`no games loaded`);
    return;
  }

  let sortAlgo = completed ? sortTime : sortName;
  games.sort(sortAlgo);

  // // todo
  // if (games.length > 0) {
  //   games.forEach(item => addListItem(item, completed, larn));
  // } else {
  //   document.getElementById(`LARN_LIST`).innerHTML = `no games found`;
  // }

  games.forEach(item => addListItem(item, completed, larn, winners, visitors));
}



function addListItem(game, completed, larn, winners, visitors) {

  if (!game) {
    console.log(`addlistItem(): null game`);
    return;
  }

  if (completed) {
    if (larn && game.ularn) return;
    if (!larn && !game.ularn) return;
  }

  let score;
  let endpoint = `gameid`;
  if (completed) {
    let datestring = new Date(game.createdAt).toLocaleString().split(",")[0];
    let what = game.what;
    if (!game.winner) what += ` on ${game.level}`;
    what = padString(what, -40);
    score = `${padString(datestring, 10)}${padString(Number(game.score).toLocaleString(), 11)}${padString(`` + game.hardlev, 6)}${padString(`${game.timeused}`, 8)}  ${padString(game.who, -25)}${what}`;
  } else {
    endpoint = `live`;
    // let datestring = new Date(game.createdAt).toLocaleString().split(",")[1];
    let datestring = ``;
    let lastSec = Math.ceil(((Date.now() - game.createdAt) / 1000));
    let lastMin = Math.floor(lastSec / 60);
    if (lastSec < 0) datestring = `${lastSec} (is your clock set correctly?)`;
    else if (lastSec <= 60) datestring = `${lastSec} second` + (lastSec === 1 ? `` : `s`);
    else datestring = `${lastMin} minute` + (lastMin === 1 ? `` : `s`);
    score = ` ${padString(game.who, -24)}  ${padString(`${game.explored}`, -43)}  ${padString(`` + game.hardlev, 9)} ${padString(`${game.timeused}`, 7)}  ${datestring}`;
  }

  if (!completed || game.winner && winners || !game.winner && visitors) {
    let br = document.createElement('br');

    const url = location.origin + location.pathname;

    let linkText = document.createTextNode(score);
    let link = document.createElement('a');
    link.appendChild(linkText);
    link.title = "click to watch this game";
    link.href = `${url}?${endpoint}=${game.gameID}`;

    document.getElementById(`LARN_LIST`).appendChild(link);
    document.getElementById(`LARN_LIST`).appendChild(br);
  }
}