
var menuOpen: boolean = false;
function openMenu() {
    menuOpen = true;
    $("#mainmenu").show(100);
}
function giveUp() {
    if (menuOpen) {
        resume();
    }
    else {
        pause();
        openMenu();
    }
}
function resume() {
    $("#controls").hide();
    $("#howToPlay").hide();
    $("#mainmenu").hide(100);
    menuOpen = false;
}
function openLevel(level: number) {
    resume();
    startLevel(level);
    unpause();
}
function fastReset() {
    doIntro = false;
    reset();
}
function changeSkipConfirmation() {
    var skip = $('#skipConfirmation').is(":checked");
    window.localStorage.setItem("skipConfirmation", skip ? "yes" : "no");
    skipIntro = skip;
}
function reloadSkipConfirmation() {
    var shouldSkip : boolean = window.localStorage.getItem("skipConfirmation") == "yes";
    $("#skipConfirmation").prop('checked', shouldSkip);
    skipIntro = shouldSkip;
}
function pause() {
    if (!paused) {
        paused = true;
        ticker.speed = 0;
        stage.addChild(pauseScreen);
        for (var e of animatedEntities) {
            e.stop();
        }
    }
}
function unpause() {
    if (paused && !menuOpen) {
        paused = false;
        ticker.speed = 1;
        stage.removeChild(pauseScreen);
        for (var e of animatedEntities) {
            e.play();
        }
    }
}
function togglePause() {
    if (paused) {
        unpause();
    } else {
        pause();
    }
}
function showControls() {
    $("#controls").show(100);
}
function showHowToPlay() {
    $("#howToPlay").show(100);
}
function toggleAutoFire() {
    autofire = !autofire;
}
$(window).blur(function () {
    if (pauseWhenClickOut) {
        pause();
    }
});
buttons.esc.release = giveUp;
buttons.p.release = togglePause;
buttons.pause.release = togglePause;
buttons.space.release = toggleAutoFire;