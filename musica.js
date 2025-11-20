const playlist = [
  new Audio("Musica/Push Thru - The Grey Room _ Golden Palms.mp3"),
  new Audio("Musica/Drum Or Bass - Ryan Stasik.mp3"),
  new Audio("Musica/Test Your Fight - Rod Kim.mp3"),
  new Audio("Musica/Van Life Rager - Everet Almond.mp3"),
  new Audio("Musica/All In - Everet Almond.mp3"),
  new Audio("Musica/Groove - Dyalla.mp3")
];

let index = Math.floor(Math.random() * 4 + 1);
let current;
function playNext() {
  current = playlist[index];
  current.volume = 0.3;
  current.play();

  current.onended = () => {
    index = (Math.floor(Math.random() * 4 + 1)) % playlist.length;
    playNext();
  };
}

function playTitleSong() {
  current = playlist[0];
  current.volume = 0.3;
  current.play();
  current.onended = () => {
    index = (Math.floor(Math.random() * 4 + 1)) % playlist.length;
    playNext();
  };
}

stopMusic = function() {
  if (current) {
    current.pause();
    current.currentTime = 0;
  }
};