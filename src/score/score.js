'use strict';

let IS_SCRAPER = false;
const MAX_SCORES = 72;
const THIS_WEEK = `This Week`;
const LAST_WEEK = `Last Week`;

function isUlarn() {
  ULARN = ularnRadio && ularnRadio.checked; // ULARN is used elsewhere, so update it here again just in case
  return ULARN;
}

function isWinner() {
  return winnersRadio && winnersRadio.checked;
}

function isCurrentGOTW() {
  if (!yearSelect) return false;
  const selectedOption = yearSelect.options[yearSelect.selectedIndex];
  return selectedOption && selectedOption.text === THIS_WEEK;
}

const yearSelect = document.getElementById('yearSelect');
const winnersRadio = document.getElementById('winnersRadio');
const visitorsRadio = document.getElementById('visitorsRadio');
const larnRadio = document.getElementById('larnRadio');
const ularnRadio = document.getElementById('ularnRadio');
const h1Title = document.querySelector('h1');

function updateTitle() {
  const gameName = isUlarn() ? 'Ularn' : 'Larn';
  const scoreType = isWinner() ? 'Winners' : 'Visitors';
  h1Title.textContent = `${gameName} ${scoreType} Scoreboard`;
}

function updateYearDropdown() {
  if (!yearSelect) return;
  const currentYear = new Date().getFullYear();
  let startYear = isUlarn() ? 2020 : 2016;
  // Save current selection
  const prevValue = yearSelect.value;
  // Remove all options except 'All-Time'
  yearSelect.innerHTML = '<option value="all">All-Time</option>';

  // Add Game of the Week options
  const gotwHeader = document.createElement('optgroup');
  gotwHeader.label = `Endelford's Weekly Dungeon`;

  // Current Week
  const currentDate = new Date();
  const currentWeek = getISOWeek(currentDate);
  const currentYearForWeek = getISOYear(currentDate);
  const currentOpt = document.createElement('option');
  currentOpt.value = `gotw_${currentYearForWeek}_${currentWeek}`;
  currentOpt.textContent = THIS_WEEK;
  gotwHeader.appendChild(currentOpt);

  // Previous Week
  const previousDate = new Date();
  previousDate.setDate(previousDate.getDate() - 7);
  const previousWeek = getISOWeek(previousDate);
  const previousYearForWeek = previousDate.getFullYear();
  const previousOpt = document.createElement('option');
  previousOpt.value = `gotw_${previousYearForWeek}_${previousWeek}`;
  previousOpt.textContent = LAST_WEEK;
  gotwHeader.appendChild(previousOpt);

  yearSelect.appendChild(gotwHeader);

  const yearHeader = document.createElement('optgroup');
  yearHeader.label = 'Year';
  for (let y = currentYear; y >= startYear; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearHeader.appendChild(opt);
  }
  yearSelect.appendChild(yearHeader);

  // Restore previous selection if possible
  if ([...yearSelect.options].some((o) => o.value === prevValue)) {
    yearSelect.value = prevValue;
  }
}

updateYearDropdown();

document.querySelectorAll('input[type="radio"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    ULARN = ularnRadio && ularnRadio.checked;
    updateYearDropdown();
    updateTitle();
    fetchScores();
    setScoreStorage();
  });
});

if (yearSelect) {
  yearSelect.addEventListener('change', function () {
    fetchScores();
    setScoreStorage();
  });
}

function setScoreStorage() {
  const gameType = document.querySelector('input[name="gameType"]:checked')?.value || '';
  const scoreType = document.querySelector('input[name="scoreType"]:checked')?.value || '';
  const yearValue = yearSelect?.value || '';
  const storageValue = JSON.stringify({ gameType, scoreType, year: yearValue });
  localStorage.setItem('scoreSelections', storageValue);
}

function getScoreStorage() {
  const value = localStorage.getItem('scoreSelections');
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

function setSelectionsFromStorage() {
  const storage = getScoreStorage();
  if (!storage) return;
  // Set gameType radio
  if (storage.gameType) {
    const gameTypeRadio = document.querySelector(`input[name="gameType"][value="${storage.gameType}"]`);
    if (gameTypeRadio) gameTypeRadio.checked = true;
    ULARN = ularnRadio && ularnRadio.checked;
  }
  // Set scoreType radio
  if (storage.scoreType) {
    const scoreTypeRadio = document.querySelector(`input[name="scoreType"][value="${storage.scoreType}"]`);
    if (scoreTypeRadio) scoreTypeRadio.checked = true;
  }
  // Set yearSelect
  if (storage.year && yearSelect) {
    updateYearDropdown();
    if ([...yearSelect.options].some((o) => o.value === storage.year)) {
      yearSelect.value = storage.year;
    }
  }
}

// Add event listener for the X button to close overlay
document.addEventListener('DOMContentLoaded', function () {
  const closeX = document.getElementById('overlayCloseX');
  if (closeX) {
    closeX.onclick = function () {
      document.getElementById('overlay').style.display = 'none';
    };
  }
});

const scoreboardCache = {};

async function fetchScores() {
  // Get selected game type, score type, and year
  const gameType = isUlarn() ? 'ularn' : 'larn';
  const scoreType = winnersRadio.checked ? 'winners' : 'visitors';
  const yearValue = document.getElementById('yearSelect').value;
  let endpointLabel = CF_HIGHSCORES_TABLE;
  if (yearValue.startsWith('gotw_')) {
    endpointLabel = yearValue;
  } else if (yearValue !== 'all') {
    endpointLabel = `${CF_HIGHSCORES_TABLE}_${yearValue}`;
  }
  const endpoint = `${CF_BROADCAST_PROTOCOL}${CF_BROADCAST_HOST}/api/${CF_HIGHSCORE_ENDPOINT}/${endpointLabel}/${gameType},${scoreType}`;

  // Use a cache key based on endpoint
  const cacheKey = `${endpoint}`;
  if (scoreboardCache[cacheKey]) {
    renderScores(scoreboardCache[cacheKey]);
    return;
  }

  try {
    if (IS_SCRAPER) {
      return;
    }
    const response = await fetch(endpoint);
    if (response.status === 403) {
      IS_SCRAPER = true;
      document.getElementById('scoreList').innerHTML = '<li>Scrapers are not allowed</li>';
      return;
    }
    if (response.status === 404) {
      document.getElementById('scoreList').innerHTML = '<li>The scoreboard is empty</li>';
      return;
    }
    if (!response.ok) throw new Error('Failed to fetch scores');
    const scores = await response.json();
    scoreboardCache[cacheKey] = scores;
    renderScores(scores);
  } catch (err) {
    document.getElementById('scoreList').innerHTML = '<li>Error loading scores.</li>';
  }
}

function renderScores(scores) {
  const list = document.getElementById('scoreList');
  if (!Array.isArray(scores) || scores.length === 0) {
    list.innerHTML = '<table><tbody><tr><td>No scores found.</td></tr></tbody></table>';
    return;
  }

  // Limit the scores to MAX_SCORES
  const limitedScores = scores.slice(0, MAX_SCORES);

  function formatNumber(n) {
    return n == null ? '' : n.toLocaleString();
  }
  let tableHTML = '';
  const diff = isUlarn() ? `Diff` : `Difficulty`;
  if (isWinner()) {
    tableHTML = `
      <table style="border-collapse:separate;border-spacing:0 0;">
        <thead>
          <tr style="font-weight:bold;">
            <th style="text-align:right;padding-right:2ch;padding-left:5ch;">Score</th>
            <th style="text-align:right;padding-right:2ch;">${diff}</th>
            <th style="text-align:left;padding-right:20ch;">Winner</th>
            ${isUlarn() ? '<th style="text-align:left;padding-right:7ch;">Class</th>' : ''}
            <th style="text-align:right;">Time Needed</th>
          </tr>
        </thead>
        <tbody>
          ${limitedScores
            .map(
              (score) => `
            <tr class="score-item" data-gameID="${score.gameID}" style="cursor:pointer;">
              <td style="text-align:right;padding-right:2ch;">${formatNumber(score.score)}</td>
              <td style="text-align:right;padding-right:2ch;">${score.hardlev}</td>
              <td style="text-align:left;padding-right:2ch;">${score.who}</td>
              ${isUlarn() ? `<td style="text-align:left;padding-right:2ch;">${score.character || ''}</td>` : ''}
              <td style="text-align:right;">${score.timeused} Mobuls</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  } else {
    tableHTML = `
      <table style="border-collapse:separate;border-spacing:0 0;">
        <thead>
          <tr style="font-weight:bold;">
            <th style="text-align:right;padding-right:2ch;padding-left:5ch;">Score</th>
            <th style="text-align:right;padding-right:2ch;">${diff}</th>
            <th style="text-align:left;padding-right:19ch;">Visitor</th>
            ${isUlarn() ? '<th style="text-align:left;padding-right:7ch;">Class</th>' : ''}
            <th style="text-align:left;padding-right">Fate</th>
          </tr>
        </thead>
        <tbody>
          ${limitedScores
            .map(
              (score) => `
            <tr class="score-item" data-gameID="${score.gameID}" style="cursor:pointer;">
              <td style="text-align:right;padding-right:2ch;">${formatNumber(score.score)}</td>
              <td style="text-align:right;padding-right:2ch;">${score.hardlev}</td>
              <td style="padding-right:2ch;">${score.who}</td>
              ${isUlarn() ? `<td style="text-align:left;padding-right:2ch;">${score.character || ''}</td>` : ''}
              <td>${score.what} on ${score.level}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }
  list.innerHTML = tableHTML;
  // Add click listeners
  Array.from(list.querySelectorAll('.score-item')).forEach((item) => {
    item.addEventListener('click', async (e) => {
      const gameID = item.getAttribute('data-gameID');
      if (!gameID) return;
      await showGameDetails(gameID);
    });
  });
  // Close overlay on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.getElementById('overlay').style.display = 'none';
    }
  });
}

async function fetchGameDetails(gameID) {
  try {
    const endpoint = `${CF_BROADCAST_PROTOCOL}${CF_BROADCAST_HOST}/api/${CF_SCORE_ENDPOINT}/${gameID}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      console.log(`fetchGameDetails: failed to fetch: ${response.status}`);
      return response.status;
    }
    const score = await response.json();
    return score;
  } catch (err) {
    console.log(`fetchGameDetails():`, err);
    return 554;
  }
}

// Use getStatString logic from scores.js
function parseGameDetails(score) {
  if (!score) return;

  if (typeof score === 'number') return score; // return error code

  let stats = ``;
  let linkText = ``;
  const scoreGameID = score.gameID.split(`+`)[0];
  try {
    if (score.build) {
      score.build = score.build.substr(0, 3);
      if (Number(score.build) >= 481) {
        linkText = `https://larn.org/larn/tv/?gameid=${scoreGameID}`;
        stats += `<b><a href='${linkText}'>Watch this game</a></b>\n\n`;
      }
    }

    if (score.createdAt) {
      stats += `Date: ${new Date(score.createdAt)}\n`;
    }
    stats += `Player: ${score.who}\n`;
    if (score.character && isUlarn()) stats += `Class:  ${score.character}\n`;
    stats += `Diff:   ${score.hardlev}\n`;
    stats += `Score:  ${score.score}\n`;
    stats += `Mobuls: ${score.timeused}\n`;
    stats += `Winner: ${score.winner ? 'Yes' : 'No'}\n`;
    if (!score.winner) {
      stats += `Fate: ${score.what} on ${score.level}\n`;
    }

    if (score.explored) {
      stats += `\nLevels Visited:\n${score.explored}\n\n`;
    }

    if (score.stats) {
      score.stats = JSON.parse(score.stats);
      player = loadPlayer(score.stats);
    }

    // some hacks to get data in the right places
    gtime = score.gtime;
    rmst = score.rmst;
    level = score.level;
    stats += debug_stats(player, score);

    if (score.gamelog) {
      score.gamelog = JSON.parse(score.gamelog);
      let logString = score.gamelog.join('\n').trim();
      stats += `\nFinal Moments: \n${logString}\n\n`;
    }
    stats += `Bottom Line:\n${player.getBottomLine(score.level)}\n\n`;
    stats += `Conducts observed:\n${player.getConductString()}\n\n`;
    if (score.debug) {
      stats += `Debug mode used!\n\n`;
    }

    // filter out tv urls for current gotw games
    if (isCurrentGOTW()) {
      stats = stats.replaceAll(scoreGameID, 'dQw4w9WgXcQ');
    }

    return stats;
  } catch (err) {
    console.log(`parseGameDetails():`, err);
    return 555;
  }
}

async function showGameDetails(gameID) {
  let html = ``;
  let errorMessage;
  const score = await fetchGameDetails(gameID);
  if (!score) return;

  const stats = parseGameDetails(score);
  if (!stats) return;

  if (typeof stats === 'number') {
    errorMessage = stats === 404 ? `game not found` : `failed to get game details: ${stats}`;
  }

  html = `<h2>Game Details</h2><pre style="white-space:pre-wrap;">${errorMessage || stats}</pre>
        <div class="overlay-close variablebutton" onclick="document.getElementById('overlay').style.display='none'"></div>`;
  document.getElementById('overlayContent').innerHTML = html;
  document.getElementById('overlay').style.display = 'flex';
}

setSelectionsFromStorage();
updateTitle();
fetchScores();

// Close overlay when clicking outside score items or overlay content
document.addEventListener('click', function (e) {
  const overlay = document.getElementById('overlay');
  if (!overlay || overlay.style.display === 'none') return;
  // Only keep overlay open if click is on a score-item, the X button, or inside the overlay
  const isScoreItem = e.target.classList.contains('score-item') || e.target.closest('.score-item');
  const isOverlayCloseX = e.target.id === 'overlayCloseX';
  const isOverlayContent = e.target.closest('.overlay-content');
  if (!isScoreItem && !isOverlayCloseX && !isOverlayContent) {
    overlay.style.display = 'none';
  }
});
