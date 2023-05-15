import { NacosNamingClient, NacosConfigClient } from 'nacos';
import path from 'path';
import { Config } from '../config/config';
import { Logger } from './LogUtil';
const appRoot = require('app-root-path');
const pkgJson = require(path.join(appRoot.path, 'package.json'));
const ip = require('ip');
const yaml = require('js-yaml');

// 自定义Nacos logger
function nacosLogger(): Console {
    const logger = {
        ...console
    }
    logger.log = Logger.info;
    logger.error = Logger.error;
    logger.warn = Logger.warn;
    logger.info = Logger.info;
    logger.debug = Logger.debug;
    return logger;
}
export class NacosUtil {

    private static nacosConfigClient: NacosConfigClient;

    private static get nacosAddress() {
        return Config.nacos.address.replace(/http(s)?:\/\//, '');
    }

    /**
     * 初始化
     */
    public static async init() {
        await this.getConfig();
        await this.register();
    }

    /**
     * 获取Nacos配置
     */
    private static async getConfig(): Promise<void> {
        const { enabled, dataId } = Config.nacos;
        if (!enabled) {
            Logger.info(`当前环境[${Config.active}]未启用nacos`, Config.nacos);
            return;
        }

        // 应用配置
        const appConfig = await this.getSingleConfig(dataId.application);
        console.log(appConfig)

        // RabbitMQ配置
        // const rabbitMQConfig = await this.getSingleConfig(dataId.rabbitmq);

        Config.flush(appConfig);

        Logger.info('Nacos配置已加载完成');
    }

    /**
     * 获取单个配置
     * @param dataId 配置id
     * @returns 
     */
    private static async getSingleConfig(dataId: string): Promise<any> {
        const { namespace, username, password, group } = Config.nacos;

        let client: NacosConfigClient = this.nacosConfigClient;
        if (!client) {
            client = new NacosConfigClient({
                serverAddr: this.nacosAddress,
                namespace,
                // @ts-ignore
                // sdk暂未提供对应的typing，忽略这部分参数的类型检查
                username,
                password
            });
        }
        
        const ymlStr = await client.getConfig(dataId, group);
        const config = yaml.load(ymlStr, {
            json: true
        });
        Logger.info(`${dataId}配置已获取`, config);
        return config || {};
    }

    /**
     * 注册服务到nacos
     */
    private static async register() {
        const { enabled, namespace, username, password } = Config.nacos;
        if (!enabled) return;

        const client = new NacosNamingClient({
            logger: nacosLogger(),
            serverList: this.nacosAddress,
            namespace,
            // @ts-ignore
            // sdk暂未提供对应的typing，忽略这部分参数的类型检查
            username,
            password
        });
        await client.ready();

        const serviceName = pkgJson.name;

        // 注册
        await client.registerInstance(serviceName, {
            ip: ip.address(),
            port: Config.server.port
        });

        Logger.info('微服务已注册', Config.nacos);
    }
}