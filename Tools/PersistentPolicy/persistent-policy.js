/**
 * 手动记录不同 WIFI & 数据模式下的策略组，在网络变化时自动恢复，目前支持 Loon & Surge
 *
 * 🧭 配置
 * 【一】
 * Loon 使用插件：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/PersistentPolicy/persistent-policy.plugin
 * Surge 使用模块：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/PersistentPolicy/persistent-policy.sgmodule
 *
 * 【二】
 * 下载配套捷径：https://www.icloud.com/shortcuts/d7412ca47c5e4335a8308a99901cf0c4
 *
 * 🧭 使用方式
 * 1. 手动执行运行捷径即可保存（或者覆盖）当前 WIFI/蜂窝数据 的策略组选中状态。
 * 2. 可以为多个网络保存策略组，网络切换时自动切换到记忆的策略组。
 *
 * @author: Peng-YM
 */
const APP_ID = "persistent-policy";
const $ = API(APP_ID);

let platform;
if ($.env.isSurge) platform = "Surge"
if ($.env.isLoon) platform = "Loon";

if ($.env.isRequest) {
    persistPolicyDecisions();
    const response = {
        status: 200,
        body: "Success",
    }
    $.done({response});
} else {
    networkChanged();
    $.done();
}

function getPolicyGroups() {
    if ($.env.isLoon) {
        const loonConfig = JSON.parse($config.getConfig());
        return loonConfig.all_policy_groups;
    } else if ($.env.isSurge) {
        return Object.keys($surge.selectGroupDetails().groups);
    }
}

function getSSID() {
    if ($.env.isLoon) {
        const loonConfig = JSON.parse($config.getConfig());
        return loonConfig.ssid;
    } else if ($.env.isSurge) {
        return $network.wifi.ssid;
    }
}

function networkChanged() {
    $.info(`Network changed, current SSID: ${getSSID()}`);
    // load the saved policy decisions
    const decisions = loadPolicyDecisions();

    // execute policy switch
    const groups = getPolicyGroups();
    if (decisions) {
        for (let group of groups) {    
            if (!decisions[group]) continue;
            if ($.env.isLoon) {
                $config.setSelectPolicy(group, decisions[group]);
            } else if ($.env.isSurge) {
                $surge.setSelectGroupPolicy(group, decisions[group]);
            }
            $.info(`Restore Policy: ${group} ==> ${decisions[group]}`);
        }
    }
}

function persistPolicyDecisions() {
    // get the current policy decisions
    let decisions;
    if ($.env.isSurge) {
        decisions = $surge.selectGroupDetails().decisions;
    } else if ($.env.isLoon) {
        const loonConfig = JSON.parse($config.getConfig());
        decisions = loonConfig.policy_select;
    }

    // delete non-existing decisions
    const groups = getPolicyGroups();
    for (let d of Object.keys(decisions)) {
        if (groups.indexOf(d) === -1) delete decisions[d];
    }

    const SSID = getSSID();

    // persist current policy decisions
    if (SSID) {
        // wifi
        $.write(
            decisions,
            `${platform}/wifi/${SSID}`
        );
    } else {
        // cellular
        $.write(
            decisions,
            `${platform}/cellular`
        )
    }

    $.info("Saved policy decisions:\n>>>" + JSON.stringify(decisions));
    $.notify("🤖️ SSID 策略", "当前配置已保存");
}

function loadPolicyDecisions() {
    const SSID = getSSID();
    if (SSID) {
        // wifi
        return $.read(
            `${platform}/wifi/${SSID}`
        );
    }
    else {
        // cellular
        return $.read(
            `${platform}/cellular`
        );
    }
}

// OpenAPI
function ENV(){const e="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:"undefined"!=typeof $task,isLoon:"undefined"!=typeof $loon,isSurge:"undefined"!=typeof $httpClient&&"undefined"!=typeof $utils,isBrowser:"undefined"!=typeof document,isNode:"function"==typeof require&&!e,isJSBox:e,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:o,isScriptable:n,isNode:i,isBrowser:r}=ENV(),u=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;const a={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(h=>a[h.toLowerCase()]=(a=>(function(a,h){h="string"==typeof h?{url:h}:h;const d=e.baseURL;d&&!u.test(h.url||"")&&(h.url=d?d+h.url:h.url),h.body&&h.headers&&!h.headers["Content-Type"]&&(h.headers["Content-Type"]="application/x-www-form-urlencoded");const l=(h={...e,...h}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...h.events};let f,p;if(c.onRequest(a,h),t)f=$task.fetch({method:a,...h});else if(s||o||i)f=new Promise((e,t)=>{(i?require("request"):$httpClient)[a.toLowerCase()](h,(s,o,n)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:n})})});else if(n){const e=new Request(h.url);e.method=a,e.headers=h.headers,e.body=h.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}else r&&(f=new Promise((e,t)=>{fetch(h.url,{method:a,headers:h.headers,body:h.body}).then(e=>e.json()).then(t=>e({statusCode:t.status,headers:t.headers,body:t.data})).catch(t)}));const y=l?new Promise((e,t)=>{p=setTimeout(()=>(c.onTimeout(),t(`${a} URL: ${h.url} exceeds the timeout ${l} ms`)),l)}):null;return(y?Promise.race([y,f]).then(e=>(clearTimeout(p),e)):f).then(e=>c.onResponse(e))})(h,a))),a}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:n,isNode:i,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(i){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),i){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(o||n)&&$persistentStore.write(e,this.name),i&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||o)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);i&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||o?$persistentStore.read(e):s?$prefs.valueForKey(e):i?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||o)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);i&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",a="",h={}){const d=h["open-url"],l=h["media-url"];if(s&&$notify(e,t,a,h),n&&$notification.post(e,t,a+`${l?"\n多媒体:"+l:""}`,{url:d}),o){let s={};d&&(s.openUrl=d),l&&(s.mediaUrl=l),"{}"===JSON.stringify(s)?$notification.post(e,t,a):$notification.post(e,t,a,s)}if(i||u){const s=a+(d?`\n点击跳转: ${d}`:"")+(l?`\n多媒体: ${l}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||n?$done(e):i&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}