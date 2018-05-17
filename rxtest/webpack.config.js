const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
let path = require('path');
let fs = require('fs');
let files = fs.readdirSync('./src/js');
let plugin = [];
files.forEach((file) => {
   let chunk = file.slice(0,file.length -3);
   console.log(chunk,'ccccccccccccc')
    let filename = file.slice(0, file.length-2) + 'html';
    let opts = {
        inject: 'body',
        filename: filename,
        template: ('./src/html/'+filename),
        chunksSortMode: 'manual',
        chunks:  ['vendor',chunk],
    }
    plugin.push(new HtmlWebpackPlugin(opts));
})
let outputPath = path.resolve('./dist/');
let config = {
    context: __dirname,
    entry: {
        index: './src/js/index.js',
        test: './src/js/test.js'
    },
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
            name: 'vendor'
        }),
     
    ].concat(plugin),
    devServer: {
        inline: true,
        historyApiFallback: true,
        port: 8899,
    }
}
module.exports = config;