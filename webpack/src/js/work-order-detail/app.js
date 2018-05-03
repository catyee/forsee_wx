
require('../../scss/work-order-detail.scss');

import { model } from './model';
import { http } from '../utils/http.util';
import { appUtil } from '../utils/app.util';
import { ROLES, UPLOAD } from '../common/app-enum';
import { userInfo } from '../common/service/user.info.service';
import { TodoTasksService } from '../common/service/todo.tasks.service';

var local = {
	init 		: {},		//初始化页面
	bind		: {},		//时间绑定
	initOrder	: {},		//初始化工作票
	getOrder	: {},		//获取工作票
	renderOrder	: {},		//渲染工作票
	renderLogs	: {},		//渲染工作流
	initEditor	: {},		//初始化编辑器
	saveOrder 	: {},		//保存工作票
	adoptOrder	: {},		//审核通过
	rejectOrder	: {},		//驳回操作票
	sendEmail	: {},		//抢修班长发送邮件
	saveMultiPics	: {},	//保存客户同意的凭证
	uploadSnapshot	: {},	//保存工作票快照
	
	editor 		: null,		//编辑器
}

$(function(){

	local.init();
})

/***
 * 初始化页面
 */
local.init = function(){
	this.getParameter();
	workOrderDetailModel.orderId = this.orderId;
	//初始化编辑器
	local.initEditor();
	
	//初始化操作票
	local.initOrder();
	
	//事件绑定
	local.bind();

	TodoTasksService.start();
	
}

/**
 * 获取相应的url参数
 */

local.getParameter = function () {
	// 根据url参数判断是编辑(d)和新增一个票(prid和type)
	this.orderId = appUtil.getParameter('d');
	// 编辑
	if(!this.orderId) {
		this.prId = appUtil.getParameter('prid');
		this.type = appUtil.getParameter('type');
	}
}


/***
 * 事件绑定
 */
local.bind = function(){
    //关闭本页时 如果local.editor.isChanged == true 给出提示
    window.onbeforeunload = function(){
        if(local.editor.isChanged){
            return false;
        }
    }
	
	//保存工作票
	$("#save-order").click(function(){
		local.saveOrder(0);
	})
	
	//提交工作票
	$("#submit-order").click(function(){
		local.saveOrder(1);
	})

	//提交工作票
	$("#re-save-order").click(function(){
		local.saveOrder(2);
	})
	
	//点击审核通过按钮
	$("#adopt-order").click(function(){
		local.adoptOrder();
	})
	
	//点击驳回按钮
	$("#reject-order").click(function(){
		$("#reject-reason-modal").modal()
	})
	
	//保存驳回工作票的理由
	$("#modal-save-reject-reason").click(function(){
		local.rejectOrder();
	})
	
	//发送邮件
	$("#send-email").click(function(){
		local.sendEmail();
	})
	
	//发送邮件
	$("#email-password-modal-confirm").click(function(){
		$("#email-password-modal").modal('hide');
		local.sendEmail();
	})

	//图片预览的tpl   
	var modalPreviewImgTpl = '<div class="modal-img" imgPath="{imgPath}"><img src="{src}"/><div class="overlay"><i class="iconfont modal-remove-img">&#xe60a</i></div></div>'
	
	//删除图片预览
	$("#modal-images-container").delegate(".modal-remove-img", "click", function(){
		 $(this).parent().parent().remove();
		 var length = $("#modal-images-container").find(".modal-img").length;
		 if(length == 0){
		 	$("#upload-images-modal").attr("disabled", true);
		 }
	})

	/***
	 * 上传客户同意的图片 或工作结果
	 */
	$("#modal-select-img-btn").click(function () {
		$("#modal-select-img-input").click();
    })

    $("#modal-select-img-input").change(function (e) {
    	var file = e.currentTarget.files[0];
    	if(!file){return false;}
    	var ext = file.type;

        //文件类型检测
        if(ext && (!/(png|jpg|jpeg|gif)/.test(ext) )){
            $("#modal-select-img-tips").html('<span class="color-red">请选择图片文件</span>');
            return false;
        }else{
            $("#modal-select-img-tips").html('');
        }

        http.uploadFile(file).subscribe(function (res) {
            if(res.code == "0"){
                //如果上传成功 将图片添加到 #modal-images-container 中
                $("#modal-upload-image-btn").attr("disabled", false);
                $("#modal-images-container").append(modalPreviewImgTpl.replace("{src}", res.prefix+res.resultPath).replace('{imgPath}', res.resultPath));
            }
        });
    })
	/**
	 *	保存客户同意凭证的图片 
	 **/
	$("#modal-upload-image-btn").click(function(){
		local.saveMultiPics();
	})
	
	
	
	//上传工作结果
	$("#upload-work-result-photo").click(function(){
		$("#upload-images-modal").modal();
	})
	
	//归档
	$("#file-btn").click(function(){
		$("#upload-images-modal").modal();
	})

}

/**
 * 初始化编辑器
 */
local.initEditor = function(){
	//初始化编辑器
	local.editor = new wangEditor('work-report-editor');
	local.editor.config.mapAk = 'TT0RktRPwhEbTvTRK5I416aW';  // 此处换成自己申请的密钥
	local.editor.isChanged = false;
	
	local.editor.onchange = function(){
		local.editor.isChanged = true;
	}
	local.editor.config.useImgBase64Only = true;	//只使用图片的base64 而不上传图片
	local.editor.config.uploadImgUrl = '/';
	local.editor.config.customUpload = null;
	local.editor.create();
	
	//重新计算编辑器的内容  是的与a4纸的宽度相适应
	var width = parseFloat($(".wangEditor-txt").css("width"));
	var borderWidth = (width -  880)/2;
	if(borderWidth > 0){
		$(".wangEditor-txt").css("padding", "0 "+borderWidth+"px");
	}
	$(".wangEditor-txt").css("min-height","600px");
	$(".wangEditor-txt").css("height","auto");
}

/***
 * 初始化工作票
 */
local.initOrder = function(){

	// 新建

	if(!this.orderId) {
		$("#save-order").css("display", "block");
		$("#submit-order").css("display", "block");

		//获取工作票模板
		var orderType = this.type;
		workOrderDetailModel.getOrderTpl(orderType).subscribe(function(res){
            if(res.code == "0"){
				var tplContent = res.entity.content.replace(/\\\"/g, '"');

				local.editor.$txt.html(tplContent);
            }
		})
	}else{
        local.getOrder();
	}
}

/***
 * 获取操作票
 */
local.getOrder = function () {
    workOrderDetailModel.getOrder().subscribe(function(res){
        if(res){
            local.renderOrder();
            local.renderLogs();
        }else{
            console.error("获取工作票失败");
        }
    });
}

/***
 * 渲染工作票
 */
local.renderOrder = function(){
    var order = workOrderDetailModel.order;
    var powerRoomName = order.pr.prName;
    var orderNumber = order.gzpNum;

    //为了便于在别处保持文档结构不乱  提交到后台时在内容的外侧添加了一个容器，并且在内容的开头添加了一个样式表
    //先去掉内容的容器和样式表
    var content = order.gzpContent;
    content = content.replace(/\\\"/g,'"');
    local.editor.$txt.html(content);

   	this.prId = order.prId;

    //检查操作票的状态  开放当前可以操作的按钮
    //status是包含4位数字的字符串  0000
    //第一位标识抢修组长提交的操作票是保存状态还是提交状态   0保存  1提交  只有状态为1 才能被审核
    //第二位标识安全员的审核状态 0未审核 1审核通过 2审核未通过
    //第三位标识组团长的审核状态 同上
    //第四位标识客户的审核状态      同上

    var status 		= order.staus;
    var roleType	= $.cookie("roleType");

    if(status[0] == "1" || userInfo.roleId != ROLES.QXZZ){ //已提交 禁用编辑功能
        local.editor.disable();
    }else if(status[0] == "0" && userInfo.roleId == ROLES.QXZZ){
        $("#save-order").css("display", "block");
        $("#submit-order").css("display", "block");
    }

    //显示工作票的基本信息
    var baseInfo = '票号:'+orderNumber+' '+ ' | 配电室名称: '+powerRoomName+' | 状态：<a href="#status-list-panel">'+order.statusContent+'</a>';
    $("#order-info").html(baseInfo);

    //安全员未审核 并且已经提交
    if(userInfo.roleId == ROLES.AQY && status[1] == 0  && status[0] == "1" ){
        $("#reject-order").css("display", "block");
        $("#adopt-order").css("display", "block");
    }

    //组团长未审核 并且已经提交
    if(userInfo.roleId == ROLES.ZTZ && status[2] == 0 && status[0] == "1" ){
        $("#reject-order").css("display", "block");
        $("#adopt-order").css("display", "block");
    }

    //抢修班长未审核 并且组团长和安全员已经审核通过
    if(userInfo.roleId == ROLES.QXBZ && status[3] == 0  && status[0] == "1" && status[1] == "1" && status[2] == "1"){

        //如果没有发送邮件 显示
        if(order.sendEmail == "1"){
            $("#reject-order").css("display", "block");
            $("#adopt-order").css("display", "block");
        }else{
            $("#send-email").css("display", "block");
        }
    }

    //如果都通过了  显示上传工作结果的按钮
    if(userInfo.roleId == ROLES.QXZZ && status[3] == "1"  && status[0] == "1" && status[1] == "1" && status[2] == "1" && status[4] == "0"){
        $("#upload-work-result-photo").css("display", "block");
    }

	//如果都通过了 且上传了工作结果 显示保存回填按钮
	if(userInfo.roleId == ROLES.QXZZ && status == '11111' && order.ret != '1'){
		$("#re-save-order").css("display", "block");
		local.editor.enable();
	}

    //如果都通过了  显示归档的按钮
    if(userInfo.roleId == ROLES.AQY && status == '11111' && order.ret == '1' && order.isComplete == "0"){
        $("#file-btn").css("display", "block");
    }
}

/***
 * 渲染工作流
 */
local.renderLogs = function () {
    //如果有驳回意见 显示驳回意见
    var status	= workOrderDetailModel.logs.reverse();
    var statusLength  = status.length;
    var prefix = workOrderDetailModel.prefix;

    if(statusLength == 0){
    	$("#status-list-panel").css("display","none");
	}else{
        $("#status-list-panel").css("display","block");
	}

    var statusTpl = '<div class="status-item {stautsClass}"><div class="left"><div class="text-align-r">{time}</div><div class="text-align-r">{username}</div></div><div class="right {rightPosition}"><div class="circle"><div></div></div><div class="content">{content}</div></div></div>';
    var html = '';
    for(var i in status){
        var content  = '<div>'+status[i].taskDesc+'</div>';

        if(status[i].reason && status[i].reason && status[i].reason != "null" && status[i].reason.length >0){
            content += '<div>'+status[i].reason+'</div>';
        }

        if(status[i].pic && status[i].pic != "null" && status[i].pic.length > 0){
            var pics = status[i].pic.split(',');
            for(var j=0; j<pics.length; j++){
                content += '<a class="stauts-pic-con" rel="group'+i+'" href="'+prefix+pics[j]+'"><img style="height:100%" src="'+prefix+ pics[j]+'"></a>';
            }
        }
        //图片浏览器
        var a = $("a[rel=group"+i+"]").fancybox({
            'titlePosition' : 'over',
            'cyclic'        : true,
        });

        var item = statusTpl.replace('{username}',status[i].realName).replace('{time}',status[i].createTime).replace('{content}', content);

        if(i < statusLength-1){
            item = item.replace("{rightPosition}", 'right-common');
        }else{
            item = item.replace("{rightPosition}", '');
        }

        // if(i == 0 && res.isComplete == "1"){
        // 	//如果完成了  将第一条的状态该成完成
        // 	item = item.replace(/{stautsClass}/, "success");
        // }

        if(status[i].staus == "1"){
            item = item.replace("{stautsClass}", "success");
        }else if(status[i].staus == "2"){
            item = item.replace("{stautsClass}", "error");
        }else{
            item = item.replace("{stautsClass}", "default");
        }
        html += item;
    }
    $("#status-container").html(html);
}

/***
 * 保存工作票
 */
local.saveOrder = function(status){


	var content = local.editor.$txt.html();
	var data = {};
	if(!this.orderId){
		data.prId = this.prId;
	}else{
		data.prId = workOrderDetailModel.order.prId;
		data.id = this.orderId;
	}

	data.qxzUserId = infoUser.userId;
	data.roleId = userInfo.roleId;


	content = content.replace(/\"/g,'\\\"');
	data.gzpContent = content;
	data.staus	 = null

	var tips = null;
	if (status == "0") {
		tips = "该操作只能保存当前工作，不会将此工作票提交给上级审核，确认继续吗？";
		data.staus = 0;
	} else if (status == "1") {
		if (userInfo.roleId == ROLES.XJZZ) {

			tips = "提交后将不能修改，并且将该工作票提交上级审核，继续吗？";

		} else {
			tips = "提交视为审核通过，并且将该工作票提交上级审核，继续吗？";
		}
		data.staus = 1;
	} else if (status == "2") {
		tips = "保存后将不能修改，并且将该工作票提交安全员审核，继续吗？";
		data.ret = 1;
		data.staus = null;
	}


	//先保存快照
	local.uploadSnapshot(function(err, ret){

		if(!err){
			data.snapshot = ret.url;
			workOrderDetailModel.saveOrder(data).subscribe(function (res) {
				if(res.code == "0"){
					window.location.href = "work-order-detail.do?d="+res.id;
				}
				local.editor.isChanged = false;
			})
		}else{
			alert('保存失败');
		}

	});

}

/***
 * 审核通过操作票
 */
local.adoptOrder = function(){
	//如果不是抢修班长 给出一个提示
	if(userInfo.roleId == ROLES.QXBZ){
		$("#upload-images-modal").modal();
	}else{
		$.confirm({
			title	: "系统提示",
			content : "确认工作票内容无误，并通过审核",
			confirmButton : "确定",
			cancelButton  : "取消",
			confirm	: function(){
				var orderId = this.orderId;
				var roleId	= $.cookie("roleId");
				var data = {};

				data.id  = orderId;
				data.roleId = userInfo.roleId;
				data.userId = userInfo.userId;
				data.staus  = '1';

                workOrderDetailModel.approveOrder(data).subscribe(function (res) {
                    if(res.code == "0"){
                        window.location.reload();
                    }
                })
			}
		})
	}
	
}

/***
 * 驳回工作票
 */
local.rejectOrder = function(){
	var orderId = this.orderId;
	var roleType= $.cookie("roleType");
	var roleId	= $.cookie("roleId");
	var reason  = $.trim($("#reject-reason").val());

	var data = {};
	data.id  = orderId;
	data.roleId  = userInfo.roleId;
	data.userId	 = userInfo.userId;
	data.staus  = '2';
	data.reason = reason;
	
	workOrderDetailModel.approveOrder(data).subscribe(function (res) {
        if(res.code == "0"){
            window.location.href = "work-order-list.do";
        }
    })
}

/***
 * 抢修班长发送邮件
 */ 
local.sendEmail = function(){
	var orderId = this.orderId;
	var roleName	 = $.cookie("username");
	var password = $.trim($("#modal-email-password").val());
	
	(password.length == 0)&&(password = null);
	var data = {
		'id'	: orderId,
		'userId' 	: userInfo.userId,
		'password'  : password,
	}

	var sendingPanel = $("<div></div>");
	
	sendingPanel.css("position", "fixed");
	sendingPanel.css("background", "#2B2C30");  
	sendingPanel.css("width", "100%");
	sendingPanel.css("height", "100%");
	sendingPanel.css("top", "0px");
	sendingPanel.css("z-index", "1000");
	sendingPanel.css("text-align", "center");
	
	var html = '<span style="height:50%; display:inline-block;vertical-align:bottom;"></span><img src="images/waiting.gif"><div class="color-white">正在发送邮件...</div>';
	sendingPanel.html(html);

	$("body").css("overflow-y","hidden");
	$("body").append(sendingPanel);

	workOrderDetailModel.sendEmail(data).subscribe(function (res) {
        setTimeout(function(){
            if(res.code == "0"){
                sendingPanel.html('<span style="height:50%; display:inline-block;vertical-align:bottom;"></span><span class="color-white">发送邮件成功</span>');
                setTimeout(function(){
                    window.location.reload();
                },1000);

            }else if(res.code == "456"){
                sendingPanel.fadeOut(200);
                $("#modal-view-email").text(res.email);
                $("body").css("overflow-y","auto");
                $("#email-password-modal").modal();

			}else{
                sendingPanel.html('<span style="height:50%; display:inline-block;vertical-align:bottom;"></span><span class="color-white">发送邮件失败</span>');
                sendingPanel.fadeOut(800);
                $("body").css("overflow-y","auto");
                $("#email-password-modal").modal();
            }

        },1000);
    })
}
  
/**
 * 保存多张图片 包括客户同意的凭证 工作结果 归档图片
 */
local.saveMultiPics = function(){
	var pics 	= $("#modal-images-container").find(".modal-img");
	var paths 	= [];
	for(var i=0; i<pics.length; i++){
		paths.push($(pics[i]).attr("imgPath"));
	}
	var roleType = $.cookie("roleType");
	var roleId   = $.cookie("roleId");
	var orderId  = this.orderId;
	
	var data = {
		userId : userInfo.userId,
		roleId : userInfo.roleId,
		id     : orderId,
		pic    : paths.join(',')
	}

	workOrderDetailModel.savePics(data).subscribe(function (res) {
        if(res.code == "0"){
            window.location.reload();
        }
    })
}

/***
 * 保存工作票快照
 */
local.uploadSnapshot = function( callback ){

	var ele = $(".wangEditor-txt");
	ele.css('position','absolute');
	var width = ele[0].offsetWidth;
	var height = ele[0].offsetHeight;

	//先因隐藏可见字符
	this.editor.$editorContainer.removeClass('show-hidden-char');

	html2canvas(ele[0],{
		width: width,
		height: height,
		onrendered : function (canvas) {
			var url = canvas.toDataURL();
			var file = dataURLtoBlob( url );

			http.uploadFile( file ).subscribe(function (res) {

				if ( res.code == '0' ){

					if ( callback instanceof Function ){

						callback(null, {
							'url' : res.resultPath
						})
					}

				}else{

					if ( callback instanceof Function ){

						callback(res)
					}

				}

			})



			ele.css('position','static');
		}
	})

	function dataURLtoBlob(dataurl) {
		var arr = dataurl.split(',');
		var mime = arr[0].match(/:(.*?);/)[1];// 结果：   image/png
		var bstr = atob(arr[1].replace(/\s/g, ''));
		var bstr = atob(arr[1]);
		var n = bstr.length;
		var u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new Blob([u8arr], {type: mime});//值，类型
	}

}