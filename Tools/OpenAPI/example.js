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
function API(i="untitled",t=!1){return new class{constructor(i,t){this.name=i,this.debug=t,this.isQX="undefined"!=typeof $task,this.isLoon="undefined"!=typeof $loon,this.isSurge="undefined"!=typeof $httpClient&&!this.isLoon,this.isNode="function"==typeof require,this.node=(()=>this.isNode?{request:require("request"),fs:require("fs")}:null)(),this.cache=this.initCache(),this.log(`INITIAL CACHE:\n${JSON.stringify(this.cache)}`),Promise.prototype.delay=function(i){return this.then(function(t){return((i,t)=>new Promise(function(e){setTimeout(e.bind(null,t),i)}))(i,t)})}}get(i){return this.isQX?("string"==typeof i&&(i={url:i,method:"GET"}),$task.fetch(i)):this.isLoon||this.isSurge?$httpClient.get(i):this.isNode?new Promise((t,e)=>{this.node.request(i,(i,s)=>{i?e(i):t(s)})}):void 0}post(i){return this.isQX?$task.fetch(i):this.isLoon||this.isSurge?$httpClient.post(i):this.isNode?new Promise((t,e)=>{this.node.request.post(i,(i,s)=>{i?e(i):t(s)})}):void 0}initCache(){if(this.isQX)return $prefs.valueForKey(this.name)||{};if(this.isLoon||this.isSurge)return $persistentStore.read(this.name)||{};if(this.isNode){const i=`${this.name}.json`;return this.node.fs.existsSync(i)?JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(i,JSON.stringify({}),{flag:"wx"},i=>console.log(i)),{})}}persistCache(){const i=this.cache;this.isQX&&$prefs.setValueForKey(i,this.name),this.isSurge&&$persistentStore.write(i,this.name),this.isNode&&this.node.fs.writeFileSync(`${this.name}.json`,JSON.stringify(i),{flag:"w"},i=>console.log(i))}write(i,t){this.log(`SET ${t} = ${i}`),this.cache={...this.cache,[t]:i}}read(i){return this.log(`READ ${i}`),this.cache[i]}delete(i){this.log(`DELETE ${i}`),this.write(void 0,i)}notify(i,t,e,s){const o="string"==typeof s?s:void 0,n=e+(null==o?"":`\n${o}`);this.isQX&&(void 0!==o?$notify(i,t,e,{"open-url":o}):$notify(i,t,e,s)),this.isSurge&&$notification.post(i,t,n),this.isLoon&&$notification.post(i,t,e,o||s["open-url"]),this.isNode&&("undefined"==typeof $jsbox?console.log(`${i}\n${t}\n${n}\n\n`):require("push").schedule({title:i,body:t?t+"\n"+e:e}))}log(i){this.debug&&console.log(i)}info(i){console.log(i)}error(i){this.log("ERROR: "+i)}wait(i){return new Promise(t=>setTimeout(t,i))}done(i={}){this.persistCache(),this.isQX&&$done(i),(this.isLoon||this.isSurge)&&$done(i)}}(i,t)}
/*****************************************************************************/

