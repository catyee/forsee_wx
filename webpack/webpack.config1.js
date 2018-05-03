
let path = require('path');
let entry = require('./webpack.entry.js');
let htmlPlugins = require('./webpack.html.js');
let ReleaseHandlePlugin = require('./releaseHandlePlugin');
const webpack = require('webpack');


let config = {
    context: __dirname,
    entry: entry,
    output: {
        path: path.resolve('./dist/'),
        publicPath: '', // 插入到html中的静态文件的路径前缀
        filename: '[name].[hash].js'
    },
    // devtool: "source-map",
    module: {
        rules: [{
            test: /\.js$/,
            exclude: function (path) {
                // 路径中含有 node_modules 的就不去解析。
                var isNpmModule = !!path.match(/node_modules/);
                return isNpmModule;
            },
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }

        }, {
            test: /\.scss$/,
            use: [{
                loader: "style-loader" // 将 JS 字符串生成为 style 节点
            }, {
                loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
            }, {
                loader: "sass-loader" // 将 Sass 编译成 CSS
            }]
        }, {
            test: /\.css$/,
            use: [{
                loader: "style-loader" // 将 JS 字符串生成为 style 节点
            }, {
                loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
            }]
        }, {
            test: /\.(woff2?|eot|svg|ttf|otf)(\?.*)?$/,
            use: [{
                loader: "url-loader"
            }]
        }, {
            test: /\.ejs$/,
            use: [{
                loader: "ejs-loader"
            }]
        }]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common'
        }),
        new webpack.ProvidePlugin({
            Promise: 'es6-promise-promise'
        }),
    ].concat(htmlPlugins)

};

if (process.env.NODE_ENV == 'development') {
    config.devServer = {
        inline: true,
        historyApiFallback: true,
        port: 8080,
        host: 'ems.dianwutong.com'
    }
    config.plugins.push(new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: require('./build/dev/vendor-manifest.json')
    }))
    
} else if(process.env.NODE_ENV == 'test'){
    config.plugins.push(new ReleaseHandlePlugin({env:'test'}));
} else if(process.env.NODE_ENV == 'production'){
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    config.plugins.push(new ReleaseHandlePlugin({env:'production'}));
}

module.exports = config;