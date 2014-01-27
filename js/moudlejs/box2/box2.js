/**
 * 第二层弹框
 * @param  {[type]} require [description]
 * @param  {[type]} exports [description]
 * @param  {[type]} module  [description]
 * @return {[type]}         [description]
 */
define(function(require, exports, module) {
	(function($) {
		var defaultSetting = {
			autoPos: false,
			success: false,
			success_msg: "",
			success_callback: null,
			error: false,
			error_msg: "",
			confirm: false,
			confirm_msg: "",
			confirm_callback: $.noop,
			data: {},
			onComplete: $.noop,
			html: false,
			htmlParent: false,
			width: false,
			onOpen: $.noop
		}, setting,
			zIndex = "510",
			contentWidth, inline, timeout,
			$window, $box, $closeBtn, $contentDiv, $overlay,
			$loading = $('<div id="box2Loading" style="text-align:center"><img src="/public/image/box2/loading.gif"></div>');

		function appendHTML() {
			$window = $(window);
			if($('#box2').length){
				$('#box2').remove();
			}
			$box = $('<div class="box2" style="position:absolute; width:156px;" id="box2">' +
				'<div class="box2borderDiv">' +
				'<a class="box2closediv box2closeButton"></a>' +
				'<div class="box2contentDiv" style="margin:auto;"></div>' +
				'</div>' +
				'<div class="box2bgborderBottom"><span class="fl imgbgsLeft" ></span><span class="fl bgsbottom"></span><span class="fr imgbgsRight" ></span></div>' +
				'</div>').hide();
			$overlay = $('<div id="box2overlay" style="position:absolute; top:0; left:0; overflow:hidden; position:fixed; width:100%; height:100%; background: #000000;opacity:0;filter:alpha(opacity=0)"/>').hide();
			$(document.body).append($overlay, $box);

			$closeBtn = $("#box2 .box2closeButton");
			$contentDiv = $("#box2 .box2contentDiv");

			var highestZIndex = upgTool.getHighestZIndex();
			$box.css("zIndex", highestZIndex + 1);
			$overlay.css("zIndex", highestZIndex);

			$closeBtn.click(function() {
				$.box2.close();
			});
		}

		var getCenterPos = function() {
			var left = Math.round(Math.max($window.width() - $box.outerWidth(), 0) / 2);
			var top = Math.round((Math.max($window.height() - $(".box2borderDiv", $box).outerHeight(), 0) / 2) + $window.scrollTop());

			return {
				"top": top,
				"left": left
			};
		}

		$.box2 = $.fn.box2 = function(options) { 
			var $this = this;
			options = options || {};
			setting = $.extend(setting, defaultSetting, options);
			appendHTML();
			if($('#box2').length && setting.width){
				$('#box2').css("width", setting.width);
			}
			var $content;
			if (setting.success) {
				var $content = $('<div class="boxConWrap"/>');
				$content.append('<p class="box_Pop"><img src="/public/image/pop/sprite_global_01.png" align="absmiddle" />&nbsp;' + setting.success_msg + '</p>');
				inline = true;
			} else if (setting.error) {
				var $content = $('<div class="boxConWrap"/>');
				$content.append('<p class="box_Pop"><img src="/public/image/pop/sprite_global_02.png" align="absmiddle" />&nbsp;' + setting.error_msg + '</p>');
				inline = true;
			} else if (setting.confirm) {
				var $content = $('<div class="boxConWrap"/>');
				$content.append('<table style="margin:0 auto" width="100%"><tr><td nowrap><p class="box_Pop"><img src="/public/image/pop/sprite_global_01.png" align="absmiddle" />' + setting.confirm_msg + '</p></td></tr></table>');
				var okBtn = $('<span class="btn_bor_orange"><input type="button" class="btn_text" value="确认"/></span>').click(function() {
					setting.confirm_callback(setting);
					upgTool.disableButton($(this));
				});
				var cancalBtn = $('<span class="btn_bor_lightblue ml20"><input type="button" class="btn_text" value="取消"/></span>').click(function() {
					$.box2.close();
				});
				var btn = $("<div class='box_foot'></div>").append(okBtn).append(cancalBtn);
				$content.append(btn)
				inline = true;
			} else if (setting.html) {
				var $content = $("<div/>");
				if (setting.styleCss) {
					$content.css(setting.styleCss);
				}
				setting.htmlParent = $(setting.html).parent();
				$content.append(setting.html);
				inline = true;
			} else {
				var href = typeof $this === "function" ? setting.href : $this.attr("href");
				inline = false;
				$content = $loading.clone();
			}
			contentWidth = $content.outerWidth();
			$contentDiv.append($content.show().removeClass("vh"));
			setting.onOpen();

			$.box2.resize();
			var noImg = true;
			if (!inline) {
				$('#box2').data('loaded', 1);
				var param = {};
				$.post(href, setting.data, function(txt) {
					if($('#box2').data('loaded') == 1){
						$('#box2').data('loaded', 0);
						var result = $('<div class="dn"/>').html(txt);
						$(document.body).append(result);
						contentWidth = result.outerWidth();
						$contentDiv.append(result.show());
						$content.remove();
						$.box2.resize();
						setting.onComplete($box);
					}
				});
			} else {
				var $img = $content.find("img");
				if ($img.length > 0) {
					noImg = false;
					$content.hide().addClass("vh");
					$contentDiv.append(upgTool.iconWaiting(true, 'box2Loading'));
					$img.each(function() {
						$(this).attr('src', $(this).attr('src') + '?' + new Date().getTime())
					}).load(function() {
						contentWidth = $content.outerWidth();
						$("img.box2Loading", $contentDiv).remove();
						$content.show().removeClass("vh");
						$.box2.resize();
						setting.onComplete($box);
					});
				}
				if(setting.html){
					contentWidth = $content.outerWidth();
					$.box2.resize();
					setting.onComplete($box);
				}
			}

			$overlay.show();
			$box.show();

			if (inline && noImg) {
				setting.onComplete($box);
			}

			$window.bind('resize.box2', function() {
				$.box2.resize();
			});
		};

		$.box2.success = function(msg, callback) {
			$.box2.close(true);
			callback = callback || $.noop();
			var options = {
				success: true,
				success_msg: msg,
				success_callback: callback
			};
			$.box2(options);
			timeout = setTimeout($.box2.close, 2000);
		}

		$.box2.error = function(msg) {
			$.box2.close(true);
			var options = {
				error: true,
				error_msg: msg
			};
			$.box2(options);
		}

		$.box2.confirm = function(options) {
			$.box2.close(true);
			callback = options.callback || $.noop();
			var options = {
				confirm: true,
				confirm_msg: options.msg,
				confirm_callback: callback
			};
			$.box2(options);
		}

		$.box2.resize = function() {
			if ($box) {
				if (contentWidth > 0) {
					$box.css("width", contentWidth + 2);
					//$contentDiv.css("width",contentWidth+8);
					$contentDiv.css("width", contentWidth);
				}

				var center = getCenterPos();
				$box.css({
					"top": center.top,
					"left": center.left
				});
			}
		};

		$.box2.close = function(noFade) {
			upgTool.removeErrorMsg();
			if ($box) {
				clearTimeout(timeout);
				noFade = noFade || false;
				var fun = function() {
					$overlay.hide();
					if (inline && !setting.success && !setting.error) {
						if(setting.htmlParent && setting.htmlParent.length){
							$(setting.htmlParent).append($contentDiv.find(setting.html).hide());
						} else {
							$(document.body).append($contentDiv.children().hide());
						}
					}
					$box.remove();
					$overlay.remove();

					if (setting.success) {
						if (setting.success_callback && typeof setting.success_callback === "function") {
							setting.success_callback();
						}
					}
				};
				if (noFade) {
					$box.hide();
					fun();
				} else {
					$box.fadeOut(function() {
						fun();
					});
				}
			}
		};
	})(jQuery);
});