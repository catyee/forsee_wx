let $ = require('jquery');
var ajaxTest ={
    test: {}
}
ajaxTest.test = function() {

}
$(function() {
    ajaxTest.test();
})
var data =  {
    "userName":"13752583951",
    "password":"123456"    
};
$.ajax({
    url: '/admin/rest/user/login',
    async: true,
    beforeSend: function() {
        console.log('beforeSend')
    },
    cache: true,
    contentType: 'application/json',
    type: 'post',
    context: document.body,
    crossDomain: true,
    data: JSON.stringify(data),
    dataType: 'json',
    headers: {
        // 'Content-Type': 'application/x-www-form-urlencoded '
        'Content-Type': 'application/json'
    },
    error: function(e) {
        console.log(e,'error')
    },
    success: function(res) {
        console.log(res,'resres')
    }
    
})
exports = module.exports = ajaxTest;