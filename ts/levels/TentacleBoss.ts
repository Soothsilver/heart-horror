/// <reference path="../Pattern.ts" />
function createTentacleBoss(): Enemy {
    var enemySprite = PIXI.Sprite.fromImage("img/boss/octopus.png");
    enemySprite.x = WIDTH / 2;
    enemySprite.y = HEIGHT * 1 / 5;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    var boss: Enemy = new Enemy(enemySprite, new RectangleCollider(181, 136), TentacleBoss.main());
    boss.hp = 800;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp);
    return boss;
}

namespace TentacleBoss {
    function throwSplittingBalls(boss: Item) {
        circular(45, 360 + 45, 8, (xs, ys, rot) => {
            var orbSpeed = 5;
            console.log(rot);
            var orbs = createBulletSprite(boss.x(), boss.y(), "orb.png");
            var origPattern = new UniformMovementPattern(xs * orbSpeed, ys * orbSpeed)
                .While(
                new FixedDuration(60)
                    .Then(new OneShot((orig) => {
                        orig.gone = true;
                        circular(radiansToDegrees(rot) - 30, radiansToDegrees(rot) + 30, 3, (x2, y2, rot2) => {
                            var orbSpeed = 5;
                            var orbs = createBulletSprite(orig.x(), orig.y(), "orb.png");
                            orbs.scale.x = 0.5;
                            orbs.scale.y = 0.5;
                            var orb = new Bullet(false, orbs, new CircleCollider(10), new UniformMovementPattern(x2 * orbSpeed, y2 * orbSpeed).While(
                                new FixedDuration(60)
                                    .Then(new OneShot((orig) => {
                                        orig.gone = true;
                                        circular(radiansToDegrees(rot2) - 30, radiansToDegrees(rot2) + 30, 3, (x3, y3, rot3) => {
                                            var orbSpeed = 5;
                                            var orbs = createBulletSprite(orig.x(), orig.y(), "orb.png");
                                            orbs.scale.x = 0.25;
                                            orbs.scale.y = 0.25;
                                            var orb = new Bullet(false, orbs, new CircleCollider(5), new UniformMovementPattern(x3 * orbSpeed, y3 * orbSpeed));
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
    export function main(): Pattern {

        var atPlayer = new PeriodicPattern(16, (boss) => {
            var BULLET_SPEED = 10;
            var dx = (player.x() - boss.x());
            var dy = (player.y() - boss.y());
            var total = Math.sqrt(dx * dx + dy * dy);
            var xs = BULLET_SPEED * dx / total;
            var ys = BULLET_SPEED * dy / total;
            var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "yellowBubble.png"), new CircleCollider(5), new UniformMovementPattern(xs, ys));
            spawnBullet(b);
        });

        return new RepeatPattern(() => [
            new RepeatPattern(() => [
                new OneShot(throwSplittingBalls),
                new SimpleMove(0, 100, 60).Named("'I spit death, puny human!'")
            ], 3),
            new RepeatPattern(() => [
                new OneShot(throwSplittingBalls),
                new SimpleMove(0, -100, 60).Named("'I spit death, puny human!'")
            ], 3),
            new FixedDuration(30),
            new RepeatPattern(() => [
                new CustomPattern((boss) => {
                    return new SimpleMove(player.x() - boss.x(), player.y() - boss.y(), 30)
                }),
                new FixedDuration(30)
            ], 5),
            new CustomPattern((boss) => {
                return new SimpleMove(WIDTH / 2 - boss.x(), HEIGHT / 2 - boss.y(), 60)
            }),
            new FixedDuration(120) // rotate
            ,
            new SpecialPattern((delta, item, pattern) => {
                var xd = player.x() - item.x();
                var yd = player.y() - item.y();
                // TODO math
                // follow player

            }).While(new FixedDuration(120)),
            new CustomPattern((boss) => {
                return new SimpleMove(WIDTH / 2 - boss.x(), HEIGHT / 2 - boss.y(), 60)
            }),
            new OneShot((boss) => {
                circular(0, 360, 100, (xs, ys, rot) => {
                    var speed = 14;
                    var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs * speed, ys * speed).While(
                        new FixedDuration(60).Then(new DisappearingPattern(20))

                    ));
                    spawnBullet(b);
                });
            }),
            new FixedDuration(10)
            ,
            new CustomPattern((boss) => {
                return new SimpleMove(WIDTH / 2 - boss.x(), HEIGHT * 1 / 5 - boss.y(), 60)
            }).While(atPlayer),
        ]);
    }
}