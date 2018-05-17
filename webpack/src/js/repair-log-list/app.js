require('../../scss/repair-log-list.scss');
require('../common/service/user.info.service');

import { model } from './model';
import { appModel } from '../common/app-model';
import { UI } from '../common/ui';
import { dateUtil } from '../utils/date.util';
import { TodoTasksService } from '../common/service/todo.tasks.service';
let $ = require('jquery');
let laydate = require('layui-laydate');

var app = {
	init: {},
	bind: {},
	render: {},
	getRepLogList: {}, //获取抢修日志列表
	getLogDom: {}, //获取抢修日志DOM
	renderPRList: {},   //渲染配电室列表

	pagination: null,	//分页器
};

$(function () {
	app.init();
});

//初始化页面
app.init = function () {

	this.pagination = new UI.Pagination('pagination', 0, 1);
	this.powerRoomSelector = new UI.Selector('power-room-selector');

	this.bind();
	this.getRepLogList();
	this.renderPRList();

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
		app.getRepLogList();
	})

	// 翻页
	this.pagination.messager.subscribe(page => {
		model.page = page;
		app.getRepLogList();
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
			app.getRepLogList();
		}
	})

	// 点击抢修单 跳转
	$('#repair-log-con').delegate('.log-item', 'click', function(){
		let id = $(this).data('id');
		window.location.href = 'order-detail.html?id='+id;
	})
};

//渲染页面

app.render = function () {

	var logList = model.logList;
	var length = logList.length;

	$('#repair-log-con').empty();

	if (length == 0) {

		$('#result-count').parent().css('display', 'none');
		$("#empty-tips").show();
		$('#repair-log-con').hide();
		
	} else {
		
		$("#empty-tips").hide();
		$('#repair-log-con').show();

		$('#result-count').parent().css('display', 'block');
		$('#result-count').text(model.logNumber);

		let html = '';

		for (var i = 0; i < length; i++) {

			html += app.getLogDom(logList[i]);

		}

		$('#repair-log-con').html(html);

	}
	this.pagination.update(model.totalPage, model.page);


};

//获取抢修日志DOM

app.getLogDom = function (item) {
	dateUtil.setDate(item.createTime);
	let createTime = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm:ss');

	return `
	<div class="log-item" data-id="${item.qxOrderId}">
		<div class="item-header">
			<span>${item.prName}</span>
			<span>${createTime}</span>
		</div>
		<div class="item-content">
			<div>${item.orderDesc}</div>
		</div>
		<div class="item-foot">${item.employeeName? '抢修组长：' + item.employeeName : '未安排抢修' }</div>
	</div>
	`
};

//获取抢修日志列表

app.getRepLogList = function () {
	model.getRepLogList().subscribe(function (res) {
		if (res) {
			app.render();
		} else {
			$('#repair-log-con').empty();
			$('#result-count').parent().css('display', 'none');
		}
	});
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


