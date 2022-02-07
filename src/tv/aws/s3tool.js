//
//
// S3WRITE
//
//
module.exports.S3Write = async (s3, bucket, filename, filecontents) => {
  const params = {
    Bucket: bucket,
    Key: filename,
    Body: Buffer.from(filecontents)
  };
  try {
    // console.log(`S3Write(): `, JSON.stringify(params));
    let response = await s3.putObject(params).promise();
    console.log('S3Write(): response', response);
    return {
      statusCode: 200,
      body: response
    };
  } catch (err) {
    console.error(`S3Write():`, err);
    const message = `S3Write(): Error putting object ${filename} into bucket ${bucket}`;
    console.error(message);
    return {
      statusCode: 500,
      body: message
    };
    // throw new Error(message);
  }
}



//
//
// UPDATEMETADATA
//
//
module.exports.updateMetadata = async (s3, bucket, filename, metadata) => {
  const params = {
    Bucket: bucket,
    Key: filename,
    CopySource: `/${bucket}/${filename}`,
    ContentType: `application/octet-stream`,
    MetadataDirective: 'REPLACE',
    Metadata: metadata
  };

  try {
    console.log(`updateMetaData(): params: `, params);
    let response = await s3.copyObject(params).promise();
    console.log(`updateMetaData(): response: `, response);
    return {
      statusCode: 200,
      body: response
    };
  } catch (err) {
    console.error(`updateMetaData():`, err);
    const message = `updateMetaData(): Error updating metadata on ${filename} into bucket ${bucket}`;
    console.error(message);
    return {
      statusCode: 500,
      body: message
    };
  }
}