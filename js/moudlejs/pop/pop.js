/**
 * 第一层弹框
 * @param  {[type]} require [description]
 * @param  {[type]} exports [description]
 * @param  {[type]} module  [description]
 * @return {[type]}         [description]
 */
define(function(require, exports, module){
	require('colorbox/colorbox');
	$.popBox = {};
	exports.success = $.popBox.success = function(msg, callback, msgClass) {
		var msgCls = msgClass || 'maxWidth700';
		var html = '<div id="titlebar">&nbsp</div>';
		html += '<div id="jqueryContent">';
		html += '<div class="rcrt">';
		html += '<div class="rcrtText ' + msgCls + '"><img src="/public/image/pop/sprite_global_01.png" align="absmiddle" width="26" height="26"/>&nbsp;';
		html += msg;
		html += '</div></div></div>';

		var $colorbox = $("#colorbox:visible");
		var $box2 = $("#box2:visible");
		var param = {
			html: html,
			scrolling: false,
			onComplete: function() {
				var popClose = function() {
					$.colorbox.close();
				}
				setTimeout(popClose, 2000);
			}
		};
		if (typeof callback == "function") {
			$.extend(param, {
				onClosed: callback
			});
		}
		$.colorbox(param);
	},
	exports.info = $.popBox.info = function(msg, callback, msgClass) {
		var msgCls = msgClass || 'maxWidth700';
		var html = '<div id="titlebar">&nbsp</div>';
		html += '<div class="rcg-box">';
		html += '<div id="jqueryContent">';
		html += '<div class="rcrt">';
		html += '<div class="rcrtText ' + msgCls + '"><img src="/public/image/pop/sprite_global_04.png" align="absmiddle"/>&nbsp;';
		html += msg;
		html += '</div></div></div></div>';

		var $colorbox = $("#colorbox:visible");
		var $box2 = $("#box2:visible");
		var param = {
			html: html,
			scrolling: false,
			onComplete: function() {
				var popClose = function() {
					$.colorbox.close();
				}
			}
		};
		if (typeof callback == "function") {
			$.extend(param, {
				onClosed: callback
			});
		}
		$.colorbox(param);
	},
	exports.error = $.popBox.error = function(msg, callback, msgClass) {
		var msgCls = msgClass || 'maxWidth700';
		var html = '<div id="titlebar">&nbsp</div>';
		html += '<div class="rcg-box">';
		html += '<div id="jqueryContent">';
		html += '<div class="rcrt">';
		html += '<div class="rcrtText ' + msgCls + '"><img src="/public/image/pop/sprite_global_04.png" align="absmiddle"/>&nbsp;';
		html += msg;
		html += '</div></div></div> </div>';
		var param = {
			scrolling: false,
			html: html
		};
		if (typeof callback == "function") {
			$.extend(param, {
				onClosed: callback
			});
		}
		$.colorbox(param);
	},
	exports.confirm = $.popBox.confirm = function(options) {
		var msgClass = options.msgClass || 'maxWidth700';
		var contentOuter = $('<div class="rcg-box"/>');
		var title = "";
		var okBtnText = options.okBtnText || "确认";
		if (options.title) {
			title = $('<div id="titlebar">' + options.title + '</div>');
		} else {
			title = $('<div id="titlebar">&nbsp</div>');
		}
		var content = $('<div id="jqueryContent"><div class="rcrt"><div class="rcrtText ' + msgClass + '"> <img src="/public/image/pop/sprite_global_04.png" align="absmiddle"/> ' + options.msg + '</div></div></div>');
		var okBtn = $('<span class="btn_bor_blue"><input type="button" class="btn_text" value="' + okBtnText + '"/></span>').click(function() {
			var $input = $(this).find('input[type="button"]');
			options.callback(options);
			upgTool.disableButton($input);
			upgTool.disableButton($(this));
		});
		var cancalBtn = $('<span class="btn_bor_blue ml20"><input type="button" class="btn_text" value="取消"/></span>').click(function() {
			if (options.onCancel) {	
				options.onCancel(options);
			} else {
				$.colorbox.close();
			}
		});
		var btn = $("<div class='box_foot'></div>").append(okBtn).append(cancalBtn);
		contentOuter.append(title).append(content);
		contentOuter.append(btn);
		$.colorbox({
			scrolling: false,
			html: contentOuter
		});
	},
	exports.close = $.popBox.close = function() {
		$.colorbox.close();
	}
});