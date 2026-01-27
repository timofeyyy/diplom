import express from 'express'
import http from 'http'
import https from 'https'
import fs from 'fs'
import { Server } from 'socket.io'
import { ExpressPeerServer } from 'peer';
import { getConfig } from './src/app-config'

const app = express()

const config = getConfig()
const server = https.createServer({
    key: fs.readFileSync(config.key_local, 'utf-8'),
    cert: fs.readFileSync(config.cert_local, 'utf-8'),
}, app);
// const server = http.createServer({}, app);
app.use(express.static("src"))
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get("/test", (req, res) => {
    res.send("hello")
})



app.get("/:roomId", (req, res) => {
    if (!req.query.userName) {
        res.sendStatus(404)
        return
    }
    res.render("room", { roomId: req.params.roomId, userName: req.query.userName })
})
 
// keys - https://slproweb.com/products/Win32OpenSSL.html - old
// keys - mkcert localhost 127.0.0.1 - used
app.use("/peerjs", ExpressPeerServer(server, {}));
server.listen(8000, () => console.log("express"))



