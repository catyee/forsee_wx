import { http } from "../utils/http.util";

let model = {
    prId: null,
    page: 1,
    pageSize: 20,
    startDate: null,
    endDate: null,
    getPrInspectionLogs: {},
}

model.getPrInspectionLogs = function(){

    let param = {
        prId: this.prId,
        page: this.page,
        pageSize: this.pageSize,
        startDate: this.startDate,
        endDate: this.endDate
    }

    !param.startDate && delete param.startDate;
    !param.endDate && delete param.endDate;

    return http.get('/ems/rest/common/xj/log/page', param);
}

exports.model = model;