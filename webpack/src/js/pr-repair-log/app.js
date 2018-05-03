require('../../scss/pr-repair-log.scss');
require('../common/service/user.info.service');
let $ = require('jquery');
let laydate = require('layui-laydate')

import { powerRoomCommonController } from '../common/power-room-common-controller';
import { powerRoomModel } from '../common/power-room-model';
import { appUtil } from '../utils/app.util';
import { dateUtil } from '../utils/date.util';
import { UI } from '../common/ui';
import { model } from './model';
import { TodoTasksService } from '../common/service/todo.tasks.service';

var app = {
	prId: null,
	init: {},
	bind: {},
	disRepairLogs: {},
	pagination: null,
};
$(function () {
	app.init();
});

app.init = function(){

	this.prId = appUtil.getParameter('id');

	this.pagination = new UI.Pagination('pagination', 0, 3);
	app.initPagesPath();

	//初始化配电室基本信息

	powerRoomCommonController.initPowerRoomBaseInfo();

	//初始化一次接线图按钮

	powerRoomCommonController.initYCJXTButton();
	app.disRepairLogs();
	this.bind();
	TodoTasksService.start();
}

// 绑定
app.bind = function(){

	let _this = this;

	/*查看详情*/
	$('#log-container').delegate('.log-item', 'click', function () {
		window.location.href = 'order-detail.html?id=' + $(this).data('id');
	});

	// 指定动态加载css的基地址
	laydate.path = 'http://cdn.dianwutong.com/vendor/laydate/'; 
	laydate.render({
		elem: '#date-range',
		type: 'date',
		range: true,
		theme: '#e9be2b',
		done: (value, date1, date2)=> {
			console.log(value);
			const dates = value.split(' - ');

			if(dates[0]){
				dateUtil.setDate(dates[0]);
				model.startDate = dateUtil.getMillisecond();
			}else{
				model.startDate = null;
			}

			if(dates[1]){
				dateUtil.setDate(dates[1]);
				model.sendDate = dateUtil.getMillisecond();
			}else{
				model.sendDate = null;
			}
			_this.disRepairLogs();
		
		}
	})

	// 翻页
	this.pagination.messager.subscribe( page => {
		model.page = page;
		this.disRepairLogs();
	})

}

/**
 * 初始化 扩展信息各个item标题(相关资料，抢修日志，巡检日志，巡检项目)的路径
 */
app.initPagesPath = function () {
	this.prId = appUtil.getParameter('prid');
	$('#toPrMetarial').attr('href','pr-metarial.html?prid='+this.prId);
	$('#toRepairLog').attr('href','pr-repair-log.html?prid='+this.prId);
	$('#toInspectionLog').attr('href','pr-inspection-log.html?prid='+this.prId);
	$('#toPrCheck').attr('href','pr-check-list.html?prid='+this.prId);
}

/**
 * 显示巡检日志
 */

app.disRepairLogs = function () {
	model.getRepairLogs().subscribe(res => {

		if(res.code === 200){

			let list = res.body.records;
			let length = list.length;
			let container = $("#log-container");
			let emptyTips = $("#empty-tips");
			let logTable = $("#log-table")

			let html = '';
			for(let i=0; i<length; i++){

				const item = list[i];
				let alarmTime = '-';
				let finishTime = '-';
				
				if(item.createTime){
					dateUtil.setDate(item.createTime);
					alarmTime = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm:ss');
				}

				if(item.completeQxTime){
					dateUtil.setDate(item.completeQxTime);
					finishTime = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm:ss');
				}

				html += `
					<tr class="log-item" data-id="${item.qxOrderId}">
						<td>${alarmTime}</td>
						<td>${finishTime}</td>
						<td>${item.orderDesc}</td>
						<td>${item.employeeName?item.employeeName:'-'}</td>
					</tr>
				`
			}

			container.html(html);
			this.pagination.update(res.body.totalPages, res.body.currentPage);

			if(res.body.totalCount === 0){
				logTable.hide();
				emptyTips.show();
			}else{
				emptyTips.hide();
				logTable.show();
			}
		}
	})
};