

import { UI } from '../../js/common/ui';
import { http } from '../../js/utils/http.util';
import { Subject } from 'rxjs/Subject';
import { appModel } from '../../js/common/app-model';
import { UPLOAD } from '../../js/common/app-enum';

let $ = require('jquery');
let dom = require('./component.template');

const component = {
    dom: null,
    tplList: [],
    messager: null,
    tplId: null,
    imageContainer: null,
    images: [],
};

component.show = function (opts) {
    if (!this.dom) {
        $('body').append(dom);
        this.dom = dom;
        this.imageContainer = this.dom.find('#ticket-result-uploader-image-container');
        this.bind();
    }

    // 显示提示的内容
    this.dom.find('#ticket-result-uploader-tips').html(opts.content);

    // 清空图片
    this.images = [];
    this.imageContainer.find('.ticket-result-uploader-image').remove();

    this.tplType = opts.tplType;
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

    this.dom.find('#ticket-result-uploader-button').click(function () {
        _this.dom.find("#ticket-result-uploader-input").click();
    })

    _this.dom.find("#ticket-result-uploader-input").change(function (e) {

        let file = e.target.files[0];

        if (!file) {
            return false;
        }

        if (!/[jpg|jpeg|png|gif]/.test(file.type)) {
            UI.Notification.warn('只允许上传图片文件');
        }

        http.uploadFile(file).subscribe(res => {
            if (res.code === 200) {

                let img = `
                <div class="ticket-result-uploader-image">
                    <div>
                        <img src="http://01.imgmini.eastday.com/mobile/20180226/20180226153857_3ea31b47f0e3c7b3bfd998cd329bd19f_1.jpeg">
                    </div>
                    <span class="ticket-result-uploader-image-close"><i class="iconfont">&#xe60f;</i></span>
                </div>`

                _this.dom.find('#ticket-result-uploader-button').before(img);
                _this.images.push(res.body);

            }
        })
    })

    _this.imageContainer.delegate('.ticket-result-uploader-image-close', 'click', function(){
        let index = $(this).index('.ticket-result-uploader-image-close');
        
        _this.images.splice(index, 1);
        $(this).parent().remove();
    })
}

// 保存
component.save = function () {

    if(this.images.length === 0){
        UI.Notification.warn('请上传至少一张图片');
        return false;
    }

    this.messager.next({
        value: this.images,
    })

    this.dom.fadeOut(200);
}


exports.TicketResultUploader = component;