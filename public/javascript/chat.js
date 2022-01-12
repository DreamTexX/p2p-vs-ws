function notifyToChat(message) {
    const chat = document.getElementById('chat-frame')
    const element = document.createElement("p")
    element.classList.add("notify")
    element.innerText = message
    chat.append(element);
}

function printToChat(message, self) {
    const chat = document.getElementById('chat-frame')
    const element = document.createElement("p")
    element.innerHTML = `<span class="username">${self ? username : remoteUsername}</span>: <span class="message">${message}</span>`
    chat.append(element);
}