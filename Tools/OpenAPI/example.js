const $ = API("APP", true); // API("APP") --> 无log输出
// 测试console
$.log("测试输出");
$.error("这是一条错误信息");


// 测试通知
$.notify("标题");
$.notify("跳转测试", "Subtitle", "点击跳转", {
  "open-url": "http://www.bing.com"
});
$.notify("图片测试（QX有效）", "Subtitle", "", {
  "media-url":
    "https://avatars2.githubusercontent.com/u/21050064?s=460&u=40a74913dd0a3d00670d05148c3a08c787470021&v=4",
});
$.notify("HELLO", "", "")

// 测试缓存
const key = "测试";
const data = "数据";
$.write(data, key);
$.write("Hello", "World");
$.log(`当前缓存：\n${JSON.stringify($.cache)}`);
if ($.read(key) !== data) {
  $.notify("缓存测试炸了！", "", "");
} else {
  $.log("缓存测试通过！");
}
$.delete(key);
if ($.read(key)) {
  $.log("缓存Key未删除！");
}

$.write("World", "#Hello");
if ($.read("#Hello") !== "World") {
  $.notify("缓存测试炸了！", "", "");
} else {
  $.log("缓存测试通过！");
}

$.delete("#Hello");
if ($.read("#Hello")) {
  $.log("缓存Key未删除！");
}

const obj = {
  hello: {
    world: "HELLO"
  }
};

$.write(obj, "obj");

// 测试请求
const headers = {
  "user-agent": "OpenAPI",
}
const rawBody = "This is expected to be sent back as part of response body.";
const jsonBody = {
  HELLO: "WORLD",
  FROM: "OpenAPI"
}

function assertEqual(a, b) {
  for (let [key, value] of Object.entries(a)) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}
!(async () => {
  await $.http.get({
    url: "https://postman-echo.com/get?foo1=bar1&foo2=bar2",
    headers
  }).then(response => {
    const body = JSON.parse(response.body);
    if (!assertEqual(headers, body.headers)) {
      console.log("ERROR: HTTP GET with header test failed!");
    } else {
      console.log("OK: HTTP GET with header test");
    }
  })

  await $.http.put({
    url: "https://postman-echo.com/put",
    body: rawBody,
    headers: {
      'content-type': 'text/plain'
    }
  }).then(response => {
    const body = JSON.parse(response.body);
    if (body.data !== rawBody) {
      console.log("ERROR: HTTP PUT with raw body test failed!");
    } else {
      console.log("OK: HTTP PUT with raw body test");
    }
  });

  await $.http.patch({
    url: "https://postman-echo.com/patch",
    body: JSON.stringify(jsonBody)
  }).then(response => {
    const body = JSON.parse(response.body);
    if (!assertEqual(body.data, jsonBody)) {
      console.log("ERROR: HTTP PATCH with json body test failed!");
    } else {
      console.log("OK: HTTP PATCH with json body test");
    }
  })
})().then(() => $.done())

// delay
$.wait(1000).then(() => $.log("等待1s"));

$.done();

// prettier-ignore
/*********************************** API *************************************/
function ENV() { const e = "undefined" != typeof $task, t = "undefined" != typeof $loon, s = "undefined" != typeof $httpClient && !this.isLoon, o = "function" == typeof require && "undefined" != typeof $jsbox; return { isQX: e, isLoon: t, isSurge: s, isNode: "function" == typeof require && !o, isJSBox: o } } function HTTP(e, t) { const { isQX: s, isLoon: o, isSurge: i } = ENV(); const n = {}; return ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"].forEach(r => n[r.toLowerCase()] = (n => (function (n, r = { ...t, ...r }) { return (r = "string" == typeof r ? { url: r } : r).url = e ? e + r.url : r.url, s ? $task.fetch({ method: n, ...r }) : new Promise((e, t) => { (i || o ? $httpClient : require("request"))[n.toLowerCase()](r, (s, o, i) => { s ? t(s) : e({ statusCode: o.status || o.statusCode, headers: o.headers, body: i }) }) }) })(r, n))), n } function API(e = "untitled", t = !1) { const { isQX: s, isLoon: o, isSurge: i, isNode: n, isJSBox: r } = ENV(); return new class { constructor(e, t) { this.name = e, this.debug = t, this.http = HTTP(), this.node = (() => { if (n) { return { fs: require("fs") } } return null })(), this.initCache(); Promise.prototype.delay = function (e) { return this.then(function (t) { return ((e, t) => new Promise(function (s) { setTimeout(s.bind(null, t), e) }))(e, t) }) } } initCache() { if (s && (this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}")), (o || i) && (this.cache = JSON.parse($persistentStore.read(this.name) || "{}")), n) { let e = "root.json"; this.node.fs.existsSync(e) || this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.root = {}, e = `${this.name}.json`, this.node.fs.existsSync(e) ? this.cache = JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)) : (this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.cache = {}) } } persistCache() { const e = JSON.stringify(this.cache); s && $prefs.setValueForKey(e, this.name), (o || i) && $persistentStore.write(e, this.name), n && (this.node.fs.writeFileSync(`${this.name}.json`, e, { flag: "w" }, e => console.log(e)), this.node.fs.writeFileSync("root.json", JSON.stringify(this.root), { flag: "w" }, e => console.log(e))) } write(e, t) { this.log(`SET ${t}`), -1 !== t.indexOf("#") ? (t = t.substr(1), i & o && $persistentStore.write(e, t), s && $prefs.setValueForKey(e, t), n && (this.root[t] = e)) : this.cache[t] = e, this.persistCache() } read(e) { return this.log(`READ ${e}`), -1 === e.indexOf("#") ? this.cache[e] : (e = e.substr(1), i & o ? $persistentStore.read(e) : s ? $prefs.valueForKey(e) : n ? this.root[e] : void 0) } delete(e) { this.log(`DELETE ${e}`), delete this.cache[e], -1 !== e.indexOf("#") ? (e = e.substr(1), i & o && $persistentStore.write(null, e), s && $prefs.setValueForKey(null, e), n && delete this.root[e]) : this.cache[e] = data, this.persistCache() } notify(e, t = "", h = "", c = {}) { const u = c["open-url"], l = c["media-url"], a = h + (u ? `\n点击跳转: ${u}` : "") + (l ? `\n多媒体: ${l}` : ""); if (s && $notify(e, t, h, c), i && $notification.post(e, t, a), o && $notification.post(e, t, h, u), n) if (r) { require("push").schedule({ title: e, body: (t ? t + "\n" : "") + a }) } else console.log(`${e}\n${t}\n${a}\n\n`) } log(e) { this.debug && console.log(e) } info(e) { console.log(e) } error(e) { console.log("ERROR: " + e) } wait(e) { return new Promise(t => setTimeout(t, e)) } done(e = {}) { s || o || i ? $done(e) : n && !r && "undefined" != typeof $context && ($context.headers = e.headers, $context.statusCode = e.statusCode, $context.body = e.body) } }(e, t) }
/*****************************************************************************/
