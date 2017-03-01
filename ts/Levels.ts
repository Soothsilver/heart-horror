
class LevelDescription {
    public bossname: string;
    public subCaption: string;
    public bossCreation: () => Enemy;
    public constructor(name: string, desc: string, makeBoss: ()=>Enemy) {
        this.bossname = name;
        this.subCaption = desc;
        this.bossCreation = makeBoss;
    }
}
class Levels {
    public static DeepEye = 1;
    public static AlienVessel = 2;
    public static TentacleBoss = 3;
    public static MysteriousPortal = 4;
    public static CommandVessel = 5;
    public static DeepeEyes = 6;

    public static getLevel(level: number) {
        switch (level) {
            case Levels.AlienVessel:
                return new LevelDescription("Alien Vessel", "Is this boss random?!", createAlienVesselBoss);
            case Levels.DeepEye:
            default:
                return new LevelDescription("Deep Eye", "Vanguard of the Vast Horrors", createEyeBossBoss);
        }
    }
}