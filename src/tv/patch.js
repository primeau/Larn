'use strict';

const dmp = new diff_match_patch();



// the difference between framenum and framenum + 1
class Patch {
  constructor() {
    this.id;
    this.ts;
    // this.divs = new Map();
    this.divs = {};
  }
}



function buildFrame(patch, frame) {
  let newFrame = new Frame();

  // frame number
  newFrame.id = patch.id;

  // timestamp;
  newFrame.ts = patch.ts;

  let divs = Object.entries(patch.divs);
  // console.error(`buildFrame(): divs: ${patch.id} ${divs}`);

  for (const [key, value] of divs) {
    // console.log(`buildFrame(): k: ${key}`);
    // console.log(`buildFrame(): v: ${value}`);
    let patches = dmp.patch_fromText(value);
    // console.log(`buildFrame(): patch: ${dmp.patch_toText(patches)}`);
    let results = dmp.patch_apply(patches, frame.divs[key]);
    newFrame.divs[key] = results[0];
    // console.log(`buildFrame(): frame:\`${newFrame.divs[key]}\``);
  }

  return newFrame;
}


function buildPatch(prevFrame, currentFrame) {
  let newPatch = new Patch();

  // frame number
  newPatch.id = currentFrame.id;

  // timestamp;
  newPatch.ts = currentFrame.ts;

  let divs = Object.keys(currentFrame.divs);

  divs.forEach(div => {
    // console.log(`buildPatch(): div: ${JSON.stringify(div)}`);
    let diff = dmp.diff_main(prevFrame.divs[div] || ``, currentFrame.divs[div]);
    if (diff.length > 2) {
      dmp.diff_cleanupEfficiency(diff);
    }
    let patchList = dmp.patch_make(prevFrame.divs[div] || ``, diff);
    newPatch.divs[div] = dmp.patch_toText(patchList);

  });

  // console.log(`buildPatch(): patch: ${JSON.stringify(newPatch)}`);

  return newPatch;
}