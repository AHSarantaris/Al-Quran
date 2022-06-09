
function showHomePage() {
    chapterPageElement.style.display = 'none';
    homePageElement.style.display = 'flex';
    previousVerseElement.style.display = 'none';
    nextVerseElement.style.display = 'none';
    homeTopbarElement.appendChild(settingsButtonElement);
    if (!cardContainerElement) {
        createCardContainer();
    } else {
        homeContentElement.appendChild(cardContainerElement);
    }
}

function createCardContainer() {
    cardContainerElement = createDiv({id: 'card-container'});
    homeContentElement.appendChild(cardContainerElement);
    createCardsOrdered(1, false);
}


function createCardHeader(order, isReverse) {
    let headerElements = [];
    headerElements.push(createDiv({className: 'row'}));
    headerElements.push(createDiv({tagName: 'span', className: 'number',innerHTML: 'No.'}));
    headerElements.push(createDiv({tagName: 'span', className: 'chapter-name',innerHTML: 'Name'}));
    headerElements.push(createDiv({tagName: 'span', className: 'revelation', innerHTML: 'Order'}));
    headerElements.push(createDiv({tagName: 'span', className: 'verse-count',innerHTML: 'Verses'}));
    headerElements.push(createDiv({tagName: 'span', className: 'recitation-count',innerHTML: 'Audio'}));
    for (let i = 0; i < headerElements.length; i++) {
        if (i > 0) {
            headerElements[i].classList.add('header', 'text-button');
        }
        if (i === order) {
            headerElements[i].setAttribute('selected',true);
            headerElements[i].setAttribute('isReverse', isReverse);
        }
        headerElements[i].style.gridRowStart = 1;
        headerElements[i].addEventListener('click', clickHeaderElement);
        cardContainerElement.appendChild(headerElements[i]);
    }
    headerElements[0].style.gridColumnStart = 1;
    headerElements[0].style.gridColumnEnd = headerElements.length;
}

function clickHeaderElement(e) {
    var isReverse;
    let order = parseInt(e.currentTarget.style.gridColumnStart);
    let previousElement = document.querySelector('.header[selected]');
    if (previousElement === e.currentTarget) {
        isReverse = 'true' === previousElement.getAttribute('isReverse');
        isReverse = !isReverse;
    } else {
        isReverse = false;
        previousElement.setAttribute('isReverse', isReverse);
    }
    e.currentTarget.setAttribute('isReverse', isReverse);
    createCardsOrdered(order, isReverse);
}

function createCardsOrdered(order, isReverse) {
    cardContainerElement.innerHTML = '';
    createCardHeader(order, isReverse);
    var rowElements;
    for (let i = 0; i < 114; i++) {
        rowElements = createChapterCard(i, order, isReverse);
        for (let j = 0; j < rowElements.length; j++) {
            cardContainerElement.appendChild(rowElements[j]);
        }
    }
}

function createChapterCard(i, order, isReverse) {
    let recitationInfo = chapters[i].recitations;
    var audioText, audioCount;
    if (!recitationInfo) {
        audioCount = 0;
    } else {
        audioCount = recitationInfo.length;
        audioText = 'Recital';
        if (audioCount > 1) {
            audioText += 's';
        }
    }
    let rowElements = [];
    let card = createDiv({tagName: 'button', className:'card block-button'});
    let number = createDiv({className:'number', innerHTML: chapters[i].id});
    let name = createDoubleLineDiv(chapters[i].name_simple, chapters[i].translated_name.name, {className: 'chapter-name'});
    let revelation = createDoubleLineDiv(chapters[i].revelation_order, chapters[i].revelation_place, {className: 'revelation'});
    let versesCount = createDoubleLineDiv(chapters[i].verses_count, 'Verses', {className:'verse-count'});
    let recitationCount = createDoubleLineDiv(audioCount, audioText, {className:'recitation-count'});
    rowElements.push(card);
    rowElements.push(number);
    rowElements.push(name);
    rowElements.push(recitationCount);
    rowElements.push(revelation);
    rowElements.push(versesCount);
    card.setAttribute('chapter', i + 1 + "");
    card.addEventListener('click', clickCard);
    var r;
    for (let j = 0; j < rowElements.length; j++) {
        if (order === 1) {
            r = i;
        } else if (order === 3) {
            r = chapters[i].revelation_order;
        } else {
        }
        if (isReverse) {
            r = 114 - r;
        }
        rowElements[j].style.gridRowStart = r+2;
    }
    return rowElements;
}

function clickCard(e) {
    let c = parseInt(e.currentTarget.getAttribute('chapter'));
    setCurrentChapter(c);
}

function clickTopbarTitle() {
    deleteAllCookies();
    window.location.reload(true);
}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}
