

import { UI } from '../../js/common/ui';
import { http } from '../../js/utils/http.util';
import { Subject } from 'rxjs/Subject';
import { appModel } from '../../js/common/app-model';

let $ = require('jquery');
let dom = require('./component.template');

const component = {
    dom: null,
    prListSelector: null,
    tplList: [],
    messager: null,
    needSelectPr: null,
    prId: null
};

component.show = function(opts){
    if(!this.dom){
        $('body').append(dom);
        this.dom = dom;
        this.bind();
    }else{
    }
    const prLine = $("#create-repair-order-pr-select-line");

    this.renderPrList();
    if(!opts || !opts.prId){
        this.needSelectPr = true;
        this.prId = null;
        prLine.show();
    }else{
        prLine.hide();
        this.needSelectPr = false;
        this.prId = opts.prId;
    }

    this.dom.find("#create-repair-order-bug-desc").val(opts.content);

    this.dom.fadeIn(200);
    return this.messager = new Subject();
}

// 事件绑定
component.bind = function(){
    let _this = this;

    this.dom.find('.dialog-close').click(() => {
        this.dom.fadeOut(200);
    })

    this.dom.find('#cancel').click(() => {
        this.dom.fadeOut(200);
    })

    this.dom.find('#save').click(function(){
        _this.save();
    })
}

// 渲染配电室列表 
component.renderPrList = function(){
    appModel.getPrList().subscribe( list => {
        const length = list.length;
        const options = [];
        for(let i=0; i<length; i++){
            options.push({
                value: list[i].prId,
                content: list[i].prName
            })
        }

        if(!this.prListSelector){
            this.prListSelector = new UI.Selector("create-repair-order-pr-select");
        }

        const selected = options.length? options[0].value: null;
        this.prListSelector.update(options, selected);
    })
}

// 保存
component.save = function(){

    let prId = null;
    let content = null;
    if(this.needSelectPr){
        prId = this.prListSelector.selected;
    }else{
        prId = this.prId;
    }

    content = this.dom.find("#create-repair-order-bug-desc").val();

    if(!prId){
        UI.Notification.warn('请选择配电室');
        return false;
    }

    if(!content){
        UI.Notification.warn('请填写问题描述');
        return false;
    }

    this.messager.next({
        prId: prId,
        content: content
    })

    this.dom.fadeOut(200);
    
}

exports.RepairOrderCreator = component;
