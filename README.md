fedframe
======

前端项目模块化开发脚手架

## project tree

	.项目根目录
	+---.build (项目构建临时目录)
	+---css (css目录)
	|   +---main(各个模块的css文件，开发环境由mainsource.css引入，生产环境被压到main.min.css中)
	|   |   ---modules1.css
	|   |   ---modules2.css
	|   |   ---modules3.css
	|   ---reset.css (重置、统一浏览器样式)
	|   ---common.css (头部、底部、表格、按钮等公共样式)
	|   ---main.import.css (引入main文件夹下的模块css文件)
	|   ---main.combo.css (main.import.css文件经combo后的文件)
	+---dist (grunt发布目录)
	|   +---js
	|   |   +---basejs
	|   |   +---appjs
	|   |   +---modulejs
	|   |   +---componentjs
	|   +---css
	|   |   ---base.min.css (合并reset.css和common.css)
	|   |   ---main.min.css (合并main等其他模块css文件)
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
	|   ---normaljs (非cmd模块js)
	+---tpl (静态模板)
	+---bin (运用在项目中时的一些脚本片段)
	|   ---appjs.php (项目中引入对应业务的方法)
	|   ---baseUrl2VersionUrl.php (根据文件路径返回以最后修改时间为版本号的url)
	|   ---cssimage.py (给css文件中的背景图片url加版本号)
	|   ---publish.sh (打包脚本，一般放在打包服务器的更新脚本中)
	|   ---static.include.html (引入静态文件)
	|   ---Preferences.sublime-settings (sublime配置文件)
	|   ---SublimeLinter.sublime-settings (SublimeLinter配置文件)
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

## 项目部署

	$ npm install
	$ grunt
