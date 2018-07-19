// async function forDemo() {
//     let arr = [1,2,3,4,5];
//     for(let i = 0; i < arr.length; i ++) {
//         let res = await arr[i];
//         console.log(res)
//     }
//     // arr.forEach(item => {
//     //     let res = (await item);
//     //     console.log(item)
//     // })
// }
// forDemo();
// new Promise(function (resolve) {
//     window.setTimeout(function() {
//         resolve(1)
//     },0)
// }).then(function (res) {
//     console.log(res)
// }).then(function (res) {
//     console.log(res + 10)
// }).then(function(res) {
//     window.setTimeout(function() {
//         console.log(res + 100)
//     })
// })

const sleep = (i,time) => {
    return new Promise((resolve,reject) => {
        setTimeout(() => {
            console.log(new Date,i);
            resolve();
        },time)
    })
};
(async () => {
    for(var i = 0; i < 5; i ++){
        await sleep(i,1000); // 等待Promise状态resolve 等待promise执行完毕再执行
    }
    await sleep(i,1000);
})()

// const sleep = (time) => new Promise((resolve) => {
//     setTimeout(resolve, time);
// });

// (async () => {
//     for(var i = 0; i < 5; i++) {
//         await sleep(1000);
//         console.log(new Date,i);
//     }
//     await sleep(1000);
//     console.log(new Date,i);
// })();

