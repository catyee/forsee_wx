/**
 * 配电室公用信息 
 */

let $ = require('jquery');
import { powerRoomModel } from './power-room-model';
import { appUtil } from '../utils/app.util';
import { UI } from './ui';
import { userInfo } from './service/user.info.service';
import { ROLES } from './app-enum';

var app = {

	/*初始化配电室的基本信息*/

	initPowerRoomBaseInfo : null,
	
	/*初始化一次接线图按钮*/

	initYCJXTButton : null,
	
	/*配电室基本信息*/

	baseInfo : null,

};

/***
 * 初始化配电室信息
 */

app.initPowerRoomBaseInfo = function(){
	powerRoomModel.getPowerRoomBaseInfo().subscribe(function(res){
		if(res.code === 200){
			var pr = res.body;
			app.prefix = res.prefix;
			$('.pr-name').text(pr.prName);
			$('#pr-address').text(pr.address);
			$('#customer-name').text(pr.cusName);
			$('#customer-mobile').text(pr.lxr1Mobile);
			$('#station-name').text(pr.stationName?pr.stationName:'-');
			$('#station-mobile').text(pr.masterMobile?pr.masterMobile:'-');
			$('#station-leader').text(pr.stationMaster?pr.stationMaster:'-');
			$('#pr-desc').text(pr.prDesc);

			let badgeNumber = pr.tfCount + pr.fjCount;
			if(badgeNumber && userInfo.roleId == ROLES.ZTZ){
				$("#inspection-badge").text(badgeNumber);
				$("#inspection-badge").css('display', 'inline-block');
			}
		}
	}); 
}; 

/***
 * 初始化一次接线图按钮
 */

app.initYCJXTButton = function(){
	$('#toYCJXTpage').click(function(){
		if(!appUtil.isIE()){
			UI.alert({
				content:'请使用IE浏览器打开'
			});
			return false;
		}

		window.open('./jkviewer.html?prid='+this.powerRoomId);
	});
};



$(()=>{
	powerRoomModel.powerRoomId = appUtil.getParameter('id');
	// 标记当前页面的对应标签为active
	let href = window.location.pathname.split('/').splice(-1,1)[0];
	$('.header .tabs a[href="'+href+'"]').addClass('active');

	// 修改tab标签的href
	$('.tabs>a').map(function(index, element){
		let href = $(element).attr('href')+'?id='+powerRoomModel.powerRoomId;
		$(element).attr('href', href);
	})

	app.initPowerRoomBaseInfo();
	app.initYCJXTButton();
	
})

exports.app = app;
exports.powerRoomCommonController = app;










