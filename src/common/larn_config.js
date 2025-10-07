'use strict';

const VERSION = '12.5.2';
const BUILD = '538';

const ENABLE_DEVMODE = false;  // this must be set to false for production releases

const CF_LOCAL = false;
const CLOUDFLARE_READ = true;  // use cloudflare for scores
const CLOUDFLARE_WRITE = true;  // use cloudflare for scores

const CF_SCORE_ENDPOINT = 'score';
const CF_HIGHSCORE_ENDPOINT = 'highscore';
const CF_ACTIVEGAME_ENDPOINT = 'active';
const CF_COMPLETEDGAME_ENDPOINT = 'completed';
const CF_GOTW_ENDPOINT = 'gotw';
const CF_HIGHSCORES_TABLE = 'highscores';

// recorded games
const ENABLE_RECORDING = true; // IDEA: RELEASE A VERSION WITH THIS SET TO FALSE
const MIN_FRAMES_TO_LIST = 1000;
const MAX_ROLL_LENGTH = 200;
const AWS_SCORE_FUNCTION = 'score';
const AWS_RECORD_FUNCTION = `movie_test`;
function initLambdaCredentials() {
  AWS.config.accessKeyId = "AWS_CONFIG_ACCESSKEYID";
  AWS.config.secretAccessKey = "AWS_CONFIG_SECRETACCESSKEY";
}

// live games
const ENABLE_RECORDING_REALTIME = true; // IDEA: RELEASE A VERSION WITH THIS SET TO FALSE
const CF_BROADCAST_HOST = CF_LOCAL ? `localhost:8787` : `broadcast.larn.workers.dev`;
const CF_BROADCAST_PROTOCOL = CF_LOCAL ? `http://` : `https://`;
const LIVE_LIST_REFRESH = CF_LOCAL ? 1 : 10; // seconds
const LIVE_METADATA_WAIT = CF_LOCAL ? 1 : 10; // seconds
const LIVE_METADATA_MOVES = CF_LOCAL ? 1 : 11; // moves