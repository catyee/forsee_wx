
function BaseModel(socketUrl) {
	var _this = this;
	var socket = null;
	_this.data = {};
	var isFirst = true;

	function onOpen(e) {
		console.log('socket 链接成功');
		if(timer){
			clearInterval(timer);
		}
		var timer = setInterval(function () {
			socket.send('beat..');
		}, 30000);
	}

	function onMessage(e) {
		var message = JSON.parse(e.data);
		var addList = message.addList;
		var delList = message.deleteList;
		var updList = message.updateList;

		//如果有新的数据 执行新增操作

		if (addList.length > 0) {

			if (typeof(_this.onChanged) == 'function') {

				if(isFirst){
					_this.data = {};
					handleAddData(addList);
					_this.onChanged('OPEN', addList);
					isFirst = false;
				}else{
					handleAddData(addList);
					_this.onChanged('ADD', addList);
				}
			}

		}

		//如果有删除的数据 执行删除操作

		if (delList.length > 0) {
			handleDeleteData(delList);
			if (typeof(_this.onChanged) == 'function') {
				_this.onChanged('DEL', delList);
			}
		}

		//如果有修改的数据 执行修改操作

		if (updList.length > 0) {
			handleUpdateData(updList);
			if (typeof(_this.onChanged) == 'function') {
				_this.onChanged('UPD', updList);
			}
		}
	}

	this.closeSocket = function() {
		if(socket){
			socket.close();
		}
	};

	function onError(e) {
		console.error('websocket 发生错误');
	}

	function onClose(e) {
		console.log('websocket 关闭');
		isFirst = true;
		if(socketTimer){
			window.clearTimeout(socketTimer);
		}
		var socketTimer = window.setTimeout(function () {
			createSocket();
		},5000);
	}


	//处理新增的数据

	function handleAddData(list) {
		for (var i in list) {
			_this.data[ list[i].id ] = list[i];

		}
	}

	//处理修改的数据

	function handleUpdateData(list) {
		for (var i in list) {
			_this.data[ list[i].id ] = list[i];
		}
	}

	//处理删除的数据

	function handleDeleteData(list) {
		for (var i in list) {
			delete _this.data[ list[i] ];
		}
	}

	//创建socket

	function createSocket() {
		if(socket != null){
			socket.close();
		}
		socket = new WebSocket(socketUrl);
		socket.onopen = onOpen;
		socket.onmessage = onMessage;
		socket.onclose = onClose;
		socket.onerror = onError;
	}

	if (!socketUrl) {
		console.error('socketUrl 未定义');
		return;
	} else {
		createSocket();
	}

}

BaseModel.prototype.addEventListener = function (e, handle) {
	switch (e) {
	case 'change':
		this.onChanged = handle;
		break;
	}
};

exports.BaseModel = BaseModel;