
function showCurrentVerse() {
    previousVerseElement.disabled = false;
    nextVerseElement.disabled = false;
    if (currentVerse === 0 || (currentVerse === 1 && !chapters[currentChapter-1].bismillah_pre)) {
        previousVerseElement.disabled = true;
    } else if (currentVerse === chapters[currentChapter-1].verses_count) {
        nextVerseElement.disabled = true;
    }
}

function createAllVerses() {
    createChapterNavigator();
    if (chapters[currentChapter-1].bismillah_pre) {
        appendToVerseContainer(bismillahElement, 0);
    }
    for (let i = 0; i < chapters[currentChapter-1].verses_count; i++) {
        createVerse(i+1);
    }
    chapterContentElement.appendChild(chapterNavigatorElement);
}

function createBismillah() {
    let arabicWords = ["بِسْمِ","ٱللَّهِ","ٱلرَّحْمَـٰنِ","ٱلرَّحِيمِ"];
    let transliteratedWords = ["bis'mi","l-lahi","l-raḥmāni","l-raḥīmi"];
    let translatedWords = ["In (the) name", `(of) ${nameOfGod ? 'God' : 'Allah'},`,"the Merciful,","the Compassionate."];
    let arabicWordContainerElement = createDiv({className:'arabic-word-container'});
    let wordContainerElement = createDiv({className:'word-container'});
    var arabicElement, transliteratedElement, translatedElement, arabicWordElement, wordElement, wordId;
    for (let j = 0; j < 4; j++) {
        wordId = `${1}:${1}:${j+1}`;
        arabicWordElement = createDiv({className:'word'});
        arabicElement = createDiv({tagName: 'span', className:'arabic-word', innerHTML:arabicWords[j]});
        wordElement = createDiv({className:'word'});
        transliteratedElement = createDiv({tagName: 'a', className:'transliterated-word', id: wordId, innerHTML: transliteratedWords[j]});
        transliteratedElement.href = `https://corpus.quran.com/wordmorphology.jsp?location=(${wordId})`;
        transliteratedElement.target = '_blank';
        translatedElement = createDiv({className:'translated-word', innerHTML: translatedWords[j]});
        arabicWordElement.appendChild(arabicElement);
        wordElement.appendChild(transliteratedElement);
        wordElement.appendChild(translatedElement);
        arabicWordContainerElement.appendChild(arabicWordElement);
        wordContainerElement.appendChild(wordElement);
    }
    if (wordSettings.arabic) {
        bismillahElement.appendChild(arabicWordContainerElement);
    }
    bismillahElement.appendChild(wordContainerElement);
}

function createVerse(v) {
    if (v === 0) {
        appendToVerseContainer(bismillahElement, 0);
        return;
    }
    createVerseElement(v, currentTranslations);
    getTranslationData(v, currentTranslations, true);
}

function getTranslationData(v, translationInfo, getWords, scroll) {
    let translationsStr = translationInfo[0].id;
    for (let i = 1; i < translationInfo.length; i++) {
        if (translationInfo[i].id > 0) {
            translationsStr += ',' + translationInfo[i].id;
        }
    }
    settings.url = `${baseURL}verses/by_key/${currentChapter}:${v}${languageQuery}&translations=${translationsStr}&word_fields=location,text_uthmani&words=${isTestMode}`;
    $.ajax(settings).done(function (response) {
        let verseData = response.verse;
        let wordData = isTestMode ? verseData.words : wordTranslations[v];
        createVerseTranslations(v, translationInfo, verseData.translations);
        if (getWords) {
            createWordContainer(v, wordData);
        }
        if (scroll) {
            scrollToVerse(v, 'smooth', 'end');
        }
    });
}


function createVerseElement(v) {
    var arabicWordContainerElement, wordContainerElement, numberElement, verseElement, headerElement, verseButtonElement, translationContainerElement, translationWrapperElement;
    verseElement = createDiv({className: 'verse'});
    headerElement = createDiv({className: 'verse-header'});
    numberElement = createDiv({tagName: 'span', className:'verse-number', innerHTML: v});
    verseButtonElement = createVerseButton(v); arabicWordContainerElement = createDiv({className:'arabic-word-container'});
    wordContainerElement = createDiv({className:'word-container'});
    translationWrapperElement = createDiv({className: 'translation-container-wrapper'});
    translationContainerElement = createDiv({className: 'translation-container'});
    translationWrapperElement.appendChild(translationContainerElement);
    translationWrapperElement.appendChild(createAllTranslationsButton(v));
    headerElement.appendChild(numberElement);
    headerElement.appendChild(verseButtonElement);
    verseElement.appendChild(headerElement);
    if (wordSettings.arabic) {
        verseElement.appendChild(arabicWordContainerElement);
    }
    if (wordSettings.transliteration || wordSettings.translation) {
        verseElement.appendChild(wordContainerElement);
    }
    verseElement.appendChild(translationWrapperElement);
    appendToVerseContainer(verseElement, v);
}

function createAllTranslationsButton(v) {
    let allTranslationsButtonContainer = createDiv({className: 'all-translations-button-container'});
    let allTranslationsButton = createDiv({tagName: 'button', className: 'all-translations-button icon-button fas fa-chevron-down'});
    allTranslationsButton.setAttribute('verse', v);
    allTranslationsButton.addEventListener('click', clickAllTranslationsButton);
    allTranslationsButtonContainer.appendChild(allTranslationsButton);
    return allTranslationsButtonContainer;
}

function createWordContainer(v,words) {
    var word, wordElement, arabicWordElement;
    let wordContainerElement = document.querySelector(`.verse[verse="${v}"] .word-container`);
    let arabicWordContainerElement = document.querySelector(`.verse[verse="${v}"] .arabic-word-container`);
    let wordCount = words.length;
    if (isTestMode) {
        wordCount--;
    }
    for (let j = 0; j < wordCount; j++) {
        word = words[j];
        if (wordSettings.arabic) {
            arabicWordElement = createArabicWordElement(v,j,word);
            arabicWordContainerElement.appendChild(arabicWordElement);
        }
        if (wordSettings.translation || wordSettings.transliteration) {
            wordElement = createWordElement(v,j,word);
            wordContainerElement.appendChild(wordElement);
        }
    }
}

function createVerseTranslations(v, translationInfo, translationData) {
    let res = document.querySelector(`.verse[verse="${v}"] .translation-container`);
    res.innerHTML = '';
    for (let i = 0; i < translationInfo.length; i++) {
        if (translationInfo[i].id > 0) {
            for (let j = 0; j < translationData.length; j++) {
                // console.log(translationData[j].resource_id,translationInfo[i].id)
                if (translationData[j].resource_id === translationInfo[i].id) {
                    res.appendChild(createTranslationElement(v,translationData[j].text, translationInfo[i].name, translationInfo[i].id));
                    break;
                }
            }
        } else if (!isTestMode) {
            // res.appendChild(createTranslationElement(v,verseTranslations[v], 'A. Hussain Sarantaris'));
        }
    }
}


function clickAllTranslationsButton(e) {
    var translationInfo, isSelected;
    let v = e.currentTarget.getAttribute('verse');
    isSelected = e.currentTarget.getAttribute('selected'); 
    e.currentTarget.className = 'all-translations-button icon-button fas fa-chevron-'
    if (isSelected) {
        e.currentTarget.className += 'down';
        translationInfo = currentTranslations;
        e.currentTarget.removeAttribute('selected');
    } else {
        e.currentTarget.className += 'up';
        translationInfo = translationOrder;
        if (isTestMode) {
            for (let i = 0; i < translationInfo.length; i++) {
                if (translationInfo[i].id < 0) {
                    translationInfo.splice(i,1);
                }
            }
        }
        e.currentTarget.setAttribute('selected', 1);
    }
    getTranslationData(v, translationInfo, false, isSelected);

}

function createTranslationElement(v, text, name, id) {
    // TODO: Footnotes should link to the correct translation
    if (name === 'Abdul Haleem') {
        if (!nameOfGod) {
            text = text.replaceAll('God', 'Allah');
        }
    } else if (name === 'Dr. T. B. Irving') {
        text = text.replaceAll("Allah (God)", nameOfGod ? "God" : "Allah");
    } else if (nameOfGod && name !== 'Transliteration') {
        text = text.replaceAll(/All(a|ā|â)h/g, "God");
    }
    let translationElement = createDiv({className:'verse-translated', innerHTML: text});
    let nameElement = createDiv({className: 'translation-name', innerHTML:  '— ' + name});
    translationElement.appendChild(nameElement);
    translationElement.querySelectorAll('sup').forEach(element => {
        element.setAttribute('verse',v);
        element.setAttribute('translation',id);
        element.addEventListener('click', clickFootnote);
    });
    return translationElement;
}

function createWordElement(v, w, word) {
    let wordText = createWordText(word);
    let wordElement = createDiv({className:'word'});
    wordElement.setAttribute('word-location', w+1);
    if (wordSettings.transliteration) {
        let wordId = `${currentChapter}:${v}:${w+1}`;
        let transliteratedWord = createDiv({tagName: 'a', className:'transliterated-word', id: wordId, innerHTML: wordText.transliteration});
        transliteratedWord.href = `https://corpus.quran.com/wordmorphology.jsp?location=(${wordId})`;
        transliteratedWord.target = '_blank';
        transliteratedWord.title = 'See grammar for this word\nin corpus.quran.com';
        wordElement.appendChild(transliteratedWord);
    }
    if (wordSettings.translation) {
        if (nameOfGod) {
            wordText.translation = wordText.translation.replaceAll(/All(a|ā|â)h/g, "God");
        }
        let translatedWord = createDiv({className:'translated-word', innerHTML: wordText.translation});
        wordElement.appendChild(translatedWord);
    }
    return wordElement;
}

function createArabicWordElement(v,w,word) {
    let wordText = createWordText(word);
    let wordElement = createDiv({className:'word'});
    if (wordSettings.arabic) {
        let arabicWord = createDiv({tagName: 'span', className:'arabic-word', innerHTML: wordText.arabic});
        arabicWord.setAttribute('verse-location', v);
        arabicWord.setAttribute('word-location', w+1);
        arabicWord.addEventListener('click', clickArabicWord);
        // arabicWord.target = '_blank';
        // arabicWord.title = 'See grammar for this word\nin corpus.quran.com';
        wordElement.appendChild(arabicWord);
    }
    return wordElement;
}

function createWordText(word) {
    let res = {};
    if (wordSettings.arabic) {
        res.arabic = isTestMode ? word.text_uthmani : word[0];
    }
    if (wordSettings.transliteration) {
        res.transliteration = isTestMode ? word.transliteration.text : word[1];
    }
    if (wordSettings.translation) {
        res.translation = isTestMode ? word.translation.text : word[2];
    }
    return res;   
}


function createVerseButton(v) {
    var element;
    let titles = ['Tafsir - Tazkirul Quran', 'Tafsir - Maududi', 'Tafsir - Ibn Kathir', 'Tafsir - Maarif-Ul-Quran', 'Quran.com'];
    let urls = [
        `https://quran.com/${currentChapter}:${v}/tafsirs/tazkirul-quran-en`,
        `https://www.alim.org/quran/tafsir/maududi/surah/${currentChapter}/0`,
        `https://quran.com/${currentChapter}:${v}/tafsirs/en-tafisr-ibn-kathir`, 
        `https://quran.com/${currentChapter}:${v}/tafsirs/en-tafsir-maarif-ul-quran`,
        `https://quran.com/${currentChapter}/${v}` + (currentTranslations[0] ? '?translations='+currentTranslations[0].id : '')
    ];
    let elements = [];
    for (let i = 0; i < titles.length; i++) {
        element = createDiv({tagName: 'a', className: 'dropdown-item block-button', innerHTML: titles[i]});
        element.href = urls[i];
        element.target = '_blank';
        elements.push(element);
    }
    // elements[0].addEventListener('click', clickMaududi);
    // elements[1].addEventListener('click', clickIbnKathir);
    // elements[2].addEventListener('click', clickMaarifUlQuran);
    // elements[3].addEventListener('click', clickQuranWebsite);
    let button = createDiv({tagName: 'button', className: 'verse-links-button icon-button fas fa-ellipsis-v'});
    let res = createDropdownButton(button);
    let dropdownContent = createDropdownContent(elements);
    res.appendChild(dropdownContent);
    res.setAttribute('verse',v);
    return res;
}


function appendToVerseContainer(verseElement, v) {
    var verseElement;
    verseElement.setAttribute('verse', v);
    verseElement.style.order = v-1;
    verseContainerElement.appendChild(verseElement);
}

function clickIbnKathir(e) {
    let verse = e.currentTarget.parentNode.parentNode.getAttribute('verse');
    let url = `https://quran.com/${currentChapter}:${verse}/tafsirs/en-tafisr-ibn-kathir`;
    window.open(url);
}

function clickMaarifUlQuran(e) {
    let verse = e.currentTarget.parentNode.parentNode.getAttribute('verse');
    let url = `https://quran.com/${currentChapter}:${verse}/tafsirs/en-tafsir-maarif-ul-quran`;
    window.open(url);
}

function clickQuranWebsite(e) {
    openQuranWebsite(currentChapter, e.currentTarget.parentNode.parentNode.getAttribute('verse'));
}

function clickMaududi(e) {
    let url = `https://www.alim.org/quran/tafsir/maududi/surah/${currentChapter}/0`;
    window.open(url);
}

function clickFootnote(e) {
    // https://quran.com/foot_note/129137?resource_content_id=20
    // https://quran.com/foot_note/129137?resource_content_id=20
    // let url = `https://quran.com/foot_note/${e.currentTarget.getAttribute('foot_note')}?resource_content_id=${e.currentTarget.getAttribute('translation')}`;
    // window.open(url);
    openQuranWebsite(currentChapter, e.currentTarget.getAttribute('verse'), e.currentTarget.getAttribute('translation'));
}

function openQuranWebsite(chapter,verse,translation) {
    let url = `https://quran.com/${chapter}/${verse}`;
    if (translation) {
        url += '?translations='+translation;
    }
    window.open(url);
}

function openBetaQuranWebsite(chapter,verse) {
    let url = `https://beta.quran.com/${chapter}/${verse}`;
    window.open(url);
}

function clickArabicWord(e) {
    let target = e.currentTarget;
    let wordLoc = parseInt(target.getAttribute('word-location'));
    let pairedElement = target.parentElement.parentElement.nextElementSibling.children[wordLoc-1];
    let previousTargets = document.querySelectorAll('[selected-word]');
    target.setAttribute('selected-word', true);
    pairedElement.setAttribute('selected-word', true);
    if (previousTargets.length > 0) {
        previousTargets[0].removeAttribute('selected-word');
        previousTargets[1].removeAttribute('selected-word');
    }

}

