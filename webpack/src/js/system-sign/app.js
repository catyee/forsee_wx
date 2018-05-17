require('../../scss/system-sign.scss');

let $ = require('jquery');

import {UI} from '../common/ui';
import { DDNManager } from './ddns.namager';
import { POSITIONCLASSIFY } from '../common/app-enum';
import { appModel } from '../common/app-model';
import { http } from '../utils/http.util';
import { userInfo } from '../common/service/user.info.service';
import { TodoTasksService } from '../common/service/todo.tasks.service';

let app = {
	init: {}, 
	bind: {},
	initPrList: {},
	initLocation: {},	// 初始化位置分类
	searchDDNs: {}, 	// 搜索调度号
	renderDDNs: {},	// 渲染调度号
	sign: {},			// 挂牌
	cancelSign: {},		// 取消挂牌
	filter: {},	// 过滤条件
	currentDDN: {}, // 当前调度号，待操作的调度号
	pagination: null,	// 分页器
};

app.init = function () {
	this.pagination = new UI.Pagination('pagination', 0, 1);
	this.prSelector = new UI.Selector('pr-selector');
	this.locationSelector = new UI.Selector('location-selector');
	this.statusBtns = new UI.ButtonGroup('status-btns')
	this.bind();
	this.initLocation();
	this.initPrList();
	TodoTasksService.start();
};

app.bind = function () {

	// 翻页

	this.pagination.messager.subscribe( page => {
		app.renderDDNs(page);
	})

	// 选择配电室

	this.prSelector.change( data => {
		app.filter.prId = data.value;
		app.searchDDNs();
	})
	

	// 位置发生变化

	this.locationSelector.change( data => {
		let location = data.value;
		app.filter.location = location;
		app.searchDDNs();
	});

	// 状态发生变化

	this.statusBtns.change( status => {
		app.filter.status = (status == '-1' ? null : status);
		app.searchDDNs();
	});

	// 点击挂牌

	$('#ddns-list').delegate('.sign', 'click', function () {
		let type = $(this).data('type');
		let parent = $(this).parent();
		let index = parent.data('index');
		let item = DDNManager.list[index];

		app.currentDDN = {
			ddn: item.ddNum,
			ddnId: item.ddnId,
			type: type,
			index: index,
			action: 'sign'
		};

		$('#modal-sign-ddn').text(`${item.ddNum}(${item.deviceName})`);
		$('#modal-sign-name').text(`${type == '1' ? '检修挂牌' : '倒闸挂牌'}`);

		$('#sign-confirm-modal').modal('show');

	});

	// 点击确认挂牌

	$('#confirm-sign').click(function () {

		app.sign();

	});

	// 点击取消挂牌

	$('#ddns-list').delegate('.cancel-sign', 'click', function () {
		let parent = $(this).parent();
		let index = parent.data('index');
		let item = DDNManager.list[index];

		app.currentDDN = {
			ddnId: item.ddnId,
			index: index,
			action: 'cancel-sign'
		};

		$('#cancel-modal-sign-ddn').text(`${item.ddNum}(${item.deviceName})`);

		$('#cancel-sign-confirm-modal').modal('show');

	});

	// 确认取消挂牌

	$('#cancel-confirm-sign').click(function () {
		app.cancelSign();
	});
}

// 初始化配电室列表

app.initPrList = function () {

	appModel.getPrList().subscribe((list) => {
		let html = '';

		let options = [];

		for (let i = 0; i < list.length; i++) {
			options.push({
				value : list[i].prId,
				content: list[i].prName
			})
		}

		if (list && list.length > 0) {
			app.filter.prId = list[0].prId;
		}

		this.prSelector.update(options, app.filter.prId);

		if (list.length == 0) {

			$('#ddns-list').html('<tr><td colspan="5" style="text-align: center;line-height: 40px">找不到你的配电室</td></tr>');

		} else {
			app.searchDDNs();
		}
	});
};

// 初始化位置分类

app.initLocation= function () {

	let html = '';
	let options = [];

	options.push({
		content: '请选择位置分类',
		value: ''
	})

	for (let i = 1; i < POSITIONCLASSIFY.length; i++) {

		html += `
			<option value="${POSITIONCLASSIFY[i].value}">${POSITIONCLASSIFY[i].content}</option>
		`
		options.push({
			value : POSITIONCLASSIFY[i].value,
			content: POSITIONCLASSIFY[i].content
		})
	}

	this.locationSelector.update(options, options[0].value);

}

app.searchDDNs = function () {

	if (!app.filter.prId) {
		return false;
	}

	let param = {
		prId: app.filter.prId,
		location: (app.filter.location == '-1' ? null : app.filter.location),
		status: (app.filter.status == '-1' ? null : app.filter.status),
		currentPage: 1,
		pageSize: 10000000
	}

	http.get('/dwt/iems/basedata/prvar/gua_pai_query', param).subscribe(res => {

		if (res.code == 0 && res.pageResult && res.pageResult.records) {

			DDNManager.update(res.pageResult.records);
			app.renderDDNs(1);

		}

	});
};

app.renderDDNs = function (page) {

	let ddns = DDNManager.getPageDDNs(page);

	let tbody = '';
	for (let i = 0; i < ddns.length; i++) {

		tbody += `
			<tr>
				<td>${(page - 1) * DDNManager.pageSize + (i + 1)}</td>
				<td>${ddns[i].ddNum}</td>
				<td>${ddns[i].deviceName}</td>
				<td>${ddns[i].gpType ? (ddns[i].gpType == '1' ? '检修挂牌' : '倒闸挂牌') : '未挂牌'}</td>`;


		if ('IEMS_SYS_SIGN_UPDATE' in userInfo.privilege) {
			tbody += `<td data-index="${(page - 1) * DDNManager.pageSize + (i)}">`;
			if (ddns[i].gpType) {

				tbody += `
				<a href="javascript:;" class="cancel-sign">取消挂牌</a>
			`;

			} else {
				tbody += `
				<a href="javascript:;" class="sign" data-type="1">检修挂牌</a>
				<a href="javascript:;" class="sign" data-type="2">倒闸挂牌</a>
			`;
			}
			tbody += '</td>';
		}

		tbody += '</tr>';
	}

	$('#ddns-list').html(tbody);

	this.pagination.update(DDNManager.totalPage, page);

};

// 挂牌

app.sign = function () {

	let param = {
		ddnId: this.currentDDN.ddnId,
		status: 1,
		gpType: this.currentDDN.type
	}

	http.post('/dwt/iems/basedata/prvar/gua_pai', param).subscribe(res => {

		if (res.code == '0') {
			DDNManager.list[this.currentDDN.index].gpType = this.currentDDN.type;
			this.renderDDNs(DDNManager.page);
			$('#sign-confirm-modal').modal('hide');
		}

	});

};


// 取消挂牌

app.cancelSign = function () {

	let param = {
		ddnId: this.currentDDN.ddnId,
		status: 0,
		gpType: 0
	};


	http.post('/dwt/iems/basedata/prvar/gua_pai', param).subscribe(res => {

		if (res.code == '0') {
			DDNManager.list[this.currentDDN.index].gpType = 0;
			this.renderDDNs(DDNManager.page);
			$('#cancel-sign-confirm-modal').modal('hide');
		}

	});

};

$(function () {
	app.init();
});