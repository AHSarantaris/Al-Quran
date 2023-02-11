
function createAudioPlayer() {
    let res = document.getElementById('audio-player');
    res.addEventListener('timeupdate', audioTimeUpdate);
    res.addEventListener('ended', audioEnded);
    res.addEventListener('pause', pauseAudio);
    res.addEventListener('play', playAudio);
    res.addEventListener('loadedmetadata', function (e) {
        document.getElementById('duration-label').innerHTML = timeInMinutes(audioPlayerElement.duration);
        document.getElementById('time-slider').max = audioPlayerElement.duration;
    })
    return res;
}

function createAudioControls() {
    currentRecitation = 0;
    let res = document.getElementById('audio-controls');
    res.innerHTML = '';
    let upperControls = createDiv({id: 'upper-controls'});
    let lowerControls = createDiv({id: 'lower-controls'});
    let playButton = createDiv({tagName: 'button', id: 'play-button', className: 'icon-button fas fa-play'});
    playButton.addEventListener('click', clickPlayButton);
    let volumeButton = createVolumeButton();
    let speedControl = createSpeedControls();
    let versePlayingButton = createVersePlayingButton();
    let elapsedLabel= createDiv({tagName: 'span', id: 'elapsed-label', innerHTML: timeInMinutes(elapsedTime)});
    let durationLabel = createDiv({tagName: 'span', id: 'duration-label',innerHTML: timeInMinutes(audioPlayerElement.duration)});
    let timeSlider = createTimeSlider();
    upperControls.appendChild(elapsedLabel);
    upperControls.appendChild(timeSlider);
    upperControls.appendChild(durationLabel);
    res.appendChild(upperControls);
    res.appendChild(lowerControls);
    lowerControls.appendChild(playButton);
    lowerControls.appendChild(versePlayingButton);
    lowerControls.appendChild(speedControl);
    lowerControls.appendChild(volumeButton);
    setVolume(volume);
    setSpeed(speed);
    setElapsedTime(elapsedTime);
    return res;
}

function createTimeSlider() {
    let res = createDiv({tagName: 'input', id: 'time-slider'});
    res.type = 'range';
    res.min = 0;
    res.value = elapsedTime;
    res.max = 100;
    res.addEventListener('input', seekTimeSlider);
    res.addEventListener('change', changeTimeSlider);
    return res;
}

function seekTimeSlider(e) {
    setElapsedTime(document.getElementById('time-slider').value);
    audioPlayerElement.pause();    
}

function changeTimeSlider(e) {
    seekTimeSlider(e);
    audioPlayerElement.currentTime = elapsedTime;
    if (timeStamps[1] ){
        findVerseFromTime();
    }
}

function timeInMinutes(time) {
    if (!time && time !== 0) {
        return 'No audio';
    }
    time = Math.floor(time);
    let minutes = Math.floor(time/60);
    let hours = Math.floor(minutes/60);
    let seconds = time % 60;
    let leadingZeroSeconds = seconds < 10 ? '0' : '';
    let leadingZeroMinutes = minutes < 10 ? '0' : '';
    return hours + ':' + leadingZeroMinutes + minutes + ':' + leadingZeroSeconds + seconds;
}

function createSpeedControls() {
    // let res = createDiv({tagName: 'div', id: 'speed-dropdown'});
    let decreaseButton = createDiv({tagName: 'button', id: 'decrease-speed', className: 'icon-button fas fa-minus'});
    let increaseButton = createDiv({tagName: 'button', id: 'increase-speed', className: 'icon-button fas fa-plus'});
    let slider = createDiv({tagName: 'input', id: 'speed-slider'});
    let count = createDiv({id: 'speed-count', innerHTML: speed + 'x'});
    slider.type = 'range';
    slider.min = -50;
    slider.max = 50;
    slider.step = 5;
    slider.value = speed;
    let amount = 1;
    decreaseButton.addEventListener('click', (e)=>{
        setSpeed(speed - amount);
    });
    increaseButton.addEventListener('click', (e)=>{
        setSpeed(speed + amount);
    });
    slider.addEventListener('input', (e)=>{
        document.getElementById('speed-count').innerHTML = speed + 'x';
        setSpeed(parseInt(e.currentTarget.value));
    });
    // res.appendChild(slider);
    // res.appendChild(count);
    let res = createDropdownButton(count, {id: 'speed-dropdown'});
    res.appendChild(createDropdownContent([decreaseButton, slider, increaseButton], {id: 'speed-content'}));
    return res;

}

function createVolumeButton() {
    let button = createDiv({tagName: 'button', id: 'volume-button', className: 'icon-button fas fa-volume-up'});
    let decreaseButton = createDiv({tagName: 'button', id: 'decrease-volume', className: 'icon-button fas fa-minus'});
    let increaseButton = createDiv({tagName: 'button', id: 'increase-volume', className: 'icon-button fas fa-plus'});
    let slider = createDiv({tagName: 'input', id: 'volume-slider'});
    let count = createDiv({id: 'volume-count', innerHTML: volume + '%'});
    slider.type = 'range';
    slider.min = 0;
    slider.max = 100;
    slider.value = volume;
    let amount = 1;
    decreaseButton.addEventListener('click', (e)=>{
        setVolume(volume - amount);
    });
    increaseButton.addEventListener('click', (e)=>{
        setVolume(volume + amount);
    });
    slider.addEventListener('input', (e)=>{
        document.getElementById('volume-count').innerHTML = volume + '%';
        setVolume(parseInt(e.currentTarget.value));
    });
    let res = createDropdownButton(button, {id: 'volume-dropdown'});
    res.appendChild(createDropdownContent([decreaseButton, slider, increaseButton, count], {id: 'volume-content'}));
    return res;
}

function createRecitationsButton() {
    let oldElement = document.getElementById('recitations-button');
    if (oldElement) {
        oldElement.parentNode.removeChild(oldElement);
    }
    let numberOfRecitations = audioInfo ? audioInfo.length : 0;
    let recitationsStr = numberOfRecitations === 1 ? 'Recitation' : 'Recitations';
    let button = createDoubleLineDiv(numberOfRecitations + ' <i class="fas fa-caret-up"></i>', recitationsStr, {tagName: 'button', id: 'recitations-button', className: 'icon-button'});
    button.disabled = numberOfRecitations ? false : true;
    let items = [];
    for (let i = 0; i < numberOfRecitations; i++) {
        items.push(createDiv({tagName: 'button', className: 'dropdown-item block-button', innerHTML: audioInfo[i].name}));
        items[i].value = i;
        items[i].addEventListener('click', clickRecitation);
        if (i === currentRecitation) {
            items[i].setAttribute('selected',true);
        }
    }
    let res = createDropdownButton(button, {id: 'recitations-dropdown'});
    res.appendChild(createDropdownContent(items));
    return res;
}


function clickRecitation(e) {
    let oldElement = document.querySelector(`.dropdown-item[value="${currentRecitation}"]`);
    if (oldElement === e.currentTarget) {
        return;
    }
    pauseAudio();
    oldElement.removeAttribute('selected');
    currentRecitation = e.currentTarget.value;
    e.currentTarget.setAttribute('selected',true);
    updateRecitation();
}

function createVersePlayingButton() {
    let res = createDiv({tagName: 'input', id: 'verse-playing', innerHTML: '1'});
    res.setAttribute('type', 'number');
    res.addEventListener('click', clickVersePlayingButton);
    res.addEventListener('keyup', keyupVersePlaying);
    res.addEventListener('blur', blurVersePlaying);
    if (chapters[currentChapter-1].bismillah_pre) {
        res.min = 0;
    } else {
        res.min = 1;
    }
    res.max = chapters[currentChapter-1].verses_count;
    if (Number.isInteger(currentVerse)) {
        res.defaultValue = currentVerse;
    } else {
        res.defaultValue = res.min;
    }
    return res;
}

function clickPlayButton(e) {
    let versePlayingButton = document.getElementById('verse-playing');
    let v = Number(versePlayingButton.value);
    let t = timeStamps[v] - 0.05;
    if (audioPlayerElement.paused) {
        if (!isNaN(timeStamps[v]) && v % 1 === 0) {
            audioPlayerElement.currentTime = t;
            playFromVerse(v, "smooth");
        }
        playAudio();
        audioPlayerElement.play();
    } else {
        pauseAudio();
    }
}

function pauseAudio() {
    let playButton = document.getElementById('play-button');
    audioPlayerElement.pause();
    playButton.className = 'icon-button fas fa-play';
}

function playAudio() {
    let playButton = document.getElementById('play-button');
    playButton.className = 'icon-button fas fa-pause';
}

function clickVersePlayingButton(e) {
    pauseAudio();
    document.getElementById('verse-playing').value = '';
}

function keyupVersePlaying(e) {
    if (e.keyCode === 13) {
        document.getElementById('verse-playing').blur();
    }
}

function blurVersePlaying(e) {
    let versePlayingButton = document.getElementById('verse-playing');
    let v = Number(versePlayingButton.value);
    if (!isNaN(v) && v % 1 !== 0) {
        alert(`Current time = ${Math.round(audioPlayerElement.currentTime/60 * 100) / 100} minutes.\nDuration = ${Math.round(audioPlayerElement.duration/60 * 100) / 100} minutees.`)
        if (v*60 < audioPlayerElement.duration) {
            audioPlayerElement.currentTime = v*60;
            if (!isNaN(timeStamps[versePlayingButton.min])) {
                findVerseFromTime();
            }
        }
        return;
    } else if (isNaN(v) || v < -versePlayingButton.max || v > versePlayingButton.max || (v === 0 && versePlayingButton.min === '1')) {
        v = parseInt(versePlayingButton.defaultValue);
        versePlayingButton.value = v;
        return;
    } else if (v < 0) {
        v = chapters[currentChapter-1].verses_count+v+1;
    } else if (v === 0) {
        audioPlayerElement.currentTime = 0;
    }
    if (verseView === 1) {
        setCurrentVerse(v);
    } else {
        scrollToVerse(v, "auto");
    }
}

function setAudio() {
    if (isTestMode) {
        // disableAudio();
        return;
    }
    currentRecitation = 0;
    audioInfo = chapters[currentChapter-1].recitations;
    if (audioInfo) {
        enableAudio();
        updateRecitation();
    } else {
        disableAudio();
        document.getElementById('lower-controls').appendChild(createRecitationsButton());
    }
}

function enableAudio() {
    document.getElementById('upper-controls').style.display = 'flex';
    document.getElementById('play-button').disabled = false;
    document.getElementById('volume-button').disabled = false;
}

function disableAudio() {
    document.getElementById('upper-controls').style.display = 'none';
    document.getElementById('play-button').disabled = true;
    document.getElementById('volume-button').disabled = true;
}

function updateRecitation() {
    let folderPath = `audio/${addLeadingZeros(currentChapter)}/${audioInfo[currentRecitation].file}`;
    audioPlayerElement.src = folderPath + '.ogg';
    timeStamps = {};
    $.getJSON(folderPath + '.json', function(json){
        timeStamps = json;
        document.getElementById('lower-controls').appendChild(createRecitationsButton());
    });
}

function audioTimeUpdate(e) {
    setElapsedTime(audioPlayerElement.currentTime);
    if (!currentVersePlaying || !timeStamps[currentVersePlaying + 1] 
        || (audioPlayerElement.currentTime < timeStamps[currentVersePlaying + 1] - 0.5 && audioPlayerElement.currentTime > timeStamps[currentVersePlaying] - 0.5)) {
        return;
    }
    if (audioPlayerElement.currentTime > timeStamps[currentVersePlaying + 1] - 0.5 
        && (currentVersePlaying === chapters[currentChapter-1].verses_count-1 || audioPlayerElement.currentTime < timeStamps[currentVersePlaying + 2])
        ) {
        playNextVerse();
    } else {
        findVerseFromTime();
    }
}

function findVerseFromTime() {
    let i = 0;
    for (i = 0; i < chapters[currentChapter-1].verses_count-1; i++) {
        if (audioPlayerElement.currentTime < timeStamps[i+1]) {
            playFromVerse(i, "auto");
            return;
        }
    }
    playFromVerse(i, "auto");
}

function audioEnded(e) {

    if (verseView !== 1) {
        let previousVerseElement = document.querySelector(`.verse[verse="${currentVersePlaying}"]`);
        previousVerseElement.removeAttribute('playing');
    }
    currentVersePlaying = NaN;
    document.getElementById('play-button').className = 'fas fa-play';
}

function playNextVerse() {
    if (verseView !== 1) {
        let previousVerseElement = document.querySelector(`.verse[verse="${currentVersePlaying}"]`);
        previousVerseElement.removeAttribute('playing');
    }
    playFromVerse(currentVersePlaying+1);
}

function playFromVerse(v, behavior) {
    setVersePlayingValue(v);
    currentVersePlaying = v;
    if (verseView === 1) {
        setCurrentVerse(v);
    } else {
        let nextVerseElement = document.querySelector(`.verse[verse="${v}"]`);
        nextVerseElement.setAttribute('playing', true);
        nextVerseElement.scrollIntoView({behavior: behavior, block: "end"});
    }
}

function setVersePlayingValue(v) {
    let versePlayingButton = document.getElementById('verse-playing');
    versePlayingButton.defaultValue = v;
    versePlayingButton.value = v;
}