
import { http } from '../utils/http.util';
import { userInfo } from '../common/service/user.info.service';
import { Subject } from 'rxjs';

var model = {
	getWarningDetailById: {},    //获取报警详情
	getFiledData: {},    //获取报警现场数据
	getRealTimerData: {},    //获取实时数据
	createRepairOrderFromSysBug: {},    //生成抢修单
};

/***
 * 通过报警id 获取报警详情
 * @param {Number} alarmId    报警id
 * @param {Function} callback 成功时的回调函数
 */

model.getWarningDetailById = function (alarmId) {

	let ob = new Subject();

	let $alarm = http.get('/ems/rest/alarm', {
		'alarmId': alarmId,
	}).subscribe( res => {
		if(res.code === 200){

			http.get('/ems/rest/power/room/detail', {
				prId : res.body.prId
			}).subscribe(res1 => {
				if(res1.code === 200){
					res.body.pr = res1.body;
				}else{
					res.body.pr = {};
				}

				ob.next(res)
			})

		}else{
			ob.next(res)
		}
	})

	return ob;
};

/**
 * 忽略报警
 * @param {number} alarmId 报警id
 * @param {string} reason 忽略的原因
 */
model.igoreAlarm = function(alarmId, reason){
	var param = {
		alarmId: alarmId,
		reason: reason
	}

	return http.put('/ems/rest/alarm/ignore', param);
}

exports.model = model;
