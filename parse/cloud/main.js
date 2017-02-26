Parse.Cloud.define('highscores', function(request, response) {

  var start = new Date().getTime();

  var query = new Parse.Query('GlobalScore');
  query.limit(10000); /* probably limited to 1000 on server side? */

  if (request.params.doselect) {
    query.select('winner', 'score', 'hardlev', 'who', 'timeused', 'what', 'level', 'version', 'extra');
  }

  query.equalTo('winner', request.params.winner);
  query.addDescending('hardlev', 'score');

  /* filter out short games */
  if (!request.params.winner) {
    query.greaterThan('timeused', request.params.timeused);
  }

  query.find({
    success: function(scores) {

      /*
         TODO:
         if scores.length gets larger than 1000, this code will
         need to be fixed to include pagination
      */

      /* populate an empty array in case there are no results */
      var scoreboard = [];

      /* keep track of players for uniqueness */
      var players = [];

      for (var i = 0; i < scores.length; i++) {
        var object = scores[i];

        /* filter out old games played when 'cheats' were still available  */
        var version = object.get('version');
        if (version == 1244) continue;

        // /* eventually, filter out by build */
        // var build = object.get('extra');
        // if (!build || build[1] < 272) continue;

        /* filter out lower scores for the same player */
        var who = object.get('who');
        if (players.indexOf(who) >= 0) continue;
        players.push(who);

        /* this is a unique score, so add it to the list */
        scoreboard.push(object);

        if (scoreboard.length >= request.params.limit) break;
      }

      response.success(scoreboard);

      var end = new Date().getTime();
      var timeused = end - start;
      console.log(request.params.winner, scores.length, 'time used: ' + timeused);

    },

    error: function(error) {
      response.error(error);
    }
  });
});
