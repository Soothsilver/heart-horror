var WIDTH = 1280;
var HEIGHT = 720;
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT, { backgroundColor: 0x1099bb });
var stage = new PIXI.Container();
var ticker = new PIXI.ticker.Ticker();
ticker.add(function () { return renderer.render(stage); });
ticker.start();
//renderer.resize(20, 20);
renderer.render(stage);
document.getElementById("viewport").appendChild(renderer.view);
// Player and boss
var enemies = [];
var bullets = [];
var player;
// Interface
var bossBar;
var playerBar;
var basicText;
var showColliders = false;
reset();
function createBulletSprite(x, y, img) {
    var sprite = PIXI.Sprite.fromImage("img/" + img);
    sprite.x = x;
    sprite.y = y;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    return sprite;
}
ticker.speed = 0.5;
buttons.f2.release = function () {
    showColliders = !showColliders;
    stage.removeChild(temporaryGraphics);
};
buttons.r.release = function () {
    reset();
};
var boss = enemies[0];
ticker.add(function (delta) {
    basicText.text = "FPS: " + ticker.FPS.toPrecision(2) + "\nBullets: " + bullets.length + "\nBoss: " + boss.pattern.explain();
    if (buttons.left.isDown) {
        player.sprite.x -= SPEED * delta;
    }
    if (buttons.right.isDown) {
        player.sprite.x += SPEED * delta;
    }
    if (buttons.up.isDown) {
        player.sprite.y -= SPEED * delta;
    }
    if (buttons.down.isDown) {
        player.sprite.y += SPEED * delta;
    }
    player.bindSpriteInScreen();
    if (!gameEnded) {
        if (buttons.a.isDown || buttons.control.isDown || buttons.space.isDown) {
            player.attemptFire();
        }
    }
    if (showColliders) {
        stage.removeChild(temporaryGraphics);
        temporaryGraphics = new PIXI.Graphics();
    }
    for (var i = enemies.length - 1; i >= 0; i--) {
        var enemy = enemies[i];
        enemy.update(delta);
        if (showColliders) {
            enemy.collider.draw(temporaryGraphics, 0xFF0000);
        }
        if (enemy.isOutOfGame()) {
            stage.removeChild(enemy.sprite);
            enemies.splice(i, 1);
        }
    }
    for (var i = bullets.length - 1; i >= 0; i--) {
        var bullet = bullets[i];
        bullet.update(delta);
        if (showColliders) {
            bullet.collider.draw(temporaryGraphics, bullet.friendly ? Colors.LightGreen : 0xFF0000);
        }
        if (bullet.isOutOfGame()) {
            stage.removeChild(bullet.sprite);
            bullets.splice(i, 1);
        }
    }
    player.update(delta);
    if (player.isOutOfGame()) {
        stage.removeChild(player.sprite);
    }
    if (showColliders) {
        player.collider.draw(temporaryGraphics, Colors.LuminousGreen);
    }
    if (enemies.length > 0) {
        bossBar.update(enemies[0].hp);
    }
    playerBar.update(player.hp);
    if (showColliders) {
        stage.addChild(temporaryGraphics);
    }
});
//# sourceMappingURL=main.js.map