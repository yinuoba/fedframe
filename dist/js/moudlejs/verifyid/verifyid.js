/*! upgF2E - v0.1.0 
* https://www.yrz.cn/
* Copyright (c) 2014 Front-End development team of UPG Cloud Financing Department; Licensed MIT */
define("verifyid/verifyid",["pop/pop","colorbox/colorbox","box2/box2"],function(a,b){var c=(a("pop/pop"),a("box2/box2"),function(){var a="/Account/IdAuth/isAuthId",b=!0;return $.ajax({url:a,async:!1,dataType:"json",success:function(a){if(a&&0==a.boolen){var c="/Account/IdAuth/verifyId";$.colorbox({href:c}),b=!1}}}),b});$("[verifyid]").on("click",function(){var a=c();return a}),b.init=c});