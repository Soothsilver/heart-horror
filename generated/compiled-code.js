var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
function keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    key.downHandler = function (event) {
        if (buttons.handledKeys.indexOf(event.keyCode) == -1)
            return;
        if (event.keyCode === key.code) {
            if (key.isUp && key.press)
                key.press();
            key.isDown = true;
            key.isUp = false;
        }
        if (event.keyCode != 80 && event.keyCode != 19 && event.keyCode != 27) {
            if (!menuOpen) {
                unpause();
            }
        }
        event.preventDefault();
    };
    key.upHandler = function (event) {
        if (buttons.handledKeys.indexOf(event.keyCode) == -1)
            return;
        if (event.keyCode === key.code) {
            if (key.isDown && key.release)
                key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };
    window.addEventListener("keydown", key.downHandler.bind(key), false);
    window.addEventListener("keyup", key.upHandler.bind(key), false);
    return key;
}
var buttons = {
    handledKeys: [37, 39, 40, 38, 65, 17, 113, 32, 82, 90, 16, 80, 19, 27, 70, 77],
    left: keyboard(37),
    right: keyboard(39),
    down: keyboard(40),
    up: keyboard(38),
    control: keyboard(17),
    a: keyboard(65),
    f2: keyboard(113),
    space: keyboard(32),
    r: keyboard(82),
    z: keyboard(90),
    shift: keyboard(16),
    p: keyboard(80),
    pause: keyboard(19),
    esc: keyboard(27),
    f: keyboard(70),
    m: keyboard(77)
};
var enemies = [];
var bullets = [];
var hud = [];
var player;
var loadedLevel = -1;
var doIntro;
var pauseScreen = new PIXI.Container();
function addBulletToStage(sprite) {
    stage.addChildAt(sprite, stage.getChildIndex(separatorGraphics));
}
var separatorGraphics;
function startLevel(level) {
    loadedLevel = level;
    doIntro = !skipIntro;
    reset();
}
var INTRO_TIME = 240;
var animatedEntities = [];
function openLevelsUpTo(maxlevel) {
    for (var i = 0; i < 6; i++) {
        if (i > maxlevel + 1) {
            continue;
        }
        $("#lvl" + i).prop("disabled", false);
    }
}
function reloadAccessibleLevels() {
    var n = parseInt(window.localStorage.getItem("level"));
    if (isNaN(n)) {
        openLevelsUpTo(-1);
    }
    else {
        openLevelsUpTo(n - 1);
    }
}
var DIFFICULTY_EASIEST = 1;
var DIFFICULTY_EASY = 2;
var DIFFICULTY_NORMAL = 3;
var DIFFICULTY_HARD = 4;
var DIFFICULTY_FRUSTRATING = 5;
function reloadDifficulty() {
    difficulty = parseInt(window.localStorage.getItem("difficulty"));
    if (isNaN(difficulty)) {
        difficulty = DIFFICULTY_NORMAL;
    }
    $("#difficulty").val(difficulty);
}
function saveLevelAsCompleted(level) {
    var n = parseInt(window.localStorage.getItem("level"));
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
        for (var _i = 0, enemies_1 = enemies; _i < enemies_1.length; _i++) {
            var en = enemies_1[_i];
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
    for (var _i = 0, bullets_1 = bullets; _i < bullets_1.length; _i++) {
        var en = bullets_1[_i];
        if (en.friendly)
            en.fadeout();
    }
}
function clearEnemies() {
    for (var _i = 0, enemies_2 = enemies; _i < enemies_2.length; _i++) {
        var en = enemies_2[_i];
        if (!en.isBoss) {
            en.fadeout();
        }
    }
}
function clearEnemyBullets() {
    for (var _i = 0, bullets_2 = bullets; _i < bullets_2.length; _i++) {
        var en = bullets_2[_i];
        if (!en.friendly)
            en.fadeout();
    }
}
var dateOfStart;
function reset() {
    stage.removeChildren();
    bullets = [];
    enemies = [];
    animatedEntities = [];
    if (loadedLevel >= 0) {
        player = new Player(doIntro);
        numberOfBossesRemaining = 1;
        spawnBosses(loadedLevel, doIntro);
        gameEnded = false;
        playerBar = new PlayerBar();
        dateOfStart = new Date();
        basicText = new PIXI.Text("FPS: ?");
        basicText.x = 2;
        basicText.y = 2;
        basicText.style.fontSize = 12;
        stage.addChild(basicText);
        applyDifficultySettings();
        separatorGraphics = new PIXI.Graphics();
        stage.addChild(separatorGraphics);
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
    resumeMusic();
}
function spawnBosses(level, doIntro) {
    var boss = Levels.getLevel(level).bossCreation();
    var boss2 = null;
    var double = Levels.getLevel(level).isDoubleBoss;
    if (double) {
        boss2 = Levels.getLevel(level).bossCreation2();
        numberOfBossesRemaining = 2;
    }
    if (level == 1) {
        var introtest = PIXI.Sprite.fromImage("img/introtest.png");
        introtest.x = 0;
        introtest.y = HEIGHT - 300;
        introtest.alpha = 0;
        stage.addChild(introtest);
        var introBullet = new Inscription(introtest, new SequencePattern([
            new AppearingPattern(INTRO_TIME / 8),
            new FixedDuration(INTRO_TIME * 3 / 4),
            new DisappearingPattern(INTRO_TIME / 8)
        ]));
        introBullet.harmless = true;
        hud.push(introBullet);
    }
    if (doIntro) {
        var originalY = boss.sprite.y;
        boss.sprite.y = -HEIGHT * 3 / 5;
        boss.pattern = new SequencePattern([
            new OneShot(function () {
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
                var b = new Bullet(false, introbar, new RectangleCollider(0, 0), new SequencePattern([
                    new AppearingPattern(INTRO_TIME / 8),
                    new FixedDuration(INTRO_TIME * 3 / 4),
                    new DisappearingPattern(INTRO_TIME / 8)
                ]));
                b.harmless = true;
                bullets.push(b);
                stage.addChild(b.sprite);
            }),
            new SimpleMove(0, HEIGHT * 4 / 5, INTRO_TIME * 3 / 4).Named("Boss enters the stage!"),
            new FixedDuration(INTRO_TIME * 1 / 4).Named("Get ready!"),
            boss.pattern
        ]);
        if (double) {
            var originalY = boss2.sprite.y;
            boss2.sprite.y = -HEIGHT * 3 / 5;
            boss2.pattern = new SequencePattern([
                new SimpleMove(0, HEIGHT * 4 / 5, INTRO_TIME * 3 / 4).Named("Boss enters the stage!"),
                new FixedDuration(INTRO_TIME * 1 / 4).Named("Get ready!"),
                boss2.pattern
            ]);
        }
    }
    stage.addChild(boss.sprite);
    if (double) {
        stage.addChild(boss2.sprite);
        enemies = [boss, boss2];
    }
    else {
        enemies = [boss];
    }
}
var WIDTH = 1280;
var HEIGHT = 720;
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT, { backgroundColor: 0x1099bb });
var stage = new PIXI.Container();
var ticker = new PIXI.ticker.Ticker();
ticker.add(function () { return renderer.render(stage); });
ticker.start();
renderer.render(stage);
$(document).ready(function () {
    document.getElementById("viewport").appendChild(renderer.view);
    loadLocalStorage();
    openMenu();
});
var playerBar;
var basicText;
var showColliders = false;
function createBulletSprite(x, y, img) {
    var sprite = PIXI.Sprite.fromImage("img/" + img);
    sprite.x = x;
    sprite.y = y;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    return sprite;
}
ticker.speed = 1;
buttons.f2.release = function () {
    showColliders = !showColliders;
    stage.removeChild(temporaryGraphics);
};
buttons.r.release = function () {
    fastReset();
};
buttons.m.release = function () {
    toggleMusic();
};
buttons.shift.press = function () {
    if (difficulty <= DIFFICULTY_EASY) {
        ticker.speed = 0.5;
    }
    else {
        ticker.speed = 1;
    }
};
buttons.shift.release = function () {
    ticker.speed = 1;
};
buttons.f.press = function () {
    ticker.speed = 2;
};
buttons.f.release = function () {
    ticker.speed = 1;
};
var difficulty = 3;
ticker.add(function (delta) {
    if (basicText != null) {
        basicText.text = "Difficulty: " + difficultyToString(difficulty) +
            "\nFPS: " + ticker.FPS +
            "\nBoss: " + Levels.getLevel(loadedLevel).bossname +
            "\n" + (enemies.length > 0 ? ("Boss: " + enemies[0].pattern.explain()) : "");
    }
    if (player != null) {
        if (player.controllable) {
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
                if (buttons.a.isDown || buttons.control.isDown || buttons.z.isDown || autofire) {
                    player.attemptFire();
                }
            }
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
    for (var i = hud.length - 1; i >= 0; i--) {
        var inscription = hud[i];
        inscription.update(delta);
        if (inscription.isOutOfGame()) {
            stage.removeChild(inscription.sprite);
            hud.splice(i, 1);
        }
    }
    if (player != null) {
        player.update(delta);
        if (player.isOutOfGame()) {
            stage.removeChild(player.sprite);
        }
        if (showColliders) {
            player.collider.draw(temporaryGraphics, Colors.LuminousGreen);
        }
        playerBar.update(player.hp);
    }
    for (var _i = 0, enemies_3 = enemies; _i < enemies_3.length; _i++) {
        var en = enemies_3[_i];
        if (en.bossbar != null) {
            en.bossbar.update(en.hp);
        }
    }
    if (showColliders) {
        stage.addChild(temporaryGraphics);
    }
});
var LifeBar = (function () {
    function LifeBar(name, color, maxHP, y) {
        this.x = WIDTH - 310;
        this.height = 30;
        this.width = 300;
        this.name = name;
        this.color = color;
        this.maxHP = maxHP;
        this.y = y;
        this.outline = new PIXI.Graphics();
        this.outline.lineStyle(2, Colors.PurpleViolet);
        this.outline.beginFill(Colors.PearlViolet);
        this.outline.drawRoundedRect(this.x, this.y, this.width, this.height, 8);
        this.outline.endFill();
        this.text = new PIXI.Text("Boss: ?");
        this.text.x = this.x + 50;
        this.text.y = this.y + 5;
        this.text.style.fontSize = 18;
        stage.addChild(this.text);
        stage.addChild(this.outline);
    }
    LifeBar.prototype.remove = function () {
        stage.removeChild(this.text);
        stage.removeChild(this.outline);
        stage.removeChild(this.graphics);
        this.ended = true;
    };
    LifeBar.prototype.update = function (bossHp) {
        if (this.ended)
            return;
        this.text.text = this.name + ": " + bossHp;
        stage.removeChild(this.text);
        stage.removeChild(this.graphics);
        var innere = new PIXI.Graphics();
        innere.lineStyle(0);
        innere.beginFill(this.color);
        innere.drawRoundedRect(this.x + 4, this.y + 4, (this.width - 8) * bossHp / this.maxHP, this.height - 8, 8);
        innere.endFill();
        this.graphics = innere;
        stage.addChild(this.graphics);
        stage.addChild(this.text);
    };
    return LifeBar;
}());
var BossBar = (function (_super) {
    __extends(BossBar, _super);
    function BossBar(maxhp, name, y) {
        if (name === void 0) { name = "Boss"; }
        if (y === void 0) { y = 50; }
        return _super.call(this, name, Colors.YellowOrange, maxhp, y) || this;
    }
    return BossBar;
}(LifeBar));
var Item = (function () {
    function Item(sprite, collider, pattern) {
        this.tags = {};
        this.sprite = sprite;
        this.collider = collider;
        this.collider.item = this;
        this.pattern = pattern;
    }
    Item.prototype.getTag = function (tag) {
        if (isNaN(this.tags[tag])) {
            return 0;
        }
        else {
            return this.tags[tag];
        }
    };
    Item.prototype.update = function (delta) {
        this.pattern.update(delta, this);
    };
    Item.prototype.x = function () {
        return this.sprite.x;
    };
    Item.prototype.y = function () {
        return this.sprite.y;
    };
    Item.prototype.fadeout = function () {
        this.harmless = true;
        this.pattern = new Both([this.pattern, new DisappearingPattern(30)]);
    };
    Item.prototype.isOutOfGame = function () {
        return this.sprite.x < -200 || this.sprite.y < -1000 || this.sprite.x > WIDTH + 200 || this.sprite.y > HEIGHT + 200 || this.gone;
    };
    return Item;
}());
var Bullet = (function (_super) {
    __extends(Bullet, _super);
    function Bullet(friendly, sprite, collider, pattern) {
        var _this = _super.call(this, sprite, collider, pattern) || this;
        _this.damage = 1;
        _this.friendly = friendly;
        return _this;
    }
    Bullet.prototype.update = function (delta) {
        _super.prototype.update.call(this, delta);
        if (!this.harmless) {
            if (this.friendly) {
                for (var _i = 0, enemies_4 = enemies; _i < enemies_4.length; _i++) {
                    var enemy = enemies_4[_i];
                    if (enemy.collider.intersects(this.collider)) {
                        enemy.loseHP(this.damage);
                        if (!this.indestructible) {
                            this.gone = true;
                        }
                    }
                }
            }
            else {
                if (!player.indestructible && player.collider.intersects(this.collider)) {
                    player.loseHP(this.damage);
                    if (!this.indestructible) {
                        this.gone = true;
                    }
                }
            }
        }
    };
    return Bullet;
}(Item));
var Collider = (function () {
    function Collider() {
    }
    return Collider;
}());
function clamp(value, min, max) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}
var Collisions = (function () {
    function Collisions() {
    }
    Collisions.CircleCircle = function (one, two) {
        var a = one.radius + two.radius;
        var dx = one.item.sprite.x - two.item.sprite.x;
        var dy = one.item.sprite.y - two.item.sprite.y;
        return a * a > (dx * dx + dy * dy);
    };
    Collisions.CircleRectangle = function (one, two) {
        var circleX = one.item.sprite.x;
        var circleY = one.item.sprite.y;
        var rect = two.getRectangle();
        var closestX = clamp(circleX, rect.x, rect.x + rect.width);
        var closestY = clamp(circleY, rect.y, rect.y + rect.height);
        var distanceX = circleX - closestX;
        var distanceY = circleY - closestY;
        var distanceSq = (distanceX * distanceX) + (distanceY * distanceY);
        return distanceSq < one.radius * one.radius;
    };
    Collisions.RectangleRectangle = function (one, two) {
        var rect1 = one.getRectangle();
        var rect2 = two.getRectangle();
        if (rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y) {
            return true;
        }
        return false;
    };
    return Collisions;
}());
var CircleCollider = (function (_super) {
    __extends(CircleCollider, _super);
    function CircleCollider(radius) {
        var _this = _super.call(this) || this;
        _this.radius = radius;
        return _this;
    }
    CircleCollider.prototype.draw = function (g, color) {
        g.lineStyle(2, color, 1);
        g.drawCircle(this.item.sprite.x, this.item.sprite.y, this.radius);
    };
    CircleCollider.prototype.intersects = function (other) {
        if (other instanceof CircleCollider) {
            return Collisions.CircleCircle(this, other);
        }
        if (other instanceof RectangleCollider) {
            return Collisions.CircleRectangle(this, other);
        }
        throw "ERROR";
    };
    return CircleCollider;
}(Collider));
var Rectangle = (function () {
    function Rectangle(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    return Rectangle;
}());
var RectangleCollider = (function (_super) {
    __extends(RectangleCollider, _super);
    function RectangleCollider(w, h) {
        var _this = _super.call(this) || this;
        _this.width = w;
        _this.height = h;
        return _this;
    }
    RectangleCollider.prototype.intersects = function (other) {
        if (other instanceof CircleCollider) {
            return Collisions.CircleRectangle(other, this);
        }
        if (other instanceof RectangleCollider) {
            return Collisions.RectangleRectangle(this, other);
        }
        throw "ERROR";
    };
    RectangleCollider.prototype.getRectangle = function () {
        return new Rectangle(this.item.sprite.x - this.width / 2, this.item.sprite.y - this.height / 2, this.width * this.item.sprite.scale.x, this.height * this.item.sprite.scale.y);
    };
    RectangleCollider.prototype.draw = function (g, color) {
        g.lineStyle(1, color, 1);
        var rect = this.getRectangle();
        g.drawRect(rect.x, rect.y, rect.width, rect.height);
    };
    return RectangleCollider;
}(Collider));
var Colors = (function () {
    function Colors() {
    }
    return Colors;
}());
Colors.GreenBeige = 0xBEBD7F;
Colors.Beige = 0xC2B078;
Colors.SandYellow = 0xC6A664;
Colors.SignalYellow = 0xE5BE01;
Colors.GoldenYellow = 0xCDA434;
Colors.HoneyYellow = 0xA98307;
Colors.MaizeYellow = 0xE4A010;
Colors.DaffodilYellow = 0xDC9D00;
Colors.BrownBeige = 0x8A6642;
Colors.LemonYellow = 0xC7B446;
Colors.OysterWhite = 0xEAE6CA;
Colors.Ivory = 0xE1CC4F;
Colors.LightIvory = 0xE6D690;
Colors.SulfurYellow = 0xEDFF21;
Colors.SaffronYellow = 0xF5D033;
Colors.ZincYellow = 0xF8F32B;
Colors.GreyBeige = 0x9E9764;
Colors.OliveYellow = 0x999950;
Colors.RapeYellow = 0xF3DA0B;
Colors.TrafficYellow = 0xFAD201;
Colors.OchreYellow = 0xAEA04B;
Colors.LuminousYellow = 0xFFFF00;
Colors.Curry = 0x9D9101;
Colors.MelonYellow = 0xF4A900;
Colors.BroomYellow = 0xD6AE01;
Colors.DahliaYellow = 0xF3A505;
Colors.PastelYellow = 0xEFA94A;
Colors.PearlBeige = 0x6A5D4D;
Colors.PearlGold = 0x705335;
Colors.SunYellow = 0xF39F18;
Colors.YellowOrange = 0xED760E;
Colors.RedOrange = 0xC93C20;
Colors.Vermilion = 0xCB2821;
Colors.PastelOrange = 0xFF7514;
Colors.PureOrange = 0xF44611;
Colors.LuminousOrange = 0xFF2301;
Colors.LuminousBrightOrange = 0xFFA420;
Colors.BrightRedOrange = 0xF75E25;
Colors.TrafficOrange = 0xF54021;
Colors.SignalOrange = 0xD84B20;
Colors.DeepOrange = 0xEC7C26;
Colors.SalmonRange = 0xE55137;
Colors.PearlOrange = 0xC35831;
Colors.FlameRed = 0xAF2B1E;
Colors.SignalRed = 0xA52019;
Colors.CarmineRed = 0xA2231D;
Colors.RubyRed = 0x9B111E;
Colors.PurpleRed = 0x75151E;
Colors.WineRed = 0x5E2129;
Colors.BlackRed = 0x412227;
Colors.OxideRed = 0x642424;
Colors.BrownRed = 0x781F19;
Colors.BeigeRed = 0xC1876B;
Colors.TomatoRed = 0xA12312;
Colors.AntiquePink = 0xD36E70;
Colors.LightPink = 0xEA899A;
Colors.CoralRed = 0xB32821;
Colors.Rose = 0xE63244;
Colors.StrawberryRed = 0xD53032;
Colors.TrafficRed = 0xCC0605;
Colors.SalmonPink = 0xD95030;
Colors.LuminousRed = 0xF80000;
Colors.LuminousBrightRed = 0xFE0000;
Colors.RaspberryRed = 0xC51D34;
Colors.PureRed = 0xCB3234;
Colors.OrientRed = 0xB32428;
Colors.PearlRubyRed = 0x721422;
Colors.PearlPink = 0xB44C43;
Colors.RedLilac = 0x6D3F5B;
Colors.RedViolet = 0x922B3E;
Colors.HeatherViolet = 0xDE4C8A;
Colors.ClaretViolet = 0x641C34;
Colors.BlueLilac = 0x6C4675;
Colors.TrafficPurple = 0xA03472;
Colors.PurpleViolet = 0x4A192C;
Colors.SignalViolet = 0x924E7D;
Colors.PastelViolet = 0xA18594;
Colors.Telemagenta = 0xCF3476;
Colors.PearlViolet = 0x8673A1;
Colors.PearlBlackBerry = 0x6C6874;
Colors.VioletBlue = 0x354D73;
Colors.GreenBlue = 0x1F3438;
Colors.UltramarineBlue = 0x20214F;
Colors.SaphireBlue = 0x1D1E33;
Colors.BlackBlue = 0x18171C;
Colors.SignalBlue = 0x1E2460;
Colors.BrillantBlue = 0x3E5F8A;
Colors.GreyBlue = 0x26252D;
Colors.AzureBlue = 0x025669;
Colors.GentianBlue = 0x0E294B;
Colors.SteelBlue = 0x231A24;
Colors.LightBlue = 0x3B83BD;
Colors.CobaltBlue = 0x1E213D;
Colors.PigeonBlue = 0x606E8C;
Colors.SkyBlue = 0x2271B3;
Colors.TrafficBlue = 0x063971;
Colors.TurquoiseBlue = 0x3F888F;
Colors.CapriBlue = 0x1B5583;
Colors.OceanBlue = 0x1D334A;
Colors.WaterBlue = 0x256D7B;
Colors.NightBlue = 0x252850;
Colors.DistantBlue = 0x49678D;
Colors.PastelBlue = 0x5D9B9B;
Colors.PearlGentianBlue = 0x2A6478;
Colors.PearlNightBlue = 0x102C54;
Colors.PatinaGreen = 0x316650;
Colors.EmeraldGreen = 0x287233;
Colors.LeafGreen = 0x2D572C;
Colors.OliveGreen = 0x424632;
Colors.BlueGreen = 0x1F3A3D;
Colors.MossGreen = 0x2F4538;
Colors.GreyOlive = 0x3E3B32;
Colors.BottleGreen = 0x343B29;
Colors.BrownGreen = 0x39352A;
Colors.FirGreen = 0x31372B;
Colors.GrassGreen = 0x35682D;
Colors.ResedaGreen = 0x587246;
Colors.BlackGreen = 0x343E40;
Colors.ReedGreen = 0x6C7156;
Colors.YellowOlive = 0x47402E;
Colors.BlackOlive = 0x3B3C36;
Colors.TurquoiseGreen = 0x1E5945;
Colors.MayGreen = 0x4C9141;
Colors.YellowGreen = 0x57A639;
Colors.PastelGreen = 0xBDECB6;
Colors.ChromeGreen = 0x2E3A23;
Colors.PaleGreen = 0x89AC76;
Colors.OliveDrab = 0x25221B;
Colors.TrafficGreen = 0x308446;
Colors.FernGreen = 0x3D642D;
Colors.OpalGreen = 0x015D52;
Colors.LightGreen = 0x84C3BE;
Colors.PineGreen = 0x2C5545;
Colors.MintGreen = 0x20603D;
Colors.SignalGreen = 0x317F43;
Colors.MintTurquoise = 0x497E76;
Colors.PastelTurquoise = 0x7FB5B5;
Colors.PearlGreen = 0x1C542D;
Colors.PearlOpalGreen = 0x193737;
Colors.PureGreen = 0x008F39;
Colors.LuminousGreen = 0x00BB2D;
Colors.SquirrelGrey = 0x78858B;
Colors.SilverGrey = 0x8A9597;
Colors.OliveGrey = 0x7E7B52;
Colors.MossGrey = 0x6C7059;
Colors.SignalGrey = 0x969992;
Colors.MouseGrey = 0x646B63;
Colors.BeigeGrey = 0x6D6552;
Colors.KhakiGrey = 0x6A5F31;
Colors.GreenGrey = 0x4D5645;
Colors.TarpaulinGrey = 0x4C514A;
Colors.IronGrey = 0x434B4D;
Colors.BasaltGrey = 0x4E5754;
Colors.BrownGrey = 0x464531;
Colors.SlateGrey = 0x434750;
Colors.AnthraciteGrey = 0x293133;
Colors.BlackGrey = 0x23282B;
Colors.UmbraGrey = 0x332F2C;
Colors.ConcreteGrey = 0x686C5E;
Colors.GraphiteGrey = 0x474A51;
Colors.GraniteGrey = 0x2F353B;
Colors.StoneGrey = 0x8B8C7A;
Colors.BlueGrey = 0x474B4E;
Colors.PebbleGrey = 0xB8B799;
Colors.CementGrey = 0x7D8471;
Colors.YellowGrey = 0x8F8B66;
Colors.LightGrey = 0xD7D7D7;
Colors.PlatinumGrey = 0x7F7679;
Colors.DustyGrey = 0x7D7F7D;
Colors.AgateGrey = 0xB5B8B1;
Colors.QuartzGrey = 0x6C6960;
Colors.WindowGrey = 0x9DA1AA;
Colors.TrafficGreyA = 0x8D948D;
Colors.TrafficGreyB = 0x4E5452;
Colors.SilkGrey = 0xCAC4B0;
Colors.Telegrey1 = 0x909090;
Colors.Telegrey2 = 0x82898F;
Colors.Telegrey4 = 0xD0D0D0;
Colors.PearlMouseGrey = 0x898176;
Colors.GreenBrown = 0x826C34;
Colors.OchreBrown = 0x955F20;
Colors.SignalBrown = 0x6C3B2A;
Colors.ClayBrown = 0x734222;
Colors.CopperBrown = 0x8E402A;
Colors.FawnBrown = 0x59351F;
Colors.OliveBrown = 0x6F4F28;
Colors.NutBrown = 0x5B3A29;
Colors.RedBrown = 0x592321;
Colors.SepiaBrown = 0x382C1E;
Colors.ChestnutBrown = 0x633A34;
Colors.MahoganyBrown = 0x4C2F27;
Colors.ChocolateBrown = 0x45322E;
Colors.GreyBrown = 0x403A3A;
Colors.BlackBrown = 0x212121;
Colors.OrangeBrown = 0xA65E2E;
Colors.BeigeBrown = 0x79553D;
Colors.PaleBrown = 0x755C48;
Colors.TerraBrown = 0x4E3B31;
Colors.PearlCopper = 0x763C28;
Colors.Cream = 0xFDF4E3;
Colors.GreyWhite = 0xE7EBDA;
Colors.SignalWhite = 0xF4F4F4;
Colors.SignalBlack = 0x282828;
Colors.JetBlack = 0x0A0A0A;
Colors.WhiteAluminium = 0xA5A5A5;
Colors.GreyAluminium = 0x8F8F8F;
Colors.PureWhite = 0xFFFFFF;
Colors.GraphiteBlack = 0x1C1C1C;
Colors.TrafficWhite = 0xF6F6F6;
Colors.TrafficBlack = 0x1E1E1E;
Colors.PapyrusWhite = 0xD7D7D7;
Colors.PearlLightGrey = 0x9C9C9C;
Colors.PearlDarkGrey = 0x828282;
var menuOpen = false;
function openMenu() {
    menuOpen = true;
    $("#mainmenu").show(100);
}
function giveUp() {
    if (menuOpen) {
        resume();
    }
    else {
        pause();
        openMenu();
    }
}
function resume() {
    $("#controls").hide();
    $("#howToPlay").hide();
    $("#mainmenu").hide(100);
    menuOpen = false;
}
function openLevel(level) {
    resume();
    startLevel(level);
    unpause();
}
function fastReset() {
    if (menuOpen) {
        unpause();
    }
    doIntro = false;
    reset();
    if (menuOpen) {
        pause();
    }
}
function changeSkipConfirmation() {
    var skip = $('#skipConfirmation').is(":checked");
    window.localStorage.setItem("skipConfirmation", skip ? "yes" : "no");
    skipIntro = skip;
}
function reloadSkipConfirmation() {
    var shouldSkip = window.localStorage.getItem("skipConfirmation") == "yes";
    $("#skipConfirmation").prop('checked', shouldSkip);
    skipIntro = shouldSkip;
}
function pause() {
    if (!paused) {
        paused = true;
        ticker.speed = 0;
        pauseMusic();
        stage.addChild(pauseScreen);
        for (var _i = 0, animatedEntities_1 = animatedEntities; _i < animatedEntities_1.length; _i++) {
            var e = animatedEntities_1[_i];
            e.stop();
        }
    }
}
function unpause() {
    if (paused) {
        paused = false;
        ticker.speed = 1;
        resumeMusic();
        stage.removeChild(pauseScreen);
        for (var _i = 0, animatedEntities_2 = animatedEntities; _i < animatedEntities_2.length; _i++) {
            var e = animatedEntities_2[_i];
            e.play();
        }
    }
}
function togglePause() {
    if (menuOpen)
        return;
    if (paused) {
        unpause();
    }
    else {
        pause();
    }
}
function showControls() {
    $("#controls").show(100);
}
function showHowToPlay() {
    $("#howToPlay").show(100);
}
function toggleAutoFire() {
    autofire = !autofire;
}
$(window).blur(function () {
    if (pauseWhenClickOut) {
        pause();
    }
});
buttons.esc.release = giveUp;
buttons.p.release = togglePause;
buttons.pause.release = togglePause;
buttons.space.release = toggleAutoFire;
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(sprite, collider, pattern) {
        return _super.call(this, sprite, collider, pattern) || this;
    }
    Enemy.prototype.loseHP = function (lost) {
        if (this.immortal || gameEnded) {
            return;
        }
        this.hp -= lost;
        if (this.hp <= 0) {
            this.immortal = true;
            this.pattern = new CombinationPattern([this.pattern, new DisappearingPattern(30)]);
            if (this.isBoss) {
                bossDefeated();
            }
        }
    };
    Enemy.prototype.update = function (delta) {
        _super.prototype.update.call(this, delta);
        if (!this.harmless && !player.indestructible && player.collider.intersects(this.collider)) {
            player.loseHP(1);
        }
    };
    return Enemy;
}(Item));
var Inscription = (function (_super) {
    __extends(Inscription, _super);
    function Inscription(sprite, pattern) {
        return _super.call(this, sprite, new CircleCollider(0), pattern) || this;
    }
    return Inscription;
}(Item));
function showDefeatedScreen() {
    var screen = new PIXI.Container();
    var blacken = new PIXI.Graphics();
    blacken.beginFill(0x000000, 0.1);
    blacken.drawRect(0, 0, WIDTH, HEIGHT);
    blacken.endFill();
    screen.addChild(blacken);
    var congText = new PIXI.Text("You have been defeated.");
    congText.anchor.x = 0.5;
    congText.anchor.y = 1;
    congText.x = WIDTH / 2;
    congText.y = HEIGHT - 200;
    congText.style.fontSize = 42;
    congText.style.fill = [0xFF0000, Colors.PureRed];
    congText.style.stroke = 0x4a1850;
    congText.style.strokeThickness = 2;
    congText.style.dropShadow = true;
    congText.style.dropShadowColor = '#000000';
    congText.style.dropShadowBlur = 4;
    congText.style.dropShadowAngle = Math.PI / 6;
    congText.style.dropShadowDistance = 6;
    screen.addChild(congText);
    var congText = new PIXI.Text("Press [R] to reset the stage or [Esc] to return to menu.");
    congText.anchor.x = 0.5;
    congText.anchor.y = 0;
    congText.x = WIDTH / 2;
    congText.y = HEIGHT - 180;
    congText.style.align = "CENTER";
    congText.style.fontSize = 24;
    congText.style.fill = 0x000000;
    screen.addChild(congText);
    screen.alpha = 0;
    var inscription = new Inscription(screen, new SequencePattern([
        new FixedDuration(50),
        new SpecialPattern(function (delta, item, pattern) {
            item.sprite.alpha += delta / 40;
            if (item.sprite.alpha > 1) {
                item.sprite.alpha = 1;
            }
        }).While(new FixedDuration(40)),
        new StandingPattern()
    ]));
    stage.addChild(screen);
    hud.push(inscription);
}
function createPreperfectScreen(index, char) {
    var text = new PIXI.Text(char, {
        fontSize: 28
    });
    text.style.fill = [0xFFFF00, Colors.GoldenYellow];
    text.style.stroke = 0x4a1850;
    text.style.strokeThickness = 2;
    text.style.dropShadow = true;
    text.style.dropShadowColor = '#000000';
    text.style.dropShadowBlur = 4;
    text.style.dropShadowAngle = Math.PI / 6;
    text.style.dropShadowDistance = 6;
    text.anchor.x = 0.5;
    text.anchor.y = 0.5;
    text.y = HEIGHT / 2;
    text.scale.x = 20;
    text.scale.y = 20;
    text.alpha = 0;
    var midpoint = "PERFECT!".length / 2 - 1;
    text.x = WIDTH / 2 + (index - midpoint) * 20;
    stage.addChild(text);
    var preWait = index * 5;
    var postWait = 120 - preWait;
    var letter = new Inscription(text, new SequencePattern([
        new FixedDuration(preWait),
        new SpecialPattern(function (delta, item, pattern) {
            item.sprite.alpha += delta / 10;
            item.sprite.scale.x -= delta * 19 / 10;
            item.sprite.scale.y -= delta * 19 / 10;
        }).While(new FixedDuration(10)),
        new OneShot(function (item) {
            item.sprite.alpha = 1;
            item.sprite.scale.x = 1;
            item.sprite.scale.y = 1;
        }),
        new FixedDuration(postWait),
        new DisappearingPattern(20)
    ]));
    hud.push(letter);
}
function showCongratulationsScreen() {
    var curDate = new Date();
    var secs = Math.round((curDate.valueOf() - dateOfStart.valueOf()) / 1000);
    var lifeLost = player.maxHp - player.hp;
    var isPerfect = lifeLost == 0;
    var screen = new PIXI.Container();
    var blacken = new PIXI.Graphics();
    blacken.beginFill(0x000000, 0.3);
    blacken.drawRect(0, 0, WIDTH, HEIGHT);
    blacken.endFill();
    screen.addChild(blacken);
    var congText = new PIXI.Text(isPerfect ? "PERFECT!" : "CONGRATULATIONS!");
    congText.anchor.x = 0.5;
    congText.anchor.y = 1;
    congText.x = WIDTH / 2;
    congText.y = 200;
    congText.style.fontSize = 42;
    congText.style.fill = 0xFFFFFF;
    if (isPerfect) {
        congText.style.fill = [0xFFFF00, Colors.GoldenYellow];
        congText.style.stroke = 0x4a1850;
        congText.style.strokeThickness = 2;
        congText.style.dropShadow = true;
        congText.style.dropShadowColor = '#000000';
        congText.style.dropShadowBlur = 4;
        congText.style.dropShadowAngle = Math.PI / 6;
        congText.style.dropShadowDistance = 6;
    }
    screen.addChild(congText);
    var congText = new PIXI.Text("You have defeated the " + Levels.getLevel(loadedLevel).bossname + "!\n\nTime taken: " + secs + " s\n\nLife lost: " + lifeLost + "\n\nDifficulty: " + difficultyToString(difficulty) + "\n\nPress ESC to return to menu.");
    congText.anchor.x = 0.5;
    congText.anchor.y = 0;
    congText.x = WIDTH / 2;
    congText.y = 220;
    congText.style.align = "CENTER";
    congText.style.fontSize = 24;
    congText.style.fill = 0xFFFFFF;
    screen.addChild(congText);
    screen.alpha = 0;
    var inscription = new Inscription(screen, new SequencePattern([
        new FixedDuration(isPerfect ? 150 : 50),
        new SpecialPattern(function (delta, item, pattern) {
            item.sprite.alpha += delta / 40;
            if (item.sprite.alpha > 1) {
                item.sprite.alpha = 1;
            }
        }).While(new FixedDuration(40)),
        new StandingPattern()
    ]));
    if (isPerfect) {
        var perfectWord = "PERFECT!";
        for (var i = 0; i < "PERFECT!".length; i++) {
            createPreperfectScreen(i, perfectWord.charAt(i));
        }
    }
    stage.addChild(screen);
    hud.push(inscription);
}
var LevelDescription = (function () {
    function LevelDescription(name, desc, makeBoss) {
        this.bossname = name;
        this.subCaption = desc;
        this.bossCreation = makeBoss;
    }
    return LevelDescription;
}());
var Levels = (function () {
    function Levels() {
    }
    Levels.getLevel = function (level) {
        switch (level) {
            case Levels.AlienVessel:
                return new LevelDescription("Alien Vessel", "Is this boss random?!", createAlienVesselBoss);
            case Levels.TentacleBoss:
                return new LevelDescription("Tentacle Boss", "also called 'The Consumer of Souls'", createTentacleBoss);
            case Levels.MysteriousPortal:
                return new LevelDescription("Mysterious Portal", "Gateway of Channeled Fear", createPortal);
            case Levels.CommandVessel:
                return new LevelDescription("Command Vessel", "Behold the leader of the Vast Horrors!", createCommandVessel);
            case Levels.DeepEyes:
                var eyes = new LevelDescription("Deep Eyes", "Piece of cake, maybe?", createDeepEyes);
                eyes.isDoubleBoss = true;
                eyes.bossCreation2 = createDeepEyes2;
                return eyes;
            case Levels.DeepEye:
            default:
                return new LevelDescription("Deep Eye", "Vanguard of the Vast Horrors", createEyeBossBoss);
        }
    };
    return Levels;
}());
Levels.DeepEye = 1;
Levels.AlienVessel = 2;
Levels.TentacleBoss = 3;
Levels.MysteriousPortal = 4;
Levels.CommandVessel = 5;
Levels.DeepEyes = 6;
var Pattern = (function () {
    function Pattern() {
        this.tags = {};
    }
    Pattern.prototype.getTag = function (tag) {
        if (isNaN(this.tags[tag]))
            return 0;
        return this.tags[tag];
    };
    Pattern.prototype.While = function (other) {
        return new CombinationPattern([this, other]);
    };
    Pattern.prototype.Then = function (then) {
        return new SequencePattern([this, then]);
    };
    Pattern.prototype.And = function (and) {
        return new Both([this, and]);
    };
    Pattern.prototype.Named = function (name) {
        return new NamedPattern(this, name);
    };
    Pattern.prototype.explain = function () {
        return "?";
    };
    return Pattern;
}());
var StandingPattern = (function (_super) {
    __extends(StandingPattern, _super);
    function StandingPattern() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StandingPattern.prototype.update = function (delta, item) {
    };
    StandingPattern.prototype.explain = function () {
        return "";
    };
    return StandingPattern;
}(Pattern));
var OneShot = (function (_super) {
    __extends(OneShot, _super);
    function OneShot(func) {
        var _this = _super.call(this) || this;
        _this.func = func;
        return _this;
    }
    OneShot.prototype.update = function (delta, item) {
        this.func(item);
        this.spent = true;
    };
    return OneShot;
}(Pattern));
var SpecialPattern = (function (_super) {
    __extends(SpecialPattern, _super);
    function SpecialPattern(func) {
        var _this = _super.call(this) || this;
        _this.func = func;
        return _this;
    }
    SpecialPattern.prototype.update = function (delta, item) {
        this.func(delta, item, this);
    };
    SpecialPattern.prototype.explain = function () {
        return "special";
    };
    return SpecialPattern;
}(Pattern));
var DelegatingPattern = (function (_super) {
    __extends(DelegatingPattern, _super);
    function DelegatingPattern(pattern) {
        var _this = _super.call(this) || this;
        _this.inner = pattern;
        return _this;
    }
    DelegatingPattern.prototype.update = function (delta, item) {
        this.inner.update(delta, item);
        if (this.inner.spent) {
            this.spent = true;
        }
    };
    DelegatingPattern.prototype.explain = function () {
        return this.inner.explain();
    };
    return DelegatingPattern;
}(Pattern));
var NamedPattern = (function (_super) {
    __extends(NamedPattern, _super);
    function NamedPattern(pattern, name) {
        var _this = _super.call(this, pattern) || this;
        _this.name = name;
        return _this;
    }
    NamedPattern.prototype.explain = function () {
        return this.name;
    };
    return NamedPattern;
}(DelegatingPattern));
var DisappearingPattern = (function (_super) {
    __extends(DisappearingPattern, _super);
    function DisappearingPattern(time) {
        var _this = _super.call(this) || this;
        _this.speed = 1 / time;
        return _this;
    }
    DisappearingPattern.prototype.update = function (delta, item) {
        item.sprite.alpha -= delta * this.speed;
        if (item.sprite.alpha <= 0) {
            item.sprite.alpha = 0;
            this.spent = true;
            item.gone = true;
        }
    };
    DisappearingPattern.prototype.explain = function () {
        return "fade";
    };
    return DisappearingPattern;
}(Pattern));
var AppearingPattern = (function (_super) {
    __extends(AppearingPattern, _super);
    function AppearingPattern(time) {
        var _this = _super.call(this) || this;
        _this.speed = 1 / time;
        return _this;
    }
    AppearingPattern.prototype.update = function (delta, item) {
        item.sprite.alpha += delta * this.speed;
        if (item.sprite.alpha >= 1) {
            item.sprite.alpha = 1;
            this.spent = true;
        }
    };
    AppearingPattern.prototype.explain = function () {
        return "fade-in";
    };
    return AppearingPattern;
}(Pattern));
var PeriodicPattern = (function (_super) {
    __extends(PeriodicPattern, _super);
    function PeriodicPattern(periodTime, func) {
        var _this = _super.call(this) || this;
        _this.periodTime = periodTime;
        _this.func = func;
        _this.timeUntilPeriod = _this.periodTime;
        return _this;
    }
    PeriodicPattern.prototype.update = function (delta, item) {
        this.timeUntilPeriod -= delta;
        while (this.timeUntilPeriod < 0) {
            this.timeUntilPeriod += this.periodTime;
            this.func(item, this);
        }
    };
    PeriodicPattern.prototype.explain = function () {
        return "periodic-fire";
    };
    return PeriodicPattern;
}(Pattern));
var RotationPattern = (function (_super) {
    __extends(RotationPattern, _super);
    function RotationPattern(fullRotationTime, func) {
        var _this = _super.call(this) || this;
        _this.angle = 0;
        _this.angleDiff = Math.PI * 2 / fullRotationTime;
        _this.func = func;
        return _this;
    }
    RotationPattern.prototype.update = function (delta, item) {
        this.angle += this.angleDiff * delta;
        this.func(this.angle, delta * this.angleDiff, item);
    };
    RotationPattern.prototype.explain = function () {
        return "rotate";
    };
    return RotationPattern;
}(Pattern));
var RepeatPattern = (function (_super) {
    __extends(RepeatPattern, _super);
    function RepeatPattern(patternCreation, repeatCount) {
        if (repeatCount === void 0) { repeatCount = 1000; }
        var _this = _super.call(this) || this;
        _this.patterns = [];
        _this.patternCreation = patternCreation;
        _this.count = repeatCount;
        return _this;
    }
    RepeatPattern.prototype.explain = function () {
        var x = "";
        for (var _i = 0, _a = this.patterns; _i < _a.length; _i++) {
            var p = _a[_i];
            x += p.explain() + " ";
        }
        return (this.current != null ? this.current.explain() : "");
    };
    RepeatPattern.prototype.update = function (delta, item) {
        if (this.current == null) {
            if (this.patterns.length > 0) {
                this.current = this.patterns.shift();
            }
            else {
                if (this.count <= 0) {
                    this.spent = true;
                    return;
                }
                this.count--;
                this.patterns = this.patternCreation();
                this.update(delta, item);
            }
        }
        else {
            this.current.update(delta, item);
            if (this.current.spent) {
                this.current = null;
                this.update(delta, item);
            }
        }
    };
    return RepeatPattern;
}(Pattern));
var FollowLeaderX = (function (_super) {
    __extends(FollowLeaderX, _super);
    function FollowLeaderX(leader) {
        var _this = _super.call(this) || this;
        _this.leader = leader;
        return _this;
    }
    FollowLeaderX.prototype.update = function (delta, item) {
        item.sprite.x = this.leader.x();
        if (this.leader.harmless || this.leader.gone) {
            if (!item.harmless) {
                item.fadeout();
            }
        }
    };
    FollowLeaderX.prototype.explain = function () {
        return "follow-leader";
    };
    return FollowLeaderX;
}(Pattern));
function getRandomExclusive(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
var SequencePattern = (function (_super) {
    __extends(SequencePattern, _super);
    function SequencePattern(patterns) {
        return _super.call(this, function () { return patterns; }, 1) || this;
    }
    return SequencePattern;
}(RepeatPattern));
var CustomPattern = (function (_super) {
    __extends(CustomPattern, _super);
    function CustomPattern(func) {
        var _this = _super.call(this) || this;
        _this.func = func;
        return _this;
    }
    CustomPattern.prototype.update = function (delta, item) {
        if (this.pattern == null) {
            this.pattern = this.func(item);
        }
        this.pattern.update(delta, item);
        if (this.pattern.spent) {
            this.spent = true;
        }
    };
    return CustomPattern;
}(Pattern));
var RandomPattern = (function (_super) {
    __extends(RandomPattern, _super);
    function RandomPattern(patterns) {
        return _super.call(this, [RandomPattern.getRandomPattern(patterns)]) || this;
    }
    RandomPattern.getRandomPattern = function (patterns) {
        return patterns[getRandomExclusive(0, patterns.length)];
    };
    return RandomPattern;
}(SequencePattern));
var Both = (function (_super) {
    __extends(Both, _super);
    function Both(patterns) {
        var _this = _super.call(this) || this;
        _this.patterns = patterns;
        return _this;
    }
    Both.prototype.update = function (delta, item) {
        for (var _i = 0, _a = this.patterns; _i < _a.length; _i++) {
            var p = _a[_i];
            p.update(delta, item);
        }
    };
    Both.prototype.explain = function () {
        var x = "";
        for (var _i = 0, _a = this.patterns; _i < _a.length; _i++) {
            var p = _a[_i];
            x += p.explain() + " ";
        }
        return "{ " + x + "}";
    };
    return Both;
}(Pattern));
var CombinationPattern = (function (_super) {
    __extends(CombinationPattern, _super);
    function CombinationPattern(patterns) {
        var _this = _super.call(this) || this;
        _this.patterns = patterns;
        return _this;
    }
    CombinationPattern.prototype.update = function (delta, item) {
        for (var _i = 0, _a = this.patterns; _i < _a.length; _i++) {
            var p = _a[_i];
            p.update(delta, item);
            if (p.spent) {
                this.spent = true;
            }
        }
    };
    CombinationPattern.prototype.explain = function () {
        var x = "";
        for (var _i = 0, _a = this.patterns; _i < _a.length; _i++) {
            var p = _a[_i];
            x += p.explain() + " ";
        }
        return "[ " + x + "]";
    };
    return CombinationPattern;
}(Pattern));
var SimpleMove = (function (_super) {
    __extends(SimpleMove, _super);
    function SimpleMove(xdist, ydist, time) {
        return _super.call(this, [
            new FixedDuration(time),
            new UniformMovementPattern(xdist / time, ydist / time)
        ]) || this;
    }
    return SimpleMove;
}(CombinationPattern));
var FixedDuration = (function (_super) {
    __extends(FixedDuration, _super);
    function FixedDuration(ticks) {
        var _this = _super.call(this) || this;
        _this.ticks = ticks;
        return _this;
    }
    FixedDuration.prototype.update = function (delta, item) {
        this.ticks -= delta;
        if (this.ticks <= 0) {
            this.spent = true;
        }
    };
    FixedDuration.prototype.explain = function () {
        return "fixed-time";
    };
    return FixedDuration;
}(Pattern));
var UniformMovementPattern = (function (_super) {
    __extends(UniformMovementPattern, _super);
    function UniformMovementPattern(xSpeed, ySpeed) {
        var _this = _super.call(this) || this;
        _this.xSpeed = xSpeed;
        _this.ySpeed = ySpeed;
        return _this;
    }
    UniformMovementPattern.prototype.update = function (delta, item) {
        item.sprite.x += delta * this.xSpeed;
        item.sprite.y += delta * this.ySpeed;
    };
    UniformMovementPattern.prototype.explain = function () {
        return "move";
    };
    return UniformMovementPattern;
}(Pattern));
var EllipseMovement = (function (_super) {
    __extends(EllipseMovement, _super);
    function EllipseMovement(centerX, centerY, a, b, initAngle, finalAngle, time) {
        var _this = _super.call(this) || this;
        _this.finalAngle = degreesToRadian(finalAngle);
        _this.currentAngle = degreesToRadian(initAngle);
        _this.cx = centerX;
        _this.cy = centerY;
        _this.a = a;
        _this.b = b;
        _this.timeRemaining = time;
        _this.angleDiff = (_this.finalAngle - _this.currentAngle) / time;
        return _this;
    }
    EllipseMovement.prototype.update = function (delta, item) {
        this.currentAngle += delta * this.angleDiff;
        this.timeRemaining -= delta;
        if (this.timeRemaining <= 0) {
            this.currentAngle = this.finalAngle;
            this.spent = true;
        }
        var x = this.cx + this.a * Math.cos(this.currentAngle);
        var y = this.cy + this.b * Math.sin(this.currentAngle);
        item.sprite.x = x;
        item.sprite.y = y;
    };
    EllipseMovement.prototype.explain = function () {
        return "ellipse-move";
    };
    return EllipseMovement;
}(Pattern));
function createAlienVesselBoss() {
    var enemySprite = PIXI.Sprite.fromImage("img/boss/blackship.png");
    enemySprite.x = WIDTH / 2;
    enemySprite.y = HEIGHT * 1 / 5;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    var boss = new Enemy(enemySprite, new RectangleCollider(413, 140), AlienVessel.alienVessel());
    boss.hp = 1000;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp);
    return boss;
}
function radiansToDegrees(angle) {
    return angle * 360 / (Math.PI * 2);
}
function degreesToRadian(angle) {
    return angle * Math.PI * 2 / 360;
}
function circular(fromAngle, toAngle, totalShots, func) {
    var from = degreesToRadian(fromAngle);
    var to = degreesToRadian(toAngle);
    var during = to - from;
    totalShots--;
    for (var i = 0; i <= totalShots; i++) {
        var rotation = from + during * i / totalShots;
        var xs = 0.5 * Math.cos(rotation);
        var ys = 0.5 * Math.sin(rotation);
        func(xs, ys, rotation);
    }
}
var AlienVessel;
(function (AlienVessel) {
    function circles() {
        return new PeriodicPattern(12, function (boss, self) {
            var SPEED = 8;
            circular(0, 360, 9, function (xs, ys) {
                var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs * SPEED, ys * SPEED));
                spawnBullet(b);
            });
        });
    }
    function zigleft() {
        return new RepeatPattern(function () { return [
            new SimpleMove(-100, 100, 50).While(circles()),
            new SimpleMove(-100, -100, 50).While(circles()),
        ]; }, 2);
    }
    var atPlayer = new PeriodicPattern(dif(32, 16, 12), function (boss) {
        var BULLET_SPEED = 10;
        var dx = (player.x() - boss.x());
        var dy = (player.y() - boss.y());
        var total = Math.sqrt(dx * dx + dy * dy);
        var xs = BULLET_SPEED * dx / total;
        var ys = BULLET_SPEED * dy / total;
        var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "yellowBubble.png"), new CircleCollider(5), new UniformMovementPattern(xs, ys));
        spawnBullet(b);
    });
    var fireDown = new PeriodicPattern(dif(50, 36, 20), function (boss, self) {
        var SPEED = 4;
        circular(40, 140, 5, function (xs, ys) {
            var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs * SPEED, ys * SPEED));
            spawnBullet(b);
        });
    });
    var laser = function (boss) {
        var laserSprite = createBulletSprite(boss.x() + 800, boss.y(), "horizontalLaser.png");
        var bb = new Bullet(false, laserSprite, new RectangleCollider(laserSprite.width, laserSprite.height), new FixedDuration(10).Then(new OneShot(function (laser) { return laser.gone = true; })));
        bb.indestructible = true;
        spawnBullet(bb);
    };
    var fireFirer = function (boss) {
        var randomx = getRandomExclusive(20, WIDTH - 20);
        var randomy = getRandomExclusive(20, HEIGHT - 20);
        var firerPattern = new SimpleMove(randomx - boss.x(), randomy - boss.y(), dif(120, 120, 70))
            .Then(new FixedDuration(30))
            .Then(new OneShot(function (firer) {
            var BULLET_SPEED = 10;
            var dx = (player.x() - firer.x());
            var dy = (player.y() - firer.y());
            var total = Math.sqrt(dx * dx + dy * dy);
            var xs = BULLET_SPEED * dx / total;
            var ys = BULLET_SPEED * dy / total;
            firer.tags["xs"] = xs;
            firer.tags["ys"] = ys;
        }))
            .Then(new FixedDuration(dif(30, 60, 80)).While(new PeriodicPattern(4, function (firer) {
            var xs = firer.tags["xs"];
            var ys = firer.tags["ys"];
            var b = new Bullet(false, createBulletSprite(firer.x(), firer.y(), "yellowBubble.png"), new CircleCollider(5), new UniformMovementPattern(xs, ys));
            spawnBullet(b);
        })))
            .Then(new DisappearingPattern(30));
        var firer = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "fireball.png"), new CircleCollider(15), firerPattern);
        spawnBullet(firer);
    };
    var fireFirers = function (boss) {
        for (var i = 0; i < 3; i++) {
            fireFirer(boss);
        }
    };
    var overload = new PeriodicPattern(dif(20, 10, 6), function (boss) {
        var SPEED = 15;
        var rotation = getRandomExclusive(80, 260);
        var rotRadian = degreesToRadian(rotation);
        var xs = 0.5 * Math.cos(rotRadian) * SPEED;
        var ys = 0.5 * Math.sin(rotRadian) * SPEED;
        var purpleball = createBulletSprite(boss.x(), boss.y(), "purpleball.png");
        purpleball.scale.x = 0.5;
        purpleball.scale.y = 0.5;
        var b = new Bullet(false, purpleball, new CircleCollider(7), new UniformMovementPattern(xs, ys));
        spawnBullet(b);
    });
    function alienVessel() {
        return new RepeatPattern(function () { return [
            zigleft().Named("Vessel assumes attack position."),
            new FixedDuration(dif(90, 60, 50)).While(atPlayer).Named("Vessel commander chooses course of action."),
            new RandomPattern([
                new SequencePattern([
                    new SimpleMove(800, 0, 200).While(new PeriodicPattern(dif(40, 20, 12), function (boss) {
                        fireFirer(boss);
                    })).Named("Vessel ejecting auxiliary drones."),
                    new OneShot(function (boss) { boss.tags["speed"] = getRandomExclusive(200, 700); }),
                    new CustomPattern(function (boss) { return new SimpleMove(0, boss.tags["speed"], 120 * boss.tags["speed"] / 700); }).While(overload).Named("Vessel is overloading!!!"),
                    new CustomPattern(function (boss) { return new SimpleMove(0, -boss.tags["speed"], 120 * boss.tags["speed"] / 700); }).While(overload).Named("Vessel is recovering from overload."),
                    new SimpleMove(-400, 0, 60).Named("Vessel crew puts out fires.")
                ]),
                new SequencePattern([
                    new SimpleMove(0, 600, dif(80, 60, 50)).While(atPlayer).Named("Vessel is navigating the battle space."),
                    new RepeatPattern(function () { return [
                        new SimpleMove(0, -100, dif(50, 30, 20)).While(fireDown).Named("Vessel is returning up."),
                        new OneShot(laser),
                        new FixedDuration(dif(20, 10, 6)).Named("Vessel is discharging primary weapon.")
                    ]; }, 6),
                    new OneShot(fireFirers),
                    new SimpleMove(400, 0, 60).Named("Vessel crew is vacationing.")
                ])
            ])
        ]; });
    }
    AlienVessel.alienVessel = alienVessel;
})(AlienVessel || (AlienVessel = {}));
function createCommandVessel() {
    var enemySprite = PIXI.Sprite.fromImage("img/boss/cs.png");
    enemySprite.x = WIDTH * 1 / 6;
    enemySprite.y = HEIGHT * 1 / 6;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    var boss = new Enemy(enemySprite, new RectangleCollider(430, 180), CommandVessel.main());
    boss.hp = 800;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp);
    return boss;
}
var CommandVessel;
(function (CommandVessel) {
    var fireFirerAtEdge = function (boss) {
        var randomx = getRandomExclusive(0, 2) == 0 ? getRandomExclusive(20, 40) : getRandomExclusive(WIDTH - 40, WIDTH - 20);
        var randomy = getRandomExclusive(20, HEIGHT - 20);
        return fireFirer(boss, randomx, randomy, true);
    };
    function createEmptyContainer(x, y) {
        var p = new PIXI.Container();
        p.x = x;
        p.y = y;
        return p;
    }
    var fireFirer = function (boss, x, y, visible) {
        var firerPattern = (visible ? new SimpleMove(x - boss.x(), y - boss.y(), visible ? 120 : 0) : new OneShot(function (boss) { }))
            .Then(new FixedDuration(visible ? 30 : 0))
            .Then(new OneShot(function (firer) {
            var BULLET_SPEED = visible ? 10 : 20;
            var dx = (player.x() - firer.x());
            var dy = (player.y() - firer.y());
            var total = Math.sqrt(dx * dx + dy * dy);
            var xs = BULLET_SPEED * dx / total;
            var ys = BULLET_SPEED * dy / total;
            firer.tags["xs"] = xs;
            firer.tags["ys"] = ys;
        }))
            .Then(new FixedDuration(visible ? 60 : 20).While(new PeriodicPattern(visible ? 4 : 2, function (firer) {
            var xs = firer.tags["xs"];
            var ys = firer.tags["ys"];
            var b = new Bullet(false, createBulletSprite(firer.x(), firer.y(), "yellowBubble.png"), new CircleCollider(5), new UniformMovementPattern(xs, ys));
            spawnBullet(b);
        })))
            .Then(new DisappearingPattern(30));
        var firer = new Bullet(false, visible ? createBulletSprite(boss.x(), boss.y(), "fireball.png") : createEmptyContainer(boss.x(), boss.y()), new CircleCollider(visible ? 15 : 0), firerPattern);
        spawnBullet(firer);
        return firer;
    };
    var atPlayer = new PeriodicPattern(16, function (boss) {
        var BULLET_SPEED = 10;
        var dx = (player.x() - boss.x());
        var dy = (player.y() - boss.y());
        var total = Math.sqrt(dx * dx + dy * dy);
        var xs = BULLET_SPEED * dx / total;
        var ys = BULLET_SPEED * dy / total;
        var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "yellowBubble.png"), new CircleCollider(5), new UniformMovementPattern(xs, ys));
        spawnBullet(b);
    });
    function generateOverload() {
        return new PeriodicPattern(dif(3, 1, 0.9), function (boss) {
            var SPEED = 20;
            var rotation = getRandomExclusive(0, 360);
            var rotRadian = degreesToRadian(rotation);
            var xs = 0.5 * Math.cos(rotRadian) * SPEED;
            var ys = 0.5 * Math.sin(rotRadian) * SPEED;
            var purpleball = createBulletSprite(boss.x(), boss.y(), "purpleball.png");
            purpleball.scale.x = 0.5;
            purpleball.scale.y = 0.5;
            var b = new Bullet(false, purpleball, new CircleCollider(7), new UniformMovementPattern(xs, ys));
            spawnBullet(b);
            clearFriendlyBullets();
        }).While(new FixedDuration(120))
            .Then(new OneShot(function (boss) {
            var orbs = createBulletSprite(boss.x(), boss.y(), "orb.png");
            var b = new Bullet(false, orbs, new CircleCollider(20), new SpecialPattern(function (delta, item, pattern) {
                var xd = player.x() - item.x();
                var yd = player.y() - item.y();
                var p = normalize(xd, yd);
                var speed = dif(0.5, 2, 2);
                item.sprite.x += p.x * speed * delta;
                item.sprite.y += p.y * speed * delta;
            }));
            spawnBullet(b);
        }))
            .Then(new StandingPattern().Named("Overloaded."));
    }
    function fireFirers() {
        return new RepeatPattern(function () { return [
            new OneShot(function (boss) { return fireFirerAtEdge(boss); }),
            new FixedDuration(10)
        ]; }, dif(4, 6, 7)).Then(new StandingPattern());
    }
    function fireBoardSideCannons() {
        return new PeriodicPattern(dif(100, 60, 55), function (boss) {
            fireFirer(boss, boss.x(), boss.y(), false);
        });
    }
    function singleExCircle() {
        return new OneShot(function (boss) {
            circular(0, 180, dif(10, 20, 22), function (xs, ys, rot) {
                var SPEED = 8;
                var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs * SPEED, ys * SPEED));
                spawnBullet(b);
            });
        });
    }
    function expandingCircle() {
        return singleExCircle().Then(new FixedDuration(20)).Then(singleExCircle());
    }
    function spiralDown() {
        return singleExCircle()
            .Then(new FixedDuration(20)).Then(singleExCircle())
            .Then(new FixedDuration(30)).Then(singleExCircle())
            .Then(new StandingPattern());
    }
    function main() {
        return new CombinationPattern([
            new RepeatPattern(function () {
                return [new SimpleMove(WIDTH * 4 / 6, 0, dif(1300, 1000, 1000)).Named("Advancing."),
                    new SimpleMove(0, HEIGHT * 1 / 8, dif(120, 80, 80)).Named("New line."),
                    new SimpleMove(-WIDTH * 4 / 6, 0, dif(1300, 1000, 1000)).Named("Carriage return."),
                    new SimpleMove(0, HEIGHT * 1 / 8, dif(120, 80, 80)).Named("New line.")
                ];
            }, 3).While(new RepeatPattern(function () { return [
                new RandomPattern([
                    atPlayer.Named("Targeted fire."),
                    fireBoardSideCannons().Named("Broadside cannons."),
                    fireFirers().Named("Drones."),
                    spiralDown().Named("Spiral attack."),
                ]).While(new FixedDuration(200).Named(""))
            ]; })).Then(new PeriodicPattern(20, function (boss) {
                circular(0, 360, 180, function (xs, ys) {
                    var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs * 10, ys * 10));
                    spawnBullet(b);
                });
            }).Named("End of your story.")),
            new SpecialPattern(function (delta, boss, pattern) {
                if (boss.getTag("overload") == 0 && boss.hp <= boss.bossbar.maxHP * 2 / 3) {
                    boss.tags["overload"] = 1;
                    clearEnemyBullets();
                    clearFriendlyBullets();
                    boss.pattern = new Both([boss.pattern, generateOverload()]);
                }
                if (boss.getTag("overload") == 1 && boss.hp <= boss.bossbar.maxHP * 1 / 3) {
                    boss.tags["overload"] = 2;
                    clearEnemyBullets();
                    clearFriendlyBullets();
                    boss.pattern = new Both([boss.pattern, generateOverload()]);
                }
            }).Named(""),
            new PeriodicPattern(1, function (boss) {
                if (player.y() < boss.y()) {
                    var BULLET_SPEED = 12;
                    var dx = (player.x() - boss.x());
                    var dy = (player.y() - boss.y());
                    var total = Math.sqrt(dx * dx + dy * dy);
                    var xs = BULLET_SPEED * dx / total;
                    var ys = BULLET_SPEED * dy / total;
                    var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs, ys));
                    spawnBullet(b);
                }
            }).Named("(anti-up defense active)")
        ]);
    }
    CommandVessel.main = main;
})(CommandVessel || (CommandVessel = {}));
function createDeepEyes() {
    var frammes = [];
    for (var i = 0; i < 8; i++) {
        frammes.push(PIXI.Texture.fromImage('img/eye/eye' + i + '.png'));
    }
    var enemySprite = new PIXI.extras.AnimatedSprite(frammes);
    enemySprite.x = WIDTH * 1 / 4;
    enemySprite.y = HEIGHT * 1 / 5;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    enemySprite.animationSpeed = 0.2;
    enemySprite.play();
    animatedEntities.push(enemySprite);
    var boss = new Enemy(enemySprite, new CircleCollider(143), DeepEyes.left());
    boss.hp = 400;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp, "Left Eye", 50);
    return boss;
}
function createDeepEyes2() {
    var frammes = [];
    for (var i = 0; i < 8; i++) {
        frammes.push(PIXI.Texture.fromImage('img/eye/eye' + i + '.png'));
    }
    var enemySprite = new PIXI.extras.AnimatedSprite(frammes);
    enemySprite.x = WIDTH * 3 / 4;
    enemySprite.y = HEIGHT * 1 / 5;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    enemySprite.animationSpeed = 0.2;
    enemySprite.play();
    animatedEntities.push(enemySprite);
    var boss = new Enemy(enemySprite, new CircleCollider(143), DeepEyes.right());
    boss.hp = 400;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp, "Right Eye", 90);
    return boss;
}
var DeepEyes;
(function (DeepEyes) {
    function left() {
        return createEyeBoss(true);
    }
    DeepEyes.left = left;
    function right() {
        return createEyeBoss(false);
    }
    DeepEyes.right = right;
    function createEyeBoss(left) {
        var bossMovement;
        if (left) {
            bossMovement = new SequencePattern([
                new RepeatPattern(function () { return [
                    new RepeatPattern(function () {
                        return [
                            new FixedDuration(120).While(shooting).While(rotating).Named("Full Rotation Eye Cannon"),
                            new SimpleMove(400, 0, 100).While(atPlayer).Named("Sweep"),
                            new FixedDuration(30).While(shooting2).Named("Discharge"),
                            new SimpleMove(-400, 0, 200).While(atPlayer).Named("Sweep"),
                            new FixedDuration(30).While(shooting2).Named("Discharge"),
                        ];
                    }, 1),
                    new SequencePattern([
                        new SequencePattern([
                            new SimpleMove(0, 200, 50).Named("Prime Explosive Eyes"),
                            new OneShot(fireBombs),
                            new SimpleMove(0, -200, 50).Named("Explosive Eyes"),
                        ]),
                        new SequencePattern([
                            new SimpleMove(-200, 200, 100).Named("Prime Laser"),
                            new OneShot(function (boss) {
                                var laserSprite = createBulletSprite(boss.x(), boss.y() + 300, "blueLaser.png");
                                laserSprite.scale.y = 7;
                                var bb = new Bullet(false, laserSprite, new RectangleCollider(laserSprite.width, laserSprite.height), new FollowLeaderX(boss).While(new FixedDuration(500)).Then(new OneShot(function (laser) { return laser.gone = true; })));
                                bb.indestructible = true;
                                spawnBullet(bb);
                            }),
                            new SimpleMove(1000, 0, 500).While(atPlayer).Named("Laser Sweep"),
                            new SimpleMove(-800, -200, 100).Named("Recover Self"),
                        ])
                    ])
                ]; })
            ]);
        }
        else {
            bossMovement = new SequencePattern([
                new RepeatPattern(function () { return [
                    new RepeatPattern(function () {
                        return [
                            new FixedDuration(120).While(shooting).While(rotating).Named("Full Rotation Eye Cannon"),
                            new SimpleMove(-400, 0, 100).While(atPlayer).Named("Sweep"),
                            new FixedDuration(30).While(shooting2).Named("Discharge"),
                            new SimpleMove(400, 0, 200).While(atPlayer).Named("Sweep"),
                            new FixedDuration(30).While(shooting2).Named("Discharge"),
                        ];
                    }, 1),
                    new SequencePattern([
                        new SequencePattern([
                            new SimpleMove(0, 200, 50).Named("Prime Explosive Eyes"),
                            new OneShot(fireBombs),
                            new SimpleMove(0, -200, 50).Named("Explosive Eyes"),
                        ]),
                        new SequencePattern([
                            new SimpleMove(200, 200, 100).Named("Prime Laser"),
                            new OneShot(function (boss) {
                                var laserSprite = createBulletSprite(boss.x(), boss.y() + 300, "blueLaser.png");
                                laserSprite.scale.y = 7;
                                var bb = new Bullet(false, laserSprite, new RectangleCollider(laserSprite.width, laserSprite.height), new FollowLeaderX(boss).While(new FixedDuration(500)).Then(new OneShot(function (laser) { return laser.gone = true; })));
                                bb.indestructible = true;
                                spawnBullet(bb);
                            }),
                            new SimpleMove(-1000, 0, 500).While(atPlayer).Named("Laser Sweep"),
                            new SimpleMove(800, -200, 100).Named("Recover Self"),
                        ])
                    ])
                ]; })
            ]);
        }
        function fireBombs(boss) {
            for (var i = 0; i < dif(3, 5, 6); i++) {
                var bomb = createBulletSprite(boss.x(), boss.y(), "bomb.png");
                var SPEED = 8;
                var rotation = Math.PI * i / dif(2, 4, 5);
                var xs = SPEED * 0.5 * Math.cos(rotation);
                var ys = SPEED * 0.5 * Math.sin(rotation);
                var bombPattern = new SequencePattern([
                    new UniformMovementPattern(xs, ys).While(new FixedDuration(120)),
                    new OneShot(function (bomb) {
                        bomb.gone = true;
                        for (var i = 0; i < 10; i++) {
                            var rotation = 2 * Math.PI * i / 10;
                            var xs = SPEED * 0.7 * 0.5 * Math.cos(rotation);
                            var ys = SPEED * 0.7 * 0.5 * Math.sin(rotation);
                            var smll = createBulletSprite(bomb.x(), bomb.y(), "yellowBubble.png");
                            var bs = new Bullet(false, smll, new CircleCollider(5), new SequencePattern([
                                new UniformMovementPattern(xs, ys).While(new FixedDuration(dif(30, 60, 90))),
                                new UniformMovementPattern(xs, ys).While(new DisappearingPattern(10))
                            ]));
                            spawnBullet(bs);
                        }
                    })
                ]);
                var b = new Bullet(false, bomb, new CircleCollider(16), bombPattern);
                spawnBullet(b);
            }
        }
        var rotating = new RotationPattern(24, function (angle, delta, item) {
            item.tags["rot"] = angle;
        });
        var atPlayer = new PeriodicPattern(dif(40, 16, 12), function (boss) {
            var BULLET_SPEED = 10;
            var dx = (player.x() - boss.x());
            var dy = (player.y() - boss.y());
            var total = Math.sqrt(dx * dx + dy * dy);
            var xs = BULLET_SPEED * dx / total;
            var ys = BULLET_SPEED * dy / total;
            console.log('a');
            var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "yellowBubble.png"), new CircleCollider(5), new UniformMovementPattern(xs, ys));
            spawnBullet(b);
        });
        var shooting2 = new PeriodicPattern(18, function (item) {
            for (var i = 0; i < dif(5, 10, 12); i++) {
                var bs = createBulletSprite(item.sprite.x, item.sprite.y, "blueOrb.png");
                var SPEED = 5;
                var rotation = Math.PI * i / dif(5, 10, 12);
                var xs = SPEED * 0.5 * Math.cos(rotation);
                var ys = SPEED * 0.5 * Math.sin(rotation);
                var b = new Bullet(false, bs, new CircleCollider(9), new UniformMovementPattern(xs, ys));
                spawnBullet(b);
            }
        });
        var shooting = new PeriodicPattern(dif(3, 1, 0.8), function (item, pattern) {
            var bs = createBulletSprite(item.sprite.x, item.sprite.y, "greenBubble.png");
            var SPEED = 5;
            var xs = SPEED * Math.cos(item.tags["rot"] + pattern.getTag("slowdown"));
            var ys = SPEED * Math.sin(item.tags["rot"] + pattern.getTag("slowdown"));
            pattern.tags["slowdown"] = pattern.getTag("slowdown") + 0.02;
            var b = new Bullet(false, bs, new CircleCollider(5), new UniformMovementPattern(xs, ys));
            spawnBullet(b);
        });
        return bossMovement;
    }
})(DeepEyes || (DeepEyes = {}));
function createEyeBossBoss() {
    var frammes = [];
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
    var boss = new Enemy(enemySprite, new CircleCollider(143), createEyeBoss());
    boss.hp = 800;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp);
    return boss;
}
function createEyeBoss() {
    var bossMovement = new SequencePattern([
        new RepeatPattern(function () { return [
            new RepeatPattern(function () {
                return [
                    new FixedDuration(120).While(shooting).While(rotating).Named("Full Rotation Eye Cannon"),
                    new SimpleMove(-400, 0, 100).While(atPlayer).Named("Sweep Left"),
                    new FixedDuration(30).While(shooting2).Named("Discharge"),
                    new SimpleMove(800, 0, 200).While(atPlayer).Named("Sweep Right"),
                    new FixedDuration(30).While(shooting2).Named("Discharge"),
                    new SimpleMove(-400, 0, 100).While(atPlayer).Named("Sweep Left"),
                ];
            }, 1),
            new RandomPattern([
                new SequencePattern([
                    new SimpleMove(0, 200, 50).Named("Prime Explosive Eyes"),
                    new OneShot(fireBombs),
                    new SimpleMove(0, -200, 50).Named("Explosive Eyes"),
                ]),
                new SequencePattern([
                    new SimpleMove(500, 200, 100).Named("Prime Laser"),
                    new OneShot(function (boss) {
                        var laserSprite = createBulletSprite(boss.x(), boss.y() + 300, "blueLaser.png");
                        laserSprite.scale.y = 7;
                        var bb = new Bullet(false, laserSprite, new RectangleCollider(laserSprite.width, laserSprite.height), new FollowLeaderX(boss).While(new FixedDuration(500)).Then(new OneShot(function (laser) { return laser.gone = true; })));
                        bb.indestructible = true;
                        spawnBullet(bb);
                    }),
                    new SimpleMove(-1000, 0, 500).While(atPlayer).Named("Laser Sweep"),
                    new SimpleMove(500, -200, 100).Named("Recover Self"),
                ])
            ])
        ]; })
    ]);
    function fireBombs(boss) {
        for (var i = 0; i < 5; i++) {
            var bomb = createBulletSprite(boss.x(), boss.y(), "bomb.png");
            var SPEED = 8;
            var rotation = Math.PI * i / 4;
            var xs = SPEED * 0.5 * Math.cos(rotation);
            var ys = SPEED * 0.5 * Math.sin(rotation);
            var bombPattern = new SequencePattern([
                new UniformMovementPattern(xs, ys).While(new FixedDuration(dif(120, 120, 120))),
                new OneShot(function (bomb) {
                    bomb.gone = true;
                    for (var i = 0; i < 10; i++) {
                        var rotation = 2 * Math.PI * i / 10;
                        var xs = SPEED * 0.7 * 0.5 * Math.cos(rotation);
                        var ys = SPEED * 0.7 * 0.5 * Math.sin(rotation);
                        var smll = createBulletSprite(bomb.x(), bomb.y(), "yellowBubble.png");
                        var bs = new Bullet(false, smll, new CircleCollider(5), new SequencePattern([
                            new UniformMovementPattern(xs, ys).While(new FixedDuration(dif(30, 60, 90))),
                            new UniformMovementPattern(xs, ys).While(new DisappearingPattern(10))
                        ]));
                        spawnBullet(bs);
                    }
                })
            ]);
            var b = new Bullet(false, bomb, new CircleCollider(16), bombPattern);
            spawnBullet(b);
        }
    }
    var rotating = new RotationPattern(24, function (angle, delta, item) {
        item.tags["rot"] = angle;
    });
    var atPlayer = new PeriodicPattern(dif(32, 16, 12), function (boss) {
        var BULLET_SPEED = 10;
        var dx = (player.x() - boss.x());
        var dy = (player.y() - boss.y());
        var total = Math.sqrt(dx * dx + dy * dy);
        var xs = BULLET_SPEED * dx / total;
        var ys = BULLET_SPEED * dy / total;
        var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "yellowBubble.png"), new CircleCollider(5), new UniformMovementPattern(xs, ys));
        spawnBullet(b);
    });
    var shooting2 = new PeriodicPattern(18, function (item) {
        for (var i = 0; i < dif(5, 10, 10); i++) {
            var bs = createBulletSprite(item.sprite.x, item.sprite.y, "blueOrb.png");
            var SPEED = 5;
            var rotation = Math.PI * i / dif(5, 10, 10);
            var xs = SPEED * 0.5 * Math.cos(rotation);
            var ys = SPEED * 0.5 * Math.sin(rotation);
            var b = new Bullet(false, bs, new CircleCollider(9), new UniformMovementPattern(xs, ys));
            spawnBullet(b);
        }
    });
    var shooting = new PeriodicPattern(dif(2, 1, 0.8), function (item, pattern) {
        var bs = createBulletSprite(item.sprite.x, item.sprite.y, "greenBubble.png");
        var SPEED = 5;
        var xs = SPEED * Math.cos(item.tags["rot"] + pattern.getTag("slowdown"));
        var ys = SPEED * Math.sin(item.tags["rot"] + pattern.getTag("slowdown"));
        pattern.tags["slowdown"] = pattern.getTag("slowdown") + 0.02;
        var b = new Bullet(false, bs, new CircleCollider(5), new UniformMovementPattern(xs, ys));
        spawnBullet(b);
    });
    return bossMovement;
}
function createPortal() {
    var enemySprite = PIXI.Sprite.fromImage("img/boss/portal.png");
    enemySprite.x = WIDTH / 2;
    enemySprite.y = HEIGHT * 1 / 10;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    var boss = new Enemy(enemySprite, new CircleCollider(150), Portal.main());
    boss.hp = 800;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp);
    return boss;
}
var Portal;
(function (Portal) {
    var fireFirer = function (boss) {
        var randomx = getRandomExclusive(0, 2) == 0 ? getRandomExclusive(20, 40) : getRandomExclusive(WIDTH - 40, WIDTH - 20);
        var randomy = getRandomExclusive(20, HEIGHT - 20);
        var firerPattern = new SimpleMove(randomx - boss.x(), randomy - boss.y(), 120)
            .Then(new FixedDuration(30))
            .Then(new OneShot(function (firer) {
            var BULLET_SPEED = 10;
            var dx = (player.x() - firer.x());
            var dy = (player.y() - firer.y());
            var total = Math.sqrt(dx * dx + dy * dy);
            var xs = BULLET_SPEED * dx / total;
            var ys = BULLET_SPEED * dy / total;
            firer.tags["xs"] = xs;
            firer.tags["ys"] = ys;
        }))
            .Then(new FixedDuration(dif(30, 60, 70)).While(new PeriodicPattern(4, function (firer) {
            var xs = firer.tags["xs"];
            var ys = firer.tags["ys"];
            var b = new Bullet(false, createBulletSprite(firer.x(), firer.y(), "yellowBubble.png"), new CircleCollider(5), new UniformMovementPattern(xs, ys));
            spawnBullet(b);
        })))
            .Then(new DisappearingPattern(30));
        var firer = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "fireball.png"), new CircleCollider(15), firerPattern);
        spawnBullet(firer);
    };
    var frammes = [];
    for (var i = 1; i <= 4; i++) {
        frammes.push(PIXI.Texture.fromImage('img/kraken/kr' + i + '.png'));
    }
    function fireDown() {
        return new PeriodicPattern(dif(180, 60, 45), function (octopus, pat) {
            circular(45, 135, 2, function (xs, ys) {
                var SPEED = 6;
                var b = new Bullet(false, createBulletSprite(octopus.x(), octopus.y(), "orange.png"), new CircleCollider(10), new RepeatPattern(function () { return [
                    new UniformMovementPattern(xs * SPEED, ys * SPEED).While(new FixedDuration(20)),
                    new UniformMovementPattern(-xs * SPEED, ys * SPEED).While(new FixedDuration(20))
                ]; }));
                spawnBullet(b);
            });
        });
    }
    function summonKrakens(boss, whenUp) {
        for (var i = 0; i < dif(4, 6, 10); i++) {
            var krakenSprite = new PIXI.extras.AnimatedSprite(frammes);
            krakenSprite.x = boss.x();
            krakenSprite.y = boss.y();
            krakenSprite.animationSpeed = 0.05;
            krakenSprite.play();
            krakenSprite.anchor.x = 0.5;
            krakenSprite.anchor.y = 0.5;
            var targetX = getRandomExclusive(40, WIDTH - 40);
            var targetY = 30;
            var en = new Enemy(krakenSprite, new RectangleCollider(30, 30), new SimpleMove(targetX - boss.x(), targetY - boss.y(), 60).
                Then(whenUp.While(fireDown())));
            en.hp = 1;
            en.isBoss = false;
            enemies.push(en);
            addBulletToStage(en.sprite);
        }
    }
    function krakenTop() {
        return new OneShot(function (boss) {
            summonKrakens(boss, new StandingPattern());
        });
    }
    function krakenDescending() {
        return new OneShot(function (boss) {
            summonKrakens(boss, new UniformMovementPattern(0, 1));
        });
    }
    function spawnPentagramBullet(x, y) {
        var b = new Bullet(false, createBulletSprite(x, y, "orange.png"), new CircleCollider(10), new StandingPattern());
        spawnBullet(b);
        return b;
    }
    function spawnMazeBullet(x, y, xs, ys) {
        var b = new Bullet(false, createBulletSprite(x, y, "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs, ys));
        spawnBullet(b);
        return b;
    }
    function partX(radius, angleRadians) {
        return Math.cos(angleRadians) * radius;
    }
    function partY(radius, angleRadians) {
        return Math.sin(angleRadians) * radius;
    }
    function drawPentagramLine(index, points) {
        var bulletSpeed = 8;
        return new FixedDuration(30).While(new OneShot(function (controller) { return controller.tags["i"] = 0; }).Then(new PeriodicPattern(0.5, function (controller, self) {
            controller.tags["i"]++;
            var xd = points[index + 1].x - points[index].x;
            var yd = points[index + 1].y - points[index].y;
            var lineBullet = spawnPentagramBullet(points[index].x + xd * controller.tags["i"] / 60, points[index].y + yd * controller.tags["i"] / 60);
            lineBullet.tags["line"] = index + 1;
            var n = normalize(xd, yd);
            var on = new PIXI.Point(-n.y, n.x);
            lineBullet.tags["xs"] = bulletSpeed * on.x;
            lineBullet.tags["ys"] = bulletSpeed * on.y;
        })));
    }
    function pentagram() {
        var radius = 220;
        var dr = radius / Math.sqrt(2);
        var a = Math.PI * 2 / 5;
        var points = [
            new PIXI.Point(WIDTH / 2 + partX(radius, 0), HEIGHT / 2 + partY(radius, 0)),
            new PIXI.Point(WIDTH / 2 + partX(radius, 2 * a), HEIGHT / 2 + partY(radius, 2 * a)),
            new PIXI.Point(WIDTH / 2 + partX(radius, 4 * a), HEIGHT / 2 + partY(radius, 4 * a)),
            new PIXI.Point(WIDTH / 2 + partX(radius, a), HEIGHT / 2 + partY(radius, a)),
            new PIXI.Point(WIDTH / 2 + partX(radius, 3 * a), HEIGHT / 2 + partY(radius, 3 * a)),
            new PIXI.Point(WIDTH / 2 + partX(radius, 0), HEIGHT / 2 + partY(radius, 0))
        ];
        return new OneShot(function (boss) {
            var bulletSpeed = dif(3, 8, 10);
            var controllerPattern = new PeriodicPattern(0.5, function (controller, self) {
                controller.tags["angle"] = controller.getTag("angle") + Math.PI * 2 / 60;
                var cBullet = spawnPentagramBullet(WIDTH / 2 + Math.cos(controller.tags["angle"]) * radius, HEIGHT / 2 + Math.sin(controller.tags["angle"]) * radius);
                cBullet.tags["xs"] = Math.cos(controller.tags["angle"]) * bulletSpeed;
                cBullet.tags["ys"] = Math.sin(controller.tags["angle"]) * bulletSpeed;
                cBullet.tags["circle"] = 1;
            }).While(new FixedDuration(30))
                .Then(drawPentagramLine(0, points))
                .Then(drawPentagramLine(1, points))
                .Then(drawPentagramLine(2, points))
                .Then(drawPentagramLine(3, points))
                .Then(drawPentagramLine(4, points))
                .Then(new FixedDuration(10))
                .Then(new OneShot(function (controller) {
                for (var _i = 0, bullets_3 = bullets; _i < bullets_3.length; _i++) {
                    var b = bullets_3[_i];
                    if (b.getTag("circle") == 1) {
                        b.tags["circle"] = 2;
                        b.pattern = new UniformMovementPattern(b.tags["xs"], b.tags["ys"]);
                    }
                }
            }))
                .Then(new FixedDuration(30))
                .Then(new OneShot(function (controller) {
                for (var _i = 0, bullets_4 = bullets; _i < bullets_4.length; _i++) {
                    var b = bullets_4[_i];
                    if (b.getTag("line") >= 1) {
                        b.tags["line"] = -1;
                        b.pattern = new UniformMovementPattern(b.tags["xs"], b.tags["ys"]);
                    }
                }
            }));
            var controller = new Bullet(false, new PIXI.Container(), new CircleCollider(0), controllerPattern);
            controller.tags["x"] = WIDTH / 2 - dr;
            controller.tags["y"] = HEIGHT / 2 + dr;
            controller.tags["sx"] = WIDTH / 2 - dr;
            controller.tags["sy"] = HEIGHT / 2 + dr;
            controller.tags["angle"] = Math.PI * 3 / 4;
            controller.harmless = true;
            spawnBullet(controller);
        }).Then(new FixedDuration(60));
    }
    function fourFirers() {
        return new OneShot(function (boss) {
            for (var i = 0; i < dif(5, 10, 20); i++) {
                fireFirer(boss);
            }
        });
    }
    function singleExCircle() {
        return new OneShot(function (boss) {
            circular(0, 360, dif(10, 20, 25), function (xs, ys, rot) {
                var SPEED = dif(8, 8, 12);
                var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs * SPEED, ys * SPEED));
                spawnBullet(b);
            });
        });
    }
    function expandingCircle() {
        return singleExCircle().Then(new FixedDuration(20).Named("...")).Then(singleExCircle());
    }
    function starpoint() {
        return new SequencePattern([
            expandingCircle(),
            new RandomPattern([
                krakenTop(),
                krakenDescending(),
                pentagram(),
                pentagram(),
                fourFirers(),
                fourFirers()
            ]),
            new FixedDuration(40)
        ]);
    }
    function makeMazeLevel(boss, level) {
        var BULLETCOUNT = 60;
        var SPEED = 1.2;
        for (var i = 0; i < BULLETCOUNT; i++) {
            var degrees = 180 + 45 + (i * 90 / BULLETCOUNT);
            var x = Math.cos(degreesToRadian(degrees)) / Math.cos(degreesToRadian(45)) * SPEED;
            var y = SPEED;
            if (level != 1 || i < BULLETCOUNT / 5 || i > BULLETCOUNT * 2 / 5) {
                if (level != 2 || i < BULLETCOUNT * 3 / 5 || i > BULLETCOUNT * 4 / 5) {
                    if (level != 4 || i < BULLETCOUNT * 2 / 5 || i > BULLETCOUNT * 3 / 5) {
                        var b = spawnMazeBullet(boss.x(), boss.y(), x, -y);
                    }
                }
            }
            var b = spawnMazeBullet(boss.x(), boss.y(), x, y);
        }
        for (var i = 0; i < BULLETCOUNT; i++) {
            var degrees = 180 + 45 + (i * 90 / BULLETCOUNT);
            var y = Math.cos(degreesToRadian(degrees)) / Math.cos(degreesToRadian(45)) * SPEED;
            var x = SPEED;
            if (level != 3 || i < BULLETCOUNT * 3 / 5 || i > BULLETCOUNT * 4 / 5) {
                var b = spawnMazeBullet(boss.x(), boss.y(), x, y);
            }
            var b = spawnMazeBullet(boss.x(), boss.y(), -x, y);
        }
    }
    function maze() {
        var MAZE_TIME = dif(180, 120, 100);
        return new OneShot(function (boss) {
            makeMazeLevel(boss, 1);
        }).Then(new FixedDuration(MAZE_TIME))
            .Then(new OneShot(function (boss) {
            makeMazeLevel(boss, 2);
        }))
            .Then(new FixedDuration(MAZE_TIME))
            .Then(new OneShot(function (boss) {
            makeMazeLevel(boss, 3);
        }))
            .Then(new FixedDuration(MAZE_TIME))
            .Then(new OneShot(function (boss) {
            makeMazeLevel(boss, 4);
        }))
            .Then(new FixedDuration(MAZE_TIME))
            .Then(new OneShot(function (boss) {
            circular(0, 360, 20, function (xs, ys) {
                var SPD = 4;
                var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs * SPD, ys * SPD));
                spawnBullet(b);
            });
        }))
            .Then(new FixedDuration(MAZE_TIME));
    }
    function main() {
        return new CombinationPattern([
            new RotationPattern(360, function (angle, delta, boss) {
                boss.sprite.rotation = angle;
            }).Named("48 65 6c 6c 6f"),
            new RepeatPattern(function () { return [
                new EllipseMovement(WIDTH / 2, HEIGHT / 2, WIDTH / 2, HEIGHT * 4 / 10, 270, 180, 320).Named("49 20 6c 6f 76 65 20 79 6f 75"),
                starpoint().Named("..."),
                new EllipseMovement(WIDTH / 2, HEIGHT / 2, WIDTH / 2, HEIGHT * 4 / 10, 180, 90, 150).Named("49 20 77 61 6e 74 20 66 72 69 65 6e 64 73 68 69 70 2e"),
                expandingCircle(),
                new EllipseMovement(WIDTH / 2, HEIGHT / 2, WIDTH / 2, HEIGHT * 4 / 10, 90, 0, 150).Named("46 72 69 65 6e 64 21"),
                starpoint().Named("..."),
                new EllipseMovement(WIDTH / 2, HEIGHT / 2, WIDTH / 2, HEIGHT * 4 / 10, 0, -90, 320).Named("49 20 61 6d 20 72 65 6e 65 67 61 64 65 2e"),
                new SimpleMove(0, 288, 80).Named("45 6e 74 65 72 20 74 68 65 20 6d 61 7a 65"),
                maze().Named("53 4f 52 52 59 21"),
                new SimpleMove(0, -288, 80).Named("53 6f 72 72 79"),
            ]; })
        ]);
    }
    Portal.main = main;
})(Portal || (Portal = {}));
function createTentacleBoss() {
    var enemySprite = PIXI.Sprite.fromImage("img/boss/octopus.png");
    enemySprite.x = WIDTH / 2;
    enemySprite.y = HEIGHT * 1 / 5;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    var boss = new Enemy(enemySprite, new RectangleCollider(181, 136), TentacleBoss.main());
    boss.hp = 400;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp);
    return boss;
}
function normalize(x, y) {
    var len = Math.sqrt(x * x + y * y);
    return new PIXI.Point(x / len, y / len);
}
var TentacleBoss;
(function (TentacleBoss) {
    function throwSplittingBalls(boss) {
        circular(45, 360 + 45, 8, function (xs, ys, rot) {
            var orbSpeed = dif(2, 4, 4);
            var orbs = createBulletSprite(boss.x(), boss.y(), "orb.png");
            var origPattern = new UniformMovementPattern(xs * orbSpeed, ys * orbSpeed)
                .While(new FixedDuration(60)
                .Then(new OneShot(function (orig) {
                orig.gone = true;
                circular(radiansToDegrees(rot) - 30, radiansToDegrees(rot) + 30, dif(2, 3, 3), function (x2, y2, rot2) {
                    var orbSpeed = dif(4, 8, 8);
                    var orbs = createBulletSprite(orig.x(), orig.y(), "orb.png");
                    orbs.scale.x = 0.5;
                    orbs.scale.y = 0.5;
                    var orb = new Bullet(false, orbs, new CircleCollider(10), new UniformMovementPattern(x2 * orbSpeed, y2 * orbSpeed).While(new FixedDuration(60)
                        .Then(new OneShot(function (orig) {
                        orig.gone = true;
                        circular(radiansToDegrees(rot2) - 30, radiansToDegrees(rot2) + 30, dif(2, 3, 3), function (x3, y3, rot3) {
                            var orbSpeed = dif(8, 16, 16);
                            var orbs = createBulletSprite(orig.x(), orig.y(), "orb.png");
                            orbs.scale.x = 0.5;
                            orbs.scale.y = 0.5;
                            var orb = new Bullet(false, orbs, new CircleCollider(10), new UniformMovementPattern(x3 * orbSpeed, y3 * orbSpeed));
                            spawnBullet(orb);
                        });
                    }))));
                    spawnBullet(orb);
                });
            })));
            var orb = new Bullet(false, orbs, new CircleCollider(20), origPattern);
            spawnBullet(orb);
        });
    }
    function star() {
        return new CombinationPattern([
            new RepeatPattern(function () { return [
                new RotationPattern(dif(800, 400, 300), function (ang, del, itm) { return itm.tags["rotation"] = itm.getTag("rotation") + del; }).While(new FixedDuration(120)),
                new RotationPattern(dif(800, 400, 300), function (ang, del, itm) { return itm.tags["rotation"] = itm.getTag("rotation") - del; }).While(new FixedDuration(120))
            ]; }),
            new PeriodicPattern(1, function (boss, pattern) {
                for (var i = 0; i < 4; i++) {
                    var speed = 14;
                    var rotation = boss.tags["rotation"] + Math.PI * i / 2;
                    var xs = Math.cos(rotation) * speed;
                    var ys = Math.sin(rotation) * speed;
                    var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs, ys));
                    spawnBullet(b);
                }
            }),
        ]).While(new FixedDuration(400));
    }
    function main() {
        var atPlayer = new PeriodicPattern(16, function (boss) {
            var BULLET_SPEED = 10;
            var dx = (player.x() - boss.x());
            var dy = (player.y() - boss.y());
            var total = Math.sqrt(dx * dx + dy * dy);
            var xs = BULLET_SPEED * dx / total;
            var ys = BULLET_SPEED * dy / total;
            var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "yellowBubble.png"), new CircleCollider(5), new UniformMovementPattern(xs, ys));
            spawnBullet(b);
        });
        return new RepeatPattern(function () { return [
            new RepeatPattern(function () { return [
                new OneShot(throwSplittingBalls),
                new SimpleMove(0, 100, 60).Named("'I only accept the best of souls!'")
            ]; }, 3),
            new RepeatPattern(function () { return [
                new OneShot(throwSplittingBalls),
                new SimpleMove(0, -100, 60).Named("'I only accept the best of souls!'")
            ]; }, 3),
            new FixedDuration(dif(140, 90, 40)).Named("'Have you consider GigaSoulMarket, human? I hear they have a sale.'"),
            new RepeatPattern(function () { return [
                new CustomPattern(function (boss) {
                    return new SimpleMove(player.x() - boss.x(), player.y() - boss.y(), dif(60, 40, 30));
                }),
                new FixedDuration(30)
            ]; }, 5).Named("'Sometimes they call me the Soulmand.'"),
            new CustomPattern(function (boss) {
                return new SimpleMove(WIDTH / 2 - boss.x(), HEIGHT / 2 - boss.y(), dif(100, 60, 50));
            }).Named("'Is your soul ready to be in my belly?'"),
            star().Named("'Super Star Mega Sweep!! Muhahahaha!'"),
            new SpecialPattern(function (delta, item, pattern) {
                var xd = player.x() - item.x();
                var yd = player.y() - item.y();
                var p = normalize(xd, yd);
                var speed = 5;
                item.sprite.x += p.x * speed * delta;
                item.sprite.y += p.y * speed * delta;
            }).While(new FixedDuration(dif(90, 120, 180))).Named("'Why are you running?! I am not going to do \"hentai stuff\".'"),
            new CustomPattern(function (boss) {
                return new SimpleMove(WIDTH / 2 - boss.x(), HEIGHT / 2 - boss.y(), dif(100, 60, 50));
            }).Named("'Heh. Now you'll see a \"nuke\".'"),
            new OneShot(function (boss) {
                circular(0, 360, 100, function (xs, ys, rot) {
                    var speed = dif(7, 14, 16);
                    var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs * speed, ys * speed).While(new FixedDuration(60).Then(new DisappearingPattern(20))));
                    spawnBullet(b);
                });
            }),
            new FixedDuration(10).Named("'Boom!'"),
            new CustomPattern(function (boss) {
                return new SimpleMove(WIDTH / 2 - boss.x(), HEIGHT * 1 / 5 - boss.y(), 60);
            }).While(atPlayer).Named("'Boom!'"),
        ]; });
    }
    TentacleBoss.main = main;
})(TentacleBoss || (TentacleBoss = {}));
var musicMuted;
var sfxMuted = true;
function loadSfx(name) {
    return new buzz.sound("audio/sfx/" + name, {
        volume: 40
    });
}
var sfxPlayerFire = loadSfx("Uu.wav");
sfxPlayerFire.setVolume(15);
function playSfx(sfx) {
    if (!sfxMuted) {
        sfx.stop();
        sfx.play();
    }
}
var musicVolume = 40;
var music1 = new buzz.sound("audio/music/SlimeGirlsIntro", {
    formats: ["mp3"],
    volume: musicVolume,
    preload: true
});
var music3 = new buzz.sound("audio/music/SlimeGirls3", {
    formats: ["mp3"],
    volume: musicVolume,
    preload: true
});
var lastMusicIndex = -1;
function playbackEnded() {
    while (true) {
        var i = getRandomExclusive(0, options.length);
        if (i == lastMusicIndex) {
            continue;
        }
        lastMusicIndex = i;
        console.log(i);
        music.stop();
        music = options[i];
        resumeMusic();
        break;
    }
}
var options = [music1, music3];
var music = music1;
function pauseMusic() {
    music.pause();
}
function resumeMusic() {
    if (!musicMuted) {
        music.unbind("ended");
        music.bind("ended", playbackEnded);
        music.play();
    }
}
function toggleSfx() {
    sfxMuted = !sfxMuted;
    localStorage.setItem("sfxMuted", sfxMuted ? "true" : "false");
}
function toggleMusic() {
    musicMuted = !musicMuted;
    localStorage.setItem("musicMuted", musicMuted ? "true" : "false");
    if (musicMuted) {
        music.pause();
    }
    else if (!menuOpen && !paused) {
        music.play();
    }
}
var SPEED = 7;
var temporaryGraphics;
function spawnBullet(bullet, sound) {
    if (sound === void 0) { sound = null; }
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
var gameEnded;
var numberOfBossesRemaining = 1;
var PLAYER_HP = 5;
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(doIntro) {
        var _this = _super.call(this, null, new CircleCollider(4), new StandingPattern()) || this;
        _this.hp = 1;
        _this.maxHp = 1;
        _this.controllable = true;
        _this.fireDelay = 0;
        var texture = PIXI.Texture.fromImage('img/ship.png');
        var playerSprite = new PIXI.Sprite(texture);
        var container = new PIXI.Container();
        playerSprite.anchor.x = 0.5;
        playerSprite.anchor.y = 0.65;
        playerSprite.x = 0;
        playerSprite.y = 0;
        container.x = WIDTH / 2;
        if (doIntro) {
            container.y = HEIGHT * 5 / 4;
            _this.controllable = false;
            _this.pattern = new SimpleMove(0, -HEIGHT * 2 / 4, INTRO_TIME).Then(new OneShot(function (self) { return _this.controllable = true; }));
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
        _this.sprite = container;
        return _this;
    }
    Player.prototype.loseHP = function (damage) {
        this.hp -= damage;
        this.indestructible = true;
        this.indestructibilityTicks = 120;
        this.sprite.alpha = 0.3;
        if (this.hp <= 0) {
            this.fadeout();
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
                spawnBullet(new Bullet(true, bulletSprite, new RectangleCollider(bulletSprite.width, bulletSprite.height), new UniformMovementPattern(0, -BULLET_SPEED)));
            }
            this.fireDelay = 0;
            playSfx(sfxPlayerFire);
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
            if (this.indestructibilityTicks < 0 && !gameEnded) {
                this.indestructible = false;
                this.sprite.alpha = 1;
            }
        }
    };
    return Player;
}(Item));
var PlayerBar = (function (_super) {
    __extends(PlayerBar, _super);
    function PlayerBar() {
        return _super.call(this, "Player", Colors.LightGreen, PLAYER_HP, 10) || this;
    }
    return PlayerBar;
}(LifeBar));
var autofire;
var paused = false;
var DIFFICULTY_EASIEST = 1;
var DIFFICULTY_EASY = 2;
var DIFFICULTY_NORMAL = 3;
var DIFFICULTY_HARD = 4;
var DIFFICULTY_FRUSTRATING = 5;
function dif(easy, normal, hard) {
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
var skipIntro = false;
var pauseWhenClickOut = true;
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
function difficultyToString(difficulty) {
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
            for (var _i = 0, enemies_5 = enemies; _i < enemies_5.length; _i++) {
                var en = enemies_5[_i];
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
            for (var _a = 0, enemies_6 = enemies; _a < enemies_6.length; _a++) {
                var en = enemies_6[_a];
                en.bossbar.maxHP = en.hp;
            }
            break;
        case DIFFICULTY_FRUSTRATING:
            player.hp = 5;
            for (var _b = 0, enemies_7 = enemies; _b < enemies_7.length; _b++) {
                var en = enemies_7[_b];
                en.hp = 6 / 5 * en.hp;
                en.bossbar.maxHP = en.hp;
            }
            break;
    }
    playerBar.maxHP = player.hp;
    player.maxHp = player.hp;
}
//# sourceMappingURL=compiled-code.js.map