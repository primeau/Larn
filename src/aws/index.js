const AWS = require('aws-sdk');
const scoreboardReader = require('./scoreboardGET');
const dbWriter = require('./scorePUT');
const gameReader = require('./scoreGET');

const dynamo = new AWS.DynamoDB.DocumentClient({
    api_version: '2012-08-10',
});



/*

API gateway setup steps:

API Gateway -> APIs -> create API
REST API (not private) -> Build
  Settings: 
    - API name: "ip"
    - Endpoint: Regional
Resources -> Actions -> Create Resource     
    - proxy resource: false   
    - Resource Name / Resource Path: "ip"
    - enable api gateway cors: false
Resources -> Actions -> Create Method -> GET
    - Integration type: lambda
    - use lambda proxy: false
    - region: us-east-1
    - Lambda: "score"
Resources -> Actions -> GET -> Integration Request -> Mapping Templates
    - request body passthrough: when there are no templates defined (recommended)
    - click "add mapping template" and use "application/json" for content-type
    - template:   { "client_ip": "$context.identity.sourceIp" }
Resources -> Actions -> /ip -> enable CORS
    - Access-Control-Allow-Origin: 'https://larn.org'
Resources -> Actions -> Deploy API
    - get invoke url (currently https://z0iwtshse6.execute-api.us-east-1.amazonaws.com/prod/ip)

  */


exports.handler = async (event) => {
    console.log("EVENT: " + JSON.stringify(event) + "\n");

    //
    // RETURN IP ADDRESS
    //
    if (event.client_ip) {
        return {
            statusCode: 200,
            body: event.client_ip
        };
    }

    // 
    // PARSE GAMEID
    //
    let gameID = parseGameID(event);

    //
    // PARSE IF ULARN
    //
    let ULARN = isUlarn(event);

    // 
    // WRITE GAME TO GAMES TABLE, RECORD HIGH SCORE
    //
    if (event.newScore) {
        console.log(`INDEX: writing new game ${event.newScore.gameID}\n`);
        return dbWriter.scorePUT(dynamo, event.newScore, ULARN);
    }

    //
    // GET HIGH SCORES
    //
    if (gameID == 'board') {
        console.log(`INDEX: getting scoreboard\n`);
        return scoreboardReader.scoreboardGET(dynamo, ULARN);
    }

    //
    // LOAD GAME STATS
    //
    if (gameID) {
        console.log(`INDEX: loading game: ${gameID}\n`);
        return gameReader.scoreGET(dynamo, gameID, ULARN);
    }

};



function parseGameID(event) {
    let gameID = event.gameID;
    console.log(`INDEX: start with gameID: ${gameID}\n`);
    if (!gameID && event.newScore) {
        gameID = event.newScore.gameID;
        console.log(`INDEX: newScore gameID: ${gameID}\n`);
    }
    if (!gameID && event.queryStringParameters) {
        gameID = event.queryStringParameters.gameID;
        console.log(`INDEX: queryStringParam gameID: ${gameID}\n`);
    }
    if (!gameID && event.pathParameters) {
        gameID = event.pathParameters.score;
        console.log(`INDEX: pathParam gameID: ${gameID}\n`);
        if (gameID.length > 10) {
            gameID = gameID.substring(6);
            console.log(`INDEX: substring gameID: ${gameID}\n`);
        }
    }
    console.log(`INDEX:   end with gameID: ${gameID}\n`);
    return gameID;
}



function isUlarn(event) {
    let gamename = event.gamename;
    console.log(`INDEX: gamename: ${gamename}\n`);
    return gamename && gamename === `Ularn`;
}
