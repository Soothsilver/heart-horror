﻿class Enemy extends Item {

    public hp: number;

    public loseHP(lost: number) {
        this.hp -= lost;
        if (this.hp <= 0) {
            this.gone = true;
            gameWon();
        }
    }
    public update(delta: number) {
        super.update(delta);
        if (!player.indestructible && player.collider.intersects(this.collider)) {
            player.loseHP(1);
        }
    }
    constructor(sprite: PIXI.Sprite, collider: Collider, pattern: Pattern) {
        super(sprite, collider, pattern);
    }
}