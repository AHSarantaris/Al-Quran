'use strict'

// const { func } = require("assert-plus");

let isTestMode = 0;

let baseURL = "https://api.quran.com/api/v4/";
let verseURL = "verses/by_chapter/";
let languageQuery = "?language=en";
let translitterationId = "57";

var chapters, translationsInfo;
let currentTranslations = [];
let chaptersLoaded = false;
let translationLoaded = false;

var nameOfGod;

let settings = {
    "async": true,
    "crossDomain": true,
    "url": "",
    "method": "GET",
    "headers": {},
    "mode":'cors',
    "data": {},
    "credentials": 'include'
};

// var wordSettings;
let wordSettings = {arabic: false, transliteration: true, translation: true};

let translationOrder = [
    // {
    //     name: "A. Hussain Sarantaris",
    //     id: -1,
    // },
    {
        name: "Saheeh International", 
        id: 20
    },
    {
        name: "Transliteration",
        id: 57
    },
    {
        name: "Dr. Mustafa Khattab, the Clear Quran",
        id: 131
    },
    {
        name: "Abdul Haleem", 
        id: 85
    },
    {
        name: "English Translation (Pickthall)",
        id: 19
    },
    {
        name: "English Translation (Yusuf Ali)",
        id: 22
    },
    {
        name: "Tafheem-ul-Quran - Abul Ala Maududi",
        id: 95
    },
    {
        name: "Fadel Soliman, Bridges’ translation",
        id: 149
    },
    {
        name: "Maarif-ul-Quran",
        id: 167
    },
    {
        name: "Mufti Taqi Usmani",
        id: 84
    },
    {
        name: "Dr. Ghali",
        id: 17
    },
    {
        name: "Ruwwad Center",
        id: 206
    },
    {
        name: "Dr. T. B. Irving",
        id: 207
    },
    {
        name: "Muhammad Taqi-ud-Din al-Hilali & Muhammad Muhsin Khan",
        id: 203
    },
    {
        name: "Abridged Explanation of the Quran",
        id: 171
    },
];


/**
 * Home Page
 */
let homeTopbarElement = document.getElementById('home-topbar')
var homePageElement = document.getElementById('home-page');
let homeContentWrapperElement = document.getElementById('home-content-wrapper');
let homeContentElement = document.getElementById('home-content');
var cardContainerElement;

/**
 * Settings Drawer
 */
let settingsOverlayElement = document.getElementById('settings-overlay');
var currentTheme;

/**
 * Chapter Page
 */
let chapterPageElement = document.getElementById('chapter-page');
let chapterTopbarElement = document.getElementById('chapter-topbar');
let chapterNavigatorElement = createDiv({id: 'chapter-navigator', className: 'navigator'});
let previousVerseElement = document.getElementById('previous-verse-button');
let nextVerseElement = document.getElementById('next-verse-button');
let chapterContentWrapperElement = document.getElementById('chapter-content-wrapper');
let chapterContentElement = document.getElementById('chapter-content');

/**
 * Audio Player
 */
let audioPlayerElement = createAudioPlayer();
var audioControlsElement;
var timeStamps, currentVersePlaying, audioInfo, currentRecitation;

/**
 * Verse Container
 */
let verseContainerElement = createDiv({id:'verse-container'});
let exteriorWordsContainerElement = createDiv({id: 'exterior-words-container'});
let bismillahElement = createDiv({id: 'bismillah', className: 'verse'});

var currentChapter;
var currentVerse;
var verseView; // 1: single verse, 2: all verses, 3: external words
var homeScrollTop;
var chapterScrollTop;
var fontSizeCounter;
var volume;
var speed;
var elapsedTime;

var verseTranslations;
var wordTranslations;


let backButtonElement = createBackButton();
let settingsButtonElement = createSettingsButton();



document.addEventListener('click', function(e) {
    if (settingsOverlayElement.getAttribute('open') && !e.target.matches('#settings-wrapper, #settings-wrapper *, #settings-button, #settings-button *')) {
        closeNav();
        e.stopImmediatePropagation();
    }
    let selectedWords = document.querySelectorAll('[selected-word]');
    if (selectedWords.length > 0) {
        selectedWords[0].removeAttribute('selected-word');
        selectedWords[1].removeAttribute('selected-word');
    }
    let dropdownContentElement = document.querySelector('.dropdown-content[selected]');
    if (dropdownContentElement && !e.target.matches('.dropdown-button, .dropdown-button > *, #volume-dropdown *, #speed-dropdown *')) {
        dropdownContentElement.removeAttribute('selected');
    }
}, true);


document.onreadystatechange = function(e) {
    if (document.readyState === 'interactive') {
        document.body.style.display = 'none'; 
        currentChapter = parseInt(localStorage.getItem('chapter'));
        currentVerse = parseInt(localStorage.getItem('verse'));
        verseView = parseInt(localStorage.getItem('verse-view'));
        volume = parseInt(localStorage.getItem('volume'));
        speed = parseInt(localStorage.getItem('speed'));
        elapsedTime = parseInt(localStorage.getItem('elapsed-time'));
        if (!volume) {
            volume = 90;
        }
        if (!speed) {
            speed = 0;
        }
        if (!elapsedTime) {
            elapsedTime = 0;
        }
        setCurrentTheme(parseInt(localStorage.getItem('theme')));
        setFontSize(parseInt(localStorage.getItem('font-size-counter')));
        setCurrentTranslations(JSON.parse(localStorage.getItem('current-translations')));
        setNameOfGod(JSON.parse(localStorage.getItem('name-of-God')));
        saveWordSettings(JSON.parse(localStorage.getItem('word-settings')));
        if (currentVerse || currentChapter) {
            chapterPageElement.style.display = 'flex';
        } else {
            homePageElement.style.display = 'flex';
        }
        setIsTestMode()
    }
    if (document.readyState === 'complete') {
        document.body.style.display = 'block';
    }
};


function setIsTestMode() {
    $.getJSON('translations/108/words.json', function(){
        isTestMode = 0;
        onReload();
    }).fail(function(){
        isTestMode = 1;
        onReload();
    });
}

function onReload() {
    createTranslationSettings();
    createBismillah();
    if (currentChapter) {
        showChapterPage();
    } else {
        showHomePage();
    }
}

function getChapters() {
    settings.url = baseURL + "chapters" + languageQuery;
    $.ajax(settings).done(function (response) {
        chapters = response.chapters;
        onReload();
    });
}

function createDiv(args) {
    if (!args.tagName) args.tagName = 'div';
    let res = document.createElement(args.tagName);
    res.className = args.className ? args.className : '';
    res.innerHTML = args.innerHTML ? args.innerHTML : '';
    res.id = args.id ? args.id : '';
    if (args.children) {
        for (let i = 0; i < args.children.length; i++) {
            res.appendChild(args.children[i]);
        }
    }
    return res;
}


function scrollToVerse(v, behavior, blockPosition) {
    let verseElement = document.querySelector(`.verse[verse="${v}"]`);
    if (!blockPosition) {
        let verseRect = verseElement.getBoundingClientRect();
        let contentRect = chapterContentWrapperElement.getBoundingClientRect();
        let verseHeight = verseRect.height;
        if (verseHeight < contentRect.height) {
            blockPosition = 'end';
        } else {
            blockPosition = 'start';
        }
    }
    verseElement.scrollIntoView({behavior: behavior, block: blockPosition});
}

function createDoubleLineDiv(line1, line2, args) {
    args = args ? args : {};
    if (!args.className) {
        args.className = '';
    }
    args.className += ' double-line';
    let lineElement1 = createDiv({className: 'medium-text', innerHTML: line1});
    let lineElement2 = createDiv({className: 'small-text', innerHTML: line2});
    args.children = [lineElement1, lineElement2];
    let res = createDiv(args);
    return res;
}

function scrollToCard(chapter) {
    let card = document.getElementsByClassName('card')[chapter-1]
    card.scrollIntoView({block: 'center'});
}



function createDropdownButton(button, args) {
    if (!args) {
        args = {};
    }
    if (!args.className) {
        args.className = '';
    }
    args.className += ' dropdown-button';
    let res = createDiv(args);
    res.appendChild(button);
    button.addEventListener('click', clickDropdownButton);
    return res;
}

function createDropdownContent(items, args) {
    if (!args) {
        args = {};
    }
    if (!args.className) {
        args.className = '';
    }
    args.className += ' dropdown-content';
    let res = createDiv(args);
    res.append(...items);
    return res;

}

function clickDropdownButton(e) {
    let newContentElement = e.currentTarget.nextSibling;
    if (!newContentElement.getAttribute('selected')) {
        newContentElement.setAttribute('selected',1);
    } else {
        newContentElement.removeAttribute('selected');
    }
}

function addLeadingZeros(x) {
    if (x >= 100) {
        return x;
    } else if (x >= 10) {
        return '0'+x;
    } else {
        return '00'+x;
    }
}


/**
 * Setters
 */
function setCurrentChapter(c) {
    if (currentChapter === c) {
        return;
    }
    currentChapter = c;
    localStorage.setItem('chapter', c);
    setCurrentVerse(NaN);
    if (c) {
        showChapterPage();
    }
}

function setCurrentVerse(v) {
    if (currentVerse === v) {
        return;
    }
    currentVerse = v;
    localStorage.setItem('verse', v);
    if (Number.isInteger(currentVerse)) {
        setVersePlayingValue(v);
        setVerseView(1);
    }
}

function setVerseView(view) {
    verseView = view;
    localStorage.setItem('verse-view', view);
    chapterContentElement.innerHTML = '';
    verseContainerElement.innerHTML = '';
    chapterContentElement.appendChild(verseContainerElement)
    chapterContentWrapperElement.scrollTop = 0;
    previousVerseElement.style.display = 'flex';
    nextVerseElement.style.display = 'flex';
    let verseSelectorButton = document.getElementById('verse-selector-button');
    if (verseView) {
        audioControlsElement.style.display = 'flex';
        verseSelectorButton.disabled = false;
    } else {
        if (audioControlsElement) {
            audioControlsElement.style.display = 'none';
        }
        verseSelectorButton.disabled = true;
    }
    if (verseView === 3) {
        createExteriorView();
        showCurrentVerse();
    } else if (verseView === 2) {
        createAllVerses();
        showCurrentVerse();
    } else if (verseView === 1) {
        createVerse(currentVerse);
        showCurrentVerse();
    }
}

function setCurrentTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    let lightTheme = document.getElementById('light-theme');
    let darkTheme = document.getElementById('dark-theme');
    if (!theme) {
        darkTheme.checked = true;
        lightTheme.checked = false;
        $('head').append('<link rel="stylesheet" href="dark.css" type="text/css" />');
        $('link[href="light.css"]').remove();
    } else {
        lightTheme.checked = true;
        darkTheme.checked = false;
        $('head').append('<link rel="stylesheet" href="light.css" type="text/css" />');
        $('link[href="dark.css"]').remove();
    }
}

function setFontSize(counter) {
    if (!counter) {
        counter = 0;
    }
    fontSizeCounter = counter;
    localStorage.setItem('font-size-counter', counter);
    document.getElementById('font-counter').innerHTML = counter;
    chapterContentElement.style.fontSize = (1 + counter*0.05) + "em";
}

function setCurrentTranslations(translations) {
    if (!translations) {
        translations = [];
    }
    currentTranslations = translations;
    localStorage.setItem('current-translations', JSON.stringify(translations));
}

function setNameOfGod(name) {
    nameOfGod = name;
    localStorage.setItem('name-of-God', name);
    let nameGod = document.getElementById('name-God');
    let nameAllah = document.getElementById('name-Allah');
    if (name) {
        nameGod.checked = false;
        nameAllah.checked = true;
    } else {
        nameAllah.checked = false;
        nameGod.checked = true;
    }
}

function saveWordSettings(json) {
    let arabicWBW = document.getElementById('arabic-wbw');
    let englishWBW = document.getElementById('english-wbw');
    if (json) {
        wordSettings = json;
        arabicWBW.checked = wordSettings.arabic;
        englishWBW.checked = wordSettings.translation || wordSettings.transliteration;
    } else {
        wordSettings.arabic = arabicWBW.checked;
        wordSettings.translation = englishWBW.checked;
        wordSettings.transliteration = englishWBW.checked;
    }
    localStorage.setItem('word-settings', JSON.stringify(wordSettings));
}

function setSpeed(v) {
    if (!v && v !== 0) {
        v = 0;
    } else if (v > 50) {
        v = 50;
    } else if (v < -50) {
        v = -50;
    }
    let rate = 1 + v/100;
    audioPlayerElement.playbackRate = rate;
    document.getElementById('speed-slider').value = v;
    document.getElementById('speed-count').innerHTML = (Math.round(rate*100)/100).toFixed(2) + 'x';
    speed = v;
    localStorage.setItem('speed', v);
}

function setVolume(v) {
    if (!v && v !== 0) {
        v = 90;
    } else if (v > 100) {
        v = 100;
    } else if (v < 0) {
        v = 0;
    }
    audioPlayerElement.volume = v / 100.0;
    document.getElementById('volume-slider').value = v;
    document.getElementById('volume-count').innerHTML = v + '%';
    volume = v;
    localStorage.setItem('volume', v);
}

function setElapsedTime(s) {
    if ((!s && s !== 0) || s < 0) {
        s = 0;
    } else if (s > audioPlayerElement.duration) {
        s = audioPlayerElement.duration;
    }
    let slider = document.getElementById('time-slider');
    slider.value = s;
    slider.style.backgroundSize = Math.ceil(s * 100 / slider.max) + '% 100%';
    document.getElementById('elapsed-label').innerHTML = timeInMinutes(s);
    elapsedTime = s;
    localStorage.setItem('elapsed-time', s);
}



