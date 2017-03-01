/// <reference path="LifeBar.ts" />
class BossBar extends LifeBar {
    constructor(maxhp : number) {
        super("Boss", Colors.YellowOrange, maxhp, 50);
    }
}