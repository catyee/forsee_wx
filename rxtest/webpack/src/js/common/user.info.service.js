import { cookie } from '../utils/cookie.util';
import { ROLES } from './app-enum';
import { UI } from './ui'
import { http } from '../utils/http.util';
let $ = require('jquery');

if (!cookie.get('token')) {
	let from = location.href;
	window.location.href = 'http://account.dianwutong.com/login.html?from=' + from;
} else {

	// 检测该账号有没有登录EMS的权限
	let roles = cookie.get('roles');
	roles = roles.split('a');
	let emsRoles = [
		ROLES.QXBZ,
		ROLES.QXZZ,
		ROLES.XJZZ,
		ROLES.ZTZ,
		ROLES.ZBZ,
	]

	// 找出该账号能够登录EMS的角色
	const userEmsRoles = [];
	roles.map(role => {
		if (emsRoles.indexOf(role)) {
			userEmsRoles.push(role);
		}
	})


	// 如果没有登录 默认以第一个角色登录

	let currentRole = cookie.get('current_role');
	if (!currentRole) {
		currentRole = userEmsRoles[0];
		if (currentRole) {
			cookie.set('current_role', currentRole);
		} else {
			cookie.set('current_role', null, -1);
			window.location.href('privilege-error.html');
		}
	}

	// 把角色列表写入user panel
	let length = userEmsRoles.length;
	const roleMames = {};
	roleMames[ROLES.QXBZ] = '抢修班长';
	roleMames[ROLES.QXZZ] = '抢修组长';
	roleMames[ROLES.ZTZ] = '组团长';
	roleMames[ROLES.XJZZ] = '巡检组长';
	roleMames[ROLES.AQY] = '安全员';
	roleMames[ROLES.ZBZ] = '值班长';

	for (let i = 0; i < length; i++) {
		if (currentRole == userEmsRoles[i]) {
			$("#my-role").after(`<li data-id="${userEmsRoles[i]}" class="role active">${roleMames[userEmsRoles[i]]}</li>`);
		} else {
			$("#my-role").after(`<li data-id="${userEmsRoles[i]}" class="role ">${roleMames[userEmsRoles[i]]}</li>`);
		}
	}

	// 切换角色
	$(".role").click(function () {
		let roleId = $(this).data('id');
		cookie.set('current_role', roleId);
		window.location.href = "power-room-list.html";
	})

	// 退出登录
	$("#logout").click(function () {
		UI.confirm({
			tip: '确认要退出登录吗',
			rightBtnClick: function () {
				http.post('/admin/rest/user/logout', {}).subscribe( res => {
					if(res.code === 200){
						cookie.deleteAll();
						window.location.href = 'http://www.dianwutong.com';
					}
				})
			}
		})
	})

}

const userInfo = {
	token: cookie.get('token'),
	username: cookie.get('username'),
	roleId: cookie.get('current_role'),
	employeeName: cookie.get('employeeName'),
	employeeId: cookie.get('employeeId')
};

console.log(decodeURI(userInfo.employeeName));

exports.userInfo = userInfo;
