/// <reference path="../Pattern.ts" />
function createTentacleBoss(): Enemy {
    var enemySprite = PIXI.Sprite.fromImage("img/boss/octopus.png");
    enemySprite.x = WIDTH / 2;
    enemySprite.y = HEIGHT * 1 / 5;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    var boss: Enemy = new Enemy(enemySprite, new RectangleCollider(181, 136), TentacleBoss.main());
    boss.hp = 400;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp);
    return boss;
}
function normalize(x: number, y: number): PIXI.Point {
    var len = Math.sqrt(x * x + y * y);
    return new PIXI.Point(x / len, y / len);
}

namespace TentacleBoss {
    function throwSplittingBalls(boss: Item) {
        circular(45, 360 + 45, 8, (xs, ys, rot) => {
            var orbSpeed = 4;
            console.log(rot);
            var orbs = createBulletSprite(boss.x(), boss.y(), "orb.png");
            var origPattern = new UniformMovementPattern(xs * orbSpeed, ys * orbSpeed)
                .While(
                new FixedDuration(60)
                    .Then(new OneShot((orig) => {
                        orig.gone = true;
                        circular(radiansToDegrees(rot) - 30, radiansToDegrees(rot) + 30, 3, (x2, y2, rot2) => {
                            var orbSpeed = 8;
                            var orbs = createBulletSprite(orig.x(), orig.y(), "orb.png");
                            orbs.scale.x = 0.5;
                            orbs.scale.y = 0.5;
                            var orb = new Bullet(false, orbs, new CircleCollider(10), new UniformMovementPattern(x2 * orbSpeed, y2 * orbSpeed).While(
                                new FixedDuration(60)
                                    .Then(new OneShot((orig) => {
                                        orig.gone = true;
                                        circular(radiansToDegrees(rot2) - 30, radiansToDegrees(rot2) + 30, 3, (x3, y3, rot3) => {
                                            var orbSpeed = 16;
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
    function star(): Pattern {
        return new CombinationPattern([
            new RepeatPattern(() => [
                new RotationPattern(400, (ang, del, itm) => itm.tags["rotation"] = itm.getTag("rotation") + del).While(new FixedDuration(120)),
                new RotationPattern(400, (ang, del, itm) => itm.tags["rotation"] = itm.getTag("rotation") - del).While(new FixedDuration(120))
            ]),
            new PeriodicPattern(1, (boss, pattern) => {
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
                new SimpleMove(0, 100, 60).Named("'I only accept the best of souls!'")
            ], 3),
            new RepeatPattern(() => [
                new OneShot(throwSplittingBalls),
                new SimpleMove(0, -100, 60).Named("'I only accept the best of souls!'")
            ], 3),
            new FixedDuration(90).Named("'Have you consider GigaSoulMarket, human? I hear they have a sale.'"),
            new RepeatPattern(() => [
                new CustomPattern((boss) => {
                    return new SimpleMove(player.x() - boss.x(), player.y() - boss.y(), 40)
                }),
                new FixedDuration(30)
            ], 5).Named("'Sometimes they call me the Soulmand.'"),
            new CustomPattern((boss) => {
                return new SimpleMove(WIDTH / 2 - boss.x(), HEIGHT / 2 - boss.y(), 60)
            }).Named("'Is your soul ready to be in my belly?'"),
            star().Named("'Super Star Mega Sweep!! Muhahahaha!'"),
            new SpecialPattern((delta, item, pattern) => {
                var xd = player.x() - item.x();
                var yd = player.y() - item.y();
                var p: PIXI.Point = normalize(xd, yd);
                var speed = 5;
                item.sprite.x += p.x * speed * delta;
                item.sprite.y += p.y * speed * delta

            }).While(new FixedDuration(120)).Named("'Why are you running?! I am not going to do \"hentai stuff\".'"),
            new CustomPattern((boss) => {
                return new SimpleMove(WIDTH / 2 - boss.x(), HEIGHT / 2 - boss.y(), 60)
            }).Named("'Heh. Now you'll see a \"nuke\".'"),
            new OneShot((boss) => {
                circular(0, 360, 100, (xs, ys, rot) => {
                    var speed = 14;
                    var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs * speed, ys * speed).While(
                        new FixedDuration(60).Then(new DisappearingPattern(20))

                    ));
                    spawnBullet(b);
                });
            }),
            new FixedDuration(10).Named("'Boom!'")
            ,
            new CustomPattern((boss) => {
                return new SimpleMove(WIDTH / 2 - boss.x(), HEIGHT * 1 / 5 - boss.y(), 60)
            }).While(atPlayer).Named("'Boom!'"),
        ]);
    }
}