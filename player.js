const audio = document.querySelector('#stream')
const playPauseButton = document.querySelector('[name="play-pause"]')
const playPauseButtonIcon = playPauseButton.querySelector('i.fas')
const volumeControl = document.querySelector('[name="volume"]')
const currentlyPlaying = document.querySelector('.currently-playing-title')
const currentStation = document.querySelector('.currently-playing-label')
const volumeButton = document.querySelector('[name="mute"]')
const volumeButtonIcon = volumeButton.querySelector('i.fas')
const settingsSaveButton = document.querySelector('#buttonSettingsSave')
const inputStreamUrl = document.querySelector('#inputStreamUrl')
const inputInfoUrl = document.querySelector('#inputInfoUrl')

let isPlaying = false
let fetchInterval = null
let currentVolume = 0.2

let streamURL = localStorage.getItem("streamURL") ? localStorage.getItem("streamURL") : "";
let infoURL = localStorage.getItem("infoURL") ? localStorage.getItem("infoURL") : "";

if (!streamURL || !infoURL) {
    const modal = new bootstrap.Modal("#settingsModal", {});
    modal.show();
} else {
    inputStreamUrl.value = localStorage.getItem("streamURL");
    inputInfoUrl.value = localStorage.getItem("infoURL");
    audio.src = streamURL;
}

audio.volume = currentVolume

/**
 * Fetches the currently playing
 * @returns {Promise<any>}
 */
const fetchCurrentlyPlaying = () => fetch(infoURL)
    .then(response => response.json())
    .then(data => {
        currentlyPlaying.innerText = data.now_playing.song.text
        currentStation.innerText = data.station.name
    })

/**
 * Adjusts the icon of the "mute" button based on the given volume.
 * @param volume
 */
const adjustVolumeIcon = volume => {
    volumeButtonIcon.classList.remove('fa-volume-off')
    volumeButtonIcon.classList.remove('fa-volume-down')
    volumeButtonIcon.classList.remove('fa-volume-up')
    volumeButtonIcon.classList.remove('fa-volume-mute')

    if (volume >= 0.75) {
        volumeButtonIcon.classList.add('fa-volume-up')
    }

    if (volume < 0.75 && volume >= 0.2) {
        volumeButtonIcon.classList.add('fa-volume-down')
    }

    if (volume < 0.2 && volume > 0) {
        volumeButtonIcon.classList.add('fa-volume-off')
    }

    if (volume === 0) {
        volumeButtonIcon.classList.add('fa-volume-mute')
    }
}

settingsSaveButton.addEventListener('click', () => {
    streamURL = inputStreamUrl.value;
    infoURL = inputInfoUrl.value;

    localStorage.setItem("streamURL", streamURL);
    localStorage.setItem("infoURL", infoURL);

    if(isPlaying){
        audio.pause()

        playPauseButtonIcon.classList.remove('fa-pause')
        playPauseButtonIcon.classList.add('fa-play')

        clearInterval(fetchInterval)
        currentlyPlaying.innerText = 'Listen to Some Radio Station'
    }

    audio.src = streamURL;
})

volumeControl.addEventListener('input', () => {
    const volume = parseFloat(volumeControl.value)

    audio.volume = currentVolume = volume
    currentVolume = volume

    adjustVolumeIcon(volume)
})

volumeButton.addEventListener('click', () => {
    if (audio.volume > 0) {
        adjustVolumeIcon(0)
        audio.volume = 0
        volumeControl.value = 0
    } else {
        adjustVolumeIcon(currentVolume)
        audio.volume = currentVolume
        volumeControl.value = currentVolume
    }
})

playPauseButton.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause()

        playPauseButtonIcon.classList.remove('fa-pause')
        playPauseButtonIcon.classList.add('fa-play')

        clearInterval(fetchInterval)
        currentlyPlaying.innerText = 'Listen to Some Radio Station'
    } else {
        audio.play()

        playPauseButtonIcon.classList.remove('fa-play')
        playPauseButtonIcon.classList.add('fa-pause')

        fetchCurrentlyPlaying()
        fetchInterval = setInterval(fetchCurrentlyPlaying, 3000)
    }

    isPlaying = !isPlaying
})