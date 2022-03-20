
function showHomePage() {
    chapterPageElement.style.display = 'none';
    homePageElement.style.display = 'flex';
    previousVerseElement.style.display = 'none';
    nextVerseElement.style.display = 'none';
    if (!cardContainerElement) {
        createCardContainer();
    } else {
        homeContentElement.appendChild(cardContainerElement);
    }
}

function createCardContainer() {
    cardContainerElement = createDiv({id: 'card-container'});
    createCardHeader();
    homeContentElement.appendChild(cardContainerElement);
    for (let i = 0; i < 114; i++) {
        let rowElements = createChapterCard(i);
        for (let j = 0; j < rowElements.length; j++) {
            cardContainerElement.appendChild(rowElements[j]);
        }
    }
}

function createCardHeader() {
    let headerElements = [];
    headerElements.push(createDiv({className: 'row'}));
    headerElements.push(createDiv({tagName: 'span', className: 'number',innerHTML: 'No.'}));
    headerElements.push(createDiv({tagName: 'span', className: 'chapter-name',innerHTML: 'Name'}));
    headerElements.push(createDiv({tagName: 'span', className: 'revelation',innerHTML: 'Order'}));
    headerElements.push(createDiv({tagName: 'span', className: 'verse-count',innerHTML: 'Verses'}));
    for (let i = 0; i < headerElements.length; i++) {
        if (i > 0) {
            headerElements[i].classList.add('header', 'text-button');
        }
        headerElements[i].style.gridRowStart = 1;
        headerElements[i].style.gridColumnStart = i;
        cardContainerElement.appendChild(headerElements[i]);
    }
    headerElements[0].style.gridColumnStart = 1;
    headerElements[0].style.gridColumnEnd = headerElements.length;
}

function createChapterCard(i) {
    let rowElements = [];
    let name = createDoubleLineDiv(chapters[i].name_simple, chapters[i].translated_name.name, {className: 'chapter-name'});
    let revelation = createDoubleLineDiv(chapters[i].revelation_order, chapters[i].revelation_place, {className: 'revelation'});
    let versesCount = createDoubleLineDiv(chapters[i].verses_count, 'Verses', {className:'verse-count'});
    rowElements.push(createDiv({tagName: 'button', className:'card block-button'}));
    rowElements.push(createDiv({className:'number', innerHTML: chapters[i].id}));
    rowElements.push(name);
    rowElements.push(revelation);
    rowElements.push(versesCount);
    rowElements[0].setAttribute('chapter', i + 1 + "");
    rowElements[0].addEventListener('click', clickCard);
    for (let j = 0; j < rowElements.length; j++) {
        rowElements[j].style.gridRowStart = i+2;
    }
    return rowElements;
}

function clickCard(e) {
    let c = parseInt(e.currentTarget.getAttribute('chapter'));
    setCurrentChapter(c);
}
