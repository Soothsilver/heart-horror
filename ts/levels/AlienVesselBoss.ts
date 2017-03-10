/// <reference path="../Pattern.ts" />
function createAlienVesselBoss(): Enemy {
    var enemySprite = PIXI.Sprite.fromImage("img/boss/blackship.png");
    enemySprite.x = WIDTH / 2;
    enemySprite.y = HEIGHT * 1 / 5;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    var boss: Enemy = new Enemy(enemySprite, new RectangleCollider(413, 140), AlienVessel.alienVessel());
    boss.hp = 1000;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp);
    return boss;
}
function radiansToDegrees(angle: number) {
    return angle * 360 / (Math.PI * 2)
}
function degreesToRadian(angle: number) {
    return angle * Math.PI * 2 / 360;
}
function circular(fromAngle: number, toAngle: number, totalShots: number, func : (xs: number, ys: number, rot : number) => void)
{
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
namespace AlienVessel {
    function circles() {
        return new PeriodicPattern(12, (boss, self) => {
            var SPEED = 8;
            circular(0, 360, 9, (xs, ys) => {
                var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs * SPEED, ys * SPEED));
                spawnBullet(b);
            });
        });
    }
    function zigleft() {
        return new RepeatPattern(() => [
            new SimpleMove(-100, 100, 50).While(circles()),
            new SimpleMove(-100, -100, 50).While(circles()),
        ], 2);
    }
    var atPlayer = new PeriodicPattern(dif(32,16,12), (boss) => {
        var BULLET_SPEED = 10;
        var dx = (player.x() - boss.x());
        var dy = (player.y() - boss.y());
        var total = Math.sqrt(dx * dx + dy * dy);
        var xs = BULLET_SPEED * dx / total;
        var ys = BULLET_SPEED * dy / total;
        var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "yellowBubble.png"), new CircleCollider(5), new UniformMovementPattern(xs, ys));
        spawnBullet(b);
    });
    var fireDown = new PeriodicPattern(dif(50,36,20), (boss, self) => {
        var SPEED = 4;
        circular(40, 140, 5, (xs, ys) => {
            var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs * SPEED, ys * SPEED));
            spawnBullet(b);
        });
    });
    var laser = function (boss) {
        var laserSprite = createBulletSprite(boss.x() + 800, boss.y(), "horizontalLaser.png");
        var bb = new Bullet(false, laserSprite,
            new RectangleCollider(laserSprite.width, laserSprite.height), new FixedDuration(10).Then(new OneShot((laser) => laser.gone = true)));
        bb.indestructible = true;
        spawnBullet(bb);
    };
    var fireFirer = function (boss) {
        var randomx = getRandomExclusive(20, WIDTH - 20);
        var randomy = getRandomExclusive(20, HEIGHT - 20);
        var firerPattern = new SimpleMove(randomx - boss.x(), randomy - boss.y(), dif(120,120,70))
            .Then(new FixedDuration(30))
            .Then(new OneShot((firer) => {
                var BULLET_SPEED = 10;
                var dx = (player.x() - firer.x());
                var dy = (player.y() - firer.y());
                var total = Math.sqrt(dx * dx + dy * dy);
                var xs = BULLET_SPEED * dx / total;
                var ys = BULLET_SPEED * dy / total;
                firer.tags["xs"] = xs;
                firer.tags["ys"] = ys;
            }))
            .Then(new FixedDuration(dif(30,60,80)).While(new PeriodicPattern(4,
                (firer) => {
                    var xs = firer.tags["xs"];
                    var ys = firer.tags["ys"];
                    var b = new Bullet(false, createBulletSprite(firer.x(), firer.y(), "yellowBubble.png"), new CircleCollider(5), new UniformMovementPattern(xs, ys));
                    spawnBullet(b);
                })))
            .Then(new DisappearingPattern(30));
        var firer = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "fireball.png"), new CircleCollider(15), firerPattern);
        spawnBullet(firer);
    }
    var fireFirers = function (boss) {
        for (var i = 0; i < 3; i++) {
            fireFirer(boss);          
        }
    }
    var overload = new PeriodicPattern(dif(20,10,6), (boss) => {
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
    export function alienVessel(): Pattern {
        return new RepeatPattern(() => [
            zigleft().Named("Vessel assumes attack position."),
            new FixedDuration(dif(90,60,50)).While(atPlayer).Named("Vessel commander chooses course of action."),
            new RandomPattern([
                
                new SequencePattern([
                    new SimpleMove(800, 0, 200).While(new PeriodicPattern(dif(40,20,12), (boss) => {
                        fireFirer(boss);
                    })).Named("Vessel ejecting auxiliary drones."),
                    new OneShot((boss) => { boss.tags["speed"] = getRandomExclusive(200, 700); }),
                    new CustomPattern((boss) => new SimpleMove(0, boss.tags["speed"], 120 * boss.tags["speed"] / 700)).While(overload).Named("Vessel is overloading!!!"),
                    new CustomPattern((boss) => new SimpleMove(0, -boss.tags["speed"], 120 * boss.tags["speed"] / 700)).While(overload).Named("Vessel is recovering from overload."),
                    new SimpleMove(-400, 0, 60).Named("Vessel crew puts out fires.")
                ]),
                
                
                new SequencePattern([
                    new SimpleMove(0, 600, dif(80,60,50)).While(atPlayer).Named("Vessel is navigating the battle space."),
                    new RepeatPattern(() => [
                        new SimpleMove(0, -100, dif(50,30,20)).While(fireDown).Named("Vessel is returning up."),
                        new OneShot(laser),
                        new FixedDuration(dif(20,10,6)).Named("Vessel is discharging primary weapon.")
                    ], 6),
                    new OneShot(fireFirers),
                    new SimpleMove(400, 0, 60).Named("Vessel crew is vacationing.")
                ])
                
                ])

        ])

            ;
    
    }
}