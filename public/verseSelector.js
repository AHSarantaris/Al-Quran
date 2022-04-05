

function createVerseSelector() {
    let res = createDiv({id: 'verse-selector'});
    var verseNumber;
    let showAllVersesButton = createDiv({tagName: 'button', id: 'show-all-verses-button', className: 'block-button', innerHTML: 'All Verses'});
    let exteriorWordsButton = createDiv({tagName: 'button', id: 'exterior-words-button', className: 'block-button', innerHTML: 'First & last words'});
    let buttonContainer = createDiv({id: 'verse-selector-button-container', children: [showAllVersesButton, exteriorWordsButton]});
    showAllVersesButton.addEventListener('click', clickShowAllVerses);
    exteriorWordsButton.addEventListener('click', clickExteriorWordsButton);
    for (let v = 0; v < chapters[currentChapter-1].verses_count+1; v++) {
        verseNumber = createDiv({tagName: 'button', className: 'verse-card block-button', innerHTML: `<span>${v}</span>`});
        verseNumber.setAttribute('chapter',currentChapter);
        verseNumber.setAttribute('verse',v);
        verseNumber.addEventListener('click', clickVerseCard);
        res.appendChild(verseNumber);
    }
    if (!chapters[currentChapter-1].bismillah_pre) {
        res.firstChild.style.visibility = 'hidden';
    }
    // verseChangeElement.style.display = 'none';
    chapterContentElement.innerHTML = '';
    createChapterNavigator();
    chapterContentElement.appendChild(chapterNavigatorElement);
    chapterContentElement.appendChild(buttonContainer);
    chapterContentElement.appendChild(res);
}

function clickExteriorWordsButton(e) {
    setVerseView(3)
}

function clickShowAllVerses(e) {
    setVerseView(2);
}

function clickVerseCard(e) {
    let v = parseInt(e.currentTarget.getAttribute('verse'));
    setVerseView(1);
    setCurrentVerse(v);
}


function createChapterNavigator() {
    var previousElement, nextElement;
    chapterNavigatorElement.style.display = "flex";
    chapterNavigatorElement.innerHTML = '';
    previousElement = createDiv({tagName: 'button',className: 'previous block-button'});
    nextElement = createDiv({tagName: 'button',className: 'next block-button'});
    previousElement.appendChild(createDiv({className: ' fas fa-chevron-left'}));
    nextElement.appendChild(createDiv({className: ' fas fa-chevron-right'}));
    previousElement.addEventListener('click', previousChapter);
    nextElement.addEventListener('click', nextChapter);
    chapterNavigatorElement.appendChild(previousElement);
    chapterNavigatorElement.appendChild(nextElement);
    if (currentChapter === 1) {
        previousElement.style.visibility = 'hidden';
    } else {
        previousElement.appendChild(createDiv({innerHTML: chapters[currentChapter-2].name_simple}));
    }
    if (currentChapter === 114) {
        nextElement.style.visibility = 'hidden';
    } else {
        nextElement.appendChild(createDiv({innerHTML: chapters[currentChapter].name_simple}));
    }
}

function previousChapter() {
    setCurrentChapter(currentChapter-1);
    // if (verseView > 1) {
    //     setVerseView(verseView);
    // }
}

function nextChapter() {
    setCurrentChapter(currentChapter+1);
    // if (verseView > 1) {
    //     setVerseView(verseView);
    // }
}


