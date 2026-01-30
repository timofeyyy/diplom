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
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const connection_1 = __importDefault(require("../redis_db/connection"));
const enum_1 = require("../src/enum");
const app_config_1 = require("../src/app-config");
const config = (0, app_config_1.getConfig)();
const pkgDef = protoLoader.loadSync(config.proto.root_dir + config.proto.contracts.auth);
const proto = grpc.loadPackageDefinition(pkgDef);
const server = new grpc.Server();
server.addService(proto.auth.VerifyTokenService.service, {
    VerifyToken: (call, callback) => {
        console.log("VerifyToken");
        connection_1.default.connect()
            .then((client) => __awaiter(void 0, void 0, void 0, function* () {
            const jwtId = call.request.id;
            let tokensStr = yield client.get("tokens");
            let tokens = tokensStr ? JSON.parse(tokensStr) : {};
            let status;
            console.log(jwtId);
            console.log("\n\n\n\n\n");
            console.log(tokens);
            const response = {};
            if (tokens && jwtId) {
                console.log(tokens[jwtId]);
            }
            if (tokens && jwtId && tokens[jwtId]) {
                status = enum_1.TokenStatus.EXISTS;
                response.regDate = tokens[jwtId];
            }
            else {
                status = enum_1.TokenStatus.NOTEXISTS;
            }
            response.status = status;
            callback(null, response);
        }))
            .catch((err) => {
            console.log(err);
            callback(err, null);
        });
    },
    SaveToken: (call, callback) => {
        connection_1.default.connect()
            .then((client) => __awaiter(void 0, void 0, void 0, function* () {
            const jwtId = call.request.id;
            let tokensStr = yield client.get("tokens");
            console.log(tokensStr);
            let tokens = tokensStr ? JSON.parse(tokensStr) : {};
            const date = Date.now().toString();
            if (!tokens) {
                tokens = {};
            }
            tokens[jwtId] = date;
            yield client.set("tokens", JSON.stringify(tokens));
            console.log("сохранено");
            callback(null, {
                status: enum_1.TokenStatus.EXISTS,
                regDate: date
            });
        }))
            .catch((err) => {
            callback(err, null);
        });
    },
    RemoveToken: (call, callback) => {
        connection_1.default.connect()
            .then((client) => __awaiter(void 0, void 0, void 0, function* () {
            const jwtId = call.request.id;
            let tokensStr = yield client.get("tokens");
            let tokens = tokensStr ? JSON.parse(tokensStr) : {};
            const response = {};
            console.log(tokens, jwtId);
            if (tokens[jwtId]) {
                delete tokens[jwtId];
                response.status = enum_1.TokenStatus.EXISTS;
                yield client.set("tokens", JSON.stringify(tokens));
            }
            else {
                response.status = enum_1.TokenStatus.INVALID;
            }
            callback(null, response);
        }))
            .catch((err) => {
            callback(err, null);
        });
    }
});
server.bindAsync('0.0.0.0:12000', grpc.ServerCredentials.createInsecure(), () => {
    console.log('gRPC server started');
    server.start();
});
