let esTest = {
    init: {},
    testFun: {},
}
esTest.init = () => {
    esTest.testFun();
}

esTest.testFun = () => {
    // es7在es6基础上添加了三项内容 ： 求幂运算符（**），Array.prototype.includes() 方法，函数作用域中严格模式的变更。
    let includesTest = ['a', 'b', 'c'].includes('f'); // 查找一个值是不是在数组中 接收两个参数 第二个参数传入时，该方法会从索引处开始往后搜索（默认索引值是0）
    let testIndexof = ['aa', 'b', 'c'].indexOf('a')

    console.log(includesTest, 'testtesttest')
    console.log(testIndexof, 'indexof')

    // promise
    var promise = new Promise((resolve, reject) => {

    })

}

function foo() {
    var id = 21;
    setTimeout(function(){
        console.log('id',this.id); // undefined
    },100)
    // setTimeout(() => {
    //     console.log('id',this.id); // 42
    // },100)
    // setTimeout(function(){
    //     console.log('id',id); // 21
    // },100)
    setTimeout(() => {
        console.log('id',id); // 21
    },100)
}

foo.call({ id: 42 })

function timeout(ms) {
    return new Promise((resolve,reject) => {
        setTimeout(function() {
            resolve('ok')
        },ms,'done');
    })
}
timeout(100).then((value) => {
    console.log(value)
})

const testPromise = new Promise(function(resolve,reject) {

})

function* helloWorldGenerator() {
    yield 'hello';
    yield 'world';
    return 'ending';
}

var hw = helloWorldGenerator();
console.log(hw.next(),333)

function*demo() {
    console.log('hello'+ (yield));
    console.log('hello'+ (yield 123));
}
var a = demo();
a.next();
a.next();


esTest.init();
exports = module.exports = esTest;