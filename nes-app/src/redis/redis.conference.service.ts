import { Inject, Injectable, Logger } from "@nestjs/common";
import * as redis from 'redis';
import { TokenType } from "src/auth/dto/user.dto";
@Injectable()
export class RedisConferenceService {
    constructor(
        @Inject('REDIS_CLIENT')
        private readonly redisClient: redis.RedisClientType,
        @Inject('REDIS_SUBSCRIBER')
        private readonly subClient: redis.RedisClientType,

    ) { }

    logger = new Logger()

    async create(id: string, seconds: number = 10) {
        try {
            const str = await this.redisClient.get(TokenType.CONFERENCE_TOKEN)
            let tokens: Record<string, any> = str ? JSON.parse(str) : {};
            if (!tokens) {
                tokens = {}
            }
            tokens[id] = new Date()

            // this.logger.debug({controller: RedisConferenceService.name, message: tokens})
            await this.redisClient.set(TokenType.CONFERENCE_TOKEN, JSON.stringify(tokens), { EX: seconds })
            return true
        }
        catch (err) {
            // // console.log(err.message)
            // this.logger.debug({controler: RedisConferenceService.name, message: err.message})
            return false
        }
    }
}
