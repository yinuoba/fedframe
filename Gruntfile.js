'use strict';

module.exports = function(grunt) {
  var transport = require('grunt-cmd-transport');
  var style = transport.style.init(grunt);
  var text = transport.text.init(grunt);
  var script = transport.script.init(grunt);
  console.info(grunt.file.readJSON('updateAppjs.json'));
  // wrap配置
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'), // 加载配置文件
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> \n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    appjsFiles: grunt.file.readJSON('updateAppjs.json'), // 加载需要压缩的文件的json文件

    clean: { // 清空dist目录
      appjs: ["dist/js/appjs/**/*", "!dist/js/appjs/**/*.svn"],
      basejs: ["dist/js/basejs/**/*", "!dist/js/basejs/**/*.svn"],
      css: ["dist/css/**/*", "!dist/css/**/*.svn"],
      moudlejs: ["dist/js/moudlejs/**/*", "!dist/js/moudlejs/**/*.svn"],
      build: '.build'
    },

    transport: {
      options: {
        paths: ['js/moudlejs/'],
        parsers: {
          '.js': [script.jsParser],
          '.css': [style.css2jsParser],
          '.html': [text.html2jsParser]
        }
      },
      moudlejs: {
        files: [{
          expand: true,
          cwd: 'js/moudlejs/',
          src: ['**/*', '!**/*.html'],
          dest: '.build/js/moudlejs/'
        }]
      },
      appjs: {
        options: {
          idleading: '/public/dist/js/appjs/'
        },
        files: [{
          cwd: 'js/appjs/',
          src: '<%= appjsFiles %>',
          filter: 'isFile',
          dest: '.build/js/appjs'
        }]
      }
    },

    concat: {
      options: {
        paths: ['.build/js/moudlejs/'],
        include: 'relative'
      },
      moudlejs: {
        files: [{
          expand: true,
          cwd: '.build/js/',
          src: ['moudlejs/**/*.js'],
          dest: '.build/js/',
          ext: '.js'
        }]
      },
      appjs: {
        options: {
          include: 'all'
        },
        files: [{
          expand: true,
          cwd: '.build/js/appjs/',
          src: '<%= appjsFiles %>',
          dest: '.build/js/appjs/',
          ext: '.js'
        }]
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      basejs: { // 基础库相关
        files: {
          'dist/js/basejs/base.min.js': ['js/basejs/jquery.js', 'js/basejs/prototype.js', 'js/basejs/upgtool.js']
        }
      },
      seajs: { // seajs及其组建相关
        files: {
          'dist/js/basejs/seajs.min.js': ['js/basejs/sea.js', 'js/basejs/seastyle.js']
        }
      },
      moudlejs: { // seajs模块
        files: [{
          expand: true,
          cwd: '.build/',
          src: ['js/moudlejs/**/*.js', '!js/moudlejs/**/*-debug.js'],
          dest: 'dist/',
          ext: '.js'
        }]
      },
      appjs: { // 应用对应的js文件
        files: [{
          expand: true,
          cwd: '.build/js/appjs/',
          src: '<%= appjsFiles %>',
          dest: 'dist/js/appjs/',
          ext: '.js'
        }]
      },
      spider: {
        files: {
          'dist/js/componentjs/highcharts/js/app/highcharts.spider.min.js': ['js/componentjs/highcharts/js/highcharts.js', 'js/componentjs/highcharts/js/modules/exporting.js', 'js/componentjs/highcharts/js/highcharts-more.js']
        }
      }
    },
    
    css_combo: {
      options: {
        banner: '<%= banner %>'
      },
      main: {
        files: {
          'css/main.combo.css': ['css/main.import.css']
        }
      }
    },

    cssmin: { // css压缩、合并
      options: {
        banner: '<%= banner %>'
      },
      basecss: { // 整站通用基础css
        files: {
          'dist/css/base.min.css': ['css/reset.css', 'css/common.css']
        }
      },
      mainsource: {
        files: {
          'dist/css/main.min.css': ['css/main.combo.css']
        }
      },
      moudlecss: { // moudle模块里面的css
        files: [{
          expand: true,
          cwd: 'js/moudlejs/',
          src: ['**/*.css'],
          dest: 'dist/js/moudlejs/',
          ext: '.css'
        }]
      }
    },

    copy: { // 文件copy
      moudlehtml: {
        files: [{
          expand: true,
          cwd: 'js/moudlejs/',
          src: ['**/*.html'],
          dest: 'dist/js/moudlejs/',
          ext: '.html'
        }]
      },
      moudlejs: {
        files: [{
          expand: true,
          cwd: 'js/moudlejs/',
          src: ['datepicker/calendar.js'],
          dest: 'dist/js/moudlejs/',
          ext: '.js'
        }]
      },
      moudleswf: {
        files: [{
          expand: true,
          cwd: 'js/moudlejs/',
          src: ['**/*.swf'],
          dest: 'dist/js/moudlejs/',
          ext: '.swf'
        }]
      }
    },

    imagemin: { // 批量无损压缩图片
      image: {
        options: {
          optimizationLevel: 3 //定义 PNG 图片优化水平
        },
        files: [{
          expand: true,
          cwd: 'image/',
          src: ['**/*.{png,jpg,jpeg,gif}'], // 优化 image 目录下所有 png/jpg/jpeg/gif 图片
          dest: 'image/' // 优化后的图片保存位置，覆盖旧图片，并且不作提示
        }]
      }
    },

    watch: {
      basejs: { // 基础库相关
        files: ['js/basejs/jquery.js', 'js/basejs/prototype.js', 'js/basejs/upgtool.js', 'js/basejs/common.js'],
        tasks: ['uglify:basejs']
      },
      seajs: { // seajs及其组建相关
        files: ['js/basejs/sea.js', 'js/basejs/seastyle.js'],
        tasks: ['uglify:seajs']
      },
      moudlejs: { // seajs模块
        files: ['js/moudlejs/**/*.js', 'js/moudlejs/**/*.css', '!js/moudlejs/**/*-debug.js'],
        tasks: ['transport', 'concat', 'uglify:moudlejs', 'uglify:appjs']
      },
      appjs: { // 应用对应的js文件
        files: ['js/appjs/**/*.js', '!js/appjs/**/*-debug.js'],
        tasks: ['transport:appjs', 'concat:appjs', 'uglify:appjs']
      },
      spider: {
        files: ['js/componentjs/highcharts/js/highcharts.js', 'js/componentjs/highcharts/js/modules/exporting.js', 'js/componentjs/highcharts/js/highcharts-more.js'],
        tasks: ['uglify:spider']
      },
      basecss: { // 整站通用基础css
        files: ['css/global.css', 'css/common.css'],
        tasks: ['cssmin:basecss']
      },
      css_combo: {
        files: ['css/mainsource/**/*.css'],
        tasks: ['css_combo']
      }
    }
  });

  // 加载需要的Grunt插件
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-cmd-transport');
  grunt.loadNpmTasks('grunt-cmd-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-css-combo');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // 注册默认任务.
  grunt.registerTask('default', ['transport', 'concat', 'uglify', 'css_combo', 'cssmin', 'copy']);
  grunt.registerTask('combo', ['css_combo']);
};