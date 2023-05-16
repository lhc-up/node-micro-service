import Koa from 'koa';
import { router } from './middlewares/router';
import { Config } from './config/config';
import { Logger } from './utils/LogUtil';
import { accessLogger } from './middlewares/accessLogger';
import { bodyParser } from './middlewares/bodyParser';
import { exceptionHandler } from './middlewares/exceptionHandler';
import { NacosUtil } from './utils/NacosUtil';
import { RabbitMQUtil } from './utils/RabbitMQUtil';

(async () => {
    try {
        Config.init();
        await NacosUtil.init();
        await RabbitMQUtil.init();
        
        const app = new Koa();
        // 接口异常
        app.use(exceptionHandler);
        // 解析请求body
        app.use(bodyParser());
        // 访问日志
        app.use(accessLogger());
        // 接口
        app.use(router.routes());
        
        app.listen(Config.server.port, () => {
            Logger.info('应用配置', Config.all);
            Logger.info(`服务已启动,端口:${Config.server.port},环境:${Config.active}`);
        }).on('error', err => {
            Logger.fatal('服务启动失败', err);
            process.exit(1);
        });
    } catch(err) {
        Logger.fatal(err);
        // 这里发生错误时，不允许启动服务
        process.exit(1);
    }
})();

process.on('uncaughtException', err => {
    Logger.error('系统异常', err);
});

process.on('unhandledRejection', err => {
    Logger.error('系统异常', err);
});