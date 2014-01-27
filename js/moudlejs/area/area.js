define(function(require, exports, module) {
	(function($) {
		/**
		 * [acCity description] 选择区域
		 * @param  {[type]} options [description]
		 * @param  {Boolean} [options.noSelectedOption = false] 出来的省市下拉option中是否包含请选择这一空项，默认为false
		 * @return {[type]}         [description]
		 */
		$.acCity = $.fn.acCity = function(options) {
			var defaultSetting = {
				url: "/index.php/Financing/CorpFinancing/api_area_by_cname",
				onSelect: false,
				onOpen: false,
				defaultVal: {
					"province": "1013",
					"city": "1014",
					"area": "0"
				},
				fieldName: {
					"province_id": "province_id",
					"city_id": "city_id",
					"dict_area_id": "dict_area_id"
				},
				noSwitch: false,
				startupSwitch: false,
				maxSwitchAreaType: 4,
				switchAreaTypeRequiredLevel: 2,
				noSelectedOption: false
			}, setting;

			var _this = this;
			var $this = $(this);
			options = options || {};
			setting = $.extend({}, defaultSetting, options);
			var customInput = false;

			var $country_id = $('<input name="country_id" type="hidden" value="1"/>');
			var $province_id = $('<input name="' + setting.fieldName.province_id + '" type="hidden"/>');
			var $city_id = $('<input name="' + setting.fieldName.city_id + '" type="hidden"/>');
			var $dict_area_id = $('<input name="' + setting.fieldName.dict_area_id + '" type="hidden"/>');
			var $area_country = $('<input name="area_country" type="hidden" value="中国"/>');
			var $area_province = $('<input name="area_province" type="hidden"/>');
			var $area_city = $('<input name="area_city" type="hidden"/>');
			var $area_dict_area = $('<input name="area_dict_area" type="hidden"/>');

			if ($this.siblings("input[name='country_id']").length) {
				$country_id = $this.siblings("input[name='country_id']");
				customInput = true;
			}
			if ($this.siblings("input[name='" + setting.fieldName.province_id + "']").length) {
				$province_id = $this.siblings("input[name='" + setting.fieldName.province_id + "']");
				customInput = true;
			}
			if ($this.siblings("input[name='" + setting.fieldName.city_id + "']").length) {
				$city_id = $this.siblings("input[name='" + setting.fieldName.city_id + "']");
				customInput = true;
			}
			if ($this.siblings("input[name='" + setting.fieldName.dict_area_id + "']").length) {
				$dict_area_id = $this.siblings("input[name='" + setting.fieldName.dict_area_id + "']");
				customInput = true;
			}
			if ($this.siblings("input[name='area_country']").length) {
				$area_country = $this.siblings("input[name='area_country']");
				customInput = true;
			}
			if ($this.siblings("input[name='area_province']").length) {
				$area_province = $this.siblings("input[name='area_province']");
				customInput = true;
			}
			if ($this.siblings("input[name='area_city']").length) {
				$area_city = $this.siblings("input[name='area_city']");
				customInput = true;
			}
			if ($this.siblings("input[name='area_dict_area']").length) {
				$area_dict_area = $this.siblings("input[name='area_dict_area']");
				customInput = true;
			}

			var $selectProvince = $('<select/>').addClass("input_common mr10").css("width", "80px").attr("areaType", "2");
			var $selectCity = $('<select/>').addClass("input_common mr10").css("width", "80px").attr("areaType", "3");
			var $selectArea = $('<select/>').addClass("input_common").css("width", "80px").attr("areaType", "4");
			if (setting.maxSwitchAreaType < 4) {
				$selectArea.hide();
			}

			$this.bind("blur.acCity", function() {
				if ($this.val().length == 0) {
					$province_id.val("");
					$area_province.val("");
					$city_id.val("");
					$dict_area_id.val("");
					$area_city.val("");
					$area_dict_area.val("");
				}
				// wait after filling data
				setTimeout(function() {
					if (!$dict_area_id.val()) {
						$this.val("").trigger("change").autocomplete("search", "");
					}
				}, 200);
			});

			if (setting.noSwitch) {
				setting.url = setting.url + "&noSwitch=1";
			}

			$this.autocomplete({
				source: setting.url,
				autoFocus: true,
				search: function(event, ui) {
					$province_id.val("");
					$area_province.val("");
					$city_id.val("");
					$dict_area_id.val("");
					$area_city.val("");
					$area_dict_area.val("");
				},
				select: function(event, ui) {
					if (ui.item.value == "-1") {
						// 异步执行，防止第一次点击的时候不执行
						setTimeout(_this.switchCitySearch, 0);
					} else if (ui.item.value == "-2") {
						// not found, but no switch
					} else {
						$this.val(ui.item.city_name);
						$country_id.val(ui.item.country_id);
						$province_id.val(ui.item.province_id);
						$city_id.val(ui.item.city_id);
						$area_country.val(ui.item.country_name);
						$area_province.val(ui.item.province_name);
						$area_city.val(ui.item.city_name);
						if (ui.item.area_id) {
							$dict_area_id.val(ui.item.area_id);
							$area_dict_area.val(ui.item.area_name);
							$this.val(ui.item.city_name + ui.item.area_name);
						}
					}

					if (setting.onSelect) {
						var onSelect = setting.onSelect;
						onSelect = window[setting.onSelect];
						if (typeof onSelect === "function") {
							onSelect(ui.item, $this, event);
						}
					}

					return false;
				},
				open: function(event, ui) {
					$this.autocomplete("widget").css("zIndex", upgTool.getHighestZIndex() + 1);
					if (setting.onOpen) {
						var onOpen = setting.onOpen;
						onOpen = window[setting.onOpen];
						if (typeof onOpen === "function") {
							onOpen(event, $this.autocomplete("widget"), $this);
						}
					}
				}
			});

			if (!customInput) {
				$this.after($country_id).after($province_id).after($city_id).after($dict_area_id).after($area_country).after($area_province).after($area_city).after($area_dict_area);
			}

			_this.switchCitySearch = function() {
				upgTool.removeErrorMsg($this);
				$selectProvince.add($selectCity).change(function() {
					var $selObj = $(this);
					_this.fillValueFromSelect($selObj);
					_this.getNextArea($selObj.val(), $selObj.attr("areaType"));
				});
				$selectArea.change(function() {
					_this.fillValueFromSelect($(this));
				})
				$this.replaceWith($selectProvince);
				$selectProvince.after($selectArea).after($selectCity);
				_this.getNextArea(1, 1, true);
			}

			_this.fillValueFromSelect = function($obj) {
				var areaType = $obj.attr("areaType");
				var val = $obj.val();
				var txt = val ? $("option:selected", $obj).text() : "";
				if (areaType == "2") {
					$province_id.val(val);
					$area_province.val(txt);
					$city_id.val("");
					$dict_area_id.val("");
					$area_city.val("");
					$area_dict_area.val("");
				} else if (areaType == "3") {
					$city_id.val(val);
					$area_city.val(txt);
					$dict_area_id.val("");
					$area_dict_area.val("");
				} else if (areaType == "4") {
					$dict_area_id.val(val);
					$area_dict_area.val(txt);
				}
			}

			_this.getNextArea = function(id, areaType, init) {
				$("option", $selectArea).remove();
				if (areaType <= 2) {
					if (setting.switchAreaTypeRequiredLevel <= 2) {
						$("option:gt(0)", $selectCity).remove();
					} else {
						$("option", $selectCity).remove();
					}
				}
				if (areaType <= 1) {
					if (setting.switchAreaTypeRequiredLevel <= 1) {
						$("option:gt(0)", $selectProvince).remove();
					} else {
						$("option", $selectProvince).remove();
					}
				}
				var $whichSelect = $selectProvince;
				var defaultSelectId = setting.defaultVal.province;
				if (setting.noSelectedOption && $("option", $whichSelect).length == 0) {
					$whichSelect.append("<option value=''>---省---</option>");
				}
				if (areaType == 2) {
					$whichSelect = $selectCity;
					if (setting.noSelectedOption && $("option", $whichSelect).length == 0) {
						$whichSelect.append("<option value=''>---市---</option>");
					}
					defaultSelectId = setting.defaultVal.city;
				} else if (areaType == 3) {
					$whichSelect = $selectArea;
					if (setting.noSelectedOption && $("option", $whichSelect).length == 0) {
						$whichSelect.append("<option value=''>---区域---</option>");
					}
					defaultSelectId = setting.defaultVal.area;
				}
				if (areaType == 2) {
					if ($("option", $whichSelect).length == 0 && setting.switchAreaTypeRequiredLevel <= 2) {
						$whichSelect.append('<option value="">---市---</option>');
					}
				}
				if (areaType == 3) {
					if ($("option", $whichSelect).length == 0 && setting.switchAreaTypeRequiredLevel <= 3) {
						$whichSelect.append('<option value="">---区域---</option>');
					}
				}
				if (id) {
					$.post("/index.php/Financing/CorpFinancing/api_area_by_code", {
						id: id,
						area_type: areaType
					}, function(json) {
						if (json.boolen == "1") {
							var areas = json.data;
							$.each(areas, function() {
								var $option = $("<option/>").attr("title", this.name_cn).text(this.name_cn).attr("value", this.id);
								$whichSelect.append($option);
								if (this.id == defaultSelectId) {
									$option.prop("selected", true);
								}
								_this.fillValueFromSelect($whichSelect);
							});
							if (areaType <= 2) {
								if (init) {
									id = defaultSelectId;
								} else {
									if (setting.switchAreaTypeRequiredLevel > areaType) {
										id = $whichSelect.val();
									}
								}
								_this.getNextArea(id, parseInt(areaType) + 1, init);
							}
						}
					}, 'json');
				}
			}

			if (options.defaultVal || options.startupSwitch) {
				_this.switchCitySearch();
			}
		};
	})(jQuery);

	function initAcCity() {
		$("[area]").each(function() {
			var $this = $(this);
			if (!$this.data("initArea")) {
				$this.data("initArea", "1");
				var onSelect = $this.attr("area-select");
				var onOpen = $this.attr("area-open");
				var options = $this.attr("area-options") || {};
				options = $.parseJSON(options) || {};
				if (onSelect) {
					options.onSelect = onSelect;
				}
				if (onOpen) {
					options.onOpen = onOpen;
				}
				$this.acCity(options);
			}
		});
	}

	exports.init = initAcCity;
});