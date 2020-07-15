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
$.get("https://postman-echo.com/get?foo1=bar1&foo2=bar2")
  .then((resp) => {
    $.log("GET: status: " + resp.status);
    $.log("GET: response headers: \n" + resp.headers.toString());
    $.log("GET: response body: \n" + resp.body);
    return JSON.parse(resp.body);
  })
  .delay(1000) // wait for 1 second
  .then((data) => {
    if (data.args.foo1 !== "bar1") {
      throw new Error("Wrong Parameter!");
    } else {
      $.log("GET 测试通过！");
    }
  })
  .catch((err) => $.notify("GET 请求测试失败！", "", err));

const sample = {
  msg: "ECHO",
};

$.post({
  url: "https://postman-echo.com/post",
  body: JSON.stringify(sample),
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((resp) => {
    $.log("POST: status: " + resp.status);
    $.log("POST: response headers: \n" + resp.headers.toString());
    $.log("POST: response body: \n" + resp.body);
    const body = JSON.parse(resp.body);
    if (body.data["msg"] !== sample.msg) {
      $.notify("POST 测试失败", "返回体", resp.body);
    } else {
      $.log("POST 测试通过！");
    }
  })
  .catch((err) => $.notify("POST 请求测试失败！", "", err));

// delay
$.wait(1000).then(() => $.log("等待1s"));

$.done();

// prettier-ignore
/*********************************** API *************************************/
function API(s="untitled",t=!1){return new class{constructor(s,t){this.name=s,this.debug=t,this.isQX="undefined"!=typeof $task,this.isLoon="undefined"!=typeof $loon,this.isSurge="undefined"!=typeof $httpClient&&!this.isLoon,this.isNode="function"==typeof require,this.isJSBox=this.isNode&&"undefined"!=typeof $jsbox,this.node=(()=>{if(this.isNode){return{request:"undefined"!=typeof $request?void 0:require("request"),fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(s){return this.then(function(t){return((s,t)=>new Promise(function(e){setTimeout(e.bind(null,t),s)}))(s,t)})}}get(s){return this.isQX?("string"==typeof s&&(s={url:s,method:"GET"}),$task.fetch(s)):new Promise((t,e)=>{this.isLoon||this.isSurge?$httpClient.get(s,(s,i,o)=>{s?e(s):t({status:i.status,headers:i.headers,body:o})}):this.node.request(s,(s,i,o)=>{s?e(s):t({...i,status:i.statusCode,body:o})})})}post(s){return this.isQX?("string"==typeof s&&(s={url:s}),s.method="POST",$task.fetch(s)):new Promise((t,e)=>{this.isLoon||this.isSurge?$httpClient.post(s,(s,i,o)=>{s?e(s):t({status:i.status,headers:i.headers,body:o})}):this.node.request.post(s,(s,i,o)=>{s?e(s):t({...i,status:i.statusCode,body:o})})})}initCache(){if(this.isQX)return JSON.parse($prefs.valueForKey(this.name)||"{}");if(this.isLoon||this.isSurge)return JSON.parse($persistentStore.read(this.name)||"{}");if(this.isNode){let s="root.json";this.node.fs.existsSync(s)||this.node.fs.writeFileSync(s,JSON.stringify({}),{flag:"wx"},s=>console.log(s)),this.root={},s=`${this.name}.json`,this.node.fs.existsSync(s)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(s,JSON.stringify({}),{flag:"wx"},s=>console.log(s)),this.cache={})}}persistCache(){const s=JSON.stringify(this.cache);this.isQX&&$prefs.setValueForKey(s,this.name),(this.isLoon||this.isSurge)&&$persistentStore.write(s,this.name),this.isNode&&(this.node.fs.writeFileSync(`${this.name}.json`,s,{flag:"w"},s=>console.log(s)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root),{flag:"w"},s=>console.log(s)))}write(s,t){this.log(`SET ${t}`),-1!==t.indexOf("#")?(t=t.substr(1),this.isSurge&this.isLoon&&$persistentStore.write(s,t),this.isQX&&$prefs.setValueForKey(s,t),this.isNode&&(this.root[t]=s)):this.cache[t]=s,this.persistCache()}read(s){return this.log(`READ ${s}`),-1===s.indexOf("#")?this.cache[s]:(s=s.substr(1),this.isSurge&this.isLoon&&$persistentStore.read(data,s),this.isQX?$prefs.valueForKey(s):this.isNode?this.root[s]:void 0)}delete(s){this.log(`DELETE ${s}`),delete this.cache[s],-1!==s.indexOf("#")?(s=s.substr(1),this.isSurge&this.isLoon&&$persistentStore.write(null,s),this.isQX&&$prefs.setValueForKey(null,s),this.isNode&&delete this.root[s]):this.cache[s]=data,this.persistCache()}notify(s,t="",e="",i={}){const o=i["open-url"],n=i["media-url"],r=e+(o?`\n点击跳转: ${o}`:"")+(n?`\n多媒体: ${n}`:"");if(this.isQX&&$notify(s,t,e,i),this.isSurge&&$notification.post(s,t,r),this.isLoon&&$notification.post(s,t,e,o),this.isNode)if(this.isJSBox){require("push").schedule({title:s,body:(t?t+"\n":"")+r})}else console.log(`${s}\n${t}\n${r}\n\n`)}log(s){this.debug&&console.log(s)}info(s){console.log(s)}error(s){console.log("ERROR: "+s)}wait(s){return new Promise(t=>setTimeout(t,s))}done(s={}){this.isQX||this.isLoon||this.isSurge?$done(s):this.isNode&&!this.isJSBox&&"undefined"!=typeof $context&&($context.headers=s.headers,$context.statusCode=s.statusCode,$context.body=s.body)}}(s,t)}
/*****************************************************************************/
