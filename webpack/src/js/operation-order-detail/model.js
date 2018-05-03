
import { ROLES } from '../common/app-enum';
import { http } from '../utils/http.util';
import { userInfo } from '../common/service/user.info.service';

var model = {
	order: null,			//保存操作票
	logs: [],				//保存工作流
	saveOrderBaseInfo: {},
	saveOrderOperationItem: {},
	getOrder: {},
	handleOrder: {},		//处理操作票数据
	updateOrderStatus: {},
	creatOrderPdf: {},
	getOrderPdf: {},          //获取操作票Pdf的url
	sendEmail: {},
	approveOrder: {},		//审核操作票
};

//获取工作票模板

model.getOrderTpl = function (id) {

	return http.post('/dwt/iems/bussiness/gzp/get_tpl_by_id', {
		id: id
	})

};

/***
 * 保存操作票基本信息
 */

model.saveOrder = function (data) {
	return http.post('/dwt/iems/bussiness/czp/add_or_update_czp', data)
};

/***
 * 保存操作项
 */

model.saveOrderOperationItem = function (id, list) {

	return http.post('/dwt/iems/bussiness/czp/add_czp_contents', {
		'id': id,
		'contents': list
	})

};

/**
 * 获取操作票详情
 */

model.getOrder = function (id) {

	return http.post('/dwt/iems/bussiness/czp/get_czp_by_id', {
		id: id
	}).map( res => {
		if (res.code == '0') {
			model.order = res.entity;
			model.logs = model.order.logs;
			model.prefix = res.prefix;
			model.handleOrder();
			return true;
		} else {
			return false;
		}
	})
	
};

// 处理操作票的信息

model.handleOrder = function () {
	var status = model.order.staus;
	var statuses = ['<span style=\'color:#03b679\'>保存</span>',
		'<span style=\'color:#ff8c11\'>组团长审核中</span>',
		'<span style=\'color:red\'>组团长驳回</span>',
		'<span style=\'color:#ff8c11\'>安全员审核中</span>',
		'<span style=\'color:red\'>安全员驳回</span>',
		'<span style=\'color:#03b679\'>安全员通过</span>',
		'<span style=\'color:#ff8c11\'>客户审核中</span>',
		'<span style=\'color:red;\'>客户驳回</span>',
		'<span style=\'color:#03b679\'>客户通过</span>',
		'<span style=\'color:#03b679\'>上传工作结果中</span>',
		'<span style=\'color:#03b679\'>已完成</span>',
		'<span style=\'color:#03b679\'>已归档</span>'];

	/***
     * status[0] : 0 巡检组保存 1 巡检组提交
     * status[1] : 0 安全员未审核	 1 审核通过 2审核未通过
     * status[2] : 0 组团长未审核	 1 审核通过 2审核未通过
     * status[3] : 0 客户未审核	 1 审核通过 2审核未通过
     * status[4] : 0 巡检组未上传工作结果 1上传
     */
	//显示操作票状态

	var statusIndex = null;
	if (status == '00000') {
		statusIndex = 0;
	} else if (status == '10000') {
		statusIndex = 1;
	} else if (status == '02000') {
		statusIndex = 2;
	} else if (status == '11000') {
		statusIndex = 3;
	} else if (status == '01200') {
		statusIndex = 4;
	} else if (status == '11100' && model.order.sendEmail != '1') {
		statusIndex = 5;
	} else if (status == '11100' && model.order.sendEmail == '1') {
		statusIndex = 6;
	} else if (status == '01120') {
		statusIndex = 7;
	} else if (status == '11110') {
		statusIndex = 8;
	} else if (status == '11111' && model.order.ret != '1') {
		statusIndex = 9;
	} else {
		statusIndex = 10;
	}

	if (model.order.isComplete == '1') {
		statusIndex = 10;
	}

	model.order.statusContent = statuses[statusIndex];

	/****
     * 两种角色可以修改
     * 巡检组保存  安全员驳回  值班长驳回  客户驳回  可以修改
     * 组团长 只有当他自己驳回之后可以修改 也就是 status == "12000"
     */

	var enableEdit = false;

	if (userInfo.roleId == ROLES.XJZZ &&
		(status[0] == '0' ||
			status[1] == '2' ||
			status[2] == '2' ||
			status[3] == '2')) {
		enableEdit = true;
	} else if (userInfo.roleId == ROLES.ZTZ && status == '02000') {
		enableEdit = true;
	}
	model.order.enableEdit = enableEdit;

	/***
	 * 只有小组长可以回填
	 * @type {boolean}
	 */

	var reEditable = false;
	if (userInfo.roleId == ROLES.XJZZ && status == '11111' && model.order.ret != '1') {
		reEditable = true;
	}

	model.order.reEditable = reEditable;
};

/***
 * 更新操作票状态
 */

model.updateOrderStatus = function (args) {

	return http.post('/rt/ap/v1/common/audit_oper_ticket', args)

};

/***
 * 生成操作票pdf
 */

model.creatOrderPdf = function (orderId, callback) {

	return http.post('/rt/ap/v1/common/create_oper_ticket', {
		'operTicketId': orderId
	})

};

/***
 * 获取操作票pdf
 */

model.getOrderPdf = function (orderId) {

	return http.post('/rt/ap/v1/common/download_oper_ticket', {
		'operTicketId': orderId
	})
	
};

/**
 * 发送邮件
 */

model.sendEmail = function (id, password) {

	return http.post('/dwt/iems/bussiness/czp/send_czp_email_to_cus', {
		'userId': userInfo.userId,
			'id': id,
			'password': password
	})

};

/***
 * 审核操作票
 * @param data
 * 	id : 操作票id
 * 	staus ：0 审核不通过 1 审核通过
 * 	reason ： 审核通过 传null 审核不通过 传原因
 * 	userId
 * 	roleId
 */

model.approveOrder = function (data) {
	return http.post('/dwt/iems/bussiness/czp/approve_czp', data);
};

/***
 * 组团长 替客户点同意按钮上传图片
 * @param id
 * @param pics
 */

model.savePics = function (id, pics) {
	return http.post('/dwt/iems/bussiness/czp/add_czp_pic',  {
		userId: userInfo.userId,
		roleId: userInfo.roleId,
		id: id,
		pic: pics
	});
};

exports.model = model;