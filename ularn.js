'use strict';

function setUlarnVars() {

    MAXLEVEL = ULARN ? 16 : 11;
    MAXVLEVEL = ULARN ? 5 : 3;
    TIMELIMIT = ULARN ? 40000 : 30000;

    LEVELS = new Array(MAXLEVEL + MAXVLEVEL);

    GAMENAME = ULARN ? `Ularn` : `Larn`;

    OBANK.desc = `the bank of ${GAMENAME}`;
    OBANK2.desc = `the ${ULARN ? 8 : 5}th branch of the Bank of ${GAMENAME}`;
    OSCHOOL.desc = `the College of ${GAMENAME}`;
    OLRS.desc = `the ${GAMENAME} Revenue Service`;

    if (ULARN) {
        monsterlist[LEMMING].char = `l`;
        monsterlist[LEMMING].desc = `lemming`;
    }
}