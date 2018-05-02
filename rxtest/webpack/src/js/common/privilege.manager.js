import { ROLES } from './app-enum';
import { cookie } from '../utils/cookie.util';
let $ = require('jquery');

const privilegeManager = {
    init: {}
}

privilegeManager.init = function(){

    // 反转角色列表
    
    const roles = {};
    for(let key in ROLES){
        if(ROLES.hasOwnProperty(key)){
            roles[ROLES[key]] = key;
        }
    }
    
    // 当前角色
    let currentRole = cookie.get('current_role');
    let currentRoleName = roles[currentRole];

    // 检查角色是否可以访问该页面
    if($("#page-privilege").length){
        let privilege = $("#page-privilege").val();
        if(privilege.indexOf(currentRoleName) === -1){
            window.location.href = 'privilege-error.html'
        }
    }

    // 找到所有需要做权限处理的dom节点
    let doms = $('*[privilege]');
    let length = doms.length;
    
    for(let i=0; i<length; i++){
    
        let dom = $(doms[i]);
        let privileges = dom.attr('privilege');
    
        if(privileges.indexOf(currentRoleName) === -1){
            dom.remove();
        }else{
            
        }
    }
}

exports.privilegeManager = privilegeManager;