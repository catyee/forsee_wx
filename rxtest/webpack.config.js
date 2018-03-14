const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
let path = require('path');
console.log(__dirname)
let outputPath = path.resolve('./dist/');
let config = {
    context: __dirname,
    entry: './src/test_module.js',
    output: {
        path: outputPath,
        filename: '[name].[hash].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: function(path) {
                    let isNpmModule = !!path.match(/node_modules/);
                    return isNpmModule;
                },
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }

        ],
       
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common'
        }),
        new HtmlWebpackPlugin({

        })

    ],
    devServer: {
        inline: true,
        historyApiFallback: true,
        port: 8899,
    }
}
module.exports = config;