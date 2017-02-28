function keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function (event) {
        if (buttons.handledKeys.indexOf(event.keyCode) == -1)
            return;
        if (event.keyCode === key.code) {
            if (key.isUp && key.press)
                key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };
    //The `upHandler`
    key.upHandler = function (event) {
        if (buttons.handledKeys.indexOf(event.keyCode) == -1)
            return;
        if (event.keyCode === key.code) {
            if (key.isDown && key.release)
                key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };
    //Attach event listeners
    window.addEventListener("keydown", key.downHandler.bind(key), false);
    window.addEventListener("keyup", key.upHandler.bind(key), false);
    return key;
}
var buttons = {
    handledKeys: [37, 39, 40, 38, 65, 17, 113, 32, 82],
    left: keyboard(37),
    right: keyboard(39),
    down: keyboard(40),
    up: keyboard(38),
    control: keyboard(17),
    a: keyboard(65),
    f2: keyboard(113),
    space: keyboard(32),
    r: keyboard(82)
};
//# sourceMappingURL=keyboard.js.map