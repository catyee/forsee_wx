function Promise(fn) {
    var state = 'pending',
        value = null,
        callbacks = [];
    this.then = function (onFulfilled) {
        if (state === 'pending') {
            console.log('pending')
            callbacks.push(onFulfilled);
            return this;
        }
        onFulfilled(value);
        return this;
    }
    function resolve(newValue) {
        // reslove 执行时，会将状态设置为fulfiled，在此之后调用then添加的回调，都会立即执行。
        value = newValue;
        state = 'fulfiled';
        window.setTimeout(function () {
            callbacks.forEach(function (callback) {
                callback(value);
            })
        }, 0)
    }
    fn(resolve)
}
new Promise(function (resolve) {
    window.setTimeout(function() {
        resolve(1)
    },0)
}).then(function (res) {
    console.log(res)
}).then(function (res) {
    console.log(res + 10)
}).then(function(res) {
    window.setTimeout(function() {
        console.log(res + 100)
    })
})