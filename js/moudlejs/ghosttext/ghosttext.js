/**
 * input默认标题显示
 * @param  {[type]} require [description]
 * @param  {[type]} exports [description]
 * @param  {[type]} module  [description]
 * @return {[type]}         [description]
 */
define(function(require, exports, module) { 
	function initGhostText(_obj) {
		var force = _obj || false;
		var formObj;
		if (_obj && _obj.attr("ghosttext")) {
			formObj = _obj;
		} else {
			formObj = _obj ? $("[ghosttext]", _obj) : $("[ghosttext]");
		}
		formObj.each(function() {
			var obj = $(this);
			var objId = obj.attr("id") || obj.attr("name");
			if (!obj.data("initGhostText") || force) {
				if (force && obj.data("initGhostText")) {
					obj.unbind("focus change blur keyup keydown");
					obj.siblings("label.gt").remove();
					obj.unwrap();
				}
				obj.data("initGhostText", "1");
				obj.bind({
					focus: function(e) {
						control(e, obj);
					},
					change: function(e) {
						control(e, obj);
					},
					blur: function(e) {
						if (obj.val().length == 0) {
							var $label = obj.prev("label");
							if (!$label.length) {
								$label = obj.parent().siblings("label");
							}
							$label.removeClass("fgt").show();
						}
					},
					keyup: function(e) {
						control(e, obj);
					},
					keydown: function(e) {
						control(e, obj, true);
					}
				});

				var txt = obj.attr("ghosttext");
				var labelText = $("<label/>").addClass('gt').html(txt).click(function() {
					obj.focus();
				});

				if (!obj.parent("div").hasClass("ghosttext")) {
					obj.wrapAll('<div style="display:inline-block;" class="ghosttext ghosttexttarget-' + objId + '"/>')
				}
				obj.before(labelText);

				if (obj.val().length > 0) {
					control(null, obj, true);
				}
			}
		});
	}

	/**
	 * 截取字符数
	 * @param  {[type]} e         [description]
	 * @param  {[type]} obj       [description]
	 * @param  {[type]} forceHide [description]
	 * @return {[type]}           [description]
	 */
	function control(e, obj, forceHide) {
		var $label = obj.prev("label");
		if (!$label.length) {
			$label = obj.parent().siblings("label");
		}
		if (obj.val().length > 0 || forceHide) {
			$label.removeClass("fgt").hide();
		} else if (obj.val().length == 0) {
			if (e.type != "change") {
				$label.addClass("fgt");
			}
			$label.show();
		}
	}

	exports.init = initGhostText;

});