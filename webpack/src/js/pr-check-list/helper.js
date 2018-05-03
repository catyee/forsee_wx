import { check_item_pipe } from "../common/app-pipe";
import { CHECK_TYPE, ROLES } from "../common/app-enum";
import { userInfo } from "../common/service/user.info.service";

export const helper = {};

helper.createCheckClassify = function (index, item) {

    const hans = ['零', '一', '二', '三', '四', '五', '六', '日']

    let list = '';
    for (let i = 0; i < item.routineItems.length; i++) {

        // 每个周期里巡检的日期
        let cycle = '每天';

        if(item.routineItems[i].checkType == CHECK_TYPE.WEEK){
            cycle = '周'+hans[item.routineItems[i].cycle];
        }else if(item.routineItems[i].checkType == CHECK_TYPE.MONTH){
            cycle = item.routineItems[i].cycle + '号';
        }

        list += `
            <tr>
                <td>${i+1}</td>
                <td>${item.routineItems[i].checkItem}</td>
                <td>${check_item_pipe(item.routineItems[i].checkType)}</td>
                <td>${cycle}</td>
            </tr>
        `
    }

    return `
        <div class="classify">
            <div class="classify-header">
                <div class="classify-name">
                    <span>${item.categoryName}</span>
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAMCAYAAABbayygAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjE5RjBCQUM5RkYxMDExRTdBMkQ3Q0IzQ0NGNEE5QjA4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjE5RjBCQUNBRkYxMDExRTdBMkQ3Q0IzQ0NGNEE5QjA4Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTlGMEJBQzdGRjEwMTFFN0EyRDdDQjNDQ0Y0QTlCMDgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTlGMEJBQzhGRjEwMTFFN0EyRDdDQjNDQ0Y0QTlCMDgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5Ff/ZCAAAAbElEQVR42mLU1pBjQAN1ULoJWZAFi6JGJD5cMbOYCD8uRY5A/B+IDyIrRFeEoZgFjyIYAMsxYvEMVsD4cp82UQqZgLge6g58uIEFyX0NOAwDiTcyITm4AZcimNUMOBQ3IIcGC7agwMJmAAgwAGWRHUZ1Uv72AAAAAElFTkSuQmCC">
                </div>` 
                + (userInfo.roleId === ROLES.ZTZ ?
                `
                <div class="classify-actions">
                    <span class="use-tpl" data-index="${index}"  data-classify-id="${item.categoryId}">使用模板</span>
                    <span class="edit" data-index="${index}" data-classify-id="${item.categoryId}">编辑</span>
                    <span class="remove" data-classify-id="${item.categoryId}">删除</span>
                </div>
                `: '')+
                
                `
            </div>
            <div class="classify-body">
                <table>
                    <thead>
                        <tr>
                            <td>序号</td>
                            <td>巡检项</td>
                            <td>类型</td>
                            <td>巡检日期</td>
                        </tr>
                    </thead>
                    <tbody>
                        ${list}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
