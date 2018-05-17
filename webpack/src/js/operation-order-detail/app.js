require('../../scss/operation-order-detail.scss');

let $ = require('jquery');
let wangEditor = require('../../../vendors/wangEditor/js/wangEditor');

import { UI } from '../common/ui';
import { appUtil } from '../utils/app.util';
import { ROLES, UPLOAD } from '../common/app-enum';
import { userInfo } from '../common/service/user.info.service';
import { model } from './model';
import { TicketTemplateSelector } from '../../components/ticket-template-selector/component';
import { TicketResultUploader } from '../../components/ticket-result-uploader/component';
import { TodoTasksService } from '../common/service/todo.tasks.service';

var local = {
	init: {},		//初始化
	bind: {},		//事件绑定
	initOrder: {},
	renderOrder: {},		//渲染操作票
	submitOrder: {},		//保存操作票
	initWorkFlow: {},		//初始化工作流
	sendEmail: {},
	downloadOrder: {},
	saveMultiPics: {},		//保存多张图片
	uploadSnapshot: {},		//保存快照

	saveBtn: null,
	submitBtn: null,
	auditPassBtn: null,
	auditRejectBtn: null,
	customerAuditPassBtn: null,
	customerAuditRejectBtn: null,
	uploadResultBtn: null,
	fileBtn: null,
};

$(function () {
	local.init();
});

/***
 * 初始化
 */

local.init = function () {
	this.orderId = appUtil.getParameter('id');

	this.saveBtn = $("#save");
	this.submitBtn = $("#submit");
	this.auditPassBtn = $("#audit-pass");
	this.auditRejectBtn = $("#audit-reject");
	this.customerAuditPassBtn = $("#customer-audit-pass");
	this.customerAuditRejectBtn = $("#customer-audit-reject");
	this.uploadResultBtn = $("#upload-result");
	this.fileBtn = $("#file");

	this.initEditor();
	this.bind();
	local.initOrder();

	TodoTasksService.start();
};


local.bind = function () {

	/*保存*/

	this.saveBtn.click(function () {
		local.submitOrder('0');
	});

	/*提交*/

	this.submitBtn.click(function () {
		local.submitOrder('1');
	});

	/*保存回填*/

	$('#re-save-order').click(function () {
		local.submitOrder('2');
	});

	/*审核通过*/

	this.auditPassBtn.click(function () {
		UI.confirm({
			tip: '是否确认操作票信息及流程无误，并通过审核？',
			rightBtnClick: function (content) {
				alert(content);
				var data = {
					id: orderId,
					userId: userInfo.userId,
					roleId: userInfo.roleId,
					staus: '1'
				};

				model.approveOrder(data).subscribe(function (res) {
					if (res.code == '0') {
						$('#reject-reason-modal').modal('hide');
						window.location.reload();
					}
				});
			}
		});
	});

	/*审核不通过*/
	this.auditRejectBtn.click(function () {
		UI.prompt({
			tip: '请注明驳回原因',
			rightBtnClick: function (content) {
				console.log(content)

			}
		});
	});

	// 客户审核通过
	this.customerAuditPassBtn.click( function(){
		TicketResultUploader.show({
			content:'请上传客户审核结果的照片'
		}).subscribe( res => {
			let images = res.value;
			console.log(res);
		})
	})

	// 客户不审核通过
	this.customerAuditRejectBtn.click( function(){
		UI.prompt({
			tip: '请注明驳回原因',
			rightBtnClick: function (content) {
				console.log(content)
			}
		});
	})

	// 上传工作结果
	this.uploadResultBtn.click(function(){
		TicketResultUploader.show({
			content:'请上传工作结果的照片'
		}).subscribe( res => {
			let images = res.value;
			console.log(res);
		})
	})

	// 归档
	this.fileBtn.click(function(){
		TicketResultUploader.show({
			content:'请上传归档文件签字的图片'
		}).subscribe( res => {
			let images = res.value;
			console.log(res);
		})
	})

	//图片预览的tpl

	var modalPreviewImgTpl = '<div class="modal-img" imgPath="{imgPath}"><img src="{src}"/><div class="overlay"><i class="iconfont modal-remove-img">&#xe60a</i></div></div>';

	//删除图片预览

	$('#modal-images-container').delegate('.modal-remove-img', 'click', function () {
		$(this).parent().parent().remove();
		var length = $('#modal-images-container').find('.modal-img').length;
		if (length == 0) {
			$('#upload-images-modal').attr('disabled', true);
		}
	});

	/***
	 * 上传客户同意的图片 或工作结果
	 */

	$('#modal-select-img-btn').click(function () {
		$('#modal-select-img-input').click();
	});

	$('#modal-select-img-input').change(function (e) {
		var file = e.currentTarget.files[0];
		if (!file) {
			return false;
		}
		var ext = file.type;

		//文件类型检测

		if (ext && (!/(png|jpg|jpeg|gif)/.test(ext))) {
			$('#modal-select-img-tips').html('<span class="color-red">请选择图片文件</span>');
			return false;
		} else {
			$('#modal-select-img-tips').html('');
		}

		http.uploadFile(file).subscribe(res => {
			if (res.code == '0') {

				//如果上传成功 将图片添加到 #modal-images-container 中

				$('#modal-upload-image-btn').attr('disabled', false);
				$('#modal-images-container').append(modalPreviewImgTpl.replace('{src}', res.prefix + res.resultPath).replace('{imgPath}', res.resultPath));
			}
		})
	});

	/*点击 "客户驳回" 按钮 使用统一的意见面板*/

	$('#customer-reject-order').click(function () {
		$('#modal-reject-is-customer').val('1');
		$('#reject-reason-modal').modal();
	});

	/*点击 "客户同意" 按钮*/

	$('#customer-adopt-order').click(function () {
		$('#modal-upimg-is-customer').val('1');
		$('#upload-images-modal').modal();
	});

	/* 点击上传工作结果按钮*/

	$('#upload-result').click(function () {
		$('#upload-images-modal').modal();
	});

	/*点击归档按钮*/

	$('#file-btn').click(function () {
		$('#upload-images-modal').modal();
	});


	/*确定驳回*/

	$('#modal-save-reject-reason').click(function () {
		var orderId = this.orderId;
		var rejectReason = $('#reject-reason').val();
		var roleId = userInfo.roleId;


		if ($('#modal-reject-is-customer').val() == '1') {
			roleId = ROLES.KH;
		}

		var data = {
			id: orderId,
			userId: userInfo.userId,
			roleId: roleId,
			reason: rejectReason,
			staus: '2'
		};

		model.approveOrder(data).subscribe(function (res) {
			if (res.code == '0') {
				$('#reject-reason-modal').modal('hide');
				window.location.reload();
			}
		});
	});

	/***
	 * 发送邮件
	 */

	$('#send-email').click(function () {
		local.sendEmail();
	});

	/***
	 * 重新填写邮件密码之后
	 * 点击确定
	 */

	$('#email-password-modal-confirm').click(function () {
		$('#email-password-modal').modal('hide');
		local.sendEmail();
	});


	/***
	 * 点击上传图片modal 的确定按钮
	 */

	$('#modal-upload-image-btn').click(function () {
		local.saveMultiPics();
	});

	$('#download-order').click(function () {
		var order = model.order;
		var a = $('<a>').attr('href', model.prefix + order.czpFile).attr('download', '操作票-' + order.fileNum + '.pdf');
		a.appendTo('body');
		a[0].click();
		a.remove();
	});
};

/**
 * 初始化编辑器
 */

local.initEditor = function () {

	//初始化编辑器

	local.editor = new wangEditor('editor');
	local.editor.config.mapAk = 'TT0RktRPwhEbTvTRK5I416aW';  // 此处换成自己申请的密钥
	local.editor.isChanged = false;

	local.editor.onchange = function () {
		local.editor.isChanged = true;
	};
	local.editor.config.useImgBase64Only = true;	//只使用图片的base64 而不上传图片
	local.editor.config.uploadImgUrl = '/';
	local.editor.config.customUpload = null;

	// 吸顶
	local.editor.config.menuFixed = true;

	local.editor.create();
};

/**
 * 初始化操作票
 */

local.initOrder = function () {

	//新建操作票

	if (!this.orderId) {
		// 弹出操作票模板选择框 

		TicketTemplateSelector.show({
			content: '请为将要创建的操作票选择一个模板：',
			tplType: TicketTemplateSelector.tplTypes.oper
		}).subscribe(data => {
			const id = data.value;
			if (id) {
				// 获取模板
			}
		})

		$('#save-order').css('display', 'block');
		$('#submit-order').css('display', 'block');

		//获取工作票模板

		var orderType = this.type;
		model.getOrderTpl(orderType).subscribe(function (res) {
			if (res.code == '0') {
				var tplContent = res.entity.content.replace(/\\\"/g, '"');
				local.editor.$txt.html(tplContent);
			}
		});
	} else {
		var id = this.orderId;
		model.getOrder(id).subscribe(function (res) {
			if (res) {
				local.renderOrder();
			}
		});
	}

};

/***
 * 渲染操作票
 * @param res
 */

local.renderOrder = function () {
	var order = model.order;

	// $('#power-room-id').val(order.prId);
	this.prId = order.prId;

	//显示操作票状态

	$('#status').html(order.statusContent);
	local.editor.$txt.html(order.content);

	//如果可以编辑的话

	if (order.enableEdit) {

		$('#save-order').css('display', 'block');
		$('#submit-order').css('display', 'block');

	} else {
		local.editor.disable();
	}


	var orderStatus = order.staus;
	if (userInfo.roleId == ROLES.ZTZ && orderStatus == '10000') {

		/*如果是组团长并且未审核*/

		$('#reject-order').css('display', 'block');
		$('#adopt-order').css('display', 'block');

	} else if (userInfo.roleId == ROLES.AQY && orderStatus == '11000') {

		/*如果是安全员 并且组团长已经审核通过*/

		$('#reject-order').css('display', 'block');
		$('#adopt-order').css('display', 'block');

	} else if (userInfo.roleId == ROLES.ZTZ && orderStatus == '11100' && order.sendEmail != '1') {

		/*如果是组团长 并且安全员已经审核通过 但是未发送邮件*/

		$('#send-email').css('display', 'block');

	} else if (userInfo.roleId == ROLES.ZTZ && orderStatus == '11100' && order.sendEmail == '1') {

		/*如果是组团长 并且安全员已经审核通过 而且已经发送邮件*/

		$('#customer-reject-order').css('display', 'block');
		$('#customer-adopt-order').css('display', 'block');

	} else if (userInfo.roleId == ROLES.XJZZ && orderStatus == '11110') {

		$('#upload-result').css('display', 'block');

	} else if (userInfo.roleId == ROLES.XJZZ && orderStatus == '11111' && order.ret != '1') {

		$('#re-save-order').css('display', 'block');
		local.editor.enable();

	} else if (userInfo.roleId == ROLES.AQY && orderStatus == '11111' && order.ret == '1' && order.isComplete != '1') {

		$('#file-btn').css('display', 'block');

	}

	if (orderStatus == '11110') {

		/*客户审核通过  无论是谁都能下载操作票*/

		// $("#download-order").css("display", "block");

	}

	local.initWorkFlow();
};

/***
 * 初始化工作流
 */

local.initWorkFlow = function () {
	var status = model.logs.reverse();
	var statusLength = status.length;
	var prefix = model.prefix;

	if (statusLength == 0) {
		$('#status-list-panel').css('display', 'none');
	} else {
		$('#status-list-panel').css('display', 'block');
	}

	var statusTpl = '<div class="status-item {stautsClass}"><div class="left"><div class="text-align-r">{time}</div><div class="text-align-r">{username}</div></div><div class="right {rightPosition}"><div class="circle"><div></div></div><div class="content">{content}</div></div></div>';
	var html = '';
	for (var i in status) {
		var content = '<div>' + status[i].taskDesc + '</div>';

		if (status[i].reason && status[i].reason && status[i].reason != 'null' && status[i].reason.length > 0) {
			content += '<div>' + status[i].reason + '</div>';
		}

		if (status[i].pic && status[i].pic != 'null' && status[i].pic.length > 0) {
			var pics = status[i].pic.split(',');
			for (var j = 0; j < pics.length; j++) {
				content += '<a class="stauts-pic-con" rel="group' + i + '" href="' + prefix + pics[j] + '"><img style="height:100%" src="' + prefix + pics[j] + '"></a>';
			}
		}

		//图片浏览器

		var a = $('a[rel=group' + i + ']').fancybox({
			'titlePosition': 'over',
			'cyclic': true,
		});

		var item = statusTpl.replace('{username}', status[i].realName).replace('{time}', status[i].createTime).replace('{content}', content);

		if (i < statusLength - 1) {
			item = item.replace('{rightPosition}', 'right-common');
		} else {
			item = item.replace('{rightPosition}', '');
		}

		// if(i == 0 && res.isComplete == "1"){
		// 	//如果完成了  将第一条的状态该成完成
		// 	item = item.replace(/{stautsClass}/, "success");
		// }

		if (status[i].staus == '1') {
			item = item.replace('{stautsClass}', 'success');
		} else if (status[i].staus == '2') {
			item = item.replace('{stautsClass}', 'error');
		} else {
			item = item.replace('{stautsClass}', 'default');
		}
		html += item;
	}
	$('#status-container').html(html);

};

/****
 * 提交操作票
 * @param status 0保存 1提交
 * @returns {boolean}
 */

local.submitOrder = function (status) {

	var powerRoomId = this.prId;

	var orderId = this.orderId;
	var groupId = null;

	(!orderId) && (orderId = null);

	if (userInfo.roleId == ROLES.XJZZ) {

		//新增的时候才传入巡检小组的id

		groupId = userInfo.userId;
	}

	var content = this.editor.$txt.html();

	var data = {
		id: orderId,
		prId: powerRoomId,
		xjzzUserId: groupId,
		roleId: userInfo.roleId,
		staus: status,
		content: content
	};

	var tips = null;
	if (status == '0') {
		tips = '该操作只能保存当前工作，不会将此操作票提交给上级审核，确认继续吗？';
	} else if (status == '1') {
		if (userInfo.roleId == ROLES.XJZZ) {

			tips = '提交后将不能修改，并且将该操作票提交上级审核，继续吗？';

		} else {
			tips = '提交视为审核通过，并且将该操作票提交上级审核，继续吗？';
		}
	} else if (status == '2') {
		tips = '保存后将不能修改，并且将该操作票提交安全员审核，继续吗？';
		data.ret = 1;
		data.staus = null;
	}

	UI.confirm({
		tip: tips,
		rightBtnClick: function () {
			//先保存快照

			local.uploadSnapshot(function (err, ret) {

				data.snapshot = ret.url;
				if (!err) {
					model.saveOrder(data).subscribe(function (res) {
						if (res.code == '0') {
							window.location.href = 'operation-order-detail.html?d=' + res.id;
						}
					});
				} else {
					alert('保存失败');
				}

			});
		}
	})

};

/***
 * 发送邮件
 *
 */

local.sendEmail = function () {
	$('#send-email-tips').text('正在生成PDF文件...');
	$('#send-email-overlay').css('display', 'block');
	var timer = setTimeout(function () {
		$('#send-email-tips').text('正在发送邮件...');
	}, 1000);


	var orderId = this.orderId;
	var emailPassword = $('#modal-email-password').val();
	$('#modal-email-password').val('');

	(emailPassword.length == 0) && (emailPassword = null);
	model.sendEmail(orderId, emailPassword).subscribe(function (res) {
		success(res);
	});

	function success(res) {
		clearTimeout(timer);
		if (res.code == '0') {
			$('#send-email-tips').text('邮件发送成功');
			setTimeout(function () {
				$('#send-email-overlay').css('display', 'none');
				window.location.reload();
			}, 2000);
		} else if (res.code == '441') {
			$('#send-email-tips').text('邮件发送失败');
			setTimeout(function () {
				$('#send-email-overlay').css('display', 'none');
				$('#modal-view-email').text(res.email);
				$('#email-password-modal').modal();
			}, 2000);
		} else {
			$('#send-email-tips').text('邮件发送失败');
			setTimeout(function () {
				$('#send-email-overlay').css('display', 'none');
			}, 2000);
		}
	}

};

/****
 * 保存多张图片 包括客户同意凭证 工作结果 归档记录
 */

local.saveMultiPics = function () {
	var pics = $('#modal-images-container').find('.modal-img');
	var paths = [];
	for (var i = 0; i < pics.length; i++) {
		paths.push($(pics[i]).attr('imgPath'));
	}

	var orderId = this.orderId;

	model.savePics(orderId, paths.join(',')).subscribe(function (res) {
		if (res.code == '0') {
			window.location.reload();
		}
	});
};

/***
 * 保存操作票票快照
 */

local.uploadSnapshot = function (callback) {

	var ele = $('.wangEditor-txt');
	ele.css('position', 'absolute');
	var width = ele[0].offsetWidth;
	var height = ele[0].offsetHeight;

	//先因隐藏可见字符

	this.editor.$editorContainer.removeClass('show-hidden-char');

	html2canvas(ele[0], {
		width: width,
		height: height,
		onrendered: function (canvas) {
			var url = canvas.toDataURL();
			var file = dataURLtoBlob(url);

			http.uploadFile(file).subscribe(function (res) {

				if (res.code == '0') {

					if (callback instanceof Function) {

						callback(null, {
							'url': res.resultPath
						});
					}

				} else {

					if (callback instanceof Function) {

						callback(res);
					}

				}

			});


			ele.css('position', 'static');
		}
	});

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
		return new Blob([u8arr], { type: mime });//值，类型
	}

};