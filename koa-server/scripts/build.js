const fs = require('fs-extra');
const rollup = require('rollup');
const { getConfig } = require('./config/rollup.config');

fs.removeSync('dist');
fs.ensureDirSync('dist');

const build = {
    isMin: false,
    useBabel: false,
    rollupConfig: {},
    run() {
        this.getAllConfig();
        this.build();
    },
    getAllConfig() {
        const argvs = process.argv;
        this.useBabel = argvs.includes('babel');
        this.isMin = argvs.includes('min');
        this.rollupConfig = getConfig({
            isMin: this.isMin,
            useBabel: this.useBabel
        });
    },
    async build() {
        const config = this.rollupConfig;
        const bundle = await rollup.rollup(config);
        await bundle.generate(config.output);
        await bundle.write(config.output);
    }
}

build.run();