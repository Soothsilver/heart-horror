function openMenu() {
    $("#mainmenu").show();
}
function giveUp() {
    gameLost();
    openMenu();
}
function pause() {
    paused = true;
    ticker.speed = 0;
}
function unpause() {
    if (paused) {
        paused = false;
        ticker.speed = 1;
    }
}
function togglePause() {
    if (paused) {
        unpause();
    } else {
        pause();
    }
}
function toggleAutoFire() {
    autofire = !autofire;
}
$(window).blur(function () {
    pause();
});
buttons.esc.release = giveUp;
buttons.p.release = togglePause;
buttons.pause.release = togglePause;
buttons.space.release = toggleAutoFire;