window.resolvers = new Map();

function init() {
    window.wsServer = new WebSocket(`${window.location.protocol.startsWith("https") ? "wss" : "ws"}://${window.location.hostname}:${window.location.port}/ws`);
    window.wsServer.onmessage = async (message) => {
        const data = JSON.parse(message.data);
        if (data["from"] === window.username) return;

        if (data["ack"] !== undefined) {
            window.resolvers.forEach((value) => {
                value(data["ack"]);
            });
        }

        switch (data.type) {
            case "offer": {
                if (!window.confirm(`${data.from} wants to establish a connection with you. Accept?`)) {
                    return;
                }
                window.remoteUsername = data.from;
                window.wsServer.send(JSON.stringify({
                    type: "accept",
                    to: window.remoteUsername,
                    from: window.username,
                }))
                break;
            }
            case "start": {
                notifyToChat(`Chat with ${window.remoteUsername} started!`);
                break;
            }
            case "end": {
                notifyToChat(`Chat with ${window.remoteUsername} ended!`);
                this.remoteUsername = undefined;
                break;
            }
            case "message": {
                printToChat(data.message, false);
                break;
            }
        }
    }
}


async function waitForAckOrNack() {
    return new Promise((resolve) => {
        const id = Math.random().toString(16).substr(2);
        window.resolvers.set(id, (value) => {
            resolve(value);
            window.resolvers.delete(id);
        })
    });
}

async function connectWs() {
    window.remoteUsername = document.getElementById('remote-username').value.trim();
    if (window.remoteUsername.length === 0) {
        window.alert("Remote username cannot be empty");
        return;
    }
    window.wsServer.send(JSON.stringify({
        type: "offer",
        to: remoteUsername,
        from: window.username,
    }));
    if (!(await waitForAckOrNack())) {
        notifyToChat(`${remoteUsername} is not online!`);
    }
}

window.addEventListener("username", () => {
    init();
    window.wsServer.onopen = async () => {
        window.wsServer.send(JSON.stringify({
            type: "login",
            username: window.username,
        }));
        if (await waitForAckOrNack()) {
            notifyToChat("Successfully logged in as " + window.username);
        } else {
            notifyToChat(`Login as ${window.username} failed`);
        }
    }
})

function sendChat() {
    if (!window.wsServer) {
        return;
    }

    const message = document.getElementById('chat-input').value.trim();
    if (message.length === 0) {
        return;
    }
    window.wsServer.send(JSON.stringify({ type: "message", message }));
    printToChat(message, true);
}