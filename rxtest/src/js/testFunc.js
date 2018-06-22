
// Object的每个实例都具有下列属性和方法
// constructor： 保存着用于创建当前对象的函数
// hasOwnProperty(propertyName) // 用于检查给定的属性是否在当前对象的实例中（而不是在实例的原型中）
// p.isPrototypeOf(o) // 用于检查p是否是o的原型
var uniqueInteger = (function () {
    var counter = 0;
    return function () { return counter++; }
}())()
// console.log(uniqueInteger)
function test(a, b) {
   // console.log(arguments.length, 'length')
    // arguments.callee不能在严格模式下工作
    //  console.log(arguments.callee.length,'length') // 应该传入的个数
}
test(1)
// console.log(Object.prototype.toString.call([1, 2, 3]))
// 函数的prototype属性
// 每一个函数都包含一个prototype属性，这个属性是指向一个对象的引用，这个对象称为"原型对象"。每一个函数都包含不同的原型对象，当将函数用作构造函数的时候，新创建的对象会从原型对象上继承属性

Function.prototype.call = function (context) {
    var context = context || window;
    context.fn = this; //实例
    var args = [];
    for (var i = 1; i < arguments.length; i++) {
        args.push('arguments[' + i + ']');
    }
    var result = eval('context.fn(' + args + ')');
    delete context.fn;
    return result;
}
var ul = document.getElementById('testUl');
var lis = ul.getElementsByTagName('li');
// console.log(lis);
var a = Array.prototype.slice.call(lis); // 类数组lis上面没有数组的slice方法 所以借助call方法可以将函数设为lis上的属性
// console.log(a)
function add(c, d) {
    return this.a + this.b + c + d
}
var o = { a: 1, b: 3 }
var c = add.call(o, 5, 7) // 16
// console.log(c)

Function.prototype.call = function(context) {
    var context = context || window;
    var args = [];
    context.fn = this;
    for(var i = 1; i < arguments.length; i++) {
        args.push('arguments['+i+']');
    }
    var result = eval('context.fn('+args+')');
    delete context.fn;
    return result;
}

function f(y) {return this.x + y;}
var o = {x:1};
var g = f.bind(o,3);
// console.log(g)
// console.log(g(2),333);

// 函数式编程 
// 1. 应用数组的方法
// 2. 高阶函数（操作函数的函数，接收一个或多个函数作为参数，并返回一个新函数）


// 对象具有属性__proto__,指向构造该对象的构造函数的原型，这也保证了实例能够访问构造函数原型中定义的属性和方法
// 方法除了和其他对象一样有上述__proto__属性之外，还有自己特有的属性，原型属性（prototype）,这个属性是一个指针，指向一个对象，这个对象的用途就是包含所有实例共享的属性和方法（我们把这个对象叫做原型对象），原型对象也有一个属性，叫做constructor，这个属性包含了一个指针，指回原构造函数
