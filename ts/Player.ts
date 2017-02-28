var SPEED = 7;
var temporaryGraphics: PIXI.Graphics;
function spawnBullet(bullet: Bullet) {
    bullets.push(bullet);
    app.stage.addChild(bullet.sprite);
}
var BULLET_SPEED = 10;
var gameEnded: boolean;

function gameWon() {
    gameEnded = true;
    bossBar.remove();
}
function gameLost() {
    gameEnded = true;
    playerBar.remove();
}

var PLAYER_HP = 5;
class Player extends Item {
    hp: number = PLAYER_HP;
    indestructible: boolean;
    indestructibilityTicks: number;
    fireDelay: number = 0;
    public loseHP(damage : number) {
        this.hp -= damage;
        this.indestructible = true;
        this.indestructibilityTicks = 120;
        this.sprite.alpha = 0.3;
        if (this.hp <= 0) {
            this.gone = true;
            gameLost();
        }
    }
    public attemptFire() {
        if (this.fireDelay > 5) {
            for (var i = 0; i < 2; i++) {
                var bulletSprite = new PIXI.Sprite(PIXI.Texture.fromImage('img/playerBullet.png'));
                bulletSprite.x = player.sprite.x + (i == 0 ? -30 : 30);
                bulletSprite.y = player.sprite.y;
                bulletSprite.anchor.x = 0.5;
                bulletSprite.anchor.y = 0.5;
                spawnBullet(new Bullet(true, bulletSprite, new RectangleCollider(), new UniformMovementPattern(0, -BULLET_SPEED)));
            }
            this.fireDelay = 0;
        }
    }
    public bindSpriteInScreen() {
        if (this.sprite.x < 0) this.sprite.x = 0;
        if (this.sprite.y < 0) this.sprite.y = 0;
        if (this.sprite.x > app.view.width) this.sprite.x = app.view.width;
        if (this.sprite.y > app.view.height) this.sprite.y = app.view.height;
    }
    public update(delta: number) {
        super.update(delta);
        this.fireDelay += delta;
        if (this.indestructible) {
            this.indestructibilityTicks -= delta;
            if (this.indestructibilityTicks < 0) {
                this.indestructible = false;
                this.sprite.alpha = 1;
            }
        }
    }
    constructor() {
        super(null, new CircleCollider(4), new StandingPattern());
        var texture = PIXI.Texture.fromImage('img/ship.png');
        var playerSprite = new PIXI.Sprite(texture);
        playerSprite.anchor.x = 0.5;
        app.stage.addChild(playerSprite);
        playerSprite.anchor.y = 0.65;
        playerSprite.x = app.view.width / 2;
        playerSprite.y = app.view.height * 3 / 4;
        playerSprite.width = 64;
        playerSprite.height = 64;
        this.sprite = playerSprite;
    }
}