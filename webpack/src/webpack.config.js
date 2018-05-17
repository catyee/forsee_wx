let path = require('path');
let webpack = require('webpack');
module.exports = {
	entry: { // pagesDir是前面准备好的入口文件集合目录的路径
		'alert/index': path.resolve(__dirname, `./alert/index/page`),
		'index/login': path.resolve(__dirname, `./index/login/page`),
		'index/index': path.resolve(__dirname, `./index/index/page`),
	},
	output: {

		// path参数表示生成文件的根目录，需要传入一个绝对路径。
		// path参数和后面的filename参数共同组成入口文件的完整路径

		path: path.resolve(__dirname, './build'),

		// publicPath参数表示的是一个URL路径（插入到html中静态文件的路径）

		publicPath: '../../../build/',

		// [name]表示entry每一项的key，用以批量指定生成文件后的名称
		// [hash] 指代本次编译的一个hash版本，只要在同一次编译过程中生成的文件，这个[hash]的值就是一样的，在缓存的层面来说，相当于一次全量的替换
		// [chunkhash] 指代的是当前chunk的一个hash版本，也就是说在同一次编译中，每一个chunk的hash都是不一样的，而在两次编译中，如果某个chunk根本没有发生变化，那么该chunkhash也就不会发生变化，这在缓存的层面上来说，就是把缓存的粒度精细到某个chuank，只要chunk不变，该chunk的浏览器缓存就可以继续使用

		filename: '[name]/entry.js',

		// chunkFilename参数指定的是除入口文件外的chunk（这些chunk通常是由于webpack对代码的优化产生的）

		chunkFilename: '[id].bundle.js'
	},
	module: {
		rules: [{
			test: /\.js$/,
		},

		]
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			name: 'commons', // 包含公共代码的chunk命名(唯一标识)
			filename: '[name].bundle.js', // 如何命名打包后生成的js文件
			minChunks: 4, // 公共代码的判断标准，某个js模块被多少chunk加载了才算公共代码
			chunks: '', // 表示需要在哪些chunk（也可以理解为webpack配置中entry的每一项）里寻找公共代码进行打包，不设置此参数则默认提取范围为所有的chunk
		}),

		// 当webpack加载到某个js模块时，出现了未定义且名称符合（字符串完全匹配）配置中的key的变量时，会自动require配置中value所指定的js模块

		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			'window.jQuery': 'jquery',
			'window.$': 'jquery'
		})
	]
};
