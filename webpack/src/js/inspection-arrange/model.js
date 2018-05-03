import { userInfo } from "../common/service/user.info.service";
import { http } from "../utils/http.util";

/**
 * 巡检数据模型
 */

var model = {
	employeeId: userInfo.employeeId,				 // 组团长id  // todo
	date: null,				// 巡检日期
	scheduleId: null,			// 排班id
	prList: [],					// 该账号下拥有的配电室列表
	groups: [],					// 该账号下所有的分组
	groupSchedules: [],			// 一个小组下的所有排班
	schedules: [],				// 排班集合
	getInspectionArrange: {},    //获取巡检安排
	getPowerRoomByTeamerId: {},    //获取组团行下辖的所有配电室

	setInspectionArrange: {},    //保存巡检安排
};


/**
 * 根据组团长id和日期获取巡检排班列表
 */

model.getInspectionArrange = function () {
	const data = {
		xjDate: model.date,
		employeeId: model.employeeId	// 员工id
	};
	return http.get('/ems/rest/xj/schedule/task/list', data)
		.map(res => {
			if (res.code == '200') {
				model.groups = res['body'];
				return true;
			}else{
				model.groups = [];
				return false;
			}
		})
};

/***
 * 根据组团长id获取其下辖的所有配电室
 * 
 */

model.getPowerRoomByTeamerId = function () {
	return http.get('/ems/rest/power/room/list', {
		'employeeId': model.employeeId
	}).map((res) => {
		if (res.code == '200') {
			model.prList = res['body'];
			return true;
		} else {
			model.prList = [];
			return false;
		}
	});
};


/**
 * 根据scheduleId任务详情
 */

model.getTaskDetail = function() {
	const data = {
		scheduleId: this.scheduleId,
	}
	return http.get('/ems/rest/xj/schedule/task/detail',data)
		.map(res => {
			if(res.code == '200') {
				model.groupSchedules = res['body'];
				return true;
			}else{
				model.groupSchedules = [];
				return false;
			}
		});
}

/**
 * 设置排班计划
 */

model.setInspectionArrange = function() {
	const data = {
		xjDate: this.date,
		groupLeaderId: model.employeeId,
		schedules:model.schedules
	}
	return http.post('/ems/rest/xj/schedule',data)
		.map(res => {
			if(res.code == '200') {
				return true;
			}else{
				return false;
			}
		})
}

exports.model = model;