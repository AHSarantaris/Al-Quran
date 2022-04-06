



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
    if (element === lightTheme.parentNode) {
        if (lightTheme.checked) {
            return;
        }
        lightTheme.checked = true;
        darkTheme.checked = false;
        $('link[href="dark.css"]').remove();
        $('head').append('<link rel="stylesheet" href="light.css" type="text/css" />');
    } else {
        if (darkTheme.checked) {
            return;
        }
        darkTheme.checked = true;
        lightTheme.checked = false;
        $('link[href="light.css"]').remove();
        $('head').append('<link rel="stylesheet" href="dark.css" type="text/css" />');
    }
}