let $ = require('jquery');
require('./component.scss');

const html = `
    <div class="modal check-list-tpl-selector">
        <div class="selector-content">
            <div class="selector-header">
                <span >选择模板</span>
                <span class="selector-close">&times</span>
            </div>
            <div class="selector-body">
                <div class="selector-tip">选择模板之后，模板项目直接加入到配电室的巡检列表中，多次选择模板将多次添加。</div>
                <div>
                    <label>请选择模板</label>
                    <div id="tpl-selector" class="ui-select" tabindex="-1">
                        <input placeholder="请选择模板" disabled>
                        <span class="arrow"></span>
                        <ul></ul>
                    </div>
                </div>
                <div class="selector-viewer">
                    <div class="selector-tabs">
                        <span class="selector-tab active">日&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;检</span>
                        <span class="selector-tab">周&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;检</span>
                        <span class="selector-tab">月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;检</span>
                    </div>
                    <div class="selector-tab-panels">
                        <div class="selector-tab-panel active">
                            <table  width="100%" cellspacing="0" cellspadding="0">
                                <thead>
                                    <tr>
                                        <td width="10%">
                                            选择
                                        </td>
                                        <td width="90%">
                                            内容
                                        </td>
                                    </tr>
                                </thead>
                                <tbody id="selector-day-items">
                                
                                </tbody>
                            </table>
                        </div>
                        <div class="selector-tab-panel">
                            <table  width="100%">
                                <thead>
                                    <tr>
                                        <td width="10%">
                                            序号
                                        </td>
                                        <td width="80%">
                                            内容
                                        </td>
                                        <td width="10%">
                                            巡检日期
                                        </td>
                                    </tr>
                                </thead>
                               
                                <tbody id="selector-week-items">
                                
                                </tbody>
                            </table>
                        </div>
                        <div class="selector-tab-panel">
                            <table  width="100%">
                                <thead>
                                    <tr>
                                        <td width="10%">
                                            序号
                                        </td>
                                        <td width="80%">
                                            内容
                                        </td>
                                        <td width="10%">
                                            巡检日期
                                        </td>
                                    </tr>
                                </thead>
                            
                                <tbody id="selector-month-items">
                                
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="selector-footer">
                <button class="ui-btn ui-btn-primary" id="save">保存</button>
            </div>
        </div>    
    </div>
`

module.exports = $(html);