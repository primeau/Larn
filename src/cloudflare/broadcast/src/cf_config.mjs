'use strict';

export const CF_LOCAL = false;

export const CF_LARN = `larn`;
export const CF_ULARN = `ularn`;
export const CF_WINNERS = `winners`;
export const CF_VISITORS = `visitors`;

// export const CF_BROADCAST_HOST = CF_LOCAL ? `localhost:8787` : `broadcast.larn.workers.dev`;
// export const CF_BROADCAST_PROTOCOL = CF_LOCAL ? `http://` : `https://`;

export const CF_COMPLETEDGAME_ENDPOINT = 'completed';
export const CF_GOTW_ENDPOINT = 'gotw';
export const CF_HIGHSCORE_ENDPOINT = 'highscore';
export const CF_ACTIVEGAME_ENDPOINT = 'active';
export const CF_SCORE_ENDPOINT = 'score';

export const CF_COMPLETED_GAMES_TABLE = `completed`;
export const CF_GOTW_TABLE = `gotw`;
export const CF_HIGHSCORES_TABLE = 'highscores';
export const CF_ACTIVE_TABLE = 'active';
export const CF_SCORES_TABLE = 'scores';
export const CF_WATCHERS_TABLE = 'watchers';
export const CF_IP_TRACKER_TABLE = 'requests';

export const WATCHERS_TTL = CF_LOCAL ? 60 : 300;
export const SCHEDULE_GAME_TTL = CF_LOCAL ? 60 : 600;
export const SCHEDULE_DEAD_TTL = CF_LOCAL ? 10 : 60;
