import { Context, Middleware, Next } from 'koa';
import koaBody from 'koa-body';
import path from 'path';
import fs from 'fs';
const fsExtra = require('fs-extra');
const appRoot = require('app-root-path');

export function bodyParser(options?: {
    // 是否重命名
    // 为true时，文件名为随机hash
    // 为false时，文件名称为原始名称，如果没有原始名称，则显示随机名称
    rename: boolean
}): Middleware {
    const uploadDir = path.join(appRoot.path, 'upload');
    fsExtra.ensureDirSync(uploadDir);
    return async function parser(ctx: Context, next: Next) {
        let filePath = '', newFilepath = '';
        const realParser = koaBody({
            multipart: true,
            formidable: {
                uploadDir,
                keepExtensions: true,
                onFileBegin(name, file) {
                    const { originalFilename, newFilename } = file;
                    filePath = file.filepath;
                    newFilepath = path.join(path.dirname(filePath), originalFilename || newFilename);
                }
            }
        });
        await realParser(ctx, async (): Promise<any> => {});
        try {
            if (!options?.rename && filePath && newFilepath) {
                fs.renameSync(filePath, newFilepath);
            }
            await next();
        } catch(err) {
            throw err;
        }
    }
}