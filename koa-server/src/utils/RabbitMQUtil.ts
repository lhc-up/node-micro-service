// https://github.com/amqp-node/amqplib
import amqplib, { Channel, Connection, GetMessage, Options } from 'amqplib';
import { Logger } from './LogUtil';
import { CatchException } from '@/decorators/CatchException';
import { Config } from '@/config/config';
import url from 'url';

declare interface MessageVo {
    id: string;
    data: any;
}
// import { ScheduleUtil } from './ScheduleUtil';
export class RabbitMQUtil {
    private static connection: Connection;

    // 消息发送channel
    private static channel: Channel;

    @CatchException('RabbitMQ初始化失败')
    public static async init() {
        if (!Config.rabbitMq.enabled) {
            Logger.info(`当前环境[${Config.active}]未启用RabbitMQ`, Config.rabbitMq);
            return;
        }

        const { address, username, password } = Config.rabbitMq;
        const { hostname, port } = url.parse(address);
        const connectConfig: Options.Connect = {
            protocol: 'amqp',
            // @ts-ignore
            hostname,
            // @ts-ignore
            port,
            username,
            password,
            heartbeat: 60
        }
        this.connection = await amqplib.connect(connectConfig);

        await this.createChannel();

        this.connection.on('error', err => {
            const connection = this.connection;
            if (connection) connection.close();
            Logger.error('RabbitMQ连接断开', err, connection);
            this.init().then(() => {
                Logger.info('RabbitMQ已重新连接');
            });
        });

        Logger.info('RabbitMQ初始化完成', Config.rabbitMq);
    }

    private static async createChannel() {
        const connection = this.connection;
        this.channel = await connection.createChannel();
    }

    /**
     * 发送消息
     * @param queue 队列名称
     * @param data 消息内容
     * @returns 
     */
    private static async sendMsg(queue: string, data: MessageVo): Promise<boolean> {
        if (!this.channel) {
            await this.createChannel();
        }
        const msg = Buffer.from(JSON.stringify(data));
        return this.channel.sendToQueue(queue, msg);
    }

    /**
     * 拉取消息
     * @param queue 队列名称
     * @returns 
     */
    private static async pullMsg(queue: string): Promise<MessageVo | false> {
        if (!this.channel) {
            await this.createChannel();
        }
        try {
            const msg: GetMessage | false = await this.channel.get(queue, {
                noAck: true
            });
            if (!msg) return false;
            const content = msg.content.toString();
            Logger.info('拉取到RabbitMQ消息', content);
            return JSON.parse(content);
        } catch(err) {
            Logger.error('拉取RabbitMQ消息失败', err);
            return false;
        }
    }

    /**
     * 监听队列，被动获取消息
     * @param queue 队列名称
     */
    private static async listen(queue: string, cb: Function): Promise<void> {
        const connection = this.connection;
        const channel = await connection.createChannel();
        await channel.assertQueue(queue);
        channel.consume(queue, (msg: any) => {
            if (msg !== null) {
                const content = msg.content.toString();
                Logger.info(`收到RabbitMQ消息,`, content);
                channel.ack(msg);
                if (cb && cb instanceof Function) cb(content);
            } else {
                Logger.info(`[${queue}]服务端已取消该消息`);
            }
        });
    }


    /************  test ***********/
    public static async listenQueue1(cb: Function) {
        return this.listen(Config.rabbitMq.queue.queue1, cb);
    }

    public static async pullFromQueue2(): Promise<MessageVo | false> {
        return this.pullMsg(Config.rabbitMq.queue.queue2);
    }

    public static sendMsgToQueue2(data: MessageVo): Promise<boolean> {
        return this.sendMsg(Config.rabbitMq.queue.queue2, data);
    }
}