var SPEED = 7;
var temporaryGraphics: PIXI.Graphics;
function spawnBullet(bullet: Bullet) {
    bullets.push(bullet);
    addBulletToStage(bullet.sprite);
}
var BULLET_SPEED = 10;
var gameEnded: boolean;

function gameWon() {
    clearEnemies()
    clearBullets();
    gameEnded = true;
}
function gameLost() {
    gameEnded = true;
    clearBullets();
    playerBar.remove();
}
function clearEnemies() {
    for (var en of enemies) {
        en.fadeout();
    }
}
function clearBullets() {
    for (var en of bullets) {
        en.fadeout();
    }
}

var PLAYER_HP = 5;
class Player extends Item {
    hp: number = PLAYER_HP;
    controllable: boolean = true;
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
                spawnBullet(new Bullet(true, bulletSprite, new RectangleCollider(bulletSprite.width, bulletSprite.height), new UniformMovementPattern(0, -BULLET_SPEED)));
            }
            this.fireDelay = 0;
        }
    }
    public bindSpriteInScreen() {
        if (this.sprite.x < 0) this.sprite.x = 0;
        if (this.sprite.y < 0) this.sprite.y = 0;
        if (this.sprite.x > WIDTH) this.sprite.x = WIDTH;
        if (this.sprite.y > HEIGHT) this.sprite.y = HEIGHT;
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
    constructor(doIntro : boolean) {
        super(null, new CircleCollider(4), new StandingPattern());
        var texture = PIXI.Texture.fromImage('img/ship.png');
        var playerSprite = new PIXI.Sprite(texture);
        playerSprite.anchor.x = 0.5;
        stage.addChild(playerSprite);
        playerSprite.anchor.y = 0.65;
        playerSprite.x = WIDTH / 2;
        if (doIntro) {
            playerSprite.y = HEIGHT * 5 / 4;
            this.controllable = false;
            this.pattern = new SimpleMove(0, -HEIGHT * 2 / 4, INTRO_TIME).Then(new OneShot((self) => this.controllable = true));
        }
        else {
            playerSprite.y = HEIGHT * 3 / 4;
        }
        playerSprite.width = 64;
        playerSprite.height = 64;
        this.sprite = playerSprite;
    }
}