/// <reference path="../Pattern.ts" />
function createDeepEyes(): Enemy {
    var enemySprite = PIXI.Sprite.fromImage("img/boss/octopus.png");
    enemySprite.x = WIDTH / 2;
    enemySprite.y = HEIGHT * 1 / 5;
    enemySprite.anchor.x = 0.5;
    enemySprite.anchor.y = 0.5;
    var boss: Enemy = new Enemy(enemySprite, new RectangleCollider(181, 136), DeepEyes.main());
    boss.hp = 800;
    boss.isBoss = true;
    boss.bossbar = new BossBar(boss.hp);
    return boss;
}
namespace DeepEyes {
    export function main(): Pattern {
        return new StandingPattern();
    }
}