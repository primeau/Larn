'use strict';



// send live frame and style metadata from larn to larntv
let lastLiveFrame;
let lastLiveDataTime = Date.now() / 1000;
async function processLiveFrame(divs) {
  if (!ENABLE_RECORDING_REALTIME) return;
  if (!navigator.onLine) return;
  if (!game_started) return;

  try {

    // don't send duplicate frames 
    if (lastLiveFrame && lastLiveFrame.LARN === divs.LARN && lastLiveFrame.STATS === divs.STATS) {
      // console.error(`processLiveFrame() dupe`);
      return;
    }

    // write game metadata to live game list on cloudflare
    let nowSeconds = Date.now() / 1000;
    let metadata = getGameData();
    if (GAMEOVER || nowSeconds - lastLiveDataTime > LIVE_METADATA_WAIT && player.MOVESMADE % LIVE_METADATA_MOVES === 0) {
      let someoneIsWatchingYou = await writeGameData(metadata, gameID);
      lastLiveDataTime = nowSeconds;

      // someone has started watching, open a websocket
      if (numWatchers === 0 && someoneIsWatchingYou > 0) {
        initCloudFlare(gameID, gameID, null);
      }
      // nobody's watching any more, shut down websocket
      if (numWatchers > 0 && someoneIsWatchingYou === 0) {
        closeCloudflare();
      }

      numWatchers = someoneIsWatchingYou;
    }

    // write current frame to cloudflare
    if (numWatchers > 0) {
      let newFrame = new Frame();
      newFrame.id = gameID;
      newFrame.ts = Date.now();
      newFrame.metadata = metadata;
      for (const [key, value] of Object.entries(divs)) {
        newFrame.divs[key] = value;
      }
      lastLiveFrame = divs;
      sendLiveFrame(newFrame, true);
    }
  } catch (error) {
    console.error(`processLiveFrame():`, error);
  }

}



// get live game and style metadata
function getGameData() {
  if (!player) return;

  let metadata = {};

  // game data
  metadata.gameID = gameID;
  metadata.ularn = ULARN;
  metadata.build = BUILD;
  metadata.difficulty = getDifficulty();
  metadata.mobuls = elapsedtime();
  metadata.who = logname;
  metadata.level = LEVELNAMES[level];
  metadata.lastmove = Date.now(); // this gets overwritten by the server because client clocks can be wrong
  metadata.framenum = video ? video.currentFrameNum : 0;
  metadata.gameover = game_started && GAMEOVER;
  let deadreason = player.reason === DIED_SAVED_GAME ? `saved game` : `dead`;
  metadata.explored = metadata.gameover ? (player.winner ? `winner` : deadreason) : getExploredLevels(true);

  // display data
  let larnElement = document.getElementById(`LARN`);
  metadata.fontFamily = getComputedStyle(larnElement).fontFamily;

  return metadata;
}
