Parse.Cloud.define('highscores', function(request, response) {
  var query = new Parse.Query('GlobalScore');

  /* prioritize fast games for winners, high scores for visitors */
  if (request.params.winner) {
    query.descending('hardlev'/*, 'timeused'*/);
  } else {
    query.descending('hardlev', 'score', 'level', 'timeused');
  }
  query.equalTo('winner', request.params.winner);

  /*
     filter out short games, but make sure very fast winning games get recorded.
     yes, it's possible to win in < 5 mobuls without cheating
  */
  if (!request.params.winner && request.params.timeused != null)
    query.greaterThan('timeused', request.params.timeused);

  console.log((request.params.gameover ? 'gameover ' : '') + 'scoreboard request from: ' + request.params.logname);

  query.find({
    success: function(scores) {

      /* populate an empty array in case there are no results */
      var scoreboard = [];

      /* keep track of players for uniqueness */
      var players = [];

      for (var i = 0; i < scores.length; i++) {
        var object = scores[i];
        //console.log(object.id + ' - ' + object.get('winner') + ' ' + object.get('hardlev') + ' ' + object.get('score') + ' ' + object.get('who'));

        /* filter out lower scores for the same player */
        var who = object.get('who');
        if (players.indexOf(who) >= 0) continue;
        players.push(who);

        /* this is a unique score, so add it to the list */
        scoreboard.push(object);

        if (scoreboard.length >= request.params.limit) break;
      }

      response.success(scoreboard);

    },

    error: function(error) {
      response.error(error);
    }
  });
});
