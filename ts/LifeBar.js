var LifeBar = (function () {
    function LifeBar(name, color, maxHP, y) {
        this.x = app.view.width - 310;
        this.height = 30;
        this.width = 300;
        this.name = name;
        this.color = color;
        this.maxHP = maxHP;
        this.y = y;
        this.outline = new PIXI.Graphics();
        this.outline.lineStyle(2, Colors.PurpleViolet);
        this.outline.beginFill(Colors.PearlViolet);
        this.outline.drawRoundedRect(this.x, this.y, this.width, this.height, 8);
        this.outline.endFill();
        this.text = new PIXI.Text("Boss: ?");
        this.text.x = this.x + 50;
        this.text.y = this.y + 5;
        this.text.style.fontSize = 18;
        app.stage.addChild(this.text);
        app.stage.addChild(this.outline);
    }
    LifeBar.prototype.remove = function () {
        app.stage.removeChild(this.text);
        app.stage.removeChild(this.outline);
        app.stage.removeChild(this.graphics);
        this.ended = true;
    };
    LifeBar.prototype.update = function (bossHp) {
        if (this.ended)
            return;
        this.text.text = this.name + ": " + bossHp;
        app.stage.removeChild(this.text);
        app.stage.removeChild(this.graphics);
        var innere = new PIXI.Graphics();
        innere.lineStyle(0);
        innere.beginFill(this.color);
        innere.drawRoundedRect(this.x + 4, this.y + 4, (this.width - 8) * bossHp / this.maxHP, this.height - 8, 8);
        innere.endFill();
        this.graphics = innere;
        app.stage.addChild(this.graphics);
        app.stage.addChild(this.text);
    };
    return LifeBar;
}());
//# sourceMappingURL=LifeBar.js.map