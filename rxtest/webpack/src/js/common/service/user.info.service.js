import { cookie } from '../../utils/cookie.util';
import { ROLES } from '../app-enum';
import { UI } from '../ui'
import { http } from '../../utils/http.util';
import { privilegeManager } from '../../common/privilege.manager';
let $ = require('jquery');

$(function () {
	let token = cookie.get('token');
	let userType = cookie.get('userType');
	if (token == undefined) {
		let from = location.href;
		window.location.href = 'http://account.dianwutong.com:8020/login.html?from=' + from;
	} else {

		// 检测该账号有没有登录EMS的权限
		let roles = cookie.get('roles');
		roles = roles ? roles.split('a') : [];
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
			role = parseInt(role);
			if (emsRoles.indexOf(role) !== -1) {
				userEmsRoles.push(role);
			}
		})

		// 如果没有角色可以登录 跳转的无权限页面
		if (!userEmsRoles.length) {
			window.location.href = 'privilege-error.html';
			return false;
		}

		// 如果没有登录
		// 或者不是以ems的角色登录的
		// 默认以第一个角色登录
		let currentRole = cookie.get('current_role');
		currentRole = parseInt(currentRole);
		if (!currentRole || userEmsRoles.indexOf(currentRole) === -1) {
			currentRole = userEmsRoles[0];
			if (currentRole) {
				cookie.set('current_role', currentRole);
			} else {
				cookie.set('current_role', null, -1);
				window.location.href('privilege-error.html');
			}
		}

		// 如果有权限登录改系统
		// 初始化页面的权限
		privilegeManager.init();

		// 把角色列表写入user panel
		let length = userEmsRoles.length;
		const roleMames = {};
		roleMames[ROLES.QXBZ] = '抢修班长';
		roleMames[ROLES.QXZZ] = '抢修组长';
		roleMames[ROLES.ZTZ] = '组团长';
		roleMames[ROLES.XJZZ] = '巡检组长';
		roleMames[ROLES.AQY] = '安全员';
		roleMames[ROLES.ZBZ] = '值班长';

		// 用户名
		$("#user-name").text(decodeURI(cookie.get('employeeName')));

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
					http.post('/admin/rest/user/logout', {}).subscribe(res => {
						if (res.code === 200) {
							cookie.deleteAll();
							window.location.href = 'http://account.dianwutong.com:8020/login.html';
						}
					})
				}
			})
		})
	}
})

const userInfo = {
	token: cookie.get('token'),
	username: cookie.get('username'),
	roleId: parseInt(cookie.get('current_role')),
	employeeName: decodeURI(cookie.get('employeeName')),
	employeeId: parseInt(cookie.get('employeeId'))
};

exports.userInfo = userInfo;
