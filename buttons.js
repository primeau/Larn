/* the code below is a highly experimental mess */

var BUTTONS = ``;

// common buttons
var BUTTON_SPACE = createButton(` `, `space`);
var BUTTON_DEL = createButton(DEL, `del`);
var BUTTON_CAPS = createButton(CAPS, `caps`);
var BUTTON_HELP = createButton(`?`, `Help`);
//
var BUTTON_WIELD = createButton(`w`, `wield`);
var BUTTON_WEAR = createButton(`W`, `wear`);
var BUTTON_QUAFF = createButton(`q`, `quaff`);
var BUTTON_READ = createButton(`r`, `read`);
var BUTTON_CAST = createButton(`c`, `cast`);
var BUTTON_INVENTORY = createButton(`i`, `inventory`);
var BUTTON_INVENTORY_FULL = createButton(`I`, `known items`);
var BUTTON_TELEPORT = createButton(`Z`, `teleport`);

// uncommon buttons
var BUTTON_EAT = createButton(`E`, `eat`);
var BUTTON_TAKEOFF = createButton(`T`, `remove armor`);
var BUTTON_AUTOPICKUP = createButton(`@`, `auto-pickup`);
var BUTTON_PACKWEIGHT = createButton(`g`, `pack weight`);
var BUTTON_VERSION = createButton(`v`, `version`);
var BUTTON_SCORES = createButton(`z`, `scores`);
var BUTTON_TAXES = createButton(`P`, `taxes`);
var BUTTON_QUIT = createButton(`Q`, `quit`);
var BUTTON_SAVE = createButton(`S`, `save game`);
var BUTTON_MODE = createButton(`}`, `mode`);

// contextual buttons
var BUTTON_TAKE = createButton(`t`, `pick up`);
var BUTTON_DROP = createButton(`d`, `drop`);
var BUTTON_OPEN = createButton(`o`, `open`);
var BUTTON_CLOSE = createButton(`C`, `close`);
var BUTTON_TRAPS = createButton(`^`, `identify trap`);
var BUTTON_ENTER = createButton(`e`, `enter`);

var BUTTON_FOUNTAIN_TIDY = createButton(`f`, `tidy up`);
var BUTTON_FOUNTAIN_DRINK = createButton(`D`, `drink`);

var BUTTON_THRONE_PRY = createButton(`R`, `pry gems`);
var BUTTON_THRONE_SIT = createButton(`s`, `sit down`);

var BUTTON_ALTAR_PRAY = createButton(`p`, `pray`);
var BUTTON_ALTAR_DESECRATE = createButton(`A`, `desecrate`);

var BUTTON_UPSTAIRS = createButton(`<`, `go up`);
var BUTTON_DOWNSTAIRS = createButton(`>`, `go down`);

// keypad
var BUTTON_UP_LEFT = createButton(`y`, `↖`, `Y`);
var BUTTON_UP = createButton(`k`, `↑`, `K`);
var BUTTON_UP_RIGHT = createButton(`u`, `↗`, `U`);

var BUTTON_LEFT = createButton(`h`, `←`, `H`);
var BUTTON_NOMOVE = createButton(`.`, `.`);
var BUTTON_RIGHT = createButton(`l`, `→`, `L`);

var BUTTON_DOWN_LEFT = createButton(`b`, `↙`, `B`);
var BUTTON_DOWN = createButton(`j`, `↓`, `J`);
var BUTTON_DOWN_RIGHT = createButton(`n`, `↘`, `N`);

// stores
var BUTTON_EXIT = createButton(ESC, `exit`);
var BUTTON_CANCEL = createButton(ESC, `cancel`);
// bank
var BUTTON_DEPOSIT = createButton(`d`, `deposit`);
var BUTTON_WITHDRAW = createButton(`w`, `withdraw`);
var BUTTON_SELL = createButton(`s`, `sell`);
// lrs
var BUTTON_PAY_TAXES = createButton(`p`, `pay taxes`);
// thrift Shoppe
var BUTTON_YES = createButton(`y`, `yes`);
var BUTTON_NO = createButton(`n`, `no`);
// home
var BUTTON_SPACE_ENDGAME = createVariableButton(` `, `Congratulations! View Scoreboard`);



function is_touch_device() {
    return 'ontouchstart' in window || navigator.maxTouchPoints;
}



function createButton(key, label, repeat, style) {
    //var clickevent = `onclick='mousetrap(null, "${key}")'`;
    //var downevent = `onmousedown='mousetrap(null, "${key}")'`;
    //var doubleclickevent = doublekey ? `ondblclick='mousetrap(null, "${doublekey}")'` : ``;
    var clickevent;
    if (repeat) {

        if (is_touch_device()) {
            clickevent = `ontouchstart='larnmousedown("${key}")' ontouchend='larnmouseup()'`;
            document.ontouchend = larnmouseup; // to prevent issues with dragging offscreen (doesn't seem to work)
        } else {
            clickevent = `onmousedown='larnmousedown("${key}")'`;
            document.onmouseup = larnmouseup; // to prevent issues with dragging offscreen
        }

    } else {
        clickevent = `onclick='mousetrap(null, "${key}")'`;
    }
    if (!style) style = `'button'`;
    return `<button class=${style} ${clickevent}>${label}</button>`;
}



function createNarrowButton(key, label, repeat) {
    return createButton(key, label, false, `narrowbutton`);
}



function createVariableButton(key, label, repeat) {
    return createButton(key, label, false, `variablebutton`);
}



var LAST_MOUSE_BUTTON;
var MOUSE_DOWN_EVENT;
var MOUSE_EVENTS = 0;



function larnmousedown(key) {
    var LAST_MOUSE_BUTTON = key;
    mousetrap(null, LAST_MOUSE_BUTTON);
    MOUSE_DOWN_EVENT = setInterval(
        function() {
            if (MOUSE_EVENTS++ > 4)
                mousetrap(null, LAST_MOUSE_BUTTON);
        }, 50
    );
}



function larnmouseup() {
    clearInterval(MOUSE_DOWN_EVENT);
    MOUSE_EVENTS = 0;
}



function addButton(newButton) {
    BUTTONS += ` ` + newButton;
}



function newButtonRow() {
    BUTTONS += `<p>`;
}



function setButtons() {
    BUTTONS = '';

    if (!mobile) {
        if (player && mazeMode) {
            addButton(BUTTON_HELP);
            var hintsLabel = keyboard_hints ? `on` : `off`;
            var pickupLabel = auto_pickup ? `on` : `off`;
            var inventoryLabel = side_inventory ? `on` : `off`;
            var boldLabel = bold_objects ? `on` : `off`;
            var colorLabel = show_color ? `on` : `off`;
            addButton(createVariableButton(`!`, `Keyboard hints: ${hintsLabel}`));
            addButton(createVariableButton(`@`, `Auto pickup: ${pickupLabel}`));
            addButton(createVariableButton(`#`, `Show inventory: ${inventoryLabel}`));
            addButton(createVariableButton(`$`, `Show color: ${colorLabel}`));
            addButton(createVariableButton(`%`, `Bold objects: ${boldLabel}`));
        }
        setDiv(`FOOTER`, BUTTONS);
        return; // disable everything else for now
    }

    if (!player) {
        if (keyboard_input_callback === setname) {
            var name = KEYBOARD_INPUT ? KEYBOARD_INPUT : logname;
            addButton(createVariableButton(ENTER, name));
            newButtonRow();
            keyboardButtons();
        }
        if (keyboard_input_callback === startgame) {
            var difficulty = KEYBOARD_INPUT ? KEYBOARD_INPUT : getDifficulty();
            addButton(createButton(ENTER, difficulty));
            newButtonRow();
            numberButtons();
            newButtonRow();
            addButton(BUTTON_DEL);
        }
        setDiv(`FOOTER`, BUTTONS);
        return;
    }

    // TODO not complete
    if (keyboard_input_callback === act_donation_pray) {
        numberButtons();
        setDiv(`FOOTER`, BUTTONS);
        return;
    }

    var item = itemAt(player.x, player.y);


    if (mazeMode) {

        //newButtonRow();
        movementButtons();


        newButtonRow();
        if (player.SPELLS > 0 && newSpellCode == null) {
            addButton(BUTTON_CAST);
        }

        if (newSpellCode != null) {
            for (spellIndex = 0; spellIndex < player.knownSpells.length; spellIndex++) {
                if (player.knownSpells[spellIndex]) {
                    if (spellIndex % 5 == 0) newButtonRow();
                    addButton(createButton(spelcode[spellIndex], spelname[spellIndex]));
                }
            }
            newButtonRow();
            addButton(createButton(ESC, `cancel`));
            newButtonRow();
        }

        inventoryButtons(drop_object, showall);
        inventoryButtons(act_quaffpotion, showquaff);
        inventoryButtons(act_read_something, showread);
        inventoryButtons(act_eatcookie, showeat);
        inventoryButtons(wear, showwear); // need to handle taking off armour (wear '-'?)
        inventoryButtons(wield, showwield); // TODO should be canWield? // need to handle wielding '-'


        addButton(BUTTON_QUAFF); // TODO: only show when over/carrying potion
        addButton(BUTTON_READ); // TODO: only show when over/carrying scroll/book / disable when blind
        addButton(BUTTON_WIELD); // TODO: only show when over/carrying weapon
        addButton(BUTTON_WEAR); // TODO: only show when over/carrying armor
        newButtonRow();
        addButton(BUTTON_INVENTORY);
        addButton(BUTTON_EAT); // TODO: only show when over/carrying cookie
        addButton(BUTTON_TELEPORT); // TODO: only show when over level 10

        if (item.isStore()) {
            addButton(BUTTON_ENTER);
        }
        if (item.isWeapon()) {
            //addButton(BUTTON_WIELD);
        }
        if (item.isArmor()) {
            //addButton(BUTTON_WEAR);
        }
        if (item.matches(OPOTION)) {
            //addButton(BUTTON_QUAFF);
        }
        if (item.matches(OBOOK) || item.matches(OSCROLL)) {
            //addButton(BUTTON_READ);
        }
        if (item.matches(OCOOKIE)) {
            //addButton(BUTTON_EAT);
        }


        if (item.matches(OFOUNTAIN)) {
            addButton(BUTTON_FOUNTAIN_DRINK);
            addButton(BUTTON_FOUNTAIN_TIDY);
        }
        if (item.matches(OTHRONE)) {
            addButton(BUTTON_THRONE_PRY);
            addButton(BUTTON_THRONE_SIT);
        }
        if (item.matches(ODEADTHRONE)) {
            addButton(BUTTON_THRONE_SIT);
        }
        if (item.matches(OALTAR)) {
            addButton(BUTTON_ALTAR_PRAY);
            addButton(BUTTON_ALTAR_DESECRATE);
        }
        if (item.matches(OSTAIRSUP)) {
            addButton(BUTTON_UPSTAIRS);
        }
        if (item.matches(OSTAIRSDOWN)) {
            addButton(BUTTON_DOWNSTAIRS);
        }
        if (item.carry && !pocketfull()) {
            addButton(BUTTON_TAKE);
        }
        if (item.matches(OEMPTY)) {
            // TODO: need to deal with invisible traps
            // TODO: don't show if not carrying anything
            addButton(BUTTON_DROP);
        }
        if (nearPlayer(OCLOSEDDOOR) || nearPlayer(OCHEST)) {
            addButton(BUTTON_OPEN);
        }
        if (nearPlayer(OOPENDOOR)) {
            addButton(BUTTON_CLOSE);
        }

    } else {
        if (keyboard_input_callback) console.log(`kbd`, keyboard_input_callback.name);
        if (blocking_callback) console.log(`callback`, blocking_callback.name);

        if (item.matches(OBANK) || item.matches(OBANK2)) {
            if (blocking_callback === bank_parse) {
                addButton(BUTTON_DEPOSIT);
                addButton(BUTTON_WITHDRAW);
                addButton(BUTTON_SELL);
            }
            if (keyboard_input_callback === bank_deposit) {
                addButton(createButton(ENTER, `deposit ${KEYBOARD_INPUT}`));
                addButton(createButton(`*`, `deposit all`));
                addButton(BUTTON_CANCEL);
                newButtonRow();
                numberButtons();
            }
            if (keyboard_input_callback === bank_withdraw) {
                addButton(createButton(ENTER, `withdraw ${KEYBOARD_INPUT}`));
                addButton(createButton(`*`, `withdraw all`));
                addButton(BUTTON_CANCEL);
                newButtonRow();
                numberButtons();
            }
            if (blocking_callback === bank_sell) {
                addButton(BUTTON_CANCEL);
                addButton(createButton(`*`, `sell all`));
                newButtonRow();
                alphaButtons(false);
            }
            newButtonRow();
        }

        if (item.matches(OLRS)) {
            if (blocking_callback === parse_lrs) {
                addButton(BUTTON_PAY_TAXES);
            } else if (keyboard_input_callback === parse_lrs_pay) {
                addButton(createButton(ENTER, `pay ${KEYBOARD_INPUT}`));
                addButton(BUTTON_CANCEL);
                newButtonRow();
                numberButtons();
            }
        }

        if (item.matches(ODNDSTORE)) {
            if (blocking_callback === dnd_parse) {
                alphaButtons(false);
            }
        }

        if (item.matches(OSCHOOL)) {
            if (blocking_callback === parse_class) {
                alphaButtons(false, 8);
            }
        }

        if (item.matches(OTRADEPOST)) {
            if (blocking_callback === parse_tradepost) {
                var numbuttons = 0;
                for (var i = 0; i < player.inventory.length; i++) {
                    if (player.inventory[i] != null) {
                        var label = getCharFromIndex(i);
                        addButton(createNarrowButton(label, label));
                        if (++numbuttons == 13) newButtonRow();
                    }
                }
            }
            if (blocking_callback === parse_sellitem) {
                addButton(BUTTON_YES);
                addButton(BUTTON_NO);
            }
        }


        newButtonRow();
        addButton(BUTTON_EXIT);


    }

    if (BUTTONS === ``) {
        addButton(BUTTON_SCORES);
    }

    setDiv(`FOOTER`, BUTTONS);


}



function inventoryButtons(callback, filter) {
    if (blocking_callback === callback) {
        console.log(callback.name);
        newButtonRow();
        var inv = showinventory(false, callback, filter, false, false, false);
        for (i = 0; i < inv.length; i++) {
            newButtonRow();
            var params = inv[i];
            addButton(createVariableButton(params[0], params[1]));
            newButtonRow();
        }
        addButton(createButton(ESC, `cancel`));
        newButtonRow();
    }
}



function movementButtons() {
    addButton(BUTTON_UP_LEFT);
    addButton(BUTTON_UP);
    addButton(BUTTON_UP_RIGHT);
    newButtonRow();
    addButton(BUTTON_LEFT);
    addButton(BUTTON_NOMOVE);
    addButton(BUTTON_RIGHT);
    newButtonRow();
    addButton(BUTTON_DOWN_LEFT);
    addButton(BUTTON_DOWN);
    addButton(BUTTON_DOWN_RIGHT);
}



function numberButtons() {
    for (var i = 1; i < 10; i++) {
        addButton(createNarrowButton(i, i));
    }
    addButton(createNarrowButton(0, 0));
}



function alphaButtons(uppercase, max) {
    if (!max) max = 26;
    var index = uppercase ? `A` : `a`;
    for (var i = 1; i <= max; i++, index = index.nextChar()) {
        addButton(createNarrowButton(index, index));
        if (i % 13 == 0) newButtonRow();
    }
}



function keyboardButtons() {
    // const keyboard_keys = [`qwertyuiop`, `asdfghjkl`, `zxcvbnm`];
    // for (var i = 0; i < keyboard_keys.length; i++) {
    //     var keys = keyboard_keys[i];
    //     for (var key = 0; key < keys.length; key++) {
    //         addButton(createNarrowButton(keys.charAt(key), keys.charAt(key)));
    //     }
    //     newButtonRow();
    // }
    alphaButtons(UPPERCASE);
    addButton(BUTTON_CAPS);
    addButton(BUTTON_SPACE);
    addButton(BUTTON_DEL);
}
