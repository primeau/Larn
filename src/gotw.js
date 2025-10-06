'use strict';

async function doGOTWStuff() {
  console.log(`GOTW enabled`);
  // await uploadGOTW();
  return await downloadGOTW();
}

//
//
//
// UPLOAD_GOTW
//
//
//
async function uploadGOTW() {
  console.log(`uploadGOTW()`);

  // let gotw = localStorageGetObject(`gotw`, false);
  for (let level = 0; level < LEVELS.length; level++) {
    newcavelevel(level);
  }

  // TODO: filter out more stuff before sending?
  var x = player.level;
  player.level = null;
  let state = JSON.stringify(new GameState(true));
  player.level = x;

  const filename = getGotwFilename();

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
function getGotwFilename() {
  let date = new Date();
  const year = date.getUTCFullYear();
  return `${year}/${GAMENAME}_${getGotwLabel(date)}.json`.toLocaleLowerCase();
}

// totally duplicated in cf_tools.mjs
function getGotwLabel(date) {
  const weekNumber = getISOWeek(date);
  const year = date.getUTCFullYear();
  return `${year}_${weekNumber}`;
}
