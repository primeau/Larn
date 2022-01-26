console.log('movies(): Loading function');

const aws = require('aws-sdk');

const s3 = new aws.S3({
    apiVersion: '2006-03-01'
});

const dynamo = new aws.DynamoDB.DocumentClient({
    api_version: '2012-08-10',
});


//
//
// MAIN EVENT HANDLER
//
//
exports.handler = async (event, context) => {
    if (!event.action) return;
    console.log('movies(): Received event:', event.action);
    const bucket = 'larn-movies';
    const action = event.action;
    const frameLimit = event.frameLimit || 0;

    // if (!action) {
    //     console.error(`movies(): action is undefined`);
    //     return;
    // }

    // 
    // READ GAME FILES
    // 
    if (action === 'read' || action === 'readfirst') {
        const key = event.gameID.charAt(0) + '/' + event.gameID + '/' + event.filename;

        const params = {
            Bucket: bucket,
            Key: key,
        };

        try {
            // const { Body } = await s3.getObject(params).promise();
            const resp = await s3.getObject(params).promise();
            const fileread = Buffer.from(resp.Body).toString("utf8");
            // console.log('movies(): got file:', fileread);


            //
            //
            //
            //
            //
            //
            //
            //
            //
            //
            console.log(`movies(): ${event.gameID} got metadata:`, resp.Metadata);
            return { "File": fileread, "Metadata": JSON.stringify(resp.Metadata) };
        } catch (err) {
            console.log(err);
            const message = `movies(): ${event.gameID} Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
            console.error(message);
            // throw new Error(message);
            return message;
        }
    }

    //
    // WRITE GAME FILES
    // 
    if (action === 'write' || action === 'writelast') {
        let fileroot = event.gameID.charAt(0) + '/' + event.gameID + '/';
        let filename = fileroot + event.filename;
        console.log(`movies(): ${event.gameID} writing to S3: ${filename}`);

        let response = await S3Write(bucket, filename, event.file);
        // console.log("FILE RESPONSE: ", response);

        if (action === 'write') {}

        // write completed game to dynamo
        if (action === 'writelast') {
            event.file = JSON.parse(event.file);
            console.log(`movies(): ${event.gameID} writing game info to dynamo`);
            let dynamoResponse = await scorePUT(dynamo, event.file, true);
            console.log(`movies(): ${event.gameID} dynamo response: `, dynamoResponse);
            // let totalRolls = event.file.split(`.`)[0];

            //
            //
            //
            //
            //
            //
            //
            //
            //
            console.log(`movies(): ${event.gameID} writing frame info metadata to 0.json`);
            let meta = {
                'frames': `${event.file.frames}`,
                // 'rolls': `${totalRolls}`,
                'who': `${event.file.who}`,
                'what': `${event.file.what}`,
                'diff': `${event.file.hardlev}`,
                'score': `${event.file.score}`,
                // 'x-amz-meta-frames': `${event.file.frames}`
            }
            let s3Response = await updateMetadata(bucket, `${fileroot}0.json`, meta);
            console.log(`movies(): ${event.gameID} `, s3Response);

        }
        return response;
    }

    //
    // GET LIST OF COMPLETED GAMES
    //
    if (action === 'listcompleted') {
        let gameList = await getGames(dynamo, true, frameLimit);
        // console.log('listcompleted', gameList);
        return gameList;
    }

    // if we got here, we didn't know what to do
    // TODO actually return an error
    console.error('movies(): invalid action', action);

};



//
//
// S3WRITE
//
//
async function S3Write(bucket, filename, filecontents) {
    const params = {
        Bucket: bucket,
        Key: filename,
        Body: Buffer.from(filecontents)
    };
    try {
        // console.log(`S3Write(): `, JSON.stringify(params));
        let response = await s3.putObject(params).promise();
        console.log('S3Write(): response', response);
        return response;
    } catch (err) {
        console.log(err);
        const message = `S3Write(): Error putting object ${key} into bucket ${bucket}`;
        console.error(message);
        throw new Error(message);
    }
}



//
//
// S3WRITE
//
//
async function getGames(dynamo, completed, frameLimit) {

    const params = {
        ReturnConsumedCapacity: 'TOTAL',
        TableName: completed ? 'completed' : 'current'
    };

    console.log(`getGames: getting ${params.TableName}\n`);

    try {
        const data = await dynamo.scan(params).promise();
        console.log(`getGames: ${params.TableName} ${data.Items.length} items\n`);

        for (let i = data.Items.length - 1; i >=0 ; i--) {
            const element = data.Items[i];
            if (element.frames < frameLimit) {
                data.Items[i] = null;
            }
        }

        return {
            statusCode: 200,
            body: data.Items
        };
    } catch (error) {
        return {
            statusCode: 400,
            error: `getGames: can't find scoreboard: ${error.stack}`
        };
    }
};




// TODO: this heavily duplicates scorePUT
async function DBWrite(dynamo, game, completed) {
    var params = {
        Item: {
            // all games
            "gameID": game.gameID,
            "score": game.score,
            "winner": game.winner,
            "hardlev": game.hardlev,
            "who": game.who,
            "timeused": game.timeused,
            "playerID": game.playerID,
            "createdAt": game.createdAt,
            // visitors only
            "what": game.what,
            "level": game.level,
            // ularn
            "character": game.character,
            "ularn": game.ularn,
            // video info
            "frames": game.frames,
        }
    };

    if (completed) {
        params.TableName = `completed`;
    } else {
        params.TableName = `current`;
    }

    var response;

    try {
        const DBresponse = await dynamo.put(params).promise();
        //console.log(`\nDBresponse: ${JSON.stringify(DBresponse)}\n`);
        if (DBresponse) {
            console.log(`DBWrite successful write to ${params.TableName} table: ${game.gameID}\n`);
            response = {
                statusCode: 200,
                body: `${game.gameID}`
            };
        } else {
            console.error(`DBWrite failed write to ${params.TableName} table: ${game.gameID}\n`);
            response = {
                statusCode: 400,
                body: `DBWrite error 400 writing game ${game.gameID}`
            };
        }
    } catch (error) {
        console.error(`DBWrite: failure writing to db: ${game.gameID}\n`, error);
        response = {
            statusCode: 500,
            body: `DBWrite error 500 writing game ${game.gameID}`
        };
    }

    return response;
}




async function scorePUT(dynamo, game, completed) {
    console.log(`scorePUT: start writing game: ${game.gameID}\n`);
    var response = await DBWrite(dynamo, game, completed);
    console.log(`scorePUT done writing game: ${game.gameID} got ${response.statusCode}\n`);
    if (response.statusCode == 200) {
        return response;
    } else {
        return {
            statusCode: response.statusCode,
            body: `scorePUT failed to write new score: ${game.gameID} got ${response.statusCode}\n`
        };
    }
};



//
//
// UPDATEMETADATA
//
//
async function updateMetadata(bucket, filename, metadata) {
    const params = {
        Bucket: bucket,
        Key: filename,
        CopySource: `/${bucket}/${filename}`,
        ContentType: `application/octet-stream`,
        MetadataDirective: 'REPLACE',
        // Metadata: {
        //     'frames': `${frames*2}`
        // },
        Metadata: metadata
    };

    console.log(`updateMetaData(): params: `, params);
    let response = await s3.copyObject(params).promise();
    console.log(`updateMetaData(): response: `, response);
}