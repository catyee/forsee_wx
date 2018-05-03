
require('../../scss/pr-inspection-log.scss');
require('../common/service/user.info.service');
let laydate = require('layui-laydate')
let $ = require('jquery');

import { UI } from '../common/ui';

import { powerRoomCommonController } from '../common/power-room-common-controller';
import { powerRoomModel } from '../common/power-room-model';
import { appUtil } from '../utils/app.util';
import { dateUtil } from '../utils/date.util';
import { model } from './model';
import { TodoTasksService } from '../common/service/todo.tasks.service';

var app = {
	init: {},
	bind: {},
	initPowerRoomBaseInfo: {},
	disInspectionLogs: {},
	pagination: null, 	// 分页器
	datePicker: null,	// 时间选择器
};

$(function () {
	app.init();
});

app.init = function () {

	model.prId = appUtil.getParameter('id');

	this.pagination = new UI.Pagination('pagination', 0, 1);
	this.bind();
	app.initPagesPath();

	//初始化配电室基本信息
	powerRoomCommonController.initPowerRoomBaseInfo();

	//初始化一次接线图按钮
	powerRoomCommonController.initYCJXTButton();

	app.disInspectionLogs();

	TodoTasksService.start();
}

app.bind = function () {

	let _this = this;
	// 指定动态加载css的基地址
	laydate.path = 'http://cdn.dianwutong.com/vendor/laydate/'; 
	laydate.render({
		elem: '#inspection-log-date-select',
		type: 'date',
		range: true,
		theme: '#e9be2b',
		done: (value, date1, date2)=> {
			
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
			_this.disInspectionLogs();
		
		}
	})

	/*跳转至巡检详情*/

	$('#log-container').delegate('.log-item', 'click', function () {
		var id = $(this).data('id');
		var powerRoomId = model.prId;
		window.location.href = 'inspection-log.html?id=' + id;
	});

	//翻页
	this.pagination.messager.subscribe(page =>{
		model.page = page;
		_this.disInspectionLogs();
	});
}

/**
 * 初始化 扩展信息各个item标题(相关资料，抢修日志，巡检日志，巡检项目)的路径
 */
app.initPagesPath = function () {
	
	$('#toPrMetarial').attr('href', 'pr-metarial.html?prid=' + model.prId);
	$('#toRepairLog').attr('href', 'pr-repair-log.html?prid=' + model.prId);
	$('#toInspectionLog').attr('href', 'pr-inspection-log.html?prid=' + model.prId);
	$('#toPrCheck').attr('href', 'pr-check-list.html?prid=' + model.prId);
}

/*显示巡检日志列表*/

app.disInspectionLogs = function () {
	var powerRoomId = model.prId;
	var currentPage = $('#inspection-log-pagination').attr('page');
	var pageSize = 10;
	var xjDate = $('#inspection-log-date-select').val();

	if (xjDate.length == 0) {
		xjDate = null;
	}

	model.getPrInspectionLogs().subscribe(res => {
		if (res.code === 200) {
		
			const container = $("#log-container");
			const containerTable = $("#list-table");
			const emptyTips = $("#empty-tips");

			const list = res.body.records;
			const length = list.length;

			let html = '';
			for(let i=0; i<length; i++){
				const item = list[i];
				html += `
				<tr data-id="${item.taskId}" class="log-item pointer">
					<td>${item.xjDate}</td>
					<td>${item.dayInspectCount + item.weekInspectCount + item.monthInspectCount}</td>
					<td>${item.fjCount}</td>
					<td>${item.tfCount}</td>
					<td>${item.exceptionCount}</td>
					<td>${item.employeeName}</td>
				</tr>
			`
			}
		
			container.html(html);
			this.pagination.update(res.body.totalPages, res.body.currentPage);
			
			if(res.body.totalCount === 0){
				emptyTips.show();
				containerTable.hide();
			}else{
				emptyTips.hide();
				containerTable.show();
			}
		}
	});
};