import Router from 'koa-router';
const router = new Router();
import { Context } from 'koa';

router.get('/test', async (ctx: Context) => {
    throw new Error('12312');
    ctx.body = 'success';
});

export {
    router
};