'use strict';

async function doGOTWStuff() {
  console.log(`GOTW enabled`);

  // let date = new Date();
  // for (let i = 0; i < 12; i++) {
  //   date.setDate(date.getDate() + 7);
  //   await uploadGOTW(date);
  // }

  return await downloadGOTW();
}

//
//
//
// UPLOAD_GOTW
//
//
//
async function uploadGOTW(dateIn) {
  console.log(`uploadGOTW()`);

  // clear out old game state
  LEVELS = new Array(MAXLEVEL + MAXVLEVEL);
  EXPLORED_LEVELS = new Array(MAXLEVEL + MAXVLEVEL).fill(false); // cache needed for GOTW games
  USED_MAZES = [];

  // generate levels
  for (let level = 0; level < LEVELS.length; level++) {
    newcavelevel(level);
  }
  // clear out unneeded data
  gameID = 'GOTW';
  logname = 'GOTW';
  player = {
    x: rnd(MAXX - 2),
    y: rnd(MAXY - 2),
  };

  const filename = getGotwFilename(dateIn);
  let state = JSON.stringify(new GameState(true));

  console.log(`uploadGOTW(): uploading ${filename} (${state.length})`);
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
  console.log(`GOTW uploaded:`, response);
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
