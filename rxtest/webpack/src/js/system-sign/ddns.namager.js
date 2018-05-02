let manager = {
	list : [],
	pageSize : 20,
	totalPage : 0,
	page : 0,
	update : {},
};

manager.update = function( list ){
	this.list = list;
	this.totalPage = Math.ceil(this.list.length/this.pageSize);
};

manager.getPageDDNs = function ( page ) {

	let from = (page - 1) * this.pageSize;
	let to = from + this.pageSize;
	this.page = page;
	return this.list.slice(from, to);

};

exports.DDNManager = manager;