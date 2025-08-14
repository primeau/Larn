import { PutObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";

//
//
// S3WRITE
//
//
export async function S3Write(s3, bucket, filename, filecontents, metadata) {

  const params = {
    Bucket: bucket,
    Key: filename,
    Body: Buffer.from(filecontents),
    Metadata: metadata || {},
  };
  try {
    // console.log(`S3Write(): `, JSON.stringify(params));
    let response = await s3.send(new PutObjectCommand(params));
    console.log(`S3Write(): ${filename} response`, response);
    return {
      statusCode: 200,
      body: response
    };
  } catch (err) {
    console.error(`S3Write():  ${filename} error`, err);
    const message = `S3Write(): ${filename} Error putting object into bucket ${bucket}`;
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
export async function updateMetadata(s3, bucket, filename, metadata) {
  const params = {
    Bucket: bucket,
    Key: filename,
    CopySource: `/${bucket}/${filename}`,
    ContentType: `application/octet-stream`,
    MetadataDirective: 'REPLACE',
    Metadata: metadata
  };

  try {
    console.log(`updateMetaData(): ${filename} replace metadata... `);
    let response = await s3.send(new CopyObjectCommand(params));
    console.log(`updateMetaData(): ${filename} replace metadata... response: `, response);
    return {
      statusCode: 200,
      body: response
    };
  } catch (err) {
    if (err.Code === 'NoSuchKey') {
      console.error(`updateMetaData(): ${filename} doesn't exist`);
    }else {
      console.error(`updateMetaData(): ${filename} error`, err);
    }
    const message = `updateMetaData(): ${filename} Error updating metadata`;
    return {
      statusCode: 500,
      body: message
    };
  }
}