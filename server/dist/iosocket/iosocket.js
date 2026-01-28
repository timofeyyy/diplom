"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const socket_io_1 = require("socket.io");
const app_config_1 = require("../src/app-config");
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const enum_1 = require("../src/enum");
const cookie = __importStar(require("cookie"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config = (0, app_config_1.getConfig)();
const pkgDef = protoLoader.loadSync(config.proto.root_dir + config.proto.contracts.auth);
const proto = grpc.loadPackageDefinition(pkgDef);
const rootCert = fs_1.default.readFileSync(config.cert_local);
const grpcClient = new proto.auth.VerifyTokenService(`${config.host}:${config.port}`, grpc.credentials.createSsl(rootCert));
dotenv_1.default.config({ path: __dirname + '/.env' });
const app = (0, express_1.default)();
app.get("/test_iosocket", (req, res) => {
    res.send("iosocket");
});
// console.log(config.key_local, config.cert_local)
// const server = https.createServer({
//     key: fs.readFileSync(config.key_local, 'utf-8'),
//     cert: fs.readFileSync(config.cert_local, 'utf-8'),
// }, app);
const server = http_1.default.createServer({}, app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
});
const isUserAuthenticated = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((res, rej) => {
        grpcClient.VerifyToken({ id: token }, (err, response) => {
            if (err) {
                rej(err);
            }
            else {
                console.log(response);
                res(response.status == enum_1.TokenStatus.EXISTS && response.regDate);
            }
        });
    });
});
io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            console.log(process.env.JWT_SECRET);
            const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.data.user = payload;
            let isAuthenticated = false;
            console.log(payload);
            if (payload) {
                console.log(isAuthenticated);
                isAuthenticated = yield isUserAuthenticated(token);
            }
            if (!isAuthenticated) {
                next(new Error('Unauthorized'));
            }
            else {
                next();
            }
        }
        catch (error) {
            console.log(error);
            console.log("jwt verification failed");
            next(new Error('Unauthorized'));
        }
    }
    catch (err) {
        console.log("error");
        next(new Error(err.message));
    }
}));
const userData = {};
userData[enum_1.AppAlias.JAIL] = {};
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log((socket as any).token)
    // const token = "mok"
    // const isAuthenticated = await isUserAuthenticated(token)
    // // console.log(isAuthenticated)
    // if(!isAuthenticated) {
    //     socket.to(AppAlias.JAIL).emit('unauthorized', token);
    // }
    console.log("connected");
    console.log(socket.data);
    socket.on("join-room", (roomId, userId, userName) => {
        if (!userData[roomId]) {
            userData[roomId] = {};
        }
        userData[roomId][userId] = userName;
        socket.roomId = roomId;
        socket.userName = userName;
        socket.userId = userId;
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
        console.log(`user-disconnected ${userId}`);
        socket.to(roomId).emit('user-disconnected', userId);
    });
    socket.on('disconnect', () => {
        const roomId = socket.roomId;
        const userId = socket.userId;
        if (userData[roomId] && userData[roomId][userId])
            delete userData[roomId][userId];
        console.log('user-disconnected', userId);
        if (roomId && userId) {
            io.to(roomId).emit('user-disconnected', userId);
        }
        console.log(userData);
    });
}));
server.listen(9000, () => console.log("iosocket"));
