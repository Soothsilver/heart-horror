var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Pattern = (function () {
    function Pattern() {
        this.tags = {};
    }
    Pattern.prototype.getTag = function (tag) {
        if (isNaN(this.tags[tag]))
            return 0;
        return this.tags[tag];
    };
    Pattern.prototype.While = function (other) {
        return new CombinationPattern([this, other]);
    };
    Pattern.prototype.Then = function (then) {
        return new SequencePattern([this, then]);
    };
    Pattern.prototype.explain = function () {
        return "";
    };
    return Pattern;
}());
var StandingPattern = (function (_super) {
    __extends(StandingPattern, _super);
    function StandingPattern() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StandingPattern.prototype.update = function (delta, item) {
        // Do nothing.
    };
    return StandingPattern;
}(Pattern));
var OneShot = (function (_super) {
    __extends(OneShot, _super);
    function OneShot(func) {
        var _this = _super.call(this) || this;
        _this.func = func;
        return _this;
    }
    OneShot.prototype.update = function (delta, item) {
        this.func(item);
        this.spent = true;
    };
    return OneShot;
}(Pattern));
var PeriodicPattern = (function (_super) {
    __extends(PeriodicPattern, _super);
    function PeriodicPattern(periodTime, func) {
        var _this = _super.call(this) || this;
        _this.periodTime = periodTime;
        _this.func = func;
        _this.timeUntilPeriod = _this.periodTime;
        return _this;
    }
    PeriodicPattern.prototype.update = function (delta, item) {
        this.timeUntilPeriod -= delta;
        while (this.timeUntilPeriod < 0) {
            this.timeUntilPeriod += this.periodTime;
            //     console.log(this);
            this.func(item, this);
        }
    };
    PeriodicPattern.prototype.explain = function () {
        return "periodic";
    };
    return PeriodicPattern;
}(Pattern));
var RotationPattern = (function (_super) {
    __extends(RotationPattern, _super);
    function RotationPattern(fullRotationTime, func) {
        var _this = _super.call(this) || this;
        _this.angle = 0;
        _this.angleDiff = Math.PI * 2 / fullRotationTime;
        _this.func = func;
        return _this;
    }
    RotationPattern.prototype.update = function (delta, item) {
        this.angle += this.angleDiff;
        this.func(this.angle, delta, item);
    };
    RotationPattern.prototype.explain = function () {
        return "rotate";
    };
    return RotationPattern;
}(Pattern));
var RepeatPattern = (function (_super) {
    __extends(RepeatPattern, _super);
    function RepeatPattern(patternCreation, repeatCount) {
        if (repeatCount === void 0) { repeatCount = 1000; }
        var _this = _super.call(this) || this;
        _this.patterns = [];
        _this.patternCreation = patternCreation;
        _this.count = repeatCount;
        return _this;
    }
    RepeatPattern.prototype.explain = function () {
        var x = "";
        for (var _i = 0, _a = this.patterns; _i < _a.length; _i++) {
            var p = _a[_i];
            x += p.explain() + " ";
        }
        return (this.current != null ? this.current.explain() : "");
    };
    RepeatPattern.prototype.update = function (delta, item) {
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
    };
    return RepeatPattern;
}(Pattern));
var FollowLeaderX = (function (_super) {
    __extends(FollowLeaderX, _super);
    function FollowLeaderX(leader) {
        var _this = _super.call(this) || this;
        _this.leader = leader;
        return _this;
    }
    FollowLeaderX.prototype.update = function (delta, item) {
        item.sprite.x = this.leader.x();
    };
    FollowLeaderX.prototype.explain = function () {
        return "follow-leader";
    };
    return FollowLeaderX;
}(Pattern));
function getRandomExclusive(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
var SequencePattern = (function (_super) {
    __extends(SequencePattern, _super);
    function SequencePattern(patterns) {
        return _super.call(this, function () { return patterns; }, 1) || this;
    }
    return SequencePattern;
}(RepeatPattern));
var RandomPattern = (function (_super) {
    __extends(RandomPattern, _super);
    function RandomPattern(patterns) {
        return _super.call(this, [RandomPattern.getRandomPattern(patterns)]) || this;
    }
    RandomPattern.getRandomPattern = function (patterns) {
        return patterns[getRandomExclusive(0, patterns.length)];
    };
    return RandomPattern;
}(SequencePattern));
var CombinationPattern = (function (_super) {
    __extends(CombinationPattern, _super);
    function CombinationPattern(patterns) {
        var _this = _super.call(this) || this;
        _this.patterns = patterns;
        return _this;
    }
    CombinationPattern.prototype.update = function (delta, item) {
        for (var _i = 0, _a = this.patterns; _i < _a.length; _i++) {
            var p = _a[_i];
            p.update(delta, item);
            if (p.spent) {
                this.spent = true;
            }
        }
    };
    CombinationPattern.prototype.explain = function () {
        var x = "";
        for (var _i = 0, _a = this.patterns; _i < _a.length; _i++) {
            var p = _a[_i];
            x += p.explain() + " ";
        }
        return "combine( " + x + ")";
    };
    return CombinationPattern;
}(Pattern));
var SimpleMove = (function (_super) {
    __extends(SimpleMove, _super);
    function SimpleMove(xdist, ydist, time) {
        return _super.call(this, [
            new FixedDuration(time),
            new UniformMovementPattern(xdist / time, ydist / time)
        ]) || this;
    }
    return SimpleMove;
}(CombinationPattern));
var FixedDuration = (function (_super) {
    __extends(FixedDuration, _super);
    function FixedDuration(ticks) {
        var _this = _super.call(this) || this;
        _this.ticks = ticks;
        return _this;
    }
    FixedDuration.prototype.update = function (delta, item) {
        this.ticks -= delta;
        if (this.ticks <= 0) {
            this.spent = true;
        }
    };
    FixedDuration.prototype.explain = function () {
        return "wait";
    };
    return FixedDuration;
}(Pattern));
var UniformMovementPattern = (function (_super) {
    __extends(UniformMovementPattern, _super);
    function UniformMovementPattern(xSpeed, ySpeed) {
        var _this = _super.call(this) || this;
        _this.xSpeed = xSpeed;
        _this.ySpeed = ySpeed;
        return _this;
    }
    UniformMovementPattern.prototype.update = function (delta, item) {
        item.sprite.x += delta * this.xSpeed;
        item.sprite.y += delta * this.ySpeed;
    };
    UniformMovementPattern.prototype.explain = function () {
        return "move";
    };
    return UniformMovementPattern;
}(Pattern));
//# sourceMappingURL=Pattern.js.map