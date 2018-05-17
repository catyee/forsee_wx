const $ = require('jquery');
import { ROLES } from '../common/app-enum';
import { userInfo } from '../common/service/user.info.service';
import { http } from '../utils/http.util';
import { cookie } from '../utils/cookie.util';
import { dateUtil } from '../utils/date.util';

var model = {
	page: 1,
	totalPage: 0,
	pageSize　: 12,
	cusId: null,
	prId: null,    //保存查询条件-- 配电室id
	date: null,    //保存查询条件-- 日期
	logList: [],   //保存日志列表
	customerList: [], //保存客户列表
	cusPRList: [],   //保存配电室列表

	getInsLogList: {},    //获取巡检日志列表
};

/***
 * 获取巡检日志列表
 */

model.getInsLogList = function () {

	//如果是抢修班长，抢修组长，组团长，巡检组长，必选传userId 和roleId

	var userId = null;
	var roleId = null;
	if (
		userInfo.roleId == ROLES.QXBZ ||
		userInfo.roleId == ROLES.QXZZ ||
		userInfo.roleId == ROLES.ZTZ ||
		userInfo.roleId == ROLES.XJZZ
	) {
		userId = userInfo.userId;
		roleId = userInfo.roleId;
	}

	let startDate = null;
	if(model.startDate){
		dateUtil.setDate(model.startDate);
		startDate = dateUtil.getMillisecond();
	}
	
	let endDate = null;
	if(model.endDate){
		dateUtil.setDate(model.endDate);
		endDate = dateUtil.getMillisecond();
	}

	let param = {
		page: this.page,
		pageSize: this.pageSize,
		prId: (model.prId != '-1' ? model.prId : null),
		startDate: startDate,
		endDate: endDate,
		roleId: roleId,
		employeeId: userId
	};

	!param.prId && delete param.prId;
	!param.startDate && delete param.startDate;
	!param.endDate && delete param.endDate;
	!param.roleId && delete param.roleId;
	!param.employeeId && delete param.employeeId;

	return http.get('/ems/rest/common/xj/log/page', param).map(res => {
		if (res.code === 200) {
			//获取到数据之后 将数据存放到model里 然后染回true 通知ctrl渲染

			model.logList = res.body.records;
			model.page = res.body.currentPage;
			model.totalPage = res.body.totalPages;
			model.logNumber = res.body.totalCount;
			return true;
		}
		return false;
	})

};

exports.model = model;
