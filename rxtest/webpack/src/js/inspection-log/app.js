/**
 * 巡检日志详情
 */
require('../../scss/inspection-log.scss');

const $ = require('jquery');

import { appUtil } from '../utils/app.util';
import { http } from '../utils/http.util';
import { appModel } from '../common/app-model';
import { model, checkType } from './model';
import { dateUtil } from '../utils/date.util';
import { UI } from '../common/ui';
import { TodoTasksService } from '../common/service/todo.tasks.service';


let app = {
	bind: {},	// 事件绑定
	disPowerRoomInfo: {},    //展示配电室信息
	disInspectionLogDetail: {},    //展示巡检日志详情

}
$(function () {
	model.id = appUtil.getParameter('id');
	let screenHeight = ((window.innerHeight > 0) ? window.innerHeight : screen.height);
	$("#main-container").css("minHeight", screenHeight - 64);
	app.bind();
	app.disInspectionLogDetail();
	TodoTasksService.start();
})

// 事件绑定
app.bind = function(){
	$(".tab-item").click(function(){
		let index = $(this).index();
		$(".tab-item").removeClass('active');
		$(this).addClass('active');

		$('.tab-panel').hide();
		$('.tab-panel:eq('+index+')').show();
	})

	// 点击巡检项 如果有问题
	$("body").delegate('.check-item', 'click', function(){
		let status = $(this).data("status");
		if(status === 2){
			let itemId = $(this).data('id');
			let taskId = model.id;
			let source = $(this).data('type');
			model.getRepairOrderOfItem(taskId, itemId, source).subscribe( res => {
				if(res.code === 200){
					
					location.href = 'inspection-bug.html?bid='+res.body.problemId;
				
				}
			})
		}
	})
}

/***
 * 展示配电室信息
 */
app.disPowerRoomInfo = function (prId) {
	appModel.getPowerRoomById(prId).subscribe(function (res) {
		if (res.code === 200) {
			let pr = res.body;
			$(".pr-name").text(pr.prName);
			$("#customer-name").text(pr.cusName);
			$("#customer-mobile").text(pr.lxr1Mobile);
			$("#pr-address").text((pr.province ? pr.province : '') + ' ' + (pr.city ? pr.city : '') + ' ' + (pr.area ? pr.area : ""));
		}
	})
}

/**
 * 展示巡检日志详情
 */
app.disInspectionLogDetail = function () {
	
	model.getInspectinLogById().subscribe(res => {
		if (res.code === 200) {
			let log = res.body;
			this.disPowerRoomInfo(log.prId);

			$("#arrange-date").text(log.xjDate);

			dateUtil.setDate(log.startTime);
			$("#start-time").text(dateUtil.getFormattedDate('yyyy-MM-dd hh:mm'));

			dateUtil.setDate(log.endTime);
			$("#end-time").text(dateUtil.getFormattedDate('yyyy-MM-dd hh:mm'));

			$("#group-name").text(log.employeeName);

			// 巡检项的类别
			let type = {
				common : 1,
				recheck : 2,
				burst : 3
			}
			
			// 日检
			app.renderCheckItems(log.dayItems, type.common , 'day-item-panel',);
			$("#day-item-count").text(log.dayItems.length);

			// 周检
			app.renderCheckItems(log.weekItems, type.common , 'week-item-panel');
			$("#week-item-count").text(log.weekItems.length);

			// 月检
			app.renderCheckItems(log.monthItems, type.common , 'month-item-panel');
			$("#month-item-count").text(log.monthItems.length);

			// 复检
			app.renderCheckItems(log.fjLogs, type.recheck , 'recheck-item-panel');
			$("#recheck-item-count").text(log.fjLogs.length);

			//突发
			app.renderCheckItems(log.tfLogs, type.burst , 'burst-item-panel');
			$("#burst-item-count").text(log.tfLogs.length);
		}
	})
}

app.createCheckItem = function(item, type , index){
	let statusInfo = ["<span class='color-success'>正常</span>", "<span class='color-warning'>异常已解决</span>", "<span class='color-danger'>异常已提交</span>"];
	return `
	<tr class="check-item" data-id="${item.itemId}" data-status="${item.status}" data-type="${type}">
		<td>${index + 1}</td>
		<td class="ellipsis" title="${item.checkItem}">${item.checkItem}</td>
		<td>${statusInfo[item.status]}</td>
	</tr>
	`;
}

app.renderCheckItems = function(items, type, domId){

	// 日检
	let length = items.length;

	let nodes = '';
	for (let i = 0; i < length; i++) {
		nodes += app.createCheckItem(items[i],type, i);
	}

	let html = `
		<table>
			<tr>
				<td class="width10">序号</td>
				<td class="width75">巡检项目</td>
				<td class="width15">状态</td>
			</tr>
			${nodes}
		</table>
	`

	if( items.length === 0){
		html = `
		<div class="empty-tips" id="empty-tips" style="display:block">
			<i class="iconfont">&#xe622;</i>
			<div>该栏目下暂时没有项目</div>
		</div>
		`
	}

	$("#"+domId).html(html);

}