Parse.Cloud.define('highscores', function(request, response) {
  var query = new Parse.Query('GlobalScore');
  query.limit(10000); /* probably limited to 1000 on server side? */

  query.equalTo('winner', request.params.winner);

  /* prioritize fast games for winners, high scores for visitors */
  if (request.params.winner) {
    query.descending('hardlev');
    query.addAscending('timeused');
  } else {
    query.descending('hardlev', 'score', 'timeused', 'level');
    /* filter out short games */
    query.greaterThan('timeused', request.params.timeused);
  }

  query.find({
    success: function(scores) {

      /*
         TODO:
         if scores.length gets larger than 1000, this code will
         need to be fixed to include pagination
      */
      console.log("scores: " + request.params.winner + " " + scores.length);

      /* populate an empty array in case there are no results */
      var scoreboard = [];

      /* keep track of players for uniqueness */
      var players = [];

      for (var i = 0; i < scores.length; i++) {
        var object = scores[i];

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
