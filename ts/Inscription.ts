class Inscription extends Item {
    public constructor(sprite: PIXI.DisplayObject, pattern: Pattern) {
        super(sprite, new CircleCollider(0), pattern);
    }
}

function showDefeatedScreen() {
    var screen = new PIXI.Container();
    var blacken = new PIXI.Graphics();
    blacken.beginFill(0x000000, 0.1);
    blacken.drawRect(0, 0, WIDTH, HEIGHT);
    blacken.endFill();
    screen.addChild(blacken);
    var congText = new PIXI.Text("You have been defeated.");
    congText.anchor.x = 0.5;
    congText.anchor.y = 1;
    congText.x = WIDTH / 2;
    congText.y = HEIGHT - 200;
    congText.style.fontSize = 42;
    congText.style.fill = [0xFF0000, Colors.PureRed];
    congText.style.stroke = 0x4a1850;
    congText.style.strokeThickness = 2;
    congText.style.dropShadow = true;

    congText.style.dropShadowColor = '#000000';
    congText.style.dropShadowBlur = 4;
    congText.style.dropShadowAngle = Math.PI / 6;
    congText.style.dropShadowDistance = 6;

 
    screen.addChild(congText);
    var congText = new PIXI.Text("Press [R] to reset the stage or [Esc] to return to menu.");
    congText.anchor.x = 0.5;
    congText.anchor.y = 0;
    congText.x = WIDTH / 2;
    congText.y = HEIGHT - 180;
    congText.style.align = "CENTER";
    congText.style.fontSize = 24;
    congText.style.fill = 0x000000;
    screen.addChild(congText);
    screen.alpha = 0;
    var inscription = new Inscription(screen,
        new SequencePattern([
            new FixedDuration(50),
            new SpecialPattern((delta, item, pattern) => {
                item.sprite.alpha += delta / 40;
                console.log(item.sprite.alpha);
                if (item.sprite.alpha > 1) {
                    item.sprite.alpha = 1;
                }
            }).While(new FixedDuration(40)),
            new StandingPattern()
        ]));

    stage.addChild(screen);
    hud.push(inscription);
}
function createPreperfectScreen(index: number, char: string) {
    var text = new PIXI.Text(char,
        {
            fontSize: 28,
           
        });
    text.style.fill = [0xFFFF00, Colors.GoldenYellow];
    text.style.stroke = 0x4a1850;
    text.style.strokeThickness = 2;
    text.style.dropShadow = true;

    text.style.dropShadowColor = '#000000';
    text.style.dropShadowBlur = 4;
    text.style.dropShadowAngle = Math.PI / 6;
    text.style.dropShadowDistance = 6;
    text.anchor.x = 0.5;
    text.anchor.y = 0.5;
    text.y = HEIGHT / 2;
    text.scale.x = 20;
    text.scale.y = 20;
    text.alpha = 0;
    var midpoint = "PERFECT!".length / 2 - 1;
    text.x = WIDTH / 2 + (index - midpoint) * 20;
    stage.addChild(text);
    var preWait = index * 5;
    var postWait = 120 - preWait;
    var letter = new Inscription(text,
        new SequencePattern([
            new FixedDuration(preWait),
            new SpecialPattern((delta, item, pattern) => {
                item.sprite.alpha += delta / 10;
                item.sprite.scale.x -= delta * 19 / 10;
                item.sprite.scale.y -= delta * 19 / 10;
            }).While(new FixedDuration(10))
            ,
            new OneShot((item) => {
                // Stabilize
                item.sprite.alpha = 1;
                item.sprite.scale.x = 1;
                item.sprite.scale.y = 1;
            })
            ,
            new FixedDuration(postWait),
            new DisappearingPattern(20)]));
    hud.push(letter);
}
function showCongratulationsScreen()
{
    var curDate = new Date();
    var secs = Math.round((curDate.valueOf() - dateOfStart.valueOf()) / 1000);
    var lifeLost = player.maxHp - player.hp;
    var isPerfect = lifeLost == 0;
    var screen = new PIXI.Container();
    var blacken = new PIXI.Graphics();
    blacken.beginFill(0x000000, 0.3);
    blacken.drawRect(0, 0, WIDTH, HEIGHT);
    blacken.endFill();
    screen.addChild(blacken);
    var congText = new PIXI.Text(isPerfect ? "PERFECT!" : "CONGRATULATIONS!");
    congText.anchor.x = 0.5;
    congText.anchor.y = 1;
    congText.x = WIDTH / 2;
    congText.y = 200;
    congText.style.fontSize = 42;
    congText.style.fill = 0xFFFFFF;
    if (isPerfect) {
        congText.style.fill = [ 0xFFFF00,  Colors.GoldenYellow];
        congText.style.stroke = 0x4a1850;
        congText.style.strokeThickness = 2;
        congText.style.dropShadow = true;

        congText.style.dropShadowColor = '#000000';
            congText.style.dropShadowBlur = 4;
            congText.style.dropShadowAngle = Math.PI / 6;
            congText.style.dropShadowDistance = 6;


    }
    screen.addChild(congText);
    var congText = new PIXI.Text("You have defeated the " + Levels.getLevel(loadedLevel).bossname + "!\n\nTime taken: "+ secs + " s\n\nLife lost: " +lifeLost + "\n\nDifficulty: " + difficultyToString(difficulty) + "\n\nPress ESC to return to menu.");
    congText.anchor.x = 0.5;
    congText.anchor.y = 0;
    congText.x = WIDTH / 2;
    congText.y = 220;
    congText.style.align = "CENTER";
    congText.style.fontSize = 24;
    congText.style.fill = 0xFFFFFF;
    screen.addChild(congText);
    screen.alpha = 0;
    var inscription = new Inscription(screen,
        new SequencePattern([
            new FixedDuration(isPerfect ? 150 : 50),
            new SpecialPattern((delta, item, pattern) => {               
                item.sprite.alpha += delta / 40;
                console.log(item.sprite.alpha);
                if (item.sprite.alpha > 1) {
                    item.sprite.alpha = 1;
                }
            }).While(new FixedDuration(40)),
            new StandingPattern()
        ]));
    if (isPerfect) {
        var perfectWord = "PERFECT!";
        for (var i = 0; i < "PERFECT!".length; i++) {
            createPreperfectScreen(i, perfectWord.charAt(i));
        }
    }
    stage.addChild(screen);
    hud.push(inscription);
}