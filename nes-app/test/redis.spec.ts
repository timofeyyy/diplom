import { createClient, RedisClientType } from "redis";
import { RedisService } from "../src/redis/redis.service";

describe('RedisService (integration)', () => {
  let service: RedisService;
  let client: RedisClientType;

  beforeAll(async () => {
    client = createClient();
    await client.connect();
    service = new RedisService(client);
  });

  afterAll(async () => {
    await client.quit();
  });

  it('should set and get value', async () => {
    await service.set('test-key', '123');

    const result = await service.get('test-key');

    expect(result).toBe('123');

    await client.del('test-key');
  });
});
