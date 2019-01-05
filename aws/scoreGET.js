var AWS = require('aws-sdk');

module.exports = {

    scoreGET: async function(dynamo, gameID) {

        var response = {
            statusCode: 500,
            body: `scoreGET total fail`,
        };
        
        var params = {
            Key: {
                "gameID": gameID
            },
            TableName: "games"
        };
        
        await dynamo.get(params, function(error, data) {
    
            if (error) {
                console.log(`scoreGET dynamo error: ` + gameID);
                response = {
                    statusCode: 500,
                    body: `scoreGET dynamo error: ` + gameID,
                };
            }
            else if (!data.Item) {
                console.log(`scoreGET can't find: ` + gameID);
                response = {
                    statusCode: 404,
                    body: `can't find game: ` + gameID,
                };
            }
            else {
                console.log(`scoreGET got: ` + gameID);
                response = {
                    statusCode: 200,
                    body: JSON.stringify(data.Item),
                };
            }
    
        }).promise();
    
        return response;
    
    }
    
};
    
    