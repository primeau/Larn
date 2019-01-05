var AWS = require('aws-sdk');
var scoreboardReader = require('scoreboardGET');

module.exports = {

    scorePUT: async function(dynamo, game) {
        var response = await this.gamesDbWrite(dynamo, game);
        
        // check high score board
        var lowest = await getLowestScore(dynamo, game);
        // console.log(lowest.gameID, game.gameID);
        if (lowest.gameID == game.gameID) {
            console.log("not high score");
        }
        else {
            await writeHighScore(dynamo, game);
        }        
        
        if (response.statusCode == 200) {
            return {
                statusCode: 200,
                body: game.gameID,
            };
        }
        else {
            return {
                statusCode: 500,
                body: `scorePUT dynamo error writing game ${game.gameID}`,
            };
        }
    },
    
    

    gamesDbWrite: async function(dynamo, game) {

        var params = {
            Item: game,
            TableName: 'games'
        };

        var response = {
            statusCode: 500,
            body: `gamesDbWrite total fail`,
        };

        await dynamo.put(params, function(error, data) {
            if (error) {
                console.log("gamesDbWrite dynamo error", error);
                response = {
                    statusCode: 500,
                    body: `dynamo error`,
                };
            }
            else if (!data) {
                console.log(`error: 404`);
                response = {
                    statusCode: 404,
                    body: `can't find games table`,
                };
            }
            else {
                console.log("successful write to games table", game.gameID);
                response = {
                    statusCode: 200,
                    body: `${game.gameID}`,
                };
            }

        }).promise();


        return response;

    },


};



 async function getLowestScore(dynamo, game) {

    // quick checks
    if (game.debug == 1) return game;
    if (game.version && game.version == 1244) return game;

    // more quick checks    
    if (game.winner) {
        if (game.hardlev <= 3) return game;
    }
    else {
        if (game.timeused < 50) return game;
        if (game.hardlev <= 6) return game;
    }

    // we have a potential scoreboard contender
    var response = await scoreboardReader.scoreboard(dynamo, game.winner);
    var board = response.body;

    if (response.statusCode == 200) {
        // if the player has a lower score, replace that
        var prevPlayerScore = board.find(function(x) {
            return x.who == game.who;
        });
        if (prevPlayerScore) {
            console.log(prevPlayerScore.hardlev, game.hardlev, scoreboardReader.compareScore(prevPlayerScore, game));
            if (scoreboardReader.compareScore(prevPlayerScore, game) > 0) {
                console.log('should write new high score for existing player');
                return prevPlayerScore; // this game has a higher score, and prev player game should be replaced
            }
            return game;
        }
            
        // this code assumes the 
        // this is a new player, get the lowest score
        var prevLowestScore = board.pop();
        if (prevLowestScore) {
            console.log(prevLowestScore.hardlev, game.hardlev, scoreboardReader.compareScore(prevLowestScore, game));
            if (scoreboardReader.compareScore(prevLowestScore, game) > 0) {
                console.log('should write high score for new player');
                return prevLowestScore; // this game has a higher score, and lowest score should be replaced
            }
            return game;
        }
        
        return game;

    }
    else {
        console.log(response.statusCode, response.body);
        console.log(`dynamo error checking high score table: ${game.gameID}`);
        return game;
    }


}




async function writeHighScore(dynamo, score) {

    console.log(`writeHighScore: ${score.who} ${score.hardlev} ${score.timeused} ${score.who} ${score.score}`);

    var params;
    
    if (score.winner) {
        params = {
            TableName: "winners",
            Item: {
                "gameID": score.gameID,
                "score": score.score,
                "winner": score.winner, // redundant, but makes life easier for sorting
                "hardlev": score.hardlev,
                "who": score.who,
                "timeused": score.timeused,
                "playerID": score.playerID,
                "createdAt": score.createdAt,
            }
        };
    }
    else {
        params = {
            TableName: "visitors",
            Item: {
                "gameID": score.gameID,
                "score": score.score,
                "winner": score.winner, // redundant, but makes life easier for sorting
                "hardlev": score.hardlev,
                "who": score.who,
                "what": score.what,
                "level": score.level,
                "timeused": score.timeused,
                "playerID": score.playerID,
                "createdAt": score.createdAt,
            }
        };
    }
    await dynamo.put(params, function (err, data) {
        if (err) {
            console.log("err: " + score.gameID);
            console.log("err JSON: " + JSON.stringify(err));
        } else {
            console.log(`wrote high score: ${score.who} ${score.hardlev} ${score.timeused} ${score.who} ${score.score}`);
        }
    }).promise();
    
    
    
}
