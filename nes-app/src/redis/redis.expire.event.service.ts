import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as redis from 'redis';
@Injectable()
export class RedisExpireEventService implements OnModuleInit {
    constructor(
        @Inject('REDIS_CLIENT')
        private readonly redisClient: redis.RedisClientType
    ) { }


    logger = new Logger()
    async onModuleInit() {
        await this.redisClient.subscribe(
            '__keyevent@0__:expired',
            (message: string) => {

            },
        );
    }
}
