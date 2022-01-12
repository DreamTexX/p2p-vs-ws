import express from "express";
import enableWs from "express-ws";
import {handle} from "./ws.js";

const app = express();
const wsInstance = enableWs(app)
const chatPartners = new Map();

app.ws("/p2p", (socket, req) => {
    socket.on('message', message => {
        for (let client of wsInstance.getWss().clients) {
            client.send(message)
        }
    })
})
app.ws("/ws", (socket) => {
    handle(socket);
});
app.use(express.static("public"))
app.listen(8083, "0.0.0.0", () => {
    console.log("Server is running");
})
