const aws = require('aws-sdk');
const s3tool = require('./s3tool');
const dbtool = require('./dbtool');
const handler = require('./eventhandler');

const s3 = new aws.S3();
const s3bucket = 'larn-movies';
const dynamo = new aws.DynamoDB.DocumentClient();

const MIN_FRAMES = 2500;


//
//
// MAIN EVENT HANDLER
//
//
exports.handler = async (event, context) => {
  if (!event.action) return;
  const action = event.action;
  const frameLimit = event.frameLimit || 0;

  console.log(`index(): received event: ${action}`);

  //
  // GET LIST OF COMPLETED GAMES
  //
  if (action === 'listcompleted') {
    let completedGames = handler.getGames(dynamo, true, frameLimit);
    let gamesInProgress = handler.getGames(dynamo, false);

    let gamesList = await Promise.all([completedGames, gamesInProgress]).then((games) => {
      console.log(`completed games ${games[0].body.length}`);
      console.log(`games in progress ${games[1].body.length}`);
      return games;
    });

    return {
      statusCode: (gamesList[0].statusCode + gamesList[1].statusCode) / 2, // LOL
      body: [gamesList[0].body, gamesList[1].body]
    }
  }

  const gameID = event.gameID;
  const fileroot = gameID ? gameID.charAt(0) + '/' + gameID + '/' : ``;
  const filename = fileroot + event.filename;

  // 
  // READ GAME FILES
  // 
  if (action === 'read') {
    console.log(`index(): ${gameID} reading ${filename}...`);
    let readResponse = await handler.downloadRoll(s3, s3bucket, gameID, filename);
    console.log(`index(): ${gameID} reading ${filename}... done`);
    console.log(`index(): ${gameID} returning ${filename}`);
    return readResponse;
  }

  //
  // WRITE GAME FILES
  // 
  if (action === 'write' || action === 'writelast') {

    let writeResponse = {
      statusCode: 200,
      info: `${gameID} ${action} ${filename}`,
      body: ``
    };

    // write .json roll file to S3
    console.log(`index(): ${gameID} uploading ${filename} to s3...`);
    let s3Response = await handler.uploadRoll(s3, s3bucket, gameID, filename, event.file);
    console.log(`index(): ${gameID} uploading ${filename} to s3... response`, s3Response);
    writeResponse.body += `uploadroll=${JSON.stringify(s3Response.statusCode)} : `;

    // update progress in dynamo
    if (event.progressData && action != 'writelast') {
      let progressData = JSON.parse(event.progressData);
      console.log(`index(): ${gameID} writing game progress to dynamo...`);
      let dynamoResponse = await dbtool.DBWrite(dynamo, `inprogress`, progressData, false);
      console.log(`index(): ${gameID} writing game progress to dynamo...`, dynamoResponse);
      writeResponse.body += `updateprogresstable=${dynamoResponse.statusCode} : `;
    }

    // write gameID.txt completed game info to S3
    // write completed game info to dynamo
    if (action === 'writelast') {
      event.file = JSON.parse(event.file);
      console.log(`index(): ${gameID} dynamo save criteria`, event.file.winner, event.file.frames, MIN_FRAMES);
      if (event.file.winner || event.file.frames >= MIN_FRAMES) {
        console.log(`index(): ${gameID} writing completed game info to dynamo...`);
        let dynamoResponse = await dbtool.DBWrite(dynamo, `completed`, event.file, true);
        console.log(`index(): ${gameID} writing completed game info to dynamo...`, dynamoResponse);
        writeResponse.body += `updatecompletedtable=${dynamoResponse.statusCode} : `;
      }
      else {
        console.log(`index(): ${gameID} not writing completed game info to dynamo: only ${event.file.frames} frames...`);
      }

      let meta = {
        frames: `${event.file.frames}`,
        who: event.file.who,
        what: event.file.what,
        diff: `${event.file.hardlev}`,
        score: `${event.file.score}`
      };
      console.log(`index(): ${gameID} metadata: ${JSON.stringify(meta)}`);
      console.log(`index(): ${gameID} writing metadata into 0.json...`);
      let s3Response = await s3tool.updateMetadata(s3, s3bucket, `${fileroot}0.json`, meta);
      console.log(`index(): ${gameID} writing metadata into 0.json...`, s3Response);
      writeResponse.body += `updatemetadata=${s3Response.statusCode} : `;

      console.log(`index(): ${gameID} deleting ${gameID} from inprogress table...`);
      dynamoResponse = await dbtool.DBDelete(dynamo, `inprogress`, gameID);
      console.log(`index(): ${gameID} deleting ${gameID} from inprogress table... Done`);
      writeResponse.body += `deleteinprogress=${dynamoResponse.statusCode} : `;

    }

    console.log(`${gameID} ${action}`, writeResponse);
    return writeResponse;
  }


  // if we got here, we didn't know what to do
  // TODO actually return an error
  console.error('movies(): invalid action', action);

};