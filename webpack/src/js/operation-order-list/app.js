require('../../scss/operation-order-list.scss');
require('../common/service/user.info.service');
import { UI } from '../common/ui';
let $ = require('jquery');
let laydate = require('layui-laydate')

import { model } from './model';
import { appModel } from '../common/app-model';
import { dateUtil } from '../utils/date.util';
import { TodoTasksService } from '../common/service/todo.tasks.service';

let app = {
	init		   	: {},
	bind		   	: {},
	getOrderList 	: {},
	renderOrderList : {},	//渲染操作票列表
	getOrderDOM		: {},	//获取操作票DOM
	getPrList		: {},	//获取配电室列表
	renderPrList	: {},	//渲染配电室列表

	pagination		: null,	// 分页器
};
$(function(){
	app.init();
});

//初始化页面

app.init = function () {

	this.pagination = new UI.Pagination('pagination', 0, 1);
	this.powerRoomSelector = new UI.Selector('pr-selector');
	this.statusButtons = new UI.ButtonGroup('status-button-group');

	app.bind();
	app.getPrList();
	app.getOrderList();

	TodoTasksService.start();
};

app.bind = function(){

	this.statusButtons.change( status => {
		
		status == '0' && (status = null);

		model.status = status;
		model.page = 1;
		this.getOrderList();
	})

	let _this = this;
	// 指定动态加载css的基地址
	laydate.path = 'http://cdn.dianwutong.com/vendor/laydate/'; 
	laydate.render({
		elem: '#date-range',
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
			_this.getOrderList();
		
		}
	})


	/*跳转到详情*/

	$('#order-container').delegate('.order-item', 'click', function(){
		var id= $(this).data('id');
		window.location.href= 'operation-order-detail.html?id='+id;
	});

};

//获取操作票列表

app.getOrderList = function () {
	model.getOrderList().subscribe(function (res) {
		if(res){
			app.renderOrderList();
		}else {
		}
	});
};

//渲染操作票列表

app.renderOrderList = function () {
	var orderList = model.orderList;
	var length = orderList.length;
	$('#poeration-order-con tr:gt(0)').remove();

	if(model.orderNumber == 0){
		$('#notickets').css('display','block');
		$('#tickets-con').css('display','none');
		$('#notickets').empty();
	}else {
		$('#notickets').css('display', 'none');
		$('#tickets-con').css('display', 'block');
		for(var i = 0; i < length; i++){
			$('#poeration-order-con').append(app.getOrderDOM(orderList[i]));
		}
	}

	this.pagination.update(model.totalPage, model.page);
};

//获取操作票DOM

app.getOrderDOM = function (item) {
	var dom = '';
	dom += '<tr class="order-item" order-id="'+item.id+'">';
	dom += '<td>'+item.pr.prName+'</td>';
	dom += '<td>'+item.fileNum+'</td>';
	dom += '<td>'+(item.createTime?item.createTime.slice(0, -2):'')+'</td>';
	dom += '<td>'+item.checkStatus+'</td>';
	dom += '<td>'+item.completeStatus+'</td>';
	dom += '</tr>';
	return dom;
};

//获取配电室列表

app.getPrList = function () {
	appModel.getPrList().subscribe(list => {

		const options = [];
		const length = list.length;

		options.push({
			content: '请选择配电室',
			value: '-1'
		})
		for(let i=0; i<length; i++){

			options.push({
				value: list[i].prId,
				content: list[i].prName
			})

		}
		this.powerRoomSelector.update(options);
	});
};

//渲染配电室列表

app.renderPrList = function () {
	var prList = model.prList;
	var length = prList.length;

	var tpl = '<option value="{{id}}">{{content}}</option>';
	$('#power-room>option:gt(0)').remove();
	for(var i = 0; i < length; i++){
		var pr = tpl.replace('{{id}}', prList[i].id)
			.replace('{{content}}', prList[i].prName);
		$('#modal-add-order-power-room').append(pr);
		$('#power-room').append(pr);
	}
};

//获取操作票模板列表

app.getOrderTplList = function(){
	model.getOrderTplList().subscribe(function (res) {
		if(res.code == '0'){
			for(var i in res.list){
				$('#modal-order-type').append('<option value="'+res.list[i].id+'">'+res.list[i].name+'</option>');
			}
		}
	});
};



