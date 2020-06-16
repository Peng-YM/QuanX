# OpenAPI

优雅的跨平台脚本API，一种代码，同时支持Quantumult X, Loon, Surge, JSBox 和Node JS。让开发者更轻松在Node平台调试代码。

## 示例

### 开始使用
将`api-minified.js`内容复制到js脚本下方。
```javascript
const $ = API("weather"); // 创建一个名字为weather的脚本。默认为product环境。
const $ = API("weather", true); // 打开debug环境，抑制所有log输出，保持error信息。
```

### Log
```javascript
$.log("Something"); // 如果debug设置为false, log不会有任何输出。
$.info("Some important thing"); // 需要展示给用户的info信息，不受debug影响。
$.error("Some error message"); // 错误信息，不受debug影响。
```

## 通知

```javascript
$.notify("title", "subtitle", "content"); // 简单标题
// URL标题
$.notify("title", "subtitle", "content", "https://www.bing.com") // 带URL跳转的标题
$.notify("title", "subtitle", "content", {"open-url": "https://www.bing.com"}) // QX写法
// 多媒体标题，QX >= build 316, 其他平台不会显示多媒体内容。
$.notify("title", "subtitle", "content", {"media-url": "https://avatars2.githubusercontent.com/u/21050064?s=460&u=40a74913dd0a3d00670d05148c3a08c787470021&v=4"}) 
```

### HTTP

HTTP接口在Node使用request实现，需要用npm安装request。推荐通过如下操作安装到全局，并link。

```bash
npm install -g request
# 在工作目录
npm link request
```

示例如下：

```javascript
// GET
$.get("https://postman-echo.com/get?foo1=bar1&foo2=bar2")
  .then((resp) => {
    // do something with response
  })
  .catch((err) => {
    // handle errors
  });

// POST
const sample = {
  data: "ECHO",
};

$.post({
  url: "http://scooterlabs.com/echo",
  body: JSON.stringify(sample),
})
  .then((resp) => {
    // do something with response
  })
  .catch((err) => {
    // handle errors
  });
```

### 持久化

```javascript
$.write("VALUE", "KEY"); // 将VALUE保存到KEY中
$.read("KEY"); // 将KEY的值取出
$.delete("KEY"); // 删除KEY的值
$.cache; // 当前脚本所有的缓存
$.done();
```

持久化在OpenAPI中得到了巨大改进，在不同环境下，其表现如下：

#### 1. QX & Loon & Surge

整个API对象共用一个`cache`，所以`$.write("VALUE", "KEY")`其实只是把值保存到`cache`中。然后`cache`会被以`name`属性作为key保存到`$prefs`或者`$persistentStore`中。这形成了每个脚本独自的缓存空间，避免key碰撞的情况产生。

```javascript
const $1 = API("APP1");
const $2 = API("APP2");

// 这是安全的！
$1.write("data", "key");
$2.write("data", "key");
```

#### 2. Node & JSBox (2.0+)

Node环境中，`cache`会被保存到和脚本同级目录下的`name.json`中。

### 其他

#### 延时

```javascript
$.wait(1000).then(()=>{
	// 等待1000毫秒之后执行
})

// 在任何Promise后面可以自定义delay
$.get("http://www.baidu.com")
.delay(1000) // 延迟1000毫秒
.then(resp => {
  // do something with response.
})
```



