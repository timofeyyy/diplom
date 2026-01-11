import express from 'express'
import https from 'https'
import http from 'http'
import fs from 'fs'
import { Server } from 'socket.io'
import { getConfig } from './src/app-config'

const app = express()
const config = getConfig()
app.get("/test_iosocket", (req, res) => {
    res.send("iosocket")
})
// console.log(config.key_local, config.cert_local)
// const server = https.createServer({
//     key: fs.readFileSync(config.key_local, 'utf-8'),
//     cert: fs.readFileSync(config.cert_local, 'utf-8'),
// }, app);
const server = http.createServer({}, app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});



const userData: any = {}

io.on("connection", (socket) => {
    console.log("connected")
    socket.on("join-room", (roomId, userId, userName) => {
        if (!userData[roomId]) {
            userData[roomId] = {}
        }
        userData[roomId][userId] = userName;
        (socket as any).roomId = roomId;
        (socket as any).userName = userName;
        (socket as any).userId = userId;
        console.log(`${userName} joined room ${roomId} ${userId}`);
        console.log(userData)

        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId, userName);
    });

    socket.on('get-user-data', (roomId, userId, callback) => {
        callback(userData[roomId][userId]);
        // socket.send(userData[roomId][userId])
    });

    // socket.on("message", (roomId, message, userName) => {
    //     io.to(roomId).emit("createMessage", message, userName);
    // });
    socket.on('user-disconnected', (roomId, userId) => {
        console.log(`user-disconnected ${userId}`)
        socket.to(roomId).emit('user-disconnected', userId);
    });

    socket.on('disconnect', () => {

        const roomId = (socket as any).roomId
        const userId = (socket as any).userId
        if(userData[roomId] && userData[roomId][userId])
            delete userData[roomId][userId];
        console.log('user-disconnected', userId)
        if (roomId && userId) {
            io.to(roomId).emit('user-disconnected', userId);
        }
        console.log(userData)
    });
}); 
server.listen(9000, () => console.log("iosocket"))
