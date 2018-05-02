import { Subject, Observable } from 'rxjs/Rx';
import { Rx } from 'rxjs';
import { cookie } from '../utils/cookie.util'

const basePath = 'http://api.dianwutong.com';

const http = {};

/**
 * http post 请求
 * @param { string } url 
 * @param { json } param 
 */

http.post = function (url, param) {

	// 不传路径的话 直接返回 

	if (!url) {
		return Observable.create(ob => {
			throw new Error('路径不合法');
			ob.next({
				code: 404
			});
		});
	}

	url = basePath + url;
	param = param ? param : {};

	// 如果有查找到token 在url中加入token
	const token = cookie.get('token');

	if (token) {
		url = url + '?token=' + token;
	}

	return Observable.ajax({
		url: url,
		method: 'POST',
		crossDomain: true,
		withCredentials: true,
		headers: {
			'Content-Type': 'application/json'
		},
		body: param
	}).map(e => {
		return e.response;
	})

};

http.get = function (url, param) {

	// 不传路径的话 直接返回 

	if (!url) {
		return Observable.create(ob => {
			throw new Error('路径不合法');
			ob.next({
				code: 404
			});
		});
	}

	let observable = new Subject();
	url = basePath + url;

	// 如果参数不为空 将参数拼接到url后面

	let queries = [];

	// 如果已经登录 传入token

	let token = cookie.get('token');

	if (token) {
		queries.push('token=' + token);
	}

	if (param) {
		for (var i in param) {
			if (param.hasOwnProperty(i)) {
				queries.push(i + '=' + param[i]);
			}
		}
	}

	let queryString = queries.join('&');

	if (queryString) {
		url = url + '?' + queryString;
	}

	return Observable.ajax({
		url: url,
		method: 'GET',
		crossDomain: true
	}).map(e => {
		return e.response;
	})

};

http.delete = function (url, param) {

	// 不传路径的话 直接返回 

	if (!url) {
		return Observable.create(ob => {
			throw new Error('路径不合法');
			ob.next({
				code: 404
			});
		});
	}

	let observable = new Subject();
	url = basePath + url;

	// 如果参数不为空 将参数拼接到url后面

	let queries = [];

	// 如果已经登录 传入token

	let token = cookie.get('token');

	if (token) {
		queries.push('token=' + token);
	}

	if (param) {
		for (var i in param) {
			if (param.hasOwnProperty(i)) {
				queries.push(i + '=' + param[i]);
			}
		}
	}

	let queryString = queries.join('&');

	if (queryString) {
		url = url + '?' + queryString;
	}

	return Observable.ajax({
		url: url,
		method: 'DELETE',
		crossDomain: true
	}).map(e => {
		return e.response;
	})

};


/**
 * http post 请求
 * @param { string } url 
 * @param { json } param 
 */

http.put = function (url, param) {

	// 不传路径的话 直接返回 

	if (!url) {
		return Observable.create(ob => {
			throw new Error('路径不合法');
			ob.next({
				code: 404
			});
		});
	}

	url = basePath + url;

	// 如果有查找到token 在url中加入token
	// TODO

	// 如果有查找到token 在url中加入token
	const token = cookie.get('token');

	if (token) {
		url = url + '?token=' + token;
	}

	param = param ? param : {};

	return Observable.ajax({
		url: url,
		method: 'PUT',
		crossDomain: true,
		headers: {
			'Content-Type': 'application/json'
		},
		body: param
	}).map(e => {
		return e.response;
	})

	return observable;
};

http.uploadFile = function (file, path, data) {
	var form = new FormData();

	var fileName = file.name;

	form.append('file', file, fileName);
	if (data) {
		for (let key in data) {
			if (data.hasOwnProperty(key)) {
				form.append(key, data[key]);
			}
		}
	}

	let url = basePath + '/ems/rest/common/file/upload';

	if (path) {
		url = basePath + path;
	}

	const token = cookie.get('token');

	if (token) {
		url = url + '?token=' + token;
	}

	var param = {
		url: url,
		method: 'POST',
		contentType: 'application/json;charset=utf-8',
		body: form
	};
	return Observable.ajax(param).map(function (res) {
		if (res.status == 200) {
			return res.response;
		}
	});
};

exports.http = http;