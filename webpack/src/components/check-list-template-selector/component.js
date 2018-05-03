
let $ = require('jquery');
let dom = require('./component.template');

import { UI } from '../../js/common/ui';
import { http } from '../../js/utils/http.util';
import { CHECK_TYPE } from '../../js/common/app-enum';
import { helper } from './helper';
import { Subject } from 'rxjs/Subject';

const component = {
    dom: null,
    tplListSelector: null,
    tplList: [],
    messager: null,
};

component.show = function(opts){
    if(!this.dom){
        $('body').append(dom);
        this.dom = dom;
        this.tplListSelector = new UI.Selector('tpl-selector', []);
        this.initTplList();
        this.bind();
    }else{
        this.tplListSelector.set(0);
        this.display(0);
    }
    this.dom.fadeIn(200);

    return this.messager = new Subject();
}

// 事件绑定
component.bind = function(){
    let _this = this;
    this.dom.find('.selector-close').click(() => {
        this.dom.fadeOut(200);
    })

    this.dom.find('.selector-tab').click(function(){
        let index = _this.dom.find('.selector-tab').index(this);

        _this.dom.find('.selector-tab').removeClass('active');
        $(this).addClass('active');

        _this.dom.find('.selector-tab-panel').removeClass('active');
        _this.dom.find('.selector-tab-panel:eq('+index+')').addClass('active');
    })

    this.dom.find('#save').click(function(){
        _this.save();
    })

    this.tplListSelector.change(function(data){
        _this.display(data.value);
    })
}

// 初始化巡检模板选择器
component.initTplList = function(){

    http.get('/ems/rest/xj/tpl/list',{}).subscribe( res => {
        if(res.code === 200){

            this.tplList = res.body;

            const items = [];

            const _items = this.tplList;
            const length = _items.length;

            for(let i=0; i<length; i++){
                items.push({
                    value: i,
                    content: _items[i].tplName
                })
            }

           this.tplListSelector.update(items, 0);
           const index = this.tplListSelector.selected;
           this.display(index);
        }
    })
    
}

// 选中一个模板 展示其内容
component.display = function(index){
    const tpl = this.tplList[index];
    let dayHtml = '';
    let weekHtml = '';
    let monthHtml = '';

    const items = tpl.tplContent;
    const length = items.length;
    for(let i=0; i<length; i++){
        switch(items[i].checkType){
            case CHECK_TYPE.DAY: dayHtml += helper.createDayItem(i, items[i]); break;
            case CHECK_TYPE.WEEK: weekHtml += helper.createWeekItem(i, items[i]); break;
            case CHECK_TYPE.MONTH: monthHtml += helper.createMonthItem(i, items[i]); break;
        }
    }

    $("#selector-day-items").html(dayHtml);
    $("#selector-week-items").html(weekHtml);
    $("#selector-month-items").html(monthHtml);
}

// 保存
component.save = function(){

    const classify = {};
    const dayItems = [];
    const weekItems = [];
    const monthItems = [];
    // 从页面上找出被勾选的选项
    
    // 日检
    let inputs = this.dom.find('#selector-day-items input[type="checkbox"]:checked');
    let length = inputs.length;
    for( let i=0; i<length; i++){
        const itemName = $.trim($(inputs[i]).parent().parent().next().text());
        dayItems.push({
            checkType: CHECK_TYPE.DAY,
            checkItem: itemName,
            cycle: 1
        });
    }

    // 周检
    inputs = this.dom.find('#selector-week-items input[type="checkbox"]:checked');
    length = inputs.length;
    for( let i=0; i<length; i++){
        const itemName = $(inputs[i]).parent().parent().next().text();
        const cycle = $(inputs[i]).parent().parent().parent().find('select').val();
        weekItems.push({
            checkType: CHECK_TYPE.WEEK,
            checkItem: itemName,
            cycle: cycle
        });
    }

    // 月检
    inputs = this.dom.find('#selector-month-items input[type="checkbox"]:checked');
    length = inputs.length;
    for( let i=0; i<length; i++){
        const itemName = $(inputs[i]).parent().parent().next().text();
        const cycle = $(inputs[i]).parent().parent().parent().find('select').val();
        monthItems.push({
            checkType: CHECK_TYPE.MONTH,
            checkItem: itemName,
            cycle: cycle
        });
    }

    classify.weekItems = weekItems;
    classify.monthItems = monthItems;
    classify.dayItems = dayItems;
    this.messager.next(classify);
    this.dom.fadeOut(200);
}

exports.CheckListTemplateSelector = component;
