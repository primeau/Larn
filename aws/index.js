var AWS = require('aws-sdk');
var scoreboardReader = require('scoreboardGET');
var dbWriter = require('scorePUT');
var gameReader = require('scoreGET');

// TODO: tons of redundant error handling to clean up

exports.handler = async (event) => {

    var dynamo = new AWS.DynamoDB.DocumentClient({
        apiVersion: '2012-08-10'
    });

    console.log("EVENT: " + JSON.stringify(event));

    // 
    // WRITE GAME TO GAMES TABLE, RECORD HIGH SCORE
    //
    if (event.newScore) {
        console.log(`writing new game ${event.newScore.gameID}`);
        return dbWriter.scorePUT(dynamo, event.newScore);
    }

    // 
    // PARSE GAMEID
    var gameID = event.gameID;
    if (!gameID && event.queryStringParameters) {
        gameID = event.queryStringParameters.gameID;
    }
    if (!gameID && event.pathParameters) {
        gameID = event.pathParameters.score;
        if (gameID.length > 10) {
            gameID = gameID.substring(6);
        }
    }

    //
    // GET SCOREBOARD
    //
    if (gameID == 'board') {
        console.log(`getting scoreboard`);
        return scoreboardReader.scoreboardGET(dynamo);
    }

    //
    // GET GAME
    //
    if (gameID) {
        console.log(`loading game: ${gameID}`);
        return gameReader.scoreGET(dynamo, gameID);
    }

};