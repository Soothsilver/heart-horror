var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BossBar = (function (_super) {
    __extends(BossBar, _super);
    function BossBar(maxhp) {
        return _super.call(this, "Boss", Colors.YellowOrange, maxhp, 10) || this;
    }
    return BossBar;
}(LifeBar));
//# sourceMappingURL=BossBar.js.map