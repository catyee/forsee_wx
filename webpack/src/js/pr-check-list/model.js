
import { powerRoomModel } from '../common/power-room-model';
import { http } from '../utils/http.util';

var model = {
	prId: null,	// 配电室id
	checkList: [],      //用来保存巡检分类列表

};


/***
 * 获取配电室的巡检分类列表
 */

model.getCheckClassifyList = function () {
	return http.get('/ems/rest/xj/category/list', {
		prId: this.prId
	}).map(function (res) {
		if (res.code === 200) {
			model.checkList = res.body;
			return res.body
		} else {
			return [];
		}
	});
};


// 删除巡检分类
model.removeCheckClassify = function(classifyId){
	return http.delete('/ems/rest/xj/category', {
		categoryId: classifyId
	}).map(res => {
		if (res.code === 200){
			return {
				success: true
			}
		}else{
			return {
				success: false,
				message: '删除失败'
			}
		}
	})
}

// 新增或者保存一个巡检分类
model.saveClassify = function(classifyId, classifyName){
	
	if(classifyId){
		return http.put('/ems/rest/xj/category', {
			categoryName: classifyName,
			categoryId: classifyId
		}).map(handle);
	}else{
		return http.post('/ems/rest/xj/category', {
			categoryName: classifyName,
			prId: this.prId
		}).map(handle);
	}

	function handle( res ){
		if(res.code === 200){
			return {
				success: true,
				classifyId: res.body
			}

		}else{
			return {
				message: '保存失败'
			}
		}
	}

}

// 保存巡检项目
model.saveCheckItems = function(classify){

	// 遍历出所有的巡检项目 包括routineItems（原巡检项） dayItems weekItems monthItems

	let items = [];
	
	items = items.concat(handle(classify.routineItems));
	items = items.concat(handle(classify.dayItems));
	items = items.concat(handle(classify.weekItems));
	items = items.concat(handle(classify.monthItems));

	function handle(_items){
		let items = [];
		let length = _items ? _items.length: 0;
		for(let i=0; i<length; i++){
	
			items.push({
				prId: model.prId,
				checkType: _items[i].checkType,
				checkItem: _items[i].checkItem,
				cycle: _items[i].cycle
			})
	
		}
		return items;
	}

	return http.post('/ems/rest/xj/routine/item', {
		categoryId : classify.categoryId,
		routineItems: items
	}).map(res => {
		if(res.code === 200){
			return {
				success: true
			}
		}else{
			return {
				message: '保存巡检项目失败'
			}
		}
	})

	
}

/***
 * 获取巡检模板列表
 */

model.getCheckTemplateList = function (callback) {
	return http.post('/dwt/iems/basedata/check/get_xj_tpl_list', {});
};

/***
 * 获取模板详情
 */

model.getCheckTemplateById = function (id) {
	return http.post('/dwt/iems/basedata/check/get_xj_tpl_by_id', {
		id: id
	});
};


/***
 * 获取一个巡检分类
 */

model.getACheckClass = function (classId) {
	var matcher = { 'id': parseInt(classId) };
	var list = _.filter(model.checkList, matcher);
	if (list.length > 0) {
		return list[0];
	}
	return null;
};

/***
 * 获取配电室复检项
 * @param powerRoomId 配电室id
 * @param callback
 */

model.getRecheckItemList = function (powerRoomId, callback) {
	return http.get('/ems/rest/xj/fj/item/list', {
		'prId': powerRoomModel.powerRoomId
	});
};

/***
 * 获取配突发列表
 * @param powerRoomId 配电室id
 * @param callback    成功的回掉函数
 */

model.getBurstItemList = function () {

	return http.get('/ems/rest/xj/tf/item/list', {
		'prId': powerRoomModel.powerRoomId,
	});
};


/***
 * 将突发设置为日常巡检
 */
model.setBurstToCheckItem = function(param){
	return http.post('/ems/rest/xj/routine/item/add', param);
}

/**
     * 新增或更新巡检分类名称
     * @param powerRoomId   配电室id
     * @param classId       分类id  id!=null 为新增操作
     * @param className     分类名
     * @param callback      操作成功的回调函数
     */

model.addOrUpdateCheckClass = function (powerRoomId, classId, className, callback) {
	return http.post('/dwt/iems/bussiness/xj/add_or_update_xj_define', {
		'prId': powerRoomId,
		'id': classId,
		'defineName': className
	});
};

/***
     * 批量增加巡检项
     * @param checkItemList 数组 如下
     * [{"prCheckDefineId":"1","checkItem":"电压","checkType":"1"}
     ,{"prCheckDefineId":"1","checkItem":"温度","checkType":"2","weekInspectCycle":"3"},
     {"prCheckDefineId":"1","checkItem":"电流","checkType":"3","monthInspectCycle":"13"}]
     参数意义：
     prCheckDefineId：对应检查大项的id
     checkItem：具体的检查项的名字
     checkType：检查类型  1：日检  2：周检  3：月检
     weekInspectCycle：周检的日期     1-7 代表 周一到周日
     monthInspectCycle ： 月检的日期  1-28

     */

model.bacthAddCkeckItems = function (checkItemList, callback) {
	return http.post('/dwt/iems/bussiness/xj/add_or_update_xj_items', {
		'list': checkItemList
	});
};

/***
 * 设置（添加一个巡检项）
 */

model.setPowerRoomCheckItem = function (classId, checkType, checkItem, weekDay, monthDate) {
	var param = {
		'list': [{
			xjItem: checkItem,
			id: null,
			prXjDefineId: classId,
			checkType: checkType,
			weekXjCycle: weekDay,
			monthXjCycle: monthDate
		}]
	};

	return http.post('/dwt/iems/bussiness/xj/add_or_update_xj_items', param);

};

/***
     * 忽略突发项
     */

model.ignoreBurstItem = function (id) {
	return http.delete('/ems/rest/xj/tf/item', {
		itemId: id
	});
};

/***
 * 设置（保存）巡检项的顺序
 * @param checkItemList 巡检项的list
 * @param callback      设置成功的回调函数
 */

model.setCheckItemOrder = function (checkItemList, callback) {
	return http.post('/rt/ap/v1/head/update_check_item', {});
};

/***
     * 删除配电室巡检项
     */

model.removePowerRoomCheckItem = function (checkItemIds) {
	return http.post('/dwt/iems/bussiness/xj/delete_xj_items', {
		'xjItemIds': checkItemIds,
	});
};

/***
     * 根据一个分类id删除该分类
     * @param ClassID  分类id
     * @param callback 删除成功的回调函数
     */

model.removePowerRoomCheckClass = function (ClassID) {
	return http.post('/dwt/iems/bussiness/xj/add_or_update_xj_define', {
		'id': ClassID,
		'deleteFlag': 1
	});
};


/***
     * 删除配电室复检项
     * @param recheckItemId   复检项id
     * @param callback        删除成功的回掉函数
     */

model.removeRecheckItem = function (id) {
	return http.delete('/ems/rest/xj/fj/item', {
		'itemId': id
	});
};

exports.model = model;