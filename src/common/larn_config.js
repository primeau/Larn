'use strict';

const VERSION = '12.5.3';
const BUILD = '574';

const ENABLE_DEVMODE = false; // this must be set to false for production releases

const CF_LOCAL = false;
const CF_BROADCAST_HOST = CF_LOCAL ? `localhost:8787` : `broadcast.larn.workers.dev`;
const CF_BROADCAST_PROTOCOL = CF_LOCAL ? `http://` : `https://`;

const CF_SCORE_ENDPOINT = 'score';
const CF_HIGHSCORE_ENDPOINT = 'highscore';
const CF_ACTIVEGAME_ENDPOINT = 'active';
const CF_COMPLETEDGAME_ENDPOINT = 'completed';
const CF_ROLLS_ENDPOINT = 'roll';
const CF_GOTW_ENDPOINT = 'gotw';
const CF_HIGHSCORES_TABLE = 'highscores';

// recorded games
let ENABLE_RECORDING = true;
const MIN_FRAMES_TO_LIST = 1000;
const MAX_ROLL_LENGTH = CF_LOCAL ? 10 : 200;

// live games
let ENABLE_RECORDING_REALTIME = true;
const LIVE_LIST_REFRESH = CF_LOCAL ? 1 : 10; // seconds
const LIVE_METADATA_WAIT = CF_LOCAL ? 1 : 10; // seconds
const LIVE_METADATA_MOVES = CF_LOCAL ? 1 : 11; // moves
