// S3
import { S3Client } from "@aws-sdk/client-s3";

// DynamoDB
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const s3 = new S3Client({ region: "us-east-1" });
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));

import * as s3tool from './s3tool.mjs';
import * as dbtool from './dbtool.mjs';
import * as eventhandler from './eventhandler.mjs';

const MOVIES_BUCKET = 'larn-movies';

const MIN_FRAMES = 2500;



//
//
// MAIN EVENT HANDLER
//
//
export async function handler(event) {
  if (!event.action) return;
  const action = event.action;
  const frameLimit = event.frameLimit || 0;

  console.log(`index(): received event: ${action}`);

  //
  // GET LIST OF COMPLETED GAMES
  //
  if (action === 'listcompleted') {
    let recordedGamesList = eventhandler.getGames(dynamo, true, frameLimit);
    let liveGamesList = eventhandler.getGames(dynamo, false);

    let gamesList = await Promise.all([recordedGamesList, liveGamesList]).then((games) => {
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
    console.log(`index(): ${gameID}:${filename} reading file ...`);
    let readResponse = await eventhandler.downloadRoll(s3, MOVIES_BUCKET, gameID, filename);
    console.log(`index(): ${gameID}:${filename} reading file... done`);
    return readResponse;
  }


  // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
  // EXPERIMENTAL: READ MULTIPLE GAME FILES
  // 
  if (action === 'readmultiple') {

    console.log(`index(): ${gameID} reading multiple ${filename}...`);

    // let readResponse = await eventhandler.downloadRoll(s3, s3bucket, gameID, filename);
    let a = eventhandler.downloadRoll(s3, MOVIES_BUCKET, gameID, filename);
    let b = eventhandler.downloadRoll(s3, MOVIES_BUCKET, gameID, filename);
    let c = eventhandler.downloadRoll(s3, MOVIES_BUCKET, gameID, filename);
    let d = eventhandler.downloadRoll(s3, MOVIES_BUCKET, gameID, filename);

    console.log(`index(): ${gameID} reading multiple ${filename}... done`);
    console.log(`index(): ${gameID} returning multiple ${filename}`);
    // return readResponse;

    let gamesList = await Promise.all([a, b, c, d]).then((rolls) => {
      console.log(`downloaded rolls ${rolls[0].body.length}`);
      return rolls;
    });
  }
  // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 





  //
  // WRITE GAME FILES
  // 
  if (action === 'write' || action === 'writelast') {

    let dynamoResponse;
    let writeResponse = {
      statusCode: 200,
      info: `${gameID} ${action} ${filename}`,
      body: ``
    };

    // write .json roll file to S3
    console.log(`index(): ${filename} uploading to s3...`);
    console.log(`index(): ${filename} metadata`, event.Metadata);
    let s3Response = await eventhandler.uploadRoll(s3, MOVIES_BUCKET, gameID, filename, event.file, event.Metadata);
    console.log(`index(): ${filename} uploading to s3... response`, s3Response.statusCode);
    writeResponse.body += `uploadroll=${JSON.stringify(s3Response.statusCode)} : `;

    // update progress in dynamo
    if (event.progressData && action != 'writelast') {
      let progressData = JSON.parse(event.progressData);
      console.log(`index(): ${filename} writing game progress to dynamo...`);
      dynamoResponse = await dbtool.DBWrite(dynamo, `inprogress`, progressData, false);
      console.log(`index(): ${filename} writing game progress to dynamo... response`, dynamoResponse.statusCode);
      writeResponse.body += `updateprogresstable=${dynamoResponse.statusCode} : `;
    }

    // write completed game info to dynamo
    if (action === 'writelast') {
      event.file = JSON.parse(event.file);
      console.log(`index(): ${filename} dynamo save criteria`, event.file.winner, event.file.frames, MIN_FRAMES);
      if (event.file.winner || event.file.frames >= MIN_FRAMES) {
        console.log(`index(): ${filename} writing completed game info to dynamo...`);
        dynamoResponse = await dbtool.DBWrite(dynamo, `completed`, event.file, true);
        console.log(`index(): ${filename} writing completed game info to dynamo...`, dynamoResponse);
        writeResponse.body += `updatecompletedtable=${dynamoResponse.statusCode} : `;
      } else {
        console.log(`index(): ${filename} not writing completed game info to dynamo: only ${event.file.frames} frames...`);
      }
  
      // if the game was only one roll metadata was included in 0.json file when uploaded
      // if game was > 1 roll, replace 0.json metadata with info from gameid.txt
      // we have no idea which case it is when gameid.txt is uploaded so update metadata anyway
      let meta = {
        frames: `${event.file.frames}`,
        who: event.file.who,
        what: event.file.what,
        diff: `${event.file.hardlev}`,
        score: `${event.file.score}`
      };
      console.log(`index(): ${filename} metadata`, meta);
      console.log(`index(): ${filename} replacing metadata in 0.json...`);
      let s3Response = await s3tool.updateMetadata(s3, MOVIES_BUCKET, `${fileroot}0.json`, meta);
      console.log(`index(): ${filename} replacing metadata in 0.json...`, s3Response);
      writeResponse.body += `updatemetadata=${s3Response.statusCode} : `;

      console.log(`index(): ${filename} deleting from gameID inprogress table...`);
      dynamoResponse = await dbtool.DBDelete(dynamo, `inprogress`, gameID);
      console.log(`index(): ${filename} deleting gameID from inprogress table... Done`);
      writeResponse.body += `deleteinprogress=${dynamoResponse.statusCode} : `;

    }

    console.log(`index(): ${gameID} ${action}`, writeResponse);
    return writeResponse;
  }


  // if we got here, we didn't know what to do
  // TODO actually return an error
  console.error('movies(): invalid action', action);

};