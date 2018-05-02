import { UI } from '../common/ui';
const $ = require('jquery');
require('../../scss/pr-list.scss');
import { model } from './model';
import { dateUtil } from '../utils/date.util';
import { Observable } from 'rxjs/Observable';
import { TodoTasksService } from '../common/service/todo.tasks.service';
import { userInfo } from '../common/service/user.info.service';
import { ROLES } from '../common/app-enum';

let app = {
	init: {},			//初始化
	bind: {},			//事件绑定
	search: {},			//搜索配电室
	render: {},			//渲染页面
	renderPrList: {},           //渲染配电室列表
	getPrDom: {},			//生成配电室的DOM

	pagination: null,			// 分页器
};

$(function () {
	app.init();
});

//初始化页面

app.init = function () {

	this.pagination = new UI.Pagination('pagination');

	app.bind();
	app.search();
	TodoTasksService.start();

};


//事件绑定

app.bind = function () {

	// 翻页
	this.pagination && this.pagination.messager.subscribe(page => {
		model.page = page;
		this.search();
	})

	// 搜索
	Observable.fromEvent(document.getElementById('keyword'), 'keyup').debounceTime(300).subscribe(res => {
		model.keyword = res.target.value;
		model.page = 1;
		this.search();
	})


};

//搜索配电室

app.search = function () {
	model.getPrList().subscribe(function (res) {
		app.render();
	});
};

//渲染页面

app.render = function () {
	app.renderPrList();

	// 搜索到的配电室总数
	$('#total').text(model.prCnt);

	// 判断是否显示记录提示
	if (model.prCnt) {
		$('#pr-list').show();
		$('#empty-tips').hide();
	} else {
		$('#pr-list').hide();
		$('#empty-tips').show();
	}
};

//渲染配电室列表

app.renderPrList = function () {
	let prIist = $('#pr-list-body');
	prIist.empty();
	if (model.prCnt == 0) {
		$('#result-count').parent().css('display', 'none');
	}

	$('#result-count').text(model.prCnt);
	$('#result-count').parent().css('display', 'block');

	var length = model.prList.length;
	var prList = model.prList;
	for (var i = 0; i < length; i++) {
		prIist.append(app.getPrDom(prList[i]));
	}

	this.pagination.update(model.totalPage, model.page);
};

//构建配电室DOM

app.getPrDom = function (item) {

	var address = (item.province ? item.province : ' ');
	address += (item.city ? item.city : ' ');
	address += (item.area ? item.area : ' ');
	address += (item.address ? item.address : '');
	if (address.length == 3) {
		address = '地址不详';
	}

	dateUtil.setDate(item.createTime);
	let createTime = dateUtil.getFormattedDate('yyyy-MM-dd');

	// 如果配电室的复检和突发不为0 则显示小气泡
	let badgeNumber = item.fjCount + item.tfCount;
	let badge = '';
	if(userInfo.roleId == ROLES.ZTZ){
		badge = badgeNumber > 0 ? `<div class="badge">${badgeNumber}</div>` : '';
	}

	return `<a href="pr-material.html?id=${item.prId}" data-pr-id="${item.prId}"  class="power-room row">
		<div class="width15 pr-name">${badge}${item.prName}</div>
		<div class="width30">${address}</div>
		<div class="width10">${item.cusName}</div>
		<div class="width10">${item.lxr1Mobile}</div>
		<div class="width10">${item.stationName ? item.stationName : '-'}</div>
		<div class="width4">${item.stationMaster ? item.stationMaster : '-'}</div>
		<div class="width8">${item.masterMobile ? item.masterMobile : '-'}</div>
		<div class="width8">${createTime}</div>
	</a>`

};


