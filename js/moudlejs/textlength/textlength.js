/**
 * 截取字符
 * @param  {[type]} require [description]
 * @param  {[type]} exports [description]
 * @param  {[type]} module  [description]
 * @return {[type]}         [description]
 */
define(function(require, exports, module){
	exports.init = function(obj){
		var textObj = $("[textlength]");
		var force = false;
		if (obj) {
			textObj = $("[textlength]", obj);
			if (!textObj.length) {
				textObj = $(obj);
			}
			force = true;
			textObj.removeAttr("original-title");
			textObj.removeAttr("full-text");
		}
		textObj.each(function() {
			var obj = $(this);
			if (!obj.attr("full-text") || force) {
				var textlength = obj.attr("textlength");
				var txt = $.trim(obj.text());
				var tipsy = txt;
				obj.attr("full-text", tipsy);
				if (txt.length > textlength && (upgTool.subStr(txt,textlength) != txt)) {
					txt = upgTool.subStr(txt,textlength) + "...";
					obj.html(txt);
					obj.attr("original-title", tipsy);
					obj.attr("title", tipsy);
					// 重置弹窗
					if(typeof $.colorbox == 'function'){
						$.colorbox.resize();
					}
				}
			}
		});
	};
});