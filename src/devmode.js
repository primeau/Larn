'use strict';

function enableDevmode() {

    try {
        Rollbar.configure({ enabled: false });
    } catch (error) {
        //
    }

    console.error("DEVMODE IN USE");

    // ENABLE_RECORDING = false;
    // ENABLE_RECORDING_REALTIME = false;
    // recording = false;

    NONAP = true;    

    enableDebug();
    eventToggleDebugWTW();
    eventToggleDebugStairs();
    eventToggleDebugOutput();
    eventToggleDebugKnowAll();
    eventToggleDebugStats();
    eventToggleDebugImmortal();
    eventToggleDebugAwareness();
    // eventToggleDebugNoMonsters();
    player.updateStealth(100000);
    // player.updateCancellation(100000);
    player.SEEINVISIBLE = 100000

    wizardmode(`pvnert(x)`);

    // var startShield = createObject(OSHIELD);
    // take(startShield);
    // player.SHIELD = startShield;
    // var startArmor = createObject(OSSPLATE, 25);
    // take(startArmor);
    // player.WEAR = startArmor;
    // var startWeapon = createObject(OLANCE);
    // take(startWeapon);
    // player.WIELD = startWeapon;

    // player.raiseexperience(5000000);

    // take(createObject(OPOTION, 2));
    // take(createObject(OPOTION, 9));
    // take(createObject(OPOTION, 11));
    // take(createObject(OPOTION, 10));
    // take(createObject(OPOTION, 21));
    // take(createObject(OPOTION, 23));

    // take(createObject(OSPHTALISMAN));
    // take(createObject(OHANDofFEAR));
    if (ULARN) take(createObject(OLARNEYE));
    // take(createObject(ONOTHEFT));
    // take(createObject(OBRASSLAMP));
    // gtime = 30001;
    player.GOLD = 250000;

    updateLog(`normal <i>italic</i> <strike>strike</strike> <b>bold</b> <dim>dim</dim> <mark>mark</mark> <u>underline</u> <a href='https://larn.org'>Link</a>`);

    // newcavelevel(level + 1);
    // setItem(player.x, player.y, createObject(OTRAPDOOR));

    // createmonster(NYMPH);
    // for (let index = 1; index < monsterlist.length; index++) {
    //     createmonster(index, 1+index, 2);
    // }
    // revealLevel();

    // winner:
    // take(createObject(OPOTION, 21));
    // gtime = 50001; // out of time

}


