const usernameChosenEvent = new Event('username', {
    bubbles: true,
    cancelable: false,
    composed: true,
})

function changeUsername(force) {
    window.username = localStorage.getItem("username") || "";
    while (window.username.length === 0 || force) {
        force = false;
        window.username = (window.prompt("Your Username:") || "").trim();
        localStorage.setItem("username", window.username);
    }
    window.dispatchEvent(usernameChosenEvent);
}

// Ask for username on first visit or load it from local storage
window.addEventListener('load', () => changeUsername(false));