import re
import os,time

inputDir = 'dist/css/'

prevDir = os.path.abspath('..')
p = re.compile('url\([\'\"]?((.+?)\.(png|jpg|jpeg|gif))[\'\"]?\)',re.I)
revRegex = re.compile('Last Changed Rev: (\d+)')

def getTimestampArr(url):
    i = url.find('?')
    if i != -1:
        m = url.split('?')
        return m
    else:
        return [url, 0]

def getLastModifyVer(url):
    # print(url)
    # print(os.path.isfile(url))
    if os.path.isfile(url):
        ver = os.path.getmtime(url)
    else:
        ver = 0
    # if os.path.isfile(url):
    #     cmd = 'svn info ' + url
    #     ret = os.popen(cmd)
    #     info = ret.read()

    #     ver = revRegex.findall(info)
    #     if ver:
    #         ver = ver[0]
    #     else:
    #         ver = 0
    # else:
    #     ver = 0
    return int(ver)
 
files = os.listdir(inputDir)
cssFiles = []

for f in files:
    f = f.lower()
    if f.endswith('.css'):
        cssFiles.append(f)

for f in cssFiles:
    out = open(inputDir + f, 'r+')
    content = out.read()
    m = p.findall(content)
    # print(m)
    # os._exit(0)
    if m:
        replaceCache = {}
        for u in m:
            u = u[0]

            if u.startswith('http://'):
                continue
            tarr = getTimestampArr(u)
            # print(tarr[1])

            oldT = tarr[1]

            newT = getLastModifyVer(prevDir + u)
            #replaceCache.has_key(u)
            
            if newT > oldT and (not (u in replaceCache)):
                newUrl = str(tarr[0]) + '?v=' + str(newT)
                content = content.replace(u, newUrl)
                replaceCache[u] = 1
            else:
                continue

        out.seek(0)
        out.write(content)
        out.close()