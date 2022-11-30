/**
 * TG频道图片推送
 * @author: Peng-YM
 * 更新地址：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/telegram.js
 * 使用方法：
 * 1. 在channels里面添加频道的id，比如说对于频道https://t.me/ABCD，则填入"ABCD"
 * 比如 channels = ["ABCD", "CDEF"]
 * 2. 在maxMedias设置每个频道最多显示的图片数量，比如说设置为3，则只会显示最近3张图片。
 * 3. alwaysNotice控制是否重复显示已经看过的图片，如果设置为false，则只会显示更新的图片。
 */

let channels = ["xqsranimegif"];
let maxMedias = 3;
let alwaysNotice = false;

const $ = API("telegram");
if ($.read("channels") !== undefined) {
    channels = JSON.parse($.read("channels"));
}
if ($.read("maxMedias") !== undefined) {
    maxMedias = parseInt($.read("maxMedias"));
}
if ($.read("alwaysNotice") !== undefined) {
    alwaysNotice = $.read("alwaysNotice");
}

const updated = JSON.parse($.read("updated") || "{}");

Promise.all(
    channels.map(async (channel) => {
        $.log(`Checking channel ${channel}...`);
        await $.http.get(`https://rsshub.app/telegram/channel/${channel}`)
            .then((response) => {
                const body = response.body;
                const channelLink = `https://t.me/s/${channel}`;
                const channelName = body.match(/CDATA\[(.*) - Telegram Channel\]/)[1];


                $.log(`Channel Name: ${channelName}, Link: ${channelLink}`);

                // collect medias
                let medias = [];
                response.body.match(/<item>[\s\S]*?<\/item>/g).forEach((item) => {
                    const mediaCollection = Array.from(item.matchAll(/(?:img|video) src="(.*?)"/g), m => m[1]).filter(m => m !== "undefined");
                    const updateTime = new Date(item.match(/<pubDate>(.*?)<\/pubDate>/)[1]).getTime();
                    if (mediaCollection) {
                        if (alwaysNotice || updated[channel] === undefined || updated[channel] < updateTime) {
                            medias = medias.concat(mediaCollection);
                            $.log(mediaCollection);
                        } else return;
                    }
                });

                $.log(`All medias: ${medias}`)

                // push notifications
                for (let i = 0; i < Math.min(medias.length, maxMedias); i++) {
                    $.notify(`[Telegram] ${channelName}`, "", "", {
                        "media-url": medias[i],
                        "open-url": medias[i]
                    });
                    $.log(`MEDIA: ${medias[i]}`);
                }

                // update timestamp
                updated[channel] = new Date().getTime();
                $.write(JSON.stringify(updated), "updated");
            })
            .catch((error) => {
                $.notify("[Telegram]", "", `❌ 未找到频道: ${channel}`);
                $.error(error);
            });
    })
)
    .catch((err) => $.error(err))
    .finally(() => $.done());


// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,i="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!i,isJSBox:i,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:i,isScriptable:n,isNode:o}=ENV(),r=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(l=>u[l.toLowerCase()]=(u=>(function(u,l){l="string"==typeof l?{url:l}:l;const h=e.baseURL;h&&!r.test(l.url||"")&&(l.url=h?h+l.url:l.url);const a=(l={...e,...l}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...l.events};let f,d;if(c.onRequest(u,l),t)f=$task.fetch({method:u,...l});else if(s||i||o)f=new Promise((e,t)=>{(o?require("request"):$httpClient)[u.toLowerCase()](l,(s,i,n)=>{s?t(s):e({statusCode:i.status||i.statusCode,headers:i.headers,body:n})})});else if(n){const e=new Request(l.url);e.method=u,e.headers=l.headers,e.body=l.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const p=a?new Promise((e,t)=>{d=setTimeout(()=>(c.onTimeout(),t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)),a)}):null;return(p?Promise.race([p,f]).then(e=>(clearTimeout(d),e)):f).then(e=>c.onResponse(e))})(l,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:i,isSurge:n,isNode:o,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(o){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(i||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),o){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(i||n)&&$persistentStore.write(e,this.name),o&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||i)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);o&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||i?$persistentStore.read(e):s?$prefs.valueForKey(e):o?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||i)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);o&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",l="",h={}){const a=h["open-url"],c=h["media-url"];if(s&&$notify(e,t,l,h),n&&$notification.post(e,t,l+`${c?"\n多媒体:"+c:""}`,{url:a}),i){let s={};a&&(s.openUrl=a),c&&(s.mediaUrl=c),"{}"===JSON.stringify(s)?$notification.post(e,t,l):$notification.post(e,t,l,s)}if(o||u){const s=l+(a?`\n点击跳转: ${a}`:"")+(c?`\n多媒体: ${c}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||i||n?$done(e):o&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
/*****************************************************************************/


