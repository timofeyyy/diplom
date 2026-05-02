"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const peer_1 = require("peer");
const app_config_1 = require("./src/app-config");
const app = (0, express_1.default)();
const config = (0, app_config_1.getConfig)();
const server = https_1.default.createServer({
    key: fs_1.default.readFileSync(config.key_local, 'utf-8'),
    cert: fs_1.default.readFileSync(config.cert_local, 'utf-8'),
}, app);
// const server = http.createServer({}, app);
app.use(express_1.default.static("src"));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.get("/test", (req, res) => {
    res.send("hello");
});
app.get("/:roomId", (req, res) => {
    if (!req.query.userName) {
        res.sendStatus(404);
        return;
    }
    res.render("room", { roomId: req.params.roomId, userName: req.query.userName });
});
// keys - https://slproweb.com/products/Win32OpenSSL.html - old
// keys - mkcert localhost 127.0.0.1 - used
app.use("/peerjs", (0, peer_1.ExpressPeerServer)(server, {}));
server.listen(8000, () => // console.log("express"));
