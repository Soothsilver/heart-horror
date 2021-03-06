﻿var autofire: boolean;
var paused = false;
var DIFFICULTY_EASIEST = 1;
var DIFFICULTY_EASY = 2;
var DIFFICULTY_NORMAL = 3;
var DIFFICULTY_HARD = 4;
var DIFFICULTY_FRUSTRATING = 5;

function dif(easy: number, normal: number, hard: number) {
    switch (difficulty) {
        case DIFFICULTY_EASIEST:
        case DIFFICULTY_EASY:
            return easy;
        case DIFFICULTY_NORMAL:
            return normal;
        case DIFFICULTY_HARD:
        case DIFFICULTY_FRUSTRATING:
            return hard;
    }
}

var skipIntro: boolean = false;
var pauseWhenClickOut: boolean = true;

function changeDifficulty() {
    difficulty = parseInt($("#difficulty").val());
    unpause();
    reset();
    pause();
    window.localStorage.setItem("difficulty", difficulty.toString());
}
function loadLocalStorage() {
    reloadAccessibleLevels();
    reloadDifficulty();
    reloadSkipConfirmation();
    musicMuted = window.localStorage.getItem("musicMuted") == "true";
    sfxMuted = window.localStorage.getItem("sfxMuted") === "false" ? false : true;
}
function enableAllStages() {
    if (confirm("Enable all stages that you haven't reached yet?")) {        
      saveLevelAsCompleted(10);
    }
}

function difficultyToString(difficulty: number): string {
    switch (difficulty) {
        case DIFFICULTY_EASIEST: return "EASIEST";
        case DIFFICULTY_EASY: return "EASY";
        case DIFFICULTY_NORMAL: return "NORMAL";
        case DIFFICULTY_HARD: return "HARD";
        case DIFFICULTY_FRUSTRATING: return "FRUSTRATING";
    }
}
function applyDifficultySettings() {
    switch (difficulty) {
        case DIFFICULTY_EASIEST:
            player.hp = 12;
            for (var en of enemies) {
                en.hp = 4 / 5 * en.hp;
            }
            break;
        case DIFFICULTY_EASY:
            player.hp = 8;
            break;
        case DIFFICULTY_NORMAL:
            player.hp = 5;
            break;
        case DIFFICULTY_HARD:
            player.hp = 5;
            for (var en of enemies) {
                en.bossbar.maxHP = en.hp;
            }
            break;
        case DIFFICULTY_FRUSTRATING:
            player.hp = 5;
            for (var en of enemies) {
                en.hp = 6 / 5 * en.hp;
                en.bossbar.maxHP = en.hp;
            }
            break;
        
    }
    playerBar.maxHP = player.hp;
    player.maxHp = player.hp;
}