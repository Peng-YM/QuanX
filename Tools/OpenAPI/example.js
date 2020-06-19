const $ = API("APP", true); // API("APP") --> 无log输出
// 测试console
$.log("测试输出");
$.error("这是一条错误信息");

// 测试request检测
if ($.isRequest) {
  $.log("检测到request请求");
} else {
  $.log("未检测到request请求");
}

// 测试通知
$.notify("跳转测试", "Subtitle", "点击跳转", "http://www.bing.com");
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
}else{
  $.log("缓存测试通过！");
}
$.delete(key);
if ($.read(key) !== undefined) {
  $.log("缓存Key未删除！");
}

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
function API(t="untitled",e=!1){return new class{constructor(t,e){this.name=t,this.debug=e,this.isRequest="undefined"!=typeof $request,this.isQX="undefined"!=typeof $task,this.isLoon="undefined"!=typeof $loon,this.isSurge="undefined"!=typeof $httpClient&&!this.isLoon,this.isNode="function"==typeof require,this.node=(()=>this.isNode?{request:require("request"),fs:require("fs")}:null)(),this.cache=this.initCache(),this.log(`INITIAL CACHE:\n${JSON.stringify(this.cache)}`),Promise.prototype.delay=function(t){return this.then(function(e){return((t,e)=>new Promise(function(s){setTimeout(s.bind(null,e),t)}))(t,e)})}}get(t){return this.isQX?("string"==typeof t&&(t={url:t,method:"GET"}),$task.fetch(t)):new Promise((e,s)=>{this.isLoon||this.isSurge?$httpClient.get(t,(t,i,o)=>{t?s(t):e({...i,body:o})}):this.node.request(t,(t,i,o)=>{t?s(t):e({...i,status:i.statusCode,body:o})})})}post(t){return this.isQX?("string"==typeof t&&(t={url:t}),t.method="POST",$task.fetch(t)):new Promise((e,s)=>{this.isLoon||this.isSurge?$httpClient.post(t,(t,i,o)=>{t?s(t):e({...i,body:o})}):this.node.request.post(t,(t,i,o)=>{t?s(t):e({...i,status:i.statusCode,body:o})})})}initCache(){if(this.isQX)return JSON.parse($prefs.valueForKey(this.name)||"{}");if(this.isLoon||this.isSurge)return JSON.parse($persistentStore.read(this.name)||"{}");if(this.isNode){const t=`${this.name}.json`;return this.node.fs.existsSync(t)?JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(t,JSON.stringify({}),{flag:"wx"},t=>console.log(t)),{})}}persistCache(){const t=JSON.stringify(this.cache);this.log(`FLUSHING DATA:\n${t}`),this.isQX&&$prefs.setValueForKey(t,this.name),(this.isLoon||this.isSurge)&&$persistentStore.write(t,this.name),this.isNode&&this.node.fs.writeFileSync(`${this.name}.json`,t,{flag:"w"},t=>console.log(t))}write(t,e){this.log(`SET ${e} = ${t}`),this.cache[e]=t,this.persistCache()}read(t){return this.log(`READ ${t} ==> ${this.cache[t]}`),this.cache[t]}delete(t){this.log(`DELETE ${t}`),delete this.cache[t],this.persistCache()}notify(t,e,s,i){const o="string"==typeof i?i:void 0,n=s+(null==o?"":`\n${o}`);this.isQX&&(void 0!==o?$notify(t,e,s,{"open-url":o}):$notify(t,e,s,i)),this.isSurge&&$notification.post(t,e,n),this.isLoon&&$notification.post(t,e,s),this.isNode&&("undefined"==typeof $jsbox?console.log(`${t}\n${e}\n${n}\n\n`):require("push").schedule({title:t,body:e?e+"\n"+s:s}))}log(t){this.debug&&console.log(t)}info(t){console.log(t)}error(t){this.log("ERROR: "+t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){this.log("DONE"),this.isNode||$done(t)}}(t,e)}
/*****************************************************************************/
