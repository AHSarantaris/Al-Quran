'use strict'

let baseURL = "https://api.quran.com/api/v4/";
let verseURL = "verses/by_chapter/";
let languageQuery = "?language=en";
let translitterationId = "57";

var chapters, translation;
let chaptersLoaded = false;
let translationLoaded = false;

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

/**
 * Home Page
 */
let homeTopbarElement = document.getElementById('home-topbar')
var homePageElement = document.getElementById('home-page');
let homeContentWrapperElement = document.getElementById('home-content-wrapper');
let homeContentElement = document.getElementById('home-content');
var cardContainerElement;

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
let singleVerseElement = createDiv({id: 'single-verse'});
let bismillahElement = createDiv({id: 'bismillah', className: 'verse'});

var translationNameElement;

var currentChapter;
var currentVerse;
var verseView; // 1: single verse, 2: all verses, 3: external words
var homeScrollTop;
var chapterScrollTop;

document.onclick = function(e) {
    let dropdownContentElement = document.querySelector('.dropdown-content[selected]');
    if (dropdownContentElement) {
        dropdownContentElement.removeAttribute('selected');
    }
}

let backButtonElement = createBackButton();
let chapterButtonElement = createChapterButton();

document.onreadystatechange = function(e) {
    if (document.readyState === 'interactive') {  
        currentChapter = parseInt(localStorage.getItem('chapter'));
        currentVerse = parseInt(localStorage.getItem('verse'));
        verseView = parseInt(localStorage.getItem('verse-view'));
        if (currentVerse || currentChapter) {
            chapterPageElement.style.display = 'flex';
        } else {
            homePageElement.style.display = 'flex';
        }
    } 
};

init();

function init() {
    getTranslations();
    getChapters();
}

function onReload() {
    if (!chaptersLoaded || !translationLoaded) {
        return;
    }
    if (currentChapter) {
        showChapterPage();
    } else {
        showHomePage();
    }
}

function getTranslations() {
    settings.url = baseURL + "resources/translations?language=en";
    $.ajax(settings).done(function (response) {
        selectTranslation(response.translations);
        createBismillah();
        translationLoaded = true;
        onReload();
    });
}

function selectTranslation(translations) {
    for (let i = 0; i < translations.length; i++) {
        if (translations[i].name === 'Saheeh International') {
            translation = translations[i];
            translationNameElement = createDiv({className: 'translation-name', innerHTML: '— ' + translation.name});
            return;
        }
    }
}

function getChapters() {
    settings.url = baseURL + "chapters" + languageQuery;
    $.ajax(settings).done(function (response) {
        chapters = response.chapters;
        chaptersLoaded = true;
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

function setCurrentChapter(c) {
    if (currentChapter === c) {
        return;
    }
    currentChapter = c;
    localStorage.setItem('chapter', c);
    setCurrentVerse(NaN);
    if (c) {
        showChapterPage();
        audioControlsElement = createAudioControls();
    }
}

function setCurrentVerse(v) {
    if (currentVerse === v) {
        return;
    }
    currentVerse = v;
    localStorage.setItem('verse', v);
    if (Number.isInteger(currentVerse)) {
        let versePlayingButton = document.getElementById('verse-playing');
        versePlayingButton.defaultValue = currentVerse;
        versePlayingButton.value = currentVerse;
        showCurrentVerse();
    }
}

function setVerseView(view) {
    verseView = view;
    localStorage.setItem('verse-view', view);
    chapterContentElement.innerHTML = '';
    chapterContentWrapperElement.scrollTop = 0;
    previousVerseElement.style.display = 'flex';
    nextVerseElement.style.display = 'flex';
    let verseSelectorButton = document.getElementById('verse-selector-button');
    if (verseView) {
        audioControlsElement.style.display = 'flex';
        verseSelectorButton.disabled = false;
    } else {
        audioControlsElement.style.display = 'none';
        verseSelectorButton.disabled = true;
    }
    if (verseView === 3) {
        createExteriorView();
        showCurrentVerse();
    } else if (verseView === 2) {
        createAllVerses();
        showCurrentVerse();
    } else if (verseView === 1) {
        singleVerseElement.innerHTML = '';
        chapterContentElement.appendChild(singleVerseElement);
    }
}

function scrollToVerse(verseElement) {
    let verseRect = verseElement.getBoundingClientRect();
    let contentRect = chapterContentWrapperElement.getBoundingClientRect();
    let verseHeight = verseRect.height;
    var blockPosition; 
    if (verseHeight < contentRect.height) {
        blockPosition = 'end';
    } else {
        blockPosition = 'start';
    }
    verseElement.scrollIntoView({behavior: "auto", block: blockPosition});
}

function createDoubleLineDiv(line1, line2, args) {
    args = args ? args : {};
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

function createDropdownButton(button, dropdownContent, args) {
    if (!args) {
        args = {};
    }
    if (!args.className) {
        args.className = '';
    }
    args.className += ' dropdown-button';
    let res = createDiv(args);
    res.addEventListener('click', clickDropdownButton);
    res.appendChild(button);
    res.appendChild(dropdownContent);
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
    let previousContentElement = document.querySelector('.dropdown-content[selected]');
    let newContentElement = e.currentTarget.querySelector('.dropdown-content');
    if (!newContentElement.getAttribute('selected')) {
        newContentElement.setAttribute('selected',1);
    }
    if (previousContentElement) {
        previousContentElement.removeAttribute('selected');
    }
    e.stopPropagation();
}




