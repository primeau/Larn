'use strict';

function invokeLambda(requestPayload) {
  if (AWS.config.accessKeyId === `AWS_CONFIG_ACCESSKEYID`) {
    console.log(`AWS credentials not set`);
    return;
  }

  if (!navigator.onLine) {
    console.log(`invokeLambda(): offline, cannot invoke lambda`);
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
            // do nothing now
          } else {
            console.error(`invokeLambda(): error ${data.StatusCode}`);
            updateMessage(`couldn't load: ${data.StatusCode}`);
          }
        }
      } else {
        console.error(`invokeLambda(): error: ${error}`);
        updateMessage(`${error}`);
      }
    });
  } catch (error) {
    console.error(`invokeLambda():`, error);
  }

}




async function invokeLambdaAsync(payload) {
  if (AWS.config.accessKeyId === `AWS_CONFIG_ACCESSKEYID`) {
    console.log(`AWS credentials not set`);
    return null;
  }

  if (!navigator.onLine) {
    console.log(`invokeLambdaAsync(): offline, cannot invoke lambda`);
    return null;
  }

  const params = {
    FunctionName: AWS_RECORD_FUNCTION,
    Payload: JSON.stringify(payload),
    InvocationType: 'RequestResponse',
    LogType: 'None'
  };

  try {
    const response = await lambda.invoke(params).promise();

    let payload = {};
    if (response.StatusCode === 200 && response.Payload) {
      try {
        payload = JSON.parse(response.Payload);
      } catch (parseError) {
        payload = { rawPayload: response.Payload };
      }
      if (payload.statusCode === 200) {
        return payload;
      } else {
        console.error(`invokeLambdaAsync(): payload error: ${payload.statusCode}`);
        return null;
      }
    } else {
      console.error(`invokeLambdaAsync(): response error: ${response.StatusCode}`);
      return null;
    }
  } catch (error) {
    console.error(`invokeLambdaAsync():`, error);
  }
}



async function downloadFileAsync(gameID, filename) {
  console.log(`downloadFileAsync(): ${gameID}/${filename}`);
  let requestPayload = {
    action: `read`,
    gameID: gameID,
    filename: filename,
  };
  const response = await invokeLambdaAsync(requestPayload);
  if (!response) {
    console.error(`downloadFileAsync(): ${gameID}/${filename} empty file`);
  }
  return response;
}



async function downloadRoll(gameID, rollNum) {
  let filename = `${rollNum}.json`;
  // console.log(`downloadRoll(): ${gameID}/${filename}`);
  let data = await downloadFileAsync(gameID, filename);
  if (data && data.File) {
    let roll = decompressRoll(data.File);
    roll.metadata = data.Metadata;
    return roll;
  } else {
    console.error(`downloadRoll(): ${gameID}/${filename} empty file`);
    return null;
  }
}


async function downloadStyleInfo(gameID) {
  let filename = `${gameID}.css`;
  let data = await downloadFileAsync(gameID, filename);
  if (data && data.File) {
    const styleInfo = JSON.parse(data.File);
    return styleInfo;
  } else {
    console.error(`downloadStyleInfo(): ${gameID}/${filename} empty file`);
    return null;
  }
}



function uploadFile(gameID, filename, filecontents, isLastFile, metadata) {
  if (!filecontents) {
    console.error(`uploadFile(): no file contents for ${gameID}/${JSON.stringify(filename)}`);
    return;
  }
  console.log(`uploadFile(): ${gameID}/${filename} (${filecontents.length})`);
  let requestPayload = {
    action: isLastFile ? `writelast` : `write`,
    gameID: gameID,
    filename: filename,
    file: filecontents,
    Metadata: metadata
  };
  invokeLambda(requestPayload);
}