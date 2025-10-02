'use strict';

let liveMetadata;
let liveFrameCache;
let GET_LIVE_INTERVAL = null;


function watchLive() {
  initLivePlayer();

  let liveFrame = new Frame();
  liveFrame.divs = {
    LARN: `Waiting for our Hero's next move. This could take a minute...`,
    STATS: ``
  };

  setStyle();
  bltFrame(liveFrame);
}



function initLivePlayer() {
  let body = document.getElementById('TV_FOOTER');
  if (!body) return;
  while (body.firstChild) {
    body.firstChild.remove();
  }
}



// cloudlare callback
function setLiveStyleCallback(styleIn) {
  setStyle(JSON.parse(styleIn));
}



function bltLiveFrame(data) {
  if (!data) return;

  try {
    if (data.message) {
      let decompressedFrame = LZString.decompressFromUTF16(data.message);
      let newFrame = JSON.parse(decompressedFrame);

      setStyle(liveMetadata);
      bltFrame(newFrame);

      liveFrameCache = data;
      liveMetadata = newFrame.metadata; // TODO: WHY IS THIS DONE *AFTER*?
      let exp = liveMetadata.explored.replaceAll(/\s/g, ``);
      document.title = `LarnTV: ${liveMetadata.who} ${exp}`;

    }
  }
  catch (error) {
    console.error(`bltLiveFrame: `, error);
  }
}



function downloadliveGamesList(downloadCompleteCallback) {
  if (!navigator.onLine) {
    console.error(`downloadliveGamesList(): offline`);
    return;
  }
  getLive(downloadCompleteCallback);
  GET_LIVE_INTERVAL = setInterval(getLive, LIVE_LIST_REFRESH * 1000, downloadCompleteCallback);
}



async function getLive(downloadCompleteCallback) {
  if (!navigator.onLine) {
    console.error(`getLive(): offline`);
    return;
  }
  try {
    const response = await fetch(`${CF_BROADCAST_PROTOCOL}${CF_BROADCAST_HOST}/api/${CF_ACTIVEGAME_ENDPOINT}`);
    if (response.ok) {
      const liveGames = await response.json();
      downloadCompleteCallback(liveGames);
    } else if (response.status == 403) { // for blocking scrapers
      console.error(`getLive(): 403 forbidden, stopping requests`);
      clearInterval(GET_LIVE_INTERVAL);
    }
  } catch (error) {
    console.error(`getLive(): no data`);
  }
}
