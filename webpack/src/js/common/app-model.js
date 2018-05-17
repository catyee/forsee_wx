import { http } from '../utils/http.util';
import { Observable } from 'rxjs/Observable';
import { cookie } from '../utils/cookie.util';
import { userInfo } from '../common/service/user.info.service';

const appModel = {};

/**
 * 获取配电室详情
 * @param {*} id 
 */

appModel.getPowerRoomById = function (id) {
	return http.get('/ems/rest/power/room/detail', {
		prId: id
	});
};

/**
 * 获取属于自己的客户列表
 */

appModel.getCusList = function(){
	return http.post('', {});
};

/**
 * 获取属于自己的配电室列表
 */

appModel.getPrList = function( cusId ){

	const param = {};
	if(cusId){
		param.cusId = cusId;
	}

	if(userInfo.employeeId){
		param.employeeId = userInfo.employeeId;
	}

	if(userInfo.roleId){
		param.roleId = userInfo.roleId;
	}

	return http.get('/ems/rest/power/room/list', param).map( res =>{
		if(res.code === 200 ){
			return res.body;
		}else{
			return [];
		}
	});
};

/**
 * 创建抢修单
 * @param {prId, problemId/alarmId, orderDesc} param 
 */
appModel.createRepairOrder = function(param){

	if(!param){
		return Observable.create( ob => {
			ob.next({
				'message': '未传入参数'
			})
		})
	}

	param.employeeId = userInfo.employeeId;

	return http.post('/ems/rest/qx/order', param).map( res => {
		if(res.code === 200){
			return {
				success: true,
				id: res.body
			}
			
		}else{

			return {
				message: '创建抢修单失败'
			}

		}
	})

}

exports.appModel = appModel;
