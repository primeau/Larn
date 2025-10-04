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
    
    this.currentRoll = new Roll([]);
    this.currentRollNum = 0;

    this.divs = []; // divs to record
  }



  getFrame(frameNum) {
    // console.log(`video.getFrame(): ${frameNum}`);

    // build initial frame
    if (frameNum < 0) {
      // console.log(`video.getFrame(): returning blank frame`);
      return this.createEmptyFrame();
    } 
    
    const frame = this.frameBuffer[frameNum];
      
    // protection for occasional missing frame when returning from saved game
    if (!frame) {
      console.log(`video.getFrame(): missing frame: ${frameNum}`);
      return this.createEmptyFrame(frameNum);
    }

    // memory management - build frames as needed and leave them compressed
    if (frame.isPatch) {
      const prevFrame = this.getFrame(frameNum - 1);
      decompressFrame(prevFrame);
      const newFrame = buildFrame(frame /*actually a patch*/, prevFrame);
      // compressFrame(prevFrame, true); // this is handled by frameCompressionJob now
      destroyPatch(frame);
      if (newFrame) {
        this.frameBuffer[frameNum] = newFrame;
      }
    }

    return this.frameBuffer[frameNum];
  }



  createEmptyFrame(frameNum) {
    let newFrame = new Frame();
    // populate the first frame with the names of the divs that were recorded
    this.divs.forEach(div => {
      newFrame.divs[div] = ``;
    });
    newFrame.id = frameNum || video.currentFrameNum + 1;
    newFrame.ts = Date.now();
    return newFrame;
  }



  createInfoFrame(text) {
    let infoFrame = new Frame();
    const spaces = ' '.repeat(text.length / 2);
    infoFrame.divs = {
      LARN: EMPTY_LARN_FRAME.replace(`${spaces}SAVING GAME`, text),
      STATS: ``
    };
    return infoFrame;
  };



  getCurrentRoll() {
    return this.currentRoll;
  }



  addRoll(roll) {
    destroyRoll(this.currentRoll); // memory management
    this.currentRoll = null;
    this.currentRoll = roll;
    this.currentRollNum++;
  }



  addRollToFrameBuffer(roll) {
    if (!roll) {
      return;
    }

    const metadata = roll.metadata;

    if (metadata && metadata.diff) {
      console.log(`addRollToFrameBuffer(): metadata`, metadata);
      if (metadata.diff) metadata.diff = parseInt(metadata.diff);
      if (metadata.score) metadata.score = parseInt(metadata.score);
      if (metadata.frames) metadata.frames = parseInt(metadata.frames);
      if (metadata.frames) {
        this.metadata = metadata;
        this.totalFrames = metadata.frames;
      }
      if (metadata.who) {
        document.title = `LarnTV: ${metadata.who} - ${metadata.what} - diff ${metadata.diff} - score ${metadata.score}`;
      }
    }
    
    for (const patch of roll.patches) {
      patch.isPatch = true;
      this.frameBuffer[patch.id] = patch;
      if (!this.metadata) this.totalFrames = patch.id;
      // roll.patches[patch.id] = null; // memory management - too soon
    }

    // destroyRoll(roll); // memory management -- too soon
    // roll = null; // memory management -- too soon

    updateProgressBarCallback();
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


} 
// END VIDEO CLASS
// END VIDEO CLASS
// END VIDEO CLASS
// END VIDEO CLASS
// END VIDEO CLASS



function uploadRoll(roll, num, unusedcallback, metadata) {
  let filename = `${num}.json`;
  let uncompressed = JSON.stringify(roll);

  // WORKER STEP 1 - rollCompressionWorker
  if (rollCompressionWorker) {
    // console.log(`uploadroll:`, filename, uncompressed.length);
    rollCompressionWorker.postMessage([filename, uncompressed, `ENCODED_URI`, `roll`, metadata]);
    uncompressed = null; // memory management
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
  
  // memory management
  event.data[0] = null;
  event.data[1] = null;
  event.data[2] = null;
  event.data.length = 0;
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

  // memory management
  event.data[0] = null;
  event.data[1] = null;
  event.data.length = 0;

  // don't record empty frames
  let empty = true;
  Object.values(newPatch.divs).forEach(div => {
    empty &= div == ``;
  });
  if (empty) {
    console.error(`buildPatchCallback(event): empty frame`);
    return;
  }
  if (!video.getCurrentRoll()) {
    // shouldn't happen but just in case
    console.log(`buildPatchCallback(): creating first roll`);
    video.addRoll(new Roll([]));
  }
  // console.log(`buildPatchCallback(): adding frame to roll`);
  video.getCurrentRoll().addPatch(newPatch);
  if (video.getCurrentRoll().isFull()) {
    // console.log(`buildPatchCallback(): writing roll`);
    uploadRoll(video.getCurrentRoll(), video.currentRollNum);
    video.addRoll(new Roll([]));
  }
  video.currentFrameNum = newFrame.id;
  video.frameBuffer[video.currentFrameNum] = newFrame;

  if (video.currentFrameNum > 0) {
    video.frameBuffer[video.currentFrameNum - 1] = null; // memory management
  }
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

      try {
        const lastPatch = currentRoll.patches[currentRoll.patches.length - 1];
        endData.frames = lastPatch ? lastPatch.id : 0;
      } catch (error) {
        console.error(`endRecording(): currentRoll problem`, error);
        endData.frames = 0;        
      }
      endData.ularn = isUlarn;

      // special case for gameover with first roll:
      // we update metadata later in this function
      // but roll[0] sometimes wasn't uploaded yet
      if (video.currentRollNum === 0) {
        meta = {
          frames: `${endData.frames}`,
          who: endData.who,
          what: endData.what,
          diff: `${endData.hardlev}`,
          score: `${endData.score}`
        };
      }
      
      console.log(`endRecording(): enddata: `, endData);
      uploadFile(gameID, `${gameID}.txt`, JSON.stringify(endData), true);
    }
    
    uploadRoll(currentRoll, video.currentRollNum, null, meta);

  } catch (error) {
    console.error(`endRecording(): caught: `, error);
  }
}



// this is called by larn
function getRecordingInfo() {

  if (!canRecord()) return;

  let recordingInfo = {
    'frames': video.currentFrameNum || 0,
    'rolls': video.currentRollNum + 1 || 0,
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

  video.currentRollNum = parseInt(info.rolls);
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



// memory management



function startFrameCompressionJob(interval) {
  if (compressionInterval) {
    clearInterval(compressionInterval);
  }
  compressionInterval = setInterval(frameCompressionJob, interval);
}

// unused
function stopFrameCompressionJob() {
  if (compressionInterval) {
    clearInterval(compressionInterval);
    compressionInterval = null;
  }
}

function frameCompressionJob() {
  const currentFrame = video.currentFrameNum || 0;
  const bufferSize = video.frameBuffer.length;
  let compressedCount = 0;
  
  for (let frameIndex = 0; frameIndex < bufferSize; frameIndex++) {
    const frame = video.frameBuffer[frameIndex];
    
    // Skip if frame doesn't exist, is already compressed, or is a patch
    if (!frame || frame.compressed || frame.compressionStarted || frame.isPatch) {
      continue;
    }
    
    const distanceFromCurrent = Math.abs(frameIndex - currentFrame);
    if (distanceFromCurrent > 5) {
      compressFrame(frame, true /* async */);
      compressedCount++;
    }
  }
  
  if (compressedCount > 0) {
    console.log(`Compressed ${compressedCount}`);
  }
}



function compressFrame(frame, doasync) {
  if (!frame.compressed) {
    // console.log(`compressFrame():`, frame.id, doasync);
    frame.compressionStarted = true;
    if (doasync) {
      // WORKER STEP 1 - frameCompressionWorker
      frameCompressionWorker.postMessage([frame.id, JSON.stringify(frame.divs), `UTF16`]);
    } else {
      frame.divs = LZString.compressToUTF16(JSON.stringify(frame.divs));
      frame.compressed = true;
      frame.compressionStarted = false;
      video.frameBuffer[frame.id] = null;
      video.frameBuffer[frame.id] = frame;
    }
  }
}

// WORKER STEP 3 - frameCompressionWorker
function frameCompressionCallback(event) {
  try {
    let id = event.data[0];
    let frame = video.frameBuffer[id];
    if (frame) {
      frame.divs = null;
      frame.divs = event.data[1];
      frame.compressed = true;
      frame.compressionStarted = false;

    }
    else {
      console.error(`frameCompressionCallback(): no frame for id`, id);
    }
    
    // memory management
    event.data[0] = null;
    event.data[1] = null;
    event.data.length = 0;
  } catch (error) {
    console.error(`frameCompressionCallback()`, error);
  }
}

function decompressFrame(frame) {
  if (frame.compressed) {
    frame.divs = JSON.parse(LZString.decompressFromUTF16(frame.divs));
    // console.log(`decompressFrame():`, frame.id);
    frame.compressed = false;
  }
}

function destroyPatch(patch) {
  if (!patch) return;
  patch.id = null;
  patch.ts = null;
  if (patch.divs) {
    for (const key of Object.keys(patch.divs)) {
      patch.divs[key] = null;
    }
    patch.divs = null;
  }
}

function destroyRoll(roll) {
  if (!roll) return;
  roll.patches.forEach(patch => {
    destroyPatch(patch);
  });
  roll.patches = null;
}