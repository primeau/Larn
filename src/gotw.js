'use strict';

async function doGOTWStuff() {
  clear();
  blt();

  const startYear = 2026;
  const startWeek = 7;
  const numWeeks = 21;
  let date = new Date(startYear, 0, 1 + (startWeek - 1) * 7);
  for (let i = 0; i < numWeeks; i++) {
    lprint(`Uploading GOTW for week ${getGotwLabel(date)}...\n`);
    await uploadGOTW(date);
    date.setDate(date.getDate() + 7);
  }
}

//
//
//
// UPLOAD_GOTW
//
//
//
async function uploadGOTW(dateIn) {
  // clear out old game state
  player = new Player();
  LEVELS = new Array(MAXLEVEL + MAXVLEVEL);
  EXPLORED_LEVELS = new Array(MAXLEVEL + MAXVLEVEL).fill(false); // cache needed for GOTW games
  USED_MAZES = [];

  // generate levels
  for (let level = 0; level < LEVELS.length; level++) {
    newcavelevel(level);
  }

  // clear out unneeded data before upload
  gameID = 'GOTW';
  logname = 'GOTW';
  player = {
    x: rnd(MAXX - 2),
    y: rnd(MAXY - 2),
    LAMP: player.LAMP,
    WAND: player.WAND,
    SLAYING: player.SLAYING,
    NEGATESPIRIT: player.NEGATESPIRIT,
    CUBEofUNDEAD: player.CUBEofUNDEAD,
    NOTHEFT: player.NOTHEFT,
    TALISMAN: player.TALISMAN,
    HAND: player.HAND,
    ORB: player.ORB,
    ELVEN: player.ELVEN,
    SLASH: player.SLASH,
    BESSMANN: player.BESSMANN,
    SLAY: player.SLAY,
    VORPAL: player.VORPAL,
    STAFF: player.STAFF,
    PRESERVER: player.PRESERVER,
    PAD: player.PAD,
    ELEVUP: player.ELEVUP,
    ELEVDOWN: player.ELEVDOWN,
  };

  let state = JSON.stringify(new GameState(true));

  const filename = getGotwFilename(dateIn);
  const response = await fetch(`${CF_BROADCAST_PROTOCOL}${CF_BROADCAST_HOST}/admin/CLOUDFLARE_ADMIN_PASSWORD/gotw`, {
    method: 'PUT',
    body: JSON.stringify({
      filename: encodeURIComponent(filename),
      state: state,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => console.error('Error uploading GOTW:', err));
  console.log(`uploadGOTW():`, response);

  let playerstring = '';
  for (const key in player) playerstring += `${key}:${player[key]} `;
  console.log(`uploadGOTW(): ${playerstring}`);

  lprint(`upload ${filename} (${state.length}) ${response.status}\n`);

  if (cursory >= 23) clear();
}

//
//
//
// DOWNLOAD_GOTW
//
//
//
async function downloadGOTW() {
  try {
    // no filename given - the server decides what gotw file you are going to get
    const response = await fetch(`${CF_BROADCAST_PROTOCOL}${CF_BROADCAST_HOST}/api/gotw/${GAMENAME.toLocaleLowerCase()},${logname},${playerID}`);
    const data = await response.json();
    data.status = response.status;
    return data;
  } catch (error) {
    console.error(`downloadGOTW(): Error downloading GOTW:`, error);
    return { error: `Error downloading GOTW`, status: 500 };
  }
}

// totally duplicated in cf_tools.mjs
function getGotwFilename(dateIn) {
  let date = dateIn || new Date();
  const year = getISOYear(date);
  return `${year}/${GAMENAME}_${getGotwLabel(date)}.json`.toLocaleLowerCase();
}

// totally duplicated in cf_tools.mjs
function getGotwLabel(date) {
  const weekNumber = getISOWeek(date);
  const year = getISOYear(date);
  return `${year}_${weekNumber}`;
}
