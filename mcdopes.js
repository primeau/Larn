`use strict`;

/* inventory */
var drug = [true, true, true, true, true];



/*
	function to display the header info for the pad
 */
function pad_hd() {
    cl_up(1, 18);
    cursor(1, 1);
    lprcat(`Hey man, welcome to Dealer McDope's Pad! I gots the some of the finest shit\n`);
    lprcat(`you'll find anywhere in Ularn -- check it out...\n\n\n`);
    lprcat(`                    The Stash                   The Cash\n\n`);

    if (drug[0]) lprcat(`                a)  Killer Speed                100 bucks`);
    lprc(`\n`);
    if (drug[1]) lprcat(`                b)  Groovy Acid                 250 bucks`);
    lprc(`\n`);
    if (drug[2]) lprcat(`                c)  Monster Hash                500 bucks`);
    lprc(`\n`);
    if (drug[3]) lprcat(`                d)  Trippy Shrooms              1000 bucks`);
    lprc(`\n`);
    if (drug[4]) lprcat(`                e)  Cool Coke                   5000 bucks`);
    lprc(`\n`);

    let plural = player.GOLD == 1 ? `` : `s`;
    cursor(30, 18);
    lprcat(`Looks like you got about ${player.GOLD} buck${plural} on you.   `);

    lprcat(`\n\nSo, whaddya want [<b>escape</b> to split] ?`);
}



function opad() {
    clear();
    pad_hd();
    setCharCallback(parse_mcdopes);
}



function parse_mcdopes(key) {
    if (key == ESC) {
        return exitbuilding();
    }

    if (!isalpha(key)) return false;

    cursor(39, 20);
    lprc(`${key}\n`);

    switch (key) {
        case `a`:
            /* speed */
            dodeal(OSPEED, 100, 0);
            break;
        case `b`:
            /* acid */
            dodeal(OACID, 250, 1);
            break;
        case `c`:
            /* hash */
            dodeal(OHASH, 500, 2);
            break;
        case `d`:
            /* shrooms */
            dodeal(OSHROOMS, 1000, 3);
            break;
        case `e`:
            /* coke */
            dodeal(OCOKE, 5000, 4);
            break;
    } /* end switch */

    pad_hd();
    return false;
} /* end pad() */



function dodeal(whichdrug, price, index) {
    if (!drug[index]) {
        nomore();
        return;
    }
    if (player.GOLD < price) {
        nocash();
        return;
    } 
    else if (snag(whichdrug)) {
        player.GOLD -= price;
        drug[index] = false;
    }
}



function snag(itm) {
    if (pocketfull()) {
        lprcat(`\nHey, you can't carry any more.`);
        cltoeoln();
        return false;
    }
    take(itm);
    lprcat(`\nOk, here ya go.`);
    cltoeoln();
    return true;
}



function nomore() {
    lprcat(`\nSorry man, I ain't got no more of that shit.`);
    cltoeoln();
    // nap(2200);
}



function nocash() {
    lprcat(`\nWhattaya trying to pull on me? You aint got the cash!`);
    cltoeoln();
    // nap(1200);
}



function doSpeed() {
    appendLog(` snort!`);
    updateLog(`Ohwowmanlikethingstotallyseemtoslowdown!`);
    player.updateHasteSelf(200 + player.LEVEL);
    player.HALFDAM += 300 + rnd(200);
    player.setIntelligence(player.INTELLIGENCE - 2);
    player.setWisdom(player.WISDOM - 2);
    player.setConstitution(player.CONSTITUTION - 2);
    player.setDexterity(player.DEXTERITY - 2);
    player.setStrength(player.STRENGTH - 2);
}



function eatShrooms() {
    appendLog(` eat!`);
    updateLog(`Things start to get real spacey...`);
    player.HASTEMONST += rnd(75) + 25;
    player.CONFUSE += 30 + rnd(10);
    player.setWisdom(player.WISDOM + 2);
    player.setCharisma(player.CHARISMA + 2);

}



function dropAcid() {
    appendLog(` eat!`);
    updateLog(`You are now frying your ass off!`);
    player.CONFUSE += 30 + rnd(10);
    player.setIntelligence(player.INTELLIGENCE + 2);
    player.setWisdom(player.WISDOM + 2);
    player.AWARENESS += 1500;
    player.AGGRAVATE += 1500;
    // heal monsters
    for (let j = 0; j < MAXY; j++)
        for (let i = 0; i < MAXX; i++)
            if (player.level.monsters[i][j])
                player.level.monsters[i][j].hitpoints = monsterlist[player.level.monsters[i][j].arg].hitpoints;
}



function smokeHash() {
    appendLog(` smoke!`);
    updateLog(`WOW! You feel stooooooned...`);
    player.HASTEMONST += rnd(75) + 25;
    player.setIntelligence(player.INTELLIGENCE + 2);
    player.setWisdom(player.WISDOM + 2);
    player.setConstitution(player.CONSTITUTION - 2);
    player.setDexterity(player.DEXTERITY - 2);
    player.HALFDAM += 300 + rnd(200);
    player.CLUMSINESS += rnd(1800) + 200;
}



function doCoke() {
    appendLog(` snort!`);
    updateLog(`Your nose begins to bleed!`);
    player.setDexterity(player.DEXTERITY - 2);
    player.setConstitution(player.CONSTITUTION - 2);
    player.setCharisma(player.CHARISMA + 3);

    player.setStrength(player.STRENGTH + 33);
    player.setIntelligence(player.INTELLIGENCE + 33);
    player.setWisdom(player.WISDOM + 33);
    player.setConstitution(player.CONSTITUTION + 33);
    player.setDexterity(player.DEXTERITY + 33);
    player.setCharisma(player.CHARISMA + 33);

    player.COKED += 10;
}


