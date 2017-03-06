/// <reference path="../Pattern.ts" />
function createPortal(): Enemy {
    var enemySprite = PIXI.Sprite.fromImage("img/boss/portal.png");
    enemySprite.x = WIDTH / 2;
    enemySprite.y = HEIGHT * 1 / 10;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    var boss: Enemy = new Enemy(enemySprite, new CircleCollider(150), Portal.main());
    boss.hp = 800;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp);
    return boss;
}

namespace Portal {

    var fireFirer = function (boss) {
        var randomx = getRandomExclusive(0, 2) == 0 ? getRandomExclusive(20, 40) : getRandomExclusive(WIDTH - 40, WIDTH-20);
        var randomy = getRandomExclusive(20, HEIGHT - 20);
        var firerPattern = new SimpleMove(randomx - boss.x(), randomy - boss.y(), 120)
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
            .Then(new FixedDuration(60).While(new PeriodicPattern(4,
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
    var frammes: PIXI.Texture[] = [];
    for (var i = 1; i <= 4; i++) {
        frammes.push(PIXI.Texture.fromImage('img/kraken/kr' + i + '.png'));
    }
    function fireDown() {
        return new PeriodicPattern(60, (octopus, pat) => {
            circular(45, 135, 2, (xs, ys) => {
                var SPEED = 6;
                var b = new Bullet(false, createBulletSprite(octopus.x(), octopus.y(), "orange.png"), new CircleCollider(10),
                    new RepeatPattern(() => [
                        new UniformMovementPattern(xs * SPEED, ys * SPEED).While(new FixedDuration(20)),
                        new UniformMovementPattern(-xs * SPEED, ys * SPEED).While(new FixedDuration(20))
                    ])
                );
                spawnBullet(b);
            });
        });
    }
    function summonKrakens(boss : Item, whenUp: Pattern) {

        for (var i = 0; i < 6; i++) {
            var krakenSprite = new PIXI.extras.AnimatedSprite(frammes);
            krakenSprite.x = boss.x();
            krakenSprite.y = boss.y();
            krakenSprite.animationSpeed = 0.05;
            krakenSprite.play();
            krakenSprite.anchor.x = 0.5;
            krakenSprite.anchor.y = 0.5;
            var targetX = getRandomExclusive(40, WIDTH - 40);
            var targetY = 30;
            var en = new Enemy(krakenSprite, new RectangleCollider(30, 30),
                new SimpleMove(targetX - boss.x(), targetY - boss.y(), 60).
                    Then(whenUp.While(fireDown())));
            en.hp = 1;
            en.isBoss = false;
            enemies.push(en);
            addBulletToStage(en.sprite);
        }
    }
    function krakenTop(): Pattern {
        return new OneShot((boss) => {
            summonKrakens(boss, new StandingPattern());
        });
    }
    function krakenDescending(): Pattern {
        return new OneShot((boss) => {
            summonKrakens(boss, new UniformMovementPattern(0,1));
        });
    }
    function spawnPentagramBullet(x: number, y: number): Bullet {
        var b = new Bullet(false, createBulletSprite(x, y, "orange.png"), new CircleCollider(10), new StandingPattern());
        spawnBullet(b);
        return b;
    }
    function spawnMazeBullet(x: number, y: number, xs: number, ys: number): Bullet {
        var b = new Bullet(false, createBulletSprite(x, y, "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs, ys));
        spawnBullet(b);
        return b;
    }
    function partX(radius: number, angleRadians: number) {
        return Math.cos(angleRadians) * radius;
    }
    function partY(radius: number, angleRadians: number) {
        return Math.sin(angleRadians) * radius;
    }
    function drawPentagramLine(index: number, points: PIXI.Point[]): Pattern {
        var bulletSpeed = 8;
        return new FixedDuration(30).While(
            new OneShot((controller) => controller.tags["i"] = 0).Then(
                new PeriodicPattern(0.5, (controller, self) => {
                    controller.tags["i"]++;
                    var xd = points[index + 1].x - points[index].x;
                    var yd = points[index + 1].y - points[index].y;
                    var lineBullet = spawnPentagramBullet(points[index].x + xd * controller.tags["i"] / 60,
                        points[index].y + yd * controller.tags["i"] / 60);

                    lineBullet.tags["line"] = index + 1;
                    var n = normalize(xd, yd);
                    var on = new PIXI.Point(-n.y , n.x);
                    lineBullet.tags["xs"] = bulletSpeed * on.x;
                    lineBullet.tags["ys"] = bulletSpeed * on.y;
                })
            )
        );
    }
    function pentagram(): Pattern {
        var radius = 220;
        var dr = radius / Math.sqrt(2);
        var a = Math.PI * 2 / 5;
        var points: PIXI.Point[] = [
            new PIXI.Point(WIDTH / 2 + partX(radius, 0), HEIGHT / 2 + partY(radius, 0))//a
            ,
            new PIXI.Point(WIDTH / 2 + partX(radius, 2 * a), HEIGHT / 2 + partY(radius, 2 * a))//c
            ,
            new PIXI.Point(WIDTH / 2 + partX(radius, 4 * a), HEIGHT / 2 + partY(radius, 4 * a))//e
            ,
            new PIXI.Point(WIDTH / 2 + partX(radius, a), HEIGHT / 2 + partY(radius, a))//b
            ,
            new PIXI.Point(WIDTH / 2 + partX(radius, 3 * a), HEIGHT / 2 + partY(radius, 3 * a))//d
            ,
            new PIXI.Point(WIDTH / 2 + partX(radius, 0), HEIGHT / 2 + partY(radius, 0))//a

        ];
        return new OneShot((boss) => {
            var bulletSpeed = 8;
            var controllerPattern = new PeriodicPattern(0.5, (controller, self) => {
                controller.tags["angle"] = controller.getTag("angle") + Math.PI * 2 / 60;
                var cBullet = spawnPentagramBullet(WIDTH / 2 + Math.cos(controller.tags["angle"]) * radius,
                    HEIGHT / 2 + Math.sin(controller.tags["angle"]) * radius);
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
                .Then(new OneShot((controller) => {
                    for (var b of bullets) {
                        if (b.getTag("circle") == 1) {
                            b.tags["circle"] = 2;
                            b.pattern = new UniformMovementPattern(b.tags["xs"], b.tags["ys"]);
                        }
                    }
                }))
                .Then(new FixedDuration(30))
                .Then(new OneShot((controller) => {
                    for (var b of bullets) {
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
    function fourFirers(): Pattern {
        return new OneShot((boss) => {
            for (var i = 0; i < 10; i++) {
                fireFirer(boss);
            }
        });

    }
    function singleExCircle(): Pattern {
        return new OneShot((boss) => {
            circular(0, 360, 20, (xs, ys, rot) => {
                var SPEED = 8;
                var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs * SPEED, ys * SPEED));
                spawnBullet(b);
            });
        });
    }
    function expandingCircle(): Pattern {
        return singleExCircle().Then(new FixedDuration(20)).Then(singleExCircle());
    }
    function starpoint(): Pattern {
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
    function makeMazeLevel(boss: Item, level: number) {
        var BULLETCOUNT = 60;
        var SPEED = 1.2;
        // Top/bottom
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
        // Left/right
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
    function maze(): Pattern {
        var MAZE_TIME = 120;
        return new OneShot((boss) => {
            makeMazeLevel(boss, 1);
        }).Then(
            new FixedDuration(MAZE_TIME))
            .Then(new OneShot((boss) => {
                makeMazeLevel(boss, 2);
            }))
            .Then(
            new FixedDuration(MAZE_TIME))
            .Then(new OneShot((boss) => {
                makeMazeLevel(boss, 3);
            }))
            .Then(
            new FixedDuration(MAZE_TIME))
            .Then(new OneShot((boss) => {
                makeMazeLevel(boss, 4);
            }))
            .Then(new FixedDuration(MAZE_TIME))
            .Then(new OneShot((boss) => {
                circular(0, 360, 20, (xs, ys) => {
                    var SPD = 4;
                    var b = new Bullet(false, createBulletSprite(boss.x(), boss.y(), "blueOrb.png"), new CircleCollider(9), new UniformMovementPattern(xs*SPD, ys*SPD));
                    spawnBullet(b);
                });
            }))
            .Then(new FixedDuration(MAZE_TIME))
        ;
    }
    export function main(): Pattern {
        return new CombinationPattern([
            new RotationPattern(360, (angle, delta, boss) => {
                boss.sprite.rotation = angle;
            }),
            /*
            new SequencePattern([
            new SimpleMove(0, 288, 120),
            maze(),
            new SimpleMove(0, -288, 120)])*/
            //pentagram()
            
            new RepeatPattern(() => [
                
                new EllipseMovement(WIDTH / 2, HEIGHT / 2, WIDTH / 2, HEIGHT * 4 / 10, 270, 180, 320),
                starpoint(),
                new EllipseMovement(WIDTH / 2, HEIGHT / 2, WIDTH / 2, HEIGHT * 4 / 10, 180, 90, 150),
                expandingCircle(),
                new EllipseMovement(WIDTH / 2, HEIGHT / 2, WIDTH / 2, HEIGHT * 4 / 10, 90, 0, 150),
                starpoint(),
                new EllipseMovement(WIDTH / 2, HEIGHT / 2, WIDTH / 2, HEIGHT * 4 / 10, 0, -90, 320),
                new SimpleMove(0, 288, 80),
                maze(),
                new SimpleMove(0, -288, 80),
                
                ])
        ]);
    }
}