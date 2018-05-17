import { Subject } from 'rxjs/Subject';

require('../../scss/common/ui.scss');

export var UI = {
	init: {},
	initDropDown: {},
};

UI.init = function () {

	this.initDropDown();
};

UI.initDropDown = function () {

	let dropdowns = document.querySelectorAll('.dropdown');

	let length = dropdowns.length;

	for (var i = 0; i < length; i++) {

		let dropdown = dropdowns[i];

		let span = dropdown.querySelector('span');
		span.addEventListener('click', function () {

			let menu = dropdown.querySelector('.dropdown-menu');
			menu.style.display = menu.style.display !== 'block' ? 'block' : 'none';

		});

		span.addEventListener('blur', function () {

			let menu = dropdown.querySelector('.dropdown-menu');
			setTimeout(() => {
				menu.style.display = 'none';
			}, 200);


		});

	}

};


/***
 * select
 * @param id    domId
 * @param data    [optional] e.g. [{"value":xxx, "content":xxx}]
 * @param selected    [optional] selectedId
 */

UI.Selector = function (id, data, selected) {

	this.holder = document.getElementById(id);

	if (!this.holder) {

		console.error('can not find dom : #' + id);
		return null;

	}

	this.data = data;

	//显示选中的内容

	this.displayer = this.holder.querySelector('input');
	this.displayer.placeholderValue = this.displayer.getAttribute('placeholder');

	//清空按钮

	this.clearBtn = this.holder.querySelector('.clear');

	//下来列表

	this.selector = this.holder.querySelector('ul');

	//下来列表选选项

	this.options = [];

	//选中的value

	this.selected = selected;

	//数据改变的监听器

	this.changeListener;

	//当前选择器是否被选中

	this.isFocus = false;

	this.bindListener();


	//如果没有数据 则从dom中取

	if (!this.data) {

		this.data = [];

		let list = this.selector.querySelectorAll('li');

		for (let i in list) {

			if (list.hasOwnProperty(i)) {

				let value = list[i].getAttribute('value');
				let content = list[i].innerText;
				let className = list[i].className;
				let isSelected = className.indexOf('selected') != -1;

				this.data.push({
					'value': value,
					'content': content,
					'className': className
				});
				if (this.selected === undefined && isSelected) {
					this.selected = value;

				}
			}

		}
	}

	this.update(this.data, this.selected);

};

//更新数据

UI.Selector.prototype.update = function (data, selected) {

	let _this = this;

	//清空数据

	_this.displayer.value = '';
	_this.selector.innerHTML = '';
	_this.options = [];
	_this.selected = undefined;


	//渲染选项列表

	for (let i in data) {

		if (data.hasOwnProperty(i)) {

			let option = document.createElement('li');
			option.setAttribute('value', data[i].value);
			option.innerText = data[i].content;

			if (selected == data[i].value) {

				option.className = 'selected';
				_this.selected = selected;
				// safari下必须清空

				_this.displayer.setAttribute('placeholder', '');
				_this.displayer.value = data[i].content;

			}

			if (data[i].className) {

				option.className = data[i].className;

			}

			//处理点击选项事件

			option.addEventListener('click', function (e) {
				e = e || window.event;
				_this.unSelectAll();
				this.className += ' selected';
				_this.selected = this.getAttribute('value');
				_this.displayer.value = this.innerText;
				_this.holder.blur();

				_this.handleChange({

					value: _this.selected,
					content: this.innerText

				});

				e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;

			});

			this.options.push(option);
			this.selector.appendChild(option);

		}

	}

};

//绑定事件监听器

UI.Selector.prototype.bindListener = function () {

	//绑定focus事件

	this.holder.addEventListener('click', (e) => {
		this.isFocus = true;

	}, false);

	//绑定blurs事件

	this.holder.addEventListener('blur', () => {

		this.isFocus = false;
		console.log('blur');

	});

	//绑定点击取消按钮

	this.clearBtn && this.clearBtn.addEventListener('click', (e) => {

		if (this.isFocus && this.selected) {
			this.displayer.value = '';

			//重新赋值placeholder
			this.displayer.setAttribute('placeholder', this.displayer.placeholderValue);
			this.selected = null;
			this.unSelectAll();
			this.handleChange(null);

			this.isFocus = false;
			this.holder.blur();
		} else {

			this.isFocus = true;

		}

	}, true);

};

//取消选中

UI.Selector.prototype.unSelectAll = function () {

	let options = this.options;
	for (let i in options) {

		if (options.hasOwnProperty(i)) {

			options[i].className = options[i].className.replace(/[ ]?selected/g, '');

		}

	}

};

//指定一个选项

UI.Selector.prototype.set = function (value) {

	this.selected = value;

	let options = this.options;

	for (let i in options) {

		if (options.hasOwnProperty(i)) {

			let _value = options[i].getAttribute('value');
			let className = options[i].className;
			let content = options[i].innerText;

			if (_value == value) {

				if (className.indexOf('selected') == -1) {

					options[i].className += ' selected';

				}

				this.displayer.value = content;

			} else {

				options[i].className = options[i].className.replace(/[ ]?selected/g, '');

			}

		}

	}

};

//处理数据变化

UI.Selector.prototype.handleChange = function (data) {

	if (typeof this.changeListener === 'function') {

		this.changeListener(data);

	}

};


//绑定改变事件的处理函数

UI.Selector.prototype.change = function (callback) {

	if (typeof callback === 'function') {

		this.changeListener = callback;

	}

};


/***
 * 按钮组
 * @param id    按钮组容器id
 * @param data    数据 形如：[{'value' : xxx, 'content' : xxx}]
 * @param selected    默认选中的值 data中的一个value
 * @constructor
 */

UI.ButtonGroup = function (id, data, selected) {

	this.holder = document.getElementById(id);

	if (!this.holder) {

		console.error('can not find dom: #' + id);
		return null;

	}

	//保存按钮DOM对象

	this.btns = [];

	//数据

	this.data = data ? data : [];

	//默认选中

	this.selected = selected;

	//数据变化的监听器

	this.changeListener;

	if (this.data.length == 0) {

		let btns = this.holder.querySelectorAll('button');

		for (let i in btns) {

			if (btns.hasOwnProperty(i)) {

				let className = btns[i].className;

				this.data.push({

					value: btns[i].getAttribute('value'),
					content: btns[i].innerText,
					className: className

				});

				if (/active/.test(className) && !this.selected) {

					this.selected = btns[i].value;

				}

			}

		}

	}

	this.update(this.data, this.selected);


};

//更新内容

UI.ButtonGroup.prototype.update = function (data, selected) {

	this.holder.innerHTML = '';

	this.btns = [];

	for (let i in data) {

		if (data.hasOwnProperty(i)) {

			let btn = document.createElement('button');

			if (data[i].className) {

				btn.className = data[i].className;

			} else if (data[i].value == selected) {

				btn.className = 'ui-btn active';

			} else {

				btn.className = 'ui-btn';

			}

			btn.setAttribute('value', data[i].value);
			btn.innerText = data[i].content;

			var _this = this;

			btn.addEventListener('click', function () {

				let btns = _this.btns;

				for (let i in btns) {

					if (btns.hasOwnProperty(i)) {

						btns[i].className = btns[i].className.replace(/[ ]?active/g, '');

					}

				}

				this.className += ' active';

				_this.selected = this.getAttribute('value');

				_this.handleChange();

			});

			this.btns.push(btn);
			this.holder.appendChild(btn);

		}

	}

};

//指定一个选项

UI.ButtonGroup.prototype.set = function (value) {

	this.selected = value;

	let btns = this.btns;

	for (let i in btns) {

		if (btns.hasOwnProperty(i)) {

			let className = btns[i].className;
			let _value = btns[i].getAttribute('value');

			if (_value == value) {

				if (className.indexOf('active') == -1) {

					btns[i].className += ' active';

				}

			} else {

				btns[i].className = btns[i].className.replace(/[ ]?active/g, '');

			}

		}

	}

};

//处理更新

UI.ButtonGroup.prototype.handleChange = function () {

	if (typeof this.changeListener === 'function') {

		this.changeListener(this.selected);

	}

};

//绑定监听器

UI.ButtonGroup.prototype.change = function (callback) {

	if (typeof callback === 'function') {

		this.changeListener = callback;

	}

};

/****
 * progress 单例模式
 * 实力保存在UI.Progress.instance下
 * @param options
 * @constructor
 */

UI.Progress = function (options) {

	if (!options) {

		options = {};

	}

	//记录显示状态
	//false 时将停止动画

	this.move = false;

	//默认提示文本

	this.text = options.text ? options.text : '加载中，请稍等';

	//整个遮罩层

	this.progress = document.createElement('div');

	//居中的黑色小框

	let content = document.createElement('div');

	//进图条图片

	let image = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

	//进度条的圆

	this.circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

	//显示文本的容器

	this.tip = document.createElement('div');

	this.progress.className = 'ui-progress';
	content.className = 'content';
	this.tip.className = 'tip';

	this.circle.setAttribute('r', '25');
	this.circle.setAttribute('cx', '40');
	this.circle.setAttribute('cy', '40');
	this.circle.setAttribute('stroke', '#e9b22b');
	this.circle.setAttribute('stroke-width', '6');
	this.circle.setAttribute('fill', 'none');

	//灰色的轨迹

	image.innerHTML = '<circle r="25" cx="40" cy="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="6">';

	image.appendChild(this.circle);
	image.setAttribute('width', '80');
	image.setAttribute('height', '80');
	image.setAttribute('version', '1.1');
	image.setAttribute('fill', 'none');

	//计算内同区域与顶部的距离

	let winHeight = window.innerHeight;
	let top = 200;
	if (winHeight) {
		top = winHeight / 2 - 100;
	}

	content.style.marginTop = top + 'px';
	content.appendChild(image);

	this.tip.innerHTML = this.text;
	content.appendChild(this.tip);

	this.progress.appendChild(content);

	document.body.appendChild(this.progress);

};

UI.Progress.prototype.update = function (options) {

	this.text = options.text ? options.text : '加载中，请稍等';
	this.tip.innerHTML = this.text;

};

UI.Progress.prototype.show = function () {


	this.progress.style.display = 'block';
	this.move = true;

	let cnt = 0;

	let _this = this;

	_this.circle.setAttribute('stroke-dasharray', '110,220');

	window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

	function step() {
		cnt += 10;

		if (cnt < 785) {

			_this.circle.setAttribute('stroke-dasharray', (cnt * 2 / 10) + ',157');
			_this.circle.setAttribute('transform', 'rotate(-90,40,40)');
		} else {

			_this.circle.setAttribute('stroke-dasharray', ((1570 - cnt) * 2 / 10) + ',157');

			let degree = -90 + (360 / 785) * (cnt - 785);
			_this.circle.setAttribute('transform', 'rotate(' + degree + ',40,40)');

		}


		cnt %= 1570;


		if (_this.move) {

			requestAnimationFrame(step);

		}
	}

	requestAnimationFrame(step);

};

UI.Progress.prototype.hide = function () {

	this.progress.style.display = 'none';
	this.move = false;

};

UI.showProgress = function (options) {

	if (!options) {

		options = {};

	}

	if (!this.Progress.instance) {

		this.Progress.instance = new this.Progress(options);

	} else {

		this.Progress.instance.update(options);

	}

	this.Progress.instance.show();

};

UI.hideProgress = function () {

	if (this.Progress.instance) {

		this.Progress.instance.hide();

	}

};

/****
 * pagination 分页
 * @param id 承载分页的
 * @param totalPage 总页数
 * @param currentPage 当前页面
 * @constructor
 */

UI.Pagination = function (id, totalPage, currentPage) {
	if (!totalPage && !currentPage) {
		totalPage = 0;
		currentPage = 0;
	}
	this.holder = document.getElementById(id);
	this.holder.className += ' pagination';
	if (!this.holder) {
		console.error('can not find dom:#' + id);
		return null;
	}
	this.totalPage = parseInt(totalPage);
	this.currentPage = parseInt(currentPage);

	//数据变化的监听器

	this.messager = new Subject();
	this.update(this.totalPage, this.currentPage);

};

//更新内容

UI.Pagination.prototype.update = function (totalPage, currentPage) {
	if (totalPage == '0') {
		this.holder.style.display = 'none';
	} else {

		this.holder.style.display = 'inline-block';
	}
	this.holder.innerHTML = '';
	let start = (currentPage - 2) > 1 ? (currentPage - 2) : 2;
	let end = (currentPage + 3) > totalPage ? totalPage : (currentPage + 3);
	let prePage = (currentPage - 1) > 1 ? (currentPage - 1) : 1;
	let nextPage = (currentPage + 1) > totalPage ? totalPage : (currentPage + 1);
	let dom = '';

	if (currentPage == 1) {
		dom += '<li class="disabled" page="' + prePage + '">&laquo;</li>';
		dom += '<li class="active" page="1">1</li>';

	} else {
		dom += '<li page="' + prePage + '">&laquo;</li>';
		dom += '<li page="1">1</li>';
	}
	if (currentPage > 4) {
		dom += '<li class="disabled">...</li>';
	}
	for (var i = start; i < end; i++) {
		if (i == currentPage) {
			dom += '<li class="active" page="' + i + '">' + i + '</li>';
		} else {
			dom += '<li  page="' + i + '">' + i + '</li>';
		}
	}
	if ((currentPage + 3) < totalPage) {
		dom += '<li class="disabled">...</li>';
	}
	if (currentPage == totalPage && totalPage != 1) {
		dom += '<li class="active" page="' + totalPage + '">' + totalPage + '</li>';
		dom += '<li class="disabled" page="' + nextPage + '">&raquo;</li>';
	} else if (totalPage != 1) {
		dom += '<li  page="' + totalPage + '">' + totalPage + '</li>';
		dom += '<li  page="' + nextPage + '">&raquo;</li>';
	} else {
		dom += '<li class="disabled"  page="' + nextPage + '">&raquo;</li>';
	}
	this.holder.innerHTML = dom;

	var pages = this.holder.getElementsByTagName('li');
	var _this = this;
	for (var i = 0; i < pages.length; i++) {
		pages[i].addEventListener('click', function () {
			_this.currentPage = parseInt(this.getAttribute('page'));
			_this.handleChange();
		});
	}
};

//处理更新

UI.Pagination.prototype.handleChange = function () {

	this.messager.next(this.currentPage);

};


/****
 * 复选选择器
 * @param options
 *    id : 容器的id
 *    data : 选项的内容 [ { value : xxx, content : xxx },{ }]，如果data.length 为空，使用页面上的数据
 *    checked : 被选项的value数组
 *    defaultChecked ：默认选中的项数，如果checked.length == 0 生效
 * @constructor
 */

UI.CheckBox = function (options) {

	if (!options) {

		console.error('undefined config for CheckBox');
		return null;
	}

	this.holder = document.getElementById(options.id);

	if (!this.holder) {

		console.error('can not find dom : #' + options.id);
		return null;

	}

	//呼出按钮

	this.button = this.holder.querySelector('.ui-call');
	this.buttonText = this.button.innerText;

	//选项表格

	this.table = this.holder.querySelector('table');

	//清除按钮

	this.clearBtn = this.holder.querySelector('.ui-clear');

	//清除按钮

	this.allBtn = this.holder.querySelector('.ui-all');

	//确认按钮

	this.confirmBtn = this.holder.querySelector('.ui-ok');

	//选项数据 [{ value :xxx, content : xxx }]

	this.data = options.data ? options.data : [];

	//选中的数据 value数组

	this.checked = options.checked ? options.checked : options.checked;

	//默认选中前n项

	this.defaultChecked = options.defaultChecked ? options.defaultChecked : 0;

	//显示的列数

	this.colums = options.colums ? options.colums : 3;

	//保存所有选项

	this.items = [];

	//如果没有传入数据
	//从页面上拿到数据

	if (this.data.length == 0) {

		//计算页面上的列数

		let row = this.holder.querySelector('tr');
		let colums;

		if (row) {

			colums = row.querySelectorAll('td');
			colums = colums.length;

		}

		this.colums = colums ? colums : this.colums;

		//拿到页面上的选项

		let items = this.table.querySelectorAll('td');

		//清空选中的列表

		this.checked = [];

		for (let i in items) {

			if (items.hasOwnProperty(i)) {

				let className = items[i].className;
				let value = items[i].getAttribute('value');

				this.data.push({

					value: value,
					content: items[i].innerText,
					className: className

				});

				if (/checked/.test(className)) {

					this.checked.push(value);

				}

			}
		}

	}

	this.update({
		data: this.data,
		checked: this.checked,
		defaultChecked: this.defaultChecked
	});

	this.defaultChecked = 0;

	this.bindListener();
};

//更新选项面板的内容

UI.CheckBox.prototype.update = function (options) {

	let data = this.data = options.data;
	let checked = this.checked = options.checked ? options.checked : [];
	let defaultChecked = options.defaultChecked;
	let cols = this.colums;
	let _this = this;

	//范围选择的记录标识

	let from = null;

	//清空页面内容

	this.table.innerHTML = '';

	//清空所有选项对象

	this.items = [];

	//计算行数

	let rows = Math.ceil(data.length / cols);

	//渲染

	for (let i = 0; i < rows; i++) {

		let row = document.createElement('tr');

		for (let j = 0; j < cols; j++) {

			let index = i * cols + j;
			let item = data[index];
			let td = document.createElement('td');

			td.setAttribute('value', item.value);
			td.innerText = item.content;
			td.addEventListener('click', function (e) {

				let className = this.className;


				if (/checked/.test(className)) {

					this.className = this.className.replace(/[ ]?checked/g, '');

				} else {

					this.className = ' checked';

				}

				//如果同时按下shift键

				if (e.shiftKey && /checked/.test(this.className)) {

					//如果范围选择有起点 执行范围选择

					if (from == 0 || from) {

						let items = _this.items;
						let to = items.indexOf(this);

						if (from > to) {
							from = from - to;
							to = to + from;
							from = to - from;
						}

						for (let i = from; i <= to; i++) {

							let className = items[i].className;

							if (!/checked/.test(className)) {

								items[i].className = ' checked';

							}

						}

						from = null;

					} else {

						//记录一个起点

						from = _this.items.indexOf(this);

					}

				}

				e.stopPropagation();
				e.preventDefault();
				return false;

			});

			if (item.className) {

				td.className = item.className;
				item.className = null;
			}

			if (checked.indexOf(item.value) !== -1) {

				if (!/checked/.test(td.className)) {
					td.className += ' checked';
				}
			}

			this.items.push(td);
			row.appendChild(td);

			if (index + 1 == data.length) {

				break;

			}

		}

		this.table.appendChild(row);

	}

	//如果没有指定选中的value

	let itemsLength = this.items.length;
	if (this.checked.length == 0 && defaultChecked > 0 && itemsLength > 0) {


		for (let i = 0; i < defaultChecked && i < itemsLength; i++) {

			this.items[i].className += ' checked';
			this.checked.push(this.items[i].getAttribute('value'));

		}

	}

	this.handleChange();

};

//为控件绑定事件监听器

UI.CheckBox.prototype.bindListener = function () {

	let _this = this;

	//呼出

	this.button.addEventListener('click', function () {

		if (_this.data.length == 0) {

			return;
		}

		_this.update({
			data: _this.data,
			checked: _this.checked
		});
		_this.holder.focus();

	});

	//清除

	this.clearBtn && this.clearBtn.addEventListener('click', function () {
		let items = _this.items;

		for (let i in items) {

			let className = items[i].className;

			if (/checked/.test(className)) {

				items[i].className = items[i].className.replace(/[ ]?checked/g, '');

			}
		}

	});

	//全选

	this.allBtn && this.allBtn.addEventListener('click', function () {
		let checked = [];

		let items = _this.items;

		for (let i in items) {

			if (items.hasOwnProperty(i)) {

				let className = items[i].className;

				if (!/checked/.test(className)) {

					items[i].className = ' checked';

				}

			}
		}

	});

	//确认

	this.confirmBtn && this.confirmBtn.addEventListener('click', function () {

		let checked = [];

		let items = _this.items;

		for (let i in items) {

			if (items.hasOwnProperty(i)) {

				if (/checked/.test(items[i].className)) {

					checked.push(items[i].getAttribute('value'));

				}

			}
		}

		_this.checked = checked;

		_this.holder.blur();
		_this.handleChange();

	});

};

//处理数据变化

UI.CheckBox.prototype.handleChange = function () {

	let total = this.items.length;
	let checkedCount = this.checked.length;

	let text = this.buttonText + `(${checkedCount}/${total})`;
	this.button.innerText = text;

	if (typeof this.changeListener === 'function') {

		this.changeListener(this.checked);

	}

};

//绑定数据变化的监听器(暴露)

UI.CheckBox.prototype.change = function (listener) {

	if (typeof listener === 'function') {

		this.changeListener = listener;

	}

};

UI.FlexTable = function (options) {

	if (!options) {

		console.error('undefined config for CheckBox');
		return null;
	}

	this.holder = document.getElementById(options.id);

	if (!this.holder) {

		console.error('can not find dom : #' + options.id);
		return null;

	}

	//计算容器的size

	this.holder.size = {

		width: this.holder.clientWidth - 1,
		height: this.holder.clientHeight - 1

	};

	//表的项目名

	this.title = document.createElement('div');
	this.title.className = 'title';

	//表头

	this.header = document.createElement('table');
	this.header.className = 'header';

	//第一列

	this.firstColumns = document.createElement('table');
	this.firstColumns.className = 'first-columns';

	//body

	this.body = document.createElement('table');
	this.body.className = 'body';
	this.body.setAttribute('tabindex', '-1');

	//vSlider

	this.vSlider = document.createElement('div');
	this.vSlider.className = 'v-slider';

	//hSlider

	this.hSlider = document.createElement('div');
	this.hSlider.className = 'h-slider';

	this.holder.appendChild(this.title);
	this.holder.appendChild(this.header);
	this.holder.appendChild(this.firstColumns);
	this.holder.appendChild(this.body);
	this.holder.appendChild(this.vSlider);
	this.holder.appendChild(this.hSlider);

	this.update(options);
	this.bindListener();

};

UI.FlexTable.prototype.update = function (options) {

	let title = options.title ? options.title : [''];
	let firstColumns = options.firstColumns ? options.firstColumns : [];
	let header = options.header ? options.header : [];
	let data = options.data ? options.data : [];


	//渲染项目名

	this.title.innerHTML = '';

	if (title.length > 1) {

		let t1 = document.createElement('div');
		let t2 = document.createElement('div');

		t1.innerHTML = title[0];
		t2.innerHTML = title[1];

		this.title.appendChild(t1);
		this.title.appendChild(t2);

		this.title.doubleTitle = true;

	} else {

		this.title.innerHTML = title[0];
		this.title.doubleTitle = false;

	}

	//渲染第一列

	this.firstColumns.innerHTML = '';

	for (let i in firstColumns) {

		if (firstColumns.hasOwnProperty(i)) {

			let tr = document.createElement('tr');
			let td = document.createElement('td');

			td.innerText = firstColumns[i];
			tr.appendChild(td);

			this.firstColumns.appendChild(tr);

		}
	}

	//渲染表头

	this.header.innerHTML = '';
	this.header.firstRow = [];
	this.header.secondRow = [];

	//清空宽度 否则使用上一次的宽度

	this.header.style.width = 'auto';

	let firstRow = document.createElement('tr');
	let secondRow = document.createElement('tr');

	for (let i in header) {

		if (header.hasOwnProperty(i)) {

			let children = header[i].children ? header[i].children : [];

			let td = document.createElement('td');

			td.setAttribute('colspan', children.length.toString());
			td.innerText = header[i].content;

			firstRow.appendChild(td);
			this.header.firstRow.push(td);

			for (let j in children) {

				if (children.hasOwnProperty(j)) {

					let td = document.createElement('td');

					td.innerText = children[j];

					secondRow.appendChild(td);

					this.header.secondRow.push(td);

				}

			}

		}

	}

	this.header.appendChild(firstRow);

	if (this.header.secondRow.length > 0) {

		this.header.appendChild(secondRow);

	}

	//渲染主体内容

	this.body.innerHTML = '';

	//清空宽度 否则使用上一次的宽度

	this.body.style.width = 'auto';

	//用第一行的宽度来和表头同步宽度

	this.body.firstRow = [];

	for (let i in data) {

		if (data.hasOwnProperty(i)) {

			let tr = document.createElement('tr');

			for (let j in data[i]) {


				if (data[i].hasOwnProperty(j)) {

					let td = document.createElement('td');
					td.innerText = data[i][j];

					tr.appendChild(td);

					if (i == 0) {

						this.body.firstRow.push(td);

					}

				}

			}

			this.body.appendChild(tr);

		}

	}

	this.updateLayout();

};

UI.FlexTable.prototype.updateLayout = function () {

	//计算容器的size

	this.holder.size = {

		width: this.holder.clientWidth - 1,
		height: this.holder.clientHeight - 1

	};

	let headerHeight = this.header.clientHeight;
	let firstColWidth = this.firstColumns.clientWidth;
	let holderWidth = this.holder.size.width;
	let holderHeight = this.holder.size.height;

	this.title.style.width = firstColWidth + 'px';
	this.title.style.height = headerHeight + 'px';

	//如果title有两项 则画一条对角线

	if (this.title.doubleTitle == true) {

		let line = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

		line.setAttribute('width', firstColWidth);
		line.setAttribute('height', headerHeight);

		let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', 'M0,0 L' + firstColWidth + ',' + headerHeight);
		path.setAttribute('stroke-width', '1');
		path.setAttribute('stroke', '#e0e0e0');

		line.appendChild(path);
		this.title.appendChild(line);

		//设置内部div的高度

		let divs = this.title.querySelectorAll('div');
		for (let i in divs) {
			if (divs.hasOwnProperty(i)) {

				divs[i].style.height = headerHeight / 2 + 'px';
				divs[i].style.lineHeight = headerHeight / 2 + 'px';

			}

		}

		this.title.style.height = headerHeight + 'px';

	} else {

		this.title.style.height = headerHeight + 'px';
		this.title.style.lineHeight = headerHeight + 'px';

	}

	this.header.style.top = '0px';
	this.header.style.left = firstColWidth + 'px';

	this.firstColumns.style.top = headerHeight + 'px';
	this.firstColumns.left = '0px';

	this.body.style.top = headerHeight + 'px';
	this.body.style.left = firstColWidth + 'px';

	//同步表头和内容的宽度

	let headerRow = this.header.secondRow.length ? this.header.secondRow : this.header.firstRow;
	let bodyRow = this.body.firstRow;
	let length = headerRow.length > bodyRow.length ? bodyRow.length : headerRow.length;
	let widthSum = 0;

	for (let i = 0; i < length; i++) {

		let maxWidth = headerRow[i].offsetWidth > bodyRow[i].offsetWidth ? headerRow[i].offsetWidth : bodyRow[i].offsetWidth;

		headerRow[i].style.width = maxWidth + 'px';
		bodyRow[i].style.width = maxWidth + 'px';

		widthSum += maxWidth;

	}

	this.header.style.width = widthSum + 'px';
	this.body.style.width = widthSum + 'px';

	// 计算垂直滑块的高度 (滑块高/显示区域的高 = 显示区域的高/body的高度)

	let viewerHeight = (holderHeight - headerHeight);
	let bodyHeight = this.body.clientHeight;
	let vSliderHeight = Math.pow(viewerHeight, 2) / bodyHeight;

	// 计算水平滑块的宽度 (滑块宽/显示区域的宽 = 显示区域的宽/body的宽度)

	let viewerWidth = (holderWidth - firstColWidth);
	let bodyWidth = this.body.clientWidth;
	let hSliderWidth = Math.pow(viewerWidth, 2) / bodyWidth;


	//计算垂直滑块和内容的移动比例

	this.vSlider.times = bodyHeight / viewerHeight;

	//计算水平滑块和内容的移动比例

	this.hSlider.times = bodyWidth / viewerWidth;

	//如果垂直滑块的高度和可现实区域的高度一样 不显示

	if (vSliderHeight > viewerHeight) {

		this.vSlider.style.height = '0px';

	} else {

		this.vSlider.style.height = vSliderHeight + 'px';

		this.vSlider.style.top = headerHeight + 'px';

		//如果body内容没有超过holder的右边

		if ((widthSum + firstColWidth) < holderWidth) {

			this.vSlider.style.right = (holderWidth - (widthSum + firstColWidth)) + 'px';

		} else {

			this.vSlider.style.right = '0px';

		}

	}


	//如果水平滑块的宽度和可现实区域的宽度度一样 不显示

	if (hSliderWidth > viewerWidth) {

		this.hSlider.style.width = '0px';

	} else {

		this.hSlider.style.width = hSliderWidth + 'px';

		this.hSlider.style.left = firstColWidth + 'px';

		//如果body内容没有超过holder的底边

		if ((bodyHeight + headerHeight) < holderHeight) {

			this.hSlider.style.bottom = (holderHeight - (bodyHeight + headerHeight)) + 'px';

		} else {

			this.hSlider.style.bottom = '0px';

		}

	}


};

UI.FlexTable.prototype.bindListener = function () {

	let _this = this;
	let mouseDown = false;
	let lastPoint;

	this.body.addEventListener('mousedown', (e) => {

		mouseDown = true;

		lastPoint = {
			x: e.clientX,
			y: e.clientY
		};

	});

	this.body.addEventListener('mouseup', () => {

		mouseDown = false;

	});

	this.body.addEventListener('mouseleave', () => {

		mouseDown = false;

	});

	this.body.addEventListener('mousemove', (e) => {

		if (!mouseDown) {
			return;
		}

		let dx = e.clientX - lastPoint.x;
		let dy = e.clientY - lastPoint.y;

		_this.move(dx, dy);

		lastPoint = {

			x: e.clientX,
			y: e.clientY

		};

	});

	this.body.addEventListener('mousewheel', (e) => {

		let dx = 0;
		let dy = e.wheelDeltaY > 0 ? 30 : -30;

		_this.move(dx, dy);

	});

	let resizeTimer = null;
	window.addEventListener('resize', () => {

		if (resizeTimer) {

			clearTimeout(resizeTimer);

		}

		resizeTimer = setTimeout(() => {

			_this.updateLayout();
			console.log('resize');

		}, 300);

	});

	//竖直滚动条

	let vSliderMouseDown = false;

	this.vSlider.addEventListener('mousedown', (e) => {

		vSliderMouseDown = true;

		lastPoint = {
			x: e.clientX,
			y: e.clientY
		};

	});


	//水平滚动条

	let hSliderMouseDown = false;

	this.hSlider.addEventListener('mousedown', (e) => {

		hSliderMouseDown = true;

		lastPoint = {
			x: e.clientX,
			y: e.clientY
		};

	});

	document.body.addEventListener('mousemove', (e) => {

		if (vSliderMouseDown) {

			let dx = 0;
			//反方向

			let dy = (lastPoint.y - e.clientY) * this.vSlider.times;

			_this.move(dx, dy);

			lastPoint = {

				x: e.clientX,
				y: e.clientY

			};
		}



		if (hSliderMouseDown) {

			let dy = 0;

			//反方向
			let dx = (lastPoint.x - e.clientX) * this.hSlider.times;

			_this.move(dx, dy);

			lastPoint = {

				x: e.clientX,
				y: e.clientY

			};

		}

	});


	document.body.addEventListener('mouseup', (e) => {

		vSliderMouseDown = false;
		hSliderMouseDown = false;

	});

};

UI.FlexTable.prototype.move = function (dx, dy) {

	let holderSize = this.holder.size;
	let headerHeight = this.header.clientHeight;
	let firstColWidth = this.firstColumns.clientWidth;
	let bodyWidth = this.body.clientWidth;
	let bodyHeight = this.body.clientHeight;

	let bodyLeft = parseInt(this.body.style.left);
	let bodyTop = parseInt(this.body.style.top);
	let vSliderTop = parseInt(this.vSlider.style.top);

	if (bodyWidth + bodyLeft >= holderSize.width) {

		let tmpLeft = bodyLeft + dx;

		if (dx > 0) {

			if (bodyLeft + dx > firstColWidth) {

				this.body.style.left = firstColWidth + 'px';
				this.header.style.left = firstColWidth + 'px';
				this.hSlider.style.left = firstColWidth + 'px';


			} else {

				this.body.style.left = (bodyLeft + dx) + 'px';
				this.header.style.left = (bodyLeft + dx) + 'px';
				this.hSlider.style.left = firstColWidth + (-(tmpLeft - firstColWidth) / this.hSlider.times) + 'px';

			}

		} else if (dx < 0) {


			if (bodyWidth + tmpLeft < holderSize.width) {

				this.body.style.left = (holderSize.width - bodyWidth) + 'px';
				this.header.style.left = (holderSize.width - bodyWidth) + 'px';
				this.holder.style.left = 'auto';
				this.holder.style.right = '0px';


			} else {

				this.body.style.left = tmpLeft + 'px';
				this.header.style.left = tmpLeft + 'px';
				this.hSlider.style.left = firstColWidth + (-(tmpLeft - firstColWidth) / this.hSlider.times) + 'px';

			}

		}

	}

	//只有当内容高度超出显示区域才响应移动事件

	if (bodyHeight + bodyTop >= holderSize.height) {

		let tmpTop = bodyTop + dy;

		if (dy > 0) {

			if (tmpTop > headerHeight) {

				this.body.style.top = headerHeight + 'px';
				this.firstColumns.style.top = headerHeight + 'px';
				this.vSlider.style.top = headerHeight + 'px';

			} else {

				this.body.style.top = tmpTop + 'px';
				this.firstColumns.style.top = tmpTop + 'px';
				this.vSlider.style.top = headerHeight + (-(tmpTop - headerHeight) / this.vSlider.times) + 'px';

			}

		} else if (dy < 0) {

			if (bodyHeight + tmpTop < holderSize.height) {

				this.body.style.top = (holderSize.height - bodyHeight) + 'px';
				this.firstColumns.style.top = (holderSize.height - bodyHeight) + 'px';
				this.holder.style.top = 'auto';
				this.holder.style.bottom = '0px';

			} else {

				this.body.style.top = tmpTop + 'px';
				this.firstColumns.style.top = tmpTop + 'px';
				this.vSlider.style.top = headerHeight + (-(tmpTop - headerHeight) / this.vSlider.times) + 'px';

			}

		}

	}

};

/***
 * alert
 * @param options
 * @constructor
 */

UI.Alert = function (options) {

	//点击按钮的监听器

	this.listener = null;

	this.alert = document.createElement('div');
	this.alert.className = 'ui-alert';

	this.content = document.createElement('div');
	this.content.className = 'alert-content';

	this.alert.appendChild(this.content);

	this.body = document.createElement('div');
	this.body.className = 'alert-body';

	this.content.appendChild(this.body);

	this.foot = document.createElement('div');
	this.foot.className = 'alert-foot';

	this.content.appendChild(this.foot);

	this.button = document.createElement('button');
	this.button.className = 'alert-button';

	this.foot.appendChild(this.button);

	document.body.appendChild(this.alert);

	//计算内同区域与顶部的距离

	let winHeight = window.innerHeight;
	let top = 200;
	if (winHeight) {
		top = winHeight / 2 - 100;
	}

	this.content.style.marginTop = top + 'px';


	//绑定事件

	this.button.addEventListener('click', () => {

		if (typeof this.listener === 'function') {

			this.listener();

		}

		this.hide();

	});

	this.update(options);

};

//更新alert的内容

UI.Alert.prototype.update = function (options) {

	if (!options.content) {

		console.error('undefined content for alert');

		return false;

	}

	this.body.innerHTML = options.content;
	this.button.innerText = (options.btn ? options.btn : '知道了');
	this.listener = options.callback;

};

//显示alert

UI.Alert.prototype.show = function () {

	this.alert.style.display = 'block';

};

//关闭alert

UI.Alert.prototype.hide = function () {

	this.alert.style.display = 'none';

};


//单例模式 不需要显示创建 直接调用

UI.alert = function (options) {

	if (!options) {

		options = {};

	}

	if (!this.Alert.instance) {

		this.Alert.instance = new this.Alert(options);

	} else {

		this.Alert.instance.update(options);

	}

	this.Alert.instance.show();

};


/**
 * confirm 确认框
 *
 * tip 弹出框提示部分
 *
 * foot [btnl,btnr] 弹出框下面提示按钮
 *
 *
 * callback
 *
 *
 */

UI.Confirm = function (options) {


	//处理左边按钮的监听器

	this.leftBtnlListener == null;
	//处理右边按钮的监听器

	this.rightBtnListener == null;


	this.confirm = document.createElement('div');
	this.confirm.className = 'ui-confirm';

	this.content = document.createElement('div');
	//content

	this.content.className = 'confirm-content';
	this.confirm.appendChild(this.content);

	//body

	this.body = document.createElement('div');
	this.body.className = 'confirm-body';
	this.content.appendChild(this.body);


	//foot

	this.foot = document.createElement('div');
	this.foot.className = 'confirm-foot';
	this.content.appendChild(this.foot);

	//btnLeft
	this.buttonLeft = document.createElement('button');
	this.buttonLeft.className = 'confirm-button-left';
	this.foot.appendChild(this.buttonLeft);

	//btnRight

	this.buttonRight = document.createElement('button');
	this.buttonRight.className = 'confirm-button-right';
	this.foot.appendChild(this.buttonRight);
	document.body.appendChild(this.confirm);

	this.buttonLeft.addEventListener('click', () => {
		if (typeof this.leftBtnlListener == 'function') {
			this.leftBtnlListener();
		}
		this.hide();
	});
	this.buttonRight.addEventListener('click', () => {
		if (typeof this.rightBtnlListener == 'function') {
			this.rightBtnlListener();
		}
		this.hide();
	});

	//计算内同区域 与 顶部的距离
	let winHeight = window.innerHeight;
	let top = 200;
	if (winHeight) {
		top = winHeight / 2 - 100;
	}

	this.content.style.marginTop = top + 'px';
	this.update(options);

};
UI.Confirm.prototype.update = function (options) {

	if (!options.tip) {
		console.error('undefined content for confirm');
		return;
	}
	if (!options.btn) {
		options.btn = [];
	}
	this.body.innerHTML = options.tip;
	this.buttonLeft.innerText = (options.btn.length ? options.btn[0] : '取消');
	this.buttonRight.innerText = (options.btn.length == 2 ? options.btn[1] : '确定');
	this.leftBtnlListener = options.leftBtnClick;
	this.rightBtnlListener = options.rightBtnClick;


};

UI.Confirm.prototype.show = function () {

	this.confirm.style.display = 'block';

};

//隐藏confirm
UI.Confirm.prototype.hide = function () {

	this.confirm.style.display = 'none';

};

//单例模式 不需要创建 直接调用

UI.confirm = function (options) {
	if (!options) {
		options = {};
	}
	if (!this.Confirm.instance) {
		this.Confirm.instance = new this.Confirm(options);
	} else {
		this.Confirm.instance.update(options);
	}
	this.Confirm.instance.show();
};


/**
 * prompt
 *
 * tip 弹出框提示部分
 *
 * foot [btnl,btnr] 弹出框下面提示按钮
 *
 *
 * callback
 *
 *
 */

UI.Prompt = function (options) {

	//处理左边按钮的监听器

	this.leftBtnlListener == null;
	//处理右边按钮的监听器

	this.rightBtnListener == null;


	this.holder = document.createElement('div');
	this.holder.className = 'ui-prompt';

	this.content = document.createElement('div');
	//content

	this.content.className = 'prompt-content';
	this.holder.appendChild(this.content);

	//body

	this.body = document.createElement('div');
	this.body.className = 'prompt-body';
	this.content.appendChild(this.body);

	// 提示
	this.tips = document.createElement('div');
	this.tips.className = 'prompt-tips';
	this.body.appendChild(this.tips);

	// textarea
	this.textarea = document.createElement('textarea');
	this.textarea.className = 'prompt-textarea';
	this.body.appendChild(this.textarea);

	//foot

	this.foot = document.createElement('div');
	this.foot.className = 'prompt-foot';
	this.content.appendChild(this.foot);

	//btnLeft
	this.buttonLeft = document.createElement('button');
	this.buttonLeft.className = 'prompt-button-left';
	this.foot.appendChild(this.buttonLeft);

	//btnRight

	this.buttonRight = document.createElement('button');
	this.buttonRight.className = 'prompt-button-right';
	this.foot.appendChild(this.buttonRight);
	document.body.appendChild(this.holder);

	this.buttonLeft.addEventListener('click', () => {
		if (typeof this.leftBtnlListener == 'function') {
			this.leftBtnlListener(this.textarea.value);
		}
		this.hide();
	});
	this.buttonRight.addEventListener('click', () => {
		if (typeof this.rightBtnlListener == 'function') {
			this.rightBtnlListener(this.textarea.value);
		}
		this.hide();
	});

	//计算内同区域 与 顶部的距离
	let winHeight = window.innerHeight;
	let top = 200;
	if (winHeight) {
		top = winHeight / 2 - 100;
	}

	this.content.style.marginTop = top + 'px';
	this.update(options);

};
UI.Prompt.prototype.update = function (options) {

	if (!options.tip) {
		console.error('undefined content for prompt');
		return;
	}
	if (!options.btn) {
		options.btn = [];
	}
	this.tips.innerHTML = options.tip;
	this.buttonLeft.innerText = (options.btn.length ? options.btn[0] : '取消');
	this.buttonRight.innerText = (options.btn.length == 2 ? options.btn[1] : '确定');
	this.leftBtnlListener = options.leftBtnClick;
	this.rightBtnlListener = options.rightBtnClick;


};

UI.Prompt.prototype.show = function () {

	this.holder.style.display = 'block';

};

//隐藏confirm
UI.Prompt.prototype.hide = function () {

	this.holder.style.display = 'none';

};

//单例模式 不需要创建 直接调用

UI.prompt = function (options) {
	if (!options) {
		options = {};
	}
	if (!this.Prompt.instance) {
		this.Prompt.instance = new this.Prompt(options);
	} else {
		this.Prompt.instance.update(options);
	}
	this.Prompt.instance.show();
};

// 通知

UI.Notification = function () {
	this.holder = document.createElement('div');
	this.holder.className = 'ui-notification-container';

	document.body.appendChild(this.holder);
};

// 显示

UI.showNotification = function (type, content, title) {
	if (!this.Notification.instance) {
		this.Notification.instance = new this.Notification();
	}

	var icons = {
		info: '&#xe620;',
		success: '&#xe616;',
		error: '&#xe615;',
		warn: '&#xe617;',
	};

	var titles = {
		info: '消息',
		success: '成功',
		error: '错误',
		warn: '警告',
	};

	var notification = document.createElement('div');
	notification.className = 'ui-notification ' + type;

	var icon = document.createElement('i');
	icon.className = 'iconfont tip-icon';
	icon.innerHTML = icons[type];

	var body = document.createElement('div');
	body.className = 'ui-body';

	var titleDOM = document.createElement('div');
	titleDOM.className = 'ui-title';
	titleDOM.innerHTML = title ? title : titles[type];

	var contentDOM = document.createElement('div');
	contentDOM.className = 'ui-content';
	contentDOM.innerHTML = content;

	var close = document.createElement('i');
	close.className = 'ui-close iconfont';
	close.innerHTML = '&#xe60f;';

	body.appendChild(titleDOM);
	body.appendChild(contentDOM);
	body.appendChild(close);

	notification.appendChild(icon);
	notification.appendChild(body);

	this.Notification.instance.holder.appendChild(notification);
	if(timer) {
		window.clearTimeout(timer);
	}
	var timer = setTimeout(function () {
		this.Notification.instance.holder.removeChild(notification);
	}.bind(this), 5000);

	close.addEventListener('click', function () {
		clearTimeout(timer);
		this.Notification.instance.holder.removeChild(notification);
	}.bind(this));

};

// 弹出默认消息

UI.Notification.info = function (content, title, time) {
	UI.showNotification('info', content, title, time);
};

// 弹出成功消息 

UI.Notification.success = function (content, title, time) {
	UI.showNotification('success', content, title, time);
};

// 弹出错误消息

UI.Notification.error = function (content, title, time) {
	UI.showNotification('error', content, title, time);
};

// 弹出警告消息

UI.Notification.warn = function (content, title, time) {
	UI.showNotification('warn', content, title, time);
};

// 画廊
UI.Gallery = function () {

	this.index = 0;
	this.images = [];

	this.holder = document.createElement('div');
	this.nextButton = document.createElement('div');
	this.prevButton = document.createElement('div');
	this.img = document.createElement('img');

	this.holder.className = 'ui-gallery';
	this.holder.innerHTML = '<i class="placeholder"></i>';
	
	this.holder.appendChild(this.img);

	this.nextButton.innerHTML = '<i class="placeholder"></i><i class="iconfont">&#xe61a;</i>';
	this.nextButton.className = 'ui-gallery-next-button';
	this.holder.appendChild(this.nextButton);

	this.prevButton.innerHTML = '<i class="placeholder"></i><i class="iconfont">&#xe61a;</i>';
	this.prevButton.className = 'ui-gallery-prev-button';
	this.holder.appendChild(this.prevButton);


	document.body.appendChild(this.holder);
	this.bind();

}

UI.Gallery.prototype.show = function (images, index) {
	this.images = images;
	this.index = index;
	this.play();
	this.holder.style.display = 'block';
}

UI.Gallery.prototype.play = function () {
	const url = this.images[this.index];
	this.img.setAttribute('src', url);
}

UI.Gallery.prototype.bind = function () {
	const _this = this;
	this.nextButton.addEventListener('click', function (e) {
		_this.index = (++_this.index) % _this.images.length;
		_this.play();
		e.stopPropagation();
	})

	this.prevButton.addEventListener('click', function (e) {
		
		_this.index--;

		if(_this.index < 0){
			_this.index = _this.images.length - 1;
		}

		_this.play();
		e.stopPropagation();
	})

	this.holder.addEventListener('click', function(){
		_this.holder.style.display = 'none';
	})

}

UI.Gallery.show = function (opts) {

	if (!opts.images || !opts.images.length) {
		console.log("找不到图片来显示");
		return false;
	}

	if (!UI.Gallery.instance) {
		UI.Gallery.instance = new UI.Gallery();
	}
	UI.Gallery.instance.show(opts.images, (opts.index?opts.index: 0));
	
}

/***
 * 播放音频
 * @param src  音频的路径
 */

UI.PlayAudio = function () {
	this.holder = document.createElement('div');
	this.holder.className = 'ui-audio-container';
	this.holder.id = 'ui-audio-container';
	document.body.appendChild(this.holder);

};

UI.startPlayAudio = function (src) {
	if (!this.PlayAudio.instance) {
		this.PlayAudio.instance = new this.PlayAudio();
	}
	var audioDom = document.getElementById('ui-audio');
	if (audioDom) {
		audioDom.parentElement.removeChild(audioDom);
	}
	var audio = document.createElement('audio');
	audio.setAttribute('controls', 'controls');
	audio.setAttribute('autoplay', 'true');
	audio.setAttribute('src', src);
	audio.className = 'ui-audio';
	audio.id = 'ui-audio';


	this.PlayAudio.instance.holder.appendChild(audio);

	let observable = new Subject();

	audio.addEventListener('ended', function () {
		this.PlayAudio.instance.holder.removeChild(audio);
		observable.next('ended');
	}.bind(this));

	return observable;
};