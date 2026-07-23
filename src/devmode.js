'use strict';

function enableDevmode() {

    try {
        Rollbar.configure({ enabled: false });
    } catch (error) {
        //
    }

    console.error("DEVMODE IN USE");

    ENABLE_RECORDING = false;
    ENABLE_RECORDING_REALTIME = false;
    recording = null;

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

    // learnSpell(`cld`);

    // take(createObject(OSCROLL, 0));
    // take(createObject(OPOTION, 0));
    // take(createObject(OPOTION, 21));
    // take(createObject(OCOOKIE));

    // take(createObject(OSPHTALISMAN));
    // take(createObject(OLIFEPRESERVER));
    // take(createObject(OLARNEYE));
    // take(createObject(ONOTHEFT));
    // gtime = 40001;
    player.GOLD = 250000;

    updateLog(`normal <i>italic</i> <s>strike</s> <b>bold</b> <dim>dim</dim> <mark style='color:lightgrey'>mark</mark> <u>underline</u> <a href='https://larn.org'>Link</a> <font color='red'>red</font> <font color='green'>green</font> <font color='blue'>blue</font>`);

    // newcavelevel(level + 1);
    // setItem(player.x, player.y, createObject(OTRAPDOOR));
    // setItem(player.x, player.y, createObject(ODNDSTORE));
    // setItem(player.x, player.y, createObject(OTRADEPOST));

    // createmonster(NYMPH);
    // for (let index = 1; index < monsterlist.length; index++) {
    //     createmonster(index, 1+index, 2);
    // }
    // revealLevel();

    // winner:
    // take(createObject(OPOTION, 21));
    // gtime = 50001; // out of time

}


