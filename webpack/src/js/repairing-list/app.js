require('../../scss/repairing-list.scss');
const $ = require('jquery');
let Rx = require('rxjs/Rx');

require('../common/layout-controller.js');
import { RepairOrderCreator } from '../../components/repair-order-creator/component';

import { UI } from '../common/ui';
import { userInfo } from '../common/service/user.info.service';
import { appModel } from '../common/app-model';
import { model } from './model';
import { dateUtil } from '../utils/date.util';
import { TodoTasksService } from '../common/service/todo.tasks.service';

let app = {
	init: {},	//初始化页面
	bind: {},	//事件绑定
	updateCycle: 15000,	//轮训获抢修单周期
};

$(function () {
	app.init();
});

app.init = function () {
	app.bind();
	app.getRepairingList();
	if (timer) {
		window.clearInterval(timer);
	}
	let timer = window.setInterval(app.getRepairingList, app.updateCycle);
	TodoTasksService.start();
};

app.bind = function () {
	$('#create-order-button').click(function () {
		RepairOrderCreator.show({
			content: ''
		}).subscribe(data => {
			appModel.createRepairOrder({
				prId: data.prId,
				orderDesc: data.content
			}).subscribe(res => {
				if (res.success) {
					window.location.href = './order-detail.html?id=' + res.id;
				} else {
					UI.Notification.error(res.message);
				}
			});
		});

	});
};

// 获取抢修单列表 

app.getRepairingList = function () {
	model.getRepairingList()
		.subscribe(res => {
			if (res) {
				app.renderList();
			}
		});
};


// 渲染抢修单列表

app.renderList = function () {
	let container = $('#repairing-list');
	let emptyTips = $("#empty-tips");

	container.empty(); // 清空列表
	let length = model.repairingList.length;

	if (!length) {
		container.hide();
		emptyTips.show();
		return false;
	} else {
		emptyTips.hide();
		container.show();
	}

	let html = '';

	for (let i = 0; i < length; i++) {
		let alarmTime; // 报警时间
		let startSurveyTime; // 查勘时间
		let startQxTime; // 抢修时间
		let completeQxTime; // 完成时间
		alarmTime = app.formateTime(model.repairingList[i].createTime);
		startSurveyTime = app.formateTime(model.repairingList[i].startSurveyTime);
		startQxTime = app.formateTime(model.repairingList[i].startQxTime);
		completeQxTime = app.formateTime(model.repairingList[i].completeQxTime);

		let dom = `<div class="item">
				<div class="content">
					<div class="item-header">
						<div>${model.repairingList[i].prName}</div>
						<a class="detail color-primary pointer" href='./order-detail.html?id=${model.repairingList[i].qxOrderId}' >详情</a>
					</div>
					<div class="item-content">
						<div class="step alarming">
							<div class="icon">
								<div class="dot">
									<div class="${alarmTime ? 'shadow-alarming bg-alarming' : 'shadow-without bg-without'}"></div>
									<div class="${alarmTime ? 'shadow-alarming' : 'shadow-without'}"></div>
									<div class="${alarmTime ? 'bg-alarming' : 'bg-without'}">

									</div>
									<i class="iconfont">&#xe61f;</i>
								</div>
								<div class="line"></div>
							</div>
							<div class="desc">
								<div class="${alarmTime ? '' : 'color-without'}">产生报警</div>
								<div class="${alarmTime ? '' : 'color-without'}">${alarmTime ? alarmTime : '没有记录'}</div>
							</div>
						</div>

						<div class="step inspection">
							<div class="icon">
								<div class="dot">
									<div class="${startSurveyTime ? 'shadow-inspection bg-inspection' : 'shadow-without bg-without'}"></div>
									<div class="${startSurveyTime ? 'shadow-inspection' : 'shadow-without'} "></div>
									<div class=" ${startSurveyTime ? 'bg-inspection' : 'bg-without'}">

									</div>
									<i class="iconfont">&#xe61e;</i>
								</div>
								<div class="line"></div>
							</div>
							<div class="desc">
								<div class="${startSurveyTime ? '' : 'color-without'}">开始查勘</div>
								<div class="${startSurveyTime ? '' : 'color-without'}">${startSurveyTime ? startSurveyTime : '没有记录'}</div>
							</div>
						</div>
						<div class="step repairing">
							<div class="icon">
								<div class="dot">
									<div class="${startQxTime ? 'shadow-repairing bg-repairing' : 'shadow-without bg-without'}"></div>
									<div class="${startQxTime ? 'shadow-repairing ' : 'shadow-without'} "></div>
									<div class="${startQxTime ? 'bg-repairing' : 'bg-without'} ">

									</div>
									<i class="iconfont">&#xe619;</i>
								</div>
								<div class="line"></div>
							</div>
							<div class="desc">
								<div class="${startQxTime ? '' : 'color-without'}">开始抢修</div>
								<div class="${startQxTime ? '' : 'color-without'}">${startQxTime ? startQxTime : '没有记录'}</div>
							</div>
						</div>

						<div class="step complete ">
							<div class="icon">
								<div class="dot">
									<div class="${completeQxTime ? 'shadow-complete bg-complete' : 'shadow-without bg-without'}"></div>
									<div class="${completeQxTime ? 'shadow-complete' : 'shadow-without'} "></div>
									<div class="${completeQxTime ? ' bg-complete' : 'bg-without'}">

									</div>
									<i class="iconfont">&#xe621;</i>
								</div>
							</div>
							<div class="desc">
								<div class="${completeQxTime ? '' : 'color-without'}">完成抢修</div>
								<div class="${completeQxTime ? '' : 'color-without'}">${completeQxTime ? completeQxTime : '没有记录'}</div>
							</div>

						</div>


					</div>
					<div class="item-foot pointer ellipsis" title="${model.repairingList[i].orderDesc}">
					${model.repairingList[i].orderDesc}
					</div>
				</div>
			</div>
		`;
		html += dom;
	}

	container.html(html);

};

// 时间格式化

app.formateTime = function (time) {
	if (time) {
		return dateUtil.getFormattedDate('MM-dd hh:mm', time);
	}
	return '';
};

