var AWS = require('aws-sdk');

module.exports = {

    scoreboardGET: async function(dynamo) {
        var winners = await this.scoreboard(dynamo, true);
        var visitors = await this.scoreboard(dynamo, false);
        if (winners.statusCode == 200 && visitors.statusCode == 200) {
            return {
                statusCode: 200,
                body: JSON.stringify([winners.body, visitors.body]),
            };
        }
        else {
            return {
                statusCode: 500,
                body: `scoreboardGET dynamo error reading scoreboards`,
            };
        }
    },
        
        
        
    scoreboard: async function(dynamo, winner) {

        var params = {
            ReturnConsumedCapacity: 'TOTAL',
            TableName: winner ? 'winners' : 'visitors'
        };

        var response = {
            statusCode: 500,
            body: `scoreboard total fail`,
        };

        await dynamo.scan(params, function(error, data) {
            if (error) {
                console.log("scoreboard dynamo error", error);
                response = {
                    statusCode: 500,
                    body: `scoreboard dynamo error`,
                };
            }
            else if (!data) {
                console.log(`error: 404`);
                response = {
                    statusCode: 404,
                    body: `scoreboard can't find scoreboard`,
                };
            }
            else {
                // console.log("scannedcount", data.ScannedCount);
                // console.log("count", data.Count);
                // console.log("lastkey", data.LastEvaluatedKey);
                // console.log("consumedcapacity", data.ConsumedCapacity);
                //console.log("data", data.Items);

                response = {
                    statusCode: 200,
                    body: data.Items.sort(sortScore)
                };
            }

        }).promise();


        return response;

    },
    


    compareScore: function (a,b) {
        return sortScore(a,b);
    },


};


// TODO this is duplicated in scores.js
function sortScore(a, b) {
    //console.log(`a: ${a.hardlev}, ${a.score}, ${a.winner?a.winner:a.level}, ${a.timeused}`);
    //console.log(`b: ${b.hardlev}, ${b.score}, ${b.winner?b.winner:b.level}, ${b.timeused}`);

    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;

    if (a.hardlev != b.hardlev) {
        return b.hardlev - a.hardlev; // higher difficulty
    }

    if (a.winner) {
        if (a.timeused != b.timeused) {
            return a.timeused - b.timeused; // won in less time
        } else {
            return b.score - a.score; // won with higher score
        }
    } else {
        if (a.score != b.score) {
            return b.score - a.score; // died with higher score
        } else if (a.level != b.level) {
            return b.level - a.level; // survived deeper
        } else {
            return b.timeused - a.timeused; // alive longer
        }
    }

}