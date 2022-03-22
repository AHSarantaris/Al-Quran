
function createAudioPlayer() {
    let res = document.getElementById('audio-player');
    res.addEventListener('timeupdate', audioTimeUpdate);
    res.addEventListener('ended', audioEnded);
    return res;
}

function createAudioControls() {
    currentRecitation = 0;
    let res = document.getElementById('audio-controls');
    res.innerHTML = '';
    let playButton = createDiv({tagName: 'button', id: 'play-button', className: 'icon-button fas fa-play'});
    let versePlayingButton = createVersePlayingButton();
    playButton.addEventListener('click', clickPlayButton);
    res.appendChild(playButton);
    res.appendChild(versePlayingButton);
    setAudio();
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
    let res = createDiv({tagName: 'input', id: 'verse-playing', className: 'block-button', innerHTML: '1'});
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
    let playButton = document.getElementById('play-button');
    let versePlayingButton = document.getElementById('verse-playing');
    let v = parseInt(versePlayingButton.value);
    if (audioPlayerElement.paused) {
        audioPlayerElement.currentTime = timeStamps[v] - 0.05;
        playFromVerse(v);
        playButton.className = 'fas fa-pause';
        audioPlayerElement.play();
    } else {
        pauseAudio();
    }
}

function pauseAudio() {
    let playButton = document.getElementById('play-button');
    audioPlayerElement.pause();
    playButton.className = 'fas fa-play';
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
    let v = parseInt(versePlayingButton.value);
    if (isNaN(v) || v < -versePlayingButton.max || v > versePlayingButton.max || (v === 0 && versePlayingButton.min === '1')) {
        v = parseInt(versePlayingButton.defaultValue);
        versePlayingButton.value = v;
        return;
    } else if (v < 0) {
        v = chapters[currentChapter-1].verses_count+v+1;
    } 
    if (verseView === 1) {
        setCurrentVerse(v);
    } else {
        let nextVerseElement = document.querySelector(`.verse[verse="${v}"]`);
        scrollToVerse(nextVerseElement);
    }
}

function setAudio() {
    if (isTestMode) {
        return;
    }
    let folderPath = `audio/${addLeadingZeros(currentChapter)}/`;
    $.getJSON(folderPath + 'audio_info.json', function(json){
        audioInfo = json;
        currentRecitation = 0;
        updateRecitation();
    }).catch(function(){
        console.log("Cannot read local file.");
    }).always(function(){
        audioControlsElement.appendChild(createRecitationsButton());
    });
}

function updateRecitation() {
    let folderPath = `audio/${addLeadingZeros(currentChapter)}/`;
    audioPlayerElement.src = folderPath + audioInfo[currentRecitation].fileName;
    timeStamps = audioInfo[currentRecitation].timeStamps;
}

function audioTimeUpdate(e) {
    if (audioPlayerElement.currentTime > timeStamps[currentVersePlaying + 1] - 0.05) {
        playNextVerse();
    }
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

function playFromVerse(v) {
    setVersePlayingValue(v);
    currentVersePlaying = v;
    if (verseView === 1) {
        setCurrentVerse(v);
    } else {
        let nextVerseElement = document.querySelector(`.verse[verse="${v}"]`);
        nextVerseElement.setAttribute('playing', true);
        nextVerseElement.scrollIntoView({behavior: "smooth", block: "end"});
    }
}

function setVersePlayingValue(v) {
    let versePlayingButton = document.getElementById('verse-playing');
    versePlayingButton.defaultValue = v;
    versePlayingButton.value = v;
}