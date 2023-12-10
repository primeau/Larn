'use strict';



// send live frame and style metadata from larn to larntv
let lastLiveFrame;
let lastLiveFrameTime = Date.now() / 1000;
let lastLiveDataTime = Date.now() / 1000;
async function processLiveFrame(divs) {
  if (!ENABLE_RECORDING_REALTIME) return;
  if (!navigator.onLine) return;
  if (!game_started) return;

  try {
    // don't send duplicate frames 
    if (lastLiveFrame && lastLiveFrame.LARN === divs.LARN && lastLiveFrame.STATS === divs.STATS) {
      // console.error(`sendliveframe() dupe`);
      return;
    }
    let now = Date.now() / 1000;

    // write metadata to live game list on cloudflare
    // might not need this, but i want the option to send more frequently than frames 
    let metadata = getGameData();
    let someoneIsWatchingYou = 0;
    if (GAMEOVER || now - lastLiveDataTime > LIVE_METADATA_WAIT && player.MOVESMADE % LIVE_METADATA_MOVES === 0) {
      someoneIsWatchingYou = await writeGameData(metadata, gameID);
      lastLiveDataTime = now;

      if (numWatchers === 0 && someoneIsWatchingYou > 0) {
        initCloudFlare(gameID, gameID, null);
      }
      numWatchers = someoneIsWatchingYou;
    }

    // write current frame to cloudflare
    if (CF_LOCAL || // faster for local testing
      numWatchers > 0 || // someone is watching
      now - lastLiveFrameTime > LIVE_FRAME_WAIT && player.MOVESMADE % LIVE_FRAME_MOVES === 0) { // it's been >N seconds or M moves
      let newFrame = new Frame();
      newFrame.id = gameID;
      newFrame.ts = Date.now();
      newFrame.metadata = metadata;
      for (const [key, value] of Object.entries(divs)) {
        newFrame.divs[key] = value;
      }
      lastLiveFrame = divs;
      lastLiveFrameTime = now;
      sendLiveFrame(newFrame, true);
    }
  } catch (error) {
    console.error(`sendliveframe():`, error);
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
  metadata.lastmove = Date.now();
  let deadreason = player.reason === DIED_SAVED_GAME ? `saved game` : `dead`;
  metadata.explored = game_started && GAMEOVER ? (player.winner ? `winner` : deadreason) : getExploredLevels(EXPLORED_VIEW_DOTS);

  // display data
  let larnElement = document.getElementById(`LARN`);
  metadata.fontFamily = getComputedStyle(larnElement).fontFamily;

  return metadata;
}
