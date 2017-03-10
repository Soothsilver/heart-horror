///<reference path="ts/Level.ts" />
var WIDTH = 1280;
var HEIGHT = 720;
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT, { backgroundColor: 0x1099bb });
var stage = new PIXI.Container();
var ticker = new PIXI.ticker.Ticker();
ticker.add(() => renderer.render(stage));
ticker.start();

renderer.render(stage);
$(document).ready(() => {
    document.getElementById("viewport").appendChild(renderer.view);
    loadLocalStorage();
    openMenu();
    //startLevel(Levels.CommandVessel);
});
 

// Interface
var playerBar: PlayerBar;
var basicText: PIXI.Text;
var showColliders: boolean = false; 

 
function createBulletSprite(x: number, y: number, img: string): PIXI.Sprite {
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
}
buttons.r.release = function () { 
    fastReset();
}
buttons.m.release = function () {
    toggleMusic();
}
buttons.shift.press = function () {
    if (difficulty <= DIFFICULTY_EASY) {
        ticker.speed = 0.5;
    }
    else {
        ticker.speed = 1;
    }
}
buttons.shift.release = function () {
        ticker.speed = 1;
}
buttons.f.press = function () {
    ticker.speed = 2;    
}
buttons.f.release = function () {
    ticker.speed = 1;
}

var difficulty: number = 3;

ticker.add(function (delta) {
    if (basicText != null) {
        basicText.text = "Difficulty: " + difficultyToString(difficulty) +
            "\n" + (enemies.length > 0 ?  ( "Boss: " +  enemies[0].pattern.explain() ) : "");
    }
    if (player != null) {
        if (player.controllable) {
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
    for (var i = hud.length - 1; i >= 0; i--) {
        var inscription = hud[i];
        inscription.update(delta);
        if (inscription.isOutOfGame()) {
            stage.removeChild(inscription.sprite);
            hud.splice(i, 1);
        }
    }
    if (player != null) {
        player.update(delta);

        if (player.isOutOfGame()) {
            stage.removeChild(player.sprite);
        }
        if (showColliders) {
            player.collider.draw(temporaryGraphics, Colors.LuminousGreen);
        }
        playerBar.update(player.hp);
    }
    for (var en of enemies) {
        if (en.bossbar != null) {
            en.bossbar.update(en.hp);
        }
    }
    if (showColliders) {
        stage.addChild(temporaryGraphics);
    } 
});
