

function showChapterPage() {
    homePageElement.style.display = 'none';
    chapterPageElement.style.display = 'flex';
    createChapterTopbar(currentChapter);
    audioControlsElement = createAudioControls();
    if (verseView) {
        showVerseView();
    } else {
        showVerseSelector();
    }
}

function showVerseSelector() {
    previousVerseElement.style.display = 'none';
    nextVerseElement.style.display = 'none';
    createVerseSelector(currentChapter);    
}

function showVerseView() {
    previousVerseElement.style.display = 'flex';
    nextVerseElement.style.display = 'flex';
    setVerseView(verseView);
    showCurrentVerse();
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
        verseTop = verseRect.top + parseFloat(computedStyle.paddingTop);
        verseBottom = verseRect.bottom + parseFloat(computedStyle.paddingBottom);
        if (verseTop >= contentRect.top) {
            if (i === 1) {
                chapterContentElement.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                document.querySelector(`.verse[verse="${i-1}"]`).scrollIntoView({behavior: "smooth", block: "start"});
            }
            return;
        } else if (verseBottom <= contentRect.bottom && verseBottom >= contentRect.top) {
            if (verseRect.height > contentRect.height) {
                document.querySelector(`.verse[verse="${i}"]`).scrollIntoView({behavior: "smooth", block: "end"});
            } else {
                document.querySelector(`.verse[verse="${i}"]`).scrollIntoView({behavior: "smooth", block: "start"});
            }
            return;
        } else if (verseBottom >= contentRect.top) {
            document.querySelector(`.verse[verse="${i}"]`).scrollIntoView({behavior: "smooth", block: "start"});
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
    var verse, verseRect, contentRect, verseTop, verseBottom;
    let computedStyle = getComputedStyle(document.querySelector(`.verse[verse="1"]`));
    for (let i = chapters[currentChapter-1].verses_count; i > 0; i--) {
        verse = document.querySelector(`.verse[verse="${i}"]`);
        verseRect = verse.getBoundingClientRect();
        contentRect = chapterContentWrapperElement.getBoundingClientRect();
        verseTop = verseRect.top - parseFloat(computedStyle.paddingTop);
        verseBottom = verseRect.bottom - parseFloat(computedStyle.paddingBottom);
        if (verseBottom <= contentRect.bottom) {
            if (i === chapters[currentChapter-1].verses_count) {
                chapterContentElement.scrollIntoView({ behavior: "smooth", block: "end" });
            } else {
                document.querySelector(`.verse[verse="${i+1}"]`).scrollIntoView({behavior: "smooth", block: "end"});
            }
            return;
        } else if (verseTop >= contentRect.top && verseTop <= contentRect.bottom) {
            if (verseRect.height > contentRect.height) {
                document.querySelector(`.verse[verse="${i}"]`).scrollIntoView({behavior: "smooth", block: "start"});
            } else {
                document.querySelector(`.verse[verse="${i}"]`).scrollIntoView({behavior: "smooth", block: "end"});
            }
            return;
        } else if (verseTop <= contentRect.bottom) {
            if (verseBottom - contentRect.top > 3/2*contentRect.height) {
                chapterContentWrapperElement.scrollBy({left: 0, top: contentRect.height/2, behavior: 'smooth'});
            } else {
                document.querySelector(`.verse[verse="${i}"]`).scrollIntoView({behavior: "smooth", block: "end"});
            }
            return;
        }
    }
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
    chapterTopbarElement.appendChild(chapterButtonElement);
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

function createChapterButton() {
    let tafsirButton = createDiv({tagName: 'button', className: 'dropdown-item block-button', innerHTML: 'Tafsir - Sayyid Abul Ala Maududi'});
    tafsirButton.addEventListener('click', clickTafsirButton);
    let button = createDiv({tagName: 'button', className: ' icon-button fa fa-ellipsis-v'});
    let dropdownContent = createDropdownContent([tafsirButton]);
    let res = createDropdownButton(button, dropdownContent, {id: 'chapter-button'});
    return res;
}

function clickVerseSelectorButton(e) {
    chapterContentWrapperElement.scrollTop = 0;
    setCurrentVerse(NaN);
    setVerseView(NaN);
    showVerseSelector();
}

function clickTafsirButton(e) {
    let url = `http://www.englishtafsir.com/Quran/${currentChapter}/index.html`;
    window.open(url);
}

