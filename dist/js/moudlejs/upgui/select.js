/*! upgF2E - v0.1.0 
* https://www.yrz.cn/
* Copyright (c) 2014 Front-End development team of UPG Cloud Financing Department; Licensed MIT */
define("upgui/select",[],function(a,b){var c=function(){this.speed=100;var a=this;this.ui=function(b){var c=b.children("select");if(c.length){var d=c.attr("name"),e=c.children("option:selected"),f=e.text(),g=e.val(),h=c.children("option"),i=$("<input>").attr("class","inputCommon").attr("readonly","readonly").val(f).appendTo(b),j=$("<i>").attr("class","ui_select_arrow").text("▼").appendTo(b),k=$("<ul>").attr("class","ui_select_ul").hide().appendTo(b),l=$("<input>").attr("type","hidden").attr("name",d).val(g).appendTo(b);"undefined"!=typeof c.attr("valid")&&l.attr("valid",""),"undefined"!=typeof c.attr("valid-msg-options")&&l.attr("valid-msg-options",c.attr("valid-msg-options"));for(var m=0;m<h.length;m++){var n=h.eq(m),o=$("<li>").attr("rel",n.attr("value")).text(n.text()).appendTo(k);n.attr("value")==g&&o.addClass("selected")}k.height()>200&&k.css({"overflow-y":"scroll",height:"200px"}),k.children("li").click(function(){l.val($(this).attr("rel")).trigger("change"),i.val($(this).text()),$(this).siblings().removeClass("selected").end().addClass("selected"),k.slideUp(a.speed)}).hover(function(){$(this).addClass("hover")},function(){$(this).removeClass("hover")}),j.click(function(b){k.slideToggle(a.speed),$(".ui_select_ul").not($(this).parent().children(".ui_select_ul")).hide(),b.stopPropagation()}),i.click(function(a){j.trigger("click"),a.stopPropagation()}),$("body").click(function(){k.slideUp(a.speed)}),c.remove()}}};b.init=function(a){var b=new c;$(a).each(function(){b.ui($(this))})}});