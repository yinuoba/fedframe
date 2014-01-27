define(function(require, exports, module){
	var textLength = require('textlength/textlength');
	// require.async('./search.css');

	/**
	 * 高级搜索
	 * @param {Object} options 参数对象
	 * @param {Element} [options.searchBox=$('div#searchBox')] 整个搜索容器
	 * @param {Element} [options.complexSearchCustom=$('div[id^="complexSearch-custom-"]')] 列表搜索容器
	 * @param {Element} [options.complexSearchSelected=$('#complexSearch-selected')] 你已选择容器
	 * @param {Element} [options.checkedUl=$('.checkedOk>ul', _this.$complexSearchSelected)] 防止你已选择的各个项的ul容器
	 * @param {Element} [options.complexSearchMore=$('#complexSearch-more')] 显示更多
	 * @param {Element} [options.resetSelect=$('a[complexsearchreset="selected"]')] 重置筛选按钮
	 * @param {Element} [options.form=_this.$complexSearchCustom.closest('form')] 当前form
	 * @param {Boolean} [options.isShowExpend=true] optionlist中搜索项是否折叠，默认是true
	 * @param {Boolean} [options.showNoLimit=true] 是否创建不限按钮，默认是true
	 * @param {Number} [options.showListNum] 未点击显示更多时显示的数量
	 * @param {Number} [options.selectedLength=10] 已选文本的最长文本限制
	 * @param {Function} [options.selectedCallback=function(){}] 选完后的回调函数，默认为一空函数
	 * @param {Function} [options.resetOptions={}] 重置按钮的参数对象
	 */
	var Search = function(options){
		var _this = this;
		// 整个搜索容器
		_this.$searchBox = $(options.searchBox).length ? $(options.searchBox) : $('div#searchBox');

		// 找出所有列表搜索容器
		_this.$complexSearchCustom = $(options.complexSearchCustom).length ? $(options.complexSearchCustom) : $('div[id^="complexSearch-custom-"]');

		// 你已选择容器
		_this.$complexSearchSelected = $(options.complexSearchSelected).length ? $(options.complexSearchSelected) : $('#complexSearch-selected');
		// 放置你已选择的各个项的ul容器
		_this.$checkedUl = $(options.checkedUl).length ? $(options.checkedUl) : $('.checkedOk>ul', _this.$complexSearchSelected);

		// 显示更多
		_this.$complexSearchMore = $(options.complexSearchMore).length ? $(options.complexSearchMore) : $('#complexSearch-more');

		// 重置筛选
		_this.$resetSelect = $(options.resetSelect).length ? $(options.resetSelect) : $('a[complexsearchreset="selected"]');

		// 当前form
		_this.$form = $(options.form).length ? $(options.form) :_this.$complexSearchCustom.closest('form');

		// optionlist中搜索项是否折叠
		_this.isShowExpend = options.isShowExpend === false ? false : true;

		// 未点击显示更多时显示的数量
		_this.showListNum = options.showListNum || 3;

		// 已选文本的最长文本限制
		_this.selectedLength = options.selectedLength || 10;

		// 选中某一搜索条件后的回调函数
		_this.selectedCallback = options.selectedCallback || function(){};

		// 点重置的时候，添加的例外
		_this.resetOptions = options.resetOptions || {};

		_this.init();
	};

	Search.prototype = {
		constructor: Search,
		init: function(){
			var _this = this;

			// 循环所有的搜索类别
			_this.$complexSearchCustom.each(function(){
				var $this = $(this);
				// 某一搜索条件是否可以多选
				var multi = ($this.attr('multi') === 'false' || $this.attr('multi') === '0') ? false : true;
				var showNoLimit = ($this.attr('shownolimit') === 'false' || $this.attr('shownolimit') === '0') ? false : true;
				var noLimitLabel = $this.attr("nolimitlabel") || "不限";
				// 搜索类别标题
				var inputName = $this.attr('inputname');
				var $optionsTitle = $('div.optionsTitle', $this);
				var optionsTitle = $optionsTitle.attr('optionstitle');

				var $optionsList = $('div.optionsList', $this);
				var $list = $('ul>li>a', $optionsList);
				var $noLimitLi;

				// 创建 不限 按钮
				if(showNoLimit){
					$noLimitLi = _this.createNoLimitLi({inputName: inputName, optionsList: $optionsList, noLimitLabel: noLimitLabel});
					$('.optionsList>ul', $this).prepend($noLimitLi);
				}

				// 创建存储选项名称和选项值的数组
				var selectedLabelArr = [];
				var selectedValArr = [];
				$optionsList.data('selectedLabelArr', selectedLabelArr);
				$optionsList.data('selectedValArr', selectedValArr);

				// 遍历各个条件，处理选中的搜索项
				$.each($list, function(){
					var $a = $(this);
					var selected = $a.attr('selected');
					if(selected){
						_this.selected($a, {
							selectedLabelArr: selectedLabelArr,
							selectedValArr: selectedValArr,
							multi: multi,
							inputName: inputName,
							optionsList: $optionsList,
							optionsTitle: optionsTitle,
							noLimitLi: $noLimitLi
						});
					}
				});

				// 遍历各个条件，并给a添加事件
				$list.click(function(){
					_this.selected($(this), {
						selectedLabelArr: selectedLabelArr,
						selectedValArr: selectedValArr,
						multi: multi,
						inputName: inputName,
						optionsList: $optionsList,
						optionsTitle: optionsTitle,
						noLimitLi: $noLimitLi,
						clickSubmit: true
					});
				});

				// 展开 收缩
				_this.showExpend({optionsList: $optionsList, complexSearchCustom: $this});
			});

			_this.$form.submit();
			
			// 显示更多
			_this.showMore();

			// 重置筛选
			if(_this.$resetSelect && _this.$resetSelect.length){
				_this.$resetSelect.click(function(){
					_this.resetAll(_this.resetOptions);
				});
			}

		},
		createSelectedLi: function(obj){	// 创建已选择
			var _this = this;

			// 不能重置的搜索项数组
			var noResetNameArr = _this.resetOptions.noResetNameArr || [];

			var inputName = obj['inputName'];
			var label = obj['label'];
			var $optionsList = obj['optionsList'];
			var optionsTitle = obj['optionsTitle'];

			var $li = $('<li/>').attr('inputname', inputName);
			var $span = $('<span/>').attr({title: optionsTitle, textlength: _this.selectedLength});

			if($.inArray(inputName, noResetNameArr) === -1){
				var $close = $('<span/>').addClass('close');
			}

			// 取出已选数组
			var selectedLabelArr = $optionsList.data('selectedLabelArr');
			
			if(selectedLabelArr.length){
				var selectedStr;
				if(optionsTitle){	// 标题为空
					selectedStr = optionsTitle + '：' + selectedLabelArr.join('，');
				} else {
					selectedStr = selectedLabelArr.join('，');
				}
				$span.html(selectedStr);
			}
			// 限制字数
			textLength.init($span);

			if($.inArray(inputName, noResetNameArr) === -1){	// 可以重置的搜索项
				// 添加事件
				$close.click(function(){
					// 重置表单和样式
					_this.reset({inputName: inputName, optionsList: $optionsList});
				});

				$li.append($span).append($close);
			} else {
				$li.append($span);
			}

			return $li;
		},
		createInputs: function(obj){	// 根据已选定的值创建input
			var _this = this;
			var multi = obj['multi'];
			var inputName = multi ? obj['inputName'] + '[]' : obj['inputName'];
			var customId = obj['customId'];
			var $optionsList = obj['optionsList'];
			// 取出已选数组
			var selectedValArr = $optionsList.data('selectedValArr');
			if(selectedValArr.length){
				// 先移除之前的input
				$('input[name="' + inputName + '"]', _this.$form).remove();
				// 创建新的input
				$.each(selectedValArr, function(){
					var customId = this;
					_this.$form.prepend($('<input type="hidden" name="' + inputName + '" value="' + customId + '"/>'));
				});
			}
		},
		createNoLimitLi: function(obj){	// 创建不限li
			_this = this;
			var inputName = obj['inputName'];
			var $optionsList = obj['optionsList'];
			var noLimitLabel = obj['noLimitLabel'];

			var $li = $("<li/>");
			var $a = $('<a href="javascript:;" inputname="'+ inputName +'" nolimit="1" />').addClass("current");
			$a.html(noLimitLabel).click(function() {
				$(this).addClass("current");
				_this.reset({inputName: inputName, optionsList: $optionsList});
			});
			$li.append($a);
			return $li;
		},
		removeInputByName: function(inputName){	// 根据input的name移除input
			var _this = this;
			$('input[name^="' + inputName + '"]', _this.$form).remove();
		},
		showExpend: function(obj){	// 展开收起选项
			var _this = this;
			var $optionsList = obj['optionsList'];
			var $complexSearchCustom = obj['complexSearchCustom'];
			if(_this.isShowExpend){	// 需要展开
				var $closeShow = $('.closeShow', $complexSearchCustom);
				var $closeUp = $('.closeUp', $complexSearchCustom);
				var $closeDown = $('.closeDown', $complexSearchCustom);
				var oldHeight = $optionsList.height();

				// 检测当前搜索容器是否是可见状态
				var display = _this.$searchBox.is(':visible');

				if(!display){	// 如果本来是隐藏的，则先让它显示
					_this.$searchBox.show();
				}

				var firstTop = $("ul>li:first", $optionsList).offset().top;
				var lastTop = $("ul>li:last", $optionsList).offset().top;

				if(!display){	// 设会原来的状态
					_this.$searchBox.hide();
				}

				if (firstTop != lastTop) {	// 判断是否显示展开按钮
    			// 显示展开按钮
    			$closeShow.show();
    			// 给展开和收起添加时间
    			$closeDown.click(function(e){
    				var $target = $(e.target);
    				if($target.hasClass('closeShow') || $target.parent('.closeShow').length){	// 点击展开
    					$optionsList.css({height: "auto"});

    					$closeShow.hide();
    					$closeUp.show();
    				} else {	// 点击收缩
    					$optionsList.css({height: oldHeight + 'px'});

    					$closeShow.show();
    					$closeUp.hide();
    				}
    				return false;
    			});
    		}
			}
		},
		reset: function(obj){	//重置某一个搜索列表
			_this = this;
			var inputName = obj['inputName'];
			var $optionsList = obj['optionsList'];
			// 是否提交form
			var noSubmit = obj['noSubmit'];

			// 移出form中对应的input
			_this.removeInputByName(inputName);

			// 已选列表中删掉这一块
			_this.$checkedUl.find('li[inputname="' + inputName + '"]').remove();

			// 搜索列表中回归到不限
			$optionsList.find('a[nolimit="1"][inputname="' + inputName + '"]').addClass('current');
			$optionsList.find('a.as-selected').removeClass('as-selected');

			// 清空存放搜索列表的值和文本的数组
			$optionsList.data('selectedLabelArr').length = 0;
			$optionsList.data('selectedValArr').length = 0;

			// 重新提交form
			if(!noSubmit){
				_this.$form.submit();
			}
		},
		resetAll: function(options){	// 重置筛选
			var _this = this;
			var noResetNameArr = options.noResetNameArr || [];
			if(_this.$resetSelect.length){
				// 重置所有的搜索条件
				$optionsListArr = $('div.optionsList', _this.$complexSearchCustom);
				$optionsListArr.each(function(){
					var $optionsList = $(this);
					var inputName = $optionsList.attr('inputname');
					if($.inArray(inputName, noResetNameArr) === -1){
						_this.reset({inputName: inputName, optionsList: $optionsList, noSubmit: 1});
					}
				});
				// 重新提交form
				_this.$form.submit();
			}
		},
		showMore: function(){	// 显示更多 如果高级搜索项超过3项，则显示
			var _this = this;
			if(_this.$complexSearchMore.length && _this.$complexSearchCustom.length > 3){
				// 显示这一块节点
				_this.$complexSearchMore.show();

				var $more = $('span.down[more="1"]', _this.$searchBox);
				var $hide = $('span.down[hide="1"]', _this.$searchBox);
				var $down = $('span.down', _this.$searchBox);
				var doNum = _this.showListNum - 1;

				// 点击展开和收缩
				$down.click(function(e){
					var $target = $(e.target);
					if($target.hasClass('up')){	// 向上收起
						$more.show();
						$hide.hide();

						_this.$complexSearchCustom.filter(':lt(' + doNum + ')').show();
						_this.$complexSearchCustom.filter(':gt(' + doNum + ')').hide();
					} else {	// 显示更多
						$more.hide();
						$hide.show();

						_this.$complexSearchCustom.show();
					}
				});
			}
		},
		saveData: function(obj){	// 将值存到数组中
			var selectedLabelArr = obj.selectedLabelArr;
			var selectedValArr = obj.selectedValArr;
			var label = obj.label;
			var customId = obj.customId;
			var multi = obj.multi;

			if(selectedLabelArr.indexOf(label) === -1){
				if(!multi){	// 单选
					selectedLabelArr.length = 0;
				}
				selectedLabelArr.push(label);
			} else {
				return false;
			}

			if(selectedValArr.indexOf(customId) === -1){
				if(!multi){	// 单选
					selectedValArr.length = 0;
				}
				selectedValArr.push(customId);
			} else {
				return false;
			}
		},
		selected: function($a, params){
			var _this = this;
			var selectedLabelArr = params['selectedLabelArr'];
			var selectedValArr = params['selectedValArr'];
			var multi = params['multi'];
			var clickSubmit = params['clickSubmit'];
			var inputName = params['inputName'];
			var $optionsList = params['optionsList'];
			var optionsTitle = params['optionsTitle'];
			var $noLimitLi = params['noLimitLi'];

			// 取出a上的值
			var customId = $a.attr('customid');
			var label = $a.html();

			// 将值存到数组中
			_this.saveData({
				selectedLabelArr: selectedLabelArr,
				selectedValArr: selectedValArr,
				label: label,
				customId: customId,
				multi: multi
			});

			// 调整样式
			$a.addClass('as-selected');
			// 如果只能单选
			if(!multi){
				$a.parent().siblings().find('a').removeClass('as-selected');
			}
			if($noLimitLi && $noLimitLi.length){
				$noLimitLi.find('a[nolimit="1"]').removeClass('current');
			}

			// 创建input，塞到form中
			_this.createInputs({inputName: inputName, customId: customId, optionsList: $optionsList, multi: multi});

			// 创建li，塞到已选择中里面
			var $li = _this.createSelectedLi({inputName: inputName, label: label, optionsList: $optionsList, optionsTitle: optionsTitle});
			var $nowLi = _this.$checkedUl.find('li[inputname="' + inputName + '"]');

			if($nowLi.length){	// 已经选过了
				$nowLi.replaceWith($li);
			} else {
				_this.$checkedUl.append($li);
			}

			// 选完后的回调函数，参数为当前实例和params参数对象
			_this.selectedCallback.call($a, _this, params);

			if (clickSubmit) {
				_this.$form.submit();
			};
		}
	};

	exports.init = Search;
});