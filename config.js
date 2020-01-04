'use strict';

function setGameConfig() {

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

    // MONSTERS
    monsterlist = ULARN ? ULARN_monsterlist : LARN_monsterlist;

    // SPELLS
    splev = ULARN ? ULARN_splev : LARN_splev;
    spelweird = ULARN ? ULARN_spelweird : LARN_spelweird;

    // BUILDINGS
    STORE_INVENTORY = ULARN ? ULARN_STORE_INVENTORY : LARN_STORE_INVENTORY;
    MAXITM = STORE_INVENTORY.length;

    MAX_BANK_BALANCE = ULARN ? 1000000 : 500000;
    OBANK.desc = `the bank of ${GAMENAME}`;
    OBANK2.desc = `the ${ULARN ? 8 : 5}th branch of the Bank of ${GAMENAME}`;

    OSCHOOL.desc = `the College of ${GAMENAME}`;

    OLRS.desc = `the ${GAMENAME} Revenue Service`;

    if (ULARN) OTRADEPOST.desc = `You have found the Ularn trading Post`;

    // ITEMS
    FORTUNES = COMMON_FORTUNES.concat(ULARN ? ULARN_FORTUNES : LARN_FORTUNES);

    if (ULARN) {
        OSTAIRSUP.char = `<b><font color='green'>%</font></b>`;
        OSTAIRSDOWN.char = `<b><font color='blue'>%</font></b>`;

        ORINGOFEXTRA.char = `<b>|</b>`;
        OREGENRING.char = `<b>|</b>`;
        OPROTRING.char = `<b>|</b>`;
        OENERGYRING.char = `<b>|</b>`;
        ODEXRING.char = `<b>|</b>`;
        OSTRRING.char = `<b>|</b>`;
        OCLEVERRING.char = `<b>|</b>`;
        ODAMRING.char = `<b>|</b>`;

        OAMULET.char = `<b><font color='white'>.</font></b>`;
        OSPIRITSCARAB.char = `<b><font color='green'>.</font></b>`;
        OCUBEofUNDEAD.char = `<b><font color='purple'>.</font></b>`;
        ONOTHEFT.char = `<b><font color='yellow'>.</font></b>`;

        ODIAMOND.char = `<b><font color='white'><</font></b>`;
        ORUBY.char = `<b><font color='red'><</font></b>`;
        OEMERALD.char = `<b><font color='green'><</font></b>`;
        OSAPPHIRE.char = `<b><font color='blue'><</font></b>`;

        DEATH_REASONS.set(DIED_BOTTOMLESS_TRAPDOOR, `fell through a trap door to HELL`);
        DEATH_REASONS.set(DIED_BOTTOMLESS_PIT, `fell into a pit to HELL`);
        DEATH_REASONS.set(DIED_FAILED, `killed his family and committed suicide`);
    }

}