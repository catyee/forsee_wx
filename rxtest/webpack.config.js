const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
let path = require('path');
let fs = require('fs');
let files = fs.readdirSync('./src/html');
let plugin = [];
files.forEach((file) => {
    let chunk = file.slice(0,file.length -5);
    let filename = file;
    console.log(chunk,'chunk')
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
        test: ['babel-polyfill','./src/js/test.js'],
        'test-func': './src/js/testFunc.js',
        'todo-list': './src/js/todoList.js',
        'vue-test': './src/js/vueTest.js',
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
                    presets: ['es2015',"stage-0"]
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
        proxy: {
            '*': {
                target: 'http://api.dianwutong.com',
                changeOrigin: true
            }
        }
    }
}
module.exports = config;