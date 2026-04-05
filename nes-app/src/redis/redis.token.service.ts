import { Inject, Injectable } from "@nestjs/common";
import * as redis from 'redis';
import { TokenRecord } from "./dto/token.response.dto";
import { tokens_ttl_sec, TokenType } from "src/auth/dto/user.dto";
@Injectable()
export class RedisTokenService {
    constructor(
        @Inject('REDIS_CLIENT')
        private readonly redisClient: redis.RedisClientType
    ) { }


    async getToken(token:
        {
            tokenType: TokenType,
            value: string
        }) {

        try {
            const str = await this.redisClient.get(token.tokenType)
            let tokens: Record<string, TokenRecord> = str ? JSON.parse(str) : {};
            return tokens[token.value]
        }
        catch (err) {
            console.log(err.message)
            return null
        }
    }

    async setToken(token:
        {
            tokenType: TokenType,
            value: string
        },
        // id: string,
        payload: {
            _id: string,
            data: any
        }
    ) {
        try {
            const str = await this.redisClient.get(token.tokenType)
            let tokens: Record<string, TokenRecord> = str ? JSON.parse(str) : {};
            if (!tokens) {
                tokens = {}
            }
            tokens[token.value] = payload
            // {
            //     _id: id,
            //     birthday: new Date().toISOString()
            // }
            // console.log(tokens)
            await this.redisClient.set(token.tokenType, JSON.stringify(tokens), { EX: tokens_ttl_sec[token.tokenType] })
            return true
        }
        catch (err) {
            console.log(err.message)
            return false
        }
    }

    async delToken(
        token:
            {
                tokenType: TokenType,
                value: string
            },
        id: string
    ) {
        try {
            const str = await this.redisClient.get(token.tokenType)
            let tokens: Record<string, TokenRecord> = str ? JSON.parse(str) : {};
            if (!tokens) {
                tokens = {}
            }
            let res = false
            // console.log(tokens)
            // console.log(tokens[token.value])
            // console.log(tokens[token.value]._id)
            // console.log(tokens[token.value]._id === id)
            if (tokens[token.value] && tokens[token.value]._id === id) {
                delete tokens[token.value]
                res = true
            }

            await this.redisClient.set(token.tokenType, JSON.stringify(tokens))
            return res
        }
        catch (err) {
            console.log(err.message)
            return false
        }
    }
}
