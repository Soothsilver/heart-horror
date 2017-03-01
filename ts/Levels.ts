
class LevelDescription {
    public bossname: string;
    public subCaption: string;
    public constructor(name: string, desc: string) {
        this.bossname = name;
        this.subCaption = desc;
    }
}
class Levels {
    public static DeepEye = 1;
    public static AlienVessel = 1;
    public static TentacleBoss = 1;
    public static MysteriousPortal = 1;
    public static CommandVessel = 1;
    public static DeepeEyes = 1;

    public static getLevel(level: number) {
        switch (level) {
            default: return new LevelDescription("Deep Eye", "Vanguard of the Vast Horrors");
        }
    }
}