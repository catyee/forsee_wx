/**
 * 抢修单详情数据模型
 */
import { http } from '../utils/http.util';
import { userInfo } from '../common/service/user.info.service';
import { ROLES } from '../common/app-enum';

var model = {
	qxOrderId: null,	//抢修单id
	orderInfo: null,		  //抢修信息
	surveyTasks: [],		  //查看任务
	repairTask: [],		      //抢修任务
	getRepairOrderBaseInfo: {},          //获取抢修单的基本信息
	getSurveyRecordById: {},          //通过抢修单id获取查勘记录
	getRepairResultById: {},          //通过抢修单id获取抢修结果
	getRepairGroupList: {},		  //获取自己抢修小组

	sendStuffToSurvey: {},          //派遣员工到现场进行查勘
	sendStuffToRepair: {},          //派遣员工抢修

	setDefinitiveById: {},          //定性问题为合同内还是合同外
	setDestroyOrderById: {},          //通过抢修单id销单

	setReCheck: {},	// 设置复检
};

/***
 * 通过抢修单id获取抢修单的基本信息
 * @param  repairOrderId 抢修单id
 * @param callback       获取成功的回掉函数
 */

model.getRepairOrderBaseInfo = function () {
	let data = {
		qxOrderId: model.qxOrderId
	}
	return http.get('/ems/rest/qx/order',data).map(res => {
		if(res.code === 200) {

			model.prefix = res.prefix;
			let order = res.body;

			// 过滤出查勘任务和抢修任务
			let checkTasks = [];
			let repairTasks = [];

			let tasks = order.qxTasks;

			for(let i=0; i<tasks.length; i++){
				if(tasks[i].taskType === 1){
					checkTasks.push(tasks[i]);
				}else{
					repairTasks.push(tasks[i]);
				}
			}

			order.checkTasks = checkTasks; 
			order.repairTasks = repairTasks;

			return order;
		} 
		return null;
	});
};


/****
 * 获取自己的抢修小组
 * @returns {{code: string, msg: string}}
 */

model.getEmployeeList = function () {
	let roleIds = [ROLES.QXZZ, ROLES.XJZZ].join(',');
	return http.get('/ems/rest/employee/list', {
		roleIds: roleIds,
		employeeId: userInfo.employeeId,
		roleId: userInfo.roleId
	});
};

/***
 * 派遣员工到现场进行查勘
 * @param repairOrderId  抢修单id
 * @param stuffId        员工id
 * @callback             成功的回掉函数
 */

model.sendStuffToSurvey = function (stuffId) {
	var param = {
		qxOrderId: this.qxOrderId,
		employeeId: stuffId,
		taskType: 1
	};
	return http.post('/ems/rest/qx/task', param);
};

/***
 * 派遣员工到现场抢修
 * @param repairOrderId  抢修单id
 * @param stuffId        员工id
 * @callback             成功的回掉函数
 */

model.sendStuffToRepair = function (stuffId) {
	var param = {
		qxOrderId: this.qxOrderId,
		employeeId: stuffId,
		taskType: 2
	};
	return http.post('/ems/rest/qx/task', param);
};

/***
 * 定性问题为合同内还是合同外
 * @param orderId   抢修单id
 * @param isInContact 是否合同内
 * @param repairProgramme 抢修方案
 * @param callback   成功的回调函数
 */

model.saveJudge = function (isInContact, repairProgramme) {
	var param = {
		'qxOrderId': this.qxOrderId,
		'inContact': isInContact,
		'qxProgramme': repairProgramme
	};
	return http.put('/ems/rest/qx/order', param);
};

/***
 * 通过抢修单id销单
 * @param repairOrderId 抢修单id
 * @param callback      销单成功的回调函数
 */

model.destroyOrder = function () {
	return http.put('/ems/rest/qx/order', {
		'qxOrderId': this.qxOrderId,
		'status': 2
	});
};

// 设置复检
model.setReCheck = function( content ){
	return http.post('/ems/rest/xj/fj/item', {
		qxOrderId : this.qxOrderId,
		prId : this.prId,
		checkItem : content
	})
}

exports.model = model;