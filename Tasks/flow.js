/**
 * 本脚本旨在获取机场流量使用详情, 链接需支持Quantumult 显示流量使用情况
 * 原作者 @Meeta
 * @author: Peng-YM
 * 修改增加多机场信息显示，以及支持多平台，图标。优化通知显示。
 * 更新地址：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/flow.js
 * 推荐使用mini图标组：https://github.com/Orz-3/mini
 * @update YangZhaocool
 */

let subscriptions = [{
        link: "订阅地址1",
        name: "取个名字1",
        icon: "https://raw.githubusercontent.com/Orz-3/mini/master/pudding.png"
    },
    {
        link: "订阅地址2",
        name: "取个名字2",
        icon: "https://raw.githubusercontent.com/Orz-3/mini/master/Nexitally.png"
    },
];

const $ = API("flow");
if ($.read("subscriptions") !== undefined) {
    subscriptions = JSON.parse($.read("subscriptions"));
}

Promise.all(subscriptions.map(async sub => await fetchInfo(sub))).catch((err) => $.error(err)).finally(() => {
    setTimeout(() => {
        $.done()
    }, 5000);
});

async function fetchInfo(sub) {
    const headers = {
        "User-Agent": "Quantumult/1.0.13 (iPhone10,3; iOS 14.0)"
    };
    $.http.get({
        url: sub.link,
        headers
    }).then(resp => {
        const headers = resp.headers;
        const subkey = Object.keys(headers).filter(k => /SUBSCRIPTION-USERINFO/i.test(k))[0];
        const userinfo = headers[subkey];
        if (!userinfo) {
            $.notify("🚀 [机场流量]", `❌ 机场：${sub.name} 未提供流量信息！`);
        }
        const KEY_o_now = "o_now" + sub.name;
        const KEY_today_flow = "today_flow" + sub.name;
        $.log(userinfo);
        const upload_k = Number(userinfo.match(/upload=(\d+)/)[1]);
        const download_k = Number(userinfo.match(/download=(\d+)/)[1]);
        const total_k = Number(userinfo.match(/total=(\d+)/)[1]);
        const expire_time = userinfo.match(/expire=(\d+)/)
        let expires = "无信息"
        if (expire_time) {
            expires = formatTime(Number(expire_time[1] * 1000));
        }

        const residue_m =
            total_k / 1048576 - download_k / 1048576 - upload_k / 1048576;
        const residue = residue_m.toFixed(2).toString();
        const dnow = new Date().getTime().toString();
        const utime = dnow - $.read(KEY_o_now);
        const todayflow = $.read(KEY_today_flow) - residue;
        $.write(residue, KEY_today_flow);
        $.write(dnow, KEY_o_now);
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
${expires}`;

        if (sub.icon) {
            $.notify(title, subtitle, details, {
                "media-url": sub.icon
            });
        } else {
            $.notify(title, subtitle, details);
        }
    })
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}年${date.getMonth() +
    1}月${date.getDate()}日${date.getHours()}时`;
}


// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,i="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!i,isJSBox:i,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:i,isScriptable:n,isNode:o}=ENV(),r=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(l=>u[l.toLowerCase()]=u=>function(u,l){l="string"==typeof l?{url:l}:l;const h=e.baseURL;h&&!r.test(l.url||"")&&(l.url=h?h+l.url:l.url);const a=(l={...e,...l}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...l.events};let f,d;if(c.onRequest(u,l),t)f=$task.fetch({method:u,...l});else if(s||i||o)f=new Promise((e,t)=>{(o?require("request"):$httpClient)[u.toLowerCase()](l,(s,i,n)=>{s?t(s):e({statusCode:i.status||i.statusCode,headers:i.headers,body:n})})});else if(n){const e=new Request(l.url);e.method=u,e.headers=l.headers,e.body=l.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const p=a?new Promise((e,t)=>{d=setTimeout(()=>(c.onTimeout(),t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)),a)}):null;return(p?Promise.race([p,f]).then(e=>(clearTimeout(d),e)):f).then(e=>c.onResponse(e))}(l,u)),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:i,isSurge:n,isNode:o,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(o){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(i||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),o){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(i||n)&&$persistentStore.write(e,this.name),o&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||i)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);o&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||i?$persistentStore.read(e):s?$prefs.valueForKey(e):o?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||i)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);o&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",l="",h={}){const a=h["open-url"],c=h["media-url"];if(s&&$notify(e,t,l,h),n&&$notification.post(e,t,l+`${c?"\n多媒体:"+c:""}`,{url:a}),i){let s={};a&&(s.openUrl=a),c&&(s.mediaUrl=c),"{}"===JSON.stringify(s)?$notification.post(e,t,l):$notification.post(e,t,l,s)}if(o||u){const s=l+(a?`\n点击跳转: ${a}`:"")+(c?`\n多媒体: ${c}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||i||n?$done(e):o&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
/*****************************************************************************/
