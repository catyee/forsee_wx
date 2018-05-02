
let $ = require('jquery');
let dom = require('./component.template');

import { UI } from '../../js/common/ui';
import { htto } from '../../js/utils/http.util';
import { helper } from './helper';
import { CHECK_TYPE } from '../../js/common/app-enum';
import { Subject } from 'rxjs/Subject';

const component = {
    dom: null,
    currentTab: 0,
    classify: {},
    messager: null
};

component.show = function (classify) {
    if (!this.dom) {
        $('body').append(dom);
        this.dom = dom;
        this.bind();
    }

    // 如果传入classify 表示编辑
    if (classify) {
        $("#editor-classify-name").val(classify.categoryName);
        this.classify = this.filter(classify);
    } else {
        this.classify = {
            categoryId: null,
            categoryName: null,
            dayItems: [],
            weekItems: [],
            monthItems: []
        }
    }

    // 更新页面内容
    this.update();

    // 显示模板对话框
    this.dom.fadeIn(200);

    return this.messager = new Subject();
}

// 将巡检项目分类
component.filter = function(classify){
    const items = classify.routineItems;
    const length = items.length;
    const dayItems = [];
    const weekItems = [];
    const monthItems = [];

    for(let i=0; i<length; i++){
        if(items[i].checkType === CHECK_TYPE.DAY){
            dayItems.push(items[i]);
        }else if(items[i].checkType === CHECK_TYPE.WEEK){
            weekItems.push(items[i]);
        }else{ 
            monthItems.push(items[i]);
        }
    }

    classify.dayItems = dayItems;
    classify.weekItems = weekItems;
    classify.monthItems = monthItems;

    return classify;
}

// 事件绑定
component.bind = function () {
    let _this = this;
    this.dom.find('.selector-close').click(() => {
        this.dom.fadeOut(200);
    })

    // 切换tab
    this.dom.find('.selector-tab').click(function () {
        let index = _this.dom.find('.selector-tab').index(this);

        _this.dom.find('.selector-tab').removeClass('active');
        $(this).addClass('active');

        _this.dom.find('.selector-tab-panel').removeClass('active');
        _this.dom.find('.selector-tab-panel:eq(' + index + ')').addClass('active');

        _this.currentTab = index;
    })

    // 添加一个巡检项
    this.dom.find("#editor-add-item").click(function () {
        _this.addItem();
    })

    // 保存分类
    this.dom.find('#save').click(function () {
        _this.save();
    })

    // 删除巡检项
    this.dom.find("#editor-day-items").delegate('.editor-remove-item', 'click', function(){
        const index = $(this).data('index');
        _this.classify.dayItems.splice(index, 1);
        _this.updateDayItems();
    })

    this.dom.find("#editor-week-items").delegate('.editor-remove-item', 'click', function(){
        const index = $(this).data('index');
        _this.classify.weekItems.splice(index, 1);
        _this.updateWeekItems();
    })

    this.dom.find("#editor-month-items").delegate('.editor-remove-item', 'click', function(){
        const index = $(this).data('index');
        _this.classify.monthItems.splice(index, 1);
        _this.updateMonthItems();
    })

    // 修改了巡检日期
    this.dom.find("#editor-week-items").delegate('.editor-cycle', 'change', function(){
        const index = $(this).data('index');
        const cycle = $(this).val();
        _this.classify.weekItems[index].cycle = cycle;
    })

    this.dom.find("#editor-month-items").delegate('.editor-cycle', 'change', function(){
        const index = $(this).data('index');
        const cycle = $(this).val();
        _this.classify.monthItems[index].cycle = cycle;
    })
}

// 更新页面内容
component.update = function () {
    this.updateDayItems();
    this.updateWeekItems();
    this.updateMonthItems();
}

// 更新日检项目
component.updateDayItems = function () {
    const items = this.classify.dayItems;
    const length = items.length;

    let html = '';

    for (let i = 0; i < length; i++) {
        html += helper.createDayItem(i, items[i]);
    }

    $("#editor-day-items").html(html);
}

// 更新周检项目
component.updateWeekItems = function () {
    const items = this.classify.weekItems;
    const length = items.length;

    let html = '';

    for (let i = 0; i < length; i++) {
        html += helper.createWeekItem(i, items[i]);
    }

    $("#editor-week-items").html(html);
}

// 更新周检项目
component.updateMonthItems = function () {
    const items = this.classify.monthItems;
    const length = items.length;

    let html = '';

    for (let i = 0; i < length; i++) {
        html += helper.createMonthItem(i, items[i]);
    }

    $("#editor-month-items").html(html);
}

// 新增一个巡检项
component.addItem = function() {

    const itemNameInput = this.dom.find("#editor-new-item")
    let itemName = itemNameInput.val();

    if(!itemName){
        return false;
    }

    if(this.currentTab === 0){
        this.classify.dayItems.push({
            checkItem: itemName,
            checkType: CHECK_TYPE.DAY,
            cycle: 1
        })
        this.updateDayItems();
    }else if(this.currentTab === 1){
        this.classify.weekItems.push({
            checkItem: itemName,
            checkType: CHECK_TYPE.WEEK,
            cycle: 1
        })
        this.updateWeekItems();
    }else{
        this.classify.monthItems.push({
            checkItem: itemName,
            checkType: CHECK_TYPE.MONTH,
            cycle: 1
        })
        this.updateMonthItems();
    }

    itemNameInput.val('');

}

// 保存
component.save = function(){
    const classifyName = this.dom.find('#editor-classify-name').val();
    if(!classifyName){
        UI.Notification.warn('请填写分类名称');
        return false;
    }

    this.classify.categoryName = classifyName;

    this.messager.next(this.classify);
    this.dom.fadeOut(200);
}

exports.CheckListClassifyEditor = component;
