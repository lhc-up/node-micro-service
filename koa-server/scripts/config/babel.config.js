module.exports = {
    // commonjs 运行时包
    'cjs-runtime': {
        presets: [
            [
                '@babel/preset-env',
                {
                    'modules': 'commonjs'
                }
            ]
        ],
        plugins: [
            [
                '@babel/plugin-transform-runtime',
                {
                    'corejs': 3
                }
            ]
        ]
    },
    // commonjs polyfill包
    'cjs-polyfill': {
        presets: [
            [
                '@babel/preset-env',
                {
                    'useBuiltIns': 'entry',
                    'corejs': 3,
                    'modules': 'commonjs'
                }
            ]
        ]
    }
}