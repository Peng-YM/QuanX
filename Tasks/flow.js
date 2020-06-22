/**
 * 本脚本旨在获取机场流量使用详情, 链接需支持Quantumult 显示流量使用情况
 * 原作者 @Meeta
 * @author: Peng-YM
 * 修改增加多机场信息显示，以及支持多平台，图标。优化通知显示。
 * 更新地址：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/flow.js
 * 推荐使用mini图标组：https://github.com/Orz-3/mini
 */
const $ = API("flow", false);
const subscriptions = [
  {
    link: "机场订阅地址",
    name: "取个名字",
    icon: "https://raw.githubusercontent.com/Orz-3/mini/master/图标名字.png"
  },
];

Promise.all(subscriptions.map(async (sub) => fetchInfo(sub)))
  .catch((err) => $.error(err))
  .finally(() => $.done());

async function fetchInfo(sub) {
  $.get(sub.link).then((resp) => {
    const userinfo = resp.headers["subscription-userinfo"];
    $.log(userinfo);
    const upload_k = Number(userinfo.match(/upload=(\d+)/)[1]);
    const download_k = Number(userinfo.match(/download=(\d+)/)[1]);
    const total_k = Number(userinfo.match(/total=(\d+)/)[1]);
    const expires = formatTime(Number(userinfo.match(/expire=(\d+)/)[1])*1000);

    const residue_m =
      total_k / 1048576 - download_k / 1048576 - upload_k / 1048576;
    const residue = residue_m.toFixed(2).toString();
    const dnow = new Date().getTime().toString();
    const utime = dnow - $.read("o_now");
    const todayflow = $.read("today_flow") - residue;
    $.write(residue, "today_flow");
    $.write(dnow, "o_now");
    const title = `🚀 [机场流量] ${sub.name}`;
    const hutime = parseInt(utime / 3600000);
    const mutime = (utime / 60000) % 60;
    const subtitle = `剩余流量: ${(residue_m / 1024).toFixed(2)} G`;
    const details = `
📌 [使用情况]
${
    hutime == 0
    ? "在过去的" +
        mutime.toFixed(1) +
        "分钟内使用了: " +
        todayflow.toFixed(2) +
        " M流量"
    : "在过去的" +
        hutime +
        "时 " +
        mutime.toFixed(1) +
        "分钟内使用了: " +
        todayflow.toFixed(2) +
        " M流量"
}
📝 [统计]
总上传: ${(upload_k / 1073741824).toFixed(2)} G
总下载: ${(download_k / 1073741824).toFixed(2)} G
🛎 [到期时间]
${expires}
    `;
    if (sub.icon) {
      $.notify(title, subtitle, details, { "media-url": sub.icon });
    } else {
      $.notify(title, subtitle, details);
    }
  });
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}年${
    date.getMonth() + 1
  }月${date.getDate()}日${date.getHours()}时`;
}

// prettier-ignore
/*********************************** API *************************************/
function API(t="untitled",e=!1){return new class{constructor(t,e){this.name=t,this.debug=e,this.isQX="undefined"!=typeof $task,this.isLoon="undefined"!=typeof $loon,this.isSurge="undefined"!=typeof $httpClient&&!this.isLoon,this.isNode="function"==typeof require,this.isJSBox=this.isNode&&"undefined"!=typeof $jsbox,this.node=(()=>this.isNode?{request:"undefined"!=typeof $request?void 0:require("request"),fs:require("fs")}:null)(),this.cache=this.initCache(),this.log(`INITIAL CACHE:\n${JSON.stringify(this.cache)}`),Promise.prototype.delay=function(t){return this.then(function(e){return((t,e)=>new Promise(function(s){setTimeout(s.bind(null,e),t)}))(t,e)})}}get(t){return this.isQX?("string"==typeof t&&(t={url:t,method:"GET"}),$task.fetch(t)):new Promise((e,s)=>{this.isLoon||this.isSurge?$httpClient.get(t,(t,i,o)=>{t?s(t):e({...i,body:o})}):this.node.request(t,(t,i,o)=>{t?s(t):e({...i,status:i.statusCode,body:o})})})}post(t){return this.isQX?("string"==typeof t&&(t={url:t}),t.method="POST",$task.fetch(t)):new Promise((e,s)=>{this.isLoon||this.isSurge?$httpClient.post(t,(t,i,o)=>{t?s(t):e({...i,body:o})}):this.node.request.post(t,(t,i,o)=>{t?s(t):e({...i,status:i.statusCode,body:o})})})}initCache(){if(this.isQX)return JSON.parse($prefs.valueForKey(this.name)||"{}");if(this.isLoon||this.isSurge)return JSON.parse($persistentStore.read(this.name)||"{}");if(this.isNode){const t=`${this.name}.json`;return this.node.fs.existsSync(t)?JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(t,JSON.stringify({}),{flag:"wx"},t=>console.log(t)),{})}}persistCache(){const t=JSON.stringify(this.cache);this.log(`FLUSHING DATA:\n${t}`),this.isQX&&$prefs.setValueForKey(t,this.name),(this.isLoon||this.isSurge)&&$persistentStore.write(t,this.name),this.isNode&&this.node.fs.writeFileSync(`${this.name}.json`,t,{flag:"w"},t=>console.log(t))}write(t,e){this.log(`SET ${e} = ${JSON.stringify(t)}`),this.cache[e]=t,this.persistCache()}read(t){return this.log(`READ ${t} ==> ${JSON.stringify(this.cache[t])}`),this.cache[t]}delete(t){this.log(`DELETE ${t}`),delete this.cache[t],this.persistCache()}notify(t,e,s,i){const o="string"==typeof i?i:void 0,n=s+(null==o?"":`\n${o}`);this.isQX&&(void 0!==o?$notify(t,e,s,{"open-url":o}):$notify(t,e,s,i)),this.isSurge&&$notification.post(t,e,n),this.isLoon&&$notification.post(t,e,s),this.isNode&&(this.isJSBox?require("push").schedule({title:t,body:e?e+"\n"+s:s}):console.log(`${t}\n${e}\n${n}\n\n`))}log(t){this.debug&&console.log(t)}info(t){console.log(t)}error(t){console.log("ERROR: "+t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){this.isQX||this.isLoon||this.isSurge?$done(t):this.isNode&&!this.isJSBox&&"undefined"!=typeof $context&&($context.headers=t.headers,$context.statusCode=t.statusCode,$context.body=t.body)}}(t,e)}
/*****************************************************************************/
