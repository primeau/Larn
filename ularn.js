'use strict';

var MAX_BANK_BALANCE;

function setUlarnVars() {

    // GAME NAME
    GAMENAME = ULARN ? `Ularn` : `Larn`;

    // TIME
    TIMELIMIT = ULARN ? 40000 : 30000;

    // DUNGEON AND VOLCANO LEVELS
    MAXLEVEL = ULARN ? 16 : 11;
    MAXVLEVEL = ULARN ? 5 : 3;
    DBOTTOM = (MAXLEVEL - 1);
    VBOTTOM = (MAXLEVEL + MAXVLEVEL - 1);

    // MAZES
    LEVELS = new Array(MAXLEVEL + MAXVLEVEL);
    MAZES = COMMON_MAZES.concat(ULARN ? ULARN_MAZES : LARN_MAZES);

    // DND STORE
    STORE_INVENTORY = ULARN ? ULARN_STORE_INVENTORY : LARN_STORE_INVENTORY;
    MAXITM = STORE_INVENTORY.length;

    // BANK
    MAX_BANK_BALANCE = ULARN ? 1000000 : 500000;
    OBANK.desc = `the bank of ${GAMENAME}`;
    OBANK2.desc = `the ${ULARN ? 8 : 5}th branch of the Bank of ${GAMENAME}`;
    
    // SCHOOL
    OSCHOOL.desc = `the College of ${GAMENAME}`;

    // LRS
    OLRS.desc = `the ${GAMENAME} Revenue Service`;

    // TRADING POST
    if (ULARN) OTRADEPOST.desc = `You have found the Ularn trading Post`;

    // ITEMS
    FORTUNES = COMMON_FORTUNES.concat(ULARN ? ULARN_FORTUNES : LARN_FORTUNES);

    if (ULARN) {
        monsterlist[LEMMING].char = `l`;
        monsterlist[LEMMING].desc = `lemming`;

        OSTAIRSUP.char = `<b>%</b>`;
        OSTAIRSDOWN.char = `<b>%</b>`;

        // this should probably be replaced with enums
        DEATH_REASONS[6] = `fell into a pit to HELL`;
        DEATH_REASONS[15] = `fell through a trap door to HELL`;
    }
}