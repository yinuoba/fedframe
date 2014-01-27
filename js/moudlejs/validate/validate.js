/**
 * 表单验证
 * @param  {[type]} require [description]
 * @param  {[type]} exports [description]
 * @param  {[type]} module  [description]
 * @return {[type]}         [description]
 */
define(function(require, exports, module) {
	require('tipsy/tipsy');
	(function($) {
		var _formObj;
		var _isFocus = false;
		var validator = {
			required: {
				regex: /[^(^\s*)|(\s*$)]/,
				msg: "此项必填"
			},
			email: {
				regex: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
				msg: "邮箱格式不正确。参考格式: wzp@upg.cn"
			},
            qq: {
                regex: /^\d+$/,
                msg: "qq号码必须是1位以上的数字"
            },
			url: {
				msg: "链接格式不正确。参考格式：http://www.ifsc.com.cn"
			},
			id: {
				msg: "此项必填"
			},
			lengthRange: {
				msg: "密码长度为 #0# 到 #1#"
			},
			notMatch: {
				msg: "please enter a value differnt from '#0#'"
			},
			match: {
				msg: "please enter a value match with '#0#' field"
			},
			realname: {
				regex: /^[\u0391-\uFFE5A-Za-z0-9_-]+$/,
				msg: "中文,英文, 0-9, - and _"
			},
			alphanumeric: {
				regex: /^[A-Za-z0-9_-]+$/,
				msg: "英文, 0-9, - and _"
			},
			idcard: {
				msg: "身份证号码错误"
			},
			mobile: {
				// regex: /^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){10,12})+$/,
				regex: /^[1][3,4,5,8]\d{9}$/,
				msg: "手机号码格式错误"
			},
			phone: {
				//regex: /^((\d{11,12})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)$/,
				regex: /^((\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$)$/,
				msg: "座机号码格式错误,格式 0571-88888888"
			},
			mobileOrPhone: {
				msg: "此项格式为手机或座机号码"
			},
			// 验证座机区号
			areaPart: {
				// 匹配区号0开头的3位或4位数字
				regex: /^0\d{2}$|^0\d{3}$/,
				msg: "区号格式错误"
			},
			// 验证座机号，不包括区号
			phonePart: {
				// 匹配电话号码为7位或8位数字
				regex: /^((\d{7,8})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$)$/,
				msg: "座机号码格式错误"
			},
			year: {
				regex: /^[1,2][0,9]\d{2}$/,
				msg: "年格式填写错误！"
			},
			month: {
				regex: /^[0,1]\d{1}$|^\d{1}$/,
				msg: "月格式填写错误！"
			},
			day: {
				regex: /^[0,1,2,3]\d{1}$|^\d{1}$/,
				msg: "日格式填写错误！"
			},
			number: {
				msg: "此项为数字格式"
			},
			notAllNum: {
				regex: /^\d+$/,
				msg: "不能全为数字"
			},
			uploadImg: {
				msg: "图片类型错误"
			},
			uploadFile: {
				msg: "附件类型错误"
			},
			uploadFileImg: {
				msg: "附件类型错误"
			},
			uploadSound: {
				msg: "录音类型错误"
			},
			maxValue: {
				msg: "请输入数字小于  #0#"
			},
			minValue: {
				msg: "请输入数字大于  #0#"
			},
			maxDecimal: {
				msg: "有效数字不多于 #0#"
			}
		};

		var showErr = function(obj, fieldName, msg) {
			try {
				obj.tipsy("hide");
			} catch (e) {}
			if(obj.is(':visible')) {
				obj.attr("valid-msg-text", msg);
			} else {
				obj.parent().attr("valid-msg-text", msg);
			}

			var options = obj.attr("valid-msg-options") == null ? {} : $.parseJSON(obj.attr("valid-msg-options"));
			$.extend(options, {
				show: true
			})
			var isFocus = false;
			if (_isFocus) {
				$.extend(options, {
					unFocus: true
				})
			}
			isFocus = createTipsyErr(obj.is(':visible') ? obj : obj.parent(), options);
			if (!_isFocus) {
				_isFocus = isFocus;
			}
		}


		var getElemetByNameOrId = function(targetObjIdOrName, visible) {
			var targetObj = $('[name="' + targetObjIdOrName + '"]', _formObj).length > 0 ? $('[name="' + targetObjIdOrName + '"]', _formObj) : $('#' + targetObjIdOrName);
      targetObj = targetObj.size() > 0 ? targetObj : $('[valid-name=' + targetObjIdOrName + ']'); //fix 360记住用户输入的问题
			if (visible) {
				targetObj = targetObj.filter(":visible");
			}
			return targetObj;
		}

		$.fn.valid = function(formObj) {
			if (!$(this).attr("valid")) {
				return false;
			}

			_formObj = formObj || $("body");

			var obj = $(this);
			var validTypes = obj.attr("valid").split('|')[0].split(',');
			var validMsges = obj.attr("valid").split('|')[1] ? obj.attr("valid").split('|')[1].split(',') : [];
			var fieldVal = ((obj.attr("type") || '').toLowerCase() == 'radio' ? $('[name='+obj.attr('name')+']:checked').val() : obj.val()) || ""; // fix by 000802: radio取值
			var fieldLength = fieldVal.length;
			var fieldName = obj.attr("name") || obj.attr('valid-name'); //fix 360记住用户输入的问题
			var isValid = true;

			$.each(validTypes, function(i, validType) {
				validType = $.trim(validType);
				var validValue;
				if (validType.indexOf("@") >= 0) {
					validValue = validType.split("@")[1];
					validType = validType.split("@")[0];
				}

				if (validType == 'ajax') {
					var data = {};
					data[fieldName] = fieldVal;
					$.ajax({
						type: 'post',
						url: validValue,
						data: data,
						dataType: 'json',
						cache: false,
						async: false,
						success: function(json) {
							if (json.boolen == "0") {
								showErr(obj, fieldName, json.message);
								isValid = false;
								return false;
							}
						}
					});
				} else {
					var msg = validMsges[i] || validator[validType]['msg'];

					if (validType == 'lengthRange') {
						var rangeMin = validValue.split("~")[0];
						var rangeMax = validValue.split("~")[1];
						if (fieldLength < rangeMin || fieldLength > rangeMax) {
							msg = msg.replaceAll("#0#", rangeMin);
							msg = msg.replaceAll("#1#", rangeMax);
							showErr(obj, fieldName, msg);
							isValid = false;
							return false;
						}
					} else if (validType == 'number') {
						//					if (isNaN(fieldVal) || fieldVal<0 || fieldVal.indexOf("+")>=0) {
						if (isNaN(fieldVal) || fieldVal.indexOf("+") >= 0) {
							showErr(obj, fieldName, msg);
							isValid = false;
							return false;
						}
					} else if (validType == 'notAllNum') {
						if (fieldVal.length == 0) {
							isValid = true;
							return isValid;
						}
						var isNumber = validator['notAllNum']['regex'].test(fieldVal);
						if (isNumber) {	// 全为数字，提示不能全为数字
							showErr(obj, fieldName, msg);
							isValid = false;
							return false;
						}
					} else if (validType == 'notMatch') {
						if (fieldVal == getElemetByNameOrId(validValue).val()) {
							msg = msg.replaceAll("#0#", getElemetByNameOrId(validValue).val());
							showErr(obj, fieldName, msg);
							isValid = false;
							return false;
						}
					} else if (validType == 'minValue') {
						if (isNaN(validValue)) {
							validValue = getElemetByNameOrId(validValue).val();
						}
						if (validValue) {
							if (parseFloat(fieldVal) <= parseFloat(validValue)) {
								msg = msg.replaceAll("#0#", validValue);
								showErr(obj, fieldName, msg);
								isValid = false;
								return false;
							}
						}
					} else if (validType == 'maxValue') {
						if (isNaN(validValue)) {
							validValue = getElemetByNameOrId(validValue).val();
						}
						if (validValue) {
							if (parseFloat(fieldVal) > parseFloat(validValue)) {
								msg = msg.replaceAll("#0#", validValue);
								showErr(obj, fieldName, msg);
								isValid = false;
								return false;
							}
						}
					} else if (validType == 'maxDecimal') {
						var cleanNum = parseFloat(fieldVal).toFixed(validValue);
						if (fieldVal / cleanNum > 1) {
							msg = msg.replaceAll("#0#", validValue);
							showErr(obj, fieldName, msg);
							isValid = false;
							return false;
						}
					} else if (validType == 'match') {
						if (fieldVal != getElemetByNameOrId(validValue).val()) {
							msg = msg.replaceAll("#0#", getElemetByNameOrId(validValue).attr("name"));
							showErr(obj, fieldName, msg);
							isValid = false;
							return false;
						}
					} else if (validType == 'id') {
						fieldName = validValue ? validValue : fieldName;
						var fieldObj = getElemetByNameOrId(fieldName);
						fieldVal = fieldObj.is(":radio") || fieldObj.is(":checkbox") ? fieldObj.filter(":checked").val() : fieldObj.val();
						if (fieldVal === null || fieldVal === undefined || fieldVal === '' || fieldVal < 0) {
							showErr(obj, fieldName, msg);
							isValid = false;
							return false;
						}
					} else if (validType == 'idcard') {
						/* 140602198007196708 */
						if (fieldVal.length == 0) {
							isValid = true;
							return isValid;
						}
						isValid = false;
						if (fieldVal.length == 15) {
							isValid = isChineseIdentifyNo15(fieldVal);
						} else if (fieldVal.length == 18) {
							isValid = isChineseIdentifyNo18(fieldVal);
						}
						if (!isValid) {
							showErr(obj, fieldName, msg);
							return false;
						}
					} else if (validType == 'url') {
						if (fieldVal.length == 0) {
							isValid = true;
							return isValid;
						}
						isValid = false;
						if (fieldVal.indexOf('http://') !== -1 || fieldVal.indexOf('https://') !== -1) {
							isValid = true;
						}
						if (!isValid) {
							showErr(obj, fieldName, msg);
							return false;
						}
					} else if (validType == 'uploadImg') {
						var fieldObj = obj || getElemetByNameOrId(fieldName);
						if (!fieldVal) {
							fieldName = validValue ? validValue : fieldName;
							fieldVal = fieldObj.is(":radio") || fieldObj.is(":checkbox") ? fieldObj.filter(":checked").val() : fieldObj.val();
						}
						if (fieldVal.length == 0) {
							return true;
						}
						var ext = fieldVal.split('.').pop().toLowerCase();
						var type = ['jpg', 'gif', 'png', 'jpeg', 'bmp'];
						if ($.inArray(ext, type) == -1) {
							// IE fixes: Cannot empty file value.
							fieldObj.replaceWith(fieldObj.val("").clone(true));
							fieldObj = getElemetByNameOrId(fieldName, true)
							fieldObj.removeData("tipsy");

							showErr(fieldObj, fieldName, msg);
							isValid = false;
						}
					} else if (validType == 'uploadFile') {
						var fieldObj = obj || getElemetByNameOrId(fieldName);
						if (!fieldVal) {
							fieldName = validValue ? validValue : fieldName;
							fieldVal = fieldObj.is(":radio") || fieldObj.is(":checkbox") ? fieldObj.filter(":checked").val() : fieldObj.val();
						}
						if (fieldVal.length == 0) {
							return true;
						}
						var ext = fieldVal.split('.').pop().toLowerCase();
						var type = ['zip', 'rar', 'doc', 'xls', 'ppt', 'docx', 'xlsx', 'pptx', 'pdf', 'htm', 'html', 'wps', 'et', 'dps', 'txt'];
						if ($.inArray(ext, type) == -1) {
							// IE fixes: Cannot empty file value.
							fieldObj.replaceWith(fieldObj.val("").clone(true));
							fieldObj = getElemetByNameOrId(fieldName, true)
							fieldObj.removeData("tipsy");

							showErr(fieldObj, fieldName, msg);
							isValid = false;
						}
					} else if (validType == 'uploadFileImg') {
						var fieldObj = obj || getElemetByNameOrId(fieldName);
						if (!fieldVal) {
							fieldName = validValue ? validValue : fieldName;
							fieldVal = fieldObj.is(":radio") || fieldObj.is(":checkbox") ? fieldObj.filter(":checked").val() : fieldObj.val();
						}
						if (fieldVal.length == 0) {
							return true;
						}
						var ext = fieldVal.split('.').pop().toLowerCase();
						var type = ['zip', 'rar', 'doc', 'xls', 'ppt', 'docx', 'xlsx', 'pptx', 'pdf', 'htm', 'html', 'wps', 'et', 'dps', 'jpg', 'gif', 'png', 'jpeg', 'bmp', 'txt'];
						if ($.inArray(ext, type) == -1) {
							// IE fixes: Cannot empty file value.
							fieldObj.replaceWith(fieldObj.val("").clone(true));
							fieldObj = getElemetByNameOrId(fieldName, true)
							fieldObj.removeData("tipsy");

							showErr(fieldObj, fieldName, msg);
							isValid = false;
						}
					} else if (validType == 'uploadSound') {
						var fieldObj = obj || getElemetByNameOrId(fieldName);
						if (!fieldVal) {
							fieldName = validValue ? validValue : fieldName;
							fieldVal = fieldObj.is(":radio") || fieldObj.is(":checkbox") ? fieldObj.filter(":checked").val() : fieldObj.val();
						}
						if (fieldVal.length == 0) {
							return true;
						}
						var ext = fieldVal.split('.').pop().toLowerCase();
						var type = ['mp3', 'wma', 'flac', 'aac', 'mmf', 'amr', 'm4a', 'm4r', 'ogg', 'mp2', 'wav', 'wv'];
						if ($.inArray(ext, type) == -1) {
							// IE fixes: Cannot empty file value.
							fieldObj.replaceWith(fieldObj.val("").clone(true));
							fieldObj = getElemetByNameOrId(fieldName, true)
							fieldObj.removeData("tipsy");

							showErr(fieldObj, fieldName, msg);
							isValid = false;
						}
					} else if (validType == 'mobileOrPhone') {
						if (fieldVal.length == 0) {
							isValid = true;
							return isValid;
						}
						var isPhone = validator['phone']['regex'].test(fieldVal);
						var isMobile = validator['mobile']['regex'].test(fieldVal);
						if (!isPhone && !isMobile) {
							showErr(obj, fieldName, msg);
							isValid = false;
							return false;
						}
					} else if (validType == 'year') {
						if (fieldVal.length == 0) {
							isValid = true;
							return isValid;
						}
						var isYear = validator['year']['regex'].test(fieldVal);
						if (!isYear) {
							showErr(obj, fieldName, msg);
							isValid = false;
							return false;
						}
					} else if (validType == 'month') {
						if (fieldVal.length == 0) {
							isValid = true;
							return isValid;
						}
						var isMonth = validator['month']['regex'].test(fieldVal);
						if (!isMonth) {
							showErr(obj, fieldName, msg);
							isValid = false;
							return false;
						}
					} else if (validType == 'day') {
						if (fieldVal.length == 0) {
							isValid = true;
							return isValid;
						}
						var isDay = validator['day']['regex'].test(fieldVal);
						if (!isDay) {
							showErr(obj, fieldName, msg);
							isValid = false;
							return false;
						}
					} else if (validType == 'areaPart') {
						if (fieldVal.length == 0) {
							isValid = true;
							return isValid;
						}
						var isAreaNumber = validator['areaPart']['regex'].test(fieldVal);
						if (!isAreaNumber) {
							showErr(obj, fieldName, msg);
							isValid = false;
							return false;
						}
					} else if (validType == 'phonePart') {
						if (fieldVal.length == 0) {
							isValid = true;
							return isValid;
						}
						var isPhoneNumber = validator['phonePart']['regex'].test(fieldVal);
						if (!isPhoneNumber) {
							showErr(obj, fieldName, msg);
							isValid = false;
							return false;
						}
					} else {
						if (validType != 'required' && fieldVal.length == 0) {
							isValid = true;
							return true;
						}
						if (!obj.is(":disabled")) {
							if (!validator[validType]['regex'].test(fieldVal)) {
								showErr(obj, fieldName, msg);
								isValid = false;
								return false;
							}
						}
						// special validate for realname (Punctuation)
						if (validType == 'realname') {
							var punctuations = ['～', '！', '＠', '＃', '＄', '％', '︿', '＆', '＊', '（', '）', '＿', '＋', '‵', '－', '＝', '［', '］', '＼', '｛', '｝', '｜', '；', '’', '：', '＂', '，', '。', '／', '＜', '＞', '？'];
							for (i in punctuations) {
								if (fieldVal.indexOf(punctuations[i]) >= 0) {
									showErr(obj, fieldName, msg);
									isValid = false;
									return false;
								}
							}
						}
					}
				}
			});

			if (isValid) {
				try {
					obj.tipsy("hide");
				} catch (e) {}
			}

			return isValid;
		}
	})(jQuery);

	function createTipsyErr(obj, options) {
		var show = options && options.show ? true : false;
		var unFocus = options && options.unFocus ? true : false;
		var gravity = options && options.gravity ? options.gravity : "w";
		var html = options && options.html ? options.html : true;
		var offset = options && options.offset ? options.offset : 0;
		var fieldId = obj.attr("name") == null ? obj.attr("valid-msg") : obj.attr("name");
		var msgHolderId = options && options.msgHolderId ? options.msgHolderId : false;
		var width = options.width;
		var formId = "";
		if (obj.parents("form").length) {
			var $form = obj.parents("form");
			formId = $form.attr("name") || $form.attr("id");

			if (!formId) {
				var randomNum = Math.ceil(Math.random() * 10000);
				formId = "randomId-" + randomNum;
			}
		}
		fieldId = fieldId == null ? obj.attr("id") : fieldId;

		if (msgHolderId) {
			var _validMsgText = obj.attr("valid-msg-text");
			obj = $("#" + msgHolderId);
			obj.attr("valid-msg-text", _validMsgText);
		}
		obj.tipsy({
			title: "valid-msg-text",
			trigger: "manual",
			gravity: gravity,
			fade: true,
			color: "red",
			opacity: 1,
			html: html,
			offset: offset,
			id: fieldId,
			formId: formId,
			width: width
		});
		var isFocus = false;

		if (!unFocus) {
			isFocus = focusErr(obj);
		}
		if (show) {
			setTimeout(function() {
				obj.tipsy("show");
				if (obj.is("input")) {
					obj.addClass("textMess_bd");
				}
			}, 10);
		}

		return isFocus;
	}

	function removeErrorMsg(tipsyid) {
		try {
			if (tipsyid) {
				if (typeof tipsyid === "object") {
					if(typeof tipsyid.tipsy == 'function'){
						var t = tipsyid.tipsy("tip");
						t.hide();
					}
				} else {
					$("[tipsyid='" + tipsyid + "']").remove();
				}
			} else {
				$("[tipsy].tipsy-red").remove();
			}
		} catch (e) {}
	}

	function focusErr(obj) {
		var isFocus = false;
		try {
			var $colorbox = $("#colorbox:visible");
			if (!$colorbox.length) {
				//$(window).scrollTop(0);
			}
			setTimeout(function() {
				var _tabindex = obj.attr("tabindex");
				if (!obj.is(":input")) {
					obj.attr("tabindex", "-1");
					if (!obj.is(":visible")) {
						obj.append("&nbsp;");
					}
					obj.focus();
					if (_tabindex) {
						obj.attr("tabindex", _tabindex);
					} else {
						obj.removeAttr("tabindex");
					}
				} else {
					obj.focus();
				}
			}, 1);
			isFocus = true;
		} catch (e) {}
		return isFocus;
	}

	function isValidError(formObj) {
		var result = false;
		var $obj = $("[tipsy]");
		if (formObj) {
			var formId = formObj.attr("name") || formObj.attr("id");
			$obj = $("[tipsy][tipsyformId=" + formId + "]");
		}
		$obj.each(function() {
			if ($(this).is(":visible")) {
				result = true;
			}
		});
		return result;
	}

	/**
	 * boolean String.isChineseIdentifyNo15()
	 * 验证中国居民15位身份证号码是否合法
	 * 返回：合法返回true,不合法返回false
	 */
	function isChineseIdentifyNo15(str) {
		var _id = str;
		for (var i = 0; i < _id.length; i++) {
			//校验每一位的合法性
			if (_id.charAt(i) < '0' || _id.charAt(i) > '9') {
				return false;
				break;
			}
		}
		var year = _id.substr(6, 2);
		var month = _id.substr(8, 2);
		var day = _id.substr(10, 2);
		//校验年份位
		if (year < '01' || year > '90') return false;
		//校验月份
		if (month < '01' || month > '12') return false;
		//校验日
		if (day < '01' || day > '31') return false;
		return true;
	};

	/**
	 * boolean String.isChineseIdentifyNo18()
	 * 验证中国居民18位身份证号码是否合法
	 * 返回：合法返回true,不合法返回false
	 */
	function isChineseIdentifyNo18(str) {
		var powers = new Array("7", "9", "10", "5", "8", "4", "2", "1", "6", "3", "7", "9", "10", "5", "8", "4", "2");
		var parityBit = new Array("1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2");

		var _id = str;
		var _num = _id.substr(0, 17);
		var _parityBit = _id.substr(17);
		var _power = 0;
		for (var i = 0; i < 17; i++) {
			//校验每一位的合法性
			if (_num.charAt(i) < '0' || _num.charAt(i) > '9') {
				return false;
				break;
			} else {
				//加权
				_power += parseInt(_num.charAt(i)) * parseInt(powers[i]);
			}
		}
		//取模
		var mod = parseInt(_power) % 11;
		if (_parityBit == "X") _parityBit = _parityBit.toLocaleUpperCase();
		if (parityBit[mod] == _parityBit) {
			return true;
		}
		return false;
	};

	/**
	 * 验证form
	 * @param  {[type]} $form  [description]
	 * @param  {[type]} _$form [description]
	 * @return {[type]}        [description]
	 */
	var validForm = function($form, _$form) {
		_$form = _$form || $form;
		var result = true;
		var isFocus = false;
		$("[valid]",$form).each(function() {
			var $this = $(this);
			if ($this.is(":visible")) {
				result = $this.valid(_$form) && result;
				if (!result && !isFocus) {
					isFocus = focusErr($this);
				}
			} else {
				if($this.attr('valid-hide') != undefined) {
					result = $this.valid(_$form) && result;
					if (!result && !isFocus) {
						isFocus = focusErr($this);
					}
				}
			}
		});
		return result;
	}

	exports.createTipsyErr = createTipsyErr;
	exports.removeErrorMsg = removeErrorMsg;
	exports.focusErr = focusErr;
	exports.isValidError = isValidError;
	exports.isChineseIdentifyNo15 = isChineseIdentifyNo15;
	exports.isChineseIdentifyNo18 = isChineseIdentifyNo18;
	exports.validForm = validForm;
	exports.showErr = function(obj, msg, focus) {
		if(typeof focus != 'undefined') {
			focus = !focus;
		} else {
			focus = false;
		}
		obj.attr("valid-msg-text", msg);
		var options = obj.attr("valid-msg-options") == null ? {} : $.parseJSON(obj.attr("valid-msg-options"));
		$.extend(options, {
			show: true,
			unFocus: focus
		});
		createTipsyErr(obj, options);
	};
});
