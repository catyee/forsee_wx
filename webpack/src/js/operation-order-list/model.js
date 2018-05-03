import { appUtil } from '../utils/app.util';
import { userInfo } from '../common/service/user.info.service';
import { http } from '../utils/http.util';


var model = {
	page: 1,
	pageSize: 10,
	status: null,
	prId: null,
	status: null,

	getOrderList: {},  //获取操作票列表
	handleOrderList: {},   //处理操作票数据
};

model.status = appUtil.getParameter('status');

model.getOrderList = function () {
	var data = {
		userId: userInfo.userId,
		roleId: userInfo.roleId,
		currentPage: this.page,
		pageSize: this.pageSize,
		extractDate: this.date,
		prId: this.prId,
		isComplete: this.status == '-1' ? null : this.status
	}

	return http.post('/dwt/iems/bussiness/czp/page_get_czps', data).map(function (res) {
		if (res.code == '0') {
			model.orderList = res.pageResult.records;
			model.totalPage = res.pageResult.totalPages;
			model.page = res.pageResult.currentPage;
			model.orderNumber = res.pageResult.totalCount;

			model.handleOrderList();
			return true;
		} else {
			return false;
		}
	});
};

/***
     * 处理操作票数据
     * 判断操作票的审批状态和完成状态
     * 分别将两个状态的结果存放在   checkStatus 和 completeStatus中
     */

model.handleOrderList = function () {
	var orderList = this.orderList;
	var length = orderList.length;

	var status = ['<span style=\'color:#03b679\'>保存</span>',
		'<span style=\'color:#ff8c11\'>组团长审核中</span>',
		'<span style=\'color:red\'>组团长驳回</span>',
		'<span style=\'color:#ff8c11\'>安全员审核中</span>',
		'<span style=\'color:red\'>安全员驳回</span>',
		'<span style=\'color:#03b679\'>安全员通过</span>',
		'<span style=\'color:#ff8c11\'>客户审核中</span>',
		'<span style=\'color:red;\'>客户驳回</span>',
		'<span style=\'color:#03b679\'>客户通过</span>'];

	var stausIndex = null;
	for (var i = 0; i < length; i++) {
		if (orderList[i].staus == '00000') {
			stausIndex = 0;
		} else if (orderList[i].staus == '10000') {
			stausIndex = 1;
		} else if (orderList[i].staus == '02000') {
			stausIndex = 2;
		} else if (orderList[i].staus == '11000') {
			stausIndex = 3;
		} else if (orderList[i].staus == '01200') {
			stausIndex = 4;
		} else if (orderList[i].staus == '11100' && orderList[i].sendEmail != '1') {
			stausIndex = 5;
		} else if (orderList[i].staus == '11100' && orderList[i].sendEmail == '1') {
			stausIndex = 6;
		} else if (orderList[i].staus == '01120') {
			stausIndex = 7;
		} else if (orderList[i].staus == '11110' || orderList[i].staus == '11111') {
			stausIndex = 8;
		}
		orderList[i].checkStatus = status[stausIndex];

		if (orderList[i].isComplete == 1) {
			orderList[i].completeStatus = '<span style="color:#03b679">归档</span>';
		} else if (orderList[i].staus == '11111' && orderList[i].ret == '1') {
			orderList[i].completeStatus = '<span style="color:#03b679">已完成</span>';
		} else if (orderList[i].staus == '11111' && orderList[i].ret != '1') {
			orderList[i].completeStatus = '<span style="color:#03b679">上传工作结果中</span>';
		} else {
			orderList[i].completeStatus = '<span>未完成</span>';
		}

	}

};

//获取工作票模板列表

model.getOrderTplList = function () {
	return http.post('/dwt/iems/bussiness/gzp/get_all_gzp_czp_tpl', {
		type: 2
	});
};

exports.model = model;
