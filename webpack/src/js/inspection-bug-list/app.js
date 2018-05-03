require('../../scss/inspection-bug-list.scss');
const $ = require('jquery');
import { UI } from '../common/ui';
require('../common/layout-controller');

import { userInfo } from '../common/service/user.info.service';
import { dateUtil } from '../utils/date.util';
import { model } from './model';
import { TodoTasksService } from '../common/service/todo.tasks.service';

const HANDLE_STATUS = {
	UNHANDLE: 0,	// 未处理
	HANDLED: 1	// 已处理
}

let app = {
	currentPage: 1, // 当前页
	init: {},	//初始化页面
	bind: {},	//时间绑定
	getInsBugList: {}, //获取巡检问题列表
	render: {},		//渲染页面
	getInsBugDom: {},	//获取报警DOM

	bugList: [],	//巡检问题列表
	updateCycle: 10000, //设置更新周期

};

$(function () {
	app.init();
});

//初始化页面

app.init = function () {

	model.status = HANDLE_STATUS.UNHANDLE;
	//分页
	this.pagination = new UI.Pagination('pagination');
	this.statusSelector = new UI.ButtonGroup('status-selector');
	app.bind();
	app.getInsBugList();
	setInterval(app.getInsBugList, app.updateCycle);
	TodoTasksService.start();
};

//事件绑定

app.bind = function () {

	//点击巡检问题 跳转到详情页

	$('#bug-list').delegate('.bug-item', 'click', function () {
		var id = $(this).data('id');
		window.location.href = './inspection-bug.html?bid=' + id;
	});

	// 切换状态 

	this.statusSelector.change((status) => {
		model.status = status;
		model.page = 1;
		app.getInsBugList();
	});

	// 分页

	this.pagination.messager.subscribe((page) => {
		model.page = 1;
		app.getInsBugList();
	})
};

//获取巡检问题列表

app.getInsBugList = function () {
	model.getInsBugList(this.status).subscribe(res => {
		if (res.success) {

			/*重新渲染分页组件*/
			let page = parseInt(res['body']['currentPage']);
			let totalPage = parseInt(res['body']['totalPages']);
			let totalCount = parseInt(res['body']['totalCount']);
			model.page = page;
			app.pagination.update(totalPage, page);
			app.bugList = res['body']['records'];
			$('#total').html(totalCount);
			app.render();

			// 如果搜索不到记录 给出提示

			const bugListPanel = $("#bug-list-panel");
			const unhandleEmptyTips = $("#unhandle-empty-tips");
			const handledEmptyTips = $("#handled-empty-tips");

			if (!totalCount) {
				bugListPanel.hide();
				if (this.status === HANDLE_STATUS.UNHANDLE) {
					unhandleEmptyTips.show();
					handledEmptyTips.hide();
				} else {
					handledEmptyTips.show();
					unhandleEmptyTips.hide();
				}
			} else {
				bugListPanel.show();
				handledEmptyTips.hide();
				unhandleEmptyTips.hide();
			}

		}else{
		
		}
	})
};

//渲染页面

app.render = function () {
	let statusColor = ['uncomplete', 'handling' , 'complete'];
	let statusContent = ['未处理', '处理中', '已处理'];
	let bugGrade = ['一般', '严重', '危急']; 
	let html = '';
	for (let i = 0; i < this.bugList.length; i++) {
		let createTime = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm', this.bugList[i].createTime);

		let tr = `<tr data-id="${this.bugList[i].problemId}" class="pointer bug-item">
					<td class="width12">${createTime}</td>
					<td class="width43">${this.bugList[i].problemDesc}</td>
					<td class="width10">${bugGrade[this.bugList[i].quesGrade]}</td>
					<td class="width15">${this.bugList[i].prName}</td>
					<td class="width10"><div class="complete ${statusColor[this.bugList[i].status]}">${statusContent[this.bugList[i].status]}</div></td>
					<td class="width10">${this.bugList[i].employeeName}</td>
				</tr>`;
		html += tr;
	}
 
	$("#bug-list-body").html(html);


};


