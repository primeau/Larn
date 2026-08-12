'use strict';

try {
  importScripts('../lib/diff_match_patch.js');
  importScripts('../common/patch.js');
  console.log(`patchWorker.js: workers loaded`);
} catch (error) {
  console.error(`patchWorker.js: failed to load`, error);
}

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
