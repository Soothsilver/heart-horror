
// Player and boss
var enemies: Enemy[] = [];
var bullets: Bullet[] = [];
var hud: Inscription[] = [];
var player: Player;
var loadedLevel: number = -1;
var doIntro: boolean;


var pauseScreen: PIXI.Container = new PIXI.Container();
function addBulletToStage(sprite: PIXI.DisplayObject) {
    stage.addChildAt(sprite, stage.getChildIndex(separatorGraphics));
}
var separatorGraphics: PIXI.Graphics;
function startLevel(level: number) {
    loadedLevel = level;
    doIntro = !skipIntro;
    reset();
}
var INTRO_TIME = 240;
var animatedEntities: PIXI.extras.AnimatedSprite[] = [];


function openLevelsUpTo(maxlevel: number) {
    for (var i: number = 0; i < 6; i++) {
        if (i > maxlevel + 1) {
            continue;
        }
        $("#lvl" + i).prop("disabled", false);
    }
}
function reloadAccessibleLevels() {
    var n: number = parseInt(window.localStorage.getItem("level"));
    if (isNaN(n)) {
        openLevelsUpTo(-1);
    } else {
        openLevelsUpTo(n);
    }
}

var DIFFICULTY_EASIEST = 1;
var DIFFICULTY_EASY = 2;
var DIFFICULTY_NORMAL = 3;
var DIFFICULTY_HARD = 4;
var DIFFICULTY_FRUSTRATING = 5;
function reloadDifficulty() {
    difficulty = parseInt(window.localStorage.getItem("difficulty"));
    console.log("D");
    console.log(difficulty);
    if (isNaN(difficulty)) {
        difficulty = DIFFICULTY_NORMAL;
        console.log(difficulty);
    }
    $("#difficulty").val(difficulty);
}
function saveLevelAsCompleted(level: number) {
    var n: number = parseInt(window.localStorage.getItem("level"));
    if (level > n || isNaN(n)) {
        window.localStorage.setItem("level", level.toString());
    }
    reloadAccessibleLevels();
}
function bossDefeated() {
    numberOfBossesRemaining--;
    if (numberOfBossesRemaining <= 0) {
        clearEnemies();
        clearEnemyBullets();
        gameEnded = true;
        saveLevelAsCompleted(loadedLevel);
        for (var en of enemies) {
            en.harmless = true;
        }
        showCongratulationsScreen();
    }
}
function gameLost() {
    gameEnded = true;
    clearFriendlyBullets();
    playerBar.remove();
    showDefeatedScreen();
}

function clearFriendlyBullets() {
    for (var en of bullets) {
        if (en.friendly)
            en.fadeout();
    }
}
function clearEnemies() {
    for (var en of enemies) {
        if (!en.isBoss) {
            en.fadeout();
        }
    }
}
function clearEnemyBullets() {
    for (var en of bullets) {
        if (!en.friendly)
            en.fadeout();
    }
}

var dateOfStart: Date;

function reset() {
    stage.removeChildren();
    bullets = [];
    enemies = [];
    animatedEntities = [];
    if (loadedLevel >= 0) {
        player = new Player(doIntro);
        spawnBosses(loadedLevel, doIntro);
        gameEnded = false;
        numberOfBossesRemaining = 1;
        playerBar = new PlayerBar();
        dateOfStart = new Date();
        // FPS    
        basicText = new PIXI.Text("FPS: ?");
        basicText.x = 10;
        basicText.y = 10;
        stage.addChild(basicText);

        // Apply difficulty settings
        applyDifficultySettings();

        separatorGraphics = new PIXI.Graphics();
        stage.addChild(separatorGraphics);

        // Pause
        pauseScreen = new PIXI.Container();
        pauseScreen.x = 0;
        pauseScreen.y = 0;
        var darkenEverything = new PIXI.Graphics();
        darkenEverything.beginFill(0x000000, 0.6);
        darkenEverything.lineStyle(0);
        darkenEverything.drawRect(0, 0, WIDTH, HEIGHT);
        darkenEverything.endFill();
        pauseScreen.addChild(darkenEverything);
        var pauseText = new PIXI.Text("PAUSED");
        pauseText.style.fontSize = 36;
        pauseText.style.fill = 0xFFFFFF;
        pauseText.anchor.x = 0.5;
        pauseText.anchor.y = 0.5;
        pauseText.x = WIDTH / 2;
        pauseText.y = HEIGHT / 2;
        pauseScreen.addChild(pauseText);
        var pauseText2 = new PIXI.Text("Click here or press any game key to continue.");
        pauseText2.style.fontSize = 22;
        pauseText2.style.fill = 0xFFFFFF;
        pauseText2.anchor.x = 0.5;
        pauseText2.anchor.y = 0.5;
        pauseText2.x = WIDTH / 2;
        pauseText2.y = HEIGHT / 2 + 35;
        pauseScreen.addChild(pauseText2);
    }
}
function spawnBosses(level : number, doIntro : boolean) {

    var boss: Enemy = Levels.getLevel(level).bossCreation();
    if (doIntro) {
        boss.sprite.y = - HEIGHT * 3 / 5;
        boss.pattern = new SequencePattern([
            new OneShot(() => {
                var introbar = new PIXI.Container();
                var bar = new PIXI.Sprite(PIXI.Texture.fromImage("img/introLine.png"));
                bar.anchor.x = 0.5;
                bar.anchor.y = 0.5;
                bar.x = WIDTH / 2;
                bar.y = HEIGHT / 2;
                introbar.addChild(bar);
                var pauseText = new PIXI.Text(Levels.getLevel(level).bossname);
                pauseText.style.fontSize = 28;
                pauseText.style.fill = 0x000000;
                pauseText.anchor.x = 0.5;
                pauseText.anchor.y = 0.5;
                pauseText.x = WIDTH / 2;
                pauseText.y = HEIGHT / 2 - 16;
                introbar.addChild(pauseText);
                var pauseText2 = new PIXI.Text(Levels.getLevel(level).subCaption);
                pauseText2.style.fontSize = 24;
                pauseText2.style.fill = 0x000000;
                pauseText2.anchor.x = 0.5;
                pauseText2.anchor.y = 0.5;
                pauseText2.x = WIDTH / 2;
                pauseText2.y = HEIGHT / 2 + 18;
                introbar.addChild(pauseText2);
                introbar.alpha = 0;
                var b = new Bullet(false, introbar, new RectangleCollider(0, 0),
                    new SequencePattern([
                        new AppearingPattern(INTRO_TIME / 8),
                        new FixedDuration(INTRO_TIME * 3 / 4),
                        new DisappearingPattern(INTRO_TIME / 8)
                        ])
                );
                b.harmless = true;
                bullets.push(b);
                stage.addChild(b.sprite);
            }),
            new SimpleMove(0, HEIGHT * 4 / 5, INTRO_TIME * 3 / 4),
            new FixedDuration(INTRO_TIME * 1 /4),
            boss.pattern
        ]);
    }
    stage.addChild(boss.sprite);
    enemies = [boss];
}