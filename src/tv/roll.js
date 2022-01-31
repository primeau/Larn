'use strict';

const MAX_ROLL_LENGTH = TV_ENABLE_REALTIME ? 10 : 100;
if (TV_ENABLE_REALTIME) console.error("ROLL LENGTH", MAX_ROLL_LENGTH);

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



function compressRoll(roll) {
  let uncompressed = JSON.stringify(roll);
  // TODO: there's gotta be a way to use compressToUTF16
  // let compressed = LZString.compressToUTF16(uncompressed);
  let compressed = LZString.compressToEncodedURIComponent(uncompressed);
  //console.log(`compressRoll(): frame ${roll.patches[0].id} - ${roll.patches[roll.patches.length - 1].id}`);
  let ratio = Math.round(uncompressed.length / compressed.length * 100) / 100;
  //console.log(`compressRoll(): ${uncompressed.length}:${compressed.length} -> ${ratio}:1`);
  return compressed;
}



function decompressRoll(compressed) {
  // TODO: there's gotta be a way to use decompressFromUTF16
  let decompressed = LZString.decompressFromEncodedURIComponent(compressed);
  return createRoll(JSON.parse(decompressed));
}



function uploadRoll(roll, num, dataCallback) {
  let gameData;

  if (TV_ENABLE_REALTIME) {
  // datacallback gets a localscore object from the player so we can update 
  // the list of games in progress
  if (dataCallback) gameData = dataCallback();
    if (gameData) {
      gameData.frames = roll.patches[roll.patches.length - 1].id;
    } else {
      gameData = null;
      console.log(`uploadroll: gamedata=null`);
    }
  }

  let filename = `${num}.json`;
  let file = compressRoll(roll);
  uploadFile(filename, file, false, JSON.stringify(gameData));
}