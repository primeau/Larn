'use strict';

const LAMBDA = ENABLE_RECORDING_LAMBDA_BETA ? `movie_test` : `movies`;



function invokeLambda(requestPayload, successCallback, failCallback) {
  let params = {
    FunctionName: LAMBDA,
    Payload: JSON.stringify(requestPayload),
    InvocationType: 'RequestResponse',
    LogType: 'None'
  };
  lambda.invoke(params, function(error, data) {
    if (!error) {
      if (data) {
        if (data.StatusCode == 200) {
          if (successCallback) {
            let responsePayload = JSON.parse(data.Payload);
            successCallback(responsePayload.body, responsePayload.File, responsePayload.Metadata);
          }
        } else {
          console.error(`invokeLambda(): error ${data.StatusCode}`);
          document.getElementById(`LARN_LIST`).innerHTML = `couldn't load: ${data.StatusCode}`;
        }
      }
    } else {
      console.error(`invokeLambda(): error: ${error}`);
      document.getElementById(`LARN_LIST`).innerHTML = `${error}`;
      if (failCallback) failCallback(error);
    }
  });
}



function downloadRecordings(recordingsLoadedCallback, limit) {
  console.log(`downloadRecordings()`);
  let requestPayload = {
    action: `listcompleted`,
    frameLimit: limit
  };
  invokeLambda(requestPayload, recordingsLoadedCallback, null);
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



function downloadRoll(video, successCallback) {
  let numRolls = video.rolls.length;
  let filename = `${numRolls}.json`;
  // console.log(`downloadRoll(): ${gameID}/${filename}`);
  downloadFile(video.gameID, filename, rollSuccess, null);

  function rollSuccess(body, file, metadata) {
    if (!file) {
      console.error(`downloadRoll(): ${video.gameID}/${filename} empty file`);
      let extra = (numRolls === 0) ? `` : `completely`
      document.getElementById(`LARN_LIST`).innerHTML = `\nSorry, this game couldn't be loaded ${extra}`;
      return;
    }

    let roll = decompressRoll(file)
    // console.log(`downloadRoll(): ${JSON.stringify(roll)}`);
    // console.log(`downloadRoll(): got roll with ${roll.patches.length} frames`);
    if (numRolls === 0) {
      console.log(`downloadRoll(): metadata`, metadata);
      if (metadata.frames) {
        video.totalFrames = Number(metadata.frames);
      }
      if (metadata.who) {
        document.title = `LarnTV: ${metadata.who} - ${metadata.what} - diff ${metadata.diff} - score ${metadata.score}`;
      }
    }
    video.addRollToBuffer(roll);
    if (successCallback) successCallback();
  }
}



function uploadFile(gameID, filename, filecontents, isLastFile, progressData) {
  console.log(`uploadFile(): ${gameID}/${filename}`);
  let requestPayload = {
    action: isLastFile ? `writelast` : `write`,
    gameID: gameID,
    filename: filename,
    file: filecontents
  };
  if (progressData) {
    requestPayload.progressData = progressData;
  }
  invokeLambda(requestPayload, null, null);
}