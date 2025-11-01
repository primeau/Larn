'use strict';

let lambda;

let GAMENAME = `TV`;
let ULARN = false; // this is a hack to get around localstoragegetobject issues

const TV_CHANNEL_LIST = `list`;
const TV_CHANNEL_RECORDED = `recorded`;
const TV_CHANNEL_LIVE = `live`;
let TV_CHANNEL;

let frameCompressionWorker;  /* web worker to compress live frames */

go();



async function go() {
  initRollbar();
  initAWS();
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



function initAWS() {
  try {
    initLambdaCredentials();
    lambda = new AWS.Lambda({
      region: 'us-east-1',
      apiVersion: '2015-03-31'
    });
  } catch (error) {
    console.error(`go(): not loading aws credentials: ${error}`);
  }
}



function setIP(ip) {
  // do nothing for larntv
}



function onResize() {

  switch (TV_CHANNEL) {

    case TV_CHANNEL_LIST: {
      let spriteWidth = computeSpriteWidth();
      let widthMultiple = 1.66;
      let fontSize = spriteWidth * widthMultiple;
      let fontFamily = `Courier New`;
      let font = `${fontSize}px ${fontFamily}`;
      document.body.style.font = font;
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

  if (frame.deflated) {
    larnDivs = inflate(larnDivs);
  }

  if (larnDivs === ``) frame.divs.LARN = EMPTY_LARN_FRAME;

  // TODO: if bltFrameCache is set to a value it prevents rewinding
  if (frame.id > bltFrameCache) {
  // if (frame.ts > bltFrameCache) {
    setDiv(`TV_LARN`, larnDivs);
    setDiv(`TV_STATS`, frame.divs.STATS);
    // bltFrameCache = frame.id;
    //bltFrameCache = frame.ts;

    // compressFrame(frame, true); // handled by frameCompressionJob
  } else {
    console.log(`bltFrame(): out of order frame`, frame.id, bltFrameCache);
    // console.log(`bltFrame(): out of order frame`, frame.ts, bltFrameCache);
    return;
  }

  // for amiga mode
  let sw = computeSpriteWidth();
  document.querySelectorAll(`.image`).forEach((div) => {
    // set new width and height
    div.style.width = `${sw}px`;
    div.style.height = `${sw * 2}px`;
    // adjust background image location
    div.style.backgroundImage = div.style.backgroundImage.replace(/img\//, `../img/`);
  }); // this takes ~0.003 seconds on an m1 mac...
}



// shares most code with setMode(amiga, retro, original)
// todo: consolidate, probable with some sort of a "setFont()" option
function setStyle(styleIn) {
  if (!styleIn) {
    // console.log(`setStyle(): no style data available`);
    styleIn = { fontFamily: `Courier New` };
    // return;
  }

  // defaults for courier new
  let fontFamily = `Courier New`;
  let textColour = `lightgrey`;
  let heightMultiple = 1.88;
  let letterSpacing = `normal`;
  let spacing = 0;
  let fontSize = 10;

  let spriteWidth = computeSpriteWidth();

  if (styleIn.fontFamily.includes(`amiga`)) {
    fontFamily = styleIn.fontFamily;
    textColour = `lightgrey`;
    heightMultiple = 2;
    letterSpacing = `normal`;
    spacing = 0;
    fontSize = spriteWidth * 2;
  }
  else {
    const testfont = `12px ${styleIn.fontFamily}`;
    const testtext = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
    const isBoldWider = getTextWidth(testtext, testfont, true) != getTextWidth(testtext, testfont, false);
    fontFamily = isBoldWider ? `Courier New` : styleIn.fontFamily;

    // console.log(testfont, isBoldWider, getTextWidth(testtext, testfont, true), getTextWidth(testtext, testfont, false));

    if (fontFamily === `modern`) {
      fontFamily = `modern`;
      textColour = `lightgrey`;
      heightMultiple = 1.88;
      letterSpacing = `normal`;
      spacing = 0;
    } else if (fontFamily === `dos437`) {
      fontFamily = `dos437`;
      textColour = `#ABABAB`;
      heightMultiple = 1.93;
      letterSpacing = '-1px';
      spacing = -1;
    }
    fontSize = computeFontSize(fontFamily, spriteWidth, spacing);
  }

  let font = `${fontSize}px ${fontFamily}`;
  document.body.style.font = font;
  document.body.style.fontFamily = fontFamily;
  document.body.style.color = textColour;
  document.body.style.letterSpacing = letterSpacing;

  if (TV_CHANNEL_LIST) {
    let bar = document.getElementById('progressbar');
    if (bar) bar.style.font = `${fontSize}px Courier New`;
    let box = document.getElementById('realtime');
    if (box) box.style.font = `${fontSize}px Courier New`;
    if (box && box.label) box.label.style.font = `${fontSize}px Courier New`;
  }
  // console.log(font, fontFamily, textColour, letterSpacing, heightMultiple);

  // do this last for some reason
  document.body.style.lineHeight = `${spriteWidth * heightMultiple}px`;
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
  spriteWidth *= 10;
  spriteWidth = Math.floor(spriteWidth);
  spriteWidth /= 10;

  return Math.max(4, spriteWidth);
}



function isAmigaMode() {
  if (recordedMetadata && recordedMetadata.fontFamily) {
    return recordedMetadata.fontFamily.includes(`amiga`);
  } else {
    return false;
  }
}