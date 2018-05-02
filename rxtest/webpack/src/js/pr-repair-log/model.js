
import { http } from '../utils/http.util';

let model = {
    page: 1,
    pageSize: 20,
    startDate: null,
    endDate: null,
    getRepairLogs: {}
}

model.getRepairLogs = function(){
    const param = {
        page: this.page,
        pageSize: this.pageSize,
        flag: 2, // 已销单
        startDate: this.startDate,
        endDate: this.endDate
    }

    !param.endDate && delete param.endDate;
    !param.startDate && delete param.startDate;

    return http.get('/ems/rest/qx/order/page', param);
}

exports.model = model;