export function handle(socket, wsInstance) {
    socket.on('message', message => {
        for (let client of wsInstance.getWss().clients) {
            client.send(message)
        }
    })
}