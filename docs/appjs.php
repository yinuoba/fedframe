<?php 
	function appjs(){
      if(C('STATIC_DEBUG') || isset($_REQUEST['static_debug'])){  // 开发环境
          $path = "/public/js/appjs/".strtolower(GROUP_NAME)."/".strtolower(MODULE_NAME)."/".strtolower(ACTION_NAME).".js";
          $commonjs = "/public/js/appjs/common/common.js";
      } else {    // 生产环境
          $path = "/public/dist/js/appjs/".strtolower(GROUP_NAME)."/".strtolower(MODULE_NAME)."/".strtolower(ACTION_NAME).".js";
          $commonjs = "/public/dist/js/appjs/common/common.js";
      }
      $tmpPath = SITE_PATH . $path;
      $tmpCommon = SITE_PATH . $commonjs;
      if(is_file($tmpCommon)){ // 加载commonjs
          $lastModifiedCommonjs = date('YmdHis', filemtime($tmpCommon));
          echo "<script>seajs.config({map:[[/^(.*\.(?:css|js))(.*)$/i, '$1?v=".$lastModifiedCommonjs."']]}); seajs.use([\"{$commonjs}?\"])</script>";
      }
      if(is_file($tmpPath)){  // 加载appjs
          $lastModifiedAppjs = date('YmdHis', filemtime($tmpPath));
          echo "<script>seajs.config({map:[[/^(.*\.(?:css|js))(.*)$/i, '$1?v=".$lastModifiedAppjs."']]}); seajs.use([\"{$path}?\"])</script>";
      }
  }
 ?>