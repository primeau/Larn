import { GetObjectCommand } from "@aws-sdk/client-s3";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import * as s3tool from './s3tool.mjs';



const HIGHSCORE_BUCKET = "larn-highscores";

//
//
// getGames
//
//
export async function getGames(dynamo, completed, frameLimit) {

  const params = {
    ReturnConsumedCapacity: 'TOTAL',
    TableName: completed ? 'completed' : 'inprogress'
  };

  if (!frameLimit) frameLimit = 0;

  console.log(`getGames(): getting ${params.TableName} games\n`);

  try {
    const data = await dynamo.send(new ScanCommand(params));
    console.log(`getGames(): got ${params.TableName} ${data.Items.length} items\n`);

    if (completed) {
      data.Items = data.Items.filter(tmp => Number(tmp.frames) >= Number(frameLimit));
    } else {
      data.Items = data.Items.filter(tmp => Number(tmp.updateTime) > Date.now() - 24 * 60 * 60 * 1000);
    }
    console.log(`getGames(): filter down to ${data.Items.length}`);

    return {
      statusCode: 200,
      body: data.Items
    };
  } catch (error) {
    console.error(`getGames(): `, error);
    return {
      statusCode: 400,
      error: `getGames(): can't find scoreboard: ${error.stack}`
    };
  }
}



export async function downloadRoll(s3, bucket, gameID, filename) {
  let s3Response;

  const params = {
    Bucket: bucket,
    Key: filename,
  };

  try {
    console.log(`handler.downloadRoll(): ${filename} downloading from ${bucket}...`);

    // first try to get the object from the main bucket
    try {
      s3Response = await s3.send(new GetObjectCommand(params));
    } catch (error) {
      // If the object is not found, try again in HIGHSCORE_BUCKET
      console.log(`handler.downloadRoll(): ${filename} not found in ${bucket}, trying ${HIGHSCORE_BUCKET}...`);
      params.Bucket = HIGHSCORE_BUCKET;
      s3Response = await s3.send(new GetObjectCommand(params));
    }

    console.log(`handler.downloadRoll(): ${filename} downloading from s3... done`);
    // const fileread = Buffer.from(s3Response.Body).toString("utf8"); //V2 VERSION
    const fileread = Buffer.from(await s3Response.Body.transformToByteArray()).toString("utf8"); // NEW: V3 VERSION NEEDS TRANSFORM

    console.log(`handler.downloadRoll(): ${filename} metadata:`, s3Response.Metadata);
    // return { "File": fileread, "Metadata": JSON.stringify(s3Response.Metadata) };
    return {
      statusCode: 200,
      File: fileread,
      Metadata: s3Response.Metadata
    };
  } catch (error) {
    if (error.Code === 'NoSuchKey') {
      console.error(`handler.downloadRoll(): ${filename} doesn't exist`);
    }
    else {
      console.error(`handler.downloadRoll(): ${filename} error downloading`, error);
    }
    const message = `handler.downloadRoll(): ${filename} error downloading -- the file probably doesn't exist`;
    return {
      statusCode: s3Response ? s3Response.statusCode : 500,
      error: message
    };

  }
}



export async function uploadRoll(s3, bucket, gameID, filename, fileContents, metadata) {
  console.log(`handler.uploadRoll(): ${filename} uploading to s3...`);
  const s3response = await s3tool.S3Write(s3, bucket, filename, fileContents, metadata);
  console.log(`handler.uploadRoll(): ${filename} uploading to s3... done`);
  return s3response;
}