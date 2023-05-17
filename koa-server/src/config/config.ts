const yaml = require('js-yaml');
const { merge } = require('lodash');
import { Logger } from '@/utils/LogUtil';
import fs from 'fs';
import path from 'path';

declare interface NacosConfig {
    enabled: boolean;
    address: string;
    username: string;
    password: string;
    namespace: string;
    group: string;
    // 需要获取的配置文件的dataId
    dataId: {
        application: string;
        gateway: string;
        redis: string;
    }
}

declare interface ServerConfig {
    port: number;
}

declare interface RabbitMqConfig {
    enabled: boolean;
    address: string;
    username: string;
    password: string;
    queue: {
        queue1: string;
        queue2: string;
    }
}

declare interface OssConfig {
    enabled: boolean;
    endpoint: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    dir: string;
}

declare interface RedisConfig {
    enabled: boolean;
    host: string;
    port: number;
    username: string;
    password: string;
    database: number;
}

declare interface GatewayConfig {
    domain: string;
    port: number;
}

export class Config {
    public static active: string;
    public static server: ServerConfig;
    public static oss: OssConfig;
    public static rabbitMq: RabbitMqConfig;
    public static nacos: NacosConfig;
    public static gateway: GatewayConfig;
    public static redis: RedisConfig;

    // 所有配置，用于输出配置信息
    public static all: Object;

    public static loadConfig(env: string = ''): Record<string, any> {
        const ymlPath = path.join(__dirname, `application${env ? '-' + env : ''}.yml`);
        try {
            return yaml.load(fs.readFileSync(ymlPath, 'utf8'));
        } catch(err) {
            Logger.error('读取本地配置信息失败', err);
            throw err;
        }
    }
    
    public static init(cfg?: Object | string) {
        const config = {};

        const baseConfig = this.loadConfig();
        merge(config, baseConfig);

        const envConfig = this.loadConfig(baseConfig.active);
        merge(config, envConfig);

        if (cfg) {
            if (typeof cfg === 'string') {
                cfg = yaml.load(cfg);
            }
            merge(config, cfg);
        }

        // @ts-ignore
        this.active = config.active;
        // @ts-ignore
        this.server = config.server || {};
        // @ts-ignore
        this.oss = config.oss || {};
        // @ts-ignore
        this.rabbitMq = config.rabbitMq || {};
        // @ts-ignore
        this.nacos = config.nacos || {};
        // @ts-ignore
        this.gateway = config.gateway || {};
        // @ts-ignore
        this.redis = config.redis || {};

        // @ts-ignore
        console.log('config.redis', config.redis)
        
        this.all = config;
    }

    public static flush(cfg?: Object | string) {
        this.init(cfg);
    }
}