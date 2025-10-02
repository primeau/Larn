'use strict';

// a collection of patches
class Roll {
  constructor(patches) {
    this.patches = patches;
  }

  addPatch(patch) {
    this.patches.push(patch);
  }

  isFull() {
    return this.patches.length >= MAX_ROLL_LENGTH;
  }
}



function createRoll(roll) {
  return new Roll(roll.patches);
}



function decompressRoll(compressed) {
  if (!compressed) return null;
  // TODO: there's gotta be a way to use decompressFromUTF16
  let decompressed = LZString.decompressFromEncodedURIComponent(compressed);
  return createRoll(JSON.parse(decompressed));
}