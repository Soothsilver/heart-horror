var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Collider = (function () {
    function Collider() {
    }
    return Collider;
}());
function clamp(value, min, max) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}
var Collisions = (function () {
    function Collisions() {
    }
    Collisions.CircleCircle = function (one, two) {
        var a = one.radius + two.radius;
        var dx = one.item.sprite.x - two.item.sprite.x;
        var dy = one.item.sprite.y - two.item.sprite.y;
        return a * a > (dx * dx + dy * dy);
    };
    Collisions.CircleRectangle = function (one, two) {
        var circleX = one.item.sprite.x;
        var circleY = one.item.sprite.y;
        var rect = two.getRectangle();
        var closestX = clamp(circleX, rect.x, rect.x + rect.width);
        var closestY = clamp(circleY, rect.y, rect.y + rect.height);
        var distanceX = circleX - closestX;
        var distanceY = circleY - closestY;
        var distanceSq = (distanceX * distanceX) + (distanceY * distanceY);
        return distanceSq < one.radius * one.radius;
    };
    Collisions.RectangleRectangle = function (one, two) {
        var rect1 = one.getRectangle();
        var rect2 = two.getRectangle();
        if (rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y) {
            return true;
        }
        return false;
    };
    return Collisions;
}());
var CircleCollider = (function (_super) {
    __extends(CircleCollider, _super);
    function CircleCollider(radius) {
        var _this = _super.call(this) || this;
        _this.radius = radius;
        return _this;
    }
    CircleCollider.prototype.draw = function (g, color) {
        g.lineStyle(2, color, 1);
        g.drawCircle(this.item.sprite.x, this.item.sprite.y, this.radius);
    };
    CircleCollider.prototype.intersects = function (other) {
        if (other instanceof CircleCollider) {
            return Collisions.CircleCircle(this, other);
        }
        if (other instanceof RectangleCollider) {
            return Collisions.CircleRectangle(this, other);
        }
        throw "ERROR";
    };
    return CircleCollider;
}(Collider));
var Rectangle = (function () {
    function Rectangle(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    return Rectangle;
}());
var RectangleCollider = (function (_super) {
    __extends(RectangleCollider, _super);
    function RectangleCollider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RectangleCollider.prototype.intersects = function (other) {
        if (other instanceof CircleCollider) {
            return Collisions.CircleRectangle(other, this);
        }
        if (other instanceof RectangleCollider) {
            return Collisions.RectangleRectangle(this, other);
        }
        throw "ERROR";
    };
    RectangleCollider.prototype.getRectangle = function () {
        return new Rectangle(this.item.sprite.x - this.item.sprite.width / 2, this.item.sprite.y - this.item.sprite.height / 2, this.item.sprite.width * this.item.sprite.scale.x, this.item.sprite.height * this.item.sprite.scale.y);
    };
    RectangleCollider.prototype.draw = function (g, color) {
        g.lineStyle(1, color, 1);
        var rect = this.getRectangle();
        g.drawRect(rect.x, rect.y, rect.width, rect.height);
    };
    return RectangleCollider;
}(Collider));
//# sourceMappingURL=Collider.js.map