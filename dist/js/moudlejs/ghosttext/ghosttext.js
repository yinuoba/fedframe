/*! upgF2E - v0.1.0 
* https://www.yrz.cn/
* Copyright (c) 2014 Front-End development team of UPG Cloud Financing Department; Licensed MIT */
define("ghosttext/ghosttext",[],function(a,b){function c(a){var b,c=a||!1;b=a&&a.attr("ghosttext")?a:a?$("[ghosttext]",a):$("[ghosttext]"),b.each(function(){var a=$(this),b=a.attr("id")||a.attr("name");if(!a.data("initGhostText")||c){c&&a.data("initGhostText")&&(a.unbind("focus change blur keyup keydown"),a.siblings("label.gt").remove(),a.unwrap()),a.data("initGhostText","1"),a.bind({focus:function(b){d(b,a)},change:function(b){d(b,a)},blur:function(){if(0==a.val().length){var b=a.prev("label");b.length||(b=a.parent().siblings("label")),b.removeClass("fgt").show()}},keyup:function(b){d(b,a)},keydown:function(b){d(b,a,!0)}});var e=a.attr("ghosttext"),f=$("<label/>").addClass("gt").html(e).click(function(){a.focus()});a.parent("div").hasClass("ghosttext")||a.wrapAll('<div style="display:inline-block;" class="ghosttext ghosttexttarget-'+b+'"/>'),a.before(f),a.val().length>0&&d(null,a,!0)}})}function d(a,b,c){var d=b.prev("label");d.length||(d=b.parent().siblings("label")),b.val().length>0||c?d.removeClass("fgt").hide():0==b.val().length&&("change"!=a.type&&d.addClass("fgt"),d.show())}b.init=c});