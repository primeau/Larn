'use strict';

let SPEED = 160;
let SPEED_MULTIPLE = 1;
let SPEED_OPTIONS = [0.5, 1, 1.5, 2, 4, 8];
let SPEED_UP = true;
let MAX_WAIT = 2000;
let MIN_WAIT = 10;
let PLAY = false;

let clock;
let lastFrameTime = Date.now();

let recordedMetadata;



function watchRecorded(gameID) {
  initPlayer();

  video = new Video(gameID);
  video.divs.push(`LARN`);
  video.divs.push(`STATS`);

  let recordedFrame = new Frame();
  recordedFrame.divs.LARN = `Loading...`;
  recordedFrame.divs.STATS = ``;
  bltFrame(recordedFrame);

  // load useful css style settings
  downloadFile(gameID, `${gameID}.css`, setRecordedStyleCallback, null);

  // kick off the downloading of all video data
  downloadRoll(video, updateProgressBarCallback);
}



function initPlayer() {

  Mousetrap.bind('space', toggle);
  Mousetrap.bind('>', goFaster);
  Mousetrap.bind('<', goSlower);
  Mousetrap.bind(['.', 'right'], fastforward);
  Mousetrap.bind([',', 'left'], rewind);

  let progressBar = document.createElement('label');
  let progressBarMessage = document.createElement('label');
  progressBar.addEventListener('click', onClickProgressBar);
  progressBar.id = `progressbar`;
  progressBarMessage.id = `progressbarmessage`;
  progressBar.innerHTML = ``;
  progressBar.style.cursor = `pointer`;

  let realtimeCheckbox = document.createElement('input');
  realtimeCheckbox.setAttribute('type', 'checkbox');
  realtimeCheckbox.checked = true;
  realtimeCheckbox.id = `realtime`;
  realtimeCheckbox.name = `realtime`;
  let realtimeLabel = document.createElement('label');
  realtimeLabel.htmlFor = `realtime`;
  realtimeLabel.innerHTML = `Realtime `;
  realtimeCheckbox.label = realtimeLabel;

  let speedButton = document.createElement('button');
  speedButton.innerHTML = 'Speed: 1x';
  speedButton.id = `speedbutton`;
  speedButton.addEventListener('click', toggleSpeed);
  speedButton.style.width = '100px';

  let rewindButton = document.createElement('button');
  rewindButton.innerHTML = ' << ';
  rewindButton.id = `rewindbutton`;
  rewindButton.addEventListener('click', rewind);
  rewindButton.style.width = '50px';

  let toggleButton = document.createElement('button');
  toggleButton.innerHTML = ' || ';
  toggleButton.id = `togglebutton`;
  toggleButton.addEventListener('click', toggle);
  toggleButton.style.width = '50px';

  let fastforwardButton = document.createElement('button');
  fastforwardButton.innerHTML = ' >> ';
  fastforwardButton.id = `fastforwardbutton`;
  fastforwardButton.addEventListener('click', fastforward);
  fastforwardButton.style.width = '50px';

  let body = document.getElementById('TV_FOOTER');
  if (!body) return;
  while (body.firstChild) {
    body.firstChild.remove();
  }

  body.appendChild(document.createElement('p'));
  body.appendChild(progressBar);
  body.appendChild(progressBarMessage);
  body.appendChild(document.createElement('p'));

  body.appendChild(realtimeCheckbox);
  body.appendChild(realtimeLabel);
  body.appendChild(speedButton);
  body.appendChild(document.createTextNode(" "));
  body.appendChild(rewindButton);
  body.appendChild(toggleButton);
  body.appendChild(fastforwardButton);
}



// lambda callback
function setRecordedStyleCallback(payloadBody, styleIn, payloadMetadata) {
  if (styleIn) recordedMetadata = JSON.parse(styleIn);
}



function updateProgressBarCallback() {
  updateMessage(``);

  clearTimeout(waiter);
  countdown = newcountdown;
  numtries = 1;

  updateProgressBar(video.currentFrameNum, video.frameBuffer.length - 1, video.totalFrames);
}



function updateProgressBar(current, loaded, total) {
  // console.log(current, loaded, total);
  if (current < 0 || loaded < 0 || total < 0) return;

  let currentString = ``;
  let totalString = ``;

  currentString = ` `.repeat(totalString.length - currentString.length) + currentString;
  let totalBlocks = 67 - currentString.length - totalString.length;

  let framesPerChar = total / totalBlocks;

  let blocksDone = Math.ceil(current / framesPerChar);
  let blocksLoaded = Math.floor((loaded - current) / framesPerChar);
  let blocksRemaining = Math.max(0, totalBlocks - blocksDone - blocksLoaded);
  // console.log(blocksDone, blocksLoaded, blocksRemaining, (blocksDone+blocksLoaded+blocksRemaining));

  let progressBar = `▒`.repeat(blocksDone);
  let loadedBar = `:`.repeat(blocksLoaded);
  let remainingBar = `·`.repeat(blocksRemaining);

  let message = ``;
  if (loaded != total) {
    message = ` (loading)`;
  }

  document.getElementById('progressbar').innerHTML = `${progressBar}${loadedBar}${remainingBar}`;
  document.getElementById('progressbarmessage').innerHTML = `${message}`;
}



function onClickProgressBar(event) {
  let box = event.target.getBoundingClientRect();
  let width = box.width;
  let clickX = event.clientX - box.left;
  let percent = clickX / width;
  let newFrameNum = Math.floor(video.totalFrames * percent);
  if (newFrameNum >= 0 && newFrameNum < video.frameBuffer.length - 1) {
    video.currentFrameNum = newFrameNum;
    // this feels a bit hacky but it works
    clearTimeout(clock);
    bltRecordedFrame(video.getFrame(newFrameNum));
    lastFrameTime = Date.now();
    next();
  }
}



// also contains some experimental code for realtime viewing
let waiter;
let newcountdown = 0;
let numtries = 1;
let maxtries = 10;
let countdown = 0;
function waitForNextFile(video, filename) {
  if (countdown != 0) {
    // console.log(countdown, video.gameID, filename, video.currentFrameNum, video.totalFrames, numtries, maxtries);
    if (numtries <= maxtries) {
      waiter = setTimeout(waitForNextFile, 250, video, filename);
      if (video.currentFrameNum == video.totalFrames) {
        updateMessage(`\nwaiting for more moves ${'.'.repeat(countdown)}`);
      }
    } else {
      updateMessage(`\nno moves detected for a long time. giving up.`);
    }
    countdown--;
  } else {
    // wait for max 16 repetitons before trying again
    // countdown = Math.min(16, Math.pow(2, numtries));
    countdown = Math.min(10, numtries);
    numtries++;
    lastFrameTime = Date.now();
    downloadRoll(video, updateProgressBarCallback, waitForNextFile);
  }
}



function play() {
  // console.log(`play()`);
  if (PLAY) {
    // do nothing
  } else {
    PLAY = true;
    next();
  }
}



function pause() {
  // console.log(`pause()`);
  if (PLAY) {
    PLAY = false;
    clearTimeout(clock);
  } else {
    // do nothing
  }
}



function fastforward(event) {
  // console.log(`fastforward()`);
  if (event) event.preventDefault();
  if (PLAY) {
    goFaster();
  } else {
    video.updateCurrentFrame(SPEED_MULTIPLE - 1);
    lastFrameTime = Date.now();
    next();
  }
}



function rewind(event) {
  // console.log(`rewind()`);
  if (event) event.preventDefault();
  if (PLAY) {
    goSlower();
  } else {
    video.updateCurrentFrame(-1 * (SPEED_MULTIPLE - 1));
    lastFrameTime = 0;
    prev();
  }
}



function toggle(event) {
  // console.log(`toggle()`);
  if (event) event.preventDefault();
  if (PLAY) {
    document.getElementById('togglebutton').innerHTML = '  > ';
    pause();
  } else {
    document.getElementById('togglebutton').innerHTML = ' || ';
    play();
  }
}



function next(event) {
  // console.log(`next()`);
  if (event) event.preventDefault();

  if (video.totalFrames && video.currentFrameNum >= video.totalFrames) {
    console.log(`next(): at last frame ${video.currentFrameNum}`);
    pause();
    return;
  }

  let frame = video.getNextFrame();

  if (!frame) {
    console.log(`next(): video not loaded yet`);
    return;
  }

  let waitTime = SPEED;
  let realtime = document.getElementById('realtime').checked;
  if (realtime) {
    waitTime = Math.min(MAX_WAIT, frame.ts - lastFrameTime);
  }
  waitTime /= SPEED_MULTIPLE;
  waitTime = Math.max(MIN_WAIT, waitTime);
  // console.log(`waiting` ${waitTime}`);

  if (PLAY) {
    clock = setTimeout(next, waitTime);
    lastFrameTime = frame.ts;
  }

  bltRecordedFrame(frame);
}


function prev(event) {
  // console.log(`prev()`);
  if (event) event.preventDefault();

  let frame = video.getPreviousFrame();

  if (!frame) {
    console.log(`prev(): video not loaded yet`);
    return;
  }
  if (frame.id == 0) {
    console.log(`prev(): back to beginning ${video.currentFrameNum}`);
    pause();
    return;
  }

  lastFrameTime = frame.ts;

  bltRecordedFrame(frame);
}



function bltRecordedFrame(frame) {
  if (!frame) return;
  updateProgressBar(frame.id, video.frameBuffer.length - 1, video.totalFrames);
  bltFrame(frame);
  setStyle(recordedMetadata);
}



function goFaster() {
  let speedIndex = getSpeedIndex();
  if (speedIndex < SPEED_OPTIONS.length - 1) speedIndex++;
  setSpeed(SPEED_OPTIONS[speedIndex]);
}

function goSlower() {
  let speedIndex = getSpeedIndex();
  if (speedIndex > 0) speedIndex--;
  setSpeed(SPEED_OPTIONS[speedIndex]);
}

function toggleSpeed() {
  if (SPEED_UP) {
    goFaster();
  } else {
    goSlower();
  }
}

function getSpeedIndex() {
  return SPEED_OPTIONS.findIndex(element => element == SPEED_MULTIPLE);
}

function setSpeed(newSpeed) {
  SPEED_MULTIPLE = newSpeed;
  let speedIndex = getSpeedIndex();
  if (speedIndex == 0) SPEED_UP = true;
  if (speedIndex == SPEED_OPTIONS.length - 1) SPEED_UP = false;
  document.getElementById('speedbutton').innerHTML = `Speed: ${SPEED_MULTIPLE}`;
}



function setDiv(id, data) {
  let div = document.getElementById(id);
  if (div) {
    // optimization:
    // most of the time, we're just repainting the same data into each div.
    // therefore, only repaint when the data is different, or there
    // is a BOLD being applied where there wasn't one before
    //
    if (data === div.innerHTML) {
      return;
    }
    div.innerHTML = data;
  } else {
    console.log(`null document: ${id}`);
  }
}



// function toggleFullScreen() {
//   if (!document.fullscreenElement) {
//     document.documentElement.requestFullscreen();
//   } else {
//     if (document.exitFullscreen) {
//       document.exitFullscreen();
//     }
//   }
// }