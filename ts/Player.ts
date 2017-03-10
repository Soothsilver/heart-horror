var SPEED = 7;
var temporaryGraphics: PIXI.Graphics;
function spawnBullet(bullet: Bullet, sound : Sound = null) {
    if (gameEnded) {
        bullet.harmless = true;
    }
    bullets.push(bullet);
    addBulletToStage(bullet.sprite);
    if (sound != null) {
        playSfx(sound);
    }
}
var BULLET_SPEED = 10;
var gameEnded: boolean;
var numberOfBossesRemaining: number = 1;


var PLAYER_HP = 5;
class Player extends Item {
    hp: number = 1;//PLAYER_HP;
    maxHp: number = 1;//PLAYER_HP;
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
            this.fadeout();
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
            playSfx(sfxPlayerFire);
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
            if (this.indestructibilityTicks < 0 && !gameEnded) {
                this.indestructible = false;
                this.sprite.alpha = 1;
            }
        }
    }
    constructor(doIntro : boolean) {
        super(null, new CircleCollider(4), new StandingPattern());
        var texture = PIXI.Texture.fromImage('img/ship.png');
        var playerSprite = new PIXI.Sprite(texture);
        var container = new PIXI.Container();
        playerSprite.anchor.x = 0.5;
       // stage.addChild(playerSprite);
        playerSprite.anchor.y = 0.65;
        playerSprite.x = 0;
        playerSprite.y = 0;
        container.x = WIDTH / 2;
        if (doIntro) {
            container.y = HEIGHT * 5 / 4;
            this.controllable = false;
            this.pattern = new SimpleMove(0, -HEIGHT * 2 / 4, INTRO_TIME).Then(new OneShot((self) => this.controllable = true));
        }
        else {
            container.y = HEIGHT * 3 / 4;
        }
        playerSprite.width = 64;
        playerSprite.height = 64;
        var center = new PIXI.Graphics();
        center.lineStyle(2, Colors.GrassGreen);
        center.beginFill(0xFFFFFF);
        center.drawCircle(0, 0, 4);
        center.endFill();
        
        container.addChild(playerSprite);
        container.addChild(center);
        stage.addChild(container);
        this.sprite = container;
    }
}