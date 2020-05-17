const scoreboardReader = require('./scoreboardGET');
const writer = require('./scorePUT');

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
        var lowest = await writer.getLowestScore(dynamo, game, isUlarn);
        console.log(`scorePUT: done check for high score eligibility\n`);
        if (lowest && lowest.gameID == game.gameID) {
            console.log(`scorePUT: game ${game.gameID} NOT a high score\n`);
        } else {
            console.log(`scorePUT: game ${game.gameID} IS a high score\n`);
            console.log(`scorePUT: start writing high score: ${game.who} ${game.winner} ${game.hardlev} ${game.timeused} ${game.score}\n`);
            response = await DBWrite(dynamo, game, true, isUlarn);
            console.log(`scorePUT: done writing high score with response ${response.statusCode}\n`);

            // if the player name is the same, the game will be overwritten naturally (primary key)
            if (lowest && lowest.who != game.who) {
                console.log(`scorePUT removing ${lowest.gameID} from the scoreboard...\n`);
                await DBDelete(dynamo, lowest, isUlarn);
                console.log(`scorePUT removing ${lowest.gameID} from the scoreboard... Done\n`);
            }
        }
        return response;
    } else {
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
        } else {
            console.log(`DBWrite failed write to ${params.TableName} table: ${game.gameID}\n`);
            response = {
                statusCode: 400,
                body: `DBWrite error 400 writing game ${game.gameID}`
            };
        }
    } catch (error) {
        console.log(`DBWrite: failure writing to db: ${game.gameID}\n`, error);
        response = {
            statusCode: 500,
            body: `DBWrite error 500 writing game ${game.gameID}`
        };
    }

    return response;
}


module.exports.DBDelete = async (dynamo, game, isUlarn, event, context) => {

    var params = {
        TableName: game.winner ? "winners" : "visitors",
        Key: {
            "who": game.who
        }
    };
    if (isUlarn) params.TableName = `ularn_${params.TableName}`;

    var response;

    try {
        const DBresponse = await dynamo.delete(params).promise();
        console.log(`\nDBresponse: ${JSON.stringify(DBresponse)}\n`);
        if (DBresponse) {
            console.log(`DBDelete successful delete from ${params.TableName} table: ${game.who} ${game.gameID}\n`);
            response = {
                statusCode: 200,
                body: `${game.gameID}`
            };
        } else {
            console.log(`DBDelete failed delete from ${params.TableName} table: ${game.who} ${game.gameID}\n`);
            response = {
                statusCode: 400,
                body: `DBDelete error 400 deleting game: ${game.who} ${game.gameID}`
            };
        }
    } catch (error) {
        console.log(`DBDelete: failure deleting from db: ${game.who} ${game.gameID}`, error);
        response = {
            statusCode: 500,
            body: `DBDelete error 500 deleting game ${game.who} ${game.gameID}`
        };
    }

    return response;
}



module.exports.getLowestScore = async (dynamo, game, isUlarn, board) => {

    // quick checks -- don't bother with debug and old games
    if (game.debug == 1) {
        console.log(`getLowestScore: debug == 1\n`);
        return game;
    }
    if (game.version && game.version == 1244) {
        console.log(`getLowestScore: game.version == 1244\n`);
        return game;
    }

    // more quick checks, we know there are scores better than these
    let minWinDiff = isUlarn ? 0 : 3;
    let minLoseDiff = isUlarn ? 0 : 6;
    let minTime = isUlarn ? 25 : 50;
    if (game.winner) {
        if (game.hardlev < minWinDiff) {
            console.log(`getLowestScore: min win diff ${game.hardlev} <= ${minWinDiff}\n`);
            return game;
        }
    } else {
        if (game.timeused < minTime) {
            console.log(`getLowestScore: min lose time ${game.timeused} < ${minTime}\n`);
            return game;
        }
        if (game.hardlev < minLoseDiff) {
            console.log(`getLowestScore: min lose diff ${game.hardlev} <= ${minLoseDiff}\n`);
            return game;
        }
    }


    // we have a potential scoreboard contender
    // allow passing in a scoreboard
    let response;
    if (board) {
        response = {
            'statusCode': 200
        };
    } else {
        response = await scoreboardReader.scoreboard(dynamo, game.winner, isUlarn);
        board = response.body;

    }

    if (response.statusCode == 200) {

        let prevPlayerScore;

        // check for games on the scoreboard that have the same ip, player name or playerid
        // it's possible for corner cases where each of these check could yield a different 
        // game, and we should nuke more than one, but i'm fine with this for now.

        // check who
        let whoGameDiff;
        let whoo = board.find(test => test != null && game.who == test.who);
        if (whoo) {
            whoGameDiff = scoreboardReader.compareScore(whoo, game);
            console.log(`getLowestScoreWHO-new:`, game.playerIP, game.who, game.playerID, game.hardlev, game.timeused, game.score, game.level, `\n`);
            console.log(`getLowestScoreWHO-old:`, whoo.playerIP, whoo.who, whoo.playerID, whoo.hardlev, whoo.timeused, whoo.score, whoo.level, `\n`);
            /* is the new game higher than the previous game that matches this player name? */
            if (whoGameDiff > 0) {
                console.log(`getLowestScoreWHO: ${whoGameDiff} should write new high score for existing player\n`);
                prevPlayerScore = whoo;
            }
        } else {
            console.log(`getLowestScoreWHO: ${game.who} not found\n`);
        }
        // check playerip
        let ipGameDiff;
        let ippp = game.playerIP != 0 ? board.find(test => test != null && game.playerIP == test.playerIP) : null;
        if (ippp) {
            ipGameDiff = scoreboardReader.compareScore(ippp, game);
            console.log(`getLowestScoreIP-new:`, game.playerIP, game.who, game.playerID, game.hardlev, game.timeused, game.score, game.level, `\n`);
            console.log(`getLowestScoreIP-old:`, ippp.playerIP, ippp.who, ippp.playerID, ippp.hardlev, ippp.timeused, ippp.score, ippp.level, `\n`);
            /* is the new game higher than the previous game that matches this ip ? */
            if (ipGameDiff > 0) {
                console.log(`getLowestScoreIP: ${ipGameDiff} should write new high score for existing player\n`);
                prevPlayerScore = ippp;
            }
        } else {
            console.log(`getLowestScoreIP: ${game.playerIP} not found\n`);
        }
        // check playerid
        let idGameDiff;
        let iddd = board.find(test => test != null && game.playerID == test.playerID);
        if (iddd) {
            idGameDiff = scoreboardReader.compareScore(iddd, game);
            console.log(`getLowestScoreID-new:`, game.playerIP, game.who, game.playerID, game.hardlev, game.timeused, game.score, game.level, `\n`);
            console.log(`getLowestScoreID-old:`, iddd.playerIP, iddd.who, iddd.playerID, iddd.hardlev, iddd.timeused, iddd.score, iddd.level, `\n`);
            if (idGameDiff > 0) {
                console.log(`getLowestScoreID: ${idGameDiff} should write new high score for existing player\n`);
                prevPlayerScore = iddd;
            }
        } else {
            console.log(`getLowestScoreID: ${game.playerID} not found\n`);
        }

        if (prevPlayerScore) {
            console.log(`getLowestScoreA: should write new high score for existing player\n`);
            return prevPlayerScore; // this game has a higher score, and prev player game should be replaced
        }

        if (ipGameDiff && ipGameDiff < 0) return game;
        if (idGameDiff && idGameDiff < 0) return game;
        if (whoGameDiff && whoGameDiff < 0) return game;

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
        } else {
            console.log(`getLowestScoreC: there was no lowest score\n`);
            return null;
        }
    } else {
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
        } else {
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
    } else {
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