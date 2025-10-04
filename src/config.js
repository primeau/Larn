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
    EXPLORED_LEVELS = new Array(MAXLEVEL + MAXVLEVEL).fill(false); // cache needed for GOTW games

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

    if (ULARN) OTRADEPOST.desc = `the Ularn trading Post`;

    // ITEMS
    FORTUNES = COMMON_FORTUNES.concat(ULARN ? ULARN_FORTUNES : LARN_FORTUNES);

    if (ULARN) {
        DEATH_REASONS.set(DIED_BOTTOMLESS_TRAPDOOR, `fell through a trap door to HELL`);
        DEATH_REASONS.set(DIED_BOTTOMLESS_PIT, `fell into a pit to HELL`);
    }

    // MISC NIT-PICKING FOR MESSAGES
    youFound = ULARN ? `You find` : `You have found`;
    period = ULARN ? `.` : ``;

    // MONSTER COLOURS
    if (ULARN) monsterlist[LEMMING].color = `rosybrown`; else monsterlist[BAT].color = `brown`;
    monsterlist[GNOME].color = `darkkhaki`;
    monsterlist[HOBGOBLIN].color = `salmon`;
    monsterlist[JACKAL].color = `sandybrown`;
    if (ULARN) monsterlist[KOBOLD].color = `brown`; else monsterlist[KOBOLD].color = `rosybrown`;
    monsterlist[ORC].color = `tan`;
    monsterlist[SNAKE].color = `olivedrab`;
    monsterlist[CENTIPEDE].color = `orangered`;
    monsterlist[JACULI].color = `burlywood`;
    monsterlist[TROGLODYTE].color = `navajowhite`;
    monsterlist[ANT].color = `indianred`;
    monsterlist[EYE].color = `mediumorchid`;
    monsterlist[LEPRECHAUN].color = `mediumseagreen`;
    monsterlist[NYMPH].color = `lightpink`;
    monsterlist[QUASIT].color = `yellowgreen`;
    monsterlist[RUSTMONSTER].color = `goldenrod`;
    monsterlist[ZOMBIE].color = `gray`;
    monsterlist[ASSASSINBUG].color = `forestgreen`;
    if (ULARN) monsterlist[BITBUG].color = `chocolate`; else monsterlist[BUGBEAR].color = `chocolate`;
    monsterlist[HELLHOUND].color = `crimson`;
    monsterlist[ICELIZARD].color = `white`;
    monsterlist[CENTAUR].color = `sandybrown`;
    monsterlist[TROLL].color = `seagreen`;
    monsterlist[YETI].color = `mintcream`;
    monsterlist[WHITEDRAGON].color = `snow`;
    monsterlist[ELF].color = `mediumseagreen`;
    monsterlist[CUBE].color = `turquoise`;
    monsterlist[METAMORPH].color = `moccasin`;
    monsterlist[VORTEX].color = `lightcyan`;
    monsterlist[ZILLER].color = `cadetblue`;
    monsterlist[VIOLETFUNGI].color = `violet`;
    monsterlist[WRAITH].color = `dimgray`;
    monsterlist[FORVALAKA].color = `thistle`;
    if (ULARN) monsterlist[LAMANOBE].color = `powderblue`; else monsterlist[LAWLESS].color = `powderblue`;
    monsterlist[OSEQUIP].color = null;
    monsterlist[ROTHE].color = `sienna`;
    monsterlist[XORN].color = `brown`;
    monsterlist[VAMPIRE].color = `slategray`;
    monsterlist[INVISIBLESTALKER].color = null;
    monsterlist[POLTERGEIST].color = `lavender`;
    monsterlist[DISENCHANTRESS].color = `antiquewhite`;
    monsterlist[SHAMBLINGMOUND].color = `olivedrab`;
    monsterlist[YELLOWMOLD].color = `palegoldenrod`;
    monsterlist[UMBERHULK].color = `peru`;
    monsterlist[GNOMEKING].color = `steelblue`;
    monsterlist[MIMIC].color = `beige`;
    monsterlist[WATERLORD].color = `cornflowerblue`;
    monsterlist[BRONZEDRAGON].color = `goldenrod`;
    monsterlist[GREENDRAGON].color = `palegreen`;
    monsterlist[PURPLEWORM].color = `purple`;
    monsterlist[XVART].color = `teal`;
    monsterlist[SPIRITNAGA].color = `mediumslateblue`;
    monsterlist[SILVERDRAGON].color = `paleturquoise`;
    monsterlist[PLATINUMDRAGON].color = `lightsteelblue`;
    monsterlist[GREENURCHIN].color = `lime`;
    monsterlist[REDDRAGON].color = `indianred`;

}