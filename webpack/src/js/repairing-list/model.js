import { userInfo } from '../common/service/user.info.service';
import { http } from '../utils/http.util';

export const model = {
	page: 1,    //当前页
	pageSize: 100,  // 每页数量
	employeeId: 1, // 员工id
	repairingList: [],//抢修单列表
	totalPages:0,      // 总页数
};
model.getRepairingList = function() {
	let data = {
		flag: 1,    // 未销单的抢修单
		employeeId: model.employeeId, // 员工id
		page: model.page,   // 当前页
		pageSize: model.pageSize
	};
	return http.get('/ems/rest/qx/order/page',data).map(res => {
		if(res.code == 200) {
			model.repairingList = res['body']['records'];
			model.totalPages = res['body']['totalPages'];
			return true;
		}
		return false;
	});
};
