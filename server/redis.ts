import redis from 'redis';
// import { createClient, RedisClientType } from 'redis';
import redisClient from './redis_db/connection';
import express from 'express';

const app = express()

app.get("/test_redis", (req, res) => {
    redisClient.connect()
        .then(async (client: redis.RedisClientType) => {
            // const values: Array<string> = await client.lRange('test_records', 0, -1) as Array<string>;
            // console.log(values)
            // await client.lPush('test_records', ['apple', 'banana', 'cherry']);

            // let result;
            let test_val = await client.get("test_val")
            console.log(test_val)
            await client.set("test_val", "abc")
            // console.log(test_val)
            // if(!test_val) {
            //     result = 0
            // }
            // else {
            //     result = Number.parseInt(JSON.stringify(test_val));
            // }
            // result+=1;
            // console.log(result)
            // await client.set("test_val", JSON.stringify(result))
            // const values: Array<string> = await client.lRange('records-obj1', 0, -1) as Array<string>
            // const jsonValues: Array<IRecord> = []
            // values.forEach((value: string) => {
            //     jsonValues.push(JSON.parse(value))
            // })
            // console.log(jsonValues)
            res.send(test_val)
        })
        .catch((err) => {
            console.log(err)
            res.statusCode = 404
            res.send();
        })
})
//redis-cli flushall 
app.listen(11000, () => console.log("redis"))

