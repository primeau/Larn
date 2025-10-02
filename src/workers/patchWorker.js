'use strict';

importScripts('../lib/diff_match_patch.js');
try { importScripts('../tv/common/patch.js'); } catch (error) { } // prod location
try { importScripts('../common/patch.js'); } catch (error) { } // local testing

// WORKER STEP 2 - build patch
onmessage = function (event) {
  let prevFrame = event.data[0];
  let newFrame = event.data[1];
  let source = event.data[2] || `none`;
  let newPatch = buildPatch(prevFrame, newFrame);
  // console.log(`${source}:${newFrame.id} worker.buildpatch`);

    // memory management
    event.data[0] = null;
    event.data[1] = null;
    event.data[2] = null;
    event.data.length = 0;

  postMessage([newPatch, newFrame]);
};