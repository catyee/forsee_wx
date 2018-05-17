
//报警类型

export var ALARM_TYPES = {
	'1' : '预警',
	'2' : '报警',
	'3' : '故障',
};

//角色 

export let ROLES = {
	'KH': 1,	// 客户
	'ZTZ': 2,	//巡检组团长
	'XJZZ': 3,	//巡检组长
	'QXBZ': 4,	//抢修班长
	'QXZZ': 5,	//抢修组长
	'AQY': 6,	//安全员
	'ZBZ': 7,	//值班长
	'JKY': 8,	//监控员,
	'KHJL': 9, //客户经理
};

// 位置分类
export let POSITIONCLASSIFY  = [
	'',
	{content: '高压侧', value: 1},
	{content: '低压侧', value: 2},
	{content: '变压器', value: 3},
	{content: '直流屏', value: 4},
	{content: '信号屏', value: 5},
	{content: '其他', value: 6},
];

/***
 * 上传文件
 * @param file 文件对象
 * @param type 1、文件   2、图片  3、录音
 */

export let UPLOAD = {
	TYPE_IMG	: 1,
	TYPE_FILE 	: 2,
	TYPE_VOICE	: 3
};

// 巡检类型 
export let CHECK_TYPE = {
	DAY: 1,		// 日检
	WEEK: 2,	// 周检
	MONTH: 3,	// 月检
}

// 巡检问题的状态
export let INSPECT_BUG_STATUS = {
	UNHANDLE: 0, 	// 未处理
	HANDLING: 1,	// 处理中
	HANDLED: 2		// 已处理
}

// 报警状态 
export let ALARM_STATUS = {
	REAL_TIME: 1,	// 实时报警
	HISTORY:2	// 历史报警
}

// 报警处理状态
export let ALARM_HANDLE_STATUS = {
	UNHANDLE: 0,	// 未处理
	HANDLING: 1,	// 处理中
	HANDLED: 2,		// 已处理
	IGNORE: 3		// 已忽略
}