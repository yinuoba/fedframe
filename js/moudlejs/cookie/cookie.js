define(function(require, exports, module) {
  /**
   * @description 取得cookie值
   * @param {String} sName  cookie名称
   * @return {String} cookie值
   * @example getCookie('ECS[user_id]');
   */
  var getCookie = function(sName) {
    // 将cookie字符串用'；'分割成数组
    var aCookie = document.cookie.split("; "),
      length = aCookie.length;
    for (var i = 0; i < length; i++) {
      // 将键值对用'='隔开
      var aCrumb = aCookie[i].split("=");
      // 如果找到了这个cookie名称，则返回cookie的值
      if (sName == aCrumb[0]) return decodeURIComponent(aCrumb[1]);
    }
    // 没有此cookie
    return null;
  };

  /**
   * @description 设置cookie值
   * @param {String} sName  cookie名称
   * @param {String} sValue cookie值
   * @param {Date} [sExpires] 过期时间，可选参数
   * @example setCookie('displayNotice', '1', new Date(nextDay));
   */
  var setCookie = function(sName, sValue, sExpires) {
    var sCookie = sName + "=" + encodeURIComponent(sValue);
    if (sExpires != null && (sExpires instanceof Date)) {
      sCookie += "; expires=" + sExpires.toGMTString();
    }
    document.cookie = sCookie;
  };

  /**
   * @description 删除cookie值
   * @param {String} sName  cookie名称
   * @example removeCookie('displayNotice')
   */
  var removeCookie = function(sName) {
    document.cookie = sName + "=; expires=Fri, 31 Dec 1999 23:59:59 GMT;";
  };

  // 到处模块接口
  exports.getCookie = getCookie;
  exports.setCookie = setCookie;
  exports.removeCookie = removeCookie;
});