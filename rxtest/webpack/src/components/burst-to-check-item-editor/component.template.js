let $ = require('jquery');
require('./component.scss');

const html = `
    <div class="modal burst-to-check-item-editor">
        <div class="editor-content">
            <div class="editor-header">
                <span >设置巡检</span>
                <span class="editor-close">&times</span>
            </div>
            <div class="editor-body">
                <div class="editor-tip">请根据突发的内容重新编写巡检项，并选择巡检分类</div>
               
                <div>
                    <label>巡检类型</label>
                    <div class="radio-group">
                        <input type="radio" id="burst-to-check-item-editor-type-1" value="1" name="burst-to-check-item-editor-type" checked>
                        <label for="burst-to-check-item-editor-type-1">日检</label>
                    </div>

                    <div class="radio-group">
                        <input type="radio" id="burst-to-check-item-editor-type-2" value="2" name="burst-to-check-item-editor-type">
                        <label for="burst-to-check-item-editor-type-2">周检</label>
                    </div>

                    <div class="radio-group">
                        <input type="radio" id="burst-to-check-item-editor-type-3" value="3" name="burst-to-check-item-editor-type">
                        <label for="burst-to-check-item-editor-type-3">月检</label>
                    </div>
                </div>
                <div class="height20"></div>
                <div>
                    <label>巡检日期</label>
                    <span id="burst-to-check-item-editor-day-selector" class="check-date-selector">
                       每天
                    </span>
                    <div id="burst-to-check-item-editor-week-selector" class="ui-select none check-date-selector" tabindex="-1">
                        <input placeholder="请选择巡检时间" disabled>
                        <span class="arrow"></span>
                        <ul>
                            <li value="1">周一</li>
                            <li value="2">周二</li>
                            <li value="3">周三</li>
                            <li value="4">周四</li>
                            <li value="5">周五</li>
                            <li value="6">周六</li>
                            <li value="7">周日</li>
                        </ul>
                    </div>
                    <div id="burst-to-check-item-editor-month-selector" class="ui-select none check-date-selector" tabindex="-1">
                        <input placeholder="请选择巡检时间" disabled>
                        <span class="arrow"></span>
                        <ul>
                            <li value="1">1号</li>
                            <li value="2">2号</li>
                            <li value="3">3号</li>
                            <li value="4">4号</li>
                            <li value="5">5号</li>
                            <li value="6">6号</li>
                            <li value="7">7号</li>
                            <li value="8">8号</li>
                            <li value="9">9号</li>
                            <li value="10">10号</li>
                            <li value="11">11号</li>
                            <li value="12">12号</li>
                            <li value="13">13号</li>
                            <li value="15">15号</li>
                            <li value="16">16号</li>
                            <li value="17">17号</li>
                            <li value="18">18号</li>
                            <li value="19">19号</li>
                            <li value="20">20号</li>
                            <li value="21">21号</li>
                            <li value="22">22号</li>
                            <li value="23">23号</li>
                            <li value="24">24号</li>
                            <li value="25">25号</li>
                            <li value="26">26号</li>
                            <li value="27">27号</li>
                            <li value="28">28号</li>
                        </ul>
                    </div>
                </div>
                <div class="height20"></div>
                <div>
                    <label>巡检分类</label>
                    <div id="burst-to-check-item-editor-classify-select" class="ui-select" tabindex="-1">
                        <input placeholder="请选择模板" disabled>
                        <span class="arrow"></span>
                        <ul></ul>
                    </div>
                </div>
                <div class="height20"></div>
                <div>    
                    <label>新的项目</label>
                    <input type="text" id="editor-new-item" placeholder="请填写项目名">
                </div>
            </div>
            <div class="editor-footer">
                <button class="ui-btn ui-btn-primary" id="burst-to-check-item-editor-save">保存</button>
            </div>
        </div>    
    </div>
`

module.exports = $(html);