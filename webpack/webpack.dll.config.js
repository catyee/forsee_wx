var path    = require('path');
var webpack = require('webpack');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: {
        vendor: [
            /** 这下面配置项目中用到的NPM依赖 **/
            'jquery',
            'rxjs',
            'layui-laydate',
            'sortablejs',
            '@fancyapps/fancybox'
        ]
    },
    output: {
        path: path.join(__dirname, 'build', 'dev'), // 生成的dll.js路径，我是存在/build/dev中
        filename: '[name].dll.js', // 生成的文件名字
        library: '[name]_library'  // 生成文件的一些映射关系，与下面DllPlugin中配置对应
    },
    plugins: [
        // 使用DllPlugin插件编译上面配置的NPM包
        new webpack.DllPlugin({
            // 会生成一个json文件，里面是关于dll.js的一些配置信息
            path: path.join(__dirname, 'build', 'dev', '[name]-manifest.json'),
            name: '[name]_library' // 与上面output中配置对应
        }),
        new webpack.optimize.UglifyJsPlugin()
    ]
};