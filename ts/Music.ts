var musicMuted: boolean;
var sfxMuted: boolean = true;

function loadSfx(name: string): Sound {
    return new buzz.sound("audio/sfx/" + name, {
        volume: 40
    });
}

var sfxPlayerFire = loadSfx("Uu.wav");
sfxPlayerFire.setVolume(15);

function playSfx(sfx: Sound) {
    if (!sfxMuted) {
        sfx.stop();
        sfx.play();
    }
}



var musicVolume = 40;



/*
var musicTest = new buzz.sound("audio/music/SlimeTest", {
    formats: ["mp3"],
    volume: 20
});
var musicTest2 = new buzz.sound("audio/music/SlimeTest", {
    formats: ["mp3"],
    volume: 40
});
var musicTest3 = new buzz.sound("audio/music/SlimeTest", {
    formats: ["mp3"],
    volume: 80
});*/
var music1 = new buzz.sound("audio/music/SlimeGirlsIntro", {
    formats: ["mp3"],
    volume: musicVolume,
    preload: true
});
/*
var music2 = new buzz.sound("audio/music/SlimeGirls2", {
    formats: ["mp3"],
    volume: musicVolume
});*/
var music3 = new buzz.sound("audio/music/SlimeGirls3", {
    formats: ["mp3"],
    volume: musicVolume,
    preload: true
});
var lastMusicIndex = -1;
function playbackEnded() {
    while (true) {
        var i = getRandomExclusive(0, options.length);
        if (i == lastMusicIndex) {
            continue;
        }
        lastMusicIndex = i;
        console.log(i);
        music.stop();
        music = options[i];
        resumeMusic();
        break;
    } 
}
var options = [music1, music3];
var music = music1;

function pauseMusic() {
    music.pause();
}
function resumeMusic() {
    if (!musicMuted) {
        music.unbind("ended");
        music.bind("ended", playbackEnded);
        music.play();
    }
}
function toggleSfx() {
    sfxMuted = !sfxMuted;
    localStorage.setItem("sfxMuted", sfxMuted ? "true" : "false");
}
function toggleMusic() {
    musicMuted = !musicMuted;
    localStorage.setItem("musicMuted", musicMuted ? "true" : "false");
    if (musicMuted) {
        music.pause();
    }
    else if (!menuOpen && !paused) {
        music.play();
    }
}