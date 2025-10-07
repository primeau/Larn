'use strict';

async function doGOTWStuff() {
  console.log(`GOTW enabled`);

  // let date = new Date();
  // for (let i = 0; i < 12; i++) {
  //   await uploadGOTW(date);
  //   date.setDate(date.getDate() + 7);
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
  
  let state = JSON.stringify(new GameState(true));
  
  const filename = getGotwFilename(dateIn);
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

  return null;
}

//
//
//
// DOWNLOAD_GOTW
//
//
//
async function downloadGOTW() {
  console.log(`downloadGOTW()`);
  try {
    // no filename given - the server decides what gotw file you are going to get
    const response = await fetch(`${CF_BROADCAST_PROTOCOL}${CF_BROADCAST_HOST}/api/gotw/${GAMENAME.toLocaleLowerCase()},${logname},${playerID}`);
    const data = await response.json();
    console.log(`GOTW data downloaded:`, data.LEVELS.length);
    return {
      data: data,
      status: response.status,
    };
  } catch (error) {
    console.error(`Error downloading GOTW:`, error);
    return null;
  }
}

// totally duplicated in cf_tools.mjs
function getGotwFilename(dateIn) {
  let date = dateIn || new Date();
  const year = date.getUTCFullYear();
  return `${year}/${GAMENAME}_${getGotwLabel(date)}.json`.toLocaleLowerCase();
}

// totally duplicated in cf_tools.mjs
function getGotwLabel(date) {
  const weekNumber = getISOWeek(date);
  const year = date.getUTCFullYear();
  return `${year}_${weekNumber}`;
}
