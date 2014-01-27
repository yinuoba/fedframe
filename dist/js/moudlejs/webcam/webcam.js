/*! upgF2E - v0.1.0 
* https://www.yrz.cn/
* Copyright (c) 2014 Front-End development team of UPG Cloud Financing Department; Licensed MIT */
define("webcam/webcam",[],function(){return{version:"1.0.9",ie:!!navigator.userAgent.match(/MSIE/),protocol:location.protocol.match(/https/i)?"https":"http",callback:null,swf_url:"/public/image/webcam/webcam.swf",shutter_url:"/public/image/webcam/shutter.mp3",api_url:"",loaded:!1,quality:90,shutter_sound:!1,stealth:!1,hooks:{onLoad:null,onComplete:null,onError:null},set_hook:function(a,b){return"undefined"==typeof this.hooks[a]?alert("Hook type not supported: "+a):void(this.hooks[a]=b)},fire_hook:function(a,b){return this.hooks[a]?("function"==typeof this.hooks[a]?this.hooks[a](b):"array"==typeof this.hooks[a]?this.hooks[a][0][this.hooks[a][1]](b):window[this.hooks[a]]&&window[this.hooks[a]](b),!0):!1},set_api_url:function(a){this.api_url=a},set_swf_url:function(a){this.swf_url=a},get_html:function(a,b,c,d){c||(c=a),d||(d=b);var e="",f="shutter_enabled="+(this.shutter_sound?1:0)+"&shutter_url="+escape(this.shutter_url)+"&width="+a+"&height="+b+"&server_width="+c+"&server_height="+d;return e+=this.ie?'<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="'+this.protocol+'://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="'+a+'" height="'+b+'" id="webcam_movie" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="'+this.swf_url+'" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="'+f+'"/></object>':'<embed id="webcam_movie" src="'+this.swf_url+'" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="'+a+'" height="'+b+'" name="webcam_movie" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="'+f+'" />',this.loaded=!1,e},get_movie:function(){if(!this.loaded)return alert("ERROR: Movie is not loaded yet");var a=document.getElementById("webcam_movie");return a||alert("ERROR: Cannot locate movie 'webcam_movie' in DOM"),a},set_stealth:function(a){this.stealth=a},snap:function(a,b,c){b&&this.set_hook("onComplete",b),a&&this.set_api_url(a),"undefined"!=typeof c&&this.set_stealth(c);var d=this.get_movie();d._snap(this.api_url,this.quality,this.shutter_sound?1:0,this.stealth?1:0)},freeze:function(){this.get_movie()._snap("",this.quality,this.shutter_sound?1:0,0)},upload:function(a,b){b&&this.set_hook("onComplete",b),a&&this.set_api_url(a),this.get_movie()._upload(this.api_url)},reset:function(){this.get_movie()._reset()},configure:function(a){a||(a="camera"),this.get_movie()._configure(a)},set_quality:function(a){this.quality=a},set_shutter_sound:function(a,b){this.shutter_sound=a,this.shutter_url=b?b:this.shutter_url},flash_notify:function(a,b){switch(a){case"flashLoadComplete":this.loaded=!0,this.fire_hook("onLoad");break;case"error":this.fire_hook("onError",b)||alert("Flash Error: "+b);break;case"success":this.fire_hook("onComplete",b.toString());break;default:alert("flash_notify: "+a+": "+b)}}}});