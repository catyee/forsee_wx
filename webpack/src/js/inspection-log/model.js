/**
 * 巡检日志详情数据模型 
 */

import { http } from '../utils/http.util';

const checkType = {
	day: 1,
	week: 2,
	month: 3
}

var model = {
	id: null,
};

/***
 *  通过id 获取巡检日志的详细信息
 *  @param id
 *  @param callback 获取成功的回调函数
 */

model.getInspectinLogById = function(){

	return http.get('/ems/rest/common/xj/log/detail', {
		taskId : this.id
	}).map(res => {
		if(res.code === 200){

			// 分开各种巡检类型
			const dayItems = [];
			const weekItems = [];
			const monthItems = [];
			const reCheckItems = [];
			const burstItems = [];

			let commonItems = res.body.routineLogs;
			let length = commonItems.length;
			for(let i=0; i<length; i++){

				switch(commonItems[i].checkType){
					case checkType.day: dayItems.push(commonItems[i]); break;
					case checkType.week: weekItems.push(commonItems[i]); break;
					case checkType.month: monthItems.push(commonItems[i]); break;
				}
				
			}

			res.body.dayItems = dayItems;
			res.body.weekItems = weekItems;
			res.body.monthItems = monthItems;

		}

		return res;
	});

};

// 检测该巡检项是否有抢修单
model.getRepairOrderOfItem = function(taskId, itemId, source){
	return http.get('/ems/rest/xj/problem/one', {
		taskId: taskId,
		itemId: itemId,
		source: source
	})
}

exports.checkType = checkType;
exports.model = model;