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
        if (typeof data.keys === `object`) data = data.keys; // temp backwards compatibility
        data.forEach(game => {
          if (game.metadata) game = game.metadata; // temp backwards compatibility
          tmpList.push({
            gameID: game.gameID,
            ularn: game.ularn,
            hardlev: game.difficulty,
            timeused: game.mobuls,
            who: game.who,
            level: game.level,
            explored: game.explored,
            createdAt: game.lastmove, // use createdAt for sorting
          });
        });
        downloadCompleteCallback(tmpList);
      });
    })
    .catch(error => console.log(`getLive(): no data`));
}
