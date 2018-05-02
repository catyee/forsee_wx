require('../../scss/inspection-arrange-list.scss');

let $ = require('jquery');
let laydate = require('layui-laydate');
import { dateUtil } from '../utils/date.util';
import { UI } from '../common/ui';
import { userInfo } from '../common/service/user.info.service';
import { model } from './model';
import { TodoTasksService } from '../common/service/todo.tasks.service';

var app = {
	init: {},
	bind: {},
	render: {},          //获取巡检安排详情
}; 
$(function () {

	app.init();

});

app.init = function () {

	// 初始化时间

	model.today = dateUtil.getFormattedDate('yyyy-MM-dd');
	dateUtil.subDays(1);
	model.startDate = dateUtil.getFormattedDate('yyyy-MM-dd');
	dateUtil.addDays(7);
	model.endDate = dateUtil.getFormattedDate('yyyy-MM-dd');
	model.deadLine = model.endDate;

	$("#date-range").val(model.startDate + ' - ' +model.endDate);

	app.bind();

	/*查询巡检安排情况*/
	app.render();
	TodoTasksService.start();

}

app.bind = function () {

	const _this = this;

	// 指定动态加载css的基地址
	laydate.path = 'http://cdn.dianwutong.com/vendor/laydate/'; 
	laydate.render({
		elem: '#date-range',
		type: 'date',
		range: true,
		theme: '#e9be2b',
		max: model.deadLine,
		done: (value, date1, date2)=> {
			const dates = value.split(' - ');
			model.startDate = dates[0];
			model.endDate = dates[1];
			_this.render();
		}
	})
	

	/*跳转到巡检安排详情*/
	$('#arrange-list').delegate('.arrange-item', 'click', function () {
		var date = $(this).data('date');
		window.location.href = './inspection-arrange.html?date=' + date;
	});

	// 点击上一页
	$("#prev-page").click(function () {

		// 两个日期的差
		const detal = dateUtil.getDateDistance(model.endDate, model.startDate);

		dateUtil.setDate(model.startDate);
		dateUtil.subDays(1);
		model.endDate = dateUtil.getFormattedDate('yyyy-MM-dd');
		dateUtil.subDays(detal);
		model.startDate = dateUtil.getFormattedDate('yyyy-MM-dd');

		_this.render();

	})


	// 点击下一页
	$("#next-page").click(function () {

		// 两个日期的差
		const detal = dateUtil.getDateDistance(model.endDate, model.startDate);

		dateUtil.setDate(model.endDate);
		dateUtil.addDays(detal + 1);

		const tmpEndDate = dateUtil.getFormattedDate('yyyy-MM-dd');

		// 如果临时的endDate小于deadline 则可以使用 否则使用deadline 当endDate
		if (dateUtil.getDateDistance(model.deadLine, tmpEndDate) >= 0) {
			model.endDate = tmpEndDate;
		} else {
			model.endDate = model.deadLine;
		}


		dateUtil.setDate(model.endDate);
		dateUtil.subDays(detal);
		model.startDate = dateUtil.getFormattedDate('yyyy-MM-dd');

		_this.render();

	})
}

// 渲染数据
app.render = function () {

	model.getArrangeList().subscribe(res => {
		if (res.success) {

			$("#date-range-panel").text(model.startDate + '~' + model.endDate);

			const list = res.list;
			const length = list.length;
			
			let html = ''

			for (let i = 0; i < length; i++) {
				html += this.createArrangeDom(list[i]);
			}

			$("#arrange-list").html(html);

		} else {
			UI.Notification.error(res.message);
		}
	})

};

// 构建一个巡检安排
app.createArrangeDom = function (item) {

	const arranged = item.schedules.length;

	let content = '';

	if(arranged){

		for(let i=0; i<arranged; i++){
			content += `
				<div class="group">
					<div>${item.schedules[i].groupName}组</div>
					<div>上班时间:${item.schedules[i].xjTime}</div>
					<div>配电室数量:${item.schedules[i].taskCount}个</div>
					<div>${item.schedules[i].isAccept?(item.schedules[i].isComplete?'已完成':'巡检中'):'未开始'}</div>
				</div>
			`
		}

	}else if(item.xjDate < model.today){

		content = `<div>${item.xjDate} 未安排巡检
					</div>`;

	}else{
		content = `<div>未安排巡检，现在
						<span>去安排</span>
					</div>`;

	}

	return ` <div class="arrange-item  ${arranged? 'arranged': 'no-arrange' }" data-date="${item.xjDate}">
				<div class="item-header ${arranged? 'bg-primary': 'bg-grey' }">
					<div>${item.xjDate}</div>
					<div>${arranged? '已安排': '未安排' }</div>
				</div>
				<div class="item-content">
					${content}
				</div>
			</div>`


}