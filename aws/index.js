const AWS = require('aws-sdk');
const scoreboardReader = require('./scoreboardGET');
const dbWriter = require('./scorePUT');
const gameReader = require('./scoreGET');
const tester = require('./testfunc');

const dynamo = new AWS.DynamoDB.DocumentClient({
    api_version: '2012-08-10',
});


exports.handler = async(event) => {
    console.log("EVENT: " + JSON.stringify(event) + "\n");

    // 
    // PARSE GAMEID
    //
    var gameID = parseGameID(event);
    
    //
    // RUN TEST
    //
    if (gameID == 'test') {
        console.log(`INDEX: running test\n`);
        return tester.testfunc();
    }
    
    // 
    // WRITE GAME TO GAMES TABLE, RECORD HIGH SCORE
    //
    if (event.newScore) {
        console.log(`INDEX: writing new game ${event.newScore.gameID}\n`);
        return dbWriter.scorePUT(dynamo, event.newScore);
    }

    //
    // GET HIGH SCORES
    //
    if (gameID == 'board') {
        console.log(`INDEX: getting scoreboard\n`);
        return scoreboardReader.scoreboardGET(dynamo);
    }

    //
    // LOAD GAME STATS
    //
    if (gameID) {
        console.log(`INDEX: loading game: ${gameID}\n`);
        return gameReader.scoreGET(dynamo, gameID);
    }

};



function parseGameID(event) {
    var gameID = event.gameID;
    console.log(`INDEX: start with gameID: ${gameID}\n`);
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
