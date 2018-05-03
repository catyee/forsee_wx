const $ = require('jquery');
import { userInfo } from '../common/service/user.info.service';

$(function(){

	//如果当前页是系统报警也 不执行此操作

	if( new RegExp( 'system-warning.do').test( location.pathname )){
		return;
	}

	var userId = userInfo.userId;
	var roleId = userInfo.roleId;
	var url = 'ws://' + location.host + '/iems/bj_socket/' + userId + '/' + roleId;
	var socket = new WebSocket( url );
	var isFirst = true;
	var timer;
	if( socket ){

		socket.onmessage = onMessage;
		timer = setInterval( function () {

			socket.send('beat');

		}, 3000 );

		socket.onerror = function () {

			clearInterval( timer );

		};
	}


	function onMessage( message ) {

		if( isFirst ){
			isFirst = false;
			return false;
		}

		var data = JSON.parse( message.data );
		var list = data.addList;

		for ( var i in list ){

			if( list.hasOwnProperty(i) ){

				var item = list[i];
				var title = item.prName + '系统报警';
				var content = item.bjDesc + ', 报警值：' + item.value + (item.unit ? item.unit : '' );
				var id = item.id;

				notify( title, content, id );
			}

		}
	}

	function notify( title, content, id ) {
		if(window.Notification && Notification.permission !== 'denied') {
			Notification.requestPermission(function(status) {    // 请求权限
				if(status === 'granted') {

					// 弹出一个通知

					var n = new Notification(title, {
						body : content,
						icon : '//cdn.dianwutong.com/ems/home/img/logo.png'
					});

					n.onclick = function(e){
						window.open( './warning-detail.do?aid='+id);
						n.close();
					};

					// 5秒后关闭通知

					setTimeout(function() {
						n.close();
					}, 5000);
				}
			});
		}
	}

});
import { from } from 'rxjs/observable/from';

