define(function(require, exports, module) {	// 实名认证
	var pop = require('pop/pop');
	var box2 = require('box2/box2');

	var verifyId = function(){
		var authUrl = "/Account/IdAuth/isAuthId";
		var result = true;
		$.ajax({
			url: authUrl,
			async: false,
			dataType: 'json',
			success: function(json){	// 尚未认证
				if(json && json.boolen == 0){
					var popUrl = "/Account/IdAuth/verifyId";
					$.colorbox({
						href: popUrl
					});
					result = false;
				}
			}
		});
		return result
	}

	$('[verifyid]').on('click', function(){
		var result = verifyId();
		return result;
	});

	exports.init = verifyId;

});