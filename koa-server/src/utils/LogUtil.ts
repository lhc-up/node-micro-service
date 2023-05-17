import { getLogger, configure } from 'log4js';
import path from 'path';
const appRoot = require('app-root-path');

function getLogPath(name: string) {
   return path.join(appRoot.path, 'logs', name);
}
configure({
    appenders: {
        // key名随意取，在categories中引用
        console: {
            // type为Appenders
            // console表示控制台输出日志
            type: 'console',
            // 自定义输出格式
            // %d日期
            // %p日志等级
            // %m日志内容
            // %n换行 可增加两行日志的间隔方便阅读
            // %[ 和 %]中间括起来的内容，会根据日志等级显示对应颜色 
            layout: {
                type: 'pattern',
                pattern: '[%[%d{yyyy-MM-dd hh:mm:ss}%]] [%[%p%]] - %m%n'
            }
        },
        // 错误日志打印
        errorConsole: {
            // type为Appenders
            // console表示控制台输出日志
            type: 'console',
            // 自定义输出格式
            // %d日期
            // %p日志等级
            // %m日志内容
            // %n换行 可增加两行日志的间隔方便阅读
            // %[ 和 %]中间括起来的内容，会根据日志等级显示对应颜色 
            layout: {
                type: 'pattern',
                pattern: '[%[%d{yyyy-MM-dd hh:mm:ss}%]] [%[%p%]] - %[%m%n%]'
            }
        },
        logs: {
            // dateFile表示落盘日志
            type: 'dateFile',
            filename: getLogPath('info/log-info'),
            fileNameSep: '-',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p] - %m'
            }
        },
        // 错误日志单独文件夹存放
        error: {
            type: 'dateFile',
            filename: getLogPath('error/log-error'),
            fileNameSep: '-',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p] - %m'
            }
        }
    },
    categories: {
        // key值即为log4js.getLogger()的参数
        // appenders数组为上面appenders的key，在日志level达到下面设置的level以后，数组中引用的appenders规则都会被执行
        // 一般用来组合控制台输出和文件输出，即：既在控制台输出，又输出到文件
        default: {
            appenders: ['console', 'logs'],
            // trace级别以上的输出到控制台并记录到文件
            level: 'trace'
        },
        error: {
            appenders: ['errorConsole', 'error'],
            level: 'error'
        }
    }
});

const logger = getLogger();
const errorLogger = getLogger('error');

function print(fn: Function, msg: any, ...args: any) {
    if (msg instanceof Error) {
        const { message, stack } = msg;
        if (stack && stack.includes(message)) {
            fn(msg.stack, ...args);
        } else {
            fn(msg.message, msg.stack, ...args);
        }
    } else {
        fn(msg, ...args);
    }
}
export class Logger {

    // 一般等级的信息，输出至同一个文件夹，根据日期滚动
    public static trace(msg: any, ...args: any) {
        print(logger.trace.bind(logger), msg, ...args);
    }

    public static debug(msg: any, ...args: any) {
        print(logger.debug.bind(logger), msg, ...args);
    }

    public static info(msg: any, ...args: any) {
        print(logger.info.bind(logger), msg, ...args);
    }

    public static warn(msg: any, ...args: any) {
        print(logger.warn.bind(logger), msg, ...args);
    }

    // error等级以上的信息，使用errorLogger，输出至error文件夹
    public static error(msg: any, ...args: any) {
        print(errorLogger.error.bind(errorLogger), msg, ...args);
    }

    // 最高等级，比程序报错要验证，如某些原因造成服务无法正常启动等
    public static fatal(msg: any, ...args: any) {
        print(errorLogger.fatal.bind(errorLogger), msg, ...args);
    }

}