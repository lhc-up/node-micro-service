const path = require('path');
const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const version = require('../../package.json').version;
const { getBabelOutputPlugin } = require('@rollup/plugin-babel');
const { terser } = require('@rollup/plugin-terser');
const babelConfig = require('./babel.config.js');
const commonjs = require('@rollup/plugin-commonjs');
const progress = require('rollup-plugin-progress');
const copyPlugin = require('rollup-plugin-copy');

const banner =
  '/*!\n' +
  ` * Name: koa-server\n` +
  ` * Version: v${version}\n` +
  ` * Datetime: ${new Date()}\n` +
  ' */';

const resolve = p => path.resolve(__dirname, '../../', p);

function getPlugins({
    useBabel,
    isMin
}) {
    const plugins = [
        progress(),
        typescript({
            exclude: 'node_modules/**',
            typescript: require('typescript')
        }),
        nodeResolve(),
        commonjs(),
        copyPlugin({
            targets: [
                {
                    src: 'src/config/*.yml',
                    dest: 'dist/config'
                }
            ]
        })
    ]
    if (useBabel) {
        plugins.push(
            getBabelOutputPlugin(babelConfig['cjs-polyfill'])
        );
    }
    if (isMin) {
        plugins.push(terser());
    }
    return plugins;
}

/**
 * 获取打包配置
 * @param {Object} options 自定义打包参数
 * useBabel:是否通过babel编译
 * isMin:是否启用压缩
 */
function getConfig(options={
    useBabel: false,
    isMin: false
}) {
    const config = {
        input: resolve('src/main.ts'),
        output: {
            format: 'cjs',
            banner,
            dir: resolve('dist'),
            preserveModules: true
        },
        plugins: getPlugins(options),
        external: getExternalPkgs()
    }
    return config;
}

function getExternalPkgs() {
    const pkg = require('../../package.json');
    const externalPkgs = [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.devDependencies)
    ];
    const regOfpkgs = externalPkgs.map(name => new RegExp(`^${name}(\/.*)?`));
    return regOfpkgs;
}

module.exports = {
    getConfig
};