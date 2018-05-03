require('../../scss/work-order-list.scss');
require('../common/service/user.info.service');

let $ = require('jquery');
let laydate = require('layui-laydate')
import { UI } from '../common/ui';
import { model } from './model';
import { appModel } from '../common/app-model';
import { TodoTasksService } from '../common/service/todo.tasks.service';

let app = {
	init : {},		//初始化
	bind : {}, 		//事件绑定

	getPrList	 		: {},	//获取配电室列表
	renderPrList		: {},	//渲染配电室列表

	getOrderList 		: {}, 	//获取工作票列表
	renderOrderList		: {},	//渲染工作票列表
	getOrderDOM			: {},	//获取工作票DOM

	getOrderTplList		: {},	//获取工作票模板列表

	pagination 			: null,	//分页器
};

$(function(){
	app.init();
});

app.init = function(){

	this.pagination = new UI.Pagination('pagination', 0, 1);
	this.powerRoomSelector = new UI.Selector('power-room-selector');
	this.statusButtons = new UI.ButtonGroup('status-button-group');

	app.bind();
	app.getPrList();
	app.getOrderList();
};

//事件绑定

app.bind = function(){

	this.pagination.messager.subscribe( page => {
		model.page = page;
		this.getOrderList();
	})

	this.statusButtons.change( status =>{
		model.status = status;
		model.page = 1;
		this.getOrderList();
	})

	this.powerRoomSelector.change(data => {
		model.prId = data.value;
		alert(model.prId);
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


	/*查看详情*/

	$('#work-order-con').delegate('.order-item', 'click', function(){
		let id = $(this).attr('order-id');
		window.location.href = 'work-order-detail.html?d='+id;
	});

	TodoTasksService.start();
	
};

//渲染配电室列表

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

//获取工作票列表

app.getOrderList = function(){
	model.getOrderList().subscribe(function (res) {
		if(!res || model.orderNumber == 0){
			$('#work-order-con').html('');
			// moni.emptyTips('搜索不到工作票', 'notickets');
			$('#notickets').css('display', 'block');
		}else{
			app.renderOrderList();
			$('#notickets').css('display', 'none');
		}
	});
};

//渲染工作票列表

app.renderOrderList = function () {
	let orderList = model.orderList;
	let length = orderList.length;
	$('#work-order-con tr:gt(0)').remove();
	for(let i = 0; i < length; i++){
		$('#work-order-con').append(app.getOrderDOM(orderList[i]));
	}
	this.pagination.update(model.totalPage, model.page);
};

//获取工作票DOM

app.getOrderDOM = function (item) {

	let orderTpl  = '<tr class="order-item" order-id={orderId}>'+
		'<td class="piao-body-body-1">{powerRoom}</td>'+
		'<td class="piao-body-body-1">{orderNumber}</td>'+
		'<td class="piao-body-body-2">{createTime}</td>'+
		'<td class="piao-body-body-2">{status}</td>'+
		'<td class="piao-body-body-3">{isComplete}</td>'+
		'</tr>';

	return orderTpl.replace(/{orderId}/g,item.id)
		.replace(/{powerRoom}/g, item.pr.prName)
		.replace(/{orderNumber}/g,item.gzpNum)
		.replace(/{createTime}/g,item.createTime)
		.replace(/{status}/g,item.checkStatus)
		.replace(/{isComplete}/g, item.completeStatus);
};

//获取工作票模板列表

app.getOrderTplList = function(){
	model.getOrderTplList().subscribe(function (res) {
		if(res.code == '0'){
			for(let i in res.list){
				$('#modal-order-type').append('<option value="'+res.list[i].id+'">'+res.list[i].name+'</option>');
			}
		}
	});
};

