require('../../scss/map.scss');

import { http } from '../utils/http.util';
import { appUtil } from '../utils/app.util';
import { dateUtil } from '../utils/date.util';
import { userInfo } from '../common/service/user.info.service';
import { ROLES } from '../common/app-enum';

var local = {
	map: {},	//地图实例	

	init: {},	//方法
	bind: {},	//数据绑定
	route: {},	//根据参数  选择要做的事情

	initInspectionGrouper: {},
	disInspectionRoute: {},	//显示巡检路线
	disInspectionPowerRoom: {},	//显示巡检组的配电室

	disAllPowerRoom: {},	//显示所有配电室
	disAllStuff: {},	//显示所有员工
	updateRange: 5000,	//设置刷新周期

}
$(function () {
	local.init();
	local.bind();
})

local.init = function () {

	$("#main-map").height($(window).height());

	local.map = new BMap.Map("main-map");          // 创建地图实例  
	var point = new BMap.Point(116.404, 39.915);   // 创建点坐标  
	local.map.centerAndZoom(point, 15);            // 初始化地图，设置中心点坐标和地图级别  
	local.map.enableScrollWheelZoom();

	local.route();
}

/***
 * 时间绑定
 */
local.bind = function () {
	$("#inspection-grouper-list").delegate(".inspection-grouper", "click", function () {
		var grouperId = $(this).attr("id");
		local.map.clearOverlays();
		local.disInspectionRoute();
		local.disInspectionPowerRoom(grouperId);
	})
}

/****
 * 根据参数选择要做的事情
 */
local.route = function () {
	var hash = window.location.hash;
	if (/route/.test(hash)) {
		//显示小组选择面板
		$("#inspection-grouper-list-panel").css("display", "block");
		local.initInspectionGrouper();
	} else if (/area/.test(hash)) {
		local.disAllPowerRoom();
		local.disAllStuff();
		window.setInterval(function () {
			local.disAllPowerRoom();
			local.disAllStuff();
		}, local.updateRange)
	}
}

/***
 * 获取组团长下的组
 */
local.initInspectionGrouper = function () {
	http.post('/dwt/privilege/get_user_list', {
		"parentUserId": userInfo.userId,
		"parentRoleId": userInfo.roleId
	}).subscribe(function (res) {
		if (res.code.toString() == "0") {
			var dom = dom;
			var domtpl = '<div class="inspection-grouper" id="{id}">{name}</div>'
			var length = res.list.length
			if (length > 0) {
				$("#inspection-grouper-list").empty();
				for (var i = 0; i < length; i++) {
					dom = domtpl.replace("{id}", res.list[i].id);
					dom = dom.replace("{name}", res.list[i].realName);
					$("#inspection-grouper-list").append(dom);
				}

			} else {
				$("#inspection-grouper-list").html("搜索不到组长");
			}
		}
	})
}

/***
 * 显示路线
 */
local.disInspectionRoute = function () {
	/***
	 * 获取当天日期
	 */
	date = appUtil.getParameter('date');

	var data = {
		userType: "50",
		roleId: grouperId,
		inspectDate: date,
	}

	var successHandle = function (res) {
		if (res.code.toString() == "0") {
			var length = res.list.length;
			var convertedLength = 0;
			var convertedPoints = [];

			//坐标转化函数的回掉函数，将gps坐标转化为百度坐标
			//转化成功后，给回掉函数一个百度坐标点和改点在坐标序列中的顺序
			var convertHandle = function (point, i) {
				convertedLength++;	//记录转化成功的个数
				convertedPoints[i] = point;	//保存位置不变

				//由于坐标转化是异步进行，可能存在转化失败的情况
				//所以计算给定一个容错率，当转化的比例大于这个容错率的时候，表示转化成功，可以进行后续操作
				var rate = 0.05;
				var tolerantNumber = parseInt(length * rate);
				if (convertedLength == length - tolerantNumber) {
					setTimeout(function () {
						local.map.centerAndZoom(convertedPoints[0], 16);
						var legalPoints = [];
						for (var i = 0; i < convertedPoints.length; i++) {
							if (convertedPoints[i]) {
								legalPoints.push(convertedPoints[i]);
							}
						}
						var polyline = new BMap.Polyline(legalPoints, { strokeColor: "red", strokeWeight: 6, strokeOpacity: 0.5 });
						local.map.addOverlay(polyline);
					}, 300);
				}
			}

			//将所有点从gps坐标转化为百度坐标
			//为了保证坐标转化后的坐标的顺序不变，使用闭包将顺序i传入转化函数中
			for (var i = 0; i < length; i++) {
				(function (index) {
					var gpsPoint = new BMap.Point(res.list[index].longitude, res.list[index].dimension);
					BMap.Convertor.translate(gpsPoint, 0, index, convertHandle)
				})(i)
			}
		}
	}


	http.post('/rt/ap/v1/common/get_route', data).subscribe(res => {
		successHandle(res);
	})

}

/***
 * 显示当日巡检的配电室
 */
local.disInspectionPowerRoom = function (grouperId) {
	/***
	 * 获取当天日期
	 */
	dateUtil.setDate(new Date());
	var date = dateUtil.getFomattedDate("yyyy-MM-dd");
	var data = {
		inspectTeamGroupId: grouperId,
		inspectDate: date,
		from: 1
	}
	var successHandle = function (res) {
		if (res.code.toString() == "0") {
			var length = res.list.length;
			var powerRoomList = null;

			//标记重复的配电室
			for (var i = 0; i < length - 1; i++) {
				for (var j = i + 1; j < length; j++) {
					if (res.list[i].prId == res.list[j].prId) {
						res.list[j].prId = "-1";
					}
				}
			}
			powerRoomList = res.list;

			if (!powerRoomList) {
				return;
			}

			length = powerRoomList.length;
			for (var i = 0; i < length; i++) {
				//过滤重复的配电室
				if (powerRoomList[i].prId == "-1") {
					continue;
				}
				var powerRoom = powerRoomList[i];
				var powerRoomIcon0 = new BMap.Icon("./images/power-room-0.png", new BMap.Size(72, 72));
				var powerRoomIcon1 = new BMap.Icon("./images/power-room-1.png", new BMap.Size(72, 72));
				powerRoomIcon0.setImageSize(new BMap.Size(72, 72));
				powerRoomIcon1.setImageSize(new BMap.Size(72, 72));

				var html = '<div class="power-room-window" power-room-id="' + i + '">';

				html += '<div>' + powerRoom.prName + '</div>';
				html += '<div>';
				html += (powerRoom.prProvince ? powerRoom.prProvince : "");
				html += " " + (powerRoom.prCity ? powerRoom.prCity : "");
				html += " " + (powerRoom.prArea ? powerRoom.prArea : "");
				html += " " + (powerRoom.prAddress ? powerRoom.prAddress : "");
				html += '</div>';
				html += '<div>';

				html += '</div>';
				html += '</div>';

				/*选择配电室图片*/
				if (powerRoom.isAlarm == "1") {
					powerRoomIcon = powerRoomIcon1;
				} else {
					powerRoomIcon = powerRoomIcon0;
				}

				var point = new BMap.Point(powerRoom.prLongitude, powerRoom.prDimensions);
				var marker = new BMap.Marker(point, { icon: powerRoomIcon });

				marker.data = {};
				var infoWindow = new BMap.InfoWindow(html);
				marker.data.infoWindow = infoWindow;
				if (html) {
					marker.addEventListener("click", function (e) {
						this.openInfoWindow(infoWindow);
						local.map.setCenter(e.point);
						local.map.setZoom(18);
					})
				}
				local.map.addOverlay(marker);

			}
		}
	}

	http.post('/rt/ap/v1/inspection/get_inspect_situation', data).subscribe(res => {
		successHandle(res);
	})
}

//显示所有配电室
local.disAllPowerRoom = function () {
	var roleType = userInfo.roleId;

	var powerRoomIcon0 = new BMap.Icon("./images/power-room-0.png", new BMap.Size(72, 72));
	var powerRoomIcon1 = new BMap.Icon("./images/power-room-1.png", new BMap.Size(72, 72));
	powerRoomIcon0.setImageSize(new BMap.Size(72, 72));
	powerRoomIcon1.setImageSize(new BMap.Size(72, 72));

	var data = {};
	var path = ''
	if (roleType == ROLES.ZTZ) {
		data.inspectTeamId = userInfo.userId;
		path = "/rt/ap/v1/head/get_prlist_by_id";
	} else {
		if (roleType == ROLES.QXBZ) {
			data.rtlId = userInfo.userId;
		}
		path = "/rt/ap/v1/admin/get_power_room";
	}


	var successHandle = function (result) {
		if (result.code == "0") {

			var allOverlay = local.map.getOverlays();
			var isExist = false;
			var currentMarker = null;
			if (roleType == "40") {
				var prList = result.list;
			} else {
				var prList = result.prList;
			}

			/***
			 * 删除地图上有 而接口返回中的数据没有的配电室
			 */

			for (var i = 0; i < allOverlay.length; i++) {
				isExist = false;
				currentMarker = null;
				for (var j = 0; j < prList.length; j++) {
					if (allOverlay[i].data && allOverlay[i].data.id == prList[j].prId) {
						isExist = true;
						currentMarker = allOverlay[j];
						break;
					}
				}

				if (!isExist) {
					local.map.removeOverlay(allOverlay[i]);
				}
			}

			for (var i = 0; i < prList.length; i++) {

				var point = new BMap.Point(prList[i].prLongitude, prList[i].prDimensions);
				isExist = false;
				currentMarker = null;

				/***
				 * 如果配电室不存在则添加
				 */
				for (var j = 1; j < allOverlay.length; j++) {
					if (allOverlay[j].data && allOverlay[j].data.id == prList[i].prId) {
						isExist = true;
						currentMarker = allOverlay[j];
						break;
					}
				}

				var html = '<div class="power-room-window" power-room-id="' + i + '">';

				html += '<div>' + prList[i].prName + '</div>';
				html += '<div>';
				html += (prList[i].prProvince ? prList[i].prProvince : "");
				html += " " + (prList[i].prCity ? prList[i].prCity : "");
				html += " " + (prList[i].prArea ? prList[i].prArea : "");
				html += " " + (prList[i].prAddress ? prList[i].prAddress : "");
				html += '</div>';
				html += '<div>';

				html += '</div>';
				html += '</div>';

				/*选择配电室图片*/
				if (prList[i].isAlarm == "1") {
					powerRoomIcon = powerRoomIcon1;
				} else {
					powerRoomIcon = powerRoomIcon0;
				}

				if (!isExist) {
					/*如果配电室不存在  直接加入进来*/
					makeMarker(point, powerRoomIcon, {
						id: prList[i].prId,
						type: "1",
						isAlarm: prList[i].isAlarm,
						isRepair: prList[i].isRepair,
						isInspe: prList[i].isInspe

					}, false, html);
				} else {
					/*如果配电室存在  判断状态是否改变  如果状态改变了 重新载入*/
					if (currentMarker.data.isAlarm != prList[i].isAlarm || currentMarker.data.isRepair != prList[i].isRepair || currentMarker.data.isInspe != prList[i].isInspe) {
						makeMarker(point, powerRoomIcon, {
							id: prList[i].prId,
							isAlarm: prList[i].isAlarm,
							isRepair: prList[i].isRepair,
							isInspe: prList[i].isInspe
						}, false, html);
					}
				}
			}

		} else {
			//window.location.reload();
		}
	}

	http.post(path, data).subscribe(res => {
		successHandle(res);
	})

}

/***
 * 显示所有员工
 */
local.disAllStuff = function () {

	http.post('/rt/ap/v1/repdispatch/get_gps_location', successHandle);

	function successHandle(result) {

		var gpsPoint = null;
		var html = null;
		var type = null;
		if (result.code == "0") {

			/*** 
			 * 首先将页面上比接口获取到的 多出的员工删除 
			 */
			var allOverlay = local.map.getOverlays();
			var type = 0;
			var isExist = false;
			var currentMarker = null;
			for (var i in allOverlay) {
				isExist = false;
				if (allOverlay[i].data && (allOverlay[i].data.type.toString() == "2" || allOverlay[i].data.type.toString() == "3")) {
					for (var j in result.list) {
						type = ((result.list[j].userType == "50") ? "3" : "2"); //确定地图覆盖物类型
						if ((allOverlay[i].data && allOverlay[i].data.id.toString() == result.list[j].roleId.toString() && allOverlay[i].data.type.toString() == type) || result.list[j].loginStatus == 0) {
							isExist = true;
							break;
						}
					}

					if (!isExist) {
						//删除地图上多余的员工
						local.map.removeOverlay(allOverlay[i]);
					}
				}

			}
			for (var i = 0; i < result.list.length; i++) {
				gpsPoint = new BMap.Point(result.list[i].longitude, result.list[i].dimension);
				BMap.Convertor.translate(gpsPoint, 0, result.list[i], function (point, data) {
					console.log(point);
					/**
					 * 从地图中跟图type 和 id 查找是否存在当前点 
					 * 如果不存在  则添加覆盖物
					 * 如果存在  获取出该覆盖物在地图上的上次更新时间
					 * 如果上次更新时间和本次获取的不一样  删除原来的点覆盖物 重新添加
					 * 否则认为没有更新
					 */
					var inspectorIcon = new BMap.Icon("./images/inspector.png", new BMap.Size(72, 72));
					var repairerIcon = new BMap.Icon("./images/repairer.png", new BMap.Size(72, 72));
					var manIcon = null;

					var type = ((data.userType == "50") ? "3" : "2"); //确定地图覆盖物类型

					for (var i = 1; i < allOverlay.length; i++) {
						if (allOverlay[i].data && allOverlay[i].data.id.toString() == data.roleId.toString() && allOverlay[i].data.type.toString() == type) {
							isExist = true;
							currentMarker = allOverlay[i];
							break;

						}
					}

					/***
					 * 如果存在  并且 没有掉线 
					 * 移动到新的位置 并且不再往下执行
					 */
					if (isExist) {


						currentMarker.setPosition(point);
					}


					/***
					 * 如果不存在  添加到地图上
					 */

					html = '';
					html += '<div>';
					html += '<table>'
					if (data.userType == "50") {
						html += '<tr>';
						html += '<td style="text-align:right">巡检组:</td>';
						html += '<td>' + data.roleName + '</td>';
						html += '</tr>';

						manIcon = inspectorIcon;
					} else if (data.userType == "60") {
						html += '<tr>';
						html += '<td style="text-align:right">抢修组:</td>';
						html += '<td>' + data.roleName + '</td>';
						html += '</tr>';
						html += '<tr>';
						html += '<td style="text-align:right">状态:</td>';
						html += '<td>' + (data.repairStatus == "0" ? "空闲" : "派遣中") + '</td>';
						html += '</tr>';
						manIcon = repairerIcon;
					}

					html += '<tr>';
					html += '<td style="text-align:right">精度:</td>';
					html += '<td>' + data.accuracy + '（米）</td>';
					html += '</tr>';

					html += '<tr>';
					html += '<td style="text-align:right;">更新时间:</td>';
					html += '<td>' + data.lastModifyTime.slice(0, 19) + '</td>';
					html += '</tr>';

					makeMarker(point, manIcon, {
						type: type,
						id: data.roleId,
						lastModifyTime: data.lastModifyTime
					}, false, html);


				});
			}
		}
	}
}

/***
 * 向地图上添加配电室覆盖物
 * @param mPoint  	坐标点	
 * @param mHtml   	window的内容  html
 * @param mIcon   	覆盖物
 * @param data      数据 必须包含id和type
 *                  type   覆盖物类型　１配电室　２抢修组　３巡检组
 * @param isBounce  是否跳动
 */
function makeMarker(mPoint, mIcon, data, isBounce, mHtml) {
	var point = new BMap.Point(mPoint.lng, mPoint.lat);
	var marker = new BMap.Marker(point, { icon: mIcon });

	marker.data = data;
	var infoWindow = new BMap.InfoWindow(mHtml);
	marker.data.infoWindow = infoWindow;
	if (mHtml) {
		marker.addEventListener("click", function (e) {
			this.openInfoWindow(infoWindow);
			local.map.setCenter(e.point);
			local.map.setZoom(18);
		})
	}
	local.map.addOverlay(marker);
	isBounce && marker.setAnimation(BMAP_ANIMATION_BOUNCE);
}

