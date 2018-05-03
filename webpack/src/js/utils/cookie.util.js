const cookie = {}

cookie.get = function (key) {

    let reg = '('+key+')=(.*?)(;|$|;\s)';
    reg = new RegExp(reg);

    if(reg.test(document.cookie)){
        return RegExp.$2;
    }

    return;
}

/**
 * 设置一个cookie
 * @param {string} key 
 * @param {string} value 
 * @param {number} expires 
 * @param {string} path 
 */
cookie.set = function (key, value, expires, path) {
    
    let cookie = key + '=' + value;

    if(expires){
        const now = new Date();
        expires = now.setDate( now.getDate() + expires )
        cookie += ';expires='+ new Date(expires).toGMTString();
    }

    if(path){
        cookie += ';path='+escape(path);
    }

    document.cookie = cookie;
}

cookie.delete = function (key, path) {
    cookie.set(key, null, -1, path);
}

cookie.deleteAll = function () {
    let cookies = document.cookie.replace(/\s/, '').split(';');

    for( let i=0; i<cookies.length; i++){
        let pairs = cookies[i].split('=');
        if(pairs && pairs[0]){
            cookie.delete(pairs[0]);
        }
    }
}

exports.cookie = cookie;