'use strict';

let video;
const EMPTY_LARN_FRAME = "                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                            SAVING GAME                                        \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n                                                                                \n";



// a collection of rolls of film
class Video {
  constructor(gameID) {
    this.frameBuffer = [];
    this.recording = ENABLE_RECORDING;
    this.gameID = gameID;
    this.currentFrameNum = -1;
    this.metadata; // set when game is completed
    this.totalFrames; // total number of frames when replaying
    this.rolls = [];
    this.divs = []; // divs to record
  }

  addRollToBuffer(roll) {
    if (!roll) {
      console.log(`addRollToBuffer(): no roll!`);
      return;
    }

    let firstPatch = roll.patches[0];
    let frameNum = firstPatch.id;

    let prevFrame = this.getFrame(frameNum - 1); // this requires previous rolls to be downloaded

    for (let i = 0; i < roll.patches.length; i++) {
      const patch = roll.patches[i];
      let newFrame = buildFrame(patch, prevFrame);

      if (!newFrame) {
        // console.log(`addRollToBuffer(): null newFrame`, patch);
        continue;
      }

      if (this.metadata && newFrame.id <= this.totalFrames || !this.metadata) {
        this.frameBuffer[newFrame.id] = newFrame;
        prevFrame = newFrame;
      } else {
        // sometimes a couple of extra frames can sneak in
        // but we don't want to show them
        console.log(`addRollToBuffer(): extra frame:`, prevFrame.id);
      }

      if (!this.metadata) this.totalFrames = newFrame.id;
    }

    this.addRoll(roll);
    if (this.rolls.length === 1) {
      play();
    }

    if (this.metadata && prevFrame.id >= this.metadata.frames) {
      console.log(`addRollToBuffer(): done loading`);
      updateMessage(``);
    } else {
      // keep downloading
      // console.log(`addRollToBuffer(): prevFrame != totalframes`, prevFrame.id, this.metadata.frames, this.totalFrames);
      downloadRoll(this, updateProgressBarCallback, waitForNextFile);
    }

  }



  getFrame(frameNum) {
    // console.log(`video.getFrame(): ${frameNum}`);

    // build initial frame
    if (frameNum < 0) {
      // console.log(`video.getFrame(): returning blank frame`);
      return this.createEmptyFrame();
    } else {
      // protection for occasional missing frame when returning from saved game
      if (!this.frameBuffer[frameNum]) {
        console.error(`video.getFrame(): missing frame: ${frameNum}`);
        this.frameBuffer[frameNum] = this.createEmptyFrame();
      }
      return this.frameBuffer[frameNum];
    }
  }



  createEmptyFrame() {
    let newFrame = new Frame();
    // populate the first frame with the names of the divs that were recorded
    this.divs.forEach(div => {
      newFrame.divs[div] = ``;
    });
    newFrame.id = video.currentFrameNum + 1;
    newFrame.ts = Date.now();
    return newFrame;
  }



  getCurrentRoll() {
    return this.rolls[this.rolls.length - 1];
  }



  addRoll(roll) {
    this.rolls.push(roll);
  }



  getNextFrame() {
    this.updateCurrentFrame(1);
    let frame = this.getFrame(this.currentFrameNum);
    return frame;
  }



  updateCurrentFrame(amount) {
    if (amount > 0) {
      this.currentFrameNum = Math.min(this.currentFrameNum + amount, this.frameBuffer.length - 1);
    } else {
      this.currentFrameNum = Math.max(this.currentFrameNum + amount, 0);
    }
    return this.currentFrameNum;
  }



  getCurrentFrame() {
    return this.getFrame(this.currentFrameNum);
  }



  getPreviousFrame() {
    this.updateCurrentFrame(-1);
    let frame = this.getFrame(this.currentFrameNum);
    return frame;
  }



  setTotalFrames(num) {
    this.totalFrames = num;
  }


} /// END VIDEO CLASS



function uploadRoll(roll, num, unusedcallback, metadata) {
  let filename = `${num}.json`;
  let uncompressed = JSON.stringify(roll);

  // WORKER STEP 1 - rollCompressionWorker
  if (rollCompressionWorker) {
    // console.log(`uploadroll:`, filename, uncompressed.length);
    rollCompressionWorker.postMessage([filename, uncompressed, `ENCODED_URI`, `roll`, metadata]);
  } else {
    // don't upload
  }
}



// WORKER STEP 3 - rollCompressionWorker
function rollCompressionCallback(event) {
  let filename = event.data[0];
  let file = event.data[1];
  let metadata = event.data[2];
  uploadFile(gameID, filename, file, false, metadata);
}



function canRecord() {
  if (!ENABLE_RECORDING) return false;
  if (!navigator.onLine) return false;
  if (!video) video = new Video(gameID);
  return video.recording;
}



// sometimes we can get patches with duplicate IDs which messes up replays
let LAST_RECORDED_FRAME_ID = -1;

function processRecordedFrame(frame) {
  if (!ENABLE_RECORDING) return false;
  if (!navigator.onLine) return false;

  try {
    if (!video) video = new Video(gameID);

    if (LAST_RECORDED_FRAME_ID === frame.id) {
      // console.error(`processRecordedFrame(): DUPE`);
      return;
    }
    LAST_RECORDED_FRAME_ID = frame.id;

    let prevFrame = video.getFrame(video.currentFrameNum);

    // WORKER STEP 1 - buildPatchWorker
    if (buildPatchWorker) {
      buildPatchWorker.postMessage([prevFrame, frame, `patch`]);


// regex
//       <div.*?img\/(.*?).png.*?>(.?)<\/div>
//       <div.*(class..).*>(.*?)<\/div>
//       img\/(.*?).png


      // console.log(frame.divs.LARN);

      // console.log(`1`);
      // // const reg = /Larn/gmi;
      // const reg = /img\/(.*?).png/gmi;
      // console.log(`2`);
      // const regextest = [...reg.exec(frame.divs.LARN)];
      // console.log(`3`);
      // console.log(`got: `, regextest.length);
      // console.log(`got: `, regextest[0]);
      // console.log(`got: `, regextest[1]);

      return;
    } else {
      // don't add a frame
    }
  } catch (error) {
    console.error(`processRecordedFrame():`, error);
  }

}



// WORKER STEP 3 - buildPatchWorker
function buildPatchCallback(event) {
  let newPatch = event.data[0];
  let newFrame = event.data[1];

  // don't record empty frames
  let empty = true;
  Object.values(newPatch.divs).forEach(div => {
    empty &= div == ``;
  });
  if (empty) {
    console.error(`buildPatchCallback(event): empty frame`);
    return;
  }
  let currentRoll = video.getCurrentRoll();
  if (!currentRoll) {
    // console.log(`buildPatchCallback(): creating first roll`);
    currentRoll = new Roll([]);
    video.addRoll(currentRoll);
  }
  // console.log(`buildPatchCallback(): adding frame to roll`);
  currentRoll.addPatch(newPatch);
  if (currentRoll.isFull()) {
    // console.log(`buildPatchCallback(): writing roll`);
    uploadRoll(currentRoll, video.rolls.length - 1);
    video.addRoll(new Roll([]));
  }
  video.currentFrameNum = newFrame.id;
  video.frameBuffer[video.currentFrameNum] = newFrame;
}



// this is called by larn
function endRecording(endData, isUlarn) {
  try {
    if (!canRecord()) return;

    let meta = {};
    let currentRoll = video.getCurrentRoll();

    // save games don't have endData
    if (endData) {
      // don't write a file with a '+' in it
      if (endData.gameID.slice(-1) === `+`) {
        endData.gameID = endData.gameID.slice(0, -1);
      }

      // console.log(`endRecording(): currentRoll.patches.length`, currentRoll.patches.length);

      try {
        endData.frames = currentRoll.patches[currentRoll.patches.length - 1].id;
      } catch (error) {
        console.error(`endRecording(): currentRoll problem`, error);
        endData.frames = 0;        
      }
      endData.ularn = isUlarn;

      // special case for gameover with first roll:
      // we update metadata later in this function
      // but roll[0] sometimes wasn't uploaded yet
      if (video.rolls.length - 1 === 0) {
        meta = {
          frames: `${endData.frames}`,
          who: endData.who,
          what: endData.what,
          diff: `${endData.hardlev}`,
          score: `${endData.score}`
        };
      }
      
      console.log(`endRecording(): enddata: `, endData);
      console.log(`endRecording(): frames = ${endData.frames}`);
      uploadFile(gameID, `${gameID}.txt`, JSON.stringify(endData), true);
    }
    
    uploadRoll(currentRoll, video.rolls.length - 1, video.progressCallback /*unused?*/, meta);

  } catch (error) {
    console.error(`endRecording(): caught: `, error);
  }
}



// this is called by larn
function getRecordingInfo() {

  if (!canRecord()) return;

  let recordingInfo = {
    'frames': video.currentFrameNum || 0,
    'rolls': video.rolls.length || 0,
  };
  // console.log(`getRecordingInfo(): ${JSON.stringify((recordingInfo))}`);
  return recordingInfo;
}



// this is called by larn for reloading from savegames
function setRecordingInfo(info) {

  if (!canRecord()) return;
  if (!info) return;

  video = new Video(video.gameID);
  console.log(`setRecordingInfo(): info: ${JSON.stringify(info)}`);
  video.currentFrameNum = parseInt(info.frames);

  // console.log(`setRecordingInfo(): creating frame ${video.currentFrameNum}`)

  video.frameBuffer[video.currentFrameNum] = video.createEmptyFrame();

  for (let index = 0; index < parseInt(info.rolls); index++) {
    // console.log(`setRecordingInfo(): addroll: ${index}`);
    video.addRoll(new Roll([]));
  }
  video.addRoll(new Roll([]));
}


// game style metadata for recorded games on larntv
function getStyleData() {
  try {
    let larnStyle = {};
    let larnElement = document.getElementById(`LARN`);
    larnStyle.fontFamily = getComputedStyle(larnElement).fontFamily;
    return larnStyle;
  } catch (error) {
    console.error(`failed to compute style`, error);
  }
}



// send style metadata to larntv for recorded games
function uploadStyle(style) {
  if (!canRecord()) return false;
  try {
    // console.log(`uploadStyle(): style: `, style);
    uploadFile(gameID, `${gameID}.css`, JSON.stringify(style));
    return true;
  } catch (error) {
    console.error(`failed to upload style`, error)
    return false;
  }
}
