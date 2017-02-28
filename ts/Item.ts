abstract class Item {
    public sprite: PIXI.Sprite;
    public collider: Collider;
    public pattern: Pattern;
    public gone: boolean;
    public tags: { [tag: string]: number } = {};

    public update(delta: number) {
        this.pattern.update(delta, this);
    }
    public x(): number {
        return this.sprite.x;
    }
    public y(): number {
        return this.sprite.y;
    }

    public isOutOfGame(): boolean {
        return this.sprite.x < -200 || this.sprite.y < -200 || this.sprite.x > WIDTH + 200 || this.sprite.y > HEIGHT+200 || this.gone;
    }

    protected constructor(sprite: PIXI.Sprite, collider: Collider, pattern : Pattern) {
        this.sprite = sprite;
        this.collider = collider;
        this.collider.item = this;
        this.pattern = pattern;
    }
}