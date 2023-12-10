'use strict';

function invokeLambda(requestPayload, successCallback, failCallback) {
  if (AWS.config.accessKeyId === `AWS_CONFIG_ACCESSKEYID`) {
    console.log(`AWS credentials not set`);
    return;
  }

  let params = {
    FunctionName: AWS_RECORD_FUNCTION,
    Payload: JSON.stringify(requestPayload),
    InvocationType: 'RequestResponse',
    LogType: 'None'
  };

  try {
    lambda.invoke(params, function (error, data) {
      if (!error) {
        if (data) {
          if (data.StatusCode == 200) {
            if (successCallback) {
              let responsePayload = JSON.parse(data.Payload);
              successCallback(responsePayload.body, responsePayload.File, responsePayload.Metadata);
            }
          } else {
            console.error(`invokeLambda(): error ${data.StatusCode}`);
            updateMessage(`couldn't load: ${data.StatusCode}`);
            if (failCallback) failCallback(data.StatusCode);
          }
        }
      } else {
        console.error(`invokeLambda(): error: ${error}`);
        updateMessage(`${error}`);
        if (failCallback) failCallback(error);
      }
    });
  } catch (error) {
    console.error(`invokeLambda():`, error);
  }

}



function downloadRecordings(recordingsLoadedCallback, limit) {
  // console.log(`downloadRecordings()`);
  let requestPayload = {
    action: `listcompleted`,
    frameLimit: limit
  };
  invokeLambda(requestPayload, recordingsLoadedCallback, lambdaFail);
}



function lambdaFail(err) {
  console.log(`lambdaFail(): `, err);
}



function loadStyles(gameID, successCallback) {
  console.log(`loadStyles()`);
  let requestPayload = {
    action: `loadstyle`,
    gameID: gameID
  };
  invokeLambda(requestPayload, successCallback, null);
}



function downloadFile(gameID, filename, successCallback, failCallback) {
  console.log(`downloadFile(): ${gameID}/${filename}`);
  let requestPayload = {
    action: `read`,
    gameID: gameID,
    filename: filename,
  };
  invokeLambda(requestPayload, successCallback, failCallback);
}


// function downloadFileMultiple(gameID, files, successCallback, failCallback) {
//   console.log(`downloadFile(): ${gameID}/${filename}`);
//   let requestPayload = {
//     action: `readmultiple`,
//     gameID: gameID,
//     filename: files,
//   };
//   invokeLambda(requestPayload, successCallback, failCallback);
// }



// Zfunction downloadRolls( ) {
//   let gamesList = await Promise.all([recordedGamesList, liveGamesList]).then((games) => {
//     console.log(`completed games ${games[0].body.length}`);
//     console.log(`games in progress ${games[1].body.length}`);
//     return games;
//   });
// }



function downloadRoll(video, successCallback, failCallback) {
  let numRolls = video.rolls.length;
  let filename = `${numRolls}.json`;
  // console.log(`downloadRoll(): ${gameID}/${filename}`);
  downloadFile(video.gameID, filename, rollSuccess, null);

  function rollSuccess(body, file, metadata) {
    if (!file) {
      console.error(`downloadRoll(): ${video.gameID}/${filename} empty file`);
      if (numRolls === 0) {
        updateMessage(`\nSorry, this game couldn't be loaded`);
      }
      if (failCallback) failCallback(video, filename);
      return;
    }

    let roll = decompressRoll(file);
    // console.log(`downloadRoll(): ${JSON.stringify(roll)}`);
    // console.log(`downloadRoll(): got roll with ${roll.patches.length} frames`);
    if (numRolls === 0) {
      console.log(`downloadRoll(): metadata`, metadata);
      if (metadata.diff) metadata.diff = parseInt(metadata.diff);
      if (metadata.score) metadata.score = parseInt(metadata.score);
      if (metadata.frames) metadata.frames = parseInt(metadata.frames);
      if (metadata.frames) {
        video.metadata = metadata;
        video.totalFrames = metadata.frames;
      }
      if (metadata.who) {
        document.title = `LarnTV: ${metadata.who} - ${metadata.what} - diff ${metadata.diff} - score ${metadata.score}`;
      }
    }
    video.addRollToBuffer(roll);
    if (successCallback) successCallback();
  }
}



function uploadFile(gameID, filename, filecontents, isLastFile) {
  if (!filecontents) {
    console.error(`uploadFile(): no file contents for ${gameID}/${JSON.stringify(filename)}`);
    return;
  }
  console.log(`uploadFile(): ${gameID}/${filename} (${filecontents.length})`);
  let requestPayload = {
    action: isLastFile ? `writelast` : `write`,
    gameID: gameID,
    filename: filename,
    file: filecontents
  };
  invokeLambda(requestPayload, null, null);
}