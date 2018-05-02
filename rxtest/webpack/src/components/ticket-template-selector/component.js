

import { UI } from '../../js/common/ui';
import { http } from '../../js/utils/http.util';
import { Subject } from 'rxjs/Subject';
import { appModel } from '../../js/common/app-model';

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

component.show = function(opts){
    if(!this.dom){
        $('body').append(dom);
        this.dom = dom;
        this.selector = new UI.Selector("ticket-template-selector-select");
        this.bind();
    }

    // 显示提示的内容
    this.dom.find('#ticket-template-selector-tips').html(opts.content);

    this.tplType = opts.tplType;

    this.renderTplList();

    this.dom.fadeIn(200);

    return this.messager = new Subject();
}

// 事件绑定
component.bind = function(){
    let _this = this;

    this.selector.change( data => {
        this.tplId = data.value;
    })

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
component.renderTplList = function(){
    appModel.getPrList().subscribe( list => {
        const length = list.length;
        const options = [];
        for(let i=0; i<length; i++){
            options.push({
                value: list[i].prId,
                content: list[i].prName
            })
        }

        const selected = options.length? options[0].value: null;
        this.prId = selected;
        this.selector.update(options, selected);
    })
}

// 保存
component.save = function(){
    this.messager.next({
        value: this.tplId,
    })

    this.dom.fadeOut(200);
}


exports.TicketTemplateSelector = component;