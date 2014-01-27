/*! upgF2E - v0.1.0 
* https://www.yrz.cn/
* Copyright (c) 2014 Front-End development team of UPG Cloud Financing Department; Licensed MIT */
define("hoverdelay/hoverdelay",[],function(){!function(a){a.fn.hoverDelay=function(b){var c,d,e={hoverDuring:200,outDuring:200,hoverEvent:function(){a.noop()},outEvent:function(){a.noop()}},f=a.extend(e,b||{}),g=this;return a(this).each(function(){a(this).hover(function(){clearTimeout(d),c=setTimeout(function(){f.hoverEvent.apply(g)},f.hoverDuring)},function(){clearTimeout(c),d=setTimeout(function(){f.outEvent.apply(g)},f.outDuring)})})}}(jQuery)});