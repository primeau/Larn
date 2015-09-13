Parse.Cloud.define('highscores', function(request, response) {
  var query = new Parse.Query('GlobalScore');

  query.descending('hardlev', 'score', 'level', 'timeused');
  query.equalTo('winner', request.params.winner);

  console.log('scoreboard request from: ' + request.params.logname);

  query.find({
    success: function(scores) {

      /* populate an empty array in case there are no results */
      var scoreboard = [];

      /* keep track of players for uniqueness */
      var players = [];

      for (var i = 0; i < scores.length; i++) {
        var object = scores[i];

        var who = object.get('who');
        if (players.indexOf(who) >= 0) continue;
        players.push(who);

        console.log(object.id + ' - ' + object.get('winner') + ' ' + object.get('hardlev') + ' ' + object.get('score') + ' ' + object.get('who'));
        // parse doesn't understand templates...
        //console.log(`${object.id} - ${object.get('winner')} ${object.get('hardlev')} ${object.get('score')} ${object.get('who')}`);

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
