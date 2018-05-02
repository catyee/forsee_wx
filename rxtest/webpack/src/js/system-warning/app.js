
require('../../scss/system-warning.scss');

import { UI } from '../common/ui';
const $ = require('jquery');
require('../common/layout-controller');
import { BaseModel } from '../common/web-socket-base-model';
import { userInfo } from '../common/service/user.info.service';
import { appUtil } from '../utils/app.util';
import { appModel } from '../common/app-model';
import { model, HANDLE_STATUS, ALARM_STATUS } from './model';
import { ROLES } from '../common/app-enum';
import { dateUtil } from '../utils/date.util';
import { TodoTasksService } from '../common/service/todo.tasks.service';

let ctrl = {
	init: {},			//初始化页面
	initModel: {},		//初始化socket
	bind: {},			//事件绑定
	render: {},   		//渲染页面
	createAlarmDom: {},			//创建报警DOM
	renderPrList: {},    		//渲染配电室下拉选框
	clearAlarms: {},    		//清空本地的报警

	handleChange: {},      		//处理数据变化的方法
	handleOpen: {},       		//处理链接成功的数据
	handleDataAdd: {},       	//处理新增数据
	handleDataUpdate: {},       //处理数据更新
	handleDataDelete: {},       //处理数据被删除
	searchPowerRoom: {},        //搜索配电室
	searchAlarms: {},			//搜索报警
	renderAlarmNumber: {},		//渲染报警数量

	selectedPrId: null,		//被选中的配电室id 用作过滤报警
	selectedStatus: '-1',		//被选中的状态 过滤条件
	willIgnoreAlarmId: null,	//将被忽略的报警id
};

$(function () {
	ctrl.init();
});


ctrl.init = function () {
	ctrl.renderPrList();
	ctrl.handleStatusButtonGroup = new UI.ButtonGroup('handle-status-button-group');
	ctrl.alarmStatusButtonGroup = new UI.ButtonGroup('alarm-status-button-group');
	ctrl.pagination = new UI.Pagination('pagination');
	ctrl.bind();
	this.searchAlarms();
	TodoTasksService.start();
};

//事件绑定

ctrl.bind = function () {

	// 切换处理状态
	this.handleStatusButtonGroup.change(status => {
		model.handleStatus = parseInt(status);
		model.page = 1;
		this.searchAlarms();
	})

	//切换过滤报警状态的按钮
	ctrl.alarmStatusButtonGroup.change(status => {
		model.alarmStatus = parseInt(status);
		model.page = 1;
		this.searchAlarms();
	})

	this.pagination.messager.subscribe(page => {
		model.page = page;
		this.getAlarmList();
	})

	//忽略报警

	$('#alarm-con').delegate('.ignore-alarm', 'click', function (e) {

		var alarmId = $(this).data('id');

		UI.prompt({
			tip: '请填写忽略报警的原因',
			rightBtnClick: function(content){
				model.ignoreAlarm(alarmId, content).subscribe( res => {
					if(res.code === 200){
						ctrl.searchAlarms();
					}else{
						UI.notification.error('操作失败['+res.code+']');
					}
				})
			}
		})
		
		e.stopPropagation();

	});

	/*跳转到报警详情*/

	$('#alarm-con').delegate('.alarm-item', 'click', function () {

		var alarmId = $(this).data('id');
		window.location.href = 'warning-detail.html?id=' + alarmId;

	});
};

// 报警列表
ctrl.searchAlarms = function () {
	// 如果是不是获取实时报警 就不用轮询
	this.cancelCycleRenderAlarmList();
	model.alarmList = [];
	$('#alarm-con').empty();
	ctrl.getAlarmList();
	if (model.alarmStatus === ALARM_STATUS.REAL_TIME) {
		this.cycleRenderAlarmList();
	}
}

// 获取报警列表
ctrl.getAlarmList = function () {

	// 先清空页面
	model.getAlarmList().subscribe(success => {
		if (success) {
			if (model.newAlarmList && model.newAlarmList.length > 0) {
				this.handleDataAdd(model.newAlarmList);
			}
			if (model.unExistAlarmIds && model.unExistAlarmIds.length > 0) {
				this.handleDataDelete(model.unExistAlarmIds);
			}

			// 如果不是没有选中实时报警 则显示分页器
			if (model.alarmStatus !== ALARM_STATUS.REAL_TIME) {
				this.pagination.update(model.totalPage, model.page);
			} else {
				this.pagination.update(0, model.page);
			}
		}

		//页面上没有内容 则显空记录提示
		ctrl.toggleEmptyTips();
	})
}

// 轮询地获取报警列表
ctrl.cycleRenderAlarmList = function () {
	if (ctrl.cycleTimer) {
		clearInterval(ctrl.cycleTimer);
	}

	ctrl.cycleTimer = setInterval(() => {
		ctrl.getAlarmList();
	}, 5000);
}

// 取消轮询获取
ctrl.cancelCycleRenderAlarmList = function () {
	clearInterval(ctrl.cycleTimer);
}

//渲染报警数量

ctrl.renderAlarmNumber = function () {

	var alarms = $('.alarm-item');
	var resultCount = $('#result-count');
	var alarmCount = alarms.length;

	resultCount.text(alarmCount);

	if (alarmCount == 0) {
		//moni.emptyTips( '搜索不到报警', 'alarm-con' );
	}

};

//处理数据发生变化
ctrl.handleChange = function (type, data) {

	switch (type) {
		case 'OPEN': ctrl.handleOpen(data); break;
		case 'ADD': ctrl.handleDataAdd(data.reverse()); break;
		case 'UPD': ctrl.handleDataUpdate(data); break;
		case 'DEL': ctrl.handleDataDelete(data); break;
	}

	ctrl.renderAlarmNumber();
};

//处理成功打开socket

ctrl.handleOpen = function (data) {

	$('#alarm-con').empty();
	this.handleDataAdd(data);

};

//处理新增数据

ctrl.handleDataAdd = function (data) {

	var length = data.length;
	var dom = null;
	var firstDom = null;
	for (var i = 0; i < length; i++) {
		if (data.hasOwnProperty(i)) {

			//data[i].status == 2 历史

			dom = null;

			if (ctrl.selectedStatus == 1 && ctrl.selectedStatus == data[i].status) {

				dom = ctrl.createAlarmDom(data[i]);

			} else if (ctrl.selectedStatus == 2 && ctrl.selectedStatus == data[i].status) {

				dom = ctrl.createAlarmDom(data[i]);

			} else if (ctrl.selectedStatus == -1) {

				dom = ctrl.createAlarmDom(data[i]);

			}


			//如果是第一次打开的话 按顺序插入 否则插入到最前面

			var items = $('.alarm-item');

			if (items.length > 0) {

				firstDom = $(items[0]);

			}

			if (!firstDom) {

				$('#alarm-con').append(dom);

			} else {

				firstDom.before(dom);

			}

		}

	}

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

//处理删除数据

ctrl.handleDataDelete = function (data) {

	for (var i in data) {
		if (data.hasOwnProperty(i)) {
			var alarmDom = $('.alarm-item[alarm-id="' + data[i] + '"]');
			if (alarmDom) {
				alarmDom.remove();
			}
		}
	}

};

//重新渲染报警

ctrl.reRenderAlarmList = function () {

	var data = this.model.data;
	var list = [];

	for (var i in data) {

		if (data.hasOwnProperty(i)) {

			list.push(data[i]);
		}

	}

	this.clearAlarms();
	this.handleDataAdd(list);
	ctrl.renderAlarmNumber();

};


//创建一个报警DOM

ctrl.createAlarmDom = function (item) {
	var type = ['', '预警', '报警', '故障'];
	var handleStatus = ['未处理', '处理中', '已处理', '已忽略'];
	var dom = '';

	// 报警值
	let alarmValue = '';
	if (item.varType === 1) {
		alarmValue = `<div>报警值: <span>${item.alarmValue + (item.alarmValue ? item.alarmValue : '')}</span></div>`
	} else if (item.showValue) {
		// 如果是di点 且需要显示报警值
		alarmValue = `<div>报警值: <span>${item.valueDefine}</span></div>`
	}

	// 忽略按钮 只有有权限且未处理的历史报警才可以忽略
	let ignoreBtn = '';
	if (userInfo.roleId === ROLES.ZTZ && item.alarmStatus === ALARM_STATUS.HISTORY && item.handleStatus === HANDLE_STATUS.UNHANDLE) {
		ignoreBtn = `<div data-id="${item.alarmId}" class="ignore-alarm">忽略</div>`
	}

	dateUtil.setDate(item.alarmTime);
	let alarmTime = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm:ss');

	return `
		<div class="alarm-item" data-id="${item.alarmId}">
			<div class="item-left color-black">
				<div class="item-left-top">
					<div>${type[item.alarmLevel]}</div>
					<div class="center">
						<span>
							${item.prName}
						</span>
					</div>
				</div>
				<div class="item-left-bottom">${alarmTime}</div>
			</div>
			<div class="item-right">
				<div>${item.alarmDesc}</div> 
				${alarmValue}
				<div>报警点:${item.varShowName}</div>
				<div class="btns">
					<div>${handleStatus[item.handleStatus]}</div>
					${ignoreBtn}
				</div>
				
			</div>
		</div>
	`;

};

//渲染报警配电室列表

ctrl.renderPrList = function (prList) {

	appModel.getPrList().subscribe(list => {

		const length = list.length;
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

		ctrl.prSelector = new UI.Selector('pr-selector', options, -1);

	})

};


ctrl.toggleEmptyTips = function(){
	const length = $(".alarm-item").length;
	const container = $("#alarm-con");
	const emptyTips = $("#empty-tips");
	if(length){
		container.show();
		emptyTips.hide();
	}else{
		container.hide();
		emptyTips.show();
	}
}