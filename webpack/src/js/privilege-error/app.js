require('../../scss/common/common.scss');
let $ = require('jquery');
import{ cookie } from '../utils/cookie.util';
import{ ROLES } from '../common/app-enum';
import{ UI } from '../common/ui';
import{ http } from '../utils/http.util';

let token = cookie.get('token');
let userType = cookie.get('userType');

$(function(){
    if (token == undefined) {
        let from = location.href;
        window.location.href = 'http://account.dianwutong.com/login.html?from=' + from;
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
    
        // 用户名
        if(cookie.get('employeeName') != undefined){
            $("#user-name").text(decodeURI(cookie.get('employeeName')));
        }
    
        for (let i = 0; i < length; i++) {
            if (currentRole == userEmsRoles[i]) {
                $("#my-role").after(`<li data-id="${userEmsRoles[i]}" class="role active">${roleMames[userEmsRoles[i]]}</li>`);
            } else {
                $("#my-role").after(`<li data-id="${userEmsRoles[i]}" class="role ">${roleMames[userEmsRoles[i]]}</li>`);
            }
        }

        if(!length){
            $("#my-role").after('<li>（无）</li>');
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
                            window.location.href = 'http://account.test.dianwutong.com/login.html';
                        }
                    })
                }
            })
        })
    }
})
