var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Bullet = (function (_super) {
    __extends(Bullet, _super);
    function Bullet(friendly, sprite, collider, pattern) {
        var _this = _super.call(this, sprite, collider, pattern) || this;
        _this.damage = 1;
        _this.friendly = friendly;
        return _this;
    }
    Bullet.prototype.update = function (delta) {
        _super.prototype.update.call(this, delta);
        if (this.friendly) {
            for (var _i = 0, enemies_1 = enemies; _i < enemies_1.length; _i++) {
                var enemy = enemies_1[_i];
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
    };
    return Bullet;
}(Item));
//# sourceMappingURL=Bullet.js.map