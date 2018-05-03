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
                <div class="dialog-tip" id="repair-grouper-selector-tips"></div>
                <div class="table-container">
                    <table id="repair-grouper-selector-table">
                        <thead>
                            <tr>
                                <th>选择</th>
                                <th>组长</th>
                                <th>组别</th>
                                <th>电话</th>
                            </tr>
                        </thead>
                        <tbody  id="rapair-grouper-list">
                        
                        </tbody>
                    </table>
                </div>    
                <div class="empty-tips" id="repair-grouper-selector-empty-tips">
                    <div>搜索不到你的抢修小组，请联系运营中心管理员解决</div>
                </div>
               
                <div class="height10"></div>
            </div>
            <div class="dialog-footer">
            <span id="repair-grouper-selector-error" class="color-danger center none">请选择一个小组&nbsp;&nbsp;&nbsp;</span>
                <button class="ui-btn" id="cancel">不选了</button>
                <button class="ui-btn ui-btn-primary" id="save">保存</button>
            </div>
        </div>    
    </div>
`

module.exports = $(html);