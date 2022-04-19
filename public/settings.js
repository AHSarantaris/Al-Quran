



function createSettingsButton() {
    let button = createDiv({tagName: 'button', id: 'settings-button', className: 'icon-button fa fa-gear'});
    button.addEventListener('click', openNav);
    return button;
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