"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const peer_1 = require("peer");
const app = (0, express_1.default)();
// const config = getConfig()
app.get("/test_peerjs", (req, res) => {
    res.send("peerjs");
});
// const server = https.createServer({
//     key: fs.readFileSync(config.key_virt, 'utf-8'),
//     cert: fs.readFileSync(config.cert_virt, 'utf-8'),
// }, app);
const server = http_1.default.createServer({}, app);
app.use("/peerjs1", (0, peer_1.ExpressPeerServer)(server, {}));
server.listen(8000, () => // console.log("peerjs"));
