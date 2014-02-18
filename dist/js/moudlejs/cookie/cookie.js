/*! fedframe - v0.1.0 
* https://www.yrz.cn/
* Copyright (c) 2014 Front-End development team of UPG Cloud Financing Department; Licensed MIT */
define("cookie/cookie",[],function(a,b){var c=function(a){for(var b=document.cookie.split("; "),c=b.length,d=0;c>d;d++){var e=b[d].split("=");if(a==e[0])return decodeURIComponent(e[1])}return null},d=function(a,b,c){var d=a+"="+encodeURIComponent(b);null!=c&&c instanceof Date&&(d+="; expires="+c.toGMTString()),document.cookie=d},e=function(a){document.cookie=a+"=; expires=Fri, 31 Dec 1999 23:59:59 GMT;"};b.getCookie=c,b.setCookie=d,b.removeCookie=e});