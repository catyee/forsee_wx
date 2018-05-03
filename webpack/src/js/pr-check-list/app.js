
require('../../scss/common/common.scss');
require('../../scss/pr-check-list.scss');
let $ = require('jquery');
require('../common/power-room-common-controller');
import { UI } from '../common/ui';
import { CheckListTemplateSelector } from '../../components/check-list-template-selector/component';

import { model } from './model';
import { appUtil } from '../utils/app.util';
import { dateUtil } from '../utils/date.util';
import { helper } from './helper';
import { CheckListClassifyEditor } from '../../components/check-list-classify-editor/component';
import { BurstToCheckItemEditor } from '../../components/burst-to-check-item-editor/component';
import { powerRoomModel } from '../common/power-room-model';
import { userInfo } from '../common/service/user.info.service';
import { ROLES } from '../common/app-enum';
import { TodoTasksService } from '../common/service/todo.tasks.service';

var app = {
	init: {},	//初始化页面
	bind: {},	//事件绑定

	render: {},	// 渲染页面
	renderCheckList: {},	// 渲染巡检类列表
	renderRecheckList: {},	// 
	renderBurstList: {}
};

$(function () {
	app.init();
});

app.init = function () {
	model.prId = appUtil.getParameter('id');
	this.bind();
	this.render();
	TodoTasksService.start();
}

app.bind = function () {

	let _this = this;

	// 切换tab
	$('.tab').click(function () {
		var index = $('.tab').index($(this));
		$('.tab').removeClass('active');
		$(this).addClass('active');

		$('.tab-panel').removeClass('active');
		$('.tab-panel:eq(' + index + ')').addClass('active');

		const addClassifyBtn = $("#add-classify");

		if(index === 0){
			addClassifyBtn.show();
		}else{
			addClassifyBtn.hide();
		}
	});

	// 实现巡检分类的抽屉效果
	$('#classify-container').delegate('.classify', 'click', function () {

		if ($(this).hasClass('active')) {
			return false;
		}

		$('.classify .classify-body').slideUp(300);
		$(this).find('.classify-body').slideDown(300);
		$('.classify').removeClass('active');
		$(this).addClass('active');
	})

	/***
	 * 添加一个巡检大类
	 */

	$('#add-classify').click(function () {
		CheckListClassifyEditor.show().subscribe(classify => {
			_this.saveClassify(classify);
		})
	});

	/***
	 * 删除巡检分类
	 */

	$('#classify-container').delegate('.remove', 'click', function (e) {

		let classifyId = $(this).data('classify-id');

		UI.confirm({
			tip: '确认删除吗',
			rightBtnClick: function(){
				model.removeCheckClassify(classifyId).subscribe( res => {
					if(res.success){
						UI.Notification.success('删除成功');
						_this.render();
					}else{
						UI.Notification.error(res.message);
					}
				})
			}
		})

		e.stopPropagation();
	});

	// 编辑分类
	$('#classify-container').delegate('.edit', 'click', function (e) {

		const index = $(this).data('index');
		const classify = model.checkList[index];
		CheckListClassifyEditor.show(classify).subscribe( classify => {
			classify.routineItems = [];
			_this.saveClassify(classify);
		})

		e.stopPropagation();
	})

	// 使用模板
	$('#classify-container').delegate('.use-tpl', 'click', function (e) {

		const index = $(this).data('index');
		const classify = model.checkList[index];
		CheckListTemplateSelector.show().subscribe( _classify => {
			classify.dayItems = _classify.dayItems;
			classify.weekItems = _classify.weekItems;
			classify.monthItems = _classify.monthItems;
			_this.saveClassify(classify);
		})

		e.stopPropagation();
	})

	// 删除复检项
	$("#re-check-list").delegate('.remove', 'click', function(){
		let id = $(this).data('id');
		UI.confirm({
			tip: '确认移除该复检项吗',
			rightBtnClick: function(){
				model.removeRecheckItem(id).subscribe(res => {
					if(res.code === 200){
						UI.Notification.success(`移除成功`);
						app.renderRecheckList();
					}else{
						UI.Notification.error(`移除失败[${res.code}]`);
					}
				})
			}
		})
	})

	// 将突发设置为巡检
	$('#burst-table').delegate('.edit', 'click', function (e) {
			let id = $(this).data('id');
			let content = $(this).data('content');

			BurstToCheckItemEditor.show({
				id : id,
				prId: model.prId,
				content: content
			}).subscribe( data => {
				let param = {
					itemId: id,
					checkItem: data.itemName,
					prId: model.prId,
					checkType: data.checkType,
					cycle: data.checkDate,
					categoryId: data.classify
				}

				model.setBurstToCheckItem(param).subscribe(res => {
					if(res.code === 200){
						UI.Notification.success('设置成功');
						app.renderBurstList();
						app.renderCheckList();
					}else{
						UI.Notification.error('设置失败['+res.code+']');
					}
				})
			})
	})


	/**
	 * 忽略突发
	 */

	$('#burst-table').delegate('.remove', 'click', function (e) {
		let id=$(this).data('id');
		UI.confirm({
			tip: '确认删除复检项吗',
			rightBtnClick: function () {
				model.ignoreBurstItem(id).subscribe(res => {
					if(res.code === 200){
						UI.Notification.success('操作成功');
						app.renderCheckList();
						app.renderBurstList();
					}else{
						UI.Notification.success('操作失败['+res.code+']');
					}
				})
			}
		})
	});

	$('#modal-confirm-remove-emer').click(function () {
		var emergencyId = $('#ignore-emergency-id').val();
		model.setIgnoreEmergencyItem(emergencyId).subscribe(function () {
			app.initEmergencyItemList();
			$('#ignore-emergency-confirm').modal('hide');
		});
	});
}

// 渲染页面
app.render = function(){
	this.renderCheckList();
	this.renderRecheckList();
	this.renderBurstList();
}

// 渲染巡检列表
app.renderCheckList = function(){
	model.getCheckClassifyList().subscribe(list => {

		const container = $("#classify-container");
		let html = '';
		let length = list.length;
		for(let i=0; i<length; i++){
			html += helper.createCheckClassify(i, list[i]);
		}

		container.html(html);

		if(length > 0){
			$("#empty-check-classify-tips").hide();
		}else{
			$("#empty-check-classify-tips").show();
		}

	})
}


/**
 * 保存巡检大类
 */

app.saveClassify = function (classify) {
	model.saveClassify(classify.categoryId, classify.categoryName).subscribe(res => {
		if(res.success){

			classify.categoryId = res.classifyId;
			model.saveCheckItems(classify).subscribe(res1 => {
				if(res1.success){
					// 保存好了之后重新渲染
					this.render();
				}else{
					UI.Notification.error(res1.message);
				}
			})

		}else{
			UI.Notification.error(res.message);
		}
	})
};


// 渲染复检项
app.renderRecheckList = function(){
	model.getRecheckItemList().subscribe(res => {
		
		let table = $("#re-check-table");
		let container = $("#re-check-list");
		let emptyTips = $("#re-check-empty-tips");
		let badge = $("#re-check-badge");
		let list = res.body;
		let length = list.length;
		let html = ''
		for(let i=0; i<length; i++){
			dateUtil.setDate(list[i].createTime);
			let time = dateUtil.getFormattedDate('yyyy-MM-dd');
			html += `
				<tr>
					<td>${list[i].checkItem}</td>
					<td>${list[i].description}</td>
					<td>${time}</td>
					<td>
					`+
						(userInfo.roleId === ROLES.ZTZ ? `<span class="remove" data-id="${list[i].itemId}">移除</span>`: '-')
					+`
					</td>
				</tr>
			`
		}

		container.html(html);

		if(length){
			
			table.show();
			emptyTips.hide();
			if(userInfo.roleId == ROLES.ZTZ){
				badge.css('display','inline-block');
			}
			
		}else{
			table.hide();
			emptyTips.show();
		}


	})
}

// 渲染突发列表
app.renderBurstList = function(){
	model.getBurstItemList().subscribe( res => {
		if(res.code === 200){

			let container = $("#burst-list");
			let burstTable = $("#burst-table");
			let emptyTips = $("#burst-empty-tips");

			let list = res.body;
			let length = list.length;

			let html = '';
			for(let i=0; i<length; i++){
				dateUtil.setDate(list[i].createTime);
				let time = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm');
				html += `
					<tr>
						<td>${list[i].checkItem}</td>
						<td>${time}</td>
						<td>`+
						(userInfo.roleId === ROLES.ZTZ ?
							`<span class="edit" data-id="${list[i].itemId}" data-content="${list[i].checkItem}">设置为巡检</span>
							<span class="remove" data-id="${list[i].itemId}">忽略</span>` : '')
						+`
						</td>
					</tr>
				`
			}

			container.html(html);

			if(length){
				burstTable.show();
				emptyTips.hide();
				if(userInfo.roleId == ROLES.ZTZ){
					$("#burst-badge").css('display','inline-block');
				}
			}else{
				burstTable.hide();
				emptyTips.show();
			}

		}
	})
}