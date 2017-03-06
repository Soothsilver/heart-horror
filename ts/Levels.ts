
class LevelDescription {
    public bossname: string;
    public subCaption: string;
    public bossCreation: () => Enemy;
    public bossCreation2: () => Enemy;
    public isDoubleBoss: boolean;
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
    public static DeepEyes = 6;

    public static getLevel(level: number) {
        switch (level) {
            case Levels.AlienVessel:
                return new LevelDescription("Alien Vessel", "Is this boss random?!", createAlienVesselBoss);
            case Levels.TentacleBoss:
                return new LevelDescription("Tentacle Boss", "also called 'The Consumer of Souls'", createTentacleBoss)
            case Levels.MysteriousPortal:
                return new LevelDescription("Mysterious Portal", "Gateway of Channeled Fear", createPortal);
            case Levels.CommandVessel:
                return new LevelDescription("Command Vessel", "Behold the leader of the Vast Horrors!", createCommandVessel);
            case Levels.DeepEyes:
                var eyes = new LevelDescription("Deep Eyes", "Piece of cake, maybe?", createDeepEyes);
                eyes.isDoubleBoss = true;
                eyes.bossCreation2 = createDeepEyes2;
                return eyes;
            case Levels.DeepEye:
            default:
                return new LevelDescription("Deep Eye", "Vanguard of the Vast Horrors", createEyeBossBoss);
        }
    }
}