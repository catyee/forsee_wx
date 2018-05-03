/**
 * 抢修日志
 */

import { http } from '../utils/http.util';
var model = {
	log: {},		//日志
	repairTask: {},		//抢修任务
	surveyTasks: {},		//巡检任务
	getRepairLogById: {},    //通过抢修单id获取抢修单详情
	getRepairProcessById: {},    //通过抢修单id获取抢修流程
	getSurveyRecordsById: {},    //根据抢修单id获取查勘记录
	getRepairResultById: {},    //根据抢修单id获取抢修结果

	setToReCheckItem: {},    //设置为复检项
};

/***
 * 通过id获取抢修单详情
 * @param repairLogId   抢修单id
 * @param callback      获取成功时的回调函数
 */

model.getRepairLogById = function () {

	return http.get('/ems/rest/qx/order', {
		'qxOrderId': this.repairLogId,
	}).map(function (res) {
		if (res.code == '0') {
			model.log = res.entity;
			model.surveyTasks = _.filter(model.log.qxTasks, _.matcher({ 'type': 1 }));
			var repairTask = _.filter(model.log.qxTasks, _.matcher({ 'type': 2 }));
			model.repairTask = (repairTask && repairTask.length > 0) ? repairTask[0] : null;

			//查询报警时间

			if (model.log.prAlarm) {
				model.alarmTime = model.log.prAlarm.alarmTime;
			} else if (model.log.xjProblem) {
				model.alarmTime = model.log.xjProblem.createTime.slice(0, -2);
			} else {
				model.alarmTime = model.log.createTime.slice(0, -2);
			}

			//查询开始查勘时间

			if (model.surveyTasks.length > 0) {
				var tasks = _.sortBy(model.surveyTasks, 'createTime');
				model.startSurveyTime = tasks[0].createTime.slice(0, -2);
			} else {
				model.startSurveyTime = '没有安排查勘';
			}

			//获取抢修时间和抢修结束时间

			if (model.repairTask) {
				model.startRepairTime = model.repairTask.createTime.slice(0, -2);
				model.completeRepairTime = model.repairTask.lastModifyTime.slice(0, -2);
			} else {
				model.startRepairTime = '没有安排抢修';
				model.completeRepairTime = '没有安排抢修';
			}

			return true;
		}
		return false;
	});
};

/***
 * 通过抢修单id获取抢修流程
 * @param repairLogId   抢修单id
 * @param callback      获取成功时的回调函数
 */

model.getRepairProcessById = function (repairLogId, callback) {
	var param = {
		'repairOrderId': repairLogId
	};

	$.ajax({
		'url': moni.baseUrl + '/rt/ap/v1/repdispatch/get_repair_process',
		'type': 'post',
		'contentType': 'application/json;charset=UTF-8',
		'dataType': 'json',
		'data': JSON.stringify(param),
		'success': callback,
		'error': function (result) {

		}
	});
};

/***
 * 通过抢修单id获取查勘流程
 * @param repairLogId   抢修单id
 * @param callback      获取成功时的回调函数
 */

model.getSurveyRecordsById = function (repairLogId, callback) {
	var param = {
		'repairOrderId': repairLogId
	};

	$.ajax({
		'url': moni.baseUrl + '/rt/ap/v1/repair/get_survey_record',
		'type': 'post',
		'contentType': 'application/json;charset=UTF-8',
		'dataType': 'json',
		'data': JSON.stringify(param),
		'success': callback,
		'error': function (result) {

		}
	});
};

/***
 * 通过抢修单id获取抢修结果
 * @param  repairOrderId 抢修单id
 * @param callback       获取成功的回掉函数
 */

model.getRepairResultById = function (repairOrderId, callback) {
	var param = {
		'repairOrderId': repairOrderId
	};

	$.ajax({
		'url': moni.baseUrl + '/rt/ap/v1/repdispatch/get_repair_record',
		'type': 'post',
		'contentType': 'application/json;charset=UTF-8',
		'dataType': 'json',
		'data': JSON.stringify(param),
		'success': callback,
		'error': function (result) {

		}
	});
};

/***
 * 组团长根据抢修日志设置复检项
 * @param repairLogId   抢修日志id
 * @param reCheckTitle  复检标题
 * @param reCheckDesc   复检内容
 * @param callback      设置成功的回调函数
 */

model.setToReCheckItem = function (reCheckTitle, reCheckDesc) {
	var param = {
		'qxOrderId': this.log.id,
		'prId': this.log.prId,
		'fjItem': reCheckTitle,
		'fjDesc': reCheckDesc
	};

	return http.post('/dwt/iems/bussiness/xj/add_fj_item', param);

};

exports.model = model;