﻿class LifeBar {

    public text: PIXI.Text;
    public graphics: PIXI.Graphics;
    public outline: PIXI.Graphics;
    public ended: boolean;
    public name: string;
    public color: number;
    public maxHP: number;
    public y: number;
    private x: number = WIDTH - 310;
    private height: number = 30;
    private width: number = 300;

    constructor(name: string, color: number, maxHP: number, y: number) {
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

        stage.addChild(this.text);
        stage.addChild(this.outline);
    }

    public remove() {
        stage.removeChild(this.text);
        stage.removeChild(this.outline);
        stage.removeChild(this.graphics);
        this.ended = true;
    }
    public update(bossHp: number) {
        if (this.ended) return;
        this.text.text = this.name + ": " + bossHp;
        stage.removeChild(this.text);
        stage.removeChild(this.graphics);
        var innere = new PIXI.Graphics();
        innere.lineStyle(0);
        innere.beginFill(this.color);
        innere.drawRoundedRect(this.x + 4, this.y + 4, (this.width - 8) * bossHp / this.maxHP, this.height - 8, 8);
        innere.endFill();
        this.graphics = innere;
        stage.addChild(this.graphics);
        stage.addChild(this.text);
    }
}