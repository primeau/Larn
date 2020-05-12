'use strict';

function DEVMODE() {

    try {
        Rollbar.configure({enabled: false});        
    } catch (error) {
        //
    }

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
    player.updateCancellation(100000);

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
    take(createObject(OPOTION, 11));
    // take(createObject(OPOTION, 10));
    // take(createObject(OPOTION, 21));
    take(createObject(OPOTION, 23));

    // take(createObject(OSPHTALISMAN));
    // take(createObject(OHANDofFEAR));
    take(createObject(OLARNEYE));
    // take(createObject(ONOTHEFT));
    // take(createObject(OBRASSLAMP));
    // gtime = 30001;
    player.GOLD = 250000;

    // for (let index = 1; index < monsterlist.length; index++) {
    //     createmonster(index, 1+index, 2);
    // }
    // revealLevel();

  
}


