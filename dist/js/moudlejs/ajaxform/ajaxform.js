/*! upgF2E - v0.1.0 
* https://www.yrz.cn/
* Copyright (c) 2014 Front-End development team of UPG Cloud Financing Department; Licensed MIT */
define("ajaxform/ajaxform",["tipsy/tipsy","validate/validate"],function(a,b){function c(a,b){if("string"==typeof a&&a.length&&"string"==typeof b){var c=a.indexOf(b);-1!==c&&(a=a.slice(0,c))}return a}function d(a){a=a||$("form"),a.each(function(){var a=$(this),b="false"==a.attr("initForm")?!1:!0;!a.data("init")&&b&&(a.submit(function(){var b=a.attr("ajax")?!0:!1,d=window[a.attr("ajax-after")],f=window[a.attr("ajax-before")],g=window[a.attr("ajax-ing")],h=a.attr("ajax-datatype")||"json",i=$('input[type="submit"],input[type="button"][value="保存"],input[type="button"][value="确定"],input[type="button"][value="保 存"],input[type="button"][value="确 定"],input[type="button"][value="搜索"],input[type="button"][value="搜 索"]',a),j=i.val(),k=j;if("string"==typeof j&&j.length){var l=j.trimAll();l=c(l,"中..."),k=l+"中..."}if(b){var m={dataType:h,success:function(b){"html"!=h||"string"!=typeof b||-1===b.indexOf('{"boolen":108,"message"')&&-1===b.indexOf('{"boolen":106,"message"')||(b=""),d&&"function"==typeof d?(d(b,a),a.data("nowPage")&&(a.removeData("nowPage"),$("input[name='p']",a).remove())):"json"==h&&("function"==typeof $.popBox?"1"==b.boolen?pop.success(b.message):pop.error(b.message):window.console&&console.error("please inport the pop module!")),i.enable(),j=c(j,"中..."),i.val(j)},error:function(){i.enable(),j=c(j,"中..."),i.val(j)},beforeSerialize:function(b){e.removeErrorMsg();var d=$(b),g=!0;if(g=e.validForm(a,d),g||(i.enable(),j=c(j,"中..."),i.val(j),a.data("initForm-valid",!1)),"function"==typeof f&&(g=f(a,g)&&g),g){if(a.data("nowPage")){var h=a.data("nowPage");a.prepend('<input type="hidden" name="p" value="'+h+'"/>')}}else i.enable(),j=c(j,"中..."),i.val(j);return g},beforeSubmit:function(){return a.data("initForm-valid",!0),g&&"function"==typeof g&&g(a),!0}};return i.enable(!1),i.val(k),$(this).ajaxSubmit(m),!1}var n=$(this),o=!0;if($("[valid]",a).each(function(){o=$(this).valid(n)&&o}),n.data("nowPage")){var p=n.data("nowPage");n.prepend('<input type="hidden" name="p" value="'+p+'"/>')}return o}),$("[valid]",a).each(function(){var b=$(this),c=b.attr("valid-options");b.bind("blur.initForm",function(){e.removeErrorMsg(b),b.removeClass("textMess_bd")}),b.bind("focus.initForm",function(){b.removeClass("textMess_bd")}),c&&(c=$.parseJSON(c),c.validOnBlur&&b.blur(function(){setTimeout(function(){try{var c=b.tipsy("tip"),d=c.attr("tipsyid");"trade_term"!=d&&"career_term"!=d&&"city_term"!=d&&b.valid(a)}catch(e){b.valid(a)}},100)}))}),a.data("init","1"))})}a("tipsy/tipsy");var e=a("validate/validate");!function(a){"use strict";function b(b){var c=b.data;b.isDefaultPrevented()||(b.preventDefault(),a(this).ajaxSubmit(c))}function c(b){var c=b.target,d=a(c);if(!d.is(":submit,input:image")){var e=d.closest(":submit");if(0===e.length)return;c=e[0]}var f=this;if(f.clk=c,"image"==c.type)if(void 0!==b.offsetX)f.clk_x=b.offsetX,f.clk_y=b.offsetY;else if("function"==typeof a.fn.offset){var g=d.offset();f.clk_x=b.pageX-g.left,f.clk_y=b.pageY-g.top}else f.clk_x=b.pageX-c.offsetLeft,f.clk_y=b.pageY-c.offsetTop;setTimeout(function(){f.clk=f.clk_x=f.clk_y=null},100)}function d(){if(a.fn.ajaxSubmit.debug){var b="[jquery.form] "+Array.prototype.join.call(arguments,"");window.console&&window.console.log?window.console.log(b):window.opera&&window.opera.postError&&window.opera.postError(b)}}var e={};e.fileapi=void 0!==a("<input type='file'/>").get(0).files,e.formdata=void 0!==window.FormData,a.fn.ajaxSubmit=function(b){function c(c){for(var d=new FormData,e=0;e<c.length;e++)d.append(c[e].name,c[e].value);if(b.extraData)for(var f in b.extraData)b.extraData.hasOwnProperty(f)&&d.append(f,b.extraData[f]);b.data=null;var g=a.extend(!0,{},a.ajaxSettings,b,{contentType:!1,processData:!1,cache:!1,type:"POST"});b.uploadProgress&&(g.xhr=function(){var a=jQuery.ajaxSettings.xhr();return a.upload&&(a.upload.onprogress=function(a){var c=0;a.lengthComputable&&(c=parseInt(a.position/a.total*100,10)),b.uploadProgress(a,a.position,a.total,c)}),a}),g.data=null;var h=g.beforeSend;g.beforeSend=function(a,c){c.data=d,h&&h.call(c,a,b)},a.ajax(g)}function f(c){function e(a){var b=a.contentWindow?a.contentWindow.document:a.contentDocument?a.contentDocument:a.document;return b}function f(){function b(){try{var a=e(p).readyState;d("state = "+a),a&&"uninitialized"==a.toLowerCase()&&setTimeout(b,50)}catch(c){d("Server abort: ",c," (",c.name,")"),h(y),u&&clearTimeout(u),u=void 0}}var c=j.attr("target"),f=j.attr("action");v.setAttribute("target",n),g||v.setAttribute("method","POST"),f!=l.url&&v.setAttribute("action",l.url),l.skipEncodingOverride||g&&!/post/i.test(g)||j.attr({encoding:"multipart/form-data",enctype:"multipart/form-data"}),l.timeout&&(u=setTimeout(function(){t=!0,h(x)},l.timeout));var i=[];try{if(l.extraData)for(var k in l.extraData)l.extraData.hasOwnProperty(k)&&i.push(a('<input type="hidden" name="'+k+'">').attr("value",l.extraData[k]).appendTo(v)[0]);l.iframeTarget||(o.appendTo("body"),p.attachEvent?p.attachEvent("onload",h):p.addEventListener("load",h,!1)),setTimeout(b,15),v.submit()}finally{v.setAttribute("action",f),c?v.setAttribute("target",c):j.removeAttr("target"),a(i).remove()}}function h(b){if(!q.aborted&&!D){try{C=e(p)}catch(c){d("cannot access response document: ",c),b=y}if(b===x&&q)return void q.abort("timeout");if(b==y&&q)return void q.abort("server abort");if(C&&C.location.href!=l.iframeSrc||t){p.detachEvent?p.detachEvent("onload",h):p.removeEventListener("load",h,!1);var f,g="success";try{if(t)throw"timeout";var i="xml"==l.dataType||C.XMLDocument||a.isXMLDoc(C);if(d("isXml="+i),!i&&window.opera&&(null===C.body||!C.body.innerHTML)&&--E)return d("requeing onLoad callback, DOM not available"),void setTimeout(h,250);var j=C.body?C.body:C.documentElement;q.responseText=j?j.innerHTML:null,q.responseXML=C.XMLDocument?C.XMLDocument:C,i&&(l.dataType="xml"),q.getResponseHeader=function(a){var b={"content-type":l.dataType};return b[a]},j&&(q.status=Number(j.getAttribute("status"))||q.status,q.statusText=j.getAttribute("statusText")||q.statusText);var k=(l.dataType||"").toLowerCase(),n=/(json|script|text)/.test(k);if(n||l.textarea){var r=C.getElementsByTagName("textarea")[0];if(r)q.responseText=r.value,q.status=Number(r.getAttribute("status"))||q.status,q.statusText=r.getAttribute("statusText")||q.statusText;else if(n){var s=C.getElementsByTagName("pre")[0],v=C.getElementsByTagName("body")[0];s?q.responseText=s.textContent?s.textContent:s.innerText:v&&(q.responseText=v.textContent?v.textContent:v.innerText)}}else"xml"==k&&!q.responseXML&&q.responseText&&(q.responseXML=F(q.responseText));try{B=H(q,k,l)}catch(b){g="parsererror",q.error=f=b||g}}catch(b){d("error caught: ",b),g="error",q.error=f=b||g}q.aborted&&(d("upload aborted"),g=null),q.status&&(g=q.status>=200&&q.status<300||304===q.status||1223===q.status||0===q.status?"success":"error"),"success"===g?(l.success&&l.success.call(l.context,B,"success",q),m&&a.event.trigger("ajaxSuccess",[q,l])):g&&(void 0===f&&(f=q.statusText),l.error&&l.error.call(l.context,q,g,f),m&&a.event.trigger("ajaxError",[q,l,f])),m&&a.event.trigger("ajaxComplete",[q,l]),m&&!--a.active&&a.event.trigger("ajaxStop"),l.complete&&l.complete.call(l.context,q,g),D=!0,l.timeout&&clearTimeout(u),setTimeout(function(){l.iframeTarget||o.remove(),q.responseXML=null},100)}}}var i,k,l,m,n,o,p,q,r,s,t,u,v=j[0],w=!!a.fn.prop;if(c)if(w)for(k=0;k<c.length;k++)i=a(v[c[k].name]),i.prop("disabled",!1);else for(k=0;k<c.length;k++)i=a(v[c[k].name]),i.removeAttr("disabled");if(a(":input[name=submit],:input[id=submit]",v).length)return void alert('Error: Form elements must not have name or id of "submit".');if(l=a.extend(!0,{},a.ajaxSettings,b),l.context=l.context||l,n="jqFormIO"+(new Date).getTime(),l.iframeTarget?(o=a(l.iframeTarget),s=o.attr("name"),s?n=s:o.attr("name",n)):(o=a('<iframe name="'+n+'" src="'+l.iframeSrc+'" />'),o.css({position:"absolute",top:"-1000px",left:"-1000px"})),p=o[0],q={aborted:0,responseText:null,responseXML:null,status:0,statusText:"n/a",getAllResponseHeaders:function(){},getResponseHeader:function(){},setRequestHeader:function(){},abort:function(b){var c="timeout"===b?"timeout":"aborted";d("aborting upload... "+c),this.aborted=1,o.attr("src",l.iframeSrc),q.error=c,l.error&&l.error.call(l.context,q,c,b),m&&a.event.trigger("ajaxError",[q,l,c]),l.complete&&l.complete.call(l.context,q,c)}},m=l.global,m&&0===a.active++&&a.event.trigger("ajaxStart"),m&&a.event.trigger("ajaxSend",[q,l]),l.beforeSend&&l.beforeSend.call(l.context,q,l)===!1)return void(l.global&&a.active--);if(!q.aborted){r=v.clk,r&&(s=r.name,s&&!r.disabled&&(l.extraData=l.extraData||{},l.extraData[s]=r.value,"image"==r.type&&(l.extraData[s+".x"]=v.clk_x,l.extraData[s+".y"]=v.clk_y)));var x=1,y=2,z=a("meta[name=csrf-token]").attr("content"),A=a("meta[name=csrf-param]").attr("content");A&&z&&(l.extraData=l.extraData||{},l.extraData[A]=z),l.forceSync?f():setTimeout(f,10);var B,C,D,E=50,F=a.parseXML||function(a,b){return window.ActiveXObject?(b=new ActiveXObject("Microsoft.XMLDOM"),b.async="false",b.loadXML(a)):b=(new DOMParser).parseFromString(a,"text/xml"),b&&b.documentElement&&"parsererror"!=b.documentElement.nodeName?b:null},G=a.parseJSON||function(a){return window.eval("("+a+")")},H=function(b,c,d){var e=b.getResponseHeader("content-type")||"",f="xml"===c||!c&&e.indexOf("xml")>=0,g=f?b.responseXML:b.responseText;return f&&"parsererror"===g.documentElement.nodeName&&a.error&&a.error("parsererror"),d&&d.dataFilter&&(g=d.dataFilter(g,c)),"string"==typeof g&&("json"===c||!c&&e.indexOf("json")>=0?g=G(g):("script"===c||!c&&e.indexOf("javascript")>=0)&&a.globalEval(g)),g}}}if(!this.length)return d("ajaxSubmit: skipping submit process - no element selected"),this;var g,h,i,j=this;"function"==typeof b&&(b={success:b}),g=this.attr("method"),h=this.attr("action"),i="string"==typeof h?a.trim(h):"",i=i||window.location.href||"",i&&(i=(i.match(/^([^#]+)/)||[])[1]),b=a.extend(!0,{url:i,success:a.ajaxSettings.success,type:g||"GET",dataType:"json",iframeSrc:/^https/i.test(window.location.href||"")?"javascript:false":"about:blank"},b);var k={};if(this.trigger("form-pre-serialize",[this,b,k]),k.veto)return d("ajaxSubmit: submit vetoed via form-pre-serialize trigger"),this;if(b.beforeSerialize&&b.beforeSerialize(this,b)===!1)return d("ajaxSubmit: submit aborted via beforeSerialize callback"),this;var l=b.traditional;void 0===l&&(l=a.ajaxSettings.traditional);var m,n=this.formToArray(b.semantic);if(b.data&&(b.extraData=b.data,m=a.param(b.data,l)),b.beforeSubmit&&b.beforeSubmit(n,this,b)===!1)return d("ajaxSubmit: submit aborted via beforeSubmit callback"),this;if(this.trigger("form-submit-validate",[n,this,b,k]),k.veto)return d("ajaxSubmit: submit vetoed via form-submit-validate trigger"),this;var o=a.param(n,l);m&&(o=o?o+"&"+m:m),"GET"==b.type.toUpperCase()?(b.url+=(b.url.indexOf("?")>=0?"&":"?")+o,b.data=null):b.data=o;var p=[];if(b.resetForm&&p.push(function(){j.resetForm()}),b.clearForm&&p.push(function(){j.clearForm(b.includeHidden)}),!b.dataType&&b.target){var q=b.success||function(){};p.push(function(c){var d=b.replaceTarget?"replaceWith":"html";a(b.target)[d](c).each(q,arguments)})}else b.success&&p.push(b.success);b.success=function(a,c,d){for(var e=b.context||b,f=0,g=p.length;g>f;f++)p[f].apply(e,[a,c,d||j,j])};var r=a("input:file:enabled[value]",this),s=r.length>0,t="multipart/form-data",u=j.attr("enctype")==t||j.attr("encoding")==t,v=e.fileapi&&e.formdata;d("fileAPI :"+v);var w=(s||u)&&!v;return b.iframe!==!1&&(b.iframe||w)?b.closeKeepAlive?a.get(b.closeKeepAlive,function(){f(n)}):f(n):(s||u)&&v?c(n):a.ajax(b),this.trigger("form-submit-notify",[this,b]),this},a.fn.ajaxForm=function(e){if(e=e||{},e.delegation=e.delegation&&a.isFunction(a.fn.on),!e.delegation&&0===this.length){var f={s:this.selector,c:this.context};return!a.isReady&&f.s?(d("DOM not ready, queuing ajaxForm"),a(function(){a(f.s,f.c).ajaxForm(e)}),this):(d("terminating; zero elements found by selector"+(a.isReady?"":" (DOM not ready)")),this)}return e.delegation?(a(document).off("submit.form-plugin",this.selector,b).off("click.form-plugin",this.selector,c).on("submit.form-plugin",this.selector,e,b).on("click.form-plugin",this.selector,e,c),this):this.ajaxFormUnbind().bind("submit.form-plugin",e,b).bind("click.form-plugin",e,c)},a.fn.ajaxFormUnbind=function(){return this.unbind("submit.form-plugin click.form-plugin")},a.fn.formToArray=function(b){var c=[];if(0===this.length)return c;var d=this[0],f=b?d.getElementsByTagName("*"):d.elements;if(!f)return c;var g,h,i,j,k,l,m;for(g=0,l=f.length;l>g;g++)if(k=f[g],i=k.name)if(b&&d.clk&&"image"==k.type)k.disabled||d.clk!=k||(c.push({name:i,value:a(k).val(),type:k.type}),c.push({name:i+".x",value:d.clk_x},{name:i+".y",value:d.clk_y}));else if(j=a.fieldValue(k,!0),j&&j.constructor==Array)for(h=0,m=j.length;m>h;h++)c.push({name:i,value:j[h]});else if(e.fileapi&&"file"==k.type&&!k.disabled){var n=k.files;for(h=0;h<n.length;h++)c.push({name:i,value:n[h],type:k.type})}else null!==j&&"undefined"!=typeof j&&c.push({name:i,value:j,type:k.type});if(!b&&d.clk){var o=a(d.clk),p=o[0];i=p.name,i&&!p.disabled&&"image"==p.type&&(c.push({name:i,value:o.val()}),c.push({name:i+".x",value:d.clk_x},{name:i+".y",value:d.clk_y}))}return c},a.fn.formSerialize=function(b){return a.param(this.formToArray(b))},a.fn.fieldSerialize=function(b){var c=[];return this.each(function(){var d=this.name;if(d){var e=a.fieldValue(this,b);if(e&&e.constructor==Array)for(var f=0,g=e.length;g>f;f++)c.push({name:d,value:e[f]});else null!==e&&"undefined"!=typeof e&&c.push({name:this.name,value:e})}}),a.param(c)},a.fn.fieldValue=function(b){for(var c=[],d=0,e=this.length;e>d;d++){var f=this[d],g=a.fieldValue(f,b);null===g||"undefined"==typeof g||g.constructor==Array&&!g.length||(g.constructor==Array?a.merge(c,g):c.push(g))}return c},a.fieldValue=function(b,c){var d=b.name,e=b.type,f=b.tagName.toLowerCase();if(void 0===c&&(c=!0),c&&(!d||b.disabled||"reset"==e||"button"==e||("checkbox"==e||"radio"==e)&&!b.checked||("submit"==e||"image"==e)&&b.form&&b.form.clk!=b||"select"==f&&-1==b.selectedIndex))return null;if("select"==f){var g=b.selectedIndex;if(0>g)return null;for(var h=[],i=b.options,j="select-one"==e,k=j?g+1:i.length,l=j?g:0;k>l;l++){var m=i[l];if(m.selected){var n=m.value;if(n||(n=m.attributes&&m.attributes.value&&!m.attributes.value.specified?m.text:m.value),j)return n;h.push(n)}}return h}return a(b).val()},a.fn.clearForm=function(b){return this.each(function(){a("input,select,textarea",this).clearFields(b)})},a.fn.clearFields=a.fn.clearInputs=function(a,b){var c=/^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i;return this.each(function(){var d=this.type,e=this.tagName.toLowerCase();c.test(d)||"textarea"==e||a&&/hidden/.test(d)?this.value="":"checkbox"==d||"radio"==d?this.checked=!1:"select"==e&&(this.selectedIndex="undefined"!=typeof b?b:-1)})},a.fn.resetForm=function(){return this.each(function(){("function"==typeof this.reset||"object"==typeof this.reset&&!this.reset.nodeType)&&this.reset()})},a.fn.enable=function(b){return void 0===b&&(b=!0),this.each(function(){this.disabled=!b,b?a(this).removeClass("btn-disabled"):a(this).addClass("btn-disabled")})},a.fn.selected=function(b){return void 0===b&&(b=!0),this.each(function(){var c=this.type;if("checkbox"==c||"radio"==c)this.checked=b;else if("option"==this.tagName.toLowerCase()){var d=a(this).parent("select");b&&d[0]&&"select-one"==d[0].type&&d.find("option").selected(!1),this.selected=b}})},a.fn.ajaxSubmit.debug=!1}(jQuery),b.init=d,b.validForm=e.validForm});