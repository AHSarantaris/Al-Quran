

function showChapterPage() {
    homePageElement.style.display = 'none';
    chapterPageElement.style.display = 'flex';
    createChapterTopbar(currentChapter);
    audioControlsElement = createAudioControls();
    if (isTestMode) {
        showVerseView();
        return;
    }
    verseTranslations = undefined;
    wordTranslations = undefined;
    loadVerseTranslations();
    loadWordTranslations();
}

function loadVerseTranslations() {
    let folderPath = `translations/${addLeadingZeros(currentChapter)}/`;
    $.getJSON(folderPath + 'en.json', function(json){
        verseTranslations = json;
        if (wordTranslations) {
            showVerseView();
        }
    }).catch(function(){
        console.log("Cannot read local file.");
    });
}

function loadWordTranslations() {
    let folderPath = `translations/${addLeadingZeros(currentChapter)}/`;
    $.getJSON(folderPath + 'words.json', function(json){
        wordTranslations = json;
        if (verseTranslations) {
            showVerseView();
        }
    }).catch(function(){
        console.log("Cannot read local file.");
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
        showCurrentVerse();
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
    var verse, verseRect, contentRect, verseTop, verseBottom;
    let computedStyle = getComputedStyle(document.querySelector(`.verse[verse="1"]`));
    for (let i = 1; i <= chapters[currentChapter-1].verses_count; i++) {
        verse = document.querySelector(`.verse[verse="${i}"]`);
        verseRect = verse.getBoundingClientRect();
        contentRect = chapterContentWrapperElement.getBoundingClientRect();
        verseTop = verseRect.top + 2.5*parseFloat(computedStyle.paddingTop);
        verseBottom = verseRect.bottom + parseFloat(computedStyle.paddingBottom);
        if (verseTop >= contentRect.top) {
            if (i === 1) {
                chapterContentElement.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                scrollToVerseSmooth(i-1,"start");
            }
            return;
        } else if (verseBottom <= contentRect.bottom && verseBottom >= contentRect.top) {
            if (verseRect.height > contentRect.height) {
                scrollToVerseSmooth(i,"end");
            } else {
                scrollToVerseSmooth(i,"start");
            }
            return;
        } else if (verseBottom >= contentRect.top) {
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
    var verse, verseRect, verseTop, verseBottom;
    let contentRect = chapterContentWrapperElement.getBoundingClientRect();
    let computedStyle = getComputedStyle(document.querySelector(`.verse[verse="1"]`));
    for (let i = chapters[currentChapter-1].verses_count; i > 0; i--) {
        verse = document.querySelector(`.verse[verse="${i}"]`);
        verseRect = verse.getBoundingClientRect();
        verseTop = verseRect.top - parseFloat(computedStyle.paddingTop);
        verseBottom = verseRect.bottom - 2*parseFloat(computedStyle.paddingBottom);
        if (verseBottom <= contentRect.bottom) {
            if (i === chapters[currentChapter-1].verses_count) {
                let scrollTop = 0.5*$('#chapter-content-wrapper').height();
                smoothScroll(scrollTop);
            } else {
                scrollToVerseSmooth(i+1,"end");
            }
            return;
        } else if (verseTop >= contentRect.top && verseTop <= contentRect.bottom) {
            if (verseRect.height > contentRect.height) {
                scrollToVerseSmooth(i, "start");
            } else {
                scrollToVerseSmooth(i,"end");
            }
            return;
        } else if (verseTop <= contentRect.bottom) {
            if (verseBottom - contentRect.top > 3/2*contentRect.height) {
                let scrollTop = 0.5*contentRect.height;
                smoothScroll(scrollTop);
            } else {
                scrollToVerseSmooth(i,"end");
            }
            return;
        }
    }
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
    }, Math.min(600, 1.5*Math.abs(scrollTop)));
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


