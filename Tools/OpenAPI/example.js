const $ = API("APP", true); // API("APP") --> 无log输出
// 测试console
$.log("测试输出");
$.error("这是一条错误信息");

// 测试通知
$.notify("跳转测试", "Subtitle", "点击跳转", "http://www.bing.com");
$.notify("图片测试（QX有效）", "Subtitle", "", {
  "media-url":
    "https://avatars2.githubusercontent.com/u/21050064?s=460&u=40a74913dd0a3d00670d05148c3a08c787470021&v=4",
});

// 测试缓存
const key = "测试";
const data = "数据";
$.write(data, key);
$.log(`当前缓存：\n${JSON.stringify($.cache)}`);
if ($.read(key) !== data) {
  $.notify("缓存测试炸了！", "", "");
}
$.delete(key);
if ($.read(key) !== undefined) {
  $.notify("缓存Key未删除！", "", "");
}
$.done();

// 测试请求
$.get("https://postman-echo.com/get?foo1=bar1&foo2=bar2")
  .then((resp) => JSON.parse(resp.body))
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
  data: "ECHO"
};

$.post({
  url: "http://scooterlabs.com/echo",
  body: JSON.stringify(sample),
})
  .then((resp) => {
    if (resp.body.indexOf('POST') === -1) {
      $.notify("POST 测试失败", "返回体", resp.body);
    } else {
      $.log("POST 测试通过！");
    }
  })
  .catch((err) => $.notify("POST 请求测试失败！", "", err));

// 时间转换测试
const time = $.formatTime(1592221383);
$.log(time);

// delay
$.wait(1000).then(() => $.log("等待1s"));

$.done();

// prettier-ignore
/*********************************** API *************************************/
function API(e="untitled",i=!1){return new class{constructor(e,i){this.name=e,this.debug=i,this.isQX="undefined"!=typeof $task,this.isLoon="undefined"!=typeof $loon,this.isSurge="undefined"!=typeof $httpClient&&!this.isLoon,this.isNode="function"==typeof require,this.node=(()=>this.isNode?{request:require("request"),fs:require("fs")}:null)(),this.cache=this.initCache(),this.log(`INITIAL CACHE:\n${JSON.stringify(this.cache)}`),Promise.prototype.delay=function(e){return this.then(function(i){return((e,i)=>new Promise(function(t){setTimeout(t.bind(null,i),e)}))(e,i)})}}get(e){return this.isQX?("string"==typeof e&&(e={url:e,method:"GET"}),$task.fetch(e)):this.isLoon||this.isSurge?$httpClient.get(e):this.isNode?new Promise((i,t)=>{this.node.request(e,(e,s)=>{e?t(e):i(s)})}):void 0}post(e){return this.isQX?$task.fetch(e):this.isLoon||this.isSurge?$httpClient.post(e):this.isNode?new Promise((i,t)=>{this.node.request.post(e,(e,s)=>{e?t(e):i(s)})}):void 0}initCache(){if(this.isQX)return $prefs.valueForKey(this.name)||{};if(this.isLoon||this.isSurge)return $persistentStore.read(this.name)||{};if(this.isNode){const e=`${this.name}.json`;return this.node.fs.existsSync(e)?JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),{})}}persistCache(){const e=this.cache;this.isQX&&$prefs.setValueForKey(e,this.name),this.isSurge&&$persistentStore.write(e,this.name),this.isNode&&this.node.fs.writeFileSync(`${this.name}.json`,JSON.stringify(e),{flag:"w"},e=>console.log(e))}write(e,i){this.log(`SET ${i} = ${e}`),this.cache[i]=e}read(e){return this.log(`READ ${e}`),this.cache[e]}delete(e){this.log(`DELETE ${e}`),delete this.cache[e]}notify(e,i,t,s){const n="string"==typeof s?s:void 0,o=t+(null==n?"":`\n${n}`);this.isQX&&(void 0!==n?$notify(e,i,t,{"open-url":n}):$notify(e,i,t,s)),this.isSurge&&$notification.post(e,i,o),this.isLoon&&$notification.post(e,i,t,n||s["open-url"]),this.isNode&&("undefined"==typeof $jsbox?console.log(`${e}\n${i}\n${o}\n\n`):require("push").schedule({title:e,body:i?i+"\n"+t:t}))}log(e){this.debug&&console.log(e)}info(e){console.log(e)}error(e){this.log("ERROR: "+e)}wait(e){return new Promise(i=>setTimeout(i,e))}done(e={}){this.persistCache(),this.isQX&&$done(e),(this.isLoon||this.isSurge)&&$done(e)}}(e,i)}
/*****************************************************************************/

