#!/bin/bash

### static package shell

### Grunt css
cd /var/www/YRZIF/public/css
if find . -name "*.css" -mtime -2|egrep -q "*.css"
 then
   cd /var/www/YRZIF/public/
   grunt cssmin
fi
### Grunt css

### Grunt basejs
cd /var/www/YRZIF/public/basejs
if find . -name "sea*.js" -mmin -60|egrep -q "*.js"
  then
   cd /var/www/YRZIF/public/
   grunt uglify:seajs
else
 if find . -name "*.js" -mmin -60|egrep -q "*.js"
  then
   cd /var/www/YRZIF/public/
   grunt uglify:basejs
 fi
fi
### Grunt basejs

### Grunt spider
cd /var/www/YRZIF/public/componentjs/highcharts
if find . -name "*.js" -mmin -60|egrep -q "*.js"
 then
   cd /var/www/YRZIF/public/
   grunt uglify:spider
fi
### Grunt spider


### Grunt moudlejs and appjs
cd /var/www/YRZIF/public/moudlejs
if find . -name "*.js" -mmin -60 -o -name "*.css" -mmin -60|egrep -q "*.js|*.css" ### moudlejs
 then
   cd /var/www/YRZIF/public/
   grunt transport
   grunt concat
   grunt uglify:moudlejs
   grunt uglify:appjs
 else ### appjs
  cd /var/www/YRZIF/public/appjs

  if find . -name "*.js" -mmin -60|egrep -q "*.js" ;then
   echo "[" `find . -name \*.js -mmin -60|perl -pi -e 's/(^.*?$)/"\1",/g'|perl -pi -e 's/\.\///g'|perl -pi -e 's/\n//g'`|perl -pi -e 's/,\n$//g'>../updateAppjs.json;echo "]" >> ../updateAppjs.json
   cd /var/www/YRZIF/public/
   grunt transport:appjs
   grunt concat:appjs
   grunt uglify:appjs
   echo '["**/*.js", "!**/*-debug.js"]' > updateAppjs.json
  fi
fi
### Grunt moudlejs and appjs

### static package shell

#### start 自动提交dist  #####
cd /var/www/YRZIF/public/dist/
svn --username=yrzif --password=yrzif --no-auth-cache status |egrep "^\?"|awk '{print "svn --username=yrzif --password=yrzif --no-auth-cache add "$2}'|bash
svn --username=yrzif --password=yrzif --no-auth-cache status |egrep "^\!"|awk '{print "svn --username=yrzif --password=yrzif --no-auth-cache del "$2}'|bash
svn --username=yrzif --password=yrzif --no-auth-cache ci . -m "运维环境自动提交" |tee -a /var/log/YRZIFsvn.log
cd /var/www/YRZIF/
#### end 自动提交dist   ####