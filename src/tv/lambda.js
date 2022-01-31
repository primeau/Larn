'use strict';

// TODO need more consistency, error logging

const LAMBDA = ENABLE_RECORDING_REALTIME ? `movie_test` : `movies`;

function uploadFile(filename, filecontents, lastFile, gameData) {
  let action = `write`;
  if (lastFile) {
    action = `writelast`;
  }
  console.log(`uploadFile(): ${filename}`);

  let paramPayload = {};
  paramPayload.action = action;
  paramPayload.gameID = gameID;
  paramPayload.filename = filename;
  paramPayload.file = filecontents;

  if (gameData) {
    paramPayload.gameData = gameData;
  }

  paramPayload = JSON.stringify(paramPayload);

  var params = {
    FunctionName: LAMBDA,
    Payload: paramPayload,
    InvocationType: 'RequestResponse',
    LogType: 'None'
  };

  lambda.invoke(params, function(error, data) {
    var response = data ? JSON.parse(data.Payload) : null;

    // TODO this is awful. need to make statuscode not 200 instead
    // TODO this is awful. need to make statuscode not 200 instead
    // TODO this is awful. need to make statuscode not 200 instead
    if (data.Payload.includes(`Error`)) error = data.Payload;

    if (!error) {
      //console.log(`uploadFile(): ${filename} ${data.StatusCode}`);
      if (data.StatusCode == 200) {
        //
      }
    } else {
      console.error(`uploadFile(): lambda error: ${error}`, response);
    }
  });
}



function downloadRoll(gameID, num, callback, frameupdate, successCallback, errorCallback) {

  let filename = `${num}.json`;
  console.log(`downloadRoll(): ${gameID}/${filename}`);

  var params = {
    FunctionName: LAMBDA,
    Payload: `{ "action" : "read", "gameID" : "${gameID}", "filename" : "${filename}"}`,
    InvocationType: 'RequestResponse',
    LogType: 'None' // 'Tail'
  };

  lambda.invoke(params, function(error, data) {
    var payload = data ? JSON.parse(data.Payload) : null;

    // TODO this is awful. need to make statuscode not 200 instead
    // TODO this is awful. need to make statuscode not 200 instead
    // TODO this is awful. need to make statuscode not 200 instead
    if (data.Payload.includes(`Error`)) error = data.Payload;

    if (!error) {
      if (data.StatusCode == 200) {

        if (!payload.File) {
          let err = `downloadRoll(): ${gameID}/${filename} empty file`;
          console.error(err);
          errorCallback(err);
          return;
        }

        let roll = decompressRoll(payload.File)

        // console.log(`downloadRoll(): ${JSON.stringify(roll)}`);
        // console.log(`downloadRoll(): got roll with ${roll.patches.length} frames`);

        if (num === 0) {
          let meta = JSON.parse(payload.Metadata);
          console.log(`downloadRoll(): metadata: ${JSON.stringify(meta)}`);
          if (meta.frames && frameupdate) {
            frameupdate(parseInt(meta.frames));
          }

          if (meta.who) {
            document.title = `LarnTV: ${meta.who} - ${meta.what} - diff ${meta.diff} - score ${meta.score}`;
          }
        }

        callback(roll); // this is calling fillBuffer()
        successCallback();
      }
    } else {
      console.error(`downloadRoll(): lambda error: ${error}`);
      errorCallback(error);
    }
  });
}



function loadRecordings(callback, frameLimit) {
  console.log(`loadRecordings()`);

  let action = `listcompleted`;

  var params = {
    FunctionName: LAMBDA,
    Payload: `{ "action" : "${action}", "frameLimit" : "${frameLimit}" }`,
    InvocationType: 'RequestResponse',
    LogType: 'None'
    // LogType: 'Tail'
  };

  lambda.invoke(params, function(error, data) {
    var payload = data ? JSON.parse(data.Payload) : null;
    if (!error) {
      if (data.StatusCode == 200) {
        console.log(`loadRecordings(): success`);
      }
      callback(payload.body);
    } else {
      console.error(`loadRecordings(): lambda error: ${error}`);
    }
  });
}