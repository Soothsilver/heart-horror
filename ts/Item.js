var Item = (function () {
    function Item(sprite, collider, pattern) {
        this.tags = {};
        this.sprite = sprite;
        this.collider = collider;
        this.collider.item = this;
        this.pattern = pattern;
    }
    Item.prototype.update = function (delta) {
        this.pattern.update(delta, this);
    };
    Item.prototype.x = function () {
        return this.sprite.x;
    };
    Item.prototype.y = function () {
        return this.sprite.y;
    };
    Item.prototype.isOutOfGame = function () {
        return this.sprite.x < -200 || this.sprite.y < -200 || this.sprite.x > WIDTH + 200 || this.sprite.y > HEIGHT + 200 || this.gone;
    };
    return Item;
}());
//# sourceMappingURL=Item.js.map