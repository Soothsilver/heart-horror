
function reset() {
    app.stage.removeChildren();
    bullets = [];
    enemies = [];
    spawnBoss();
    player = new Player();
    bossBar = new BossBar(enemies[0].hp);
    playerBar = new PlayerBar();
    gameEnded = false;
    // FPS
    basicText = new PIXI.Text("FPS: ?");
    basicText.x = 10;
    basicText.y = 10;
    app.stage.addChild(basicText);
}
function spawnBoss() {
    var frammes: PIXI.Texture[] = [];
    for (var i = 0; i < 8; i++) {
        frammes.push(PIXI.Texture.fromImage('img/eye/eye' + i + '.png'));
    }
    var enemySprite = new PIXI.extras.AnimatedSprite(frammes);
    enemySprite.x = app.view.width / 2;
    enemySprite.y = app.view.height * 1 / 5;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    enemySprite.animationSpeed = 0.2;
    enemySprite.play();
    var boss: Enemy = new Enemy(enemySprite, new CircleCollider(143), createEyeBoss());
    boss.hp = 800;
    app.stage.addChild(enemySprite);
    enemies = [boss];
}