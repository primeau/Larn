'use strict';

let liveMetadata;
let liveFrameCache;



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
      liveMetadata = newFrame.metadata;
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
  setInterval(getLive, LIVE_LIST_REFRESH * 1000, downloadCompleteCallback);
}



function getLive(downloadCompleteCallback) {
  if (!navigator.onLine) {
    console.error(`getLive(): offline`);
    return;
  }
  fetch(`${CF_BROADCAST_PROTOCOL}${CF_BROADCAST_HOST}/api/gamelist/`)
    .then(function (response) {
      response.json().then(function (data) {
        let tmpList = [];
        data.keys.forEach(raw => {
          if (raw.metadata) {
            tmpList.push({
              gameID: raw.name,
              ularn: raw.metadata.ularn,
              hardlev: raw.metadata.difficulty,
              timeused: raw.metadata.mobuls,
              who: raw.metadata.who,
              level: raw.metadata.level,
              explored: raw.metadata.explored,
              createdAt: raw.metadata.lastmove, // use createdAt for sorting
            });
          }
        });
        downloadCompleteCallback(tmpList);
      });
    })
    .catch(error => console.log(`getLive(): no data`));
}
