require('../../scss/inspection-arrange.scss');
let $ = require('jquery');
let Sortable = require('sortablejs');
let laydate = require('layui-laydate');
require('../common/service/user.info.service');
import { UI } from '../common/ui';
import { appUtil } from '../utils/app.util';
import { dateUtil } from '../utils/date.util';
import { model } from './model';
import { TodoTasksService } from '../common/service/todo.tasks.service';

var app = {
	powerRoomList: null,	 	//配电室列表
	groupExpandEnable: false,	//记录分组是否展开
	prListOffsetTop: 0,

	init: {},
	bind: {},		//事件绑定
	initInspectionArrange: {},     	//初始化巡检安
	createPowerRoomHtml: {},		//构建配电室的html
	setInspectionArrange: {},     	//保存巡检安排
	initPowerRoomList: {},	 	//初始化配电室列表 
	getAPrFromPrList: {},		//从配电室列表里获取一个配电室
	calculateGroupLayout: {},		//计算小组的布局情况
	expandAllGroup: {},		//展开所有分组
	unExpandAllGroup: {},		//收起所有分组


};
$(function () {

	app.init();
});

/***
 * 初始化
 */

app.init = function () {

	this.handleInit();	//初始化设置
	this.bind();		//事件绑定
	TodoTasksService.start();

};
// 初始化设置

app.handleInit = function () {
	// 获取 date

	model.date = appUtil.getParameter('date');

	//设置当前巡检安排的时间以及时间选择器当前选定的时间

	$('#selected-date').html(model.date);

	this.getInspectionArrange();		// 获取巡检安排

};


/***
 * 事件绑定
 */

app.bind = function () {
	const _this = this;

	// 选择巡检日期
	// 指定动态加载css的基地址

	laydate.path = 'http://cdn.dianwutong.com/vendor/laydate/';
	laydate.render({
		elem: '#selected-date',
		type: 'date',
		theme: '#e9be2b',

		// todo 限定最大范围 七天之后

		done: (value) => {
			model.selectedDate = value;		//选中的日期
			window.location = './inspection-arrange.html?date=' + value;
		}
	});

	// 点击日期 上一天 
	$("#prev-day").click(function(){
		dateUtil.setDate(model.date);
		dateUtil.subDays(1);
		let prevDate = dateUtil.getFormattedDate('yyyy-MM-dd');
		window.location = './inspection-arrange.html?date=' + prevDate;
	})

	// 点击日期 下一天
	$("#next-day").click(function(){

		// 如果选中的日期是距今7天的日期 则不能再往下跳转
		let distance = dateUtil.getDateDistance(model.date);
		if(distance >= 6){
			UI.Notification.info('最多只能安排未来7天的工作');
			return false;
		}

		dateUtil.setDate(model.date);
		dateUtil.addDays(1);
		let nextDate = dateUtil.getFormattedDate('yyyy-MM-dd');
		window.location = './inspection-arrange.html?date=' + nextDate;
	})

	// 选择上班时间

	let workTimeEle = null;	// 上班时间的容器
	let timeSelectedFlag = false;	// 标识是否在时间面板上选择过时间
	$('#editable-arrange-list-panel').delegate('.edit-work-time', 'click', function (e) {
		e.stopPropagation();
		workTimeEle = $(this).find('span');
		let left = e.pageX + 5;
		let top = e.pageY + 8;
		$('#select-start-work-time-panel').css({
			'top': top,
			'left': left,
			'display': 'block'
		});

		if (timeSelectedFlag) {	// 在时间面板上选择过时间了 不需要再次标识
			return;
		}

		// 获取当前的上班时间 在时间选择面板中给出标识

		let currentTime = workTimeEle.text();
		let length = $('#select-start-work-time-panel .btn').length;
		$('#select-start-work-time-panel .btn').removeClass('active');
		for (let i = 0; i < length; i++) {
			let $btn = $($('#select-start-work-time-panel button')[i]);
			if ($btn.text() == currentTime) {
				$btn.addClass('active');
			}
		}

	});

	// 点击body 关闭时间选择panel

	$('body').click(function () {
		$('#select-start-work-time-panel').css('display', 'none');
	});

	// 阻止时间冒泡到body

	$('#select-start-work-time-panel').click(function (e) {
		e.stopPropagation();
	});

	// 选中时间后 更新当前的上班时间 并关闭时间选择面板

	$('#select-start-work-time-panel button').click(function () {
		$('#select-start-work-time-panel button').removeClass('active');
		$(this).addClass('active');
		workTimeEle.text($(this).text());
		timeSelectedFlag = true; // 选择了时间
		$('#select-start-work-time-panel').fadeOut(500);
	});

	// 切换展开分组

	$('#expand').click(function () {
		$('#editable-arrange-list-panel .arrange-item').toggleClass('normal-height');
	});


	// 拖拽右侧可编辑配电室

	// 开始拖拽时 记录当前拖拽的配电室id

	$('#editable-pr-list').delegate('.group-item', 'dragstart', function (e) {
		let powerRoomId = $(this).data('id');
		e.originalEvent.dataTransfer.setData('text', powerRoomId);
		e.originalEvent.dataTransfer.effectAllowed = 'move';
		e.originalEvent.dataTransfer.dropEffect = 'move';
	});


	$('#editable-arrange-list-panel').delegate('.arrange-item', 'dragover', function (e) {
		e.preventDefault();
	});

	// 如果arrange-item 下配电室为空 则响应drop时 清空空提示并且添加配电室

	$('#editable-arrange-list-panel').delegate('.arrange-item', 'drop', function (e) {
		e.preventDefault();
		if ($(this).find('.group-item').length == 0) {
			let prId = e.originalEvent.dataTransfer.getData('text');
			let powerRoom = app.searchAPrFromList(prId);
			if (powerRoom) {

				// 添加一个左侧group pr

				let newPr = app.createAGroupPowerRoom(powerRoom);
				$(this).find('.no-group-item').remove();
				$(this).append(newPr);
				app.calcGroupPrCount();
			}

		}
	});

	// 如果arrange-item下配电室不为空 则响应drop时 插入到触发drop事件的group-item前面

	$('#editable-arrange-list-panel').delegate('.arrange-item .group-item', 'drop', function (e) {
		e.preventDefault();
		let prId = e.originalEvent.dataTransfer.getData('text');
		let powerRoom = app.searchAPrFromList(prId);
		if (powerRoom) {

			// 添加一个左侧group pr

			let newPr = app.createAGroupPowerRoom(powerRoom);
			$(this).before(newPr);
			app.calcGroupPrCount();
		}

	});

	// 点击uneditable小组 显示相应的小组信息

	$('#uneditable-group-list').delegate('.group-item', 'click', function () {
		$('#uneditable-group-list .group-item').removeClass('group-active');
		$(this).addClass('group-active');
		_this.initGroupDetail();
	});

	// 点击保存按钮 设置巡检安排

	$('#top-bar').delegate('.save', 'click', function () {
		_this.setInspectionArrange();
	});

	// 点击删除按钮

	$('#editable-arrange-list-panel').delegate('.delete', 'click', function () {
		$(this).parent().parent().remove();
		app.calcGroupPrCount();
	});

	// 

};

// 根据当前选定的日期是历史日期，当前日期还是未来日期来判断当前是否可进行巡检安排
// 1.如果所有组的安排均为空 并且日期为今天及以后 调取配电室接口 随机分配安排
// 2.如果所有安排都为空 并且日期是历史日期 显示   当日没有安排巡检   提示
// 3. 如果日期是当天 并且有巡检安排 则不能再安排
// 4. 如果日期是历史日期 也不能再安排
// 5.如果日期是未来时间 并且有巡检安排 都可以再安排

app.isToArrange = function () {

	// 日期标记 <0 表示昨天以及历史 ==0 表示当天 >0表示明天及未来

	const dateFlag = dateUtil.getDateDistance(model.date);

	// 判断是否所有组的巡检安排为空

	const length = model.groups.length;
	let emptyListCount = 0;
	for (let i = 0; i < length; i++) {
		let groupItem = model.groups[i];


		// 判断是不是所有组的巡检安排都为空


		if (groupItem.taskCount == 0 || !groupItem.xjTasks || !groupItem.xjTasks.length) {
			emptyListCount++;
		}
	}

	// emptyListCount == model.groups.length 则全部为空 否则不全部为空

	// 如果所有组的安排均为空 并且日期为今天及以后 调取配电室接口 将组团长下的所有配电室划分到每个组下

	if (dateFlag >= 0 && emptyListCount == model.groups.length) {
		$('.uneditable-panel').css('display', 'none');
		$('.editable-panel').css('display', 'block');
		return 1;	// 表示可以进行巡检安排

	}

	// 如果日期是历史日期，没有安排的话显示当日未安排

	if (dateFlag < 0 && emptyListCount == model.groups.length) {
		$('.uneditable-panel').css('display', 'none');
		$('.editable-panel').css('display', 'none');
		$('#top-bar').css('width', '100%');
		$('#empty-tips').css('display', 'block');
		return 3;
	}

	//如果日期是当天且有安排记录或者历史日期  不能安排 显示分组情况

	if ((dateFlag == 0 && emptyListCount != model.groups.length) || dateFlag < 0) {
		$('.editable-panel').css('display', 'none');
		$('.uneditable-panel').css('display', 'block');
		return 0;
	}

	// 如果日期是未来时间 且有安排 则可以进行安排 不进行随机分配

	if (dateFlag > 0 && emptyListCount != model.groups.length) {
		$('.uneditable-panel').css('display', 'none');
		$('.editable-panel').css('display', 'block');
		return 2;
	}
};

// 获取到排班列表 首先根据每组排班具体安排以及当前日期判断是否可以进行巡检安排

app.getInspectionArrange = function () {
	$('#editable-arrange-list-panel').html('');
	model.getInspectionArrange()
		.subscribe(res => {
			if (res) {
				let arrange = app.isToArrange();
				if (arrange == 3) {	// 历史时期且没有任何安排
					return;
				}
				if (!arrange) {	// 不能进行安排且目前有安排
					app.initUnEditableArrange();
				} else {

					// 渲染可以进行巡检安排的小组

					app.initEditableInsArrange(arrange);
				}
			}
		});
};


// 从配电室列表中搜索一个配电室

app.searchAPrFromList = function (prId) {
	let prList = model.prList;
	let length = prList.length;
	for (let i = 0; i < length; i++) {
		if (prId == prList[i].prId) {
			return prList[i];
		}
	}
	return false;
};


// 渲染右侧配电室列表中的一个配电室dom

app.creatAPowerRoomDom = function (pr) {
	return `<div class="group-item" data-id="${pr.prId}" draggable="true">
					<div class="row">
						<div class="iconfont pr-icon">&#xe614;</div>
						<div>
							<div class="pr-name">${pr.prName}</div>
							<div class="address">${pr.city + ' ' + pr.area + ' ' + pr.address}</div>
						</div>
					</div>
				</div>`;
};


// 渲染可以进行巡检安排的小组
// 首先或许当前员工拥有的配电室
// 

app.initEditableInsArrange = function (arrange) {
	model.getPowerRoomByTeamerId()
		.subscribe(res => {
			if (res) {

				// 渲染右侧配电室列表

				$('#total-pr-count').text(model.prList.length);
				for (let i = 0; i < model.prList.length; i++) {
					const prDom = app.creatAPowerRoomDom(model.prList[i]);
					$('#editable-pr-list').append(prDom);
				}

				// 渲染左侧小组巡检安排

				const length = model.groups.length;
				for (let i = 0; i < length; i++) {
					let groupItem = model.groups[i];
					let xjTasks = groupItem.xjTasks;

					let groupHtml = '<div class="arrange-item normal-height" grouper-id="{grouperId}" >';
					groupHtml += '<div class="header-title">';
					groupHtml += '<div class="font16">{groupName}</div>';
					groupHtml += '<div class="title-right">';
					groupHtml += '<div class="time-panel">';
					groupHtml += '<div class="font12">上班时间：</div>';
					groupHtml += '<div class="work-time edit-work-time">';
					groupHtml += '< &nbsp;<span>{xjTime}</span>&nbsp; ></div></div>';
					groupHtml += '<div class="pr-number font12">配电室数量:';
					groupHtml += '&nbsp;<span class="color-danger pr-count">{taskCount}</span>&nbsp;个</div></div></div>';
					groupHtml += '<div class="group-content" id="{grouperDomId}" >';
					if (arrange == 1) {

						// 表示所有小组没有任何安排，可以默认给每个小组安排所有配电室

						xjTasks = model.prList;
					} else {
						if (groupItem.taskCount == 0 || !groupItem.xjTasks || !groupItem.xjTasks.length) {
							groupHtml += '<div class="no-group-item draggable-item">';
							groupHtml += '今日没有巡检任务</div>';
						}
					}

					for (let j = 0; j < xjTasks.length; j++) {
						groupHtml += app.createAGroupPowerRoom(xjTasks[j]);
					}
					groupHtml += '</div>';
					groupHtml += '</div>';

					groupHtml = groupHtml
						.replace(/{grouperId}/, groupItem.groupId)
						.replace(/{grouperDomId}/, 'group' + i)
						.replace(/{groupName}/, groupItem.groupName)
						.replace(/{xjTime}/, groupItem.xjTime ? groupItem.xjTime : '08:00')
						.replace(/{taskCount}/, groupItem.taskCount);

					$('#editable-arrange-list-panel').append(groupHtml);

					// 进行组间排序

					new Sortable(document.getElementById('group' + i), {
						handle: '.group-item',
						group: 'editable-arrange-list-panel',
						dragable: '.draggable-item',
						ghostClass: 'ghost',
						onEnd: function () {
							app.calcGroupPrCount();
						}
					});

				}

			}
		});

};


// 计算每组配电室数量

app.calcGroupPrCount = function () {
	let noArrangeHtml = `<div class="no-group-item draggable-item">
						今日没有巡检任务</div>`;
	let groups = $('#editable-arrange-list-panel').find('.arrange-item');
	let groupsLength = groups.length;
	let prLength = 0;
	for (let i = 0; i < groupsLength; i++) {

		prLength = $(groups[i]).find('.group-item').length;
		$(groups[i]).find('.pr-count').text(prLength);
		if (prLength != 0) {
			$(groups[i]).find('.no-group-item').remove();
		} else {
			$(groups[i]).find('.group-content').find('.no-group-item').remove();
			$(groups[i]).find('.group-content').append(noArrangeHtml);
		}
	}


};

// 渲染左侧 小组中的配电室 可编辑部分

app.createAGroupPowerRoom = function (pr) {
	return `<div class="group-item draggable-item" data-id="${pr.prId}" >
				<div class="row">
					<div class="content">
						<div class="iconfont pr-icon">&#xe614;</div>
						<div class="pr">
							<div class="pr-name">${pr.prName}</div>
							<div class="address ellipsis" title="${pr.province + '' + pr.city + ' ' + pr.area + ' ' + pr.address}">${pr.city + ' ' + pr.area + ' ' + pr.address}</div>
						</div>
					</div>
					<div class="delete">删除</div>
				</div>
			</div>`;
};


// 不可进行巡检安排的情况
// 查出分组 点击某一组显示详情

app.initUnEditableArrange = function () {
	for (let i = 0; i < model.groups.length; i++) {
		let dom = `<div class="group-item" scheduleId="${model.groups[i].scheduleId}" groupName="${model.groups[i].groupName}" workTime="${model.groups[i].xjTime}" prCount="${model.groups[i].taskCount}">
						<div>${model.groups[i].groupName}</div>
						<div>
							<span>配电室:${model.groups[i].taskCount}个</span>
							<span>${model.groups[i].isComplete ? '巡检完成' : '无巡检任务'}</span>
						</div>
					</div>`;
		$('#uneditable-group-list').append(dom);
	}

	$('#uneditable-group-list .group-item').eq(0).addClass('group-active');
	this.initGroupDetail();
};


// 渲染左侧小组详情

app.initGroupDetail = function () {
	let $activeGroup = $('#uneditable-group-list .group-active');
	model.scheduleId = $activeGroup.attr('scheduleId');
	let groupName = $activeGroup.attr('groupName');
	let workTime = $activeGroup.attr('workTime');
	let prCount = $activeGroup.attr('prCount');
	$('#groupName').text(groupName);
	$('#work-time').text(workTime);
	$('#pr-count').text(prCount);

	// 清除表格内容

	$('#group-detail tr:gt(0)').remove();
	model.getTaskDetail()

		.subscribe(res => {
			if (res) {
				for (let i = 0; i < model.groupSchedules.length; i++) {
					let task = model.groupSchedules[i];
					let dom = `
					<tr class="pointer">
						<td class="width10 center ${task.isComplete ? 'complete-item' : ''}" style="padding-left:4%;">${i}</td>
						<td class="width20">${task.prName}</td>
						<td class="widith25">地址</td>
						<td class="width10">${task.dayInspectCount}项</td>
						<td class="width10">${task.tfCount}项</td>
						<td class="width10">${task.exceptionCount}项</td>
						<td class="width15 color-${task.isComplete ? 'success' : 'danger'}">${task.isComplete ? '已完成' : '未完成'}</td>
					</tr>
					
					`;
					$('#group-detail').append(dom);
				}

			}
		});
};

// 设置巡检安排

app.setInspectionArrange = function () {
	model.schedules = [];
	let groups = $('#editable-arrange-list-panel .arrange-item');
	for (let i = 0; i < groups.length; i++) {
		let groupId = $(groups[i]).attr('grouper-id');
		let xjTime = $(groups[i]).find('.edit-work-time').find('span').text();
		let prList = $(groups[i]).find('.group-item');
		let prIds = '';
		for (let j = 0; j < prList.length; j++) {
			prIds += $(prList[j]).data('id') + ',';
		}
		if (prIds.length > 0) {
			prIds = prIds.slice(0, -1);
		}
		model.schedules.push({
			'groupId': groupId,
			'xjTime': xjTime,
			'prIds': prIds,

		});
	}

	model.setInspectionArrange()
		.subscribe(res => {
			if (res) {
				var today = dateUtil.getFormattedDate('yyyy-MM-dd');
				var date = model.date;
				if (today == date) {
					window.location.reload();
				} else {
					UI.Notification.success('保存成功');
				}

			} else {
				UI.Notification.error('保存失败');
			}
		});


};
