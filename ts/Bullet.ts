class Bullet extends Item {
    public friendly: boolean;
    private damage: number = 1;
    public indestructible: boolean;
    constructor (friendly : boolean, sprite : PIXI.Sprite, collider : Collider, pattern : Pattern) {
        super(sprite, collider, pattern);
        this.friendly = friendly;
    }

    public update(delta: number) {
        super.update(delta);
        if (this.friendly) {
            for (var enemy of enemies) {
                if (enemy.collider.intersects(this.collider)) {
                    enemy.loseHP(this.damage);
                    if (!this.indestructible) {
                        this.gone = true;
                    }
                }
            }
        }
        else {
            if (!player.indestructible && player.collider.intersects(this.collider)) {
                player.loseHP(this.damage);
                if (!this.indestructible) {
                    this.gone = true;
                }
            }
        }
    }
}