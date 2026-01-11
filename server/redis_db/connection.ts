import { createClient, RedisClientType } from 'redis';


const connect = (): Promise<RedisClientType> => {
    let client: RedisClientType = createClient();

    return new Promise(async (resolve, reject) => {
        client.on('error', err => {
            console.log('Redis Client Error', err)
            reject(err);
        });
        client.on('ready', err => {
            console.log('ready')
            resolve(client);
        });
        if(!client.isOpen)
            await client.connect();
        else 
            resolve(client)
    })
}



export default { connect };
module.exports.connect = connect