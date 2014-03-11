/*! fedframe - v0.1.0 
* https://www.yrz.cn/
* Copyright (c) 2014 Front-End development team of UPG Cloud Financing Department; Licensed MIT */
define("/public/dist/js/appjs/account/user/login",["ajaxform/ajaxform","tipsy/tipsy","validate/validate","ghosttext/ghosttext"],function(a){var b=a("ajaxform/ajaxform"),c=a("ghosttext/ghosttext"),d=($("form#formId_Account_User_login"),$("div#tipsBlock"));window.ajaxAfter_Account_User_login=function(a){1==a.boolen?location.href=a.data:(d.find("span").html(a.message),d.show())},b.init(),c.init(),$("#refreshVerifyCode, img#VerifyCodeImg").click(function(){var a=$("img#VerifyCodeImg"),b=a.attr("src");if("string"==typeof b&&-1!==b.indexOf("?")){var c=b.indexOf("?");b=b.slice(0,c)}var d=b+"?version="+(new Date).getTime();a.attr("src",d)})}),define("ajaxform/ajaxform",["tipsy/tipsy","validate/validate"],function(a,b){function c(a,b){if("string"==typeof a&&a.length&&"string"==typeof b){var c=a.indexOf(b);-1!==c&&(a=a.slice(0,c))}return a}function d(a){a=a||$("form"),a.each(function(){var a=$(this),b="false"==a.attr("initForm")?!1:!0;!a.data("init")&&b&&(a.submit(function(){var b=a.attr("ajax")?!0:!1,d=window[a.attr("ajax-after")],f=window[a.attr("ajax-before")],g=window[a.attr("ajax-ing")],h=a.attr("ajax-datatype")||"json",i=$('input[type="submit"],input[type="button"][value="保存"],input[type="button"][value="确定"],input[type="button"][value="保 存"],input[type="button"][value="确 定"],input[type="button"][value="搜索"],input[type="button"][value="搜 索"]',a),j=i.val(),k=j;if("string"==typeof j&&j.length){var l=j.trimAll();l=c(l,"中..."),k=l+"中..."}if(b){var m={dataType:h,success:function(b){"html"!=h||"string"!=typeof b||-1===b.indexOf('{"boolen":108,"message"')&&-1===b.indexOf('{"boolen":106,"message"')||(b=""),d&&"function"==typeof d?(d(b,a),a.data("nowPage")&&(a.removeData("nowPage"),$("input[name='p']",a).remove())):"json"==h&&("function"==typeof $.popBox?"1"==b.boolen?pop.success(b.message):pop.error(b.message):window.console&&console.error("please inport the pop module!")),i.enable(),j=c(j,"中..."),i.val(j)},error:function(){i.enable(),j=c(j,"中..."),i.val(j)},beforeSerialize:function(b){e.removeErrorMsg();var d=$(b),g=!0;if(g=e.validForm(a,d),g||(i.enable(),j=c(j,"中..."),i.val(j),a.data("initForm-valid",!1)),"function"==typeof f&&(g=f(a,g)&&g),g){if(a.data("nowPage")){var h=a.data("nowPage");a.prepend('<input type="hidden" name="p" value="'+h+'"/>')}}else i.enable(),j=c(j,"中..."),i.val(j);return g},beforeSubmit:function(){return a.data("initForm-valid",!0),g&&"function"==typeof g&&g(a),!0}};return i.enable(!1),i.val(k),$(this).ajaxSubmit(m),!1}var n=$(this),o=!0;if($("[valid]",a).each(function(){o=$(this).valid(n)&&o}),n.data("nowPage")){var p=n.data("nowPage");n.prepend('<input type="hidden" name="p" value="'+p+'"/>')}return o}),$("[valid]",a).each(function(){var b=$(this),c=b.attr("valid-options");b.bind("blur.initForm",function(){e.removeErrorMsg(b),b.removeClass("textMess_bd")}),b.bind("focus.initForm",function(){b.removeClass("textMess_bd")}),c&&(c=$.parseJSON(c),c.validOnBlur&&b.blur(function(){setTimeout(function(){try{var c=b.tipsy("tip"),d=c.attr("tipsyid");"trade_term"!=d&&"career_term"!=d&&"city_term"!=d&&b.valid(a)}catch(e){b.valid(a)}},100)}))}),a.data("init","1"))})}a("tipsy/tipsy");var e=a("validate/validate");!function(a){"use strict";function b(b){var c=b.data;b.isDefaultPrevented()||(b.preventDefault(),a(this).ajaxSubmit(c))}function c(b){var c=b.target,d=a(c);if(!d.is(":submit,input:image")){var e=d.closest(":submit");if(0===e.length)return;c=e[0]}var f=this;if(f.clk=c,"image"==c.type)if(void 0!==b.offsetX)f.clk_x=b.offsetX,f.clk_y=b.offsetY;else if("function"==typeof a.fn.offset){var g=d.offset();f.clk_x=b.pageX-g.left,f.clk_y=b.pageY-g.top}else f.clk_x=b.pageX-c.offsetLeft,f.clk_y=b.pageY-c.offsetTop;setTimeout(function(){f.clk=f.clk_x=f.clk_y=null},100)}function d(){if(a.fn.ajaxSubmit.debug){var b="[jquery.form] "+Array.prototype.join.call(arguments,"");window.console&&window.console.log?window.console.log(b):window.opera&&window.opera.postError&&window.opera.postError(b)}}var e={};e.fileapi=void 0!==a("<input type='file'/>").get(0).files,e.formdata=void 0!==window.FormData,a.fn.ajaxSubmit=function(b){function c(c){for(var d=new FormData,e=0;e<c.length;e++)d.append(c[e].name,c[e].value);if(b.extraData)for(var f in b.extraData)b.extraData.hasOwnProperty(f)&&d.append(f,b.extraData[f]);b.data=null;var g=a.extend(!0,{},a.ajaxSettings,b,{contentType:!1,processData:!1,cache:!1,type:"POST"});b.uploadProgress&&(g.xhr=function(){var a=jQuery.ajaxSettings.xhr();return a.upload&&(a.upload.onprogress=function(a){var c=0;a.lengthComputable&&(c=parseInt(a.position/a.total*100,10)),b.uploadProgress(a,a.position,a.total,c)}),a}),g.data=null;var h=g.beforeSend;g.beforeSend=function(a,c){c.data=d,h&&h.call(c,a,b)},a.ajax(g)}function f(c){function e(a){var b=a.contentWindow?a.contentWindow.document:a.contentDocument?a.contentDocument:a.document;return b}function f(){function b(){try{var a=e(p).readyState;d("state = "+a),a&&"uninitialized"==a.toLowerCase()&&setTimeout(b,50)}catch(c){d("Server abort: ",c," (",c.name,")"),h(y),u&&clearTimeout(u),u=void 0}}var c=j.attr("target"),f=j.attr("action");v.setAttribute("target",n),g||v.setAttribute("method","POST"),f!=l.url&&v.setAttribute("action",l.url),l.skipEncodingOverride||g&&!/post/i.test(g)||j.attr({encoding:"multipart/form-data",enctype:"multipart/form-data"}),l.timeout&&(u=setTimeout(function(){t=!0,h(x)},l.timeout));var i=[];try{if(l.extraData)for(var k in l.extraData)l.extraData.hasOwnProperty(k)&&i.push(a('<input type="hidden" name="'+k+'">').attr("value",l.extraData[k]).appendTo(v)[0]);l.iframeTarget||(o.appendTo("body"),p.attachEvent?p.attachEvent("onload",h):p.addEventListener("load",h,!1)),setTimeout(b,15),v.submit()}finally{v.setAttribute("action",f),c?v.setAttribute("target",c):j.removeAttr("target"),a(i).remove()}}function h(b){if(!q.aborted&&!D){try{C=e(p)}catch(c){d("cannot access response document: ",c),b=y}if(b===x&&q)return void q.abort("timeout");if(b==y&&q)return void q.abort("server abort");if(C&&C.location.href!=l.iframeSrc||t){p.detachEvent?p.detachEvent("onload",h):p.removeEventListener("load",h,!1);var f,g="success";try{if(t)throw"timeout";var i="xml"==l.dataType||C.XMLDocument||a.isXMLDoc(C);if(d("isXml="+i),!i&&window.opera&&(null===C.body||!C.body.innerHTML)&&--E)return d("requeing onLoad callback, DOM not available"),void setTimeout(h,250);var j=C.body?C.body:C.documentElement;q.responseText=j?j.innerHTML:null,q.responseXML=C.XMLDocument?C.XMLDocument:C,i&&(l.dataType="xml"),q.getResponseHeader=function(a){var b={"content-type":l.dataType};return b[a]},j&&(q.status=Number(j.getAttribute("status"))||q.status,q.statusText=j.getAttribute("statusText")||q.statusText);var k=(l.dataType||"").toLowerCase(),n=/(json|script|text)/.test(k);if(n||l.textarea){var r=C.getElementsByTagName("textarea")[0];if(r)q.responseText=r.value,q.status=Number(r.getAttribute("status"))||q.status,q.statusText=r.getAttribute("statusText")||q.statusText;else if(n){var s=C.getElementsByTagName("pre")[0],v=C.getElementsByTagName("body")[0];s?q.responseText=s.textContent?s.textContent:s.innerText:v&&(q.responseText=v.textContent?v.textContent:v.innerText)}}else"xml"==k&&!q.responseXML&&q.responseText&&(q.responseXML=F(q.responseText));try{B=H(q,k,l)}catch(b){g="parsererror",q.error=f=b||g}}catch(b){d("error caught: ",b),g="error",q.error=f=b||g}q.aborted&&(d("upload aborted"),g=null),q.status&&(g=q.status>=200&&q.status<300||304===q.status||1223===q.status||0===q.status?"success":"error"),"success"===g?(l.success&&l.success.call(l.context,B,"success",q),m&&a.event.trigger("ajaxSuccess",[q,l])):g&&(void 0===f&&(f=q.statusText),l.error&&l.error.call(l.context,q,g,f),m&&a.event.trigger("ajaxError",[q,l,f])),m&&a.event.trigger("ajaxComplete",[q,l]),m&&!--a.active&&a.event.trigger("ajaxStop"),l.complete&&l.complete.call(l.context,q,g),D=!0,l.timeout&&clearTimeout(u),setTimeout(function(){l.iframeTarget||o.remove(),q.responseXML=null},100)}}}var i,k,l,m,n,o,p,q,r,s,t,u,v=j[0],w=!!a.fn.prop;if(c)if(w)for(k=0;k<c.length;k++)i=a(v[c[k].name]),i.prop("disabled",!1);else for(k=0;k<c.length;k++)i=a(v[c[k].name]),i.removeAttr("disabled");if(a(":input[name=submit],:input[id=submit]",v).length)return void alert('Error: Form elements must not have name or id of "submit".');if(l=a.extend(!0,{},a.ajaxSettings,b),l.context=l.context||l,n="jqFormIO"+(new Date).getTime(),l.iframeTarget?(o=a(l.iframeTarget),s=o.attr("name"),s?n=s:o.attr("name",n)):(o=a('<iframe name="'+n+'" src="'+l.iframeSrc+'" />'),o.css({position:"absolute",top:"-1000px",left:"-1000px"})),p=o[0],q={aborted:0,responseText:null,responseXML:null,status:0,statusText:"n/a",getAllResponseHeaders:function(){},getResponseHeader:function(){},setRequestHeader:function(){},abort:function(b){var c="timeout"===b?"timeout":"aborted";d("aborting upload... "+c),this.aborted=1,o.attr("src",l.iframeSrc),q.error=c,l.error&&l.error.call(l.context,q,c,b),m&&a.event.trigger("ajaxError",[q,l,c]),l.complete&&l.complete.call(l.context,q,c)}},m=l.global,m&&0===a.active++&&a.event.trigger("ajaxStart"),m&&a.event.trigger("ajaxSend",[q,l]),l.beforeSend&&l.beforeSend.call(l.context,q,l)===!1)return void(l.global&&a.active--);if(!q.aborted){r=v.clk,r&&(s=r.name,s&&!r.disabled&&(l.extraData=l.extraData||{},l.extraData[s]=r.value,"image"==r.type&&(l.extraData[s+".x"]=v.clk_x,l.extraData[s+".y"]=v.clk_y)));var x=1,y=2,z=a("meta[name=csrf-token]").attr("content"),A=a("meta[name=csrf-param]").attr("content");A&&z&&(l.extraData=l.extraData||{},l.extraData[A]=z),l.forceSync?f():setTimeout(f,10);var B,C,D,E=50,F=a.parseXML||function(a,b){return window.ActiveXObject?(b=new ActiveXObject("Microsoft.XMLDOM"),b.async="false",b.loadXML(a)):b=(new DOMParser).parseFromString(a,"text/xml"),b&&b.documentElement&&"parsererror"!=b.documentElement.nodeName?b:null},G=a.parseJSON||function(a){return window.eval("("+a+")")},H=function(b,c,d){var e=b.getResponseHeader("content-type")||"",f="xml"===c||!c&&e.indexOf("xml")>=0,g=f?b.responseXML:b.responseText;return f&&"parsererror"===g.documentElement.nodeName&&a.error&&a.error("parsererror"),d&&d.dataFilter&&(g=d.dataFilter(g,c)),"string"==typeof g&&("json"===c||!c&&e.indexOf("json")>=0?g=G(g):("script"===c||!c&&e.indexOf("javascript")>=0)&&a.globalEval(g)),g}}}if(!this.length)return d("ajaxSubmit: skipping submit process - no element selected"),this;var g,h,i,j=this;"function"==typeof b&&(b={success:b}),g=this.attr("method"),h=this.attr("action"),i="string"==typeof h?a.trim(h):"",i=i||window.location.href||"",i&&(i=(i.match(/^([^#]+)/)||[])[1]),b=a.extend(!0,{url:i,success:a.ajaxSettings.success,type:g||"GET",dataType:"json",iframeSrc:/^https/i.test(window.location.href||"")?"javascript:false":"about:blank"},b);var k={};if(this.trigger("form-pre-serialize",[this,b,k]),k.veto)return d("ajaxSubmit: submit vetoed via form-pre-serialize trigger"),this;if(b.beforeSerialize&&b.beforeSerialize(this,b)===!1)return d("ajaxSubmit: submit aborted via beforeSerialize callback"),this;var l=b.traditional;void 0===l&&(l=a.ajaxSettings.traditional);var m,n=this.formToArray(b.semantic);if(b.data&&(b.extraData=b.data,m=a.param(b.data,l)),b.beforeSubmit&&b.beforeSubmit(n,this,b)===!1)return d("ajaxSubmit: submit aborted via beforeSubmit callback"),this;if(this.trigger("form-submit-validate",[n,this,b,k]),k.veto)return d("ajaxSubmit: submit vetoed via form-submit-validate trigger"),this;var o=a.param(n,l);m&&(o=o?o+"&"+m:m),"GET"==b.type.toUpperCase()?(b.url+=(b.url.indexOf("?")>=0?"&":"?")+o,b.data=null):b.data=o;var p=[];if(b.resetForm&&p.push(function(){j.resetForm()}),b.clearForm&&p.push(function(){j.clearForm(b.includeHidden)}),!b.dataType&&b.target){var q=b.success||function(){};p.push(function(c){var d=b.replaceTarget?"replaceWith":"html";a(b.target)[d](c).each(q,arguments)})}else b.success&&p.push(b.success);b.success=function(a,c,d){for(var e=b.context||b,f=0,g=p.length;g>f;f++)p[f].apply(e,[a,c,d||j,j])};var r=a("input:file:enabled[value]",this),s=r.length>0,t="multipart/form-data",u=j.attr("enctype")==t||j.attr("encoding")==t,v=e.fileapi&&e.formdata;d("fileAPI :"+v);var w=(s||u)&&!v;return b.iframe!==!1&&(b.iframe||w)?b.closeKeepAlive?a.get(b.closeKeepAlive,function(){f(n)}):f(n):(s||u)&&v?c(n):a.ajax(b),this.trigger("form-submit-notify",[this,b]),this},a.fn.ajaxForm=function(e){if(e=e||{},e.delegation=e.delegation&&a.isFunction(a.fn.on),!e.delegation&&0===this.length){var f={s:this.selector,c:this.context};return!a.isReady&&f.s?(d("DOM not ready, queuing ajaxForm"),a(function(){a(f.s,f.c).ajaxForm(e)}),this):(d("terminating; zero elements found by selector"+(a.isReady?"":" (DOM not ready)")),this)}return e.delegation?(a(document).off("submit.form-plugin",this.selector,b).off("click.form-plugin",this.selector,c).on("submit.form-plugin",this.selector,e,b).on("click.form-plugin",this.selector,e,c),this):this.ajaxFormUnbind().bind("submit.form-plugin",e,b).bind("click.form-plugin",e,c)},a.fn.ajaxFormUnbind=function(){return this.unbind("submit.form-plugin click.form-plugin")},a.fn.formToArray=function(b){var c=[];if(0===this.length)return c;var d=this[0],f=b?d.getElementsByTagName("*"):d.elements;if(!f)return c;var g,h,i,j,k,l,m;for(g=0,l=f.length;l>g;g++)if(k=f[g],i=k.name)if(b&&d.clk&&"image"==k.type)k.disabled||d.clk!=k||(c.push({name:i,value:a(k).val(),type:k.type}),c.push({name:i+".x",value:d.clk_x},{name:i+".y",value:d.clk_y}));else if(j=a.fieldValue(k,!0),j&&j.constructor==Array)for(h=0,m=j.length;m>h;h++)c.push({name:i,value:j[h]});else if(e.fileapi&&"file"==k.type&&!k.disabled){var n=k.files;for(h=0;h<n.length;h++)c.push({name:i,value:n[h],type:k.type})}else null!==j&&"undefined"!=typeof j&&c.push({name:i,value:j,type:k.type});if(!b&&d.clk){var o=a(d.clk),p=o[0];i=p.name,i&&!p.disabled&&"image"==p.type&&(c.push({name:i,value:o.val()}),c.push({name:i+".x",value:d.clk_x},{name:i+".y",value:d.clk_y}))}return c},a.fn.formSerialize=function(b){return a.param(this.formToArray(b))},a.fn.fieldSerialize=function(b){var c=[];return this.each(function(){var d=this.name;if(d){var e=a.fieldValue(this,b);if(e&&e.constructor==Array)for(var f=0,g=e.length;g>f;f++)c.push({name:d,value:e[f]});else null!==e&&"undefined"!=typeof e&&c.push({name:this.name,value:e})}}),a.param(c)},a.fn.fieldValue=function(b){for(var c=[],d=0,e=this.length;e>d;d++){var f=this[d],g=a.fieldValue(f,b);null===g||"undefined"==typeof g||g.constructor==Array&&!g.length||(g.constructor==Array?a.merge(c,g):c.push(g))}return c},a.fieldValue=function(b,c){var d=b.name,e=b.type,f=b.tagName.toLowerCase();if(void 0===c&&(c=!0),c&&(!d||b.disabled||"reset"==e||"button"==e||("checkbox"==e||"radio"==e)&&!b.checked||("submit"==e||"image"==e)&&b.form&&b.form.clk!=b||"select"==f&&-1==b.selectedIndex))return null;if("select"==f){var g=b.selectedIndex;if(0>g)return null;for(var h=[],i=b.options,j="select-one"==e,k=j?g+1:i.length,l=j?g:0;k>l;l++){var m=i[l];if(m.selected){var n=m.value;if(n||(n=m.attributes&&m.attributes.value&&!m.attributes.value.specified?m.text:m.value),j)return n;h.push(n)}}return h}return a(b).val()},a.fn.clearForm=function(b){return this.each(function(){a("input,select,textarea",this).clearFields(b)})},a.fn.clearFields=a.fn.clearInputs=function(a,b){var c=/^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i;return this.each(function(){var d=this.type,e=this.tagName.toLowerCase();c.test(d)||"textarea"==e||a&&/hidden/.test(d)?this.value="":"checkbox"==d||"radio"==d?this.checked=!1:"select"==e&&(this.selectedIndex="undefined"!=typeof b?b:-1)})},a.fn.resetForm=function(){return this.each(function(){("function"==typeof this.reset||"object"==typeof this.reset&&!this.reset.nodeType)&&this.reset()})},a.fn.enable=function(b){return void 0===b&&(b=!0),this.each(function(){this.disabled=!b,b?a(this).removeClass("btn-disabled"):a(this).addClass("btn-disabled")})},a.fn.selected=function(b){return void 0===b&&(b=!0),this.each(function(){var c=this.type;if("checkbox"==c||"radio"==c)this.checked=b;else if("option"==this.tagName.toLowerCase()){var d=a(this).parent("select");b&&d[0]&&"select-one"==d[0].type&&d.find("option").selected(!1),this.selected=b}})},a.fn.ajaxSubmit.debug=!1}(jQuery),b.init=d,b.validForm=e.validForm}),define("tipsy/tipsy.css",[],function(){seajs.importStyle(".tipsy{padding:5px;font-size:13px;position:absolute;z-index:112}.tipsy-inner{padding:5px 8px 4px;background-color:#000;color:#fff;max-width:250px;text-align:left}.tipsy-inner{overflow:hidden}.tipsy-arrow{position:absolute;background:url(/public/image/tipsy/black.gif) no-repeat top left;width:9px;height:0}.tipsy-n .tipsy-arrow{top:0;left:50%;margin-left:-4px}.tipsy-nw .tipsy-arrow{top:0;left:10px}.tipsy-ne .tipsy-arrow{top:0;right:10px}.tipsy-s .tipsy-arrow{bottom:0;left:50%;margin-left:-4px;background-position:bottom left}.tipsy-sw .tipsy-arrow{bottom:0;left:10px;background-position:bottom left}.tipsy-se .tipsy-arrow{bottom:0;right:10px;background-position:bottom left}.tipsy-e .tipsy-arrow{top:50%;margin-top:-4px;right:0;width:5px;height:9px;background-position:top right}.tipsy-w .tipsy-arrow{top:50%;margin-top:-4px;left:0;width:5px;height:9px}.tipsy-red{padding:5px;font-size:12px;position:absolute;z-index:112}.tipsy-red .tipsy-inner{background-color:#FFF;color:red}.tipsy-red .tipsy-arrow{background:0}.tipsy-red-n .tipsy-arrow{top:1px;left:50%;margin-left:-4px}.tipsy-red-nw .tipsy-arrow{top:1px;left:10px}.tipsy-red-ne .tipsy-arrow{top:1px;right:10px}.tipsy-red-s .tipsy-arrow{bottom:1px;left:50%;margin-left:-4px;background-position:bottom left}.tipsy-red-sw .tipsy-arrow{bottom:1px;left:10px;background-position:bottom left}.tipsy-red-se .tipsy-arrow{bottom:1px;right:10px;background-position:bottom left}.tipsy-red-e .tipsy-arrow{top:50%;margin-top:-4px;right:1px;width:5px;height:9px;background-position:top right}.tipsy-red-w .tipsy-arrow{top:50%;margin-top:-4px;left:1px;width:5px;height:9px}.tipsy-white{padding:5px;font-size:13px;position:absolute;z-index:112}.tipsy-white .tipsy-inner{background-color:#fff;border:1px solid #000;color:#000;text-align:left;max-width:600px}.tipsy-white .tipsy-arrow{background:url(/public/image/tipsy/white.gif) no-repeat top left}.tipsy-white-n .tipsy-arrow{top:0;left:50%;margin-left:-4px}.tipsy-white-nw .tipsy-arrow{top:0;left:10px}.tipsy-white-ne .tipsy-arrow{top:0;right:10px}.tipsy-white-s .tipsy-arrow{bottom:0;left:50%;margin-left:-4px;background-position:bottom left}.tipsy-white-sw .tipsy-arrow{bottom:0;left:10px;background-position:bottom left}.tipsy-white-se .tipsy-arrow{bottom:0;right:10px;background-position:bottom left}.tipsy-white-e .tipsy-arrow{top:50%;margin-top:-4px;right:0;width:5px;height:9px;background-position:top right}.tipsy-white-w .tipsy-arrow{top:50%;margin-top:-4px;left:0;width:5px;height:9px}.textMess.textMess_bd,.textMess_bd{border:#ddd solid 1px}.extra_tips .caution,.ico_correct,.ico_wrong{background:url(/public/image/tipsy/tipsBg.png) no-repeat}.extra_tips{margin-left:8px;_zoom:1;padding-left:15px;vertical-align:middle;display:none}.extra_tips .caution{width:10px;height:16px;display:inline-block;margin-left:-15px;margin-right:5px;background-position:-5px -60px;vertical-align:middle}.extra_tips .text{line-height:18px;color:#B5B5B5;display:inline-block;vertical-align:middle}.ico_correct,.ico_wrong{width:14px;height:15px;display:inline-block;background-position:-1px -30px;margin-left:8px;vertical-align:middle}.ico_wrong{background-position:0 0;width:15px}")}),define("tipsy/tipsy",[],function(a){a.async("./tipsy.css"),function(a){function b(a){(a.attr("title")||"string"!=typeof a.attr("original-title"))&&a.attr("original-title",a.attr("title")||"").removeAttr("title")}function c(c,d){this.$element=a(c),this.options=d,this.enabled=!0,b(this.$element)}c.prototype={show:function(){var b=this.getTitle();if(b&&this.enabled){var c=this.tip();c.find(".tipsy-inner")[this.options.html?"html":"text"](b);var d=""!=this.options.color?"-"+this.options.color:"";c[0].className="tipsy"+d,c.remove().css({top:0,left:0,visibility:"hidden",display:"block"}).appendTo(document.body);var e,f=a.extend({},this.$element.offset(),{width:this.$element[0].offsetWidth,height:this.$element[0].offsetHeight}),g=c[0].offsetWidth,h=c[0].offsetHeight,i="function"==typeof this.options.gravity?this.options.gravity.call(this.$element[0]):this.options.gravity;switch(i.charAt(0)){case"n":e={top:f.top+f.height+this.options.offset,left:f.left+f.width/2-g/2};break;case"s":e={top:f.top-h-this.options.offset,left:f.left+f.width/2-g/2};break;case"e":e={top:f.top+f.height/2-h/2,left:f.left-g-this.options.offset};break;case"w":e={top:f.top+f.height/2-h/2,left:f.left+f.width+this.options.offset}}2==i.length&&(e.left="w"==i.charAt(1)?f.left+f.width/2-15:f.left+f.width/2-g+15);var d=""!=this.options.color?"-"+this.options.color:"";c.css(e).addClass("tipsy"+d+"-"+i),this.options.fade?c.stop().css({opacity:0,display:"block",visibility:"visible"}).animate({opacity:this.options.opacity}):c.css({visibility:"visible",opacity:this.options.opacity});var j=upgTool.getHighestZIndex();a("#moving_tab_main").is(":visible")&&c.css({position:"fixed"}),c.css({zIndex:j})}},hide:function(){this.tip().remove()},getTitle:function(){var a,c=this.$element,d=this.options;b(c);var a,d=this.options;return"string"==typeof d.title?a=c.attr("title"==d.title?"original-title":d.title):"function"==typeof d.title&&(a=d.title.call(c[0])),a=(""+a).replace(/(^\s*|\s*$)/,""),a||d.fallback},tip:function(){if(!this.$tip){var b=""!=this.options.color?"-"+this.options.color:"",c=""==this.options.id?"":" tipsyid='"+this.options.id+"'",d=""==this.options.formId?"":" tipsyformId='"+this.options.formId+"'",e=this.options.width||"auto";this.$tip=a('<div tipsy="true" style="width:'+e+'" class="tipsy'+b+'"'+c+d+"></div>").html('<div class="tipsy-arrow"></div><div class="tipsy-inner"/></div>')}return this.$tip},validate:function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},enable:function(){this.enabled=!0},disable:function(){this.enabled=!1},toggleEnabled:function(){this.enabled=!this.enabled}},a.fn.tipsy=function(b){function d(d){var e=a.data(d,"tipsy");return e||(e=new c(d,a.fn.tipsy.elementOptions(d,b)),a.data(d,"tipsy",e)),e}function e(){var a=d(this);a.hoverState="in",0==b.delayIn?a.show():setTimeout(function(){"in"==a.hoverState&&a.show()},b.delayIn)}function f(){var a=d(this);a.hoverState="out",0==b.delayOut?a.hide():setTimeout(function(){"out"==a.hoverState&&a.hide()},b.delayOut)}if(b===!0)return this.data("tipsy");if("string"==typeof b)return this.data("tipsy")[b]();if(b=a.extend({},a.fn.tipsy.defaults,b),b.live||this.each(function(){d(this)}),"manual"!=b.trigger){var g=b.live?"live":"bind",h="hover"==b.trigger?"mouseenter":"focus",i="hover"==b.trigger?"mouseleave":"blur";this[g](h,e)[g](i,f)}return this},a.fn.tipsy.defaults={delayIn:0,delayOut:0,fade:!1,fallback:"",gravity:"n",html:!1,live:!1,offset:0,opacity:.8,title:"title",trigger:"hover",color:""},a.fn.tipsy.elementOptions=function(b,c){return a.metadata?a.extend({},c,a(b).metadata()):c},a.fn.tipsy.autoNS=function(){return a(this).offset().top>a(document).scrollTop()+a(window).height()/2?"s":"n"},a.fn.tipsy.autoWE=function(){return a(this).offset().left>a(document).scrollLeft()+a(window).width()/2?"e":"w"};var d=function(){a("[valid-msg-text]").each(function(){if(a(this).is(":visible"))try{var b=a(this).tipsy("tip");b.is(":visible")&&a(this).tipsy("show")}catch(c){}})},e=0;a(window).bind("resize.tipsy,scroll.tipsy",function(){e&&(clearTimeout(e),e=0),e=setTimeout(d,50)}),a(document).ajaxComplete(function(){a(".jqueryscroll, .benchviewDivs").scroll(function(){e&&(clearTimeout(e),e=0),e=setTimeout(d,50)})})}(jQuery)}),define("validate/validate",["tipsy/tipsy"],function(a,b){function c(a,b){var c=b&&b.show?!0:!1,d=b&&b.unFocus?!0:!1,f=b&&b.gravity?b.gravity:"w",g=b&&b.html?b.html:!0,h=b&&b.offset?b.offset:0,i=a.attr(null==a.attr("name")?"valid-msg":"name"),j=b&&b.msgHolderId?b.msgHolderId:!1,k=b.width,l="";if(a.parents("form").length){var m=a.parents("form");if(l=m.attr("name")||m.attr("id"),!l){var n=Math.ceil(1e4*Math.random());l="randomId-"+n}}if(i=null==i?a.attr("id"):i,j){var o=a.attr("valid-msg-text");a=$("#"+j),a.attr("valid-msg-text",o)}a.tipsy({title:"valid-msg-text",trigger:"manual",gravity:f,fade:!0,color:"red",opacity:1,html:g,offset:h,id:i,formId:l,width:k});var p=!1;return d||(p=e(a)),c&&setTimeout(function(){a.tipsy("show"),a.is("input")&&a.addClass("textMess_bd")},10),p}function d(a){try{if(a)if("object"==typeof a){if("function"==typeof a.tipsy){var b=a.tipsy("tip");b.hide()}}else $("[tipsyid='"+a+"']").remove();else $("[tipsy].tipsy-red").remove()}catch(c){}}function e(a){var b=!1;try{var c=$("#colorbox:visible");!c.length,setTimeout(function(){var b=a.attr("tabindex");a.is(":input")?a.focus():(a.attr("tabindex","-1"),a.is(":visible")||a.append("&nbsp;"),a.focus(),b?a.attr("tabindex",b):a.removeAttr("tabindex"))},1),b=!0}catch(d){}return b}function f(a){var b=!1,c=$("[tipsy]");if(a){var d=a.attr("name")||a.attr("id");c=$("[tipsy][tipsyformId="+d+"]")}return c.each(function(){$(this).is(":visible")&&(b=!0)}),b}function g(a){for(var b=a,c=0;c<b.length;c++)if(b.charAt(c)<"0"||b.charAt(c)>"9")return!1;var d=b.substr(6,2),e=b.substr(8,2),f=b.substr(10,2);return"01">d||d>"90"?!1:"01">e||e>"12"?!1:"01">f||f>"31"?!1:!0}function h(a){for(var b=new Array("7","9","10","5","8","4","2","1","6","3","7","9","10","5","8","4","2"),c=new Array("1","0","X","9","8","7","6","5","4","3","2"),d=a,e=d.substr(0,17),f=d.substr(17),g=0,h=0;17>h;h++){if(e.charAt(h)<"0"||e.charAt(h)>"9")return!1;g+=parseInt(e.charAt(h))*parseInt(b[h])}var i=parseInt(g)%11;return"X"==f&&(f=f.toLocaleUpperCase()),c[i]==f?!0:!1}a("tipsy/tipsy"),function(a){var b,d=!1,e={required:{regex:/[^(^\s*)|(\s*$)]/,msg:"此项必填"},email:{regex:/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,msg:"邮箱格式不正确。参考格式: wzp@upg.cn"},qq:{regex:/^\d+$/,msg:"qq号码必须是1位以上的数字"},url:{msg:"链接格式不正确。参考格式：http://www.ifsc.com.cn"},id:{msg:"此项必填"},lengthRange:{msg:"密码长度为 #0# 到 #1#"},notMatch:{msg:"please enter a value differnt from '#0#'"},match:{msg:"please enter a value match with '#0#' field"},realname:{regex:/^[\u0391-\uFFE5A-Za-z0-9_-]+$/,msg:"中文,英文, 0-9, - and _"},alphanumeric:{regex:/^[A-Za-z0-9_-]+$/,msg:"英文, 0-9, - and _"},idcard:{msg:"身份证号码错误"},mobile:{regex:/^[1][3,4,5,8]\d{9}$/,msg:"手机号码格式错误"},phone:{regex:/^((\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$)$/,msg:"座机号码格式错误,格式 0571-88888888"},mobileOrPhone:{msg:"此项格式为手机或座机号码"},areaPart:{regex:/^0\d{2}$|^0\d{3}$/,msg:"区号格式错误"},phonePart:{regex:/^((\d{7,8})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$)$/,msg:"座机号码格式错误"},year:{regex:/^[1,2][0,9]\d{2}$/,msg:"年格式填写错误！"},month:{regex:/^[0,1]\d{1}$|^\d{1}$/,msg:"月格式填写错误！"},day:{regex:/^[0,1,2,3]\d{1}$|^\d{1}$/,msg:"日格式填写错误！"},number:{msg:"此项为数字格式"},notAllNum:{regex:/^\d+$/,msg:"不能全为数字"},uploadImg:{msg:"图片类型错误"},uploadFile:{msg:"附件类型错误"},uploadFileImg:{msg:"附件类型错误"},uploadSound:{msg:"录音类型错误"},maxValue:{msg:"请输入数字小于  #0#"},minValue:{msg:"请输入数字大于  #0#"},maxDecimal:{msg:"有效数字不多于 #0#"}},f=function(b,e,f){try{b.tipsy("hide")}catch(g){}b.is(":visible")?b.attr("valid-msg-text",f):b.parent().attr("valid-msg-text",f);var h=null==b.attr("valid-msg-options")?{}:a.parseJSON(b.attr("valid-msg-options"));a.extend(h,{show:!0});var i=!1;d&&a.extend(h,{unFocus:!0}),i=c(b.is(":visible")?b:b.parent(),h),d||(d=i)},i=function(c,d){var e=a('[name="'+c+'"]',b).length>0?a('[name="'+c+'"]',b):a("#"+c);return e=e.size()>0?e:a("[valid-name="+c+"]"),d&&(e=e.filter(":visible")),e};a.fn.valid=function(c){if(!a(this).attr("valid"))return!1;b=c||a("body");var d=a(this),j=d.attr("valid").split("|")[0].split(","),k=d.attr("valid").split("|")[1]?d.attr("valid").split("|")[1].split(","):[],l=("radio"==(d.attr("type")||"").toLowerCase()?a("[name="+d.attr("name")+"]:checked").val():d.val())||"",m=l.length,n=d.attr("name")||d.attr("valid-name"),o=!0;if(a.each(j,function(b,c){c=a.trim(c);var j;if(c.indexOf("@")>=0&&(j=c.split("@")[1],c=c.split("@")[0]),"ajax"==c){var p={};p[n]=l,a.ajax({type:"post",url:j,data:p,dataType:"json",cache:!1,async:!1,success:function(a){return"0"==a.boolen?(f(d,n,a.message),o=!1,!1):void 0}})}else{var q=k[b]||e[c].msg;if("lengthRange"==c){var r=j.split("~")[0],s=j.split("~")[1];if(r>m||m>s)return q=q.replaceAll("#0#",r),q=q.replaceAll("#1#",s),f(d,n,q),o=!1,!1}else if("number"==c){if(isNaN(l)||l.indexOf("+")>=0)return f(d,n,q),o=!1,!1}else if("notAllNum"==c){if(0==l.length)return o=!0;var t=e.notAllNum.regex.test(l);if(t)return f(d,n,q),o=!1,!1}else if("notMatch"==c){if(l==i(j).val())return q=q.replaceAll("#0#",i(j).val()),f(d,n,q),o=!1,!1}else if("minValue"==c){if(isNaN(j)&&(j=i(j).val()),j&&parseFloat(l)<=parseFloat(j))return q=q.replaceAll("#0#",j),f(d,n,q),o=!1,!1}else if("maxValue"==c){if(isNaN(j)&&(j=i(j).val()),j&&parseFloat(l)>parseFloat(j))return q=q.replaceAll("#0#",j),f(d,n,q),o=!1,!1}else if("maxDecimal"==c){var u=parseFloat(l).toFixed(j);if(l/u>1)return q=q.replaceAll("#0#",j),f(d,n,q),o=!1,!1}else if("match"==c){if(l!=i(j).val())return q=q.replaceAll("#0#",i(j).attr("name")),f(d,n,q),o=!1,!1}else if("id"==c){n=j?j:n;var v=i(n);if(l=v.is(":radio")||v.is(":checkbox")?v.filter(":checked").val():v.val(),null===l||void 0===l||""===l||0>l)return f(d,n,q),o=!1,!1}else if("idcard"==c){if(0==l.length)return o=!0;if(o=!1,15==l.length?o=g(l):18==l.length&&(o=h(l)),!o)return f(d,n,q),!1}else if("url"==c){if(0==l.length)return o=!0;if(o=!1,(-1!==l.indexOf("http://")||-1!==l.indexOf("https://"))&&(o=!0),!o)return f(d,n,q),!1}else if("uploadImg"==c){var v=d||i(n);if(l||(n=j?j:n,l=v.is(":radio")||v.is(":checkbox")?v.filter(":checked").val():v.val()),0==l.length)return!0;var w=l.split(".").pop().toLowerCase(),x=["jpg","gif","png","jpeg","bmp"];-1==a.inArray(w,x)&&(v.replaceWith(v.val("").clone(!0)),v=i(n,!0),v.removeData("tipsy"),f(v,n,q),o=!1)}else if("uploadFile"==c){var v=d||i(n);if(l||(n=j?j:n,l=v.is(":radio")||v.is(":checkbox")?v.filter(":checked").val():v.val()),0==l.length)return!0;var w=l.split(".").pop().toLowerCase(),x=["zip","rar","doc","xls","ppt","docx","xlsx","pptx","pdf","htm","html","wps","et","dps","txt"];-1==a.inArray(w,x)&&(v.replaceWith(v.val("").clone(!0)),v=i(n,!0),v.removeData("tipsy"),f(v,n,q),o=!1)}else if("uploadFileImg"==c){var v=d||i(n);if(l||(n=j?j:n,l=v.is(":radio")||v.is(":checkbox")?v.filter(":checked").val():v.val()),0==l.length)return!0;var w=l.split(".").pop().toLowerCase(),x=["zip","rar","doc","xls","ppt","docx","xlsx","pptx","pdf","htm","html","wps","et","dps","jpg","gif","png","jpeg","bmp","txt"];-1==a.inArray(w,x)&&(v.replaceWith(v.val("").clone(!0)),v=i(n,!0),v.removeData("tipsy"),f(v,n,q),o=!1)}else if("uploadSound"==c){var v=d||i(n);if(l||(n=j?j:n,l=v.is(":radio")||v.is(":checkbox")?v.filter(":checked").val():v.val()),0==l.length)return!0;var w=l.split(".").pop().toLowerCase(),x=["mp3","wma","flac","aac","mmf","amr","m4a","m4r","ogg","mp2","wav","wv"];-1==a.inArray(w,x)&&(v.replaceWith(v.val("").clone(!0)),v=i(n,!0),v.removeData("tipsy"),f(v,n,q),o=!1)}else if("mobileOrPhone"==c){if(0==l.length)return o=!0;var y=e.phone.regex.test(l),z=e.mobile.regex.test(l);if(!y&&!z)return f(d,n,q),o=!1,!1}else if("year"==c){if(0==l.length)return o=!0;var A=e.year.regex.test(l);if(!A)return f(d,n,q),o=!1,!1}else if("month"==c){if(0==l.length)return o=!0;var B=e.month.regex.test(l);if(!B)return f(d,n,q),o=!1,!1}else if("day"==c){if(0==l.length)return o=!0;var C=e.day.regex.test(l);if(!C)return f(d,n,q),o=!1,!1}else if("areaPart"==c){if(0==l.length)return o=!0;var D=e.areaPart.regex.test(l);if(!D)return f(d,n,q),o=!1,!1}else if("phonePart"==c){if(0==l.length)return o=!0;var E=e.phonePart.regex.test(l);if(!E)return f(d,n,q),o=!1,!1}else{if("required"!=c&&0==l.length)return o=!0,!0;if(!d.is(":disabled")&&!e[c].regex.test(l))return f(d,n,q),o=!1,!1;if("realname"==c){var F=["～","！","＠","＃","＄","％","︿","＆","＊","（","）","＿","＋","‵","－","＝","［","］","＼","｛","｝","｜","；","’","：","＂","，","。","／","＜","＞","？"];for(b in F)if(l.indexOf(F[b])>=0)return f(d,n,q),o=!1,!1
}}}}),o)try{d.tipsy("hide")}catch(p){}return o}}(jQuery);var i=function(a,b){b=b||a;var c=!0,d=!1;return $("[valid]",a).each(function(){var a=$(this);a.is(":visible")?(c=a.valid(b)&&c,c||d||(d=e(a))):void 0!=a.attr("valid-hide")&&(c=a.valid(b)&&c,c||d||(d=e(a)))}),c};b.createTipsyErr=c,b.removeErrorMsg=d,b.focusErr=e,b.isValidError=f,b.isChineseIdentifyNo15=g,b.isChineseIdentifyNo18=h,b.validForm=i,b.showErr=function(a,b,d){d="undefined"!=typeof d?!d:!1,a.attr("valid-msg-text",b);var e=null==a.attr("valid-msg-options")?{}:$.parseJSON(a.attr("valid-msg-options"));$.extend(e,{show:!0,unFocus:d}),c(a,e)}}),define("ghosttext/ghosttext",[],function(a,b){function c(a){var b,c=a||!1;b=a&&a.attr("ghosttext")?a:a?$("[ghosttext]",a):$("[ghosttext]"),b.each(function(){var a=$(this),b=a.attr("id")||a.attr("name");if(!a.data("initGhostText")||c){c&&a.data("initGhostText")&&(a.unbind("focus change blur keyup keydown"),a.siblings("label.gt").remove(),a.unwrap()),a.data("initGhostText","1"),a.bind({focus:function(b){d(b,a)},change:function(b){d(b,a)},blur:function(){if(0==a.val().length){var b=a.prev("label");b.length||(b=a.parent().siblings("label")),b.removeClass("fgt").show()}},keyup:function(b){d(b,a)},keydown:function(b){d(b,a,!0)}});var e=a.attr("ghosttext"),f=$("<label/>").addClass("gt").html(e).click(function(){a.focus()});a.parent("div").hasClass("ghosttext")||a.wrapAll('<div style="display:inline-block;" class="ghosttext ghosttexttarget-'+b+'"/>'),a.before(f),a.val().length>0&&d(null,a,!0)}})}function d(a,b,c){var d=b.prev("label");d.length||(d=b.parent().siblings("label")),b.val().length>0||c?d.removeClass("fgt").hide():0==b.val().length&&("change"!=a.type&&d.addClass("fgt"),d.show())}b.init=c});