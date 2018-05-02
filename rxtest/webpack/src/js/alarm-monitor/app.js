require('../../scss/alarm-monitor.scss');
require('../common/layout-controller');

let $ = require('jquery');
let UI = require('../common/ui');
import { http } from '../utils/http.util';
import { userInfo } from '../common/service/user.info.service';
// import { BaseModel } from '../common/web-socket-base-model';

var ctrl = {
	alarmCount: 0,	//总的报警数量
	init: {},		//初始化页面
	initModel: {},	//初始化socket
	bind: {},		//事件绑定
	render: {},		//渲染页面
	createAlarmDom: {},//创建报警DOM
	clearAlarms: {},	//清空本地的报警
	alarmList: [],	//报警列表
	pageSize: 5,	//每页的报警数量
	page: 1, 		//当前页
	pagination: null//分页器
};
$(function () {
	ctrl.init();
});
ctrl.init = function () {

	this.pagination = new UI.Pagination('pagination', 0, 0);

	ctrl.initSocket();
	ctrl.bind();
};
ctrl.bind = function () {

	//翻页

	$('#pagination').delegate('li', 'click', function () {
		ctrl.page = parseInt($(this).attr('page'));
		ctrl.pagination();
		ctrl.search(ctrl.page);
	});

	//点击每一条报警

	$('#alarm-items-con').delegate('.alarm-item', 'click', function (e) {
		$(this).toggleClass('tr-bg-grey');
		var $check = $(this).find('input');
		var isCheck = $(this).find('input').prop('checked');
		if (isCheck) {
			$check.prop('checked', false);
		} else {
			$check.prop('checked', true);
		}
		e.stopPropagation();
	});

	$('#alarm-items-con').delegate('input', 'click', function (e) {
		e.stopPropagation();
		$(this).parent().parent().toggleClass('tr-bg-grey');
	});

	//点击清除已处理报警按钮

	$('#removeAlarm').on('click', function () {
		var removeList = [];
		var length = $('.alarm-item').length;
		if (!length) {
			return;
		}
		for (var i = 0; i < length; i++) {
			if ($($('.alarm-item')[i]).hasClass('tr-bg-grey')) {
				removeList.push($($('.alarm-item')[i]).attr('alarm-id'));
			}
		}
		$('#modal').modal({

		});
		$('#remove').on('click', function () {
			ctrl.removeAlarmList(removeList);
			$('#modal').modal('hide');
		});
	});

};

//清除已处理报警

ctrl.removeAlarmList = function (removeList) {

	http.post('/dwt/iems/bussiness/bj/clean_up_bj', {}).subscribe(res => {

	})

};

//渲染每页的列表

ctrl.search = function (page) {
	ctrl.pageSizeList = this.alarmList.slice((page - 1) * this.pageSize, this.pageSize * page);
	$('#alarm-items-con').children().remove();
	for (var i = 0; i < ctrl.pageSizeList.length; i++) {
		var dom = ctrl.createAlarmDom(ctrl.pageSizeList[i]);
		$('#alarm-items-con').append(dom);
	}
};

//初始化ctrl.model.data

ctrl.initModelData = function () {
	this.alarmList = [];
	console.log(this.model.data);
	for (var i in this.model.data) {

		if (this.model.data.hasOwnProperty(i)) {
			this.alarmList.push(this.model.data[i]);
		}
	}
};

//初始化websocket

ctrl.initSocket = function () {
	var userId = userInfo.userId;
	var roleId = userInfo.roleId;
	//var url = 'ws://' + location.host + '/iems/monitor_socket/' + userId + '/' + roleId;
	var url = 'ws://iems.dianwutong.com/iems/monitor_socket/' + userId + '/' + roleId;
	this.model = new BaseModel(url);
	this.model.addEventListener('change', ctrl.handleChange);
};

//处理数据发生变化

ctrl.handleChange = function (type, data) {
	switch (type) {
		case 'OPEN': ctrl.handleOpen(data); break;
		case 'ADD': ctrl.handleDataAdd(data); break;
		case 'UPD': ctrl.handleDataUpdate(data); break;
		case 'DEL': ctrl.handleDataDelete(data); break;
	}

};

//处理成功打开socket

ctrl.handleOpen = function (data) {
	$('#alarm-items-con').children().remove();
	this.handleDataAdd(data);
};

//新增删除的时候 重新渲染页数

//处理新增数据

ctrl.handleDataAdd = function (data) {
	this.reRenderAlarmList();
};

//处理删除数据

ctrl.handleDataDelete = function (data) {
	this.reRenderAlarmList();
};


//处理数据的改变

ctrl.handleDataUpdate = function (data) {
	for (var i in data) {
		if (data.hasOwnProperty(i)) {
			var alarmDom = $('.alarm-item[alarm-id="' + data[i].id + '"]');
			if (alarmDom) {
				alarmDom.replaceWith(ctrl.createAlarmDom(data[i]));
			}
		}
	}
};

//重新渲染报警

ctrl.reRenderAlarmList = function () {
	ctrl.initModelData();
	ctrl.pagination();
	this.search(1);
};

//创建一个报警DOM

ctrl.createAlarmDom = function (item) {
	var type = ['', '预警', '报警', '故障'];
	var colors = ['color-red', 'color-orange', 'color-green', 'color-black'];
	var status = ['未处理', '处理中', '已处理', '已忽略'];
	var dom = '';
	dom += '<tr class="alarm-item  pointer ' + colors[item.flag] + '" alarm-id="' + item.id + '">';
	dom += '<td class="text-center"><input type="checkbox"></td>';
	dom += '<td>' + item.prName + '</td>';
	dom += '<td>' + item.ddn + '</td>';
	dom += '<td>' + item.bjDesc + '</td>';
	dom += '<td>' + item.value.toFixed(2) + '</td>';
	dom += '<td>' + item.time + '</td>';
	dom += '<td>' + type[item.type] + '</td>';
	dom += ' <td>' + status[item.flag] + '</td>';
	dom += '<td>' + item.qxbzMobile + '(' + item.qxbzName + ')' + '</td>';
	dom += '</tr>';
	return dom;
};

//分页

ctrl.pagination = function () {
	var length = this.alarmList.length;
	var pageSize = this.pageSize;
	var totalPage = Math.ceil(length / pageSize);
};
