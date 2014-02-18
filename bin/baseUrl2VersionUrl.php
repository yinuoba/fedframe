<?php 
  /**
   * 传入url，转换成带时间戳的url
   * @param  [type] $url [description]
   * @return [type]      [description]
   */
  function baseUrl2VersionUrl($url){
      $filePath = SITE_PATH.$url;
      if(is_file($filePath)){
          $lastModified = date('YmdHis', filemtime($filePath));
          echo $url."?v=".$lastModified;
      } else {
        echo $url;
      }
  }
 ?>