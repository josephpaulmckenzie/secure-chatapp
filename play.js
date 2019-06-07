const player = require('play-sound')();
player.play('./ding.wav', (err) => {
    if (err) console.log(`Could not play sound: ${err}`);
});