abstract class Item {
    public sprite: PIXI.DisplayObject;
    public collider: Collider;
    public pattern: Pattern;
    public gone: boolean;
    public harmless: boolean;
    public tags: { [tag: string]: number } = {};
    public getTag(tag: string): number {
        if (isNaN(this.tags[tag])) {
            return 0;
        }
        else {
            return this.tags[tag];
        }
    }

    public update(delta: number) {
        this.pattern.update(delta, this);
    }
    public x(): number {
        return this.sprite.x;
    }
    public y(): number {
        return this.sprite.y;
    }

    public fadeout() {
        this.harmless = true;
        this.pattern = new Both([this.pattern, new DisappearingPattern(30)]);
    }

    public isOutOfGame(): boolean {
        return this.sprite.x < -200 || this.sprite.y < -1000 || this.sprite.x > WIDTH + 200 || this.sprite.y > HEIGHT+200 || this.gone;
    }

    protected constructor(sprite: PIXI.DisplayObject, collider: Collider, pattern: Pattern) {
        this.sprite = sprite;
        this.collider = collider;
        this.collider.item = this;
        this.pattern = pattern;
    }
}