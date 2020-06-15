const $ = API("APP"); // Env("APP", false) --> 无log输出
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
function API(t="untitled",i=!1){return new class{constructor(t,i){this.name=t,this.debug=i,this.isQX="undefined"!=typeof $task,this.isLoon="undefined"!=typeof $loon,this.isSurge="undefined"!=typeof $httpClient&&!this.isLoon,this.isNode="function"==typeof require,this.node=(()=>this.isNode?{request:require("request"),fs:require("fs")}:null)(),this.cache=this.initCache(),this.log(`INITIAL CACHE:\n${JSON.stringify(this.cache)}`),Promise.prototype.delay=function(t){return this.then(function(i){return((t,i)=>new Promise(function(e){setTimeout(e.bind(null,i),t)}))(t,i)})}}get(t){return this.isQX?("string"==typeof t&&(t={url:t,method:"GET"}),$task.fetch(t)):this.isLoon||this.isSurge?$httpClient.get(t):this.isNode?new Promise((i,e)=>{this.node.request(t,(t,s)=>{t?e(t):i(s)})}):void 0}post(t){return this.isQX?$task.fetch(t):this.isLoon||this.isSurge?$httpClient.post(t):this.isNode?new Promise((i,e)=>{this.node.request.post(t,(t,s)=>{t?e(t):i(s)})}):void 0}initCache(){if(this.isQX)return $prefs.valueForKey(this.name)||{};if(this.isLoon||this.isSurge)return $persistanceStore.read(this.name)||{};if(this.isNode){const t=`${this.name}.json`;return this.node.fs.existsSync(t)?JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(t,JSON.stringify({}),{flag:"wx"},t=>console.log(t)),{})}}persistCache(){const t=this.cache;this.isQX&&$prefs.setValueForKey(t,this.name),this.isSurge&&$persistanceStore.write(t,this.name),this.isNode&&this.node.fs.writeFileSync(`${this.name}.json`,JSON.stringify(t),{flag:"w"},t=>console.log(t))}write(t,i){this.log(`SET ${i} = ${t}`),this.cache={...this.cache,[i]:t}}read(t){return this.log(`READ ${t}`),this.cache[t]}delete(t){this.log(`DELETE ${t}`),this.write(void 0,t)}notify(t,i,e,s){const o="string"==typeof s?s:void 0,n=e+(null==o?"":`\n${o}`);this.isQX&&(void 0!==o?$notify(t,i,e,{"open-url":o}):$notify(t,i,e,s)),this.isSurge&&$notification.post(t,i,n),this.isLoon&&$notification.post(t,i,e,o),this.isNode&&console.log(`${t}\n${i}\n${n}`)}log(t){(this.debug=!0)&&console.log(t)}info(t){console.log(t)}error(t){this.log("ERROR: "+t)}wait(t){return new Promise(i=>setTimeout(i,t))}done(t={}){this.persistCache(),this.isQX&&$done(t),(this.isLoon||this.isSurge)&&$done(t)}formatTime(t){const i=new Date(t);return`${i.getFullYear()}年${i.getMonth()+1}月${i.getDate()}日${i.getHours()}时`}}(t,i)}
/*****************************************************************************/