var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PlayerBar = (function (_super) {
    __extends(PlayerBar, _super);
    function PlayerBar() {
        return _super.call(this, "Player", Colors.LightGreen, PLAYER_HP, 50) || this;
    }
    return PlayerBar;
}(LifeBar));
//# sourceMappingURL=PlayerBar.js.map