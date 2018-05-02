export var helper = {
    createDayItem : {},
}

// 创建日检项目
helper.createDayItem = function(index, item){
    return `
    <tr>
        <td>
            <div class="checkbox-group">
                &nbsp;&nbsp;&nbsp;<input type="checkbox" checked id="${index}"><label for="${index}">&nbsp;</label>
            </div>
        </td>
        <td>
            ${item.checkItem}
        </td>
    </tr>
    `;
}

// 创建周检项目
helper.createWeekItem = function(index, item){
    
    let hans = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

    let select = `<select class="editor-cycle" data-index="${index}">`;

    for(let i=1; i<8; i++){
        select += `<option value="${i}">${hans[i]}</option>`
    }

    select += '</select>'

    return `
        <tr>
            <td>
                <div class="checkbox-group">
                    &nbsp;&nbsp;&nbsp;<input type="checkbox" checked id="${index}"><label for="${index}">&nbsp;</label>
                </div>
            </td>
            <td>
                ${item.checkItem}
            </td>

            <td>
                ${select}
            </td>
        </tr>
    `;
}

// 创建月检项目
helper.createMonthItem = function(index, item){
    let select = `<select  class="editor-cycle"  data-index="${index}">`;

    for(let i=1; i<29; i++){
        select += `<option value="${i}">${i}号</option>`
    }

    select += '</select>'

    return `
        <tr>
            <td>
                <div class="checkbox-group">
                    &nbsp;&nbsp;&nbsp;<input type="checkbox" checked  id="${index}"><label for="${index}">&nbsp;</label>
                </div>
            </td>
            <td>
                ${item.checkItem}
            </td>

            <td>
                ${select}
            </td>
        </tr>
    `;
}