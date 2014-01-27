define(function(require, exports, module){
	require.async('popimage/popimage.css');
	;(function($, window, document, undefined) {
		/**
		 * 浏览图片弹出层，可支持拖拽
		 * @param  {Object} options 参数对象
		 * @param　{String} options.url 需浏览的图片的url
		 * @param　{String} [options.id] 用于控制弹出所有节点id的自定义id, 默认是当前时间戳, 最好是传图片名，防止dom被多次创建
		 * @param　{String} [options.containerClass] 最外层container的样式， 默认是'popImageWrapper'
		 * @param　{String} [options.closeClass] 关闭按钮的样式， 默认是'popImageClose'
		 * @param　{String} [options.imgClass] 图片的样式
		 * @param　{Boolean} [options.moveAble] 弹出层是否可拖拽，默认不可拖拽
		 * @return {[type]} null
		 */
		$.popImage =  function(options) {
			// 把图片的url、节点id、关闭按钮的class传进来
			var url = options.url,
				id = options.id || (new Date()).getTime(),
				containerClass = options.containerClass || 'popImageWrapper',
				closeClass = options.closeClass || 'popImageClose',
				imgClass = options.imgClass || '',
				moveAble = options.moveAble,
				isPrevNext = options.isPrevNext,
				isMask = options.isMask,
				isFootLabel = options.isFootLabel,
				prevClass = options.prevClass || '',
				nextClass = options.nextClass || '';

			// 根据url创建img
			var $imgObj = $('<img src="' + url + '"/>');

			// 如果创建过改容器，说明是第二次执行同一张图片
			if (!$('#container' + id).length) {
				// 创建div容器，并设置id和样式
				var $contentDiv = $("<div/>");
				$contentDiv.prop('id', 'container' + id);
				// 此时还没有设置宽度和高度
				$contentDiv.css({
					'position': 'absolute',
					'zindex': upgTool.getHighestZIndex(),
					'visibility': 'hidden'
				});
				$contentDiv.addClass(containerClass);

				// 创建关闭按钮
				var $closeDiv = $('<div/>');
				$closeDiv.prop('id', 'close' + id);
				$closeDiv.css({
					'position': 'absolute',
					'top': '50%',
					'left': '50%',
					'visibility': 'hidden'
				});
				$closeDiv.addClass(closeClass);

				// 底部图片说明
				if(isFootLabel){
					// 图片底部文本
					var imageArr = [], altArr = [];
					if(options.imageArr && options.imageArr.length){
						$.each(options.imageArr, function(){
							var $this = $(this);
							var srcStr = $this.attr('url');
							var altStr = $this.attr('alt');
							imageArr.push(srcStr);
							altArr.push(altStr);
						});
					}

					// 初始载入的图片的index
					var initIndex = $.inArray(url, imageArr);
					// 设置底部的文本
					function setFootLabel(initIndex){
						var nowNum = initIndex + 1;
						if(initIndex !== -1 && altArr[initIndex] && altArr[initIndex].length){
							$footLabel.html(altArr[initIndex] + ' (' + nowNum + '/' + imageArr.length + ')');
						}
					}

					var $footLabel = $('<p/>').attr({
						"id": "footLabel" + id
					});

					$footLabel.addClass("footLabel").css({
						"position": 'absolute',
						"bottom": 0,
						"left": 0,
						"opacity": "0.8",
						"zindex": upgTool.getHighestZIndex()
					});
					// 设置底部的文本
					setFootLabel(initIndex);

					$contentDiv.append($footLabel);
				}

				// 创建上一张、下一张
				if(isPrevNext && imageArr.length >= 2){ 
					var $prev = $('<span/>').addClass(prevClass).attr({id: 'prevImg' + id, title: "上一张"}).css({
						"position": "absolute",
						"top": "50%",
						"left": "1%",
						"zindex": upgTool.getHighestZIndex()
					}).append($('<em/>'));
					var $next = $('<span/>').addClass(nextClass).attr({id: 'nextImg' + id, title: "下一张"}).css({
						"position": "absolute",
						"top": "50%",
						"right": "1%",
						"zindex": upgTool.getHighestZIndex()
					}).append($('<em/>'));

					var initIndex = $.inArray(url, imageArr);

					// 设置初始透明度
					if(initIndex == 0){ 
						$prev.css({"opacity": "0.2"});
						$next.css({"opacity": "0.8"});
					} else if(initIndex == imageArr.length - 1){
						$prev.css({"opacity": "0.8"});
						$next.css({"opacity": "0.2"});
					} else {
						$prev.css({"opacity": "0.8"});
						$next.css({"opacity": "0.8"});
					}

					// 当前图片的索引
					function changeImg(type){	// url-图片的url type-是上一页还是下一页
						var currentIndex = $.inArray(url, imageArr);
						if(currentIndex == -1){
							return false;
						}

						if(type == 'prev'){ 	// 上一张
							if(currentIndex == 0){	// 第一张
								return false;
							} else {
								if(currentIndex == 1){
									$prev.css({"opacity": "0.2"});
								}
								$next.css({"opacity": "0.8"});
								url = imageArr[currentIndex - 1];
								// 设置底部文本
								if(isFootLabel){
									setFootLabel(currentIndex - 1);
								}
							}
						} else if(type == 'next'){	// 下一张
							if(currentIndex == imageArr.length - 1){ // 最后一张
								return false;
							} else {
								if(currentIndex == imageArr.length - 2){
									$next.css({"opacity": "0.2"});
								}
								$prev.css({"opacity": "0.8"});
								url = imageArr[currentIndex + 1];

								// 设置底部文本
								if(isFootLabel){
									setFootLabel(currentIndex + 1);
								}
							}
						}
						$imgObj.attr("src", url);
					}

					$prev.click(function(){
						changeImg('prev')
					});

					$next.click(function(){
						changeImg('next')
					});

					$contentDiv.append($prev);
					$contentDiv.append($next);
				}

				$contentDiv.append($imgObj);
				$contentDiv.append($closeDiv);

				$(document.body).append($contentDiv);

				if(isMask){
					var $maskLayer = $('<div/>').attr({"id": "maskLayer" + id}).addClass("mask");
					$(document.body).append($maskLayer);
				}

				// 载入图片，并在载入图片后获取图片大小等
				var loadFun = function() {
					// 计算出图片的大小和关闭按钮的大小
					var width = $imgObj.width(),
						height = $imgObj.height();
					var closeWidth = $closeDiv.width(),
						closeHeight = $closeDiv.height();
					if (width > 0) {
						// 获取到图片的宽高后设置容器的框高
						$contentDiv.css({
							'width': width,
							'height': height,
							'left': '50%',
							'top': ($(window).scrollTop() + $(window).height()/2) + 'px',
							'marginLeft': '-' + width / 2 + 'px',
							'marginTop': '-' + height / 2 + 'px',
							'cursor': 'move',
							'visibility': 'visible'
						});
						$closeDiv.css({
							'visibility': 'visible',
							'cursor': 'pointer',
							'marginLeft': width / 2 - closeWidth / 2 + 'px',
							'marginTop': '-' + height / 2 - closeHeight / 2 + 'px',
							'zindex': upgTool.getHighestZIndex()
						});
					}
				}

				// 图片载入后执行回调，防止图片大小计算错误
				if(window.attachEvent){
					// IE
					$imgObj[0].onreadystatechange = function(){
						if(this.readyState == 'complete'){
							loadFun();
						}
					};
				} else {
					// IE以外浏览器
					$imgObj[0].onload = function() {
						if(this.complete == true){
							loadFun();
						}
					}
				}
				
				$(window).resize(loadFun);

				// 关闭弹出图片
				$closeDiv.click(function() {
					$contentDiv.hide();
					if(isMask){
						$maskLayer.hide();
					}
				});

				// 如果可拖拽，则添加相关时间
				if (moveAble) {
					// 给弹出层添加移动事件
					$contentDiv.mousedown(function(e) {
						var $this = $(this);
						// 计算鼠标当前位置距离contentDiv的left和top
						var innerLeft = e.pageX - $this.offset().left,
							innerTop = e.pageY - $this.offset().top;
						// 标记鼠标已按下
						var isClick = true;
						// 添加鼠标移动事件
						$contentDiv.unbind('mousemove').mousemove(function(dragE) {
							// 判断鼠标还是按下状态
							if (isClick) {
								var popML = parseInt($this.css('marginLeft')),
									popMT = parseInt($this.css('marginTop'));

								// 计算距离横向和纵向的值
								var toLeftVal = dragE.pageX - innerLeft - popML,
									toTopVal = dragE.pageY - innerTop - popMT;

								$this.css({
									left: toLeftVal + 'px',
									top: toTopVal + 'px'
								});

								// 弹出层超出边界时的处理方法
								// 如果滚动条已经超出了内容的左边，停止
								if (toLeftVal < 0) {
									$this.css({
										left: 0
									});
								}
								// 如果滚动条已经超出了内容的上边，停止
								if (toTopVal < 0) {
									$this.css({
										top: 0
									});
								}
							}
							return false;
						})

						$contentDiv.unbind('mouseup').mouseup(function(upE) {
							// 如果鼠标已弹起，则标记为false
							isClick = false;
							return false;
						});
						// 防止事件冒泡和默认事件
						return false;
					})
				}
			} else {
				$('#container' + id).show();
			}
		}
	})(jQuery, window, document);
	exports.popImage = $.popImage;
});