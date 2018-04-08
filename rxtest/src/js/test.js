import { resolve } from 'url';

var Rx = require('rxjs/Rx');
console.log('test.html22222222')
let test = Rx.Observable.of(1,2,3);

function resolveAfter2Seconds(x) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(x);
        },2000)
    })
}

async function f1() {
   let x = await resolveAfter2Seconds(10)
//    console.log(x,'999');
}
f1();

async function f2() {
    var y = await 20;
    // console.log(y); // 20
  }
  f2();

let testArray = [1,2,3];
console.log(3 in testArray,'99999999999')

testArray.forEach((item,index) => {
    // console.log(item)
})

let newArray = testArray.map((item, index) => {
    return item = item+'test';
})
console.log(newArray)

let newTestFilter = testArray.filter(item => {
    return item == 2;
})
console.log(newTestFilter,'0000000')

const reduceArray = testArray.reduce((total,item) => {
    return total * item *2;
})
console.log(reduceArray,'zzzzzzzzzzz')
