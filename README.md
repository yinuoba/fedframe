fedframe
======

前端项目模块化开发脚手架

## project tree

	.项目根目录
	+---.build (项目构建临时目录)
	+---css (css目录)
	|   +---mainsource(各个模块的css文件，开发环境由mainsource.css引入，生产环境被压到main.min.css中)
	|   |   ---modules1.css
	|   |   ---modules2.css
	|   |   ---modules3.css
	|   ---reset.css (重置、统一浏览器样式)
	|   ---common.css (头部、底部、表格、按钮等公共样式)
	|   ---mainsource.css (引入mainsource该文件夹下的模块css文件)
	+---dist (grunt发布目录)
	|   +---js
	|   |   +---basejs
	|   |   +---appjs
	|   |   +---modulejs
	|   |   +---componentjs
	|   +---css
	|   |   ---base.min.css (合并reset.css和common.css)
	|   |   ---main.min.css (合并mainsource等其他模块css文件)
	+---images (组件、插件的图片文件夹)
	|   +---demoimg (放测试用的图片)
	|   +---97date
	|   +---box2
	|   +---colorbox
	|   +---hovercard
	|   +---industry
	|   +---jcarousel
	|   +---jcorp
	|   +---jqueryui
	|   +---load
	|   +---multiselect
	|   +---orderlist
	|   +---pop
	|   +---popimage
	|   +---search
	|   +---tipsy
	|   +---upload
	|   +---uploadify
	|   +---webcam
	|   +---zclip
	+---js (js开发目录，符合cmd规范)
	|   +---appjs (与业务对应的模块)
	|   |   +---common (公用模块)
	|   |      ---common.js (全站共用业务js)
	|   +---basejs (基础模块)
	|   |   ---jquery.js
	|   |   ---prototype.js
	|   |   ---sea.js
	|   |   ---seastyle.js
	|   |   ---upgTool.js
	|   +---componentjs (富应用组件)
	|   |   +---highcharts (图表)
	|   |   +---ueditor (百度ueditor编辑器)
	|   +---moudlejs (cmd模块组件)
	|   |   +---ajaxform
	|   |   +---animatecolor
	|   |   +---area
	|   |   +---autocomplete
	|   |   +---banner
	|   |   +---box2
	|   |   +---box3
	|   |   +---colorbox
	|   |   +---cookie
	|   |   +---countdown
	|   |   +---datepicker
	|   |   +---datepickerui
	|   |   +---easing
	|   |   +---ghosttext
	|   |   +---hovercard
	|   |   +---hoverdelay
	|   |   +---industry
	|   |   +---jcarousel
	|   |   +---jcorp
	|   |   +---jqueryui
	|   |   +---jscrollpane
	|   |   +---mousewheel
	|   |   +---multiselect
	|   |   +---orderlist
	|   |   +---passwordrate
	|   |   +---pop
	|   |   +---popimage
	|   |   +---position
	|   |   +---rotate
	|   |   +---search
	|   |   +---slideimgtab
	|   |   +---tagit
	|   |   +---textlength
	|   |   +---timepicker
	|   |   +---tipsy
	|   |   +---upgui
	|   |   +---upload
	|   |   +---uploadify
	|   |   +---validate
	|   |   +---verifyid
	|   |   +---webcam
	|   |   +---widget
	|   |   +---zclip
	|   ---nocmdjs (非cmd模块js)
	+---tpl (静态模板)
	|---package.json (grunt打包配置文件)
	|---Gruntfile.js (grunt打包配置文件)
	|---updateAppjs.json (grunt打包配置文件，用于暂存一定时间内改动过的appjs中的js文件)

## 环境要求

* Node 0.10.13及以上
* Grunt 0.4.1及以上
* python 2.6 及以上

## JavaScript规范

fedframe-javascript规范：[http://www.mindmeister.com/368844213/javascript](http://www.mindmeister.com/368844213/javascript "fedframe-javascript 规范")

## 前端工具

fedframe常用工具：[http://www.mindmeister.com/368884878/](http://www.mindmeister.com/368884878/ "fedframe常用工具")
