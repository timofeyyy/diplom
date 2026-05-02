import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import redisClient from '../redis_db/connection';
import redis from 'redis';
import { TokenStatus } from '../src/enum';

import { getConfig } from '../src/app-config';
const config = getConfig();
const pkgDef = protoLoader.loadSync(config.proto.root_dir + config.proto.contracts.auth);
const proto = grpc.loadPackageDefinition(pkgDef) as any;
const server = new grpc.Server();

server.addService(proto.auth.VerifyTokenService.service, {
    VerifyToken: (call: any, callback: any) => {
        // console.log("VerifyToken")
        redisClient.connect()
            .then(async (client: redis.RedisClientType) => {
                const jwtId = call.request.id;
                let tokensStr = await client.get("tokens");
                let tokens: Record<string, string> = tokensStr ? JSON.parse(tokensStr) : {};
                let status: TokenStatus;
                // console.log(jwtId)
                // console.log("\n\n\n\n\n")
                // console.log(tokens)
                const response: any = {}
                if (tokens && jwtId) {
                    // console.log(tokens[jwtId])
                }
                if (tokens && jwtId && tokens[jwtId]) {
                    status = TokenStatus.EXISTS
                    response.regDate = tokens[jwtId]
                }
                else {
                    status = TokenStatus.NOTEXISTS
                }
                response.status = status
                callback(null, response)
            })
            .catch((err: any) => {
                // console.log(err)
                callback(err, null)
            })
    },
    SaveToken: (call: any, callback: any) => {
        redisClient.connect()
            .then(async (client: redis.RedisClientType) => {
                const jwtId = call.request.id;
                let tokensStr = await client.get("tokens");
                // console.log(tokensStr)
                let tokens: Record<string, string> = tokensStr ? JSON.parse(tokensStr) : {};
                const date = Date.now().toString()
                if (!tokens) {
                    tokens = {}
                }
                tokens[jwtId] = date
                await client.set("tokens", JSON.stringify(tokens))
                // console.log("сохранено")
                callback(null, {
                    status: TokenStatus.EXISTS,
                    regDate: date
                })
            })
            .catch((err: any) => {
                callback(err, null)
            })
    },
    RemoveToken: (call: any, callback: any) => {
        redisClient.connect()
            .then(async (client: redis.RedisClientType) => {
                const jwtId = call.request.id;
                let tokensStr = await client.get("tokens");
                let tokens: Record<string, string> = tokensStr ? JSON.parse(tokensStr) : {};
                const response: any = {}
                // console.log(tokens, jwtId)
                if (tokens[jwtId]) {
                    delete tokens[jwtId];
                    response.status = TokenStatus.EXISTS
                    await client.set("tokens", JSON.stringify(tokens))
                }
                else {
                    response.status = TokenStatus.INVALID
                }
                callback(null, response)
            })
            .catch((err: any) => {
                callback(err, null)
            })
    }
})

server.bindAsync(
    '0.0.0.0:12000',
    grpc.ServerCredentials.createInsecure(),
    () => {
        // console.log('gRPC server started');
        server.start();
    }
);
