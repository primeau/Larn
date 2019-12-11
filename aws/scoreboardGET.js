module.exports.scoreboardGET = async(dynamo, event, context) => {

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
            body: `scoreboardGET: dynamo error reading scoreboards`,
        };
    }
};



module.exports.scoreboard = async(dynamo, winner, event, context) => {

    const params = {
        ReturnConsumedCapacity: 'TOTAL',
        TableName: winner ? 'winners' : 'visitors'
    };

    console.log(`scoreboardGET: getting ${params.TableName}\n`);

    try {
        const data = await dynamo.scan(params).promise();
        console.log(`scoreboardGET: ${params.TableName} ${data.Items.length} items\n`);

        return {
            statusCode: 200,
            body: data.Items.sort(this.compareScore)
        };
    }
    catch (error) {
        return {
            statusCode: 400,
            error: `scoreboardGET: can't find scoreboard: ${error.stack}`
        };
    }
};



// TODO this is duplicated in scores.js
module.exports.compareScore = (a, b) => {
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
        }
        else {
            return b.score - a.score; // won with higher score
        }
    }
    else {
        if (a.score != b.score) {
            return b.score - a.score; // died with higher score
        }
        else if (a.level != b.level) {
            return b.level - a.level; // survived deeper
        }
        else {
            return b.timeused - a.timeused; // alive longer
        }
    }
};
