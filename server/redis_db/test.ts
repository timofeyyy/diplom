import redisClient from './connection';
import redis from 'redis';


redisClient.connect()
    .then(async (client: redis.RedisClientType) => {
        // let tokensStr = await client.get("tokens");
        await client.set("test", 1)
        let test = await client.get("test")
        // console.log(test)
        await client.del("test")
        test = await client.get("test")
        // console.log(test)
        // console.log(`TEST EXECUTED SUCCESESFULY: \n`)
    })
    .catch((err: any) => {
        // console.log(`CATCH ERR: \n${err}`)
    })