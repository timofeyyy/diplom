
import { TokenType } from 'src/auth/dto/user.dto';
import { Module, DynamicModule, Global } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Global()
@Module({})
export class RedisModule {

  static forRoot(url: string): DynamicModule {
    return {
      module: RedisModule,
      // providers: [
      //   {
      //     provide: 'REDIS_CLIENT',
      //     useFactory: async () => {
      //       const client = createClient({
      //         url: url,
      //       });

      // await client.connect();
      // let res = await client.get(TokenType.ACCES_TOKEN)
      // if (!res) {
      //   await client.set(TokenType.ACCES_TOKEN, JSON.stringify({}))
      // }
      // res = await client.get(TokenType.REFRESH_TOKEN)
      // if (!res) {
      //   await client.set(TokenType.REFRESH_TOKEN, JSON.stringify({}))
      // }
      //       return client;
      //     },
      //   },
      // ],
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useFactory: async () => {
            const client = createClient({ url });
            await client.connect();
            let res = await client.get(TokenType.ACCES_TOKEN)
            if (!res) {
              await client.set(TokenType.ACCES_TOKEN, JSON.stringify({}))
            }
            res = await client.get(TokenType.REFRESH_TOKEN)
            if (!res) {
              await client.set(TokenType.REFRESH_TOKEN, JSON.stringify({}))
            }
            res = await client.get('conferences')
            if (!res) {
              await client.set('conferences', JSON.stringify({}))
            }
            return client;
          },
        },
        {
          provide: 'REDIS_SUBSCRIBER',
          useFactory: async () => {
            const subscriber = createClient({ url });
            await subscriber.connect();
            return subscriber;
          },
        },
      ],
      exports: ['REDIS_CLIENT', 'REDIS_SUBSCRIBER'],
    };
  }
}
