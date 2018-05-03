/**
 * app  巡检问题详情控制器
 */

require('../../scss/inspection-bug.scss');
require('../common/service/user.info.service');
let $ = require('jquery');
window.jQuery = $;
let fancybox = require('@fancyapps/fancybox');
import { appUtil } from '../utils/app.util';
import { dateUtil } from '../utils/date.util';
import { UI } from '../common/ui';
import { model } from './model';
import { powerRoomModel } from '../common/power-room-model'
import { RepairOrderCreator } from '../../components/repair-order-creator/component';
import { appModel } from '../common/app-model';
import { INSPECT_BUG_STATUS } from '../common/app-enum';
import { TodoTasksService } from '../common/service/todo.tasks.service';


var app = {
	init: {}, 				//初始化
	disBugDetail: {},        //显示问题详情
	createRepairOrder: {},       //由巡检问题生成抢修单
	renderPrInfo: {},
};

$(function () {
	app.init();
});

app.init = function () {

	// 获取 bugId
	model.bugId = appUtil.getParameter('bid');
	this.bind();
	this.disBugDetail();
	TodoTasksService.start();

};

app.bind = function () {

	$('#media').delegate('.audio', 'click', function () {
		var url = $(this).attr('url');
		UI.startPlayAudio(url);
	});

	$("#unhandle-button").click(function () {
		app.createRepairOrder();
	})

	$("#media").delegate('.pic', 'click', function () {

		UI.Gallery.show({
			images: model.pics
		})
	})
}
/***
 * 展示问题详情
 */

app.disBugDetail = function () {
	model.getBugById().subscribe((res) => {
		if (res.success) {
			let bugDetail = res['body'];
			let bugGrade = ['一般', '严重', '危急'];
			this.renderPrInfo(bugDetail.prId);

			// time

			let time = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm:ss', bugDetail['createTime']);
			$('.time').text("提交时间：" + time);
			$('.who').text("巡检组长：" + bugDetail.employeeName);
			$('.grade').text("问题等级：" + bugGrade[bugDetail.quesGrade]);

			// 描述

			$('.desc').text(bugDetail['problemDesc']);

			// 状态
			if (bugDetail.status === INSPECT_BUG_STATUS.UNHANDLE) {
				$("#unhandle-button").show();
			} else {
				$("#handled-button").attr('href', "./order-detail.html?id=" + bugDetail.qxOrderId);
				$("#handled-button").show();
			}

			// picture
			model.pics = [];
			try {
				let photosUrl = bugDetail.picture.split(',');
				var dom = '';

				for (var i = 0; i < photosUrl.length; i++) {
					let src = model.prefix + photosUrl[i];
					dom = '';
					dom += '<div class="pic item">';
					dom += '<img src="' + src + '"  alt=""/>';
					dom += '</div>';
					$('#media').append(dom);
					model.pics.push(src);
				}
			} catch (e) {
				console.log(e);
			}

			// audio

			try {
				var audiosUrl = bugDetail.record.split(',');
				for (let i = 0; i < audiosUrl.length; i++) {
					let url = model.prefix + audiosUrl[i];
					dom = '';
					dom += '<div class="item audio" url="' + url + '" ><img src="//cdn.dianwutong.com/ems/image/voice.png"/><span>录音' + (i + 1) + '</span></div>';
					$('#media').append(dom);
				}
			} catch (e) {
				console.log(e);
			}

		} else {
			UI.Notification.error(res.message);
		}
	});
}

app.renderPrInfo = function (prId) {
	powerRoomModel.getPowerRoomBaseInfo(prId).subscribe(res => {
		if (res.code === 200) {
			var pr = res.body;
			app.prefix = res.prefix;
			$('.pr-name').text(pr.prName);
			$('#pr-address').text(pr.address);
			$('#customer-name').text(pr.cusName);
			$('#customer-contactor').text(pr.lxr1);
			$('#customer-mobile').text(pr.lxr1Mobile);
			$('#station-name').text(pr.stationName ? pr.stationName : '-');
			$('#station-leader').text(pr.stationMaster ? pr.stationMaster : '-');
			$('#station-mobile').text(pr.masterMobile ? pr.masterMobile : '-');
			$('#pr-desc').text(pr.prDesc);
		}
	})
}

app.createRepairOrder = function () {
	RepairOrderCreator.show({
		prId: model.bugInfo.prId,
		content: model.bugInfo.problemDesc
	}).subscribe(data => {
		appModel.createRepairOrder({
			prId: data.prId,
			problemId: model.bugId,
			orderDesc: data.content
		}).subscribe(res => {
			if (res.success) {
				window.location.href = "./order-detail.html?id=" + res.id;
			} else {
				UI.Notification.error(res.message);
			}
		})
	})
}