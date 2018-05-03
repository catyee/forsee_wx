
require('../../scss/warning-detail.scss');
require('../common/service/user.info.service');

import { UI } from '../common/ui';
import { model } from './model';
import { appModel } from '../common/app-model';
import { appUtil } from '../utils/app.util';
import { dateUtil } from '../utils/date.util';
import { ALARM_TYPES, ALARM_STATUS, ALARM_HANDLE_STATUS } from '../common/app-enum';
import { TodoTasksService } from '../common/service/todo.tasks.service';
import { RepairOrderCreator } from '../../components/repair-order-creator/component';

let $ = require('jquery');


var ctrl = {
	bind: {},			// 事件绑定
	disWarningDetail: {},     	//显示报警详情
	createRepairOrderFromSysBug: {},     	//生成抢修单

	alarm: {}
};

$(function () {

	ctrl.alarmId = appUtil.getParameter('id');
	ctrl.bind();

	//显示报警详情

	ctrl.disWarningDetail();
	TodoTasksService.start();

	return ctrl == null;
});

/***
 * 事件绑定
 */

ctrl.bind = function () {

	/*生成抢修单*/

	$('#create-order').click(function () {
		RepairOrderCreator.show({
			prId: ctrl.prId,
			content: ctrl.alarm.alarmDesc
		}).subscribe(data => {
			appModel.createRepairOrder({
				prId: data.prId,
				orderDesc: data.content,
				alarmId: ctrl.alarmId
			}).subscribe(res => {
				if (res.success) {
					window.location.href = './order-detail.html?id=' + res.id;
				} else {
					UI.Notification.error(res.message);
				}
			});
		})
	});

	// 忽略报警
	$("#ignore-alarm").click(function(){

		// 如果是实时报警 则不让忽略
		if(ctrl.alarm.alarmStatus == ALARM_STATUS.REAL_TIME){
			UI.alert({
				content: '实时报警不可忽略'
			})
			return;
		}

		UI.prompt({
			tip: '请填写忽略报警的原因',
			rightBtnClick: function(reason){
				alert(reason)
			}
		})
	})
};

/***
 * 显示报警详情
 */

ctrl.disWarningDetail = function () {

	var alarmId = ctrl.alarmId;
	model.getWarningDetailById(alarmId).subscribe(function (res) {

		if (res.code === 200) {

			let alarm = this.alarmId = res.body;
			ctrl.alarm = alarm;
			ctrl.prId = alarm.prId;

			$('#tag-name').text(alarm.varCnName ? alarm.varCnName : alarm.varShowName);

			dateUtil.setDate(alarm.alarmTime);

			$('#alarm-time').text(dateUtil.getFormattedDate('yyyy-MM-dd hh:mm:ss'));

			var alarmDesc = (alarm.ddN ? '[' + alarm.ddN + '] ' : '') + (alarm.alarmDesc ? alarm.alarmDesc : alarm.tagDesc);

			var alarmValue;

			if (alarm.varType == '1') {

				alarmValue = alarm.alarmValue.toFixed(2) + (alarm.unit ? alarm.unit : '');

				$('#alarm-value').text(alarmValue);

				//AI点显示报警设定值

				$('#threshold-value').text(
					((alarm.lowLimit || alarm.lowLimit == 0) ? "下限 " + alarm.lowLimit + alarm.unit : '')
					+ ((alarm.lowLimit || alarm.lowLimit == 0) && (alarm.topLimit || alarm.topLimit == 0) ? "，" : '')
					+ ((alarm.topLimit || alarm.topLimit == 0) ? "上限 " + alarm.topLimit + alarm.unit : '')
				);

			} else {
				//DI点根据显示方式来决定是否显示报警值

				if (alarm.showValue) {

					$('#alarm-value').text(alarm.valueDefine);

				} else {

					//从DOM中删除报警值一行

					$('#alarm-value').parent().remove();

				}

				//DI点不显示报警设定值

				$('#threshold-value').parent().remove();

			}


			var powerRoomAddress = '';
			powerRoomAddress += (alarm.pr.province ? alarm.pr.province : '');
			powerRoomAddress += ' ' + (alarm.pr.city ? alarm.pr.city : '');
			powerRoomAddress += ' ' + (alarm.pr.area ? alarm.pr.area : '');
			powerRoomAddress += ' ' + (alarm.pr.address ? alarm.pr.address : '');


			$('#alarm-desc').text(alarmDesc ? alarmDesc : '-');
			$('#alarm-tag').text(alarm.varDesc ? alarm.varDesc : '-');

			$('#alarm-type').text(ALARM_TYPES[alarm.alarmLevel]);

			$('.power-room').text(alarm.pr.prName);

			$('.power-room-address').text(powerRoomAddress);
			$('.power-room-customer').text(alarm.pr.cusName);
			$('.customer-contact').text(alarm.pr.lxr1);
			$('.customer-mobile').text(alarm.pr.lxr1Mobile);
			$('#station-name').text(alarm.pr.stationName);
			$('#station-leader').text(alarm.pr.stationMaster);
			$('#station-mobile').text(alarm.pr.masterMobile);

			$("#teamer-name").text(alarm.pr.leaderName);
			$("#teamer-mobile").text(alarm.pr.leaderMobile);

			$("#pr-desc").text(alarm.pr.prDesc);

			// 如果已经创建创建了抢修单 显示查看抢修单按钮
			if (alarm.qxOrderId) {
				$("#check-order").attr('href', '/order-detail.html?id=' + alarm.qxOrderId).css('display','inline-block');
			}else if(alarm.handleStatus === ALARM_HANDLE_STATUS.IGNORE){
				$("#ignore-content").show();
			}else {
				$("#ignore-alarm").css('display','inline-block');
				$("#create-order").css('display','inline-block');
			}

		}
	});
};


