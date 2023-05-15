import { Logger } from '@/utils/LogUtil';
import { Context, Next } from 'koa';

export async function exceptionHandler(ctx: Context, next: Next) {
    try {
        await next();
    } catch(err) {
        Logger.error(err);
        return ctx.body = '系统异常';
    }
}