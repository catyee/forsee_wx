// array func
var array = [33,11,22,33,13,3,1,6,8];
// 添加
array.push(1); // 尾部添加 返回新数组长度
array.unshift(2); // 首部添加 返回新数组长度
array.splice(1,0,3); // 在i后面添加

// 删除
array.pop(); // 尾部删除一个元素
array.unshift(); // 首部删除
array.splice(1,1); // 从指定位置删除指定数量个元素

// 截取

array.slice(1,2); // 截取数组，不包括end 返回截取数组 原数组不改变
array.concat([3,4]); // 将多个数组也可以是字符串，或者是数组和字符串的混合，连接成一个数组，返回连接好的新数组

// 数组拷贝
array.slice(0);
array.concat();

// 数组字符串化

array.join('.');

array.indexOf(10); // 搜索一个指定的元素的位置，不存在返回-1

array.toString(); // 转换为字符串并返回结果
array.lastIndexOf(1); // 与给定值相等的元素的最大索引

var array1 = [3,2,3];
var target = array1.reduce(function(total, current) {
    return total - current;
})
console.log(target)

var array2 = [8,0,1,3,4,1,9,10];
var a = array2.sort(function(a,b){
    return b - a;
})
console.log(a);

var array3 = [1,2,3,1,2,6,6,8,0,6,8];
function unique(array) {
    var newArray = [];
    var obj = {};
    for(var i = 0; i < array.length; i++) {
        var key = array[i];
        if (!obj[key]) {
            obj[key] = 1;
            newArray.push(key);
        }
    }
    return newArray;
}
console.log(unique(array));