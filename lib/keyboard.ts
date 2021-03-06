﻿function keyboard(keyCode): { code: number, isDown: boolean, isUp: boolean, press: Function, release: Function} {
    var key : any = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function (event) {
        if (buttons.handledKeys.indexOf(event.keyCode) == -1) return;
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        if (event.keyCode != 80 && event.keyCode != 19 && event.keyCode != 27) {
            if (!menuOpen) {
                unpause();
            }
        }
        event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = function (event) {
        if (buttons.handledKeys.indexOf(event.keyCode) == -1) return;
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
}
var buttons = {
    
    handledKeys: [37, 39, 40, 38, 65, 17, 113, 32, 82, 90, 16, 80, 19, 27, 70, 77],
    left: keyboard(37),
    right: keyboard(39),
    down: keyboard(40),
    up: keyboard(38),
    control: keyboard(17),
    a: keyboard(65),
    f2: keyboard(113),
    space: keyboard(32),
    r: keyboard(82),
    z: keyboard(90),
    shift: keyboard(16),
    p: keyboard(80),
    pause: keyboard(19),
    esc: keyboard(27),
    f: keyboard(70),
    m: keyboard(77)
};