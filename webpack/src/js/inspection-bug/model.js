import { http } from '../utils/http.util';

var model = {
	bugId: null,
	bugInfo: null,
	getInspectionBugById        : {},    //通过问题id获取巡检问题详情

	createRepairOrderFromInsBug : {},    //通过巡检问题生成抢修单
};

/***
 * 通过巡检问题id获取问题详情
 * @param problemId    巡检问题id
 * @param callback 获取成功的回调函数
 */

model.getBugById = function(){

	return http.get('/ems/rest/xj/problem', {
		'problemId' : this.bugId
	}).map(res => {
		if(res.code === 200){
			this.bugInfo = res.body;
			this.prefix = res.prefix;
			res.success = true;
			return res;
		}else{
			return {
				message: '获取巡检问题失败'
			}
		}
	});
	
};

exports.model = model;

