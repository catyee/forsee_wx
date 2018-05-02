

import { UI } from '../../js/common/ui';
import { http } from '../../js/utils/http.util';
import { Subject } from 'rxjs/Subject';
import { appModel } from '../../js/common/app-model';
import { ROLES } from '../../js/common/app-enum';

let $ = require('jquery');
let dom = require('./component.template');

const component = {
    dom: null,
    selector: null,
    tplList: [],
    messager: null,
    tplId: null,

    tplType: null,
    tplTypes: {
        oper: 1,    //操作票
        work: 2     //工作票
    }
};

component.show = function (opts) {
    if (!this.dom) {
        $('body').append(dom);
        this.dom = dom;
        this.bind();
    }

    // 显示提示的内容
    this.dom.find('#repair-grouper-selector-tips').html(opts.content);

    this.groupList = opts.groupList ? opts.groupList : [];

    this.renderGroupList();

    this.dom.fadeIn(200);

    return this.messager = new Subject();
}

// 事件绑定
component.bind = function () {
    let _this = this;

    this.dom.find('.dialog-close').click(() => {
        this.dom.fadeOut(200);
    })

    this.dom.find('#cancel').click(() => {
        this.dom.fadeOut(200);
    })

    this.dom.find('#save').click(function () {
        _this.save();
    })

    this.dom.find('#rapair-grouper-list').delegate('.employee-item', 'click', function(e){
        $(this).find('input').attr('checked', 'checked');
        
    })
}

// 渲染配电室列表 
component.renderGroupList = function () {
    const list = this.groupList;
    const length = list.length;
    const table = this.dom.find('#repair-grouper-selector-table')
    const container = this.dom.find('#rapair-grouper-list');
    const emptyTips = this.dom.find('#repair-grouper-selector-empty-tips');
    let html = '';
    for (let i = 0; i < length; i++) {
        const item = list[i];
        html += `
                <tr class="employee-item">
                    <td>
                        <div class="radio-group">
                            <input type="radio" name="repair-group" id="repair-group-${i}" value="${item.employeeId}">
                            <label for="repair-group-${i}"></label>
                        </div>
                    </td>
                    <td>${item.employeeName}</td>
                    <td>${item.roleId === ROLES.XJZZ ? '<span style="color:#03b679">巡检组</span>' : '<span style="color:#e9be2b">抢修组</span>'}</td>
                    <td>${item.mobile}</td>
                </tr>
            `;
    }

    container.html(html);

    if (length) {
        table.show();
        emptyTips.hide();
    } else {
        emptyTips.show();
        table.hide();
    }
}

// 保存
component.save = function () {

    let groupId = this.dom.find('[type="radio"]:checked').val();

    const error = this.dom.find('#repair-grouper-selector-error');
    if (!groupId) {
        error.show();
        return false;
    } else {
        error.hide();
    }

    this.messager.next({
        value: groupId,
    })

    this.dom.fadeOut(200);
}


exports.RepairGroupSelector = component;