const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const appRoot = require('app-root-path');
const { spawn } = require('child_process');

function getPath(p) {
    return path.join(appRoot.path, p);
}

const postBuild = {
    async run() {
        this.copyFile();
        await this.install();
        this.archive();
    },
    copyFile() {
        // 生成报告相关的模板文件
        // fs.copySync(getPath('template'), getPath('dist/template'));
        // 拷贝package.json至根目录，部署时使用 npm install --production 安装生产环境依赖
        fs.copySync(getPath('package.json'), getPath('dist/package.json'));
    },
    install() {
        console.log('开始安装生产环境依赖');
        return new Promise((resolve, reject) => {
            const stdio = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['--registry', 'https://registry.npm.taobao.org', 'i', '--omit=dev'], {
                cwd: getPath('dist')
            });
            stdio.stdout.on('data', data => {
                console.log(data.toString());
            });
            stdio.stderr.on('data', data => {
                console.log(data.toString());
            });
            stdio.on('close', code => {
                code === 0 ? resolve() : reject();
            });
        });
    },
    archive() {
        console.log('开始压缩文件');
        const pkgJson = require(getPath('package.json'));
        const outputPath = getPath(`${pkgJson.name}.tgz`);
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('tar', {
            gzip: true,
            gzipOptions: {
                level: 9
            }
        });
        archive.pipe(output);
        archive.directory(getPath('dist'), false);
        archive.finalize();

        // archive写入完成后，ouput自动关闭
        archive.on('end', () => {
            console.log('构建完成');
        });
        archive.on('error', err=> {
            throw new Error(err);
        });

        // 创建流失败时触发的error，不会触发archive的error事件
        output.on('error', err => {
            throw new Error(err);
        });
    }
}

postBuild.run();