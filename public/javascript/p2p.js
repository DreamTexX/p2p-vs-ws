window.addEventListener("load", () => {
    window.localPeer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun3.l.google.com:19302"
            }
        ]
    })
    window.localPeer.onicecandidate = (event) => {
        if (event.candidate != null) {
            sendSignalMessage("candidate", event.candidate)
        }
    }
    window.localPeer.ondatachannel = (event) => {
        window.channel = event.channel;
        setupChannel();
    }
})

window.p2pConnected = false;
let remoteUsername;

async function connectP2p() {
    if (!window.localPeer)
        return;
    if (window.p2pConnected)
        closeConnection();

    remoteUsername = document.getElementById('remote-username').value.trim();
    if (remoteUsername.length === 0) {
        window.alert("Remote username cannot be empty");
        return;
    }

    window.localPeer.restartIce();
    window.channel = window.localPeer.createDataChannel("chat")
    setupChannel();

    const offer = await window.localPeer.createOffer()
    await window.localPeer.setLocalDescription(offer);
    sendSignalMessage("offer", offer);

    notifyToChat(`Connecting to ${remoteUsername}...`)
}

function sendChat() {
    if (!window.channel) {
        return;
    }

    const message = document.getElementById('chat-input').value.trim();
    if (message.length === 0) {
        return;
    }
    window.channel.send(JSON.stringify({ message }));
    printToChat(message, true);
}

async function onOffer(data) {
    if (data["to"] !== window.username)
        return;

    if (!window.confirm(`${data["from"]} wants to establish a connection with you. Accept?`)) {
        return;
    }

    if (window.p2pConnected)
        closeConnection();

    remoteUsername = data["from"];
    await window.localPeer.setRemoteDescription(data["rtc-data"]);
    const answer = await window.localPeer.createAnswer();
    await window.localPeer.setLocalDescription(answer);

    sendSignalMessage("answer", answer)
}

async function onAnswer(data) {
    if (data["to"] !== window.username || data["from"] !== remoteUsername)
        return;
    notifyToChat(`${remoteUsername} accepted your connection!`);

    await window.localPeer.setRemoteDescription(data["rtc-data"]);
}

async function onCandidate(data) {
    try {
        await window.localPeer.addIceCandidate(data["rtc-data"]);
    } catch (e) {
        console.error("Cannot add ice candidate:", e);
    }
}

function closeConnection() {
    if (window.channel)
        window.channel.close();
    window.channel = undefined;
    notifyToChat(`${remoteUsername} has rejected the connection, is not online, has left the chat or timed out.`);
    remoteUsername = undefined;
}

function setupChannel() {
    window.channel.onopen = () => {
        notifyToChat(`Chat with ${remoteUsername} started`);
    };
    window.channel.onerror = (event) => {
        console.error(event.error);
        notifyToChat(`Channel errored: ${event.error.message}`);
    };
    window.channel.onclose = closeConnection;
    window.channel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        printToChat(data.message);
    }
}