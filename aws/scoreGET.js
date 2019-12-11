module.exports.scoreGET = async(dynamo, gameID, event, context) => {

    const params = {
        Key: {
            "gameID": gameID
        },
        TableName: "games"
    };

    try {
        console.log(`scoreGET: attempting to load game: ${gameID}\n`);
        const data = await dynamo.get(params).promise();

        if (!data.Item) {
            console.log(`scoreGET: can't find: ${gameID}\n`);
            return {
                statusCode: 404,
                body: `can't find game: ` + gameID
            };
        }
        else {
            console.log(`scoreGET: got game: ${gameID}\n`);
            return {
                statusCode: 200,
                body: JSON.stringify(data.Item)
            };
        }
    }
    catch (error) {
        console.log(`scoreGET: dynamo error: ${gameID}\n`);
        return {
            statusCode: 500,
            body: `scoreGET: dynamo error: ${gameID}\n`
        };
    }

};
