function Promise(fn) {
    var state = 'pending',
        value = null,
        callbacks = [];
    this.then = function (onFulfilled) {
        return new Promise(function(resolve) {
            handle({
                onFulfilled: onFulfilled || null,
                handle: resolve
            })
        });
    };
    function handle(callback) {
        if(state === 'pending') {
            callbacks.push(callback);
            return;
        }
        // 如果then中没有传递任何东西
        if(!callback.onFulfilled){
            callback.resolve(value);
            return;
        }
        var ret = callback.onFulfilled(value);
        callback.resolve(ret);
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
