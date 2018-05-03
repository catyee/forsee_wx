const appUtil = {}

/**
 * 判断当前浏览器是否是IE浏览器
 */
appUtil.isIE = function(){
    var UA = navigator.userAgent;
	if(/Trident/i.test(UA)){
		if(/MSIE (\d{1,})/i.test(UA)){
			return RegExp.$1;
		}else if(/rv:(\d{1,})/i.test(UA)){
			return RegExp.$1;
		}else{
			return false;
		}
	}else{
		return false;
	}
}

/***
 * 对字符串加密
 * @param str
 * @returns {string}
 */

appUtil.encodeString = function(str){
	var length = str.length;
	var code = '';

	for(var i = 0; i < length; i++){
		console.log(((+i)+(+str.charAt(i))));
		code += String.fromCharCode(str.charCodeAt(i)+(i-length));
	}
	return code;
};

/***
 * encodeString的逆序操作
 * @param code
 * @returns {string}
 */

appUtil.decodeString = function(code){
	var length = code.length;
	var str = '';

	for(var i = 0; i < length; i++){
		str += String.fromCharCode(code.charCodeAt(i)-(i-length));
	}
	return str;
};

/***
 * 从url上获取一个参数
 * @param name
 * @returns {*}
 */

appUtil.getParameter = function (name) {
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
	var r = window.location.search.substr(1).match(reg);
	if (r != null)return RegExp.$2;
	return null;
};

/***
 * 格式化数据
 * 如果数据为null 默认为0
 * 如果不为0 取小数点后2位
 */
appUtil.formatData = function (number, fixed) {
    if (!number) {
        return 0;
    }
    if (typeof fixed == "undefined") {
        fixed = 2;
    }
    number = parseFloat(number);
    return number.toFixed(fixed);

}

exports.appUtil = appUtil;