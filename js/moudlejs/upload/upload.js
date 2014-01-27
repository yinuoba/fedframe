define(function(require, exports, module){
	require.async('./upload.css');
	require('ajaxform/ajaxform');
	/**
	 * 针对证据上传文件
	 * @namespace jQuery
	 * @constructor addAttach
	 * @param  {[type]} options 参数对象
	 * @param {Element} [options.uploadBtn] 上传按钮
	 * @param {String} [options.btnWidth = '30px'] 上传按钮的长度，默认是30px
	 * @param {String} [options.uploadService] 文件上传的服务
	 * @param {Object} [options.uploadParams] 上传文件的服务所需要的参数
	 * @param {Function} [options.uploadSuccessFun = _this.defaultSuccess] 文件上传到服务器后的回调函数,这个是自定义的回调函数，默认是defaultSuccess
	 * @param {Boolean} [options.debug] 是否开启调试模式
	 * @return {[type]}         [description]
	 */
	var Upload = function(options){
		var _this = this;
		_this.uploadBtn = options.uploadBtn;
		_this.btnText = options.btnText || '上传';
		_this.btnWidth = options.btnWidth || $(_this.uploadBtn).width() + 'px';
		_this.btnHeight = options.btnHeight || $(_this.uploadBtn).height() + 'px';
		_this.uploadService = options.uploadService;
		_this.uploadParams = options.uploadParams;
		_this.uploadBeforeFun = options.uploadBeforeFun || function(){};
		_this.uploadSuccessFun = options.uploadSuccessFun;
		_this.uploadErrorFun = options.uploadErrorFun || function(){};
		_this.debug = options.debug;
		_this.init();
	}

	Upload.prototype = {
		constructor: Upload,
		init: function(){
			var _this = this;
			if(!_this.uploadBtn){
				_this.console('实例化时的参数异常！');
				return false;
			}
			_this.updateBtn();
		},
		updateBtn: function(){	// 更新上传按钮
			var _this = this;
			var $uploadBtn = _this.uploadBtn;
			$uploadBtn.css({position: 'relative', overflow: 'hidden', width: _this.btnWidth, height: _this.btnHeight, textAlign: 'center'});
			var $inputFile = _this.createFileInput();
			$uploadBtn.html(_this.btnText).append($inputFile);
		},
		createFileInput: function(){	// 创建上传按钮
			var _this = this;
			var $inputFile = $('<input/>').attr({name: 'publicUpload', type: 'file', id: 'uploadFile', now: (new Date()).getTime()});
			$inputFile.css({position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', width: _this.btnWidth, height: _this.btnHeight, overflow: 'hidden'});
			$inputFile.change(function(){
				var $this = $(this);
				_this.upload($this);
			});
			return $inputFile;
		},
		upload: function(inputObj){
			var _this = this;
			var $inputFile = $(inputObj);
			// 获取文件类型并创建input
			var attach_type = _this.getDocType($inputFile);
			if(!attach_type){
				_this.console('请传入合法的文件！');
				return false;
			}
			var $attach_type = $('<input/>').attr({name: 'attach_type', type: 'hidden', value: attach_type});
			$('form#publicAttachUploadForm').remove();
			// 动态创建form
			var $form = $("<form/>").attr("id", "publicAttachUploadForm").attr("enctype", "multipart/form-data").attr("method", "post").attr("action", _this.uploadService).hide();
			$form.append($inputFile).append($attach_type);
			// 把上传参数整到form中的input里面去
			for(var param in _this.uploadParams){
				if(_this.uploadParams.hasOwnProperty(param)){
					$form.append('<input type="hidden" name="' + param + '" value="' + _this.uploadParams[param] + '" />')
				}
			}
			// ajax提交form的参数
			var uploadOpt = {
				beforeSubmit: _this.uploadBeforeFun.bind(_this),
				error: _this.uploadErrorFun.bind(_this),
				success: _this.success.bind(_this)
			};
			$form.appendTo('body').submit(function(){
				$(this).ajaxSubmit(uploadOpt);
				return false;
			});
			// 提交form，并在提交之后移除
			$form.submit();
		},
		success: function(json){	// 上传成功后的回调函数
			var _this = this;
			// 重置上传file文本框的value
			_this.updateBtn();
			if(!json){
				_this.console("服务端未返回相关附件信息！");
				return false;
			}
			if(_this.uploadSuccessFun){	// 如果有自定义的上传成功回调，则执行自定义的
				_this.uploadSuccessFun.call(_this, json);
				return;
			}
		},
		resizePop: function(obj){	// 重置弹窗
			var $this = $(obj);
		  if($this.parents('#colorbox').length){
		    $.colorbox.resize()
		  } else if($this.parents('#box2').length){
		    $.box2.resize()
		  } else if($this.parents('#box3').length){
		    $.box3.resize()
		  }
		},
		getDocType: function(inputObj){
			var _this = this;
			var $inputFile = $(inputObj);
			var filepath = $inputFile.val();
			// 各种文件类型的后缀名
			var imgType = 'jpg,gif,png,jpeg';
			var fileType = 'bmp,zip,rar,doc,xls,ppt,docx,xlsx,pptx,pdf,txt,html,htm,wps,et,dps';
			var soundType = 'mp3,wma,flac,aac,mmf,amr,m4a,m4r,ogg,mp2,wav,wv';
			var mediaType = 'ra,wma,mp4,mp3,rm,rmvb,wmv,mov';
			// 把各种文件类型放到对象中
			var typeObj = {
				"img": imgType,
				"file": fileType,
				"sound": soundType,
				"media": mediaType
			}
			// 获取文件的后缀
			var fileSuffix = filepath.slice(filepath.lastIndexOf('.') + 1).toLowerCase();
			var attach_type = false;
			for(var type in typeObj){
				if(typeObj.hasOwnProperty(type) && typeObj[type].indexOf(fileSuffix) !== -1){
					attach_type = type;
					break;
				}
			}
			return attach_type;
		},
		console: function(msg){	// 输出错误信息到错误控制台
			var _this = this;
			if(window.console && _this.debug){
				console.error(msg);
			}
		}
	};

	exports.init = Upload;
});