let $ = require('jquery');
require('./component.scss');
const html = `
    <div class="dialog">
        <div class="dialog-content">
            <div class="dialog-header">
                <span >请选择</span>
                <span class="dialog-close">&times</span>
            </div>
            <div class="dialog-body">
                <div class="dialog-tip" id="ticket-template-selector-tips"></div>
                <div class="dialog-line" >
                    <label>模板列表</label>
                    <div class="value">
                        <div id="ticket-template-selector-select" class="ui-select" tabindex="-1">
                            <input placeholder="请选择模板" disabled>
                            <span class="arrow"></span>
                            <ul></ul>
                        </div>
                    </div>
                    <div class="height20"></div>
                </div>
          
            </div>
            <div class="dialog-footer">
                <button class="ui-btn" id="cancel">不选了</button>
                <button class="ui-btn ui-btn-primary" id="save">保存</button>
            </div>
        </div>    
    </div>
`

module.exports = $(html);