/**
 * 抢修日志控制器
 */

require('../../scss/repair-log.scss');

let UI = require('../common/ui');
let $ = require('jquery');

import { model } from './model';
import { appUtil } from '../utils/app.util';
import { TodoTasksService } from '../common/service/todo.tasks.service';

var repairLogController = {
	render : {},        //
	disRepairLogBaseInfo: {},   //显示抢修单的基本信息
	disRepairProcess: {},   //显示抢修流程
	disSurveyRecords: {},   //显示查勘记录
};

$(function () {
	// 获取 repairLogId
	model.repairLogId = appUtil.getParameter('id');


	var screenHeight = ((window.innerHeight > 0) ? window.innerHeight : screen.height);
	$('#main-container').css('minHeight', screenHeight - 64);
	repairLogController.render();

	TodoTasksService.start();

	/***
     * 设为复检项
     */

	$('#re-check').click(function () {
		$('#re-check-modal').modal();
	});

	/*确认提交复检*/

	$('#btn-comfirm-reckeck').click(function () {
		var title = $.trim($('#re-check-title').val());
		var desc = $.trim($('#re-check-desc').val());

		var passCount = 0;

		if (title.length == 0) {
			$('#re-check-title-tips').text('* 复检标题不能为空');
		} else if (title.length > 30) {
			$('#re-check-title-tips').text('* 复检标题字数在30字以内');
		} else {
			$('#re-check-title-tips').text('');
			passCount++;
		}

		if (desc.length == 0) {
			$('#re-check-desc-tips').text('* 复检内容不能为空');
		} else {
			$('#re-check-desc-tips').text('');
			passCount++;
		}

		if (passCount < 2) {
			return false;
		}
		model.setToReCheckItem(title, desc).subscribe(function (result) {
			if (result.code == '0') {
				$('#re-check').attr('disabled', 'disabled');
				$('#re-check-modal').modal('hide');
				UI.notification.success('设置成功');
			}
		});
	});

	/***
     * 点击播放音频
     */

	$('body').delegate('.audio', 'click', function () {
		var url = $(this).attr('url');
		appUtil.playAudio(url)
	});

	/*点击录音按钮*/

	$('#survey-record-con,#repair-result-con').delegate('.voice', 'click', function () {
		var voiceList = $(this).find('input.voice-item');

		$('#voice-overlay').remove();

		var html = '';

		html += '<div style="height:100vh;width:100vw;padding-top:40vh;z-index:999;background:rgba(0,0,0,0.6);position:fixed;top:0px;left:0px;text-align:center;" id="voice-overlay">';

		html += '<div style="text-align:center;display:inline-block;width:64px;height:64px;background:#0091dc;margin:0px 5px;padding:5px;cursor:pointer;color:#fff" src="' + $(voiceList[0]).val() + '" class="voice"><img src="images/voice-1.png"/><br />录音1</div>';
		for (var i = 1; i < voiceList.length; i++) {
			html += '<div style="text-align:center;display:inline-block;width:64px;height:64px;background:#eee;margin:0px 5px;padding:5px;cursor:pointer" src="' + $(voiceList[i]).val() + '" class="voice"><img src="images/voice.png"/><br />录音' + (i + 1) + '</div>';
		}
		html += '<div class="height100"></div>';
		html += '<audio src="' + $(voiceList[0]).val() + '" autoplay controls="controls" style="width:100%;position:absolute;bottom:0px;width:100%;left:0px" id="audio-player"></audio>';

		html += '</div>';
		$('body').append(html);

		/*点击播放*/

		$('#voice-overlay .voice').click(function (e) {

			$('#voice-overlay .voice').find('img').attr('src', 'images/voice.png');
			$('#voice-overlay .voice').css('background', '#eee');
			$('#voice-overlay .voice').css('color', '#000');

			$(this).find('img').attr('src', 'images/voice-1.png');
			$(this).css('background', '#0091dc');
			$(this).css('color', '#ffffff');

			e.stopPropagation();
			$('#audio-player').attr('src', $(this).attr('src'));
		});

		$('#voice-overlay').click(function () {
			$(this).fadeOut(300, function () {
				$('#voice-overlay').remove();
			});
		});
	});


});


repairLogController.render = function(){
	var repairLogId = repairLogController.repairLogId;
	model.getRepairLogById(repairLogId).subscribe(function (res) {
		if (res) {
			repairLogController.disRepairLogBaseInfo();
			repairLogController.disSurveyRecords();
			repairLogController.disRepairProcess();
		}
	});
};

/***
 * 显示抢修单的基本信息
 */

repairLogController.disRepairLogBaseInfo = function () {
	var log = model.log;
	$('#bug-desc').text(log.problemDesc);
	$('#power-room').text(log.pr.prName);
	$('#power-room').attr('href', 'power-room.html?prid=' + log.pr.id);
	$('#power-room-address').text(log.pr.province + ' ' + log.pr.city + ' ' + (log.pr.area ? log.pr.area : '') + ' ' + log.pr.address);
	$('#power-room-grade').text(log.pr.prGrade.grade);
	$('#power-room-teamer-mobile').text('------------');
	$('#power-room-customer').text(log.pr.customer.cusName);
	$('#power-room-customer-mobile').text(log.pr.customer.lxr1Mobile);
	if (log.inContact == '1' && log.qxProgramme != null) {
		$('#repair-programme').text(log.qxProgramme);
		$('#repair-programme-panel').css('display', 'block');
	} else {
		$('#repair-programme-panel').css('display', 'none');
	}

	!log.isReCheck && $('#re-check').removeAttr('disabled');


	var repairTask = model.repairTask;
	var dom = '';
	if(repairTask){
		dom += '<div class="height10"></div>';
		dom += '<div style="display:flex;">';
		var pics = repairTask.picUrl.length>0?repairTask.picUrl.split(','):[];
		if(pics.length >0){
			dom += '<div style="width:64px;height:64px;overflow:hidden;border:1px solid #ccc;display:flex; align-items:center;">';
			for(var i=0; i<pics.length; i++){
				dom += '<a href="'+pics[i]+'" class="repair-pic" data-fancybox-group="gallery">';
				dom += '<img src="'+pics[i]+'" width="64">';
				dom += '</a>';
			}
			dom += '</div>';
		}
		dom += '<div style="width:20px">';
		dom += '</div>';
		var voices = repairTask.recordUrl?repairTask.recordUrl.split(','):[];
		if(voices.length > 0){
			dom += '<div>';
			if(voices.length > 0){
				dom += '<div class="voice">';
				for(var i=0; i<voices.length; i++){
					dom += '<input type="hidden" class="voice-item" value="'+voices[i]+'">';
				}
				dom += '<img src="images/voice.png">';
				dom += '<div>录音</div>';
				dom += '</div>';
			}
			dom += '</div>';
		}

		dom += '</div>';
		dom += '<div class="height10">';
		dom += '</div>';
		dom += '<div>';
		dom += repairTask.taskDesc;
		dom += '</div>';
		dom += '<div class="height10">';
		dom += '</div>';
		dom += '</div>';
	}else{
		dom = '无抢修记录';
	}


	$('#repair-result-con').html(dom);

	$('.repair-pic').fancybox();

};

/***
 * 显示抢修流程
 */

repairLogController.disRepairProcess = function () {

	$('#repair-proccess').empty();
	var proccessHtml = '';
	var timeHtml = '';

	timeHtml += '<div>'+model.alarmTime+'</div>';

	proccessHtml += '<div class="circle-success"><div>√</div></div>';


	proccessHtml += '<div class="bar-success" style="margin-left:-2px;"></div>';
	proccessHtml += '<div class="circle-success" style="margin-left:-2px;"><div>√</div></div>';
	timeHtml += '<div>' + model.startSurveyTime + '</div>';

	proccessHtml += '<div class="bar-success"  style="margin-left:-2px;"></div>';
	proccessHtml += '<div class="circle-success"  style="margin-left:-2px;"><div>√</div></div>';
	timeHtml += '<div>' + model.startRepairTime + '</div>';



	proccessHtml += '<div class="bar-success"  style="margin-left:-2px;"></div>';
	proccessHtml += '<div class="circle-success"  style="margin-left:-2px;"><div>√</div></div>';
	timeHtml += '<div>' + model.completeRepairTime + '</div>';


	$('#repair-proccess').html(proccessHtml);
	$('#repair-proccess-time').html(timeHtml);

	// if (result.repairPeople != null && result.repairPeople.length != 0) {
	//     $("#repair-excutor").html("执行者：" + result.repairPeople);
	// }

};

/***
 * 显示查勘记录
 */

repairLogController.disSurveyRecords = function () {

	var surveyTasks = model.surveyTasks;
	var listLength = surveyTasks.length;

	$('#survey-record-con').empty();
	if (listLength == 0) {
		$('#survey-record-con').html('<div class="am-u-lg-12">无查勘记录</div>');
		return false;
	}

	var html = '';
	var divWidth = 313;
	var divMinWidth = (940 - 313) / (listLength - 1);

	for (var i = 0; i < listLength; i++) {
		html = '';
		if (listLength > 3 && i < listLength - 1) {
			html += '<div style="width:' + divMinWidth + 'px" class="survey-record font14 common-record">';
		} else if (listLength > 3 && i == listLength - 1) {
			html += '<div style="width:' + divWidth + 'px" class="font14 common-record">';
		} else {
			if (i == 0) {
				html += '<div style="overflow:hidden;white-space:nowrap;padding:20px 0;width:' + divWidth + 'px;" class=" font14">';
			} else {
				html += '<div style="overflow:hidden;white-space:nowrap;padding:20px 0;border-left:1px solid #eee;width:' + divWidth + 'px;" class=" font14">';
			}
		}


		if (surveyTasks[i].isAccept == '0') {
			html += '<div>';
			html += '已向 ' + (surveyTasks[i].qxPeople?surveyTasks[i].qxPeople:'')  + ' 派遣查勘任务';
			html += '<div class="height10"></div>';
			html += '状态：未接单';

			html += '</div>';
		} else if (surveyTasks[i].isAccept == '1' && surveyTasks[i].isComplete == '0') {
			html += '<div>';
			html += '已向 ' + (surveyTasks[i].qxPeople?surveyTasks[i].qxPeople:'') + ' 派遣查勘任务';
			html += '<div class="height10"></div>';
			html += '状态：已接单，正在查勘';
			html += '</div>';
		} else {

			if (listLength < 3) {
				html += '<div style="display:flex;width:' + (parseFloat(divWidth) - 80) + 'px;">';
			} else {
				html += '<div style="display:flex;width:' + (parseFloat(divWidth) - 80) + 'px;">';
			}
			var picList = surveyTasks[i].picUrl?surveyTasks[i].picUrl.split(','):[];
			if(picList.length > 0){
				html += '<div style="width:64px;height:64px;overflow:hidden;border:1px solid #ccc;display:flex; align-items:center;">';
				for (var j = 0; j < picList.length; j++) {
					html += '<a href="' + picList[j] + '" class="bigpic' + i + '" data-fancybox-group="gallery"><img src="' + picList[j] + '"  width="64"/></a>';
				}
				html += '</div>';
				html += '<div style="width:20px"></div>';

			}
			html += '<div>';
			var voiceList = surveyTasks[i].recordUrl?surveyTasks[i].recordUrl.split(','):[];
			if(voiceList.length > 0){

				html += '<div class="voice">';
				for (var j = 0; j < voiceList.length; j++) {
					html += '<input type="hidden" class="voice-item" value="' + voiceList[j] + '">';
				}
				html += '<img src="images/voice.png"/><br/>';
				html += '录音';
				html += '</div>';
			}

			html += '</div>';
			html += '</div>';
			html += '<div class="height10"></div>';
			html += '<div>' + surveyTasks[i].lastModifyTime.slice(0, 19) + '</div>';
			html += '<div class="height10"></div>';
			html += '<div>' + surveyTasks[i].taskDesc + '</div>';
			html += '<div class="height10"></div>';
			html += '<div>执行者：' + surveyTasks[i].qxPeople + '</div>';

		}


		html += '</div>';

		$('.bigpic' + i).fancybox();


		$('#survey-record-con').append(html);
	}

	$('.survey-record').hover(function () {
		$(this).stop().animate({width: divWidth + 'px'}, 300);
	},
	function () {
		$(this).stop().animate({width: divMinWidth + 'px'}, 300);
	}
	);

};