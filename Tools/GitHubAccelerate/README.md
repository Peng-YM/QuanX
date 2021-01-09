# GitHub 反向代理加速

## 1. 原理
使用Cloudflare Worker的云函数加速GitHub访问，重定向GitHub访问请求到Cloudflare，实现GitHub raw，gist文件的CDN直连访问。

优点：

1. 直连访问GitHub托管的配置、分流、订阅等。
2. CDN加速，访问速度更快。

## 2. 使用
- **Surge**，使用[Surge模块](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/GitHubAccelerate/surge.sgmodule)。
- **QX**，订阅[远程重写](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/GitHubAccelerate/qx.conf)。
- **Loon**，使用[插件](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/GitHubAccelerate/loon.plugin)。

## 3. 测试
完成以上配置之后，尝试全局直连访问[彩云天气脚本](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/caiyun.js)，看看浏览器地址栏是否已经跳转到了`cdn.jsdelivr.net`这个域名。如果成功访问，说明GitHub反代成功。