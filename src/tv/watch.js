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
let compressionInterval; // for periodic frame compression

let styleInfo;
let gameInfo;



async function watchRecorded(gameID) {
  // hehehe
  if (gameID.split(`+`)[0] === 'dQw4w9WgXcQ') {
    window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    return;
  }

  video = new Video(gameID);
  video.divs.push(`LARN`);
  video.divs.push(`STATS`);

  // load useful css style settings
  styleInfo = await downloadStyleInfo(gameID);
  setStyle(styleInfo);

  gameInfo = await downloadGameInfo(gameID);
  applyGameInfo(gameInfo);
  
  initPlayer();
  bltFrame(video.createInfoFrame(`Loading...`));

  let roll = null;
  let rollNum = 0;
  do {
    roll = await downloadRoll(gameID, rollNum++);
    video.addRollToFrameBuffer(roll);
    if (rollNum === 1) {
      if (roll) {
        play();
        // memory management - start periodic frame compression
        startFrameCompressionJob(5000);
      } else {
        bltFrame(video.createInfoFrame(`Sorry, this game couldn't be loaded`));
      }
    }
  }
  while (roll != null);
  
}



async function downloadStyleInfo(gameID) {
  const file = await downloadFile(gameID, `${gameID}.css`);
  if (file?.status === 200) {
    const styleInfo = JSON.parse(file.data);
    return styleInfo;
  } else {
    return null;
  }
}



async function downloadGameInfo(gameID) {
  const file = await downloadFile(gameID, `${gameID}.txt`);
  if (file?.status === 200) {
    const gameInfo = JSON.parse(file.data);
    return gameInfo;
  } else {
    return null;
  }
}



async function downloadRoll(gameID, rollNum) {
  const file = await downloadFile(gameID, `${rollNum}.json`);
  if (file?.status === 200) {
    const roll = decompressRoll(file.data);
    roll.metadata = file.metadata;
    return roll;
  } else {
    return null;
  }
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



function updateProgressBarCallback() {
  updateMessage(``);
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



async function onClickProgressBar(event) {
  let box = event.target.getBoundingClientRect();
  let width = box.width;
  let clickX = event.clientX - box.left;
  let percent = clickX / width;
  let newFrameNum = Math.floor(video.totalFrames * percent);
  if (newFrameNum >= 0 && newFrameNum < video.frameBuffer.length - 1) {

    // ffwd a long way in amiga mode can cause a memory error / crash
    // this limits memory growth to about 700MB which is huge but workable
    if (isAmigaMode() && newFrameNum > video.currentFrameNum) {
      newFrameNum = Math.min(video.currentFrameNum + 1000, newFrameNum)
    }

    // ensure frames built up from patches if necessary
    // otherwise getFrame() can blow call stack
    bltFrame(video.createInfoFrame(`Seeking...`));
    // Give the browser time to render the "Seeking..." message
    await new Promise(resolve => setTimeout(resolve, 100));
    while (video.currentFrameNum < newFrameNum) {
      video.getNextFrame();
    }

    video.currentFrameNum = newFrameNum;
    // this feels a bit hacky but it works
    clearTimeout(clock);
    bltRecordedFrame(video.getFrame(newFrameNum));
    lastFrameTime = Date.now();
    next();
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



// function toggleFullscreen() {
//   if (!document.fullscreenElement) {
//     document.documentElement.requestFullscreen().catch((err) => {});
//   } else {
//     if (document.exitFullscreen) {
//       document.exitFullscreen();
//     }
//   }
// }