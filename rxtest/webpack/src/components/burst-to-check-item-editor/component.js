
let $ = require('jquery');
let dom = require('./component.template');

import { UI } from '../../js/common/ui';
import { htto, http } from '../../js/utils/http.util';
import { CHECK_TYPE } from '../../js/common/app-enum';
import { Subject } from 'rxjs/Subject';

const component = {
    prId: null,
    dom: null,
    checkType: CHECK_TYPE.DAY,
    currentTab: 0,
    classify: {},
    messager: null
};

component.show = function (opts) {
    if (!this.dom) {
        $('body').append(dom);
        this.dom = dom;
        this.classifySelector = new UI.Selector('burst-to-check-item-editor-classify-select');
        this.weekSelector = new UI.Selector('burst-to-check-item-editor-week-selector');
        this.monSelector = new UI.Selector('burst-to-check-item-editor-month-selector');

        this.bind();
    }

    this.prId = opts.prId;
    this.dom.find('#editor-new-item').val(opts.content);

    // 更新页面内容
    this.init();

    // 显示模板对话框
    this.dom.fadeIn(200);

    return this.messager = new Subject();
}

// 事件绑定
component.bind = function () {
    let _this = this;

    this.dom.find('input[type="radio"]').change(function(){
        let type = $(this).val();
        _this.checkType = type;
        _this.dom.find('.check-date-selector').css('display', 'none');
        _this.dom.find('.check-date-selector:eq('+(type - 1)+')').css('display', 'inline-block');
    })

    // 保存
    _this.dom.find('#burst-to-check-item-editor-save').click(function(){
        _this.save();
    })

    // 关闭
    _this.dom.find(".editor-close").click(function(){
        _this.dom.fadeOut(200);
    })
}

component.init = function(){
    // 先获取巡检分类
    http.get('/ems/rest/xj/category/list', {
        prId: this.prId
    }).subscribe(res => {
        if(res.code === 200){
            let items = [];
            let list = res.body;
            let length = list.length;
            for(let i=0; i<length; i++){
                items.push({
                    value: list[i].categoryId,
                    content: list[i].categoryName
                })
            }
            this.classifySelector.update(items);
        }else{
            UI.Notification.warn('获取配电室巡检分类失败');
            this.dom.fadeOut();
        }
        
    })
}

// 保存
component.save = function(){
   
    let checkType = this.checkType;
    let checkDate = 1;

    if(checkType == CHECK_TYPE.WEEK){
        checkDate = this.weekSelector.selected;
    }else if(checkType == CHECK_TYPE.MONTH){
        checkDate = this.monSelector.selected;
    }

    if(!checkDate){
        UI.Notification.warn('请选择巡检日期');
        return false;
    }

    // 巡检分类
    let classify = this.classifySelector.selected;

    if(!classify){
        UI.Notification.warn('请选择巡检分类');
        return false;
    }

    // 巡检项名称
    let itemName = this.dom.find('#editor-new-item').val();
    if(!itemName){
        UI.Notification.warn('请填写巡检项名称');
        return false;
    }

    this.messager.next({
        checkType: checkType,
        checkDate: checkDate,
        classify: classify,
        itemName: itemName
    });
    this.dom.fadeOut(200);
}

exports.BurstToCheckItemEditor = component;
