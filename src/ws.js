const members = new Map();

export function handle(socket) {
    const state = {
        self: undefined
    }
    socket.on("message", (message) => {
        message = JSON.parse(message);
        console.log(message);
        switch (message.type) {
            case "login": {
                if (!message.username)
                    return nack(socket);
                if (members.has(message.username))
                    members.delete(message.username)
                state.self = new ChatPartner(message.username, socket);
                return ack(socket);
            }
            case "offer": {
                let partner = members.get(message.to);
                if (!partner) {
                    return nack(socket);
                }
                partner.makeOffer(state.self);
                return ack(socket);
            }
            case "accept": {
                let partner = members.get(message.to);
                if (!partner) {
                    return nack(socket);
                }
                partner.start(state.self);
                state.self.start(partner);
                return ack(socket);
            }
            case "message": {
                state.self.message(message.message);
                return ack(socket);
            }
        }
    });
    socket.on("close", () => {
        if (!state.self) {
            return;
        }
        members.delete(state.self.username)
        if (state.self.partner) {
            state.self.partner.end();
        }
        state.self.end();
    })
}

function ack(socket) {
    socket.send(JSON.stringify({ ack: true }));
}

function nack(socket) {
    socket.send(JSON.stringify({ ack: false }))
}

class ChatPartner {
    constructor(username, socket) {
        this.username = username;
        this.socket = socket;
        members.set(this.username, this);
    }

    makeOffer(partner) {
        this.socket.send(JSON.stringify({
            type: "offer",
            from: partner.username
        }));
    }

    start(partner) {
        this.partner = partner;
        this.socket.send(JSON.stringify({
            type: "start",
            from: partner.username
        }))
    }

    message(message) {
        if (this.partner) {
            this.partner.socket.send(JSON.stringify({
                type: "message",
                message,
            }));
        }
    }

    end() {
        if (!this.socket.closed) {
            this.socket.send(JSON.stringify({
                type: "end",
            }));
        }
        this.partner = undefined;
    }
}
