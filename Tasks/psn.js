/**
 * 每月PSN会员限免游戏提醒
 * @author: Peng-YM
 * 更新地址：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/psn.js
 */

const $ = API("psn");
const url =
    "https://store.playstation.com/zh-hant-hk/grid/STORE-MSF86012-PLUS_FTT_CONTENT/1";
$.http.get({
    url,
    headers: {
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36",
    },
})
    .then((resp) => {
        const body = resp.body;
        const data = JSON.parse(body.match(/({"@context"[\s\S]*?)<\/script>/)[1]);
        $.log(data);
        return parse(data['@graph']);
    })
    .catch((err) => $.error(err))
    .finally($.done());

function parse(products) {
    products.forEach(item => {
        let description = item.description;
        // clean up css codes
        description = description.replace(/\s+/g, '');
        description = description.replace(/br|\\r|\\n/g, '');
        description = description.replace(/\w*&\w*?;/g, '');
        description = description.replace(/\w+\s{0,1}\w+="\w+"/g, '')
        const name = item.name.trim();
        $.notify(
            `🎮 [PSN会免] ${name}`,
            `🗓 时间：${getTime()}`,
            `📦 类别：${item.category}\n💡 游戏简介：${description}`,
            {
                'media-url': `${item.image}`,
                'open-url': `https://store.playstation.com/zh-hant-hk/product/${item.sku}`
            }
        )
    })
}

function getTime() {
    const today = new Date();
    return `${today.getFullYear()}年${today.getMonth() + 1}月`;
}

// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!this.isLoon,o="function"==typeof require&&"undefined"!=typeof $jsbox,i="function"==typeof require&&!o,n="undefined"!=typeof $request,r="undefined"!=typeof importModule;return{isQX:e,isLoon:t,isSurge:s,isNode:i,isJSBox:o,isRequest:n,isScriptable:r}}function HTTP(e,t={}){function s(s,c){c="string"==typeof c?{url:c}:c,c.url=e?e+c.url:c.url,c={...t,...c};const h=c.timeout,l={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...c.events};let a,d;if(l.onRequest(s,c),o)a=$task.fetch({method:s,...c});else if(i||n||u)a=new Promise((e,t)=>{const o=u?require("request"):$httpClient;o[s.toLowerCase()](c,(s,o,i)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:i})})});else if(r){const e=new Request(c.url);e.method=s,e.headers=c.headers,e.body=c.body,a=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const f=h?new Promise((e,t)=>{d=setTimeout(()=>(l.onTimeout(),t(`${s} URL: ${c.url} exceeds the timeout ${h} ms`)),h)}):null;return(f?Promise.race([f,a]).then(e=>(clearTimeout(d),e)):a).then(e=>l.onResponse(e))}const{isQX:o,isLoon:i,isSurge:n,isScriptable:r,isNode:u}=ENV(),c=["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"],h={};return c.forEach(e=>h[e.toLowerCase()]=(t=>s(e,t))),h}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:i,isNode:n,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(n){const e=require("fs");return{fs:e}}return null})(),this.initCache();const s=(e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)});Promise.prototype.delay=function(e){return this.then(function(t){return s(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||i)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),n){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache);s&&$prefs.setValueForKey(e,this.name),(o||i)&&$persistentStore.write(e,this.name),n&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root),{flag:"w"},e=>console.log(e)))}write(e,t){this.log(`SET ${t}`),-1!==t.indexOf("#")?(t=t.substr(1),i&o&&$persistentStore.write(e,t),s&&$prefs.setValueForKey(e,t),n&&(this.root[t]=e)):this.cache[t]=e,this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),i&o?$persistentStore.read(e):s?$prefs.valueForKey(e):n?this.root[e]:void 0)}delete(e){this.log(`DELETE ${e}`),-1!==e.indexOf("#")?(e=e.substr(1),i&o&&$persistentStore.write(null,e),s&&$prefs.removeValueForKey(e),n&&delete this.root[e]):delete this.cache[e],this.persistCache()}notify(e,t="",o="",c={}){const h=c["open-url"],l=c["media-url"],a=o+(h?`\n点击跳转: ${h}`:"")+(l?`\n多媒体: ${l}`:"");if(s&&$notify(e,t,o,c),i&&$notification.post(e,t,a),this.isLoon){let s={};h&&(s.openUrl=h),l&&(s.mediaUrl=l),"{}"==JSON.stringify(s)?$notification.post(e,t,o):$notification.post(e,t,o,s)}if(n||u)if(r){const s=require("push");s.schedule({title:e,body:(t?t+"\n":"")+a})}else console.log(`${e}\n${t}\n${a}\n\n`)}log(e){this.debug&&console.log(e)}info(e){console.log(e)}error(e){console.log("ERROR: "+e)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||i?$done(e):n&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}}(e,t)}
/*****************************************************************************/

