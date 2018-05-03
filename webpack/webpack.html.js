let fs = require('fs');
let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let HtmlWebpackLayoutPlugin = require('html-webpack-layout-plugin');

//------------------------------
// 读取src/js下的页面入口目录
// 除了common和lib外都是各个页面对应的目录
// 构建HtmlWebpackPlugin对象以创建页面
// 其中页面filename为{{目录名称}}.html
// 页面模板为src/view/{{目录名称}}.html
// 页面的chunks只有一个，就是[{{目录名称}}]
//------------------------------

let files = fs.readdirSync('./src/js');

let plugins = [];

// 配电室基本信息
const prBaseInfoLayoutPages = [
    'pr-material',
    'pr-inspection-log',
    'pr-repair-log',
    'pr-check-list'
]

// 不需要模板的页面
const purePage = [
    'privilege-error',
    '404',
    'login'
]

files.forEach((file) => {

    if (file === 'common' || file === 'lib' || file === 'utils') {
        return;
    }

    if(!/warning/.test(file)){
        return;
    }

    let filename = (file + '.html');

    let opts = {
        title: 'EMS-电务通',
        inject: 'head',
        filename: filename,
        template: ('./src/view/' + file + '.html'),
        chunksSortMode: 'manual',
        chunks: ['common', file]
    }

    if (purePage.indexOf(file) > -1) {

    } else if (prBaseInfoLayoutPages.indexOf(file) > -1) {

        opts.layout = ('./src/view/common/prBaseInfo-layout.html');

    } else {
        opts.layout = ('./src/view/common/layout.html')

    }

    plugins.push(new HtmlWebpackPlugin(opts));

})

plugins.push(new HtmlWebpackLayoutPlugin());

module.exports = plugins;