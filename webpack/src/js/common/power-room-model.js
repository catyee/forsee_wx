/**
 * powerRoomModel   配电室model 
 */
const $ = require('../../../node_modules/jquery/dist/jquery.js');

import { http } from '../utils/http.util';

var powerRoomModel = {
	powerRoomId:null,		   //配电室id

	getPowerRoomBaseInfoById: {},                  //获取配电室基本信息
	getCheckTemplateList: {},                  //获取巡检模板列表
	getCheckTemplateById: {},                  //获取巡检模板详情
	getPowerRoomCheckList: {},                  //获取配电室的巡检项列表

	getSystemFileList: {},                  //获取系统文件列表
	getPowerRoomFileList: {},                  //获取配电室文件列表
	getRecheckItemList: {},                  //获取配电室复检项
	getEmergencyItemList: {},                  //获取突发列表
	getInspectionLogsById: {},                  //获取配电室巡检日志
	getRepairLogsById: {},                  //获取配电室抢修日志
	getTagListById: {},                  //获取标签列表
	getFilterListById: {},                  //获取过滤过的标签列表

	getProjectNameByPrId: {},                  //获取Zr90工程名

	getTagHistoryData: {},                  //获取标签的历史数据

	addOrUpdateCheckClass: {},                  //新增或更新巡检分类名称
	bacthAddCkeckItems: {},                  //批量增加巡检项 

	setCheckTemplate: {},                  //设置巡检模板
	setPowerRoomCheckItem: {},                  //设置（添加）一个巡检项
	setFileToPowerRoom: {},                  //设置（引用）一个系统文件到配电室
	setFileOutFromPowerRoom: {},                  //设置 配电室文件移除
	setIgnoreEmergencyItem: {},                  //设置忽略突发项
	setCheckItemOrder: {},                  //设置（保存）巡检项的顺序

	removePowerRoomCheckItem: {},                  //删除配电室巡检项
	removePowerRoomCheckClass: {},                  //删除配电室巡检项分类
	removeRecheckItem: {},                  //删除配电室复检项
	addSystemFile: {},                  //添加一个系统文件
};

/***
 * 获取配电室基本信息
 */

powerRoomModel.getPowerRoomBaseInfo = function (prId) {
	return http.get('/ems/rest/power/room/detail', {
		prId: prId ? prId : this.powerRoomId
	}).map(res => {
		if(res.code === 200){
			let pr = res.body;
			res.body.address = `${pr.province} ${pr.city} ${pr.area?pr.area:''} ${pr.address}`;
		}

		return res;
	});
};


/***
 * 获取系统文件列表
 * @param callback   回调函数
 */

powerRoomModel.getSystemFileList = function (powerRoomId, fileName) {
	return http.post('/dwt/iems/bussiness/xj/get_sys_files', {
		prId: powerRoomId,
		fileName: fileName,
	});
};

/***
 * 获取配电室文件列表
 * @param powerRoomId 配电室id
 * @param callback    回调函数
 */

powerRoomModel.getPowerRoomFileList = function (powerRoomId) {

	var param = {
		path: '/dwt/iems/bussiness/xj/get_files_by_pr_id',
		data: {
			prId: powerRoomId
		}

	};
	return http.post('/dwt/iems/bussiness/xj/get_files_by_pr_id', {
		prId: powerRoomId
	});

};

/***
 * 通过配电室id 获取配电室巡检日志
 * @param powerRoomId 配电室id
 * @param date        查询的日期
 * @param page        页数
 * @param callback    查询成功时的回调函数
 */

powerRoomModel.getInspectionLogsById = function (powerRoomId, date, page) {
	var param = {
		'prId': powerRoomId,
		'inspectDate': date,
		'page': page,

	};

	return http.post('/ems/rest/common/xj/log/page', param);

};
powerRoomModel.getInspectionLogsById = function (powerRoomId, currentPage, pageSize, xjDate) {
	var param = {
		prId: powerRoomId,
		currentPage: currentPage,
		pageSize: pageSize,
		xjDate: xjDate
	};
	return http.post('/dwt/iems/bussiness/xjlog/page_get_xj_log_list', param);
};

/***
 * 根据配电室id获取配电室的抢修日志
 * @param powerRoomId 配电室id
 * @param currentPage 页数
 * @param pageSize    每页条数
 * @param queryDate        查询的日期
 * @param callback    查询成功时的回调函数
 */

powerRoomModel.getRepairLogsById = function (powerRoomId, currentPage, pageSize, queryDate) {
	var param = {
		prId: powerRoomId,
		currentPage: currentPage,
		pageSize: pageSize,
		queryDate: queryDate,
		deleteFlag: 1
	};

	return http.post('/dwt/iems/bussiness/qx/page_get_qx_orders', param);
};

/***
 * 根据配电室id 获取配电室taglist
 * @param {String}    powerRoomId  配电室id
 * @param {Function}  callback     获取成功后的回调函数 
 */

powerRoomModel.getTagListById = function (powerRoomId, callback) {
	return http.post('/rt/ap/v1/admin/get_tags_by_pr', {
		'prId': powerRoomId
	})
};

/**
 * 根据条件来检索某个配电室的tagList
 * @param {prId} 配电室Id
 * @param {searchType} 点类型，查询全部为null，1：高压，2：低压，3:变压器，4：直流屏
 * @param {keyWord} 搜索关键词，没有就为null
 */

powerRoomModel.getFilterListById = function (prId, searchType, keyWord) {
	var param = {
		'prId': prId,
		'searchType': searchType,
		'keyWord': keyWord
	};

	return http.post('/rt/ap/v1/common/filter_tag', param);
};


/***
 * 根据配电室id获取该配电室对应的Zr90工程名
 * @param {String}  powerRoomId 配电室id
 * @param {Function}  callback     获取成功后的回调函数 
 */

powerRoomModel.getProjectNameByPrId = function (powerRoomId, callback) {
	var param = {
		'prId': powerRoomId
	};
	return http.post('/rt/ap/v1/admin/get_project_name', param);
};

/***
 * 获取标签的历史数据
 * @param {String}   channelName    转发通道名
 * @param {String}   tagName        标签名
 * @param {String}   time           时间
 * @param {Function} callback       获取成功的回调函数
 */

powerRoomModel.getTagHistoryData = function (channelName, tagName, date, callback) {
	var param = {
		'forwardChannel': channelName,
		'tagName': tagName,
		'queryDate': date
	};
	return http.post('/rt/ap/v1/repdispatch/get_history_data', param);
};

/***
 * 设置（引用）一个系统文件到配电室
 * @param fileId       系统文件的id
 * @param powerRoomId  配电室id
 * @param callback     回调函数
 */

powerRoomModel.setFileToPowerRoom = function (fileId, powerRoomId) {
	var param = {
		sysFileId: fileId,
		prId: powerRoomId
	};
	return http.post('/dwt/iems/bussiness/xj/add_pr_file', param);
};

/***
 * 删除配电室的引用文件
 * @param referId   引用的id
 * @param callback  回调函数
 */

powerRoomModel.setFileOutFromPowerRoom = function (referId, fileId) {
	var param = {
		path: '/dwt/iems/bussiness/xj/delete_pr_file_by_id',
		data: {
			id: referId,
			sysFileId: fileId,
		}
	};
	return http.post(param);
};
powerRoomModel.addSystemFile = function (fileUrl, fileName) {
	var param = {
		fileUrl: fileUrl,
		fileName: fileName
	};
	return http.post('/dwt/iems/bussiness/xj/add_sys_file', param);
};

exports.powerRoomModel = powerRoomModel;