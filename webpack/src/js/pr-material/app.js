require('../../scss/pr-material.scss');

let $ = require('jquery');
import { UI } from '../common/ui';
import { powerRoomModel } from '../common/power-room-model';
import { userInfo } from '../common/service/user.info.service';
import { http } from '../utils/http.util';
import { UPLOAD, ROLES } from '../common/app-enum';
import { powerRoomCommonController } from '../common/power-room-common-controller';
import { dateUtil } from '../utils/date.util';
import { Observable } from 'rxjs';
import { TodoTasksService } from '../common/service/todo.tasks.service';
require('../common/power-room-common-controller');

 
var app = {
	initPowerRoomFileList: {},
	fileBaseUrl: '',   //保存文件路径的前缀 

};
var updateCode = 0;
$(function () {

	app.initPowerRoomFileList();
	/*删除配电室文件*/

	$('#power-room-metarial').delegate('.remove-power-room-file', 'click', function () {
		var referID = $(this).attr('refer-id');
		var fileId = $(this).attr('file-id');
		powerRoomModel.setFileOutFromPowerRoom(referID, fileId).subscribe(function (result) {

			app.initPowerRoomFileList();
			app.initSystemFileList();
		});

	});

	Observable.fromEvent(document.getElementById('search-input'), 'keyup').debounceTime(300).subscribe(event => {
		app.initPowerRoomFileList();
	})

	/*预览文件*/
	$('#power-room-metarial').delegate('.material', 'click', function () {
		window.open($(this).data('url'));
	});

	/*删除文件*/
	$('#power-room-metarial').delegate('.remove', 'click', function (e) {
		let id = $(this).data('id');
		let dom = $(this).parent().parent();
		UI.confirm({
			tip: '确认要删除该文件吗',
			rightBtnClick: function () {
				app.removeFile(id, dom);
			}
		})
		e.stopPropagation();
	});


	// 上传文件
	$("#file-button").click(function () {
		$("#file-input").click();
	})

	$("#file-input").change(event => {
		let file = event.target.files[0];
		if (file) {
			app.uploadFile(file);
		}
	})

	TodoTasksService.start();
});

// 上传文件
app.uploadFile = function (file) {

	http.uploadFile(file, '/ems/rest/common/file/upload/document', {
		prId: powerRoomModel.powerRoomId
	}).subscribe(res => {
		if(res.code === 200){
			this.initPowerRoomFileList();
		}else{
			UI.Notification.error(`上传失败[${res.code}]`);
		}
	})
}

// 删除文件
app.removeFile = function (id, dom) {
	http.put('/ems/rest/pr/file', {
		fileId: id
	}).subscribe(res => {
		if (res.code === 200) {
			UI.Notification.success('删除成功');
			dom.remove();
			app.toggleEmptyTips();
		} else {
			UI.Notification.error(`删除失败[${res.code}]`);
		}
	})
}

/***
 * 初始化配电室文件列表
 */

app.initPowerRoomFileList = function () {
	let powerRoomId = powerRoomModel.powerRoomId;
	let keyword = $("#search-input").val();
	let param = {
		prId: powerRoomId
	}

	if (keyword) {
		param.keyword = keyword
	}
	http.get('/ems/rest/pr/file/list', param).subscribe(res => {
		if (res.code === 200) {

			let container = $("#power-room-metarial");
			this.fileBaseUrl = res.prefix;
			let files = res.body;
			let length = files.length;

			let html = '';
			for (let i = 0; i < length; i++) {
				html += this.createFileDom(files[i]);
			}

			container.html(html);

			app.toggleEmptyTips();
		}
	})
};

// 是否显示空记录提示
app.toggleEmptyTips = function () {
	let container = $("#power-room-metarial");
	let emptyTips = $("#empty-tips");
	let length = $(".material").length;
	if (length) {
		container.show();
		emptyTips.hide();
	} else {
		emptyTips.show();
		container.hide();
	}
}

app.createFileDom = function (item) {
	dateUtil.setDate(item.createTime);
	let time = dateUtil.getFormattedDate('yyyy-MM-dd hh:mm:ss');

	let removeBtn = '';
	
	if(userInfo.roleId === ROLES.ZTZ){
		removeBtn =	'<span class="remove" data-id="${item.fileId}">删除</span>';
	}
	return `
	<div class="material" data-url="${app.fileBaseUrl + item.fileUrl}">
		<div>${item.fileName}</div>
		<div>${time}上传</div>
		<div>
			${removeBtn}
			&nbsp;<span class="detail">详情</span>
		</div>
	</div>
	`
}