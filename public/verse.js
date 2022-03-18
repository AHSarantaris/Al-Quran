
function showCurrentVerse() {
    if (verseView === 1) {
        singleVerseElement.innerHTML = '';
        createVerse(currentVerse, true);
    }
    previousVerseElement.disabled = false;
    nextVerseElement.disabled = false;
    if (currentVerse === 0 || (currentVerse === 1 && !chapters[currentChapter-1].bismillah_pre)) {
        previousVerseElement.disabled = true;
    } else if (currentVerse === chapters[currentChapter-1].verses_count) {
        nextVerseElement.disabled = true;
    }
}

function createAllVerses() {
    verseContainerElement.innerHTML = '';
    createChapterNavigator();
    chapterContentElement.appendChild(verseContainerElement)
    if (chapters[currentChapter-1].bismillah_pre) {
        appendToVerseContainer(bismillahElement, 0, false);
    }
    for (let i = 0; i < chapters[currentChapter-1].verses_count; i++) {
        createVerse(i+1, false);
    }
    chapterContentElement.appendChild(chapterNavigatorElement);
}

function createBismillah() {
    let transliteratedWords = ["bis'mi","l-lahi","l-raḥmāni","l-raḥīmi"];
    let translatedWords = ["In (the) name", "(of) God","the Merciful","the Compassionate"];
    let wordContainerElement = createDiv({className:'word-container'});
    var transliteratedElement, translatedElement, wordElement;
    for (let j = 0; j < 4; j++) {
        wordElement = createDiv({className:'word'});
        transliteratedElement = createDiv({className:'transliterated-word', id: `${1}:${1}:${j+1}`, innerHTML: transliteratedWords[j]});
        transliteratedElement.addEventListener('click',clickWord)
        translatedElement = createDiv({className:'translated-word', innerHTML: translatedWords[j]});
        wordElement.appendChild(transliteratedElement);
        wordElement.appendChild(translatedElement);
        wordContainerElement.appendChild(wordElement);
    }
    bismillahElement.appendChild(wordContainerElement);
}



function createVerse(v, isSingle) {
    if (v === 0) {
        appendToVerseContainer(bismillahElement, 0, true);
        return;
    }
    var verseData, word, wordContainerElement, translationElement, wordElement, numberElement, verseElement, headerElement, verseButtonElement;
    settings.url = `${baseURL}verses/by_key/${currentChapter}:${v}${languageQuery}&translations=${translation.id}&words=1&word_fields=location,text_uthmani`;
    $.ajax(settings).done(function (response) {
        verseData = response.verse;
        verseElement = createDiv({className: 'verse'});
        headerElement = createDiv({className: 'verse-header'});
        numberElement = createDiv({tagName: 'span', className:'verse-number', innerHTML: v});
        verseButtonElement = createVerseButton(v);
        wordContainerElement = createDiv({className:'word-container'});
        translationElement = createDiv({className:'verse-translated', innerHTML: verseData.translations[0].text});
        translationElement.appendChild(translationNameElement.cloneNode(true));
        translationElement.querySelectorAll('sup').forEach(element => {
            element.setAttribute('verse',v);
            element.addEventListener('click', clickFootnote);
        });;
        for (let j = 0; j < verseData.words.length - 1; j++) {
            word = verseData.words[j];
            wordElement = createWordElement(v,j,word);
            wordContainerElement.appendChild(wordElement);
        }
        headerElement.appendChild(numberElement);
        headerElement.appendChild(verseButtonElement);
        verseElement.appendChild(headerElement);
        verseElement.appendChild(wordContainerElement);
        verseElement.appendChild(translationElement);
        appendToVerseContainer(verseElement, v, isSingle);
    });
}

function createWordElement(v,w,word) {
    let wordElement = createDiv({className:'word'});
    let transliteratedWord = createDiv({className:'transliterated-word', id: `${currentChapter}:${v}:${w+1}`, innerHTML: word.transliteration.text.replace(/ʿ/g, 'Ꜥ')});
    transliteratedWord.addEventListener('click',clickWord)
    let translatedWord = createDiv({className:'translated-word', innerHTML: word.translation.text});
    wordElement.appendChild(transliteratedWord);
    wordElement.appendChild(translatedWord);
    return wordElement;
}


function createVerseButton(v) {
    let titles = ['quran.com', 'beta.quran.com'];
    let elements = [];
    for (let i = 0; i < titles.length; i++) {
        elements.push(createDiv({tagName: 'button', className: 'dropdown-item block-button', innerHTML: titles[i]}));
    }
    elements[0].addEventListener('click', clickQuranWebsite);
    elements[1].addEventListener('click', clickBetaQuranWebsite);
    let button = createDiv({tagName: 'button', className: ' icon-button fa fa-ellipsis-v'});
    let res = createDropdownButton(button);
    res.appendChild(createDropdownContent(elements));
    res.setAttribute('verse',v);
    return res;
}


function appendToVerseContainer(verseElement, v, isSingle) {
    var dividerElement, verseElement;
    if (isSingle) {
        singleVerseElement.appendChild(verseElement);
    } else {
        dividerElement = createDiv({className:'divider'});
        verseElement.setAttribute('verse', v);
        verseElement.style.order = 2*(v-1);
        dividerElement.style.order = 2*v-1;
        verseContainerElement.appendChild(verseElement);
        verseContainerElement.appendChild(dividerElement);
    }
}


function clickQuranWebsite(e) {
    console.log(e.currentTarget.parentNode.parentNode)
    openQuranWebsite(false,currentChapter, e.currentTarget.parentNode.parentNode.getAttribute('verse'));
}

function clickBetaQuranWebsite(e) {
    console.log(e.currentTarget.parentNode.parentNode)
    openQuranWebsite(true,currentChapter, e.currentTarget.parentNode.parentNode.getAttribute('verse'));
}

function clickFootnote(e) {
    // https://quran.com/foot_note/129137?resource_content_id=20
    openQuranWebsite(false,currentChapter, e.currentTarget.getAttribute('verse'));
}

function openQuranWebsite(isBeta, chapter,verse) {
    let url = `https://${isBeta ? 'beta.' : ''}quran.com/${chapter}/${verse}`;
    window.open(url);
}

function openBetaQuranWebsite(chapter,verse) {
    let url = `https://beta.quran.com/${chapter}/${verse}`;
    window.open(url);
}

function clickWord(e) {
    let url = `https://corpus.quran.com/wordmorphology.jsp?location=(${e.currentTarget.id})`;
    window.open(url);
}
