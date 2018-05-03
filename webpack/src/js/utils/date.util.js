function DateUtils(date) {

	this.date = null;

	/***
	 * 设置日期
	 */
	this.setDate = function(date) {
		if (date instanceof Date) {
			this.date = date;
		} else if (typeof date == "date") {
			this.date = date;
		} else if (typeof date == "string") {
			date = date.replace(/\-/, '/');
			this.date = new Date(date);
		} else if (typeof date == "number") { 
			this.date = new Date(date);
		} else {
			this.date = new Date();
		}
	}

	/***
	 * 格式化字符串
	 * date 可以是Date类型  或者字符串类型
	 * format 是格式字符串
	 * 	y 年
	 *  M 月
	 *  d 日
	 * 	h 时 
	 *  m 分钟
	 *  s 秒
	 *  S 毫秒
	 *  q 季度
	 * 
	 * 如果传入time(毫秒数) 表示格式化time
	 */
	this.getFormattedDate = function(format,time) {
		if(time){
			this.date = new Date(time);
		}
		
		if (!format) {
			format = "yyyy-MM-dd hh:mm:ss";
		}
		var o = {
			"M+": this.date.getMonth() + 1, //month 
			"d+": this.date.getDate(), //day
			"h+": this.date.getHours(), //hour
			"m+": this.date.getMinutes(), //minute
			"s+": this.date.getSeconds(), //second 
			"q+": Math.floor((this.date.getMonth() + 3) / 3), //quarter 
			"S": this.date.getMilliseconds() //millisecond 
		}

		if (/(y+)/.test(format)) {
			format = format.replace(RegExp.$1, (this.date.getFullYear() + "").substr(4 - RegExp.$1.length));
		}

		for (var k in o) {
			if (new RegExp("(" + k + ")").test(format)) {
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return format;
	}

	/**
	 * 判断年份是否为润年
	 *
	 * @param {Number} year
	 */
	this.isLeapYear = function(year) {
		var year = year || this.date.getFullYear();
		return (year % 400 == 0) || (year % 4 == 0 && year % 100 != 0);
	}
	/**
	 * 获取某一年份的某一月份的天数
	 *
	 * @param {Number} year
	 * @param {Number} month
	 */
	this.getMonthDays = function(month,year) {
		return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month] || (this.isLeapYear(year) ? 29 : 28);
	}
	
	/**
	 * 获取某年的某天是第几周
	 * @param {Number} 
	 * @param {Number} 
	 * @param {Number} 
	 * @returns {Number}
	 */
	this.getWeek = function () {
		var	year = this.date.getFullYear(),
			month = this.date.getMonth(),
			days = this.date.getDate();
		//那一天是那一年中的第多少天
		for (var i = 0; i < month; i++) {
			days += this.getMonthDays(i);
		}

		//那一年第一天是星期几
		var yearFirstDay = new Date(year, 0, 1).getDay() || 7;

		var week = null;
		if (yearFirstDay == 1) {
			week = Math.ceil(days / yearFirstDay);
		} else {
			days -= (7 - yearFirstDay + 1);
			week = Math.ceil(days / 7) + 1;
		}

		return week;
	}

	/***
	 * 获取毫秒数
	 */
	this.getMillisecond = function(){
		return this.date.valueOf();
	}

    /***
	 * 获取日期的毫秒数 00:00:00
     */
    this.getFirstMillisecondOfDate = function () {
		var d = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), 0, 0, 0);
		return d.getTime();
    }
    /***
     * 获取日期的毫秒数 23:59:59
     */
    this.getLastMillisecondOfDate = function () {
        var d = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), 23, 59, 59);
        return d.getTime();
    }
    /**
	 * 获取日期的毫秒数  hour:00:00
     */
    this.getFirstMillisecondOfHour = function () {
        var d = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), this.date.getHours(), 0, 0);
        return d.getTime();
    }
    /**
     * 获取日期的毫秒数 hour:59:59
     */
    this.getLastMillisecondOfHour = function () {
        var d = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), this.date.getHours(), 59, 59);
        return d.getTime();
    }
    /**
     * 获取本月第一天的秒数
     */
    this.getFirstMillisecondOfMonth = function () {
		var d = new Date(this.date.getFullYear(),this.date.getMonth(),1,0,0,0);
		return d.getTime();
    }
    /**
     * 获取本月最后一天的秒数
     */
    this.getLastMillisecondOfMonth = function (year,month) {
    	var day;
		var month = month || this.date.getMonth();
		var year = year || this.date.getFullYear();
		day = this.getMonthDays(month,year);
        var d = new Date(this.date.getFullYear(),this.date.getMonth(),day,23,59,59);
        return d.getTime();
    }

    /**
     * 获取本年第一月第一天的秒数
     */
    this.getFirstMillisecondOfYear = function () {
        var d = new Date(this.date.getFullYear(),0,1,0,0,0);
        return d.getTime();
    }
    /**
     * 获取本年最后一天的秒数
     */
    this.getLastMillisecondOfYear = function () {
        var d = new Date(this.date.getFullYear(),11,31,23,59,59);
        return d.getTime();
    }
    /***
	 * 计算第一个日期距离第二个日期多少天
	 * 		如果不传递第二个日期 默认是当前日期
     */
    this.getDateDistance = function(date1, date2){
    	var times1, times2;

		if(typeof(date1) === 'string'){
			date1 = new Date(date1.replace(/-/g, '/'));
		}

		if(typeof(date2) === 'string'){
			date2 = new Date(date2.replace(/-/g, '/'));
		}

		if(typeof(date1) === 'number'){
			date1 = new Date(date1);
		}

		if(typeof(date2) === 'number'){
			date2 = new Date(date2);
		}

    	if(!date1 || !(date1 instanceof Date)){
			return null;
		}
		if(!date2){
    		date2 = new Date();
		}else if(!(date2 instanceof Date)){
			return null
		}

		var  d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
		var  d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

		return (d1-d2)/86400000;
	}

	/***
	 * 增加天数
	 */
	this.addDays = function(days) {
		var daysMilliSeconds = days*86400000;
		var targetMilliSeconds = this.date.valueOf()+daysMilliSeconds;
		this.date = new Date(targetMilliSeconds);
	};

	/***
	 * 减少天数
	 */
	this.subDays = function(days) {
		var daysMilliSeconds = days*86400000;
		var targetMilliSeconds = this.date.valueOf() - daysMilliSeconds;
		this.date = new Date(targetMilliSeconds);
	}


	//设置初始日期
	this.setDate(date);
}

exports.dateUtil = new DateUtils();