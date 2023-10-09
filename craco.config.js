const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: (webpackConfig, {env, paths}) => {
            return {
                ...webpackConfig,
                entry: {
                    main: './src/index.tsx',
                    content: './src/content/UserContentTab.ts',
                },
                output: {
                    ...webpackConfig.output,
                    filename: 'static/js/[name].js',
                },
                optimization: {
                    ...webpackConfig.optimization,
                    runtimeChunk: false,
                }
            }
        },
        plugins: {
          add: [
            new webpack.DefinePlugin({
                'process.env.OPENAI_KEY': JSON.stringify(process.env.OPENAI_KEY),
            }),
            new webpack.DefinePlugin({
                'process.env.INITIAL_MESSAGE': JSON.stringify(process.env.INITIAL_MESSAGE),
            }),
          ], 
        }
    }
 }
