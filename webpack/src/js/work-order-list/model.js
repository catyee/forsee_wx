
import { userInfo } from '../common/service/user.info.service';
import { http } from '../utils/http.util';

let model = {
	page: 1,
	totalPage: 0,
	pageSize: 12,
	prId: null,
	prList: [],
	keyWord: null,
	status: null,
	orderList: [],
	orderNumber: 0,

	getOrderList: {},  //获取工作票列表
	getOrderTplList: {},   //获取工作票模板列表
	handleOrderList: {}, //处理数据
};

//获取工作票列表

model.getOrderList = function () {
	let param = {
		userId: userInfo.userId,
		roleId: userInfo.roleId,
		currentPage: this.page,
		pageSize: this.pageSize,
		prId: this.prId,
		isComplete: (this.status != '-1' ? this.status : null),
		gzpNum: this.keyWord
	};

	return http.post('/dwt/iems/bussiness/gzp/page_get_gzps', param).map(function (res) {
		if (res.code == '0') {
			model.orderList = res.pageResult.records;
			model.totalPage = res.pageResult.totalPages;
			model.orderNumber = res.pageResult.totalCount;
			model.handleOrderList();
			return true;
		} else {
			return false;
		}
	});
};

//获取工作票模板列表

model.getOrderTplList = function () {
	return http.post('/dwt/iems/bussiness/gzp/get_all_gzp_czp_tpl',  {
		type: 1
	});
};

//处理工作票列表数据
//检查工作票的审批状态和完成状态
//并将结果写入checkStatus 和 completeStatus

model.handleOrderList = function () {
	let complete = ['未完成', '<span style="color:#03b679;">上传工作结果中</span>', '<span style="color:#03b679;">已完成</span>', '<span style="color:#03b679;">已归档</span>'];
	let orderList = this.orderList;
	let length = orderList.length;
	let order = null;
	let status = null;
	let statusContent = null;
	for (let i = 0; i < length; i++) {
		order = orderList[i];
		status = order.staus;
		if (status[0] == '0') {
			statusContent = '<span style="color:orange;">保存</span>';
		} else {

			if (status[1] == '0') {
				statusContent = '<span style="color:orange;">安全员未审核</span>';
			} else if (status[1] == '1') {
				statusContent = '<span style="color:#03b679;">安全员通过</span>';
			} else if (status[1] == '2') {
				statusContent = '安全员驳回';
			}

			if (status[2] == '0') {
				statusContent += ',<span style="color:orange;">组团长未审核</span>';
			} else if (status[2] == '1') {
				statusContent += ',<span style="color:#03b679;">组团长通过</span>';
			} else if (status[2] == '2') {
				statusContent += ',组团长未通过';
			}

			if (status[1] == '1' && status[2] == '1') {
				if (status[3] == '0') {
					statusContent = '客户未审核';
				} else if (status[3] == '1') {
					statusContent = '<span style="color:#03b679;">客户通过</span>';
				} else if (status[3] == '2') {
					statusContent = '客户未通过';
				}
			}
		}


		let completeContent = complete[order.isComplete];

		if (order.isComplete) {
			completeContent = complete[3];
		} else if (status[4] == '1' && order.ret != '1') {
			completeContent = complete[1];
		} else if (status[4] == '1') {
			completeContent = complete[2];
		} else {
			completeContent = complete[0];
		}

		orderList[i].checkStatus = statusContent;
		orderList[i].completeStatus = completeContent;

	}

};

exports.model = model;
