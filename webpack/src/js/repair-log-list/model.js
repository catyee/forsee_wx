
import { http } from '../utils/http.util';
import { userInfo } from '../common/service/user.info.service';
import { dateUtil } from '../utils/date.util';

var model = {
	page: 1,
	pageSize: 10,
	totalPage: 0,
	logNumber: 0,
	customerId: null, //过滤条件 客户id
	prId: null,    //过滤条件  配电室id
	date: null,      //过滤条件  日期
	logList: [],   //日志列表
};

//获取抢修日志列表

model.getRepLogList = function () {
	let startDate = null;
	let endDate = null;

	if(this.startDate){
		dateUtil.setDate(this.startDate);
		startDate = dateUtil.getMillisecond();
	}

	if(this.endDate){
		dateUtil.setDate(this.endDate);
		endDate = dateUtil.getMillisecond();
	}

	var param = {
		prId: this.prId === '-1' ? null: this.prId,
		page: this.page,
		pageSize: this.pageSize,
		flag: 2,
		endDate: endDate,
		startDate: startDate
	};

	!param.prId && delete param.prId;
	!param.endDate && delete param.endDate;
	!param.startDate && delete param.startDate;

	return http.get('/ems/rest/qx/order/page', param).map(function (res) {
		if (res.code == 200) {
			model.logList = res.body.records;
			model.page = res.body.currentPage;
			model.totalPage = res.body.totalPages;
			model.logNumber = res.body.totalCount;
			return true;
		} else {
			return false;
		}
	});
};

exports.model = model;
