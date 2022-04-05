



function createSettingsButton() {
    let button = createDiv({tagName: 'button', className: 'icon-button fa fa-gear'});
    button.addEventListener('click', openNav);
    return button;
}


function openNav() {
    document.getElementById("settings-drawer").setAttribute('open',true);
}

function closeNav() {
    document.getElementById("settings-drawer").removeAttribute('open');
}

function createThemeSelector() {
    
}