import { userInfo } from '../common/service/user.info.service';
import { http } from "../utils/http.util";


var model = {
	page : 1,   //记录当前分页
	pageSize : 12,  //配置分页数量
	totalPage: 0,   //记录最大分页数量
	prCnt    : 0, //配电室总数
	keyword  : null,//关键字
	prList   : [],  //保存配电室列表


	emergencyCnt    : 0,    //突发数量
	repairLogCnt    : 0,    //今日抢修日志数量
	operTicketCnt   : 0,    //未完成操作票数量
	arangeSituation : 0,    //巡检安排情况
};

	//获取配电室列表

model.getPrList = function () {
	var param = {
		page : this.page,
		pageSize : this.pageSize
	};

	if(this.keyword){
		param.keyword = this.keyword;
	}

	if(userInfo.employeeId){
		param.employeeId = userInfo.employeeId;
	}

	if(userInfo.roleId){
		param.roleId = userInfo.roleId;
	}

	return http.get('/ems/rest/power/room/page', param).map(function(res){
		if(res.code === 200){
			model.page = res.body.currentPage;
			model.totalPage = res.body.totalPages;
			model.prCnt = res.body.totalCount;
			model.prList = res.body.records;
			return true;
		}else{
			model.page = 1;
			model.maxPage = 0;
			model.PrCnt = 0;
			model.prList = [];
			return false;
		}
	});
};

exports.model = model;