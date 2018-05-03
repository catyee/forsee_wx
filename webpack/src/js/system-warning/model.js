

import { userInfo } from '../common/service/user.info.service';
import { http } from '../utils/http.util';

// 处理状态
const HANDLE_STATUS = {
	UNHANDLE: 0,	// 未处理
	HANDlING: 1,	// 处理中
	HANDLED: 2,		// 已处理
	IGNORE: 3		// 已完成
}

// 报警状态
const ALARM_STATUS = {
	REAL_TIME: 1,	// 实时
	HISTORY: 2,		// 历史
}

let model = {
	page: 1,
	handleStatus: null,	// 默认的处理状态
	alarmStatus: null,	// 报警状态
	isFirst: true,         //第一次加载的标识
	prId: null,         //通过配电室id查报警
	alarmList: [],          //报警列表
	newAlarmList: [],      //新的报警列表
	toDeleteAlarmList: [], //将要删除的报警列表
	serverAlarmList: [],   //服务器返回的报警列表
	unExistAlarmIds: [],   //本地比服务器多的报警id即不存在的报警的id

	getAlarmList: {},      //获取报警
	filterNewAlarm: {},    //过滤出新的报警的数组
	filterUnExistAlarm: {},//过滤出不存在的报警的数组
	ignoreAlarm: {},       //忽略报警

};

//获取系统报警

model.getAlarmList = function () {

	let pageSize = 15;
	let page = model.page;
	if (model.alarmStatus == ALARM_STATUS.REAL_TIME) {
		pageSize = 2147483647;
		page = 1;
	}

	var param = {
		page: page,
		pageSize: pageSize,
		prId: this.prId,
		employeeId: userInfo.employeeId,
		roleId: userInfo.roleId,
		alarmStatus: this.alarmStatus,
		handleStatus: this.handleStatus
	};

	!param.prId && (delete param.prId);
	!param.alarmStatus && (delete param.alarmStatus);
	!param.handleStatus && (delete param.handleStatus);

	return http.get('/ems/rest/alarm/page', param).map(function (res) {
		if (res.code === 200) {
			model.serverAlarmList = res.body.records;
			model.totalPage = res.body.totalPages;
			model.page = res.body.currentPage;
			model.filterNewAlarm();
			model.filterUnExistAlarm();
			return true;
		} else {
			return false;
		}
	});
};

//过滤出新的数组

model.filterNewAlarm = function () {

	//获取到本地报警id的数组
	//获取到服务器返回的报警的id的数组
	//取出服务器比本地多出的报警的id数组
	//取出多出的报警存放到newAlarmList
	//将newAlarmList合并到alarmList

	var localAlarmIds = []
	let length =  model.alarmList.length;
	for(let i=0; i<length; i++){
		localAlarmIds.push(model.alarmList[i].alarmId)
	}
	var serverAlarmIds = [];

	length = model.serverAlarmList.length;
	for(let i=0; i<length; i++){
		serverAlarmIds.push(model.serverAlarmList[i].alarmId)
	}

	var newAlarmIds = [];
	length = serverAlarmIds.length;
	for(let i=0; i<length; i++){
		if (!localAlarmIds.includes(serverAlarmIds[i])) {
			newAlarmIds.push(serverAlarmIds[i]);
		}
	}

	model.newAlarmList = [];
	length = model.serverAlarmList.length;
	for(let i=0; i<length; i++){
		if (newAlarmIds.includes(model.serverAlarmList[i].alarmId)) {
			model.newAlarmList.push(model.serverAlarmList[i]);
		}
	}
	

	model.alarmList = model.alarmList.concat(model.newAlarmList);

};

//过滤出已经不存在的报警

model.filterUnExistAlarm = function () {

	//获取到本地报警id的数组
	//获取到服务器返回的报警的id的数组
	//取出本地比服务器多出的报警的id数组
	//从newAlarmList删除掉不存在的报警

	var localAlarmIds = [];
	let length = model.alarmList.length;
	for(let i=0; i<length; i++){
		localAlarmIds.push(model.alarmList[i].alarmId);
	}

	var serverAlarmIds = [];
	length = model.serverAlarmList.length;
	for(let i=0; i<length; i++){
		serverAlarmIds.push(model.serverAlarmList[i].alarmId);
	}

	const unExistAlarmIds = [];
	length = localAlarmIds.length;
	for(let i=0; i<length; i++){
		if (!serverAlarmIds.includes(localAlarmIds[i])) {
			unExistAlarmIds.push(localAlarmIds[i]);
		}
	}

	length = model.alarmList.length;
	for (let i = length-1; i >= 0; i--) {
		if(unExistAlarmIds.includes(model.alarmList[i].alarmId)){
			model.alarmList.splice(i,1);
		}
	}
};

//清空报警

model.clearAlarms = function () {
	this.alarmList = [];
	this.newAlarmList = [];
	this.toDeleteAlarmList = [];
	this.serverAlarmList = [];
	this.unExistAlarmIds = [];
};

//忽略报警

model.ignoreAlarm = function (alarmId, reason) {
	return http.put('/ems/rest/alarm/ignore', {
		alarmId,
		reason
	}); 
};

exports.model = model;
exports.HANDLE_STATUS = HANDLE_STATUS;
exports.ALARM_STATUS = ALARM_STATUS;
