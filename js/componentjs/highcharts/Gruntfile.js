'use strict';

module.exports = function(grunt) {
    // wrap配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),   // 加载配置文件
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' + 
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %>;',

        clean: {    // 清空dist目录
            files: ['dist/js/componentjs/highcharts']
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            js: {    // 应用对应的js文件
                files: [
                    {
                        expand: true,
                        src: ['js/**/*.js', '!js/**/*.src.js'],
                        dest: '../../../dist/js/componentjs/highcharts/',
                        ext: '.js'
                    }
                ]
            }
        },

        copy: { // 文件copy
            depFolder: {
                files: [
                    {
                        src: [ 'graphics/**', 'gfx/**'],
                        dest: '../../../dist/js/componentjs/highcharts/'
                    }
                ]
            }
        }
    });

    // 加载需要的Grunt插件
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    
    // 注册默认任务.
    grunt.registerTask('default', ['uglify', 'copy']);

};