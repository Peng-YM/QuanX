# Scripts
Scripts for QuantumultX, Loon, Surge, JSBox and Node.
## Tasks
定时任务合集

boxjs订阅：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/box.js.json


task合集：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/task.json

### 概览

|                             脚本                             |              作用               |   推荐配置   | 预览 |
| :----------------------------------------------------------: | :-----------------------------: | :----------: | ------------------------------------------------------------ |
| [彩云天气](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/caiyun.js) | 基于彩云天气API推送实时天气 | 30 8-22 * * * | [DEMO](https://raw.githubusercontent.com/Peng-YM/QuanX/master/demos/caiyun.JPG) |
| [纵横小说](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/zongheng.js) |        监测纵横小说更新         | */30 * * * * | [DEMO](https://raw.githubusercontent.com/Peng-YM/QuanX/master/demos/zongheng.JPG) |
| [Github](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/github.js) | 监测Github仓库的Commit和Release |  0 9 * * *   | [DEMO](https://raw.githubusercontent.com/Peng-YM/QuanX/master/demos/github.JPG) |
| [今日汇率](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/exchange.js) | 汇率监控 |  0 9 * * *   | [DEMO](https://raw.githubusercontent.com/Peng-YM/QuanX/master/demos/exchange.JPG) |
| [Steam](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/steam.js) | Steam日报 | 0 9 * * * | [DEMO](https://raw.githubusercontent.com/Peng-YM/QuanX/master/demos/steam.JPG) |
| [Epic](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/epic.js) | Epic周免 | 55 23 ? * THU | [DEMO](https://raw.githubusercontent.com/Peng-YM/QuanX/master/demos/epic.JPG) |
| [PSN](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/psn.js) | PSN会免 | 0 9 1 * * | [DEMO](https://raw.githubusercontent.com/Peng-YM/QuanX/master/demos/psn.JPG) |
| [疫情日报](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/nCov.js) | 推送当前地区疫情信息 | 0 9 * * * | [DEMO](https://raw.githubusercontent.com/Peng-YM/QuanX/master/demos/nCov.JPG) |
| [✈️ 流量](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/flow.js) | 查询✈️ 流量 | 0 9 * * * | [DEMO](https://raw.githubusercontent.com/Peng-YM/QuanX/master/demos/flow.JPG) |
| [TG多媒体推送](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/telegram.js) | 推送TG频道图文视频 | 0 9 * * * | [DEMO]() |

## Developer

### ⭐️ OpenAPI

优雅的跨平台脚本API，一种代码，同时支持**Quantumult X**, **Loon**, **Surge**, **JSBox** 和**Node.js**。[了解更多](https://github.com/Peng-YM/QuanX/tree/master/Tools/OpenAPI)

### ⭐️ MITM Proxy

为开发者打造的又一神兵利器！电脑端MITM拦截请求并运行指定JavaScript脚本修改`Request`和`Response`。[了解更多](https://github.com/Peng-YM/QuanX/tree/master/Tools/MITM)

## Tools

### 自动定位

在脚本中获取系统准确定位的可靠方法。[了解更多](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/Location/locate.js)

### Github私有仓库
允许引用Github私有仓库/gist中的订阅分流，重写，脚本等配置文件。[了解更多](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Rewrites/GithubPrivate/github-private-repo.js)

### SSID 自动策略切换
可能是最强的SSID脚本，适用于Surge和Loon，根据当前网络自动切换策略组。由于运行模式的全局直连下，去广告，网易云等分流也会失效，使用此脚本完全解决了此类问题。[了解更多](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/AutoPolicy/auto-policy.js)

### SSID 运行模式

网络变化时自动根据设定调整当前 Surge & Loon 的代理模式。[了解更多](https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/RunningMode/running-mode.js)


## ❗❗❗免责声明

1. 此项目中的脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2. 由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3. 请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4. 此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5. 本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6. 如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我将在收到认证文件确认后删除此脚本。
7. 所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
