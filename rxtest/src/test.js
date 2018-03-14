import { resolve } from 'url';

var Rx = require('rxjs/Rx');

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
   console.log(x,'999');
}
f1();

async function f2() {
    var y = await 20;
    console.log(y); // 20
  }
  f2();