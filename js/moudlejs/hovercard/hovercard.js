define(function(require, exports, module) {
	require.async('./hovercard.css');
	/*
	 * usage:
	 *    DIV:
	 *       <a href="javascript:;" hovercard="div@divid">
	 *       <div hovercard-id="divid" class="dn">[content]</div>
	 *    AJAX:
	 *       <a href="javascript:;" hovercard="ajax@{:U('xx/yy/zz')}">
	 *    User:
	 *       <a href="javascript:;" hovercard="user@uid">
	 *    Corp:
	 *       <a href="javascript:;" hovercard="corp@corp_id">
	 *
	 * hovercard-options (json)
	 *    trigger: hover, click (default hover)
	 *    direction: left, right, up, down (default right)
	 *       User/Corp default direction: "up"
	 *    onClose: function/false -- callback when hovercard closed (default false)
	 *    cache: true/"false" -- cache ajax content when hovercard first open (default true) *false must be "string"
	 *    minWidth: (default CSS)
	 *    minHeight: (default CSS)
	 *    maxWidth: (default CSS)
	 *    noArrow: any value assigned to this attribute will remove the arrow icon
	 *    noOverlay: any value assigned to this attribute will disable the overlay layer
	 *
	 * close hovercard by js
	 *    $.hovercard("close");
	 */
	(function($) {
		$.hovercard = $.fn.hovercard = function(ctl) {
			var _this = this;
			var $this = $(this);
			var attr = $this.attr("hovercard");
			var type = attr.split("@")[0];
			var typeValue = attr.split("@")[1];
			var id = "hovercard-id-" + Math.ceil(Math.random() * 10000);
			var settings = $this.attr("hovercard-options") ? $.parseJSON($this.attr("hovercard-options")) : {};
			var options = {
				trigger: "hover",
				direction: "right",
				type: type,
				typeValue: typeValue,
				id: id,
				onClose: false,
				cache: true,
				minWidth: false,
				maxWidth: false,
				minHeight: false,
				noArrow: true,
				noOverlay: false,
				top: false,
				speed: 500
			};
			if (type == "user") {
				if (!settings.direction) {
					settings.direction = "up";
				}
				settings.uid = typeValue;
				settings.typeValue = "/index.php?app=finance&mod=Index&act=hoverCardUser&uid=" + typeValue;
			}

			if (type == "corp") {
				if (!settings.direction) {
					settings.direction = "up";
				}
				settings.corp_id = typeValue;
				settings.typeValue = "/index.php?app=finance&mod=Index&act=hoverCardCorp&corp_id=" + typeValue;
			}
			$.extend(options, settings);

			_this.hovercard = function() {
				if (options.trigger == "hover") {
					$this.hover(function() {
						$this.data("hovercard-isEnter", true);
						setTimeout(function() {
							_this.showCard();
						}, options.speed);
					}, function() {
						$this.removeData("hovercard-isEnter");
						setTimeout(function() {
							if (!$this.data("hovercard-isEnter")) {
								_this.hideCard();
							}
						}, options.speed);
					});
				} else {
					$this.click(function() {
						var $floatDiv = $("#" + options.id);
						if ($floatDiv.length == 0) {
							setTimeout(_this.showCard, 0);
						} else {
							if ($floatDiv.is(":visible")) {
								_this.hideCard();
							} else {
								setTimeout(_this.showCard, 0);
							}
						}
						return false;
					});
				}
			};

			_this.showCard = function() {
				var $floatDiv = $("#" + options.id);
				if ($floatDiv.length && $floatDiv.is(":visible")) {} else {
					$(".floatDiv").hide();
				}
				if ($floatDiv.length == 0) {
					$floatDiv = $("<div/>").addClass("floatDiv dn").attr("id", options.id);
					if (options.minWidth) {
						$floatDiv.css("min-width", options.minWidth);
					}
					if (options.maxWidth) {
						$floatDiv.css("max-width", options.maxWidth);
					}
					if (options.minHeight) {
						$floatDiv.css("min-height", options.minHeight);
					}
					if (options.direction == "left") {
						$floatDiv.addClass("floatDivB");
					}
					var arrowClass = options.direction == "left" ? "fiR" : "fi";
					if (options.direction == "up") {
						arrowClass = "fiunder";
					}
					if (options.direction == "down") {
						arrowClass = "fiUp";
					}
					$floatDiv.append('<a href="javascript:;" class="' + arrowClass + ' hoverCardArrow"></a>');
					if (options.trigger != "hover") {
						var $close = $("<a/>").attr("href", "javascript:;").addClass("close");
						$close.click(function() {
							_this.hideCard();
						});
						$floatDiv.append($close);
						$close.wrap($('<div class="closeDivs"/>'));
					}
					$floatDiv.append('<div class="content"/>');
					$("body").append($floatDiv);
				}

				if ($this.data("hovercard-isEnter") || options.trigger != "hover") {
					$floatDiv.show();
					_this.resize();
					if (!$this.data("hovercard-detailsLoaded") || options.cache === "false") {
						if (options.type == "ajax" || options.type == "user" || options.type == "corp") {
							$(".content", $floatDiv).html(upgTool.iconWaiting(true));
							$(".content", $floatDiv).load(options.typeValue, function() {
								$this.data("hovercard-detailsLoaded", true);
								_this.resize();
								bindDetailsEvent();
							});
						} else {
							var $content = $("[hovercard-id='" + options.typeValue + "'][used!='1']");
							$content.attr("used", "1");
							$(".content", $floatDiv).append($content.show());

							$this.data("hovercard-detailsLoaded", true);
							_this.resize();
							bindDetailsEvent();
						}
					}

					var zIndex = upgTool.getHighestZIndex();
					if (options.trigger != "hover" && !options.noOverlay) {
						var $overlay = $('<div id="hovercard-overlay" style="position:absolute; top:0; left:0; overflow:hidden; position:fixed; width:100%; height:100%; background: #fff;opacity:0;filter:alpha(opacity=0)"/>');
						$overlay.css("zIndex", (zIndex + 1));
						$(document.body).append($overlay);
					}

					$floatDiv.css("zIndex", (zIndex + 2));
				}

				function bindDetailsEvent() {
					if (options.trigger == "hover") {
						var $floatDiv = $("#" + options.id);
						$floatDiv.hover(function() {
							$this.data("hovercard-isEnterDetails", "1");
						}, function() {
							$this.removeData("hovercard-isEnterDetails");
							setTimeout(function() {
								_this.hideCard();
							}, options.speed);
						});
					} else {
						if (options.noOverlay) {
							$(document.body).bind("click.hovercard" + options.id, function(e) {
								if (!$(e.target).closest("div[id='" + options.id + "']").length && !$(e.target).is($this)) {
									_this.hideCard();
								}
							});
						}
					}
				}
			};

			_this.hideCard = function() {
				if (options.trigger != "hover" || !$this.data("hovercard-isEnterDetails")) {
					$("#" + options.id).hide();
					$("#hovercard-overlay").remove();
				}
				if (options.onClose) {
					var fun = window[options.onClose];
					fun($this);
				}
			};

			_this.resize = function() {
				var offset = $this.offset();
				var $floatDiv = $("#" + options.id);
				/* arrow top=25px, size=6x11px */
				var left = offset.left + $this.outerWidth() + 0;
				var top = offset.top + 5;
				if (options.direction == "left") {
					left = offset.left - $floatDiv.outerWidth() - 10;
				}
				if (options.direction == "up") {
					top = offset.top - $floatDiv.outerHeight() - 6;
					left = offset.left;
					// 此时弹出层位于浏览器不可视区域，将无法关闭，故让其大于零
					if (top < 0) {
						top = 10;
					}
					if (left + $floatDiv.outerWidth() > $(window).width()) {
						left = offset.left - $floatDiv.outerWidth() + $this.outerWidth();
						$("a.hoverCardArrow", $floatDiv).removeClass("fiunder").addClass("fiRunder");
					}
				}
				if (options.direction == "down") {
					top = offset.top + $this.height();
					if (!options.noArrow) {
						top += 6;
					}

					if (left + $floatDiv.outerWidth() > $(window).width()) {
						left = offset.left - $floatDiv.outerWidth() + $this.outerWidth();
						if (!options.noArrow) {
							$("a.hoverCardArrow", $floatDiv).removeClass("fiUp").addClass("fiRup");
						}
					}
				}
				if (options.noArrow && $("a.hoverCardArrow", $floatDiv).length) {
					$("a.hoverCardArrow", $floatDiv).remove();
				}

				$floatDiv.css({
					top: top,
					left: left
				});

				function isObjTooShort() {
					return $this.width() < parseInt($("a.hoverCardArrow", $floatDiv).css("left")) + $("a.hoverCardArrow", $floatDiv).width();
				}
			};

			if (typeof ctl == "string") {
				_this = _this.data("hovercard");
				$this = $(_this);
				if (ctl == "close") {
					_this.hideCard();
				} else if (ctl == "show") {
					_this.showCard();
				}
			} else {
				_this.hovercard();
				_this.data("hovercard", this);
			}

			$(window).bind('resize.hovercard', function() {
				_this.resize();
			});
		};

		$.hovercard.close = $.fn.hovercard.close = function() {
			$("div[id^='hovercard-id']").hide();
			$("#hovercard-overlay").remove();
		};
	})(jQuery);

	function initHovercard($obj) {
		var force = false;
		if ($obj) {
			force = true;
		}
		$obj = $obj || $("[hovercard]");
		$obj.each(function() {
			var $this = $(this);
			if (!$this.data("initHovercard") || force) {
				if (!$this.closest("div[id^='hovercard-id']").length) {
					$this.hovercard();
					$this.data("initHovercard", true);
				}
			}
		});
	}

	exports.init = initHovercard;
});
