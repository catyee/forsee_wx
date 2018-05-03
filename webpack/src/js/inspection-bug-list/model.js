import { http } from '../utils/http.util';
let model = {
	status: 0,		// 状态 两种 0未派单 1已派单
	page: 1,
	pageSize : 12,          // 每页数量
	getInsBugList : {},     // 获取巡检问题列表
}; 
model.getInsBugList = function() { 
	const data = {
		page : this.page,
		pageSize : this.pageSize,
		status : this.status
	};

	data.status == '-1' && delete data.status;

	return http.get('/ems/rest/xj/problem/page',data).map(res =>{
		if(res.code === 200){
			res.success = true;
			return res;
		}else if(res.code === 404){
			res.success = true;
			return res;
		}
	});
};

exports.model = model;