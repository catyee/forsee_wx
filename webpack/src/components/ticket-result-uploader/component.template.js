
let $ = require('jquery');
require('./component.scss');
const html = `
    <div class="dialog ticket-result-uploader">
        <div class="dialog-content" style="width:800px;">
            <div class="dialog-header">
                <span>上传审核结果</span>
                <span class="dialog-close">×</span>
            </div>
            <div class="dialog-body">
                <div class="dialog-tip" id="ticket-result-uploader-tips"></div>
                <input type="file" id="ticket-result-uploader-input">
                <div class="dialog-line" id="ticket-result-uploader-image-container">
                    <div class="ticket-result-uploader-image">
                        <div>
                            <img src="http://01.imgmini.eastday.com/mobile/20180226/20180226153857_3ea31b47f0e3c7b3bfd998cd329bd19f_1.jpeg">
                        </div>
                        <span class="ticket-result-uploader-image-close"><i class="iconfont">&#xe60f;</i></span>
                    </div>
                    <div class="ticket-result-uploader-button" id="ticket-result-uploader-button">
                        +
                    </div>
                </div>
                <div class="height20"></div>
            </div>
            <div class="dialog-footer">
                <button class="ui-btn" id="cancel">取消</button>
                <button class="ui-btn ui-btn-primary" id="save">保存</button>
            </div>
        </div>
    </div>
`

module.exports = $(html);
