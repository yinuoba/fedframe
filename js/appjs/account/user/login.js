define(function(require, exports, module) {
  var ajaxForm = require('ajaxform/ajaxform');
  var ghostText = require('ghosttext/ghosttext');

  var $form = $('form#formId_Account_User_login');
  var $tipsBlock = $('div#tipsBlock');

  window.ajaxAfter_Account_User_login = function(json) {
    if (json.boolen == 1) {
      location.href = json.data;
    } else {
      $tipsBlock.find('span').html(json.message);
      $tipsBlock.show();
    }
  }

  // 初始化表单（ajax提交及验证）
  ajaxForm.init();

  // 初始化表单提示信息
  ghostText.init();

  // 点击刷新验证码
  $('#refreshVerifyCode, img#VerifyCodeImg').click(function() {
    var $verifyImg = $('img#VerifyCodeImg');
    var src = $verifyImg.attr('src');
    if (typeof src === 'string' && src.indexOf('?') !== -1) {
      var indexSrc = src.indexOf('?');
      src = src.slice(0, indexSrc);
    }
    // 每点击一次，更新一下图片
    var newSrc = src + '?version=' + (new Date()).getTime();
    $verifyImg.attr('src', newSrc);
  });

});