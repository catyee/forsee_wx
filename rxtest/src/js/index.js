export default function() { // 可以通过import x from './a'; 导入 为模块指定输出，不需要知道所加载模块的变量名
    console.log('default function');
}
export  function testFunction() {
    // 导出的是名字为testFunction的函数 导入时名字不可改变
    // 通过import {testFunction} from './a' 导入 
    // 或者通过 let a = require('./a').testFunction; 导入
    console.log('testFunction')
}
// export 和export default 区别
// 1.export与export default均可用于导出常量、函数、文件、模块等
// 2.你可以在其它文件或模块中通过import+(常量 | 函数 | 文件 | 模块)名的方式，将其导入，以便能够对其进行使用
// 3.在一个文件或模块中，export、import可以有多个，export default仅有一个
// 4.通过export方式导出，在导入时要加{ }，export default则不需要
// 
console.log('index.html333333333333')

// cookie test
document.cookie = 'test=test222'
sessionStorage.setItem('test','1111111111111')
var $ = require('jquery')
var ctrl = {

}
ctrl.init = function() {
    ctrl.sum();
}
$(function() {
    ctrl.init();
})

ctrl.sum = function(num1,num2){
    console.log('success')
    return num1 + num2;
}
var a = 1;
function outer() {
    var a = 7;
    inner();
}
function inner() {
    console.log(this,333);
    console.log(arguments.callee.caller);

}


var number = 2;
var obj = {
    number: 4,
    fn1: (function () {
        this.number *= 2;
        console.log(this) // window
        number = number * 2;
        var number = 3;
        return function () {
            this.number *= 2;
            number *= 3;
            alert(number)
        }
    })(),
    db2: function () {
        this.number *= 2;
    }
}
var fn1 = obj.fn1;
alert(number)
fn1();
obj.fn1();
alert(window.number);
alert(obj.number)

outer();