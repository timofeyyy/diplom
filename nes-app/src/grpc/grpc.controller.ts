import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { JWTRequest, VerifyTokenResponse } from "./dto/auth.dto";
import * as grpcJs from "@grpc/grpc-js";
import { GrpcService } from "./grpc.service";

@Controller()
export class HeroesController {
    constructor(
        private readonly grpcService: GrpcService
    ) { }
    @GrpcMethod('VerifyTokenService', 'VerifyToken')
    VerifyTokenService(data: JWTRequest, metadata: grpcJs.Metadata, call: grpcJs.ServerUnaryCall<any, any>): any {
        // VerifyToken: (call: any, callback: any) => {
        // // console.log("VerifyToken")
        // redisClient.connect()
        //     .then(async (client: redis.RedisClientType) => {
        //         const jwtId = call.request.id;
        //         let tokensStr = await client.get("tokens");
        //         let tokens: Record<string, string> = tokensStr ? JSON.parse(tokensStr) : {};
        //         let status: TokenStatus;
        //         // console.log(jwtId)
        //         // console.log("\n\n\n\n\n")
        //         // console.log(tokens)
        //         const response: any = {}
        //         if (tokens && jwtId) {
        //             // console.log(tokens[jwtId])
        //         }
        //         if (tokens && jwtId && tokens[jwtId]) {
        //             status = TokenStatus.EXISTS
        //             response.regDate = tokens[jwtId]
        //         }
        //         else {
        //             status = TokenStatus.NOTEXISTS
        //         }
        //         response.status = status
        //         callback(null, response)
        //     })
        //     .catch((err: any) => {
        //         // console.log(err)
        //         callback(err, null)
        //     })
        // },
    }
}
