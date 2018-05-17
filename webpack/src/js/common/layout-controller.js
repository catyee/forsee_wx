import { userInfo } from './service/user.info.service';
let $ = require('jquery');

// 初始化layout

$(function(){

	// 初始化用户名

	$('#username').text(userInfo.username);

	// 事件绑定 退出登录

	$('#log-out').click(function(){
		alert('退出登录');
	});

	calcHeaderWidth();
	$(window).resize(function() {
		calcHeaderWidth();
	})

	//根据url 高亮当前标题

	let url = window.location.href;
	$('.nav-content').find('a').addClass('color-grey');
	if(/repairing-list/.test(url)){
		$('.nav-content .repair-list-item').find('a').removeClass('color-grey');
		return;
	}
	if(/power-room-list/.test(url)){
		$('.nav-content .pr-item').find('a').removeClass('color-grey');
		return;
	}
	if(/system-warning/.test(url)){
		$('.nav-content .warning-item').find('a').removeClass('color-grey');
		return;
	}
	if(/inspection-bug-list/.test(url)){
		$('.nav-content .inspect-bug-item').find('a').removeClass('color-grey');
		return;
	}
	if(/inspection-arrange-list/.test(url)){
		$('.nav-content .inspect-arrange-item').find('a').removeClass('color-grey');
		return;
	}
	if(/repair-log-list/.test(url)){
		$('.nav-content .repair-log-item').find('a').removeClass('color-grey');
		return;
	}
	if(/inspection-log-list/.test(url)){
		$('.nav-content .inspect-log-item').find('a').removeClass('color-grey');
		return;
	}
	if(/operation-order-list/.test(url)){
		$('.nav-content .oper-item').find('a').removeClass('color-grey');
		return;
	}
	if(/work-order-list/.test(url)){
		$('.nav-content .work-item').find('a').removeClass('color-grey');
		return;
	}
	if(/repair-list-item/.test(url)){
		$('.nav-content .repairing-list').find('a').removeClass('color-grey');
		return;
	}
	if(/system-sign/.test(url)){
		$('.nav-content .system-sign-item').find('a').removeClass('color-grey');
		return;
	}
	
});

// 设置主题内容 header的高度

let calcHeaderWidth = function() {
	let headerWidth = $(window).width() - 300;
	$('.header').css('width',headerWidth);
};

