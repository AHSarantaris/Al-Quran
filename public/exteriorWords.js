
function createExteriorView() {
    chapterContentElement.innerHTML = '';
    exteriorWordsContainerElement.innerHTML = '';
    chapterContentElement.appendChild(exteriorWordsContainerElement);
    for (let v = 1; v < chapters[currentChapter-1].verses_count+1; v++) {
        createExteriorWords(v);
    }
}

function createExteriorWords(v) {
    settings.url = `${baseURL}verses/by_key/${currentChapter}:${v}${languageQuery}&words=1&word_fields=location,text_uthmani`;
    $.ajax(settings).done(function (response) {
        let verse = response.verse;
        let n = verse.words.length - 1;
        let numberElement = createDiv({tagName: 'span', className:'verse-number', innerHTML: v});appendToExteriorWordsContainer(numberElement, 2*v-1);
        let firstWordElement = createWordElement(v,0,verse.words[0]);
        firstWordElement.className = 'first-word';appendToExteriorWordsContainer(firstWordElement, 2*v-1);
        if (n > 2) {
            let numberOfWordsElement = createDiv({className: 'number-of-words',innerHTML: `- ${n-2} -`});appendToExteriorWordsContainer(numberOfWordsElement, 2*v-1);
        }
        if (n > 1) {
            let lastWordElement = createWordElement(v,n-1,verse.words[n-1]);
            lastWordElement.className = 'last-word';appendToExteriorWordsContainer(lastWordElement, 2*v-1);
        }
    });
    let dividerElement = createDiv({className:'divider'});
    let verseElement = createDiv({className: 'verse'});
    verseElement.setAttribute('verse', v);
    appendToExteriorWordsContainer(verseElement, 2*v-1);
    appendToExteriorWordsContainer(dividerElement, 2*v);
}


function appendToExteriorWordsContainer(element, rowOrder) {
    element.style.gridRowStart = rowOrder;
    exteriorWordsContainerElement.appendChild(element);
}