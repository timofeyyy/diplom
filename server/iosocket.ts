import express from 'express'
import https from 'https'
import http from 'http'
import dotenv from 'dotenv';
import fs from 'fs'
import { Server } from 'socket.io'
import { getConfig } from './src/app-config'
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { AppAlias, TokenStatus } from './src/enum'
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';
const pkgDef = protoLoader.loadSync(__dirname + '/grpc/auth.proto');
const proto = grpc.loadPackageDefinition(pkgDef) as any;
const config = getConfig()
const rootCert = fs.readFileSync(config.cert_local);
const grpcClient = new proto.auth.VerifyTokenService(
    `${config.host}:${config.port}`,
    grpc.credentials.createSsl(rootCert)
);

dotenv.config({ path: __dirname + '/.env' })

const app = express()
// const config = getConfig()
// app.use((req, res, next) => {
//     console.log("hdfdh")
//     next()
// })


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


const isUserAuthenticated = async (token: string): Promise<boolean> => {
    return new Promise<boolean>((res, rej) => {
        grpcClient.VerifyToken({ id: token }, (err: any, response: any) => {
            if (err) {
                rej(err)
            }
            else {
                console.log(response)
                res(response.status == TokenStatus.EXISTS && response.regDate)
            }
        })
    })
}


io.use(async (socket, next) => {
    try {
        const cookies = socket.handshake.headers.cookie;
        // console.log(cookies)
        if (!cookies) {
            return next(new Error('No cookies'));
        }

        const parsed = cookie.parse(cookies);
        const token = parsed.jwt;

        if (!token) {
            return next(new Error('No token'));
        }
        // console.log(token)
        try {
            console.log(process.env.JWT_SECRET)
            const payload = jwt.verify(token, process.env.JWT_SECRET!);
            socket.data.user = payload;
            let isAuthenticated: boolean = false;
            console.log(payload)
            if (payload) {
                console.log(isAuthenticated)
                isAuthenticated = await isUserAuthenticated(token);
            }
            if (!isAuthenticated) {
                next(new Error('Unauthorized'));
            }
            else {
                next()
            }
        } catch (error) {
            console.log(error)
            console.log("jwt verification failed")
            next(new Error('Unauthorized'));
        }

    }
    catch (err: any) {
        console.log("error")
        next(new Error(err.message));
    }
});

const userData: any = {}
userData[AppAlias.JAIL] = {}
io.on("connection", async (socket) => {
    // console.log((socket as any).token)
    // const token = "mok"

    // const isAuthenticated = await isUserAuthenticated(token)
    // // console.log(isAuthenticated)
    // if(!isAuthenticated) {
    //     socket.to(AppAlias.JAIL).emit('unauthorized', token);
    // }


    console.log("connected")
    console.log(socket.data)
    socket.on("join-room", (roomId, userId, userName) => {
        if (!userData[roomId]) {
            userData[roomId] = {}
        }
        userData[roomId][userId] = userName;
        (socket as any).roomId = roomId;
        (socket as any).userName = userName;
        (socket as any).userId = userId;
        console.log(`${userName} joined room ${roomId} ${userId}`);
        // console.log(userData)

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
        if (userData[roomId] && userData[roomId][userId])
            delete userData[roomId][userId];
        console.log('user-disconnected', userId)
        if (roomId && userId) {
            io.to(roomId).emit('user-disconnected', userId);
        }
        console.log(userData)
    });
});
server.listen(9000, () => console.log("iosocket"))


