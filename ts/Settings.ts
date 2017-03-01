var autofire: boolean;
var paused = false;
var DIFFICULTY_EASIEST = 1;
var DIFFICULTY_EASY = 2;
var DIFFICULTY_NORMAL = 3;
var DIFFICULTY_HARD = 4;
var DIFFICULTY_FRUSTRATING = 5;
var skipIntro: boolean = false;
var pauseWhenClickOut: boolean = true;

function changeDifficulty() {
    difficulty = parseInt($("#difficulty").val());
    stage.removeChildren();
    // TODO
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
            player.hp = 3;
            for (var en of enemies) {
                en.hp = 6 / 5 * en.hp;
                en.bossbar.maxHP = en.hp;
            }
            break;
        case DIFFICULTY_FRUSTRATING:
            player.hp = 2;
            for (var en of enemies) {
                en.hp = 7 / 5 * en.hp;
                en.bossbar.maxHP = en.hp;
            }
            break;
        
    }
    playerBar.maxHP = player.hp;
}