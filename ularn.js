'use strict';

function setUlarnVars() {

    MAXLEVEL = ULARN ? 16 : 11;
    MAXVLEVEL = ULARN ? 5 : 3;
    TIMELIMIT = ULARN ? 40000 : 30000;

    LEVELS = new Array(MAXLEVEL + MAXVLEVEL);

    gameName = ULARN ? `Ularn` : `Larn`;

    OBANK2.desc = `the ${ULARN ? 8 : 5}th branch of the Bank of Larn`;

}