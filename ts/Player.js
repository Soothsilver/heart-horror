var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SPEED = 7;
var temporaryGraphics;
function spawnBullet(bullet) {
    bullets.push(bullet);
    stage.addChild(bullet.sprite);
}
var BULLET_SPEED = 10;
var gameEnded;
function gameWon() {
    gameEnded = true;
    bossBar.remove();
}
function gameLost() {
    gameEnded = true;
    playerBar.remove();
}
var PLAYER_HP = 5;
var Player = (function (_super) {
    __extends(Player, _super);
    function Player() {
        var _this = _super.call(this, null, new CircleCollider(4), new StandingPattern()) || this;
        _this.hp = PLAYER_HP;
        _this.fireDelay = 0;
        var texture = PIXI.Texture.fromImage('img/ship.png');
        var playerSprite = new PIXI.Sprite(texture);
        playerSprite.anchor.x = 0.5;
        stage.addChild(playerSprite);
        playerSprite.anchor.y = 0.65;
        playerSprite.x = WIDTH / 2;
        playerSprite.y = HEIGHT * 3 / 4;
        playerSprite.width = 64;
        playerSprite.height = 64;
        _this.sprite = playerSprite;
        return _this;
    }
    Player.prototype.loseHP = function (damage) {
        this.hp -= damage;
        this.indestructible = true;
        this.indestructibilityTicks = 120;
        this.sprite.alpha = 0.3;
        if (this.hp <= 0) {
            this.gone = true;
            gameLost();
        }
    };
    Player.prototype.attemptFire = function () {
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
    };
    Player.prototype.bindSpriteInScreen = function () {
        if (this.sprite.x < 0)
            this.sprite.x = 0;
        if (this.sprite.y < 0)
            this.sprite.y = 0;
        if (this.sprite.x > WIDTH)
            this.sprite.x = WIDTH;
        if (this.sprite.y > HEIGHT)
            this.sprite.y = HEIGHT;
    };
    Player.prototype.update = function (delta) {
        _super.prototype.update.call(this, delta);
        this.fireDelay += delta;
        if (this.indestructible) {
            this.indestructibilityTicks -= delta;
            if (this.indestructibilityTicks < 0) {
                this.indestructible = false;
                this.sprite.alpha = 1;
            }
        }
    };
    return Player;
}(Item));
//# sourceMappingURL=Player.js.map