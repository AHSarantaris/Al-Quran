

function showChapterPage() {
    homePageElement.style.display = 'none';
    chapterPageElement.style.display = 'flex';
    createChapterTopbar(currentChapter);
    audioControlsElement = createAudioControls();
    setAudio();
    if (isTestMode) {
        showVerseView();
        return;
    }
    // verseTranslations = undefined;
    verseTranslations = true;
    wordTranslations = undefined;
    // loadVerseTranslations();
    loadWordTranslations();
}

function loadVerseTranslations() {
    let folderPath = `translations/${addLeadingZeros(currentChapter)}/`;
    $.getJSON(folderPath + 'en.json', function(json){
        verseTranslations = json;
        if (wordTranslations) {
            showVerseView();
        }
    });
}

function loadWordTranslations() {
    let folderPath = `translations/${addLeadingZeros(currentChapter)}/`;
    $.getJSON(folderPath + 'words.json', function(json){
        wordTranslations = json;
        if (verseTranslations) {
            showVerseView();
        }
    });
}

function showVerseSelector() {
    previousVerseElement.style.display = 'none';
    nextVerseElement.style.display = 'none';
    createVerseSelector(currentChapter);    
}

function showVerseView() {
    if (verseView) {
        previousVerseElement.style.display = 'flex';
        nextVerseElement.style.display = 'flex';
        setVerseView(verseView);
    } else {
        showVerseSelector();
    }
}


function previousVerse() {
    setCurrentVerse(currentVerse-1);
}

function nextVerse() {
    setCurrentVerse(currentVerse+1);
}

function clickPreviousVerseButton() {
    if (currentVerse === 0) {
        return;
    } else if (verseView === 1) {
        if (currentVerse !== 1 || chapters[currentChapter-1].bismillah_pre) {
            previousVerse();
        }
        return;
    }
    var verseRect;
    let contentRect = chapterContentWrapperElement.getBoundingClientRect();
    for (let i = 1; i <= chapters[currentChapter-1].verses_count; i++) {
        verseRect = getVersePositionsPrevious(i);
        if (!verseRect) {
            continue;
        }
        if (verseRect.internalTop >= contentRect.top) {
            if (i === 1) {
                chapterContentElement.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                scrollToVerseSmooth(i-1,"start");
            }
            return;
        } else if (verseRect.internalBottom <= contentRect.bottom && verseRect.internalBottom >= contentRect.top) {
            if (verseRect.externalBottom - verseRect.externalTop > contentRect.height) {
                scrollToVerseSmooth(i,"end");
            } else {
                scrollToVerseSmooth(i,"start");
            }
            return;
        } else if (verseRect.internalBottom >= contentRect.top) {
            scrollToVerseSmooth(i,"start");
            return;
        }
    }
}

function clickNextVerseButton() {
    if (currentVerse === chapters[currentChapter-1].verses_count) {
        return;
    } else if (verseView === 1) {
        nextVerse();
        return;
    }
    var verseRect;
    let contentRect = chapterContentWrapperElement.getBoundingClientRect();
    for (let i = chapters[currentChapter-1].verses_count; i > 0; i--) {
        verseRect = getVersePositionsNext(i);
        if (!verseRect) {
            continue;
        }
        if (verseRect.internalBottom <= contentRect.bottom) {
            if (i === chapters[currentChapter-1].verses_count) {
                let scrollTop = 0.5*$('#chapter-content-wrapper').height();
                smoothScroll(scrollTop);
            } else {
                scrollToVerseSmooth(i+1,"end");
            }
            return;
        } else if (verseRect.internalTop >= contentRect.top && verseRect.internalTop <= contentRect.bottom) {
            if (verseRect.externalBottom - verseRect.externalTop > contentRect.height) {
                scrollToVerseSmooth(i, "start");
            } else {
                scrollToVerseSmooth(i,"end");
            }
            return;
        } else if (verseRect.internalTop <= contentRect.bottom) {
            if (verseRect.internalBottom - contentRect.top > 3/2*contentRect.height) {
                let scrollTop = 0.5*contentRect.height;
                smoothScroll(scrollTop);
            } else {
                scrollToVerseSmooth(i,"end");
            }
            return;
        }
    }
}

function getVersePositionsPrevious(i) {
    let verse = document.querySelector(`.verse[verse="${i}"]`);
    if (!verse) {
        return undefined;
    } 
    let currentContainer = document.querySelector(`.verse[verse="${i}"] .word-container`);
    let previousContainer = document.querySelector(`.verse[verse="${i+1}"] .word-container`);
    let verseRect = verse.getBoundingClientRect();
    var internalBottom;
    let internalTop = currentContainer.getBoundingClientRect().top;
    if (previousContainer) {
        internalBottom = previousContainer.getBoundingClientRect().top;
    } else {
        internalBottom = verseRect.bottom;
    }
    return {externalTop: verseRect.top, externalBottom: verseRect.bottom, internalTop: internalTop, internalBottom: internalBottom};
}

function getVersePositionsNext(i) {
    let verse = document.querySelector(`.verse[verse="${i}"]`);
    if (!verse) {
        return undefined;
    } 
    let currentContainer = document.querySelector(`.verse[verse="${i}"] .translation-container`);
    let previousContainer = document.querySelector(`.verse[verse="${i-1}"] .translation-container`);
    let verseRect = verse.getBoundingClientRect();
    let internalBottom = currentContainer.getBoundingClientRect().bottom;
    let internalTop = previousContainer.getBoundingClientRect().bottom;
    return {externalTop: verseRect.top, externalBottom: verseRect.bottom, internalTop: internalTop, internalBottom: internalBottom};
}

function scrollToVerseSmooth(i, block) {
    let element = $(`.verse[verse="${i}"]`);
    let scrollTop = - $('#chapter-content-wrapper').position().top + element.offset().top;
    if (block === 'end') {
        scrollTop = scrollTop - $('#chapter-content-wrapper').height() + element.outerHeight();
    }
    smoothScroll(scrollTop);
}

function smoothScroll(scrollTop) {
    $('#chapter-content-wrapper').stop().animate({
        scrollTop: scrollTop + $('#chapter-content-wrapper').scrollTop()
    }, Math.min(300, 2*Math.abs(scrollTop)));
}

function createChapterTopbar() {
    let chapterInfo = chapters[currentChapter-1];
    let chapterName = createDoubleLineDiv(chapterInfo.name_simple, chapterInfo.translated_name.name, {id: 'chapter-name'});
    chapterTopbarElement.innerHTML = '';
    chapterTopbarElement.appendChild(backButtonElement);
    chapterTopbarElement.appendChild(createVerseSelectorButton());
    chapterTopbarElement.appendChild(createDiv({id: 'number', innerHTML: currentChapter}));
    chapterTopbarElement.appendChild(chapterName);
    chapterTopbarElement.appendChild(createDiv({id:'name-arabic', innerHTML: chapterInfo.name_arabic}));
    chapterTopbarElement.appendChild(createDoubleLineDiv(chapterInfo.verses_count, 'Verses', {id: 'verses'}));
    chapterTopbarElement.appendChild(settingsButtonElement);
}


function createBackButton() {
    let res = createDiv({tagName: 'button', id: 'back-button', className: 'icon-button fa fa-arrow-left'});
    res.addEventListener('click', clickBackButton);
    return res;
}

function clickBackButton(e) {
    let c = currentChapter;
    setCurrentChapter(NaN);
    setCurrentVerse(NaN);
    setVerseView(NaN);
    showHomePage();
    if (homeScrollTop) {
        chapterContentWrapperElement.scrollTop = homeScrollTop;
    } else {
        scrollToCard(c);
    }
}


function createVerseSelectorButton() {
    let res = createDiv({tagName: 'button', id: 'verse-selector-button', className: 'icon-button fa fa-th'});
    res.disabled = true;
    res.addEventListener('click', clickVerseSelectorButton);
    return res;
}


function clickVerseSelectorButton(e) {
    chapterContentWrapperElement.scrollTop = 0;
    setCurrentVerse(NaN);
    setVerseView(NaN);
    showVerseSelector();
}


