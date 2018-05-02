require('../../scss/order-detail.scss');
require('../common/service/user.info.service');
let $ = require('jquery');
import { UI } from '../common/ui';

import { model } from './model';
import { appUtil } from '../utils/app.util';
import { appModel } from '../common/app-model';
import { dateUtil } from '../utils/date.util';
import { RepairGroupSelector } from '../../components/repair-group-selector/component';
import { TodoTasksService } from '../common/service/todo.tasks.service';

/**
 *  抢修单控制器 
 */

let app = {
	init: {},	// 初始化
	bind: {},	// 事件绑定
	render: {},	// 渲染抢修单

	sendCheck: {}, //查勘派遣
	saveJudge: {},	// 保存定性

}
$(function () {
	app.init();
})

app.init = function () {
	model.qxOrderId = appUtil.getParameter('id');	// 抢修单id
	this.destroyBtn = $("#destroy-btn");
	this.judgeBtn = $("#judge-btn");
	this.sendCheckBtn = $("#send-check-btn");
	this.sendRepairBtn = $("#send-repair-btn");
	this.setRecheckBtn = $("#set-recheck-btn");
	this.render();
	this.bind();
	TodoTasksService.start();
}

app.bind = function () {
	let _this = this;

	// 派遣查看
	this.sendCheckBtn.click(function () {
		_this.sendCheck();
	})

	// 派遣查看
	this.sendRepairBtn.click(function () {
		_this.sendRepair();
	})


	// 定性
	this.judgeBtn.click(function () {
		$("#judge-dialog").show();
	})

	// 销单
	this.destroyBtn.click(function () {
		_this.destroyOrder();
	})

	//切换合同内 合同外
	$('input[name="nature"]').change(function () {
		let nature = $('input[name="nature"]:checked').val();
		if (nature === "1") {
			$("#programme-line").show();
		} else {
			$("#programme-line").hide();
		}
	})

	// 关闭定性对话框
	$(".close-nature").click(function () {
		$("#judge-dialog").hide();
	})

	// 保存定性
	$("#save-nature").click(function () {
		_this.saveJudge();
	})

	// 设置复检
	this.setRecheckBtn.click(function(){
		UI.prompt({
			tip:'请填写复检项的内容',
			rightBtnClick: function(content){
				if(!content){
					UI.Notification.warn('内容不能为空');
					return false;
				}

				model.setReCheck(content).subscribe( res => {
					if(res.code === 200){
						window.location.reload();	
					}else{
						UI.Notification.error(`操作失败[${res.code}]`);
					}
				})
			}
		})
	})

	// 查看更多
	$("body").delegate('.record .more', 'click', function () {
		$(this).parent().next('.media').slideDown(300);
		$(this).hide(300);
	})

	// 点击图片 浏览
	$("body").delegate('.record img', 'click', function () {

		// 找出这个record下的所有图片
		const media = $(this).parent().parent().parent();
		const imgs = media.find('img');
		const urls = [];
		const length = imgs.length;
		for (let i = 0; i < length; i++) {
			urls.push($(imgs[i]).attr('src'));
		}

		// 显示
		const index = imgs.index($(this));
		UI.Gallery.show({
			images: urls,
			index: index
		})

	})

	// 点击录音 
	$("body").delegate('.record .audio', 'click', function () {
		const url = $(this).data('url');
		let content = $(this).html();
		$(this).html('正在播放');
		UI.startPlayAudio(url).subscribe(res => {
			if (res === 'ended') {
				$(this).html(content);
			}
		});
	})
}

app.render = function () {
	model.getRepairOrderBaseInfo()
		.subscribe((order) => {
			if (order) {

				model.prId = order.prId;
				this.disPowerRoomInfo(model.prId);

				// 如果已经完成了
				if (order.status === 2) {

					// 但是没有设置过复检 显示复检按钮
					if (!order.isSetFj) {
						this.setRecheckBtn.show();
					}

				} else {
					this.destroyBtn.show();

					if (order.inContact === null) {
						this.judgeBtn.show();
						this.sendCheckBtn.show();
					} else if (!order.repairTasks.length) {
						this.sendRepairBtn.show();
					}
				}

				$("#bug-desc").text(order.orderDesc);

				// 查勘记录
				let checkHtml = ''
				let checkTasks = order.checkTasks;
				let length = checkTasks.length;

				// 如果无查勘记录
				if (!length) {
					$("#check-records").html('没有查勘记录');
				}else{
					for (let i = 0; i < length; i++) {
						checkHtml += this.createCheckTaskDom(checkTasks[i]);
					}
					$("#check-records").html(checkHtml);
				}

				
				//	抢修记录
				let repairTasks = order.repairTasks;
				if(repairTasks.length){
					$("#repair-result").html(app.createCheckTaskDom(repairTasks[0]))

				}

				// 抢修方案
				// 判断是合同内还是合同外
				if (order.inContact === 0) {
					$('#programme').text('抢修单定性为“合同外”，抢修走下线流程');
				} else if (order.qxProgramme) {
					$('#programme').text(order.qxProgramme);
				} else {
					$('#programme').text('未制定抢修方案');
				}

				//　抢修流程
				let proccess = '';
				let time = '';

				// 开始报警
				proccess += '<div class="circle circle-green">√</div>';
				dateUtil.setDate(order.alarmTime);
				let alarmTime = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm:ss');
				time += `<div>${alarmTime}</div>`;

				// 开始查勘时间
				if (checkTasks.length) {
					// 如果有查看
					proccess += '<div class="line line-green"></div><div class="circle circle-green">√</div>';
					dateUtil.setDate(checkTasks[0].createTime);
					let alarmTime = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm:ss');
					time += `<div>${alarmTime}</div>`;
				} else if (repairTasks.length) {
					// 如果没有查勘 但是有抢修了
					proccess += '<div class="line line-green"></div><div class="circle circle-green">√</div>';
					time += `<div>没有安排查勘</div>`;
				} else {
					proccess += '<div class="line"></div><div class="circle">√</div>';
					time += `<div>没有安排查勘</div>`;
				}

				//　开始抢修和抢修完成
				if (repairTasks.length) {
					let task = repairTasks[0];
					proccess += '<div class="line line-green"></div><div class="circle circle-green">√</div>';
					dateUtil.setDate(task.createTime);
					let alarmTime = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm:ss');
					time += `<div>${alarmTime}</div>`;

					// 如果抢修完成了
					if (task.completeTime) {
						proccess += '<div class="line line-green"></div><div class="circle circle-green">√</div>';
						dateUtil.setDate(task.createTime);
						let alarmTime = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm:ss');
						time += `<div>${alarmTime}</div>`;
					} else {
						proccess += '<div class="line"></div><div class="circle">√</div>';
						time += `<div></div>`;
					}

				} else {
					proccess += '<div class="line"></div><div class="circle ">√</div>';
					time += `<div>没有安排抢修</div>`;

					proccess += '<div class="line"></div><div class="circle">√</div>';
					time += `<div>没有安排抢修</div>`;
				}

				$("#process-icon").html(proccess);
				$("#process-time").html(time);

			} else {
				UI.Notification.error(`获取抢修单失败[${res.code}]`);
			}
		})
}

/***
 * 展示配电室信息
 */
app.disPowerRoomInfo = function (prId) {
	appModel.getPowerRoomById(prId).subscribe(function (res) {
		if (res.code === 200) {
			var pr = res.body;
			app.prefix = res.prefix;
			$('.pr-name').text(pr.prName);
			$('#pr-address').text(pr.province + ' ' + pr.city + ' ' + (pr.area?pr.area:'' )+ ' ' + pr.address);
			$('#customer-name').text(pr.cusName);
			$('#customer-mobile').text(pr.lxr1Mobile);
			$('#station-name').text(pr.stationName?pr.stationName:'-');
			$('#station-leader').text(pr.stationMaster?pr.stationMaster:'-');
			$('#station-mobile').text(pr.stationMaster?pr.stationMaster:'-');
			$('#pr-desc').text(pr.prDesc);
		}
	})
}

// 创建一条查勘或者抢修记录的dom
app.createCheckTaskDom = function (item) {
	let startTime = '未接单';
	let completeTime = '未完成';

	if (item.isAccept) {
		dateUtil.setDate(item.acceptTime);
		startTime = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm:ss');
	}

	if (item.isComplete) {
		dateUtil.setDate(item.completeTime);
		completeTime = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm:ss');
	}

	// 图片
	let pics = item.picture ? item.picture.split(',') : [];
	let audios = item.record ? item.record.split(',') : [];

	let media = '';

	let length = pics.length;
	for (let i = 0; i < length; i++) {
		media += `
			<div class="pic">
				<div><img src="${model.prefix + pics[i]}"></div>
			</div>
		`
	}

	length = audios.length;
	for (let i = 0; i < length; i++) {
		media += `
			<div class="audio" data-url="${model.prefix + audios[i]}">
				录音${i + 1}
			</div>
		`
	}

	return `
		<div class="check-record record">
			<div>查勘人：${item.employeeName}&nbsp;&nbsp;&nbsp; 接单时间：${startTime} &nbsp;&nbsp;&nbsp;完成时间：${completeTime}</div>
			<div class="desc">
				${item.result?item.result:''} ${media? '<a class="more" href="javascript:;">更多内容</a>' : ''}
			</div>
			<div class="media">
				${media}
			</div>
		</div>
	`
}

// 查勘派遣
app.sendCheck = function () {

	model.getEmployeeList().subscribe(res => {
		if (res.code === 200) {

			RepairGroupSelector.show({
				content: '请选择一个小组进行此次查勘任务',
				groupList: res.body
			}).subscribe(data => {
				model.sendStuffToSurvey(data.value).subscribe(res => {
					if (res.code === 200) {
						window.location.reload();
					} else {
						UI.Notification.error('派遣失败[' + res.code + ']')
					}
				})
			})

		}
	})


}

// 保存定性
app.saveJudge = function () {
	let nature = $('input[name="nature"]:checked').val();
	let programme = $("#programme-textarea").val();
	if (nature === "1") {

		if (!programme) {
			$("#empty-programme-error").show();
			return false;
		} else {
			$("#empty-programme-error").hide();
		}
	}

	model.saveJudge(nature, programme).subscribe(res => {
		if (res.code === 200) {
			window.location.reload();
		} else {
			UI.Notification.error('保存失败[' + res.code + ']');
		}
	})
}

// 查勘抢修
app.sendRepair = function () {

	model.getEmployeeList().subscribe(res => {
		if (res.code === 200) {

			RepairGroupSelector.show({
				content: '请选择一个小组进行此次抢修任务',
				groupList: res.body
			}).subscribe(data => {
				model.sendStuffToRepair(data.value).subscribe(res => {
					if (res.code === 200) {
						window.location.reload();
					} else {
						UI.Notification.error('派遣失败[' + res.code + ']');
					}
				})
			})

		}
	})
}

// 销单
app.destroyOrder = function () {
	UI.confirm({
		tip: '确认销单吗',
		rightBtnClick: function () {
			model.destroyOrder().subscribe(res => {
				if (res.code === 200) {
					window.location.reload();
				} else {
					UI.Notification.error(`操作失败[${res.code}]`);
				}
			})
		}
	})
}