'use strict';

let video;
const EMPTY_LARN_FRAME = "                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                            SAVING GAME                                        \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n";

// a collection of rolls of film
class Video {
  constructor(gameID) {
    this.frameBuffer = [];
    this.recording = true;
    this.gameID = gameID;
    this.currentFrameNum = -1;
    this.totalFrames; // total number of frames when replaying
    this.rolls = [];
    this.divs = []; // divs to record
    this.lastFrameLoaded;
    this.dataCallback; // use this to upload LocalScore info for games in progress
  }


  //
  //
  //
  //
  //
  fillBuffer(roll) {
    let firstPatch = roll.patches[0];
    let frameNum = firstPatch.id;

    let prevFrame;
    prevFrame = this.getFrame(frameNum - 1);

    for (let i = 0; i < roll.patches.length; i++) {
      const patch = roll.patches[i];
      let newFrame = buildFrame(patch, prevFrame);
      this.frameBuffer[newFrame.id] = newFrame;
      prevFrame = newFrame;
      this.lastFrameLoaded = newFrame;
    }

    if (roll) {
      this.addRoll(roll);
    } else {
      console.log('no roll!');
    }

    if (!STARTED) {
      STARTED = true;
      play();
    }

    if (prevFrame.id != this.totalFrames) {
      downloadRoll(this.gameID, this.rolls.length, fillVideoBufferCallback, null, successCallback, errorCallback);

    } else {
      console.log(`done loading`);
    }

  }
  //
  //
  //
  //
  //
  //






  getFrame(frameNum) {
    // console.log(`video.getFrame(): ${frameNum}`);

    // build initial frame
    if (frameNum < 0) {
      // console.log(`video.getFrame(): returning blank frame`);
      let f = new Frame();
      // populate the first frame with the names of the divs that were recorded
      this.divs.forEach(div => {
        // console.log(`video.getFrame(): div: ${div}`);
        f.divs[div] = ``;
      });
      return f;
    } else {
      return this.frameBuffer[frameNum];
    }
  }



  getCurrentRoll() {
    return this.rolls[this.rolls.length - 1];
  }



  addFrame(newFrame) {
    let prevFrame = this.getFrame(this.currentFrameNum);

    // console.log(JSON.stringify(prevFrame))
    // console.log(JSON.stringify(newFrame))
    let newPatch = buildPatch(prevFrame, newFrame);

    // don't record empty frames
    let empty = true;
    Object.values(newPatch.divs).forEach(div => {
      empty &= div == ``;
    });
    if (empty) {
      // console.log(`video.addframe(): no change`);
      return;
    }

    let currentRoll = this.getCurrentRoll();
    if (!currentRoll) {
      // console.log(`video.addframe(): creating first roll`);
      currentRoll = new Roll([]);
      this.addRoll(currentRoll);
    }
    // console.log(`video.addframe(): adding frame to roll`);
    currentRoll.addPatch(newPatch);
    if (currentRoll.isFull()) {
      // console.log(`video.addframe(): writing roll`);
      uploadRoll(currentRoll, this.rolls.length - 1, this.dataCallback);
      this.addRoll(new Roll([]));
    }

    this.currentFrameNum = newFrame.id;
    this.frameBuffer[this.currentFrameNum] = newFrame;
  }



  addRoll(roll) {
    this.rolls.push(roll);
  }



  getNextFrame() {
    this.currentFrameNum++;
    let frame = this.getFrame(this.currentFrameNum);
    return frame;
  }



  getPreviousFrame() {
    this.currentFrameNum = Math.max(0, this.currentFrameNum - 1);
    let frame = this.getFrame(this.currentFrameNum);
    return frame;
  }



  setTotalFrames(num) {
    this.totalFrames = num;
  }


} /// END VIDEO CLASS



function fillVideoBufferCallback(param) {
  video.fillBuffer(param);
}

function setTotalVideoFramesCallback(param) {
  video.setTotalFrames(param);
}

function successCallback() {
  updateProgressBar(video.currentFrameNum, video.lastFrameLoaded.id, video.totalFrames);
}

function errorCallback() {

}



// this is called by larn if it can't record (offline/amiga_mode)
function stopRecording() {
  if (!video) video = new Video(gameID);
  video.recording = false;
}

function isRecording() {
  if (!video) video = new Video(gameID);
  return video.recording;
}


// this is called by larn
function recordFrame(divs, dataCallback) {

  if (!isRecording()) return;

  if (!video) video = new Video(gameID);

  if (!navigator.onLine) {
    // console.error(`offline`);
    return;
  }

  if (!video.dataCallback) {
    video.dataCallback = dataCallback;
  }

  let newFrame = new Frame();
  newFrame.id = video.currentFrameNum + 1;
  newFrame.ts = Date.now();

  // console.log(`recordFrame(): recording frame: ${newFrame.id}`);

  for (const [key, value] of Object.entries(divs)) {
    // console.log(`recordFrame(): k: ${key}`);
    // console.log(`recordFrame(): v: ${value}`);
    video.divs[key] = ``; // to keep track of the div names that are being recorded
    newFrame.divs[key] = value;
  }

  video.addFrame(newFrame);
}



// this is called by larn
function endRecording(endData, isUlarn) {

  if (!isRecording()) return;

  if (!navigator.onLine) {
    // console.error(`offline`);
    return;
  }

  let currentRoll = video.getCurrentRoll();
  uploadRoll(currentRoll, video.rolls.length - 1, video.dataCallback);

  // don't write a file with a '+' in it
  if (endData.gameID.slice(-1) === `+`) {
    endData.gameID = endData.gameID.slice(0, -1);
  }
  endData.frames = currentRoll.patches[currentRoll.patches.length - 1].id;
  endData.ularn = isUlarn;

  console.log(`endRecording(): enddata: `, endData);

  console.log(`endRecording(): frames = ${endData.frames}`);
  uploadFile(`${gameID}.txt`, JSON.stringify(endData), true);
}



// this is called by larn
function getRecordingInfo() {

  if (!isRecording()) return;

  var recordingInfo = {
    'frames': video.currentFrameNum,
    'rolls': video.rolls.length,
  };
  // console.log(`getRecordingInfo(): ${JSON.stringify((recordingInfo))}`);
  return recordingInfo;
}



// this is called by larn for reloading from savegames
function setRecordingInfo(info) {

  if (!isRecording()) return;
  if (!info) return;

  video = new Video(video.gameID);
  console.log(`setRecordingInfo(): info: ${JSON.stringify(info)}`);
  video.currentFrameNum = parseInt(info.frames);

  // console.log(`setRecordingInfo(): creating frame ${video.currentFrameNum}`)

  // TODO probably need to initialize divs
  video.frameBuffer[video.currentFrameNum] = new Frame();

  for (let index = 0; index < parseInt(info.rolls); index++) {
    // console.log(`setRecordingInfo(): addroll: ${index}`);
    video.addRoll(new Roll([]));
  }
  video.addRoll(new Roll([]));
}