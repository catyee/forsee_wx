
import { http } from '../utils/http.util';

let model = {
	orderId     : null,     //工作票id
	order       : null,     //工作票内容
	prefix      : null,     //图片前缀
	logs        : [],       //工作流
	getOrderTpl : {},       //获取工作票模板
	getOrder    : {},       //获取工作票
	handleOrder : {},       //对操作票数据进行处理
	saveOrder   : {},       //保存工作票
	approveOrder: {},       //审核工作票
	sendEmail   : {},       //发送邮件
	savePics    : {},       //保存图片
};

//获取工作票模板

model.getOrderTpl = function (id) {
	return http.post('/dwt/iems/bussiness/gzp/get_tpl_by_id', {
		id : id
	});
};

//获取工作票内容

model.getOrder = function(){
        
	return http.post('/dwt/iems/bussiness/gzp/get_gzp_by_id', {
		id : this.orderId
	}).map(function (res) {
		if(res.code == '0'){
			model.order = res.entity;
			model.prefix = res.prefix;
			model.logs = model.order.logs;
			model.handleOrder();
			return true;
		}else{
			return false;
		}
	});
};

//处理工作票的内容数据

model.handleOrder = function(){

	//记录目前状态

	var statusContent = '';
	var order = this.order;
	var status = this.order.staus;

	if(order.isComplete == '1'){
		statusContent = '<span style="color:#03b679;">已归档</span>';
	}else if(status[0] == '0'){
		statusContent = '<span style="color:orange;">已保存</span>';
	}else{
		if(status[1] == '0'){
			statusContent = '<span style="color:orange;">安全员未审核</span>';
		}else if(status[1] == '1'){
			statusContent = '<span style="color:#03b679;">安全员通过</span>';
		}else if(status[1] == '2'){
			statusContent = '安全员驳回';
		}

		if(status[2] == '0'){
			statusContent += ',<span style="color:orange;">组团长未审核</span>';
		}else if(status[2] == '1'){
			statusContent += ',<span style="color:#03b679;">组团长通过</span>';
		}else if(status[2] == '2'){
			statusContent += ',组团长未通过';
		}

		if(status[1] == '1' && status[2] == '1'){
			if(status[3] == '0'){
				statusContent = '客户未审核';
			}else if(status[3] == '1'){
				statusContent = '<span style="color:#03b679;">客户通过</span>';
			}else if(status[3] == '2'){
				statusContent = '客户未通过';
			}
		}

		if (order.isComplete == '1'){
			statusContent = '<span style="color:#03b679;">已归档</span>';
		}else if (status == '11111' && order.ret == '1' ){

			statusContent = '<span style="color:#03b679;">已完成</span>';

		}else if (status == '11111'){

			statusContent = '<span style="color:#03b679;">上传工作结果中</span>';

		}

	}

	order.statusContent = statusContent;
};

//保存工作票

model.saveOrder = function (data) {
	return http.post('/dwt/iems/bussiness/gzp/add_or_update_gzp', data);
};

//审核工作票

model.approveOrder = function (data) {
	return http.post('/dwt/iems/bussiness/gzp/approve_gzp', data);
};

//发送邮件

model.sendEmail = function (data) {
	return http.post('/dwt/iems/bussiness/gzp/send_gzp_email_to_cus', data);
};

//保存图片

model.savePics = function (data) {
	return http.post('/dwt/iems/bussiness/gzp/add_gzp_pic', data);
};

exports.model = model;
