require('../../scss/inspection-log-list.scss');
require('../common/service/user.info.service');

import { http } from '../utils/http.util';
import { model } from './model';
import { appModel } from '../common/app-model';
import { dateUtil } from '../utils/date.util';
import { UI } from '../common/ui';
import { TodoTasksService } from '../common/service/todo.tasks.service';

let $ = require('jquery');
let laydate = require('layui-laydate');

var app = {
	init: {},
	bind: {},
	getInsLogList: {},     //获取巡检日志列表
	renderInsLogList: {},  //渲染巡检日志列表
	getInsLogDom: {},      //获取巡检日志DOM

	renderPrList: {},     //渲染配电室列表
	pagination: null,		// 分页器

};

$(function () {
	app.init();
});

app.init = function () {
	this.pagination = new UI.Pagination('pagination', 0, 1);
	this.powerRoomSelector = new UI.Selector('power-room-selector');

	this.bind();
	this.renderPRList();
	app.getInsLogList();
	TodoTasksService.start();

};

//事件绑定

app.bind = function () {

	const _this = this;
	/***
	 * 配电室下拉框发生改变
	 */
	this.powerRoomSelector.change(data => {
		let prId = data.value;
		if (prId != '-1') {
			model.prId = data.value;
		} else {
			model.prId = null;
		}
		model.page = 1;
		app.getInsLogList();
	})

	// 翻页
	this.pagination.messager.subscribe(page => {
		model.page = page;
		app.getInsLogList();
	})


	// 指定动态加载css的基地址
	laydate.path = 'http://cdn.dianwutong.com/vendor/laydate/';
	laydate.render({
		elem: '#date-range',
		type: 'date',
		range: true,
		theme: '#e9be2b',
		done: (value, date1, date2) => {
			const dates = value.split(' - ');
			model.startDate = dates[0];
			model.endDate = dates[1];
			model.page = 1;
			app.getInsLogList();
		}
	})

	// 点击巡检日志 跳转
	$('#inspection-logs-con').delegate('.log-item', 'click', function () {
		let id = $(this).data('id');
		window.location.href = 'inspection-log.html?id=' + id;
	})
};

//获取巡检日志列表

app.getInsLogList = function () {
	model.getInsLogList().subscribe(function (res) {
		if (res) {
			app.renderInsLogList();
		} else {

			//获取失败

		}
	});
};

//渲染巡检日志列表

app.renderInsLogList = function () {

	var logList = model.logList;
	var length = logList.length;

	let container = $('#inspection-logs-con');
	let emptyTips = $("#empty-tips");

	container.empty();
	
	if (model.logNumber == 0) {
		container.hide();
		emptyTips.show();
		$('#result-count').parent().hide();
	} else {
		let html = '';
		for (var i = 0; i < length; i++) {
			html += app.getInsLogDom(logList[i]);
		}
		container.html(html);

		$('#result-count').parent().show();
		$('#result-count').text(model.logNumber);

		container.show();
		emptyTips.hide();
	}
	
	this.pagination.update(model.totalPage, model.page)
};

//获取巡检日志DOM

app.getInsLogDom = function (item) {
	return `
			<div class="log-item" data-id="${item.taskId}">
			<div class="item-header">
				<span>${item.prName}</span>
				<span>${item.xjDate}</span>
			</div>
			<div class="item-content">
				<div>
					<span>日检：${item.dayInspectCount}项</span>
					<span>周检：${item.weekInspectCount}项</span>
					<span>月检：${item.monthInspectCount}项</span>
				</div>
				<div>
					<span>复检：${item.fjCount}项</span>
					<span>突发：${item.tfCount}项</span>
					<span>异常：${item.exceptionCount}项</span>
				</div>
			</div>
			<div class="item-foot">巡检组长：${item.employeeName}</div>
		</div>
	`;
};



//渲染配电室列表

app.renderPRList = function () {
	appModel.getPrList().subscribe(list => {
		let length = list.length;
		const options = [];
		options.push({
			content: '请选择配电室',
			value: -1
		})
		for (let i = 0; i < length; i++) {
			options.push({
				content: list[i].prName,
				value: list[i].prId
			})
		}

		this.powerRoomSelector.update(options, -1);
	})
};