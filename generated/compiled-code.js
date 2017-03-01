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
        if (event.keyCode != 80 && event.keyCode != 19) {
            unpause();
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
    handledKeys: [37, 39, 40, 38, 65, 17, 113, 32, 82, 90, 16, 80, 19, 27],
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
    esc: keyboard(27)
};
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
    reset();
});
var enemies = [];
var bullets = [];
var player;
var bossBar;
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
    reset();
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
ticker.add(function (delta) {
    basicText.text = "FPS: " + ticker.FPS.toPrecision(2) + "\nBullets: " + bullets.length + "\nBoss: " + enemies[0].pattern.explain();
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
    function BossBar(maxhp) {
        return _super.call(this, "Boss", Colors.YellowOrange, maxhp, 10) || this;
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
    Item.prototype.update = function (delta) {
        this.pattern.update(delta, this);
    };
    Item.prototype.x = function () {
        return this.sprite.x;
    };
    Item.prototype.y = function () {
        return this.sprite.y;
    };
    Item.prototype.isOutOfGame = function () {
        return this.sprite.x < -200 || this.sprite.y < -200 || this.sprite.x > WIDTH + 200 || this.sprite.y > HEIGHT + 200 || this.gone;
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
        if (this.friendly) {
            for (var _i = 0, enemies_1 = enemies; _i < enemies_1.length; _i++) {
                var enemy = enemies_1[_i];
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
    function RectangleCollider() {
        return _super !== null && _super.apply(this, arguments) || this;
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
        return new Rectangle(this.item.sprite.x - this.item.sprite.width / 2, this.item.sprite.y - this.item.sprite.height / 2, this.item.sprite.width * this.item.sprite.scale.x, this.item.sprite.height * this.item.sprite.scale.y);
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
function openMenu() {
    $("#mainmenu").show();
}
function giveUp() {
    gameLost();
    openMenu();
}
function pause() {
    paused = true;
    ticker.speed = 0;
}
function unpause() {
    if (paused) {
        paused = false;
        ticker.speed = 1;
    }
}
function togglePause() {
    if (paused) {
        unpause();
    }
    else {
        pause();
    }
}
function toggleAutoFire() {
    autofire = !autofire;
}
$(window).blur(function () {
    pause();
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
        this.hp -= lost;
        if (this.hp <= 0) {
            this.gone = true;
            gameWon();
        }
    };
    Enemy.prototype.update = function (delta) {
        _super.prototype.update.call(this, delta);
        if (!player.indestructible && player.collider.intersects(this.collider)) {
            player.loseHP(1);
        }
    };
    return Enemy;
}(Item));
function createEyeBoss() {
    var bossMovement = new RepeatPattern(function () { return [
        new RepeatPattern(function () {
            return [
                new FixedDuration(120).While(shooting).While(rotating),
                new SimpleMove(-400, 0, 100).While(atPlayer),
                new FixedDuration(30).While(shooting2),
                new SimpleMove(800, 0, 200).While(atPlayer),
                new FixedDuration(30).While(shooting2),
                new SimpleMove(-400, 0, 100).While(atPlayer),
            ];
        }, 1),
        new RandomPattern([
            new SequencePattern([
                new SimpleMove(0, 200, 50),
                new OneShot(fireBombs),
                new SimpleMove(0, -200, 50),
            ]),
            new SequencePattern([
                new SimpleMove(500, 200, 100),
                new OneShot(function (boss) {
                    var laserSprite = createBulletSprite(boss.x(), boss.y() + 300, "blueLaser.png");
                    laserSprite.scale.y = 7;
                    var bb = new Bullet(false, laserSprite, new RectangleCollider(), new FollowLeaderX(boss).While(new FixedDuration(500)).Then(new OneShot(function (laser) { return laser.gone = true; })));
                    bb.indestructible = true;
                    spawnBullet(bb);
                }),
                new SimpleMove(-1000, 0, 500).While(atPlayer),
                new SimpleMove(500, -200, 100),
            ])
        ])
    ]; });
    function fireBombs(boss) {
        for (var i = 0; i < 5; i++) {
            var bomb = createBulletSprite(boss.x(), boss.y(), "bomb.png");
            var SPEED = 8;
            var rotation = Math.PI * i / 4;
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
                            new UniformMovementPattern(xs, ys).While(new FixedDuration(60)),
                            new OneShot(function (risk) { return risk.gone = true; })
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
    var atPlayer = new PeriodicPattern(16, function (boss) {
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
        for (var i = 0; i < 10; i++) {
            var bs = createBulletSprite(item.sprite.x, item.sprite.y, "blueOrb.png");
            var SPEED = 5;
            var rotation = Math.PI * i / 10;
            var xs = SPEED * 0.5 * Math.cos(rotation);
            var ys = SPEED * 0.5 * Math.sin(rotation);
            var b = new Bullet(false, bs, new CircleCollider(9), new UniformMovementPattern(xs, ys));
            spawnBullet(b);
        }
    });
    var shooting = new PeriodicPattern(1, function (item, pattern) {
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
function reset() {
    stage.removeChildren();
    bullets = [];
    enemies = [];
    spawnBoss();
    player = new Player();
    bossBar = new BossBar(enemies[0].hp);
    playerBar = new PlayerBar();
    gameEnded = false;
    basicText = new PIXI.Text("FPS: ?");
    basicText.x = 10;
    basicText.y = 10;
    stage.addChild(basicText);
}
function spawnBoss() {
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
    var boss = new Enemy(enemySprite, new CircleCollider(143), createEyeBoss());
    boss.hp = 800;
    stage.addChild(enemySprite);
    enemies = [boss];
}
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
    Pattern.prototype.explain = function () {
        return "";
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
        this.angle += this.angleDiff;
        this.func(this.angle, delta, item);
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
var PlayerBar = (function (_super) {
    __extends(PlayerBar, _super);
    function PlayerBar() {
        return _super.call(this, "Player", Colors.LightGreen, PLAYER_HP, 50) || this;
    }
    return PlayerBar;
}(LifeBar));
var autofire;
var paused = false;
var difficulty = DIFFICULTY_NORMAL;
var DIFFICULTY_EASIEST = 1;
var DIFFICULTY_EASY = 2;
var DIFFICULTY_NORMAL = 3;
var DIFFICULTY_HARD = 4;
var DIFFICULTY_FRUSTRATING = 5;
//# sourceMappingURL=compiled-code.js.map