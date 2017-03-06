/// <reference path="../Pattern.ts" />
function createCommandVessel(): Enemy {
    var enemySprite = PIXI.Sprite.fromImage("img/boss/cs.png");
    enemySprite.x = WIDTH * 1 / 6;
    enemySprite.y = HEIGHT * 1 / 6;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    var boss: Enemy = new Enemy(enemySprite, new RectangleCollider(430,180), CommandVessel.main());
    boss.hp = 800;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp);
    return boss;
}
namespace CommandVessel {
    var fireFirerAtEdge = function (boss: Item) : Bullet {

        var randomx = getRandomExclusive(0, 2) == 0 ? getRandomExclusive(20, 40) : getRandomExclusive(WIDTH - 40, WIDTH - 20);
        var randomy = getRandomExclusive(20, HEIGHT - 20);
        return fireFirer(boss, randomx, randomy, true);
    }
    function createEmptyContainer(x, y) {
        var p = new PIXI.Container();
        p.x = x;
        p.y = y;
        return p;
    }
    var fireFirer = function (boss: Item, x: number, y: number, visible: boolean): Bullet {
        var firerPattern = (visible ? new SimpleMove(x - boss.x(), y - boss.y(), visible ? 120 : 0) : new OneShot((boss) => { }))
            .Then(new FixedDuration(visible ? 30 : 0))
            .Then(new OneShot((firer) => {
                var BULLET_SPEED = visible ? 10 : 20;
                var dx = (player.x() - firer.x());
                var dy = (player.y() - firer.y());
                var total = Math.sqrt(dx * dx + dy * dy);
                var xs = BULLET_SPEED * dx / total;
                var ys = BULLET_SPEED * dy / total;
                firer.tags["xs"] = xs;
                firer.tags["ys"] = ys;
            }))
            .Then(new FixedDuration(visible ? 60 : 20).While(new PeriodicPattern(visible ? 4 : 2,
                (firer) => {
                    var xs = firer.tags["xs"];
                    var ys = firer.tags["ys"];
                    var b = new Bullet(false, createBulletSprite(firer.x(), firer.y(), "yellowBubble.png"), new CircleCollider(5), new UniformMovementPattern(xs, ys));
                    spawnBullet(b);
                })))
            .Then(new DisappearingPattern(30));
        var firer = new Bullet(false, visible ? createBulletSprite(boss.x(), boss.y(), "fireball.png") : createEmptyContainer(boss.x(), boss.y()), new CircleCollider(visible ? 15 : 0), firerPattern);
        spawnBullet(firer);
        return firer;
    }

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
    function generateOverload(): Pattern {
        return new PeriodicPattern(1, (boss) => {
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
            .Then(new OneShot((boss) => {
                var orbs = createBulletSprite(boss.x(), boss.y(), "orb.png");
                var b = new Bullet(false, orbs, new CircleCollider(20), new SpecialPattern((delta, item, pattern) => {
                    var xd = player.x() - item.x();
                    var yd = player.y() - item.y();
                    var p: PIXI.Point = normalize(xd, yd);
                    var speed = 2;
                    item.sprite.x += p.x * speed * delta;
                    item.sprite.y += p.y * speed * delta
                }));
                spawnBullet(b);
            }))
            .Then(new StandingPattern().Named("Done."));
    }
    function fireFirers() {
        return new RepeatPattern(() => [
            new OneShot((boss) => fireFirerAtEdge(boss)),
            new FixedDuration(10)
        ], 6).Then(new StandingPattern());
    }
    function fireBoardSideCannons() {
        return new PeriodicPattern(60, (boss) => {
            fireFirer(boss, boss.x(), boss.y(), false);
        });
    }
    function singleExCircle(): Pattern {
        return new OneShot((boss) => {
            circular(0, 180, 20, (xs, ys, rot) => {
                var SPEED = 8;
                var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs * SPEED, ys * SPEED));
                spawnBullet(b);
            });
        });
    }
    function expandingCircle(): Pattern {
        return singleExCircle().Then(new FixedDuration(20)).Then(singleExCircle());
    }
    function spiralDown() {
        return singleExCircle()
            .Then(new FixedDuration(20)).Then(singleExCircle())
            .Then(new FixedDuration(30)).Then(singleExCircle())
            .Then(new StandingPattern());
    }
    export function main(): Pattern {
        return new
            CombinationPattern([
                new RepeatPattern(() =>
                    [new SimpleMove(WIDTH * 4 / 6, 0, 1000),
                    new SimpleMove(0, HEIGHT * 1 / 8, 80),
                    new SimpleMove(-WIDTH * 4 / 6, 0, 1300),
                    new SimpleMove(0, HEIGHT * 1 / 8, 80)
                    ], 3).While(
                    new RepeatPattern(() => [
                        new RandomPattern([
                            atPlayer,
                           fireBoardSideCannons(),
                          fireFirers(),
                            spiralDown(),
                        ]).While(new FixedDuration(200))
                    ])
                    ).Then(new PeriodicPattern(20, (boss) => {
                        circular(0, 360, 180, (xs, ys) => {
                            var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"),
                                new CircleCollider(9), new UniformMovementPattern(xs * 10, ys * 10));
                            spawnBullet(b);
                        });
                    })),
                new SpecialPattern((delta, boss, pattern) => {
                    if (boss.getTag("overload") == 0 && (boss as Enemy).hp <= (boss as Enemy).bossbar.maxHP * 2 / 3) {
                        // 2/3
                        boss.tags["overload"] = 1;
                        clearEnemyBullets();
                        clearFriendlyBullets();
                        boss.pattern = new Both([boss.pattern, generateOverload()]);
                    }
                    if (boss.getTag("overload") == 1 && (boss as Enemy).hp <= (boss as Enemy).bossbar.maxHP * 1 / 3) {
                        // 2/3
                        boss.tags["overload"] = 2;
                        clearEnemyBullets();
                        clearFriendlyBullets();
                        boss.pattern = new Both([boss.pattern, generateOverload()]);
                    }

                }),
                new PeriodicPattern(1, (boss) => {
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

                })
            ]);

    }
}