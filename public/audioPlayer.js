
function createAudioPlayer() {
    let res = document.getElementById('audio-player');
    res.addEventListener('timeupdate', audioTimeUpdate);
    res.addEventListener('ended', audioEnded);
    return res;
}

function createAudioControls() {
    currentRecitation = 0;
    setAudio();
    let res = document.getElementById('audio-controls');
    res.innerHTML = '';
    let playButton = createDiv({tagName: 'button', id: 'play-button', className: 'icon-button fas fa-play'});
    let versePlayingButton = createVersePlayingButton();
    playButton.addEventListener('click', clickPlayButton);
    let recitationsButton = createRecitationsButton();
    res.appendChild(playButton);
    res.appendChild(versePlayingButton);
    res.appendChild(recitationsButton);
    return res;
}

function createRecitationsButton() {
    let numberOfRecitations = audioInfo[currentChapter] ? audioInfo[currentChapter].length : 0;
    let recitationsStr = numberOfRecitations === 1 ? 'Recitation' : 'Recitations';
    let button = createDoubleLineDiv(numberOfRecitations + ' <i class="fas fa-caret-up"></i>', recitationsStr, {tagName: 'button', id: 'recitations-button', className: 'icon-button'});
    button.disabled = numberOfRecitations ? false : true;
    let items = [];
    for (let i = 0; i < numberOfRecitations; i++) {
        items.push(createDiv({tagName: 'button', className: 'dropdown-item block-button', innerHTML: audioInfo[currentChapter][i].name}));
        items[i].value = i;
        items[i].addEventListener('click', clickRecitation);
        if (i === currentRecitation) {
            items[i].setAttribute('selected',true);
        }
    }
    let dropdownContent = createDropdownContent(items);
    let res = createDropdownButton(button, dropdownContent, {id: 'recitations-dropdown'});
    return res;
}

function clickRecitation(e) {
    let oldElement = document.querySelector(`.dropdown-item[selected]`);
    oldElement.removeAttribute('selected');
    currentRecitation = e.currentTarget.value;
    e.currentTarget.setAttribute('selected',true);;
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
        if (verseView === 1) {
            audioPlayerElement.currentTime = timeStamps[v] - 0.05;
        }
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
    document.getElementById('verse-playing').select();
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
    } else if (v < 0) {
        v = chapters[currentChapter-1].verses_count+v+1;
    } 
    if (Number.isInteger(currentVerse)) {
        setCurrentVerse(v);
    } else {
        let nextVerseElement = document.querySelector(`.verse[verse="${v}"]`);
        scrollToVerse(nextVerseElement);
    }
}

function setAudio() {
    $.getJSON("timeStamps.json", function(data){
        console.log(data);
    }).fail(function(){
        console.log("Cannot read local file.");
    });
    if (!audioInfo[currentChapter]) {
        return;
    }
    let currentAudioInfo = audioInfo[currentChapter][currentRecitation];
    let loc = window.location.href;
    let dir = loc.substring(0, loc.lastIndexOf('/'));
    let audioPath = `${dir}/audio/${currentChapter}/${currentAudioInfo.fileName}.ogg`;
    audioPlayerElement.src = audioPath;
    timeStamps = currentAudioInfo.timeStamps;
}

function audioTimeUpdate(e) {
    if (audioPlayerElement.currentTime > timeStamps[currentVersePlaying + 1]) {
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