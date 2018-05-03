let $ = require('jquery');
require('./component.scss');
const html = `
    <div class="dialog">
        <div class="dialog-content">
            <div class="dialog-header">
                <span >创建抢修单</span>
                <span class="dialog-close">&times</span>
            </div>
            <div class="dialog-body">
                <div class="dialog-tip">如果该问题属于某一个调度号，请务必在问题描述中写明调度号。</div>
                <div class="dialog-line" id="create-repair-order-pr-select-line" style="display:none">
                    <label>配电室</label>
                    <div class="value">
                        <div id="create-repair-order-pr-select" class="ui-select" tabindex="-1">
                            <input placeholder="请选择模板" disabled>
                            <span class="arrow"></span>
                            <ul></ul>
                        </div>
                    </div>
                    <div class="height20"></div>
                </div>
          
                <div class="dialog-line">
                    <label>问题描述</label>
                    <div class="value">
                        <textarea class="bug-desc" id="create-repair-order-bug-desc"></textarea>
                    </div>
                </div>
            </div>
            <div class="dialog-footer">
                <button class="ui-btn" id="cancel">取消</button>
                <button class="ui-btn ui-btn-primary" id="save">保存</button>
            </div>
        </div>    
    </div>
`

module.exports = $(html);