let fs = require('fs');
let path = require('path');

//------------------------------
// 读取src/js下的页面入口目录
// 除了common和lib外都是各个页面对应的目录
// 构建入口对象 以目录作为key 以 {{目录}}/app.js作为value
//------------------------------

let files = fs.readdirSync('./src/js');

let entry = {};
files.forEach((file) =>{

	if(file === 'common' || file ==='lib' || file ==='utils' ){
		return;
	}
	entry[file] = './src/js/'+file+'/app.js';
})

module.exports = entry;