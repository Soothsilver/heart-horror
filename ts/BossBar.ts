/// <reference path="LifeBar.ts" />
class BossBar extends LifeBar {
    constructor(maxhp : number, name : string = "Boss", y : number = 50) {
        super(name, Colors.YellowOrange, maxhp, y);
    }
}