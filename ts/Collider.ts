abstract class Collider {
    public item: Item;
    public abstract draw(g: PIXI.Graphics, color : number);
    public abstract intersects(other: Collider): boolean;
}
function clamp(value : number, min : number, max: number) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}
class Collisions {
    static CircleCircle(one: CircleCollider, two: CircleCollider): boolean {
        var a = one.radius + two.radius;
        var dx = one.item.sprite.x - two.item.sprite.x;
        var dy = one.item.sprite.y - two.item.sprite.y;
        return a * a > (dx * dx + dy * dy);
    }
    static CircleRectangle(one: CircleCollider, two: RectangleCollider): boolean {
        var circleX = one.item.sprite.x;
        var circleY = one.item.sprite.y;
        var rect = two.getRectangle();
        var closestX = clamp(circleX, rect.x, rect.x + rect.width);
        var closestY = clamp(circleY, rect.y, rect.y + rect.height);
        var distanceX = circleX - closestX;
        var distanceY = circleY - closestY;
        var distanceSq = (distanceX * distanceX) + (distanceY * distanceY);
        return distanceSq < one.radius * one.radius;
    }
    static RectangleRectangle(one: RectangleCollider, two: RectangleCollider): boolean {
        var rect1 = one.getRectangle();
        var rect2 = two.getRectangle();
        if (rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y) {
            return true;
        }
        return false;
    }
}
class CircleCollider extends Collider {
    public radius: number;

    public draw(g: PIXI.Graphics, color : number) {
        g.lineStyle(2, color, 1);
        g.drawCircle(this.item.sprite.x, this.item.sprite.y, this.radius);
    }
    

    public intersects(other: Collider): boolean {
        if (other instanceof CircleCollider) {
            return Collisions.CircleCircle(this, other as CircleCollider);
        }
        if (other instanceof RectangleCollider) {
            return Collisions.CircleRectangle(this, other as RectangleCollider);
        }
        throw "ERROR";
    }

    constructor(radius: number) {
        super();
        this.radius = radius;
    }
}
class Rectangle {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    constructor(x, y, w, h: number) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
}
class RectangleCollider extends Collider {
    private width: number;
    private height: number;
    public constructor(w: number, h: number) {
        super();
        this.width = w;
        this.height = h;
    }
    public intersects(other: Collider): boolean {
        if (other instanceof CircleCollider) {
            return Collisions.CircleRectangle(other as CircleCollider, this);
        }
        if (other instanceof RectangleCollider) {
            return Collisions.RectangleRectangle(this, other as RectangleCollider);
        }
        throw "ERROR";
    }
    public getRectangle(): Rectangle {
        return new Rectangle(this.item.sprite.x - this.width / 2,
            this.item.sprite.y - this.height / 2,
            this.width * this.item.sprite.scale.x,
            this.height * this.item.sprite.scale.y);
    }
    public draw(g: PIXI.Graphics, color: number) {
        g.lineStyle(1, color, 1);
        var rect = this.getRectangle();
        g.drawRect(rect.x, rect.y, rect.width, rect.height);
    }
}