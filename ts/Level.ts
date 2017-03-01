
// Player and boss
var enemies: Enemy[] = [];
var bullets: Bullet[] = [];
var player: Player;
var loadedLevel: number;
var doIntro: boolean;


var pauseScreen: PIXI.Container;
function addBulletToStage(sprite: PIXI.DisplayObject) {
    stage.addChildAt(sprite, stage.getChildIndex(separatorGraphics));
}
var separatorGraphics: PIXI.Graphics;
function startLevel(level: number) {
    loadedLevel = level;
    doIntro = true;
    reset();
}
var INTRO_TIME = 240;
var animatedEntities: PIXI.extras.AnimatedSprite[];
function reset() {
    stage.removeChildren();
    separatorGraphics = new PIXI.Graphics();
    stage.addChild(separatorGraphics);
    bullets = [];
    enemies = [];
    animatedEntities = [];
    player = new Player(doIntro);
    spawnBosses(loadedLevel, doIntro);
    gameEnded = false;
    playerBar = new PlayerBar();
    // FPS    
    basicText = new PIXI.Text("FPS: ?");
    basicText.x = 10;
    basicText.y = 10;
    stage.addChild(basicText);

    // Apply difficulty settings
    applyDifficultySettings();

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
    var pauseText2 = new PIXI.Text("Press any game key to continue.");
    pauseText2.style.fontSize = 22;
    pauseText2.style.fill = 0xFFFFFF;
    pauseText2.anchor.x = 0.5;
    pauseText2.anchor.y = 0.5;
    pauseText2.x = WIDTH / 2;
    pauseText2.y = HEIGHT / 2 + 35;
    pauseScreen.addChild(pauseText2);
}
function spawnBosses(level : number, doIntro : boolean) {
    var frammes: PIXI.Texture[] = [];
    for (var i = 0; i < 8; i++) {
        frammes.push(PIXI.Texture.fromImage('img/eye/eye' + i + '.png'));
    }
    var enemySprite = new PIXI.extras.AnimatedSprite(frammes);
    enemySprite.x = WIDTH / 2;
    enemySprite.y = HEIGHT * 1 / 5;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    enemySprite.animationSpeed = 0.2;
    enemySprite.play();
    animatedEntities.push(enemySprite);
    var boss: Enemy = new Enemy(enemySprite, new CircleCollider(143), createEyeBoss());
    boss.hp = 800;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp);
    
    if (doIntro) {
        enemySprite.y = - HEIGHT * 3 / 5;
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
    stage.addChild(enemySprite);
    enemies = [boss];
}