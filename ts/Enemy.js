var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(sprite, collider, pattern) {
        return _super.call(this, sprite, collider, pattern) || this;
    }
    Enemy.prototype.loseHP = function (lost) {
        this.hp -= lost;
        if (this.hp <= 0) {
            this.gone = true;
            gameWon();
        }
    };
    Enemy.prototype.update = function (delta) {
        _super.prototype.update.call(this, delta);
        if (!player.indestructible && player.collider.intersects(this.collider)) {
            player.loseHP(1);
        }
    };
    return Enemy;
}(Item));
//# sourceMappingURL=Enemy.js.map