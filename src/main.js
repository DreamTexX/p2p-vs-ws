import express from "express";
import enableWs from "express-ws";
import {handle as handleWS} from "./ws.js";
import {handle as handleP2P} from "./p2p.js";

const app = express();
const wsInstance = enableWs(app)

app.ws("/p2p", (socket, req) => {
    handleP2P(socket, wsInstance);
})
app.ws("/ws", (socket) => {
    handleWS(socket);
});
app.use(express.static("public"))
app.listen(process.env.PORT || 8083, "0.0.0.0", () => {
    console.log("Server is running");
})
