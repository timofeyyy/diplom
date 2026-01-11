import express from 'express'
import https from 'https'
import http from 'http'
import fs from 'fs'
import { ExpressPeerServer } from 'peer';
import { getConfig } from './src/app-config';

const app = express()
// const config = getConfig()
app.get("/test_peerjs", (req, res) => {
    res.send("peerjs")
})
// const server = https.createServer({
//     key: fs.readFileSync(config.key_virt, 'utf-8'),
//     cert: fs.readFileSync(config.cert_virt, 'utf-8'),
// }, app);
const server = http.createServer({}, app);
app.use("/peerjs1", ExpressPeerServer(server, {}));
server.listen(8000, () => console.log("peerjs"))



