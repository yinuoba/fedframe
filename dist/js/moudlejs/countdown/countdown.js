/*! fedframe - v0.1.0 
* https://www.yrz.cn/
* Copyright (c) 2014 Front-End development team of UPG Cloud Financing Department; Licensed MIT */
define("countdown/countdown",[],function(a,b){var c=function(a){var b=a.toDate,c=a.tian,d=a.shi,e=a.fen,f=a.miao,g=a.inner,h=a.callback||function(){},i=a.endFun||function(){},j=a.hasUnit;countType=a.countType;var k,l=null!=c?$(c)[0]:null,m=null!=d?$(d)[0]:null,n=null!=e?$(e)[0]:null,o=null!=f?$(f)[0]:null,p="",q="",r="",s="";j&&(p="天",q="时",r="分",s="秒");var t=function(g){if(null!=g)var k=g;else var k=b.getTime()-FS.now();var t=k/1e3,u=(Math.floor(t),864e5),v=k/u,w=Math.floor(v),x=24*(v-w),y=Math.floor(x),z=60*(x-y),A=Math.floor(60*(x-y)),B=Math.round(60*(z-A));if(h({daysold:w,hrsold:y,minsold:A,seconds:B,innerTime:k,params:a}),0>=k)return j?void 0!==f&&o&&(o.innerHTML="0秒"):(void 0!==c&&l&&(l.innerHTML="0"),void 0!==d&&m&&(m.innerHTML="0"),void 0!==e&&n&&(n.innerHTML="0"),void 0!==f&&o&&(o.innerHTML="0")),i(a),!1;if(void 0!==c&&l&&10>w&&(w="0"+w),10>y&&(y="0"+y),10>A&&(A="0"+A),10>B&&(B="0"+B),null!=c&&l&&(l.innerHTML=parseInt(w,10)?(10>w?"0"+w:w)+p:""),null!=d&&m&&(m.innerHTML=y+q,null==c)){var C=24*parseInt(w,10)+parseInt(y,10);m.innerHTML=(10>C?"0"+C:C)+q}if(null!=e&&n&&(n.innerHTML=A+r,null==c&&null==d)){var D=24*parseInt(w,10)*60+60*parseInt(y,10)+parseInt(A,10);n.innerHTML=(10>D?"0"+D:D)+r}null!=f&&o&&(o.innerHTML=B+s,null==c&&null==d&&null==e&&(o.innerHTML=t+s))};k=window.setInterval(function(){g>=0&&(t(g),countType?g+=1e3:g-=1e3)},1e3)};b.init=c});