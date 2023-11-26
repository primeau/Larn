'use strict';

let lambda;

let GAMENAME = `TV`;
let BUILD = `TV_1`;
let ULARN = false; // this is a hack to get around localstoragegetobject issues

go();

function go() {
  try {
    if (Rollbar) Rollbar.configure({
      enabled: (location.hostname !== 'localhost' && location.hostname !== ''),
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

  try {
    initLambdaCredentials();
    lambda = new AWS.Lambda({
      region: 'us-east-1',
      apiVersion: '2015-03-31'
    });
  } catch (error) {
    console.error(`go(): not loading aws credentials: ${error}`);
  }

  const urlParams = loadURLParameters();
  window.addEventListener('resize', onResize);
  onResize();

  if (urlParams.gameid) {
    watchMovie(urlParams.gameid);
  } else if (urlParams.live) {
    try {
      initCloudFlare(`larntv:${rund(1000000)}`, urlParams.live, bltLiveFrame);
      watchLive(urlParams.live);
    } catch (error) {
      console.error(error);
    }
  } else {
    initList();
    downloadRecordings(recordedGamesLoaded, MIN_FRAMES_TO_LIST);
    downloadliveGamesList(liveGamesLoaded);
  }
}



function setIP(ip) {
  // do nothing for larntv
}



// copied & adapted from display.js
function onResize() {
  const testfont = `12px modern`;
  const testtext = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
  const isBoldWider = getTextWidth(testtext, testfont, true) != getTextWidth(testtext, testfont, false);

  let canApplyStyle = style && !isBoldWider;

  let widthMultiple = 1.66;
  let fontFamily = `Courier New`;
  let spriteWidth = computeSpriteWidth();
  if (canApplyStyle) {
    widthMultiple = style.widthMultiple;
    fontFamily = style.fontFamily;
    document.body.style.letterSpacing = style.letterSpacing;
  }
  let fontSize = spriteWidth * widthMultiple;
  let font = `${fontSize}px ${fontFamily}`;
  document.body.style.font = font;

  // do this last for some reason
  if (canApplyStyle) document.body.style.lineHeight = `${spriteWidth * style.heightMultiple}px`;
}



// copied & adapted from display.js
function computeSpriteWidth() {
  let browserWidth = window.innerWidth;
  let browserHeight = window.innerHeight;

  let rawSpriteW = (browserWidth - 1) / (80 + 39);
  let rawSpriteH = (browserHeight - 100) / 24;

  let spriteWidth = Math.min(rawSpriteW, rawSpriteH / 2);
  spriteWidth *= 10;
  spriteWidth = Math.floor(spriteWidth);
  spriteWidth /= 10;
  spriteWidth = Math.max(3, spriteWidth);

  return spriteWidth;
}