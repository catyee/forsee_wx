// 数字转千分位 1233456 => 1,233,456
var num = 1233456;
function toThousands1(num) {
    var result = [],counter = 0;
    num = (num || 0).toString().split('');
    for (var i = num.length - 1; i >= 0; i--){
        counter++;
        result.unshift(num[i]);
        if (!(counter%3) && i != 0) {result.unshift(',')};
    }
    return result.join(''); // join方法用于把数组中的所有元素放入一个字符串，放入字符串后根据指定的字符来作为数组每一项的间隔，不传的话默认用','间隔
}
var res1 = toThousands1(num);

function toThousands2 (num) {
    var result = '',counter = 0;
    num = (num || 0).toString();
    for(var i = num.length-1;i >=0; i--){
        counter++;
        result= num.charAt(i)+result; // charAt(1) 返回指定位置的字符
        if(!(counter%3) && i!=0) {
            result = ','+ result;
        }
    }
    return result;
}
var res2 = toThousands2(num);

// 经常拿来主义，自己的脑子也就丢了，没有免费的午餐，看似方便免费的东西，无形中早已标好了价码。
function toThousands3(num) {
    var num = (num || 0).toString(),result = '';
    while(num.length > 3) {
        result = ','+ num.slice(-3) + result;
        num = num.slice(0,num.length-3);
    }
    return result;
}
var res3 = toThousands3(num);

function toThousands4(num) {
    var num = (num || 0).toString(),reg = /\d{3}$/,result = '';
    while(reg.test(num)) {
        result = RegExp.lastMatch + result;
        if (num!= RegExp.lastMatch) {
            result = ',' + result;
            num = RegExp.leftContext;
        }else {
            num = '';
            break;
        }
    }
    if (num) {
        result = num + result;
    }
    return result;
}

var res4 = toThousands4(num);
console.log(res4)

// 表单校验 必须包含8-10位数字和字母，且只能包含数字和字母






function checkInput(str) {
    var rangeChars = '09azAZ';
    var char0Code = rangeChars.charCodeAt(0),
        char9code = rangeChars.charCodeAt(1),
        charaCode = rangeChars.charCodeAt(2),
        charzCode = rangeChars.charCodeAt(3),
        charACode = rangeChars.charCodeAt(4),
        charZCode = rangeChars.charCodeAt(5);
    Array.from(str).every()
}

// 实现一个函数，输入一个数字，转换为对应金额的大写形式

function numberToChinese(num) {
    var unit = '千百拾亿千百拾万千百拾元角分', str = '';
    n += '00'
    var p = n.indexOf('.');
   
    if (p > 0)
        // substring 返回一个包含start索引不包含end索引的字符串
        // substr 返回一个从指定位置索引，指定长度的字符串 区别是此时第二个参数是长度
        n = n.substring(0,p) + n.substr(p+1,2);
        console.log(n,33333)
        var length = unit.length - n.length
        console.log(length)
        unit = unit.substr(length);
       

        for (var i=0; i < n.length; i++){
            str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
        }
        console.log(str, 'strstr')
        return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
}

var n = 112;
var re = numberToChinese(n);
console.log(re);


function Person() {
    this.name = 1;
}
var p1 = new Person();
Person.prototype.name = 2;
console.log(Person.prototype ,22222222222222)
console.log(p1.prototype === Object);
console.log(p1.__proto__ === Object)
console.log(p1.__proto__.__proto__ === Object.prototype)
var o = {
    name: 3
}

Person.prototype = o;
console.log(Person.prototype)
console.log(Person.prototype.isPrototypeOf(p1));
var p2 = new Person();
console.log(p2.constructor)
console.log(p2.constructor === Person)