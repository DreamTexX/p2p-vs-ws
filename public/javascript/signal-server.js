window.signalServer = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/p2p`);
window.signalServer.onmessage = async (message) => {
    const data = JSON.parse(message.data);
    if (data["from"] === window.username) return;

    switch (data.type) {
        case "offer":
            await onOffer(data.data);
            break;
        case "answer":
            await onAnswer(data.data);
            break;
        case "candidate":
            await onCandidate(data.data);
            break;
    }
}

function sendSignalMessage(type, data) {
    if (!window.signalServer)
        return;

    const message = {
        "type": type,
        "data": {
            "to": remoteUsername,
            "from": window.username,
            "rtc-data": data
        }
    }
    window.signalServer.send(JSON.stringify(message));
}
