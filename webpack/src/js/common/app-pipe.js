import { CHECK_TYPE, INSPECT_BUG_STATUS } from "./app-enum";

export function check_item_pipe( type ){
    let content = '';
    switch(type){
        case CHECK_TYPE.DAY: content = '日检'; break;
        case CHECK_TYPE.WEEK: content = '周检'; break;
        case CHECK_TYPE.MONTH: content = '月检'; break;
    }

    return content;
}

export function inspect_bug_status_pipe( status ){
    let content = '';
    switch(type){
        case INSPECT_BUG_STATUS.UNHANDLE: content = '未派单'; break;
        case INSPECT_BUG_STATUS.HANDLED: content = '已派单'; break;
    }

    return content;
}