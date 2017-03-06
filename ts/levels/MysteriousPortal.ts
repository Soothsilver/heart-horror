/// <reference path="../Pattern.ts" />
function createPortal(): Enemy {
    var enemySprite = PIXI.Sprite.fromImage("img/boss/stargate.png");
    enemySprite.x = WIDTH / 2;
    enemySprite.y = HEIGHT * 1 / 5;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    var boss: Enemy = new Enemy(enemySprite, new CircleCollider(275), Portal.main());
    boss.hp = 800;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp);
    return boss;
}
namespace Portal {
    export function main(): Pattern {
        return new CombinationPattern([
            new RotationPattern(60, (angle, delta, boss) => {
                boss.sprite.rotation = angle;
            }),
            new RepeatPattern(() => [



                ])
        ]);
    }
}