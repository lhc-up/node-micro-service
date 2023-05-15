import { Logger } from '@/utils/LogUtil';
import { Context, Middleware, Next } from 'koa';
import bytes from 'bytes';
const Counter = require('passthrough-counter');

function humanize(n: any, options?: any){
    options = options || {};
    var d = options.delimiter || ',';
    var s = options.separator || '.';
    n = n.toString().split('.');
    n[0] = n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + d);
    return n.join(s);
};
function time (start: number) {
    const delta = Date.now() - start
    return humanize(delta < 10000
      ? delta + 'ms'
      : Math.round(delta / 1000) + 's')
}
function log(ctx: Context, start: number, len: any, err?: any, event?: string) {
    // 获取响应状态码
    const status = err 
        ? (err.isBoom ? err.output.statusCode : err.status || 500) 
        : (ctx.status || 404);
    
    // 获取响应长度
    let length;
    if (~[204, 205, 304].indexOf(status)) {
        length = '';
    } else if (len == null) {
        length = '-';
    } else {
        length = bytes(len).toLowerCase();
    }

    const { method, originalUrl } = ctx;
    let loggerFn: Function = Logger.info;
    let flag: string;
    if (err) {
        loggerFn = Logger.error;
        flag = 'xxx';
    } else if (event === 'close') {
        flag = '-x-';
    } else {
        flag = '-->'
    }
    loggerFn(flag, method, originalUrl, status, time(start), length);
}
export function accessLogger(options?: any): Middleware {
    return async function logger(ctx: Context, next: Next) {
        // 请求到达时间
        const start = ctx['request-received.startTime'] 
            ? ctx['request-received.startTime'].getTime()
            : Date.now();
        Logger.info('<--', ctx.method, ctx.originalUrl, ctx.body);

        try {
            await next();
        } catch (err) {
            try {
                log(ctx, start, null, err);
            } catch(e) {
                Logger.error(e);
            }
            throw err;
        }

        const length = ctx.response.length;
        const body: any = ctx.body;
        let counter: any;
        // 未返回content-length响应头时，计算body长度
        if (length == null && body && body.readable) {
            ctx.body = body
                .pipe(counter = Counter())
                .on('error', ctx.onerror);
        }

        // 响应结束时或关闭时记录日志，以先发生的事件为准
        const res = ctx.res;
        const onfinish = done.bind(null, 'finish');
        const onclose = done.bind(null, 'close');

        res.once('finish', onfinish);
        res.once('close', onclose);

        function done (event: string) {
            res.removeListener('finish', onfinish);
            res.removeListener('close', onclose);
            log(ctx, start, counter ? counter.length : length, null, event)
        }
    }
}