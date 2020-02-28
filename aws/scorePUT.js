const scoreboardReader = require('./scoreboardGET');

module.exports.scorePUT = async (dynamo, game, isUlarn, event, context) => {

    /*
        game.who = "TESTING";
        game.hardlev = 12;
        game.gameID = "1234567892";
    */

    console.log(`scorePUT: start writing game: ${game.gameID}\n`);
    var response = await DBWrite(dynamo, game, false, isUlarn);
    console.log(`scorePUT done writing game: ${game.gameID} got ${response.statusCode}\n`);

    // if we successfully write the game to the database
    // check to see if we need to update the high score board
    if (response.statusCode == 200) {
        console.log(`scorePUT: start check for high score eligibility\n`);
        var lowest = await getLowestScore(dynamo, game, isUlarn);
        console.log(`scorePUT: done check for high score eligibility\n`);
        if (lowest && lowest.gameID == game.gameID) {
            console.log(`scorePUT: game ${game.gameID} NOT a high score\n`);
        } 
        else {
            console.log(`scorePUT: game ${game.gameID} IS a high score\n`);
            console.log(`scorePUT: start writing high score: ${game.who} ${game.winner} ${game.hardlev} ${game.timeused} ${game.score}\n`);
            response = await DBWrite(dynamo, game, true, isUlarn);
            console.log(`scorePUT: done writing high score with response ${response.statusCode}\n`);
        }
        return response;
    } 
    else {
        return {
            statusCode: response.statusCode,
            body: `scorePUT failed to write new score: ${game.gameID} got ${response.statusCode}\n`
        };
    }
};



async function DBWrite(dynamo, game, highScore, isUlarn) {

    var params = setParams(game, highScore, isUlarn);
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
        } 
        else {
            console.log(`DBWrite failed write to ${params.TableName} table: ${game.gameID}\n`);
            response = {
                statusCode: 400,
                body: `DBWrite error 400 writing game ${game.gameID}`
            };
        }
    } 
    catch (error) {
        console.log(`DBWrite: failure writing to db: ${game.gameID}\n, error`);
        response = {
            statusCode: 500,
            body: `DBWrite error 500 writing game ${game.gameID}`
        };
    }

    return response;
}



async function getLowestScore(dynamo, game, isUlarn) {

    // quick checks -- don't bother with debug and old games
    if (game.debug == 1) return game;
    if (game.version && game.version == 1244) return game;

    // more quick checks, we know there are scores better than these   
    if (!isUlarn) {
        if (game.winner) {
            if (game.hardlev <= 3) return game;
        } 
        else {
            if (game.timeused < 50) return game;
            if (game.hardlev <= 6) return game;
        }
    }

    // we have a potential scoreboard contender
    var response = await scoreboardReader.scoreboard(dynamo, game.winner, isUlarn);
    var board = response.body;

    if (response.statusCode == 200) {
        // if the player has a lower score, replace that
        var prevPlayerScore = board.find(function (x) {
            return x.who == game.who || x.playerID == game.playerID;
        });
        if (prevPlayerScore) {
            console.log(`getLowestScoreA:`, prevPlayerScore.hardlev, game.hardlev, scoreboardReader.compareScore(prevPlayerScore, game), `\n`);
            if (scoreboardReader.compareScore(prevPlayerScore, game) > 0) {
                console.log(`getLowestScoreA: should write new high score for existing player\n`);
                return prevPlayerScore; // this game has a higher score, and prev player game should be replaced
            }
            return game;
        }

        // this is a new player, get the lowest score, or skip it if the scoreboard isn't full
        var prevLowestScore = board.length > 80 ? board.pop() : null;
        console.log(`getLowestScore current scoreboard size: ${board.length}`);
        console.log(`getLowestScore previous score is: ${prevLowestScore}`);
        if (prevLowestScore) {
            console.log(`getLowestScoreB:`, prevLowestScore.hardlev, game.hardlev, scoreboardReader.compareScore(prevLowestScore, game), `\n`);
            if (scoreboardReader.compareScore(prevLowestScore, game) > 0) {
                console.log(`getLowestScoreB: should write high score for new player\n`);
                return prevLowestScore; // this game has a higher score, and lowest score should be replaced
            }
            return game;
        }
        else {
            console.log(`getLowestScoreC: there was no lowest score\n`);
            return null;
        }
    } 
    else {
        console.log(response.statusCode, response.body);
        console.log(`getLowestScore: dynamo error checking high score table: ${game.gameID}\n`);
        return game;
    }

}




function setParams(score, highScore, isUlarn) {
    var params;

    if (highScore) {
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
    }
    else {
        params = {
            Item: score,
            TableName: 'games'
        };
    }

    if (isUlarn) params.TableName = `ularn_${params.TableName}`;
    if (isUlarn) params.Item.character = score.character;
    if (score.playerIP) params.Item.playerIP = score.playerIP;

    return params;
}