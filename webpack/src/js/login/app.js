let $ = require('jquery');
let laydate = require('layui-laydate');
let Rx = require('rxjs/Rx');
let Observable = require('rxjs/Rx').Observable;
// let wangEditor = require('../../../vendors/wangEditor/js/wangEditor');
import { UI } from '../common/ui';
import { cookie } from '../utils/cookie.util';
import { http } from '../utils/http.util';
import { dateUtil } from '../utils/date.util';

$('#div').width(200).height(200).css('background', 'red');
import { from } from 'rxjs/observable/from';

// 指定动态加载css的基地址
laydate.path = 'http://cdn.dianwutong.com/vendor/laydate/'; 
laydate.render({
	elem: '#date',
	type: 'date',
	done: (value, data)=> {
		alert(value)
	}
})

console.log(Observable);

let subject = new Rx.Subject();

subject.subscribe( data => {
	console.log(data);
})


// 
setTimeout(()=>{
	subject.next('hello again');
}, 3000);

Rx.Observable.create( ob => {
	ob.next('hello observable');
}).subscribe(data => {
	console.log(data)
})


// 编辑器
let editor = new wangEditor("editor"); 
editor.create();

// http
http.post('/admin/rest/user/login', {
	'username' : '17600774629',
	'password': '123456'
}).subscribe( res => {

})

cookie.set('username', '老骥伏枥', 5 , '/');

console.log(cookie.get('username'));
console.log(cookie.get('token'));

cookie.deleteAll();

// date util
dateUtil.setDate('2012-12-16');
dateUtil.setDate(new Date());
dateUtil.setDate(2131243242);
// 格式化时间
console.log(dateUtil.getFormattedDate('yy*MM*dd hh:mm:ss S'))

// 判断是否闰年(不传参数默认是当前年份)
console.log(dateUtil.isLeapYear(2014));

//获取某年的第n个月的天数 n从0计算
console.log(dateUtil.getMonthDays(2, 3018));

// 获取当前设置的日期是一年中的第几周
console.log(dateUtil.getWeek());

// 获取被设置日期的毫秒数
console.log(dateUtil.getMillisecond());

// 获取当前日期的凌晨0点0分0秒 0毫秒 的毫秒数
console.log(dateUtil.getFirstMillisecondOfDate());

// 获取当前设置的日期的23:59:59秒的毫秒数
console.log(dateUtil.getLastMillisecondOfDate());

// 获取当前设置时间的整点毫秒数 即hour:00:00
console.log(dateUtil.getFirstMillisecondOfHour());

// 获取当前设置时间的当前小时最后一刻毫秒数 即hour:59:59
console.log(dateUtil.getLastMillisecondOfHour());

// 获取当前设置日期的 当月开始时刻的毫秒数 即 1日 00:00:00
console.log(dateUtil.getFirstMillisecondOfMonth());

// 获取当前设置时间的 当前最后一刻的好藐视 即最后一天:59:59
console.log(dateUtil.getLastMillisecondOfMonth());

// 获取当前设置的日期 当前年份的开始时刻的好毫秒数 
console.log(dateUtil.getFirstMillisecondOfYear());

// 获取当前设置的日期 当前年份的最后一刻的毫秒数
console.log(dateUtil.getLastMillisecondOfYear());

// 计算两个日期相差的天数
var date1 = new Date('2018-01-10');
var date2 = new Date('2018-01-01')
console.log(dateUtil.getDateDistance(date1, date2));

// 在当前日期的基础上增加n天
console.log(dateUtil.getFormattedDate());
dateUtil.addDays(2);
console.log(dateUtil.getFormattedDate());

// 在当前日期上减去n天
console.log(dateUtil.getFormattedDate());
dateUtil.subDays(2);
console.log(dateUtil.getFormattedDate());

console.log(UI);  

let pagination = new UI.Pagination('pagination', 20, 5); 
UI.Notification.info('保存成功');
UI.Notification.warn('保存成功');
UI.Notification.success('保存成功');
UI.Notification.error('保存成功');

setTimeout(function(){
	UI.Notification.success('保存成功');
}, 3000);

