'use strict';

let GAMENAME = `TV`;
let ULARN = false; // this is a hack to get around localstoragegetobject issues
let amiga_mode = false;

const TV_CHANNEL_LIST = `list`;
const TV_CHANNEL_RECORDED = `recorded`;
const TV_CHANNEL_LIVE = `live`;
let TV_CHANNEL;

let frameCompressionWorker;  /* web worker to compress live frames */

go();



async function go() {
  initRollbar();

  console.log(`build`, BUILD);
  console.log(`cloudflare`, CF_BROADCAST_HOST);

  const urlParams = loadURLParameters();
  window.addEventListener('resize', onResize);
  
  // WORKER STEP 0 - initialization
  if (window.Worker) {
    frameCompressionWorker = new Worker('../workers/compressionWorker.js');
    frameCompressionWorker.onmessage = frameCompressionCallback;
  }

  await loadFonts();

  if (urlParams.gameid) {
    TV_CHANNEL = TV_CHANNEL_RECORDED;
    watchRecorded(urlParams.gameid);
  } else if (urlParams.live) {
    TV_CHANNEL = TV_CHANNEL_LIVE;
    const logname = localStorageGetObject('logname', '-');
    initCloudFlare(`larntv:${logname}:${rund(1000000)}`, urlParams.live, bltLiveFrame);
    watchLive(urlParams.live);
  } else {
    TV_CHANNEL = TV_CHANNEL_LIST;
    initList();
    downloadRecordings(recordedGamesLoaded, MIN_FRAMES_TO_LIST);
    downloadliveGamesList(liveGamesLoaded);
  }

  onResize();
}



function initRollbar() {
  try {
    let enableRollbar = !isLocal() && !isFile();
    if (Rollbar) Rollbar.configure({
      enabled: (enableRollbar),
      payload: {
        code_version: BUILD,
        client: {
          javascript: {
            code_version: BUILD,
          }
        }
      }
    });
  } catch (error) {
    console.log(`caught`, error);
  }
}



function setIP(ip) {
  // do nothing for larntv
}



function onResize() {
  
  setStyle(styleInfo);

  switch (TV_CHANNEL) {

    case TV_CHANNEL_LIST: {
      break;
    }

    case TV_CHANNEL_RECORDED: {
      if (video && video.currentFrameNum && video.currentFrameNum >= 0) {
        bltRecordedFrame(video.getCurrentFrame());
      } else {
        return;
      }
      break;
    }

    case TV_CHANNEL_LIVE: {
      if (liveFrameCache) {
        bltLiveFrame(liveFrameCache);
      }
      break;
    }

    default: {
      console.error(`unknown channel, have you tried adjusting the antenna?`);
    }
  }

}


let bltFrameCache = -1;
function bltFrame(frame) {
  if (!frame) return;

  if (frame.compressed) {
    decompressFrame(frame);
    // console.log(`bltFrame(): decompressed`, frame.id);
  }
  
  let larnDivs = frame.divs.LARN;
  let statsDivs = frame.divs.STATS.replace(/img\//g, `../img/`);

  if (frame.deflated) {
    larnDivs = inflate(larnDivs);
  }

  if (larnDivs === ``) frame.divs.LARN = EMPTY_LARN_FRAME;

  // TODO: if bltFrameCache is set to a value it prevents rewinding
  if (frame.id > bltFrameCache) {
  // if (frame.ts > bltFrameCache) {
    setDiv(`TV_LARN`, larnDivs);
    setDiv(`TV_STATS`, statsDivs);
    // bltFrameCache = frame.id;
    //bltFrameCache = frame.ts;

    // compressFrame(frame, true); // handled by frameCompressionJob
  } else {
    console.log(`bltFrame(): out of order frame`, frame.id, bltFrameCache);
    // console.log(`bltFrame(): out of order frame`, frame.ts, bltFrameCache);
    return;
  }

    // adjust background image locations for amiga mode
    document.querySelectorAll(`.image`).forEach((div) => {
    div.style.backgroundImage = div.style.backgroundImage.replace(/img\//, `../img/`);
  });
}



// shares most code with setMode(amiga, retro, original)
// todo: consolidate, probably with some sort of a "setFont()" option
function setStyle(styleIn) {

  styleInfo = styleIn;
  if (!styleIn) styleIn = { fontFamily: `Courier New` };
  if (!styleIn.fontFamily) styleIn.fontFamily = `Courier New`;

  // defaults for courier new
  let fontFamily = styleIn.fontFamily;
  let textColour = `lightgrey`;
  let letterSpacing = `normal`;
  let heightMultiple = 2;
  let fontSize = 10;

  let spriteWidth = computeSpriteWidth();

  // TODO this is a fudge factor to tune the line height
  let heightAdjust = computeHeightAdjust(spriteWidth);

  if (fontFamily.includes(`amiga`)) {
    fontSize = spriteWidth * 2;
  } else {
    fontSize = computeFontSize(fontFamily, spriteWidth, 0);
  }

  document.body.style.font = `${fontSize}px ${fontFamily}`;
  document.body.style.fontFamily = fontFamily;
  document.body.style.color = textColour;
  document.body.style.letterSpacing = letterSpacing;
  document.body.style.lineHeight = `${spriteWidth * heightMultiple + heightAdjust}px`;

  if (TV_CHANNEL_LIST) {
    let bar = document.getElementById('progressbar');
    if (bar) bar.style.font = `${fontSize}px Courier New`;
    let box = document.getElementById('realtime');
    if (box) box.style.font = `${fontSize}px Courier New`;
    if (box && box.label) box.label.style.font = `${fontSize}px Courier New`;
  }

}


function applyGameInfo(gameInfo) {
  if (gameInfo) {
    video.setTotalFrames(gameInfo.frames);
    document.title = `LarnTV: ${gameInfo.who} - ${gameInfo.what} - diff ${gameInfo.hardlev} - score ${gameInfo.score}`;
  } else {
    video.setTotalFrames(0);
    console.error(`setGameInfo(): no game info available`);
    // document.title = `LarnTV`;
  }
}



// copied & adapted from display.js
function computeSpriteWidth() {
  let browserWidth = window.innerWidth;
  let browserHeight = window.innerHeight;

  /* 
   "a) a magic potion of cure dianthroritis" -> 39 characters
   width: 80 for game area, 39 for side inventory
   height: 24 for game area, 6 for the playback buttons and scrollbar
  */
  let rawSpriteW = (browserWidth) / (80 + 39);
  let rawSpriteH = (browserHeight) / (24 + 6);

  let spriteWidth = Math.min(rawSpriteW, rawSpriteH / 2);
  // spriteWidth *= 10;
  // spriteWidth = Math.floor(spriteWidth);
  // spriteWidth /= 10;

  return Math.max(4, spriteWidth);
}



function isAmigaMode() {
  if (styleInfo && styleInfo.fontFamily) {
    return styleInfo.fontFamily.includes(`amiga`);
  } else {
    return false;
  }
}