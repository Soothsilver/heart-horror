function createEyeBoss() : Pattern {
    var bossMovement =
        new RepeatPattern(() => [

            new RepeatPattern(() =>
                [
                    new FixedDuration(120).While(shooting).While(rotating),
                    new SimpleMove(-400, 0, 100).While(atPlayer),
                    new FixedDuration(30).While(shooting2),
                    new SimpleMove(800, 0, 200).While(atPlayer),
                    new FixedDuration(30).While(shooting2),
                    new SimpleMove(-400, 0, 100).While(atPlayer),
                ], 1),
            new RandomPattern([
                new SequencePattern([
                    new SimpleMove(0, 200, 50),
                    new OneShot(fireBombs),
                    new SimpleMove(0, -200, 50),
                ]),
                new SequencePattern([
                    new SimpleMove(500, 200, 100),
                    new OneShot((boss) => {
                        var laserSprite = createBulletSprite(boss.x(), boss.y() + 300, "blueLaser.png");
                        laserSprite.scale.y = 7;
                        var bb = new Bullet(false, laserSprite,
                            new RectangleCollider(), new FollowLeaderX(boss).While(new FixedDuration(500)).Then(new OneShot((laser) => laser.gone = true)));
                        bb.indestructible = true;
                        spawnBullet(bb);
                    }),
                    new SimpleMove(-1000, 0, 500).While(atPlayer),
                    new SimpleMove(500, -200, 100),
                ])
            ])
        ]);
    function fireBombs(boss: Item) {
        for (var i = 0; i < 5; i++) {
            var bomb = createBulletSprite(boss.x(), boss.y(), "bomb.png");
            var SPEED = 8;
            var rotation = Math.PI * i / 4;
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
                                new UniformMovementPattern(xs, ys).While(new FixedDuration(60)),
                                new OneShot((risk) => risk.gone = true)
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

    var atPlayer = new PeriodicPattern(16, (boss) => {
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

    var shooting = new PeriodicPattern(1, (item, pattern) => {
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