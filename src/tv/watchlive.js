'use strict';


function watchLive() {
  initLivePlayer();

  let liveFrame = new Frame();
  liveFrame.divs.LARN = `Waiting for our Hero's next move...`;
  liveFrame.divs.STATS = ``;

  bltLive(liveFrame);
}



function initLivePlayer() {
  let body = document.getElementById('TV_FOOTER');
  if (!body) return;
  while (body.firstChild) {
    body.firstChild.remove();
  }
}



function bltLiveFrame(data) {
  try {
    if (data.message) {
      let newFrame = JSON.parse(data.message);
      bltLive(newFrame);
    }
  }
  catch (error) {
    console.error(`bltLiveFrame: `, error);
  }
}



function bltLive(frame) {
  if (frame.divs.LARN === ``) frame.divs.LARN = EMPTY_LARN_FRAME;
  setDiv(`TV_LARN`, frame.divs.LARN);
  setDiv(`TV_STATS`, frame.divs.STATS);
}



function downloadliveGamesList(downloadCompleteCallback) {
  if (!navigator.onLine) {
    console.error(`downloadliveGamesList(): offline`);
    return;
  }
  getLive(downloadCompleteCallback);
  setInterval(getLive, 10 * 1000, downloadCompleteCallback);
}



function getLive(downloadCompleteCallback) {
  if (!navigator.onLine) {
    console.error(`getLive(): offline`);
    return;
  }
  fetch(`https://${broadcastHostname}/api/gamelist/`)
    .then(function (response) {
      response.json().then(function (data) {
        let tmpList = [];
        data.keys.forEach(raw => {
          if (raw.metadata) {
            let game = {};
            game.gameID = raw.name;
            game.ularn = raw.metadata.ularn;
            game.hardlev = raw.metadata.difficulty;
            game.timeused = raw.metadata.mobuls;
            game.who = raw.metadata.who;
            game.level = raw.metadata.level;
            game.explored = raw.metadata.explored;
            game.createdAt = raw.metadata.lastmove; // use createdAt for sorting
            tmpList.push(game);
          }
        });
        downloadCompleteCallback(tmpList);
      });
    })
    .catch(error => console.log(`getLive(): no data`));
}
