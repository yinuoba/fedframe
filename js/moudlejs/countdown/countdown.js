define(function(require, exports, module) {
/** 
 * Copyright (c) 2013, All rights reserved.
 *
 * @fileOverview countDown time
 * @version 1.0
 * @author <a href="mailto:zeng.xianghu@hotmail.com">Hoogle</a>、<a href="http://weibo.com/yinuoba">新浪微博(一诺吧)</a>)
 * 
 * @description 倒计时
 * @extends countDown(options) 倒计时
 * @description 倒计时
 * @param {String} [options.tian] 存放天的选择器 形式如'#tian' (可选参数) 如果不需要显示天，可直接不传入这一参数
 * @param {String} [options.shi] 存放小时的选择器 形式如'#shi'
 * @param {String} [options.fen] 存放分钟的选择器 形式如'#fen'
 * @param {String} [options.miao] 存放秒的选择器 形式如'#miao'  (可选参数)如果不需要显示秒，则直接不传入这一参数
 * @param {Date} [options.Date] toDate 截止日期
 * @param {Number} [options.inner] 结束时间戳与当前戳之差
 * @param {Function} [options.callback] 没执行一次倒计时执行一次的方法
 * @param {Function} [options.endFun] 倒计时完毕后的回调函数
 * @param {Boolean} [options.hasUnit] 是否带时分秒的单位
 * @example 
 * countDown.init({
       tian: '#tian',
       shi: '#shi',
       fen: '#fen',
       miao: '#miao',
       toDate: new Date('2012/03/30 23:59:59')
   })
   countDown.init({
       tian: '#tian',
       shi: '#shi',
       fen: '#fen',
       miao: '#miao',
       inner: 30000
   })
 */

  var countDown = function(options) {
    var toDate = options.toDate,
      tian = options.tian,
      shi = options.shi,
      fen = options.fen,
      miao = options.miao,
      inner = options.inner,
      callback = options.callback || function(){},
      endFun = options.endFun || function() {},
      hasUnit = options.hasUnit;
      countType = options.countType;
    var tick2;
    // 找出天、时、分、秒节点
    var tianObj = tian != null ? $(tian)[0] : null,
      shiObj = shi != null ? $(shi)[0] : null,
      fenObj = fen != null ? $(fen)[0] : null,
      miaoObj = miao != null ? $(miao)[0] : null;

    var tianUnit = '', shiUnit = '', fenUnit = '', miaoUnit = '';
    if(hasUnit){
      tianUnit = '天';
      shiUnit = '时';
      fenUnit = '分';
      miaoUnit = '秒';
    }
    // 倒计时处理方法
    var countTime = function(inner) {

      // today 现在时间,new Date()
      // innerTime 截止时间与现在时间的时间轴的差
      // sectimeOld 截止时间与现在时间之间的秒数
      // secondSold 截止时间与现在时间之间的秒数(整数)
      // msPerDay 一天的总秒数
      // e_daysold 剩余的天数
      // daysold 剩余的天数（整数）
      // e_hrsold 剩余天数以外的小时数
      // hrsold 剩余天数以外的小时数(整数)
      // e_minsold 剩余分数
      // minsold 剩余分数(整数)
      // seconds 得到尾剩余秒数(整数)

      // 根据不同的参数，计算时间差
      if (inner != null) {
        var innerTime = inner
      } else {
        var innerTime = toDate.getTime() - FS.now()
      }

      var sectimeOld = innerTime / 1000, //剩余总秒数
        secondSold = Math.floor(sectimeOld), //秒数取整
        msPerDay = 24 * 60 * 60 * 1000, //一天的毫秒数
        e_daysold = innerTime / msPerDay, // 剩余天数
        daysold = Math.floor(e_daysold), // 剩余天数取整
        e_hrsold = (e_daysold - daysold) * 24, // 除去天后的剩余小时数
        hrsold = Math.floor(e_hrsold),
        e_minsold = (e_hrsold - hrsold) * 60,
        minsold = Math.floor((e_hrsold - hrsold) * 60),
        seconds = Math.round((e_minsold - minsold) * 60);

      callback({
        daysold: daysold,
        hrsold: hrsold,
        minsold: minsold,
        seconds: seconds,
        innerTime: innerTime,
        params: options
      });

      // 如果已经到期了，则都显示为0，并且不再执行
      if (innerTime <= 0) {
        if(!hasUnit){
          if (tian !== undefined && tianObj) {
            tianObj.innerHTML = '0';
          }
          if (shi !== undefined && shiObj) {
            shiObj.innerHTML = '0';
          }
          if (fen !== undefined && fenObj) {
            fenObj.innerHTML = '0';
          }
          if (miao !== undefined && miaoObj) {
            miaoObj.innerHTML = '0';
          }
        } else {
          if (miao !== undefined && miaoObj) {
            miaoObj.innerHTML = '0秒';
          }
        }
        endFun(options);
        // 阻止定时器继续执行
        return false;
      } else {
        // 小于2位数，则十位补0
        if (tian !== undefined && tianObj && daysold < 10) {
          daysold = '0' + daysold;
        }
        if (hrsold < 10) {
          hrsold = '0' + hrsold;
        }
        if (minsold < 10) {
          minsold = '0' + minsold;
        }
        if (seconds < 10) {
          seconds = '0' + seconds;
        }
      }
      // 给天、时、分、秒的DOM设置值
      if (tian != null && tianObj) {
        if(parseInt(daysold, 10)){
          tianObj.innerHTML = (daysold < 10 ? '0' + daysold : daysold) + tianUnit
        } else {
          tianObj.innerHTML = ''
        }
      }
      if (shi != null && shiObj) {
        shiObj.innerHTML = hrsold + shiUnit;
        if (tian == null) {
          var shiTemp = 24 * parseInt(daysold, 10) + parseInt(hrsold, 10);
          shiObj.innerHTML = (shiTemp < 10 ? '0' + shiTemp : shiTemp) + shiUnit
        }
      }
      if (fen != null && fenObj) {
        fenObj.innerHTML = minsold + fenUnit;
        if (tian == null && shi == null) {
          var fenTemp = parseInt(daysold, 10) * 24 * 60 + parseInt(hrsold, 10) * 60 + parseInt(minsold, 10);
          fenObj.innerHTML = (fenTemp < 10 ? '0' + fenTemp : fenTemp) + fenUnit
        }
      }
      if (miao != null && miaoObj) {
        miaoObj.innerHTML = seconds + miaoUnit;
        if (tian == null && shi == null && fen == null) {
          miaoObj.innerHTML = sectimeOld + miaoUnit
        }
      }
    }

    // 函数内部不断自调用
    tick2 = window.setInterval(function(){
      if (inner >= 0) {
        countTime(inner);
        if(!countType){
          inner -= 1000;
        } else {
          inner += 1000
        }
      }
    }, 1000);
  };

  exports.init = countDown;

});