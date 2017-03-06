class Enemy extends Item {

    public hp: number;
    public isBoss: boolean;
    public bossbar: BossBar;
    public immortal: boolean;

    public loseHP(lost: number) {
        if (this.immortal || gameEnded) {
            return;
        }
        this.hp -= lost;
        if (this.hp <= 0) {
            this.immortal = true;
            this.pattern = new CombinationPattern([this.pattern, new DisappearingPattern(30)]);
            if (this.isBoss) {
                bossDefeated();
            }
        }
    }
    public update(delta: number) {
        super.update(delta);
        if (!this.harmless && !player.indestructible && player.collider.intersects(this.collider)) {
            player.loseHP(1);
        }
    }
    constructor(sprite: PIXI.Sprite, collider: Collider, pattern: Pattern) {
        super(sprite, collider, pattern);
    }
}