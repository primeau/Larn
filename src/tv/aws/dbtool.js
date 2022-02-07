// TODO: this heavily duplicates larn's DBWrite and scorePUT
module.exports.DBWrite = async (dynamo, table, game, completed) => {
  console.log(`DBWrite: start writing game: ${game.gameID}\n`);

  let items = {
    gameID: game.gameID,
    playerID: game.playerID,
    createdAt: game.createdAt,
    ularn: game.ularn,
    who: game.who,
    hardlev: game.hardlev,
    timeused: game.timeused,
    score: game.score,
    frames: game.frames,
  }

  if (completed) {
    items.character = game.character;
    items.winner = game.winner;
    items.what = game.what;
    items.level = game.level;
  } else {
    items.updateTime = Date.now();
    items.watchers = game.watchers;
    items.explored = game.explored;
  }

  let params = {
    TableName: table,
    Item: items
  };

  try {
    const DBresponse = await dynamo.put(params).promise();
    if (DBresponse) {
      console.log(`DBWrite successful write to ${params.TableName} table: ${game.gameID}\n`);
      return {
        statusCode: 200,
        body: `${game.gameID}`
      };
    } else {
      console.error(`DBWrite failed write to ${params.TableName} table: ${game.gameID}\n`);
      return {
        statusCode: 400,
        body: `DBWrite error 400 writing game ${game.gameID}`
      };
    }
  } catch (error) {
    console.error(`DBWrite: failure writing to db: ${game.gameID}\n`, error);
    return {
      statusCode: 500,
      body: `DBWrite error 500 writing game ${game.gameID}`
    };
  }

}



module.exports.DBDelete = async (dynamo, table, gameID) => {

  let params = {
    TableName: table,
    Key: {
      "gameID": gameID
    }
  };

  try {
    const DBresponse = await dynamo.delete(params).promise();
    if (DBresponse) {
      console.log(`DBDelete successful delete from ${params.TableName} table: ${gameID}\n`);
      return {
        statusCode: 200,
        body: `${gameID}`
      };
    } else {
      console.log(`DBDelete failed delete from ${params.TableName} table: ${gameID}\n`);
      return {
        statusCode: 400,
        body: `DBDelete error 400 deleting game: ${gameID}`
      };
    }
  } catch (error) {
    console.log(`DBDelete: failure deleting from db: ${gameID}`, error);
    return {
      statusCode: 500,
      body: `DBDelete error 500 deleting game ${gameID}`
    };
  }
  
}