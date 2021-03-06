﻿/// <reference path="../Pattern.ts" />
function createDeepEyes(): Enemy {
    var frammes: PIXI.Texture[] = [];
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
    var boss: Enemy = new Enemy(enemySprite, new CircleCollider(143), DeepEyes.left());
    boss.hp = 400;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp, "Left Eye", 50);
    return boss;
}
function createDeepEyes2(): Enemy {
    var frammes: PIXI.Texture[] = [];
    for (var i = 0; i < 8; i++) {
        frammes.push(PIXI.Texture.fromImage('img/eye/eye' + i + '.png'));
    }
    var enemySprite = new PIXI.extras.AnimatedSprite(frammes);
    enemySprite.x = WIDTH * 3/ 4;
    enemySprite.y = HEIGHT * 1 / 5;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    enemySprite.animationSpeed = 0.2;
    enemySprite.play();
    animatedEntities.push(enemySprite);
    var boss: Enemy = new Enemy(enemySprite, new CircleCollider(143), DeepEyes.right());
    boss.hp = 400;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp, "Right Eye", 90);
    return boss;
}
namespace DeepEyes {
    export function left(): Pattern {
        return createEyeBoss(true);
    } export function right(): Pattern {
        return createEyeBoss(false);
    }
    function createEyeBoss(left : boolean): Pattern {
        var bossMovement: Pattern;
        if (left) {
            bossMovement = new SequencePattern([
                new RepeatPattern(() => [
                    new RepeatPattern(() =>
                        [
                            new FixedDuration(120).While(shooting).While(rotating).Named("Full Rotation Eye Cannon"),
                            new SimpleMove(400, 0, 100).While(atPlayer).Named("Sweep"),
                            new FixedDuration(30).While(shooting2).Named("Discharge"),
                            new SimpleMove(-400, 0, 200).While(atPlayer).Named("Sweep"),
                            new FixedDuration(30).While(shooting2).Named("Discharge"),
                        ], 1),
                    new SequencePattern([
                        new SequencePattern([
                            new SimpleMove(0, 200, 50).Named("Prime Explosive Eyes"),
                            new OneShot(fireBombs),
                            new SimpleMove(0, -200, 50).Named("Explosive Eyes"),
                        ]),
                        new SequencePattern([
                            new SimpleMove(-200, 200, 100).Named("Prime Laser"),
                            new OneShot((boss) => {
                                var laserSprite = createBulletSprite(boss.x(), boss.y() + 300, "blueLaser.png");
                                laserSprite.scale.y = 7;
                                var bb = new Bullet(false, laserSprite,
                                    new RectangleCollider(laserSprite.width, laserSprite.height), new FollowLeaderX(boss).While(new FixedDuration(500)).Then(new OneShot((laser) => laser.gone = true)));
                                bb.indestructible = true;
                                spawnBullet(bb);
                            }),
                            new SimpleMove(1000, 0, 500).While(atPlayer).Named("Laser Sweep"),
                            new SimpleMove(-800, -200, 100).Named("Recover Self"),
                        ])
                    ])
                ])
            ]);
        } else {
            bossMovement = new SequencePattern([
                new RepeatPattern(() => [
                    new RepeatPattern(() =>
                        [
                            new FixedDuration(120).While(shooting).While(rotating).Named("Full Rotation Eye Cannon"),
                            new SimpleMove(-400, 0, 100).While(atPlayer).Named("Sweep"),
                            new FixedDuration(30).While(shooting2).Named("Discharge"),
                            new SimpleMove(400, 0, 200).While(atPlayer).Named("Sweep"),
                            new FixedDuration(30).While(shooting2).Named("Discharge"),
                        ], 1),
                    new SequencePattern([
                        new SequencePattern([
                            new SimpleMove(0, 200, 50).Named("Prime Explosive Eyes"),
                            new OneShot(fireBombs),
                            new SimpleMove(0, -200, 50).Named("Explosive Eyes"),
                        ]),
                        new SequencePattern([
                            new SimpleMove(200, 200, 100).Named("Prime Laser"),
                            new OneShot((boss) => {
                                var laserSprite = createBulletSprite(boss.x(), boss.y() + 300, "blueLaser.png");
                                laserSprite.scale.y = 7;
                                var bb = new Bullet(false, laserSprite,
                                    new RectangleCollider(laserSprite.width, laserSprite.height), new FollowLeaderX(boss).While(new FixedDuration(500)).Then(new OneShot((laser) => laser.gone = true)));
                                bb.indestructible = true;
                                spawnBullet(bb);
                            }),
                            new SimpleMove(-1000, 0, 500).While(atPlayer).Named("Laser Sweep"),
                            new SimpleMove(800, -200, 100).Named("Recover Self"),
                        ])
                    ])
                ])
            ]);
        }
        function fireBombs(boss: Item) {
            for (var i = 0; i < dif(3,5,6); i++) {
                var bomb = createBulletSprite(boss.x(), boss.y(), "bomb.png");
                var SPEED = 8;
                var rotation = Math.PI * i / dif(2,4,5);
                var xs = SPEED * 0.5 * Math.cos(rotation);
                var ys = SPEED * 0.5 * Math.sin(rotation);
                var bombPattern = new SequencePattern([
                    new UniformMovementPattern(xs, ys).While(new FixedDuration(120)),
                    new OneShot((bomb) => {
                        bomb.gone = true;

                        for (var i = 0; i < 10; i++) {
                            var rotation = 2 * Math.PI * i / 10;
                            var xs = SPEED * 0.7 * 0.5 * Math.cos(rotation);
                            var ys = SPEED * 0.7 * 0.5 * Math.sin(rotation);
                            var smll = createBulletSprite(bomb.x(), bomb.y(), "yellowBubble.png");
                            var bs = new Bullet(false, smll, new CircleCollider(5),
                                new SequencePattern([
                                    new UniformMovementPattern(xs, ys).While(new FixedDuration(dif(30,60,90))),
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
        var rotating = new RotationPattern(24, (angle, delta, item) => {
            item.tags["rot"] = angle;
        });
        var atPlayer = new PeriodicPattern(dif(40,16,12), (boss) => {
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
        var shooting2 = new PeriodicPattern(18, (item) => {
            for (var i = 0; i < dif(5,10,12); i++) {
                var bs = createBulletSprite(item.sprite.x, item.sprite.y, "blueOrb.png");
                var SPEED = 5;
                var rotation = Math.PI * i / dif(5,10,12);
                var xs = SPEED * 0.5 * Math.cos(rotation);
                var ys = SPEED * 0.5 * Math.sin(rotation);
                var b = new Bullet(false, bs, new CircleCollider(9), new UniformMovementPattern(xs, ys));
                spawnBullet(b);
            }
        });
        var shooting = new PeriodicPattern(dif(3,1,0.8), (item, pattern) => {
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
}