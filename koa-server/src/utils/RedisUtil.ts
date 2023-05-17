import { Config } from '@/config/config';
import { createClient } from 'redis';
import { Logger } from './LogUtil';

type RedisClientType = ReturnType<typeof createClient>;

export class RedisUtil {
    public static client: RedisClientType;
    /**
     * redis地址
     */
    private static get address(): string {
        const { enabled, host, port } = Config.redis;
        if (!enabled) return '';
        // `redis://[[username][:password]@][host][:port][/db-number]`;
        let url = 'redis://';
        url += host;
        if (port) {
            url += `:${port}`;
        }
        return url;
    }

    public static async init() {
        if (!Config.redis.enabled) {
            Logger.info(`当前环境[${Config.active}]未启用redis`, Config.redis);
            return;
        }
        try {
            const { username, password, database } = Config.redis;
            const client = createClient({
                url: this.address,
                username,
                password,
                database
            });
            await client.connect();
            this.client = client;
        } catch(err) {
            Logger.error('Redis初始化失败', err);
            throw err;
        }
    }
}