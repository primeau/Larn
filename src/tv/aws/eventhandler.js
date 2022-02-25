const s3tool = require('./s3tool');
const dbtool = require('./dbtool');

//
//
// getGames
//
//
module.exports.getGames = async (dynamo, completed, frameLimit) => {

  const params = {
    ReturnConsumedCapacity: 'TOTAL',
    TableName: completed ? 'completed' : 'inprogress'
  };

  if (!frameLimit) frameLimit = 0;

  console.log(`getGames(): getting ${params.TableName} games\n`);

  try {
    const data = await dynamo.scan(params).promise();
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



module.exports.downloadRoll = async (s3, bucket, gameID, filename) => {
  const params = {
    Bucket: bucket,
    Key: filename,
  };

  try {
    console.log(`downloadRoll(): ${gameID} downloading ${filename} from s3...`);
    const s3Response = await s3.getObject(params).promise();
    console.log(`downloadRoll(): ${gameID} downloading ${filename} from s3... done`);
    const fileread = Buffer.from(s3Response.Body).toString("utf8");

    console.log(`downloadRoll(): ${gameID} ${filename} got metadata:`, s3Response.Metadata);
    // return { "File": fileread, "Metadata": JSON.stringify(s3Response.Metadata) };
    return {
      statusCode: 200,
      File: fileread,
      Metadata: s3Response.Metadata
    };
  } catch (error) {
    console.error(`downloadRoll(): ${gameID} error`, error);
    const message = `downloadRoll(): ${gameID} error downloading ${filename} from bucket ${bucket} the file probably doesn't exist`;
    console.error(message);
    return {
      statusCode: 500,
      error: message
    };

  }
}



module.exports.uploadRoll = async (s3, bucket, gameID, filename, fileContents) => {
  console.log(`uploadRoll(): ${gameID} uploading ${filename} to s3...`);
  const s3response = await s3tool.S3Write(s3, bucket, filename, fileContents);
  console.log(`uploadRoll(): ${gameID} uploading ${filename} to s3... done`);
  return s3response;
}