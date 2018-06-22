function UploadUI(config, status) {
	var success = 0, fail = 0, fileList = new Array();
	var ERROR_INFO = {
		'001':'读取文件失败',
		'002':'读取文件中断',
		'003':'快传超时',
		'004':'快传失败',
		'005':'查询超时',
		'006':'查询失败',
		'007':'上传失败',
		'008':'上传超时',
		'009':'上传返回失败',
		'010':'上传中读取文件失败',
		'000':'未知错误'
	};
	function addFile(file) {
		fileList.push(file);
		$.tmpl('row-file',{"file":file}).appendTo(config.showFilelist);
		$(config.showEleId).show();
	}
	function editPercent(file, percent, type) {
		if(typeof file == 'undefined') return false;

		var selector = config.showFilelist + ' li[fileid=\'' +file.id+ '\']';
		var ele =  $(selector);
		var progress_ele = $(selector).find('.progress');
		if(type == 'finish') {
			$(selector).find('.progress').css('width', percent + '%');
			return true;
		}
		if(type == 'md5') {
			ele.find('.fc3').html('<span>正在读取文件</span>');
			progress_ele.css({'background':'#89B5F3', 'width':percent + '%'});
		} else {
			ele.find('.fc3').html('<span class="uploadinfo"></span>');
			progress_ele.css({'background':'rgb(77, 243, 53)', 'width':percent + '%'});
		}
	}
	//创建显示窗口
	function create() {
		$.get(config.tmplFrame,function(data) {
			$('body').append(data);
			$('.imin',config.showEleId).show();
			$('.iclose',config.showEleId).on('click', function() {
				var unUpload = fileList.length - success - fail;
				if(unUpload > 0) {
					var closeDialog = gfsDialog({
						"tips":'当前有任务在上传 是否取消?',
					    "buttons":[
					        {
					            'theme':'blue',
					            'title':'确定',
					            'callback':function() {
					            	closeDialog.closeD();
					            	empty();
									hide();
					                
					            }
					        },{
					            'theme':'blank',
					            'title':'取消',
					            'callback':function() {
					                closeDialog.closeD();
					            }
					        }
					    ]
					});
					closeDialog.init();
					closeDialog.showD();
					return false;
				}

				uploadfileObj.empty();
				empty();
				hide();
								
			});

			//最小化
			$(config.showEleId).delegate('.imin', 'click',function() {
				min();
			});
			//最大化
			$(config.showEleId).delegate('.imax' , 'click',function() {
				max();
			});
			//关闭蓝色警告
			// $(config.showEleId + ' .inotice_close').on('click',function() {
			// 	$(config.showEleId + ' .blue-tips').hide();
			// });

			$(config.showEleId).delegate('.foperation>i', 'click', function(){
				var fid = $(this).closest('li').attr('fileid');
				if($(this).hasClass('operate-remove')) {
					uploadfileObj.remove(fid);
					return false;
				}
				
			})
		});

		$.ajax({
			type:'get',
			async:false,
			url:config.tmplRow + '?' + (new Date()).getTime(),
			success:function(data) {
				$.template('row-file',data);
			}
		});
	}
	function getSuccess() {
		return success;
	}
	function editSpeed(file, prevChunk) {
		var speedtime = file.speed.time;
		var selector = config.showFilelist + ' li[fileid=\'' +file.id+ '\']';
		var ele =  $(selector);
		var speed = Math.round(prevChunk / file.speed.time * 1000).toMemoryUnit(0) + 'bps/秒';
		ele.find('.uploadinfo').html(speed);
	}
	function editStatus(file) {
		var selector = config.showFilelist + ' li[fileid=\'' +file.id+ '\']';
		var ele =  $(selector);
		if(ele.length <= 0) return false;
		//秒传
		if(file.status == status.STATUS_TSUCCESS) {
			success ++;
			ele.find('.uploadinfo').remove();
			noticeQ();
			editPercent(file, 100, 'upload');
			ele.find('.fc3').html('<i class="iconbg isuccess"></i><span>上传成功</span>');
			ele.find('.foperation>i').hide();
			setTimeout(function() {
				editPercent(file, 0,'finish');
			}, 1000);
			return false;
		}
		//成功
		if(file.status == status.STATUS_SUCCESS) {
			success ++;
			noticeQ();
			ele.find('.uploadinfo').remove();
			editPercent(file, 100,'upload');
			ele.find('.fc3').html('<i class="iconbg isuccess"></i><span>上传成功</span>');
			ele.find('.foperation>i').hide();
			setTimeout(function() {
				editPercent(file, 0, 'finish');
			}, 1000);

			return false;
		}
        //正在上传
        if(file.status == status.STATUS_UPLOADING) {
            ele.find('.fc3').html('<span style="font-size:9px;">正在上传</span>');
            fail ++;
            ele.find('.uploadinfo').remove();
            return false;
        }
		//失败
		if(file.status == status.STATUS_ERROR) {
			ele.find('.fc3').html('<i class="iconbg ifail"></i><span style="font-size:9px;">' + ERROR_INFO[file.errorCode]+ '</span>');
			fail ++;
			ele.find('.uploadinfo').remove();
			return false;
		}
	}

	function removeFile(file) {
		for(var i = 0; i < fileList.length ; i ++) {
			if(fileList[i].id == file.id) {
				fileList.splice(i, 1);
				break;
			}
		}
		$(config.showFilelist + ' li[fileid=\'' +file.id+ '\']').remove();
		noticeQ();
	}

	function empty(){
		var itemStatus = '';
		for(var i = 0; i < fileList.length ; i ++) {
			itemStatus = fileList[i].status;
			if(itemStatus == status.STATUS_TSUCCESS || itemStatus == status.STATUS_SUCCESS || itemStatus == status.STATUS_ERROR) {
				continue;
			}
			uploadfileObj.remove(fileList[i].id);
		}

		$(config.showEleId).remove();
		create();
		fileList = new Array();
		success = fail = 0;
	}
	function max() {
		$(config.showEleId + ' .f_header').show();
		$(config.showEleId + ' .f_list').show();
		$(config.showEleId + ' .imax').hide();
		$(config.showEleId + ' .imin').show();
	}
	function min() {
		$(config.showEleId + ' .f_header').hide();
		$(config.showEleId + ' .f_list').hide();
		$(config.showEleId + ' .imax').show();
		$(config.showEleId + ' .imin').hide();
	}
	function notice(message) {
		var selector = config.showEleId + ' .blue-tips';
		$(selector).show();
		$(selector).find('.upload_notice').html(message);
	}
	function noticeQ() {
		var selector = config.showEleId + ' h3';
		if(fileList.length == 0) {
			$(selector).html('上传完成');
			return false;
		}
		if(success == fileList.length) {
			$(selector).html('上传完成');
            //解决多次刷新的bug（去掉setTimeout）
			//setTimeout(
				//function() {
			var pIf = document.getElementById('mainframe');
			pIf.src = pIf.src + "&".concat(Math.random());
            mainframe.window.location.reload();
			//	}, 1000);
		} else {
			$(selector).html('上传列表（' + success + '/' + fileList.length + '）');
		}
	}
	function show() {
		$(config.showEleId).show();
	}
	function hide(){
		$(config.showEleId).hide();
	}
	return {remove:removeFile,editSpeed:editSpeed,getSuccess:getSuccess,min:min,create:create,noticeQ:noticeQ,addFile:addFile, show:show, editStatus:editStatus, editPercent:editPercent};
};

window.initUpload = function() {
    if(uploadfileObj == null) {
        uploadfileObj = FileUploader({});
        uploadfileObj.init({});
        return uploadfileObj;
    }
    return uploadfileObj;
}
window.addFile = function(path, files) {
	if(files.length > 1000) {
		show_error_tips('最多上传1000个文件');
		return false;
	}
	for(var i = 0; i < files.length;   i ++) {
        uploadfileObj.addFile(path, files[i]);
    }
}

function loadUploadJs() {
	if(typeof File != 'function' && typeof File != 'object'){
		$.getScript("/script/upload/ieupload.js?v=20170810");
		return false;
	}
	$.getScript("/script/md5/spark-md5.js");
	$.getScript("/script/upload/uploader.js?v=20170810");
	$.getScript("/script/upload/dragh5.js");
}
loadUploadJs();
$.getScript('/manage/js/file.js');
$.getScript('/script/libs/parabola.js');
$.getScript('/script/dist/echarts.js');
$.getScript('http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js');
$.getScript('/script/cityweather.js');
$.getScript('/manage/js/hardusage.js');