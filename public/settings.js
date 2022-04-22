



function createSettingsButton() {
    let button = createDiv({tagName: 'button', id: 'settings-button', className: 'icon-button fa fa-gear'});
    button.addEventListener('click', openNav);
    return button;
}

function createTranslationSettings() {
    let translationContainer = document.getElementById('translation-container');
    let selectAllBox = createCheckbox('all-translations', 'Select All');
    let sarantarisTranslation = createCheckbox('AHS','A. Hussain Sarantaris');
    translationContainer.appendChild(selectAllBox);
    // translationContainer.appendChild(sarantarisTranslation);
    for (let i = 0; i < translationOrder.length; i++) {
        let checkboxElement = createCheckbox(i,translationOrder[i].name);
        translationContainer.appendChild(checkboxElement);
        if (translationOrder[i].name === 'Saheeh International') {
            currentTranslations.push(translationOrder[i]);
        }
    }
}

function createCheckbox(value, label) {
    let checkbox = createDiv({tagName: 'input', className: 'checkbox'});
    let labelElement = createDiv({tagName: 'label', innerHTML: label});
    checkbox.type = 'checkbox';
    checkbox.name = 'translations';
    checkbox.value = value;
    labelElement.for = value;
    return createDiv({id: value, className: 'checkbox-container', children: [checkbox, labelElement]});
}

function openNav() {
    settingsOverlayElement.setAttribute('open',true);
}

function closeNav() {
    settingsOverlayElement.removeAttribute('open');
}

function clickTheme(element) {
    let lightTheme = document.getElementById('light-theme');
    let darkTheme = document.getElementById('dark-theme');
    if (element === lightTheme.parentNode && !lightTheme.checked) {
        setCurrentTheme(1);
    } else if (!darkTheme.checked) {
        setCurrentTheme(0);
    }
}

function clickNameOfGod(element) {
    let nameGod = document.getElementById('name-God');
    let nameAllah = document.getElementById('name-Allah');
    if (element === nameGod.parentNode && !nameGod.checked) {
        setNameOfGod(0);
    } else if (!nameAllah.checked) {
        setNameOfGod(1);
    } else {
        return;
    }
    setVerseView(verseView);
}

function changeFontSize(increase) {
    if (increase) {
        setFontSize(fontSizeCounter+1);
    } else {
        setFontSize(fontSizeCounter-1);
    }
}