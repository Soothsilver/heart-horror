abstract class Pattern {
    public spent: boolean;
    public abstract update(delta: number, item: Item);
    public tags: { [tag: string]: number } = {};
    public getTag(tag: string): number {
        if (isNaN(this.tags[tag])) return 0;
        return this.tags[tag];
    }
    public While(other: Pattern): CombinationPattern {
        return new CombinationPattern([this, other]);
    }
    public Then(then: Pattern): SequencePattern {
        return new SequencePattern([this, then]);
    }
    public And(and: Pattern): Both {
        return new Both([this, and]);
    }
    public Named(name: string): NamedPattern {
        return new NamedPattern(this, name);
    }
    public explain(): string {
        return "?";
    }
}
class StandingPattern extends Pattern {
    public update(delta: number, item: Item) {
        // Do nothing.
    }
    public explain(): string {
        return "";
    }
}
class OneShot extends Pattern {
    private func: (item: Item) => void;
    constructor(func: (item: Item) => void) {
        super();
        this.func = func;
    }
    public update(delta: number, item: Item) {
        this.func(item);
        this.spent = true;
    }
}
class SpecialPattern extends Pattern {
    private func: (delta: number, item: Item, pattern: SpecialPattern) => void;
    constructor(func: (delta: number, item: Item, pattern: SpecialPattern) => void) {
        super();
        this.func = func;
    }
    public update(delta: number, item: Item) {
        this.func(delta, item, this);
    }

    public explain(): string {
        return "special";
    }
}
abstract class DelegatingPattern extends Pattern {
    private inner: Pattern;
    constructor(pattern : Pattern) {
        super();
        this.inner = pattern;
    }
    public update(delta: number, item: Item) {
        this.inner.update(delta, item);
        if (this.inner.spent) {
            this.spent = true;
        }
    }

    public explain(): string {
        return this.inner.explain();
    }
}
class NamedPattern extends DelegatingPattern {
    private name: string;
    public constructor(pattern: Pattern, name: string) {
        super(pattern);
        this.name = name;
    }
    public explain(): string {
        return this.name;
    }
}
class DisappearingPattern extends Pattern {
    private speed: number;
    constructor(time: number) {
        super();
        this.speed = 1 / time;
    }
    public update(delta: number, item: Item) {
        item.sprite.alpha -= delta * this.speed;
        if (item.sprite.alpha <= 0) {
            item.sprite.alpha = 0;
            this.spent = true;
            item.gone = true;
        }
    }
    public explain(): string {
        return "fade";
    }
}
class AppearingPattern extends Pattern {
    private speed: number;
    constructor(time: number) {
        super();
        this.speed = 1 / time;
    }
    public update(delta: number, item: Item) {
        item.sprite.alpha += delta * this.speed;
        if (item.sprite.alpha >= 1) {
            item.sprite.alpha = 1;
            this.spent = true;
        }
    }
    public explain(): string {
        return "fade-in";
    }
}
class PeriodicPattern extends Pattern {
    private periodTime: number;
    private timeUntilPeriod: number;
    private func: (item: Item, pattern?: PeriodicPattern) => void;
    constructor(periodTime: number, func: (item: Item, pattern?: PeriodicPattern) => void) {
        super();
        this.periodTime = periodTime;
        this.func = func;
        this.timeUntilPeriod = this.periodTime;
    }
    public update(delta: number, item: Item) {
        this.timeUntilPeriod -= delta;
        while (this.timeUntilPeriod < 0) {
            this.timeUntilPeriod += this.periodTime;
       //     console.log(this);
            this.func(item, this);
        }
    }
    public explain(): string {
        return "periodic-fire";
    }
}
class RotationPattern extends Pattern {
    private angle: number;
    private angleDiff: number;
    private func: (angle: number, deltaRotation: number, item: Item) => void;
    constructor(fullRotationTime: number, func: (angle: number, deltaRotation : number, item :Item )=> void) {
        super();
        this.angle = 0;
        this.angleDiff = Math.PI * 2 / fullRotationTime;
        this.func = func;
    }
    public update(delta: number, item: Item) {
        this.angle += this.angleDiff * delta;
        this.func(this.angle, delta * this.angleDiff, item);
    }
    public explain(): string {
        return "rotate";
    }
}
class RepeatPattern extends Pattern {
    private patternCreation: Function;
    private current: Pattern;
    private count: number;
    private patterns: Pattern[] = [];
    constructor(patternCreation: Function, repeatCount : number = 1000) {
        super();
        this.patternCreation = patternCreation;
        this.count = repeatCount;

    }
    public explain(): string {
        var x: string = "";
        for (var p of this.patterns) {
            x += p.explain() + " ";
        }
        return (this.current != null ? this.current.explain() : "");
    }
    public update(delta: number, item: Item) {
        if (this.current == null) {
            if (this.patterns.length > 0) {
                this.current = this.patterns.shift();
            }
            else {
                if (this.count <= 0) {
                    this.spent = true;
                    return;
                }
                this.count--;
                this.patterns = this.patternCreation();
                this.update(delta, item);
            }
        }
        else {
            this.current.update(delta, item);
            if (this.current.spent) {
                this.current = null;
                this.update(delta, item);
            }
        }
    }
}

class FollowLeaderX extends Pattern {
    leader: Item;
    constructor(leader: Item) {
        super();
        this.leader = leader;
    }
    public update(delta: number, item: Item) {
        item.sprite.x = this.leader.x();
        if (this.leader.harmless || this.leader.gone) {
            if (!item.harmless) {
                item.fadeout();
            }
        }
    }
    public explain(): string {
        return "follow-leader";
    }
}
function getRandomExclusive(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

class SequencePattern extends RepeatPattern {
    constructor(patterns: Pattern[]) {
        super(() => patterns, 1);
    }
}
class CustomPattern extends Pattern {
    private func: (item: Item) => Pattern;
    private pattern: Pattern;
    constructor(func: (item: Item) => Pattern) {
        super();
        this.func = func;
    }
    public update(delta: number, item: Item) {
        if (this.pattern == null) {
            this.pattern = this.func(item);
        }
        this.pattern.update(delta, item);
        if (this.pattern.spent) {
            this.spent = true;
        }
    }
}
class RandomPattern extends SequencePattern {
    private static getRandomPattern(patterns: Pattern[]): Pattern {
        return patterns[getRandomExclusive(0, patterns.length)];
    }
    constructor(patterns: Pattern[]) {
        super([RandomPattern.getRandomPattern(patterns)]);
    }
}
class Both extends Pattern {
    private patterns: Pattern[];
    constructor(patterns: Pattern[]) {
        super();
        this.patterns = patterns;
    }
    public update(delta: number, item: Item) {
        for (var p of this.patterns) {
            p.update(delta, item);
        }
    }
    public explain(): string {
        var x: string = "";
        for (var p of this.patterns) {
            x += p.explain() + " ";
        }
        return "{ " + x + "}";
    }
}
class CombinationPattern extends Pattern {
    private patterns: Pattern[];
    constructor(patterns: Pattern[]) {
        super();
        this.patterns = patterns;
    }
    public update(delta: number, item: Item) {
        for (var p of this.patterns) {
            p.update(delta, item);
            if (p.spent) {
                this.spent = true;
            }
        }
    }
    public explain(): string {
        var x: string = "";
        for (var p of this.patterns) {
            x += p.explain() + " ";
        }
        return "[ " + x + "]";
    }
}
class SimpleMove extends CombinationPattern {
    private time: number;
    private xd: number;
    private yd: number;
    constructor(xdist: number, ydist: number, time: number) {
        super([
            new FixedDuration(time),
            new UniformMovementPattern(xdist / time, ydist / time)
        ]);
    }
}
class FixedDuration extends Pattern {
    private ticks: number;
    constructor(ticks: number) {
        super();
        this.ticks = ticks;
    }
    public update(delta: number, item: Item) {
        this.ticks -= delta;
        if (this.ticks <= 0) {
            this.spent = true;
        }
    }
    public explain(): string {
        return "fixed-time";
    }
}
class UniformMovementPattern extends Pattern {

    private xSpeed: number;
    private ySpeed: number;
    constructor(xSpeed: number, ySpeed: number) {
        super();
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
    }
    public update(delta: number, item: Item) {
        item.sprite.x += delta * this.xSpeed;
        item.sprite.y += delta * this.ySpeed;
    }
    public explain(): string {
        return "move";
    }
}
class EllipseMovement extends Pattern {
    private currentAngle: number;
    private timeRemaining: number;
    private angleDiff: number;
    private a: number;
    private b: number;
    private cx: number;
    private cy: number;
    private finalAngle: number;
    public constructor(centerX: number, centerY: number, a: number, b: number, initAngle: number, finalAngle: number, time: number) {
        super();
        this.finalAngle = degreesToRadian(finalAngle);
        this.currentAngle = degreesToRadian(initAngle);
        this.cx = centerX;
        this.cy = centerY;
        this.a = a;
        this.b = b;
        this.timeRemaining = time;
        this.angleDiff = (this.finalAngle - this.currentAngle) / time;
    }
    public update(delta: number, item: Item) {
        this.currentAngle += delta * this.angleDiff;
        this.timeRemaining -= delta;
        if (this.timeRemaining <= 0) {
            this.currentAngle = this.finalAngle;
            this.spent = true;
        }
        var x = this.cx + this.a * Math.cos(this.currentAngle);
        var y = this.cy + this.b * Math.sin(this.currentAngle);
        item.sprite.x = x;
        item.sprite.y = y;
    }

    public explain(): string {
        return "ellipse-move";
    }
}