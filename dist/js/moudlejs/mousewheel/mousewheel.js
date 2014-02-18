/*! fedframe - v0.1.0 
* https://www.yrz.cn/
* Copyright (c) 2014 Front-End development team of UPG Cloud Financing Department; Licensed MIT */
define("mousewheel/mousewheel",[],function(){function a(a){var f=a||window.event,g=h.call(arguments,1),i=0,j=0,k=0,l=0;if(a=$.event.fix(f),a.type="mousewheel","detail"in f&&(k=-1*f.detail),"wheelDelta"in f&&(k=f.wheelDelta),"wheelDeltaY"in f&&(k=f.wheelDeltaY),"wheelDeltaX"in f&&(j=-1*f.wheelDeltaX),"axis"in f&&f.axis===f.HORIZONTAL_AXIS&&(j=-1*k,k=0),i=0===k?j:k,"deltaY"in f&&(k=-1*f.deltaY,i=k),"deltaX"in f&&(j=f.deltaX,0===k&&(i=-1*j)),0!==k||0!==j){if(1===f.deltaMode){var m=$.data(this,"mousewheel-line-height");i*=m,k*=m,j*=m}else if(2===f.deltaMode){var n=$.data(this,"mousewheel-page-height");i*=n,k*=n,j*=n}return l=Math.max(Math.abs(k),Math.abs(j)),(!e||e>l)&&(e=l,c(f,l)&&(e/=40)),c(f,l)&&(i/=40,j/=40,k/=40),i=Math[i>=1?"floor":"ceil"](i/e),j=Math[j>=1?"floor":"ceil"](j/e),k=Math[k>=1?"floor":"ceil"](k/e),a.deltaX=j,a.deltaY=k,a.deltaFactor=e,a.deltaMode=0,g.unshift(a,i,j,k),d&&clearTimeout(d),d=setTimeout(b,200),($.event.dispatch||$.event.handle).apply(this,g)}}function b(){e=null}function c(a,b){return j.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var d,e,f=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],g="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],h=Array.prototype.slice;if($.event.fixHooks)for(var i=f.length;i;)$.event.fixHooks[f[--i]]=$.event.mouseHooks;var j=$.event.special.mousewheel={version:"3.1.9",setup:function(){if(this.addEventListener)for(var b=g.length;b;)this.addEventListener(g[--b],a,!1);else this.onmousewheel=a;$.data(this,"mousewheel-line-height",j.getLineHeight(this)),$.data(this,"mousewheel-page-height",j.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var b=g.length;b;)this.removeEventListener(g[--b],a,!1);else this.onmousewheel=null},getLineHeight:function(a){return parseInt($(a)["offsetParent"in $.fn?"offsetParent":"parent"]().css("fontSize"),10)},getPageHeight:function(a){return $(a).height()},settings:{adjustOldDeltas:!0}};$.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});